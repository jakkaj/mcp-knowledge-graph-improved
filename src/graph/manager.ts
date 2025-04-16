import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Entity, Relation, KnowledgeGraph } from '../types/knowledge-graph.js';

// For debug logging
const debugLog = (message: string) => {
    fsSync.appendFileSync('/tmp/mcp-debug.log', message + '\n');
};

// Configuration for file paths
let MEMORY_FILE_PATH: string;

export const configureMemoryPath = (customPath?: string): string => {
    if (customPath) {
        return path.isAbsolute(customPath)
            ? customPath
            : path.resolve(process.cwd(), customPath);
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(path.dirname(path.dirname(__dirname)), 'memory.jsonl');
};

// Initialize with default path
MEMORY_FILE_PATH = configureMemoryPath();

export class KnowledgeGraphManager {
    constructor(memoryPath?: string) {
        if (memoryPath) {
            MEMORY_FILE_PATH = configureMemoryPath(memoryPath);
        }
    }

    /**
     * Returns all relations where either endpoint is in the provided entityNames set.
     */
    private getConnectedRelations(entityNames: Set<string>, relations: Relation[]): Relation[] {
        debugLog(`[DEBUG] getConnectedRelations called with ${entityNames.size} entity names and ${relations.length} relations`);

        // Check for specific entity we're debugging
        if (entityNames.has('modern_conversion_result_widget.dart')) {
            debugLog(`[DEBUG] Looking for relations involving 'modern_conversion_result_widget.dart'`);
            const relevantRelations = relations.filter(r =>
                r.from === 'modern_conversion_result_widget.dart' || r.to === 'modern_conversion_result_widget.dart'
            );
            debugLog(`[DEBUG] Found ${relevantRelations.length} relations directly involving 'modern_conversion_result_widget.dart':`);
            relevantRelations.forEach(r => debugLog(`  - ${r.from} -> ${r.to} (${r.relationType})`));
        }

        return relations.filter(r =>
            entityNames.has(r.from) || entityNames.has(r.to)
        );
    }

    private async loadGraph(): Promise<KnowledgeGraph> {
        try {
            const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
            const lines = data.split("\n").filter(line => line.trim() !== "");
            return lines.reduce((graph: KnowledgeGraph, line) => {
                const item = JSON.parse(line);
                if (item.type === "entity") graph.entities.push(item as Entity);
                if (item.type === "relation") graph.relations.push(item as Relation);
                return graph;
            }, { entities: [], relations: [] });
        } catch (error) {
            if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
                return { entities: [], relations: [] };
            }
            throw error;
        }
    }

    private async saveGraph(graph: KnowledgeGraph): Promise<void> {
        const lines = [
            ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
            ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
        ];
        await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
    }

    async createEntities(entities: Entity[]): Promise<Entity[]> {
        const graph = await this.loadGraph();
        const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name))
            .map(e => ({
                ...e,
                createdAt: new Date().toISOString(),
                version: e.version || 1
            }));
        graph.entities.push(...newEntities);
        await this.saveGraph(graph);
        return newEntities;
    }

    async createRelations(relations: Relation[]): Promise<Relation[]> {
        const graph = await this.loadGraph();
        const newRelations = relations.filter(r => !graph.relations.some(existingRelation =>
            existingRelation.from === r.from &&
            existingRelation.to === r.to &&
            existingRelation.relationType === r.relationType
        )).map(r => ({
            ...r,
            createdAt: new Date().toISOString(),
            version: r.version || 1
        }));
        graph.relations.push(...newRelations);
        await this.saveGraph(graph);
        return newRelations;
    }

    async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<{ entityName: string; addedObservations: string[] }[]> {
        const graph = await this.loadGraph();
        const results = observations.map(o => {
            const entity = graph.entities.find(e => e.name === o.entityName);
            if (!entity) {
                throw new Error(`Entity with name ${o.entityName} not found`);
            }
            const newObservations = o.contents.filter(content => !entity.observations.includes(content));
            entity.observations.push(...newObservations);
            return { entityName: o.entityName, addedObservations: newObservations };
        });
        await this.saveGraph(graph);
        return results;
    }

    async deleteEntities(entityNames: string[]): Promise<void> {
        const graph = await this.loadGraph();
        graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
        graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
        await this.saveGraph(graph);
    }

    async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
        const graph = await this.loadGraph();
        deletions.forEach(d => {
            const entity = graph.entities.find(e => e.name === d.entityName);
            if (entity) {
                entity.observations = entity.observations.filter(o => !d.observations.includes(o));
            }
        });
        await this.saveGraph(graph);
    }

    async deleteRelations(relations: Relation[]): Promise<void> {
        const graph = await this.loadGraph();
        graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
            r.from === delRelation.from &&
            r.to === delRelation.to &&
            r.relationType === delRelation.relationType
        ));
        await this.saveGraph(graph);
    }

    async readGraph(): Promise<KnowledgeGraph> {
        return this.loadGraph();
    }

    /**
     * Searches the knowledge graph for entities and their relations based on a query string.
     *
     * The search algorithm implements "fuzzy but smart" matching with the following features:
     * - Tokenizes the query into words and matches against entity names, types, and observations
     * - Prioritizes exact token matches on entity names
     * - Finds entities when their names appear within longer search queries
     * - Handles case insensitivity and special characters
     * - Returns all relations connected to matched entities (both incoming and outgoing)
     * - Implements performance optimizations for large datasets
     *
     * Ranking priority (highest to lowest):
     * 1. Exact token match on entity name
     * 2. Entity name appears as a token in the query
     * 3. Token appears in entity name (higher score for tokens at the beginning)
     * 4. Substring match on entity name
     * 5. Match on entity type
     * 6. Match on observations
     * 7. Original substring match (for backward compatibility)
     *
     * Edge cases handled:
     * - Empty queries return empty results
     * - Short tokens (< 3 chars) require higher match confidence
     * - Special characters are removed from tokens
     * - No matches found returns empty results
     *
     * @param query - The search query string
     * @returns A KnowledgeGraph containing matched entities and their relations
     */
    async searchNodes(query: string): Promise<KnowledgeGraph> {
        debugLog(`\n[DEBUG] searchNodes called with query: "${query}"`);
        const graph = await this.loadGraph();
        debugLog(`[DEBUG] Total entities in graph: ${graph.entities.length}, Total relations: ${graph.relations.length}`);

        // Handle empty query case - return empty result
        if (!query || query.trim() === '') {
            return { entities: [], relations: [] };
        }

        // Normalize and tokenize the query
        const normalizedQuery = query.trim().toLowerCase();

        // Tokenize the query into lowercase words, removing special characters
        const tokens = normalizedQuery
            .split(/\s+/)
            .map(token => token.replace(/[^\w\d_.-]/g, '')) // Keep alphanumeric, underscore, period, hyphen
            .filter(token => token.length > 0);

        // Performance optimization: For large datasets, consider using an early termination strategy
        // Score entities based on match type and position
        const scoredEntities = graph.entities.map(e => {
            const nameLower = e.name.toLowerCase();
            const typeLower = e.entityType.toLowerCase();
            const obsLower = e.observations.map(o => o.toLowerCase());

            let score = 0;
            let matchDetails = [];

            // Ranking priority (highest to lowest):
            // 1. Exact token match on entity name (highest)
            // 2. Entity name appears as a token in the query
            // 3. Token appears in entity name
            // 4. Substring match on entity name
            // 5. Match on entity type
            // 6. Match on observations
            // 7. Original substring match (lowest, for backward compatibility)

            // 1. Exact token match on entity name (highest priority)
            if (tokens.some(token => token === nameLower)) {
                score += 100;
                matchDetails.push('exact_name_match');
            }

            // 2. Entity name appears as a token in the query
            // This handles cases like "Plan modern_conversion_result_widget.dart"
            if (query.toLowerCase().split(/\s+/).includes(nameLower)) {
                score += 90;
                matchDetails.push('name_as_token_in_query');
            }

            // 3. Token appears in entity name
            for (const token of tokens) {
                if (token.length >= 3 && nameLower.includes(token)) {
                    // Higher score for tokens at the beginning of the name
                    if (nameLower.startsWith(token)) {
                        score += 70;
                        matchDetails.push('token_at_start_of_name');
                    } else {
                        score += 50;
                        matchDetails.push('token_in_name');
                    }
                }
            }

            // 4. Substring match on entity name
            if (tokens.some(token => nameLower.includes(token))) {
                score += 40;
                matchDetails.push('substring_in_name');
            }

            // 5. Match on entity type
            if (tokens.some(token => typeLower.includes(token))) {
                score += 20;
                matchDetails.push('match_on_type');
            }

            // 6. Match on observations
            if (tokens.some(token => obsLower.some(obs => obs.includes(token)))) {
                score += 10;
                matchDetails.push('match_in_observations');
            }

            // 7. Fallback: original substring match for backward compatibility
            if (
                e.name.toLowerCase().includes(query.toLowerCase()) ||
                e.entityType.toLowerCase().includes(query.toLowerCase()) ||
                e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
            ) {
                score += 1;
                matchDetails.push('legacy_substring_match');
            }

            return {
                entity: e,
                score,
                matchDetails
            };
        });

        // Handle very short tokens differently (less than 3 chars)
        // For short tokens, we require a higher match threshold
        const hasShortTokens = tokens.some(token => token.length < 3);

        // Performance optimization: Early termination for high-confidence matches
        // If we have exact matches with very high scores, we can limit results
        // This significantly improves performance with large datasets
        const highConfidenceMatches = scoredEntities
            .filter(se => se.score >= 90) // Only exact or near-exact matches
            .sort((a, b) => b.score - a.score);

        // If we have high-confidence matches, limit to those for better performance
        // Otherwise, use normal scoring and filtering
        const filteredScoredEntities = highConfidenceMatches.length >= 2
            ? highConfidenceMatches.slice(0, 5) // Limit to top 5 high-confidence matches
            : scoredEntities.filter(se => {
                // For queries with short tokens, require a higher score threshold
                // to avoid too many false positives
                if (hasShortTokens) {
                    return se.score >= 20; // Higher threshold for short tokens
                }
                return se.score > 0;
            })
                .sort((a, b) => b.score - a.score);

        // Extract just the entities from the scored results
        const filteredEntities = filteredScoredEntities.map(se => se.entity);
        debugLog(`[DEBUG] Matched entities (${filteredEntities.length}):`);
        filteredEntities.forEach(e => debugLog(`  - ${e.name} (${e.entityType})`));

        // Handle no matches found
        if (filteredEntities.length === 0) {
            debugLog(`[DEBUG] No entities matched the query`);
            return { entities: [], relations: [] };
        }

        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));
        debugLog(`[DEBUG] Entity names used for relation filtering: ${Array.from(filteredEntityNames).join(', ')}`);

        // Include all relations where a matched entity is either source or target
        debugLog(`[DEBUG] Searching for relations connected to matched entities...`);
        debugLog(`[DEBUG] Sample of relations in graph (first 5):`);
        graph.relations.slice(0, 5).forEach(r => debugLog(`  - ${r.from} -> ${r.to} (${r.relationType})`));

        const filteredRelations = this.getConnectedRelations(filteredEntityNames, graph.relations);
        debugLog(`[DEBUG] Found ${filteredRelations.length} connected relations`);
        filteredRelations.forEach(r => debugLog(`  - ${r.from} -> ${r.to} (${r.relationType})`));

        return {
            entities: filteredEntities,
            relations: filteredRelations,
        };
    }

    async openNodes(names: string[]): Promise<KnowledgeGraph> {
        const graph = await this.loadGraph();

        const filteredEntities = graph.entities.filter(e => names.includes(e.name));
        const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

        const filteredRelations = graph.relations.filter(r =>
            filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
        );

        return {
            entities: filteredEntities,
            relations: filteredRelations,
        };
    }

    async updateEntities(entities: Entity[]): Promise<Entity[]> {
        const graph = await this.loadGraph();
        const updatedEntities = entities.map(updateEntity => {
            const existingEntity = graph.entities.find(e => e.name === updateEntity.name);
            if (!existingEntity) {
                throw new Error(`Entity with name ${updateEntity.name} not found`);
            }
            return {
                ...existingEntity,
                ...updateEntity,
                version: existingEntity.version + 1,
                createdAt: new Date().toISOString()
            };
        });

        updatedEntities.forEach(updatedEntity => {
            const index = graph.entities.findIndex(e => e.name === updatedEntity.name);
            if (index !== -1) {
                graph.entities[index] = updatedEntity;
            }
        });

        await this.saveGraph(graph);
        return updatedEntities;
    }

    async updateRelations(relations: Relation[]): Promise<Relation[]> {
        const graph = await this.loadGraph();
        const updatedRelations = relations.map(updateRelation => {
            const existingRelation = graph.relations.find(r =>
                r.from === updateRelation.from &&
                r.to === updateRelation.to &&
                r.relationType === updateRelation.relationType
            );
            if (!existingRelation) {
                throw new Error(`Relation not found`);
            }
            return {
                ...existingRelation,
                ...updateRelation,
                version: existingRelation.version + 1,
                createdAt: new Date().toISOString()
            };
        });

        updatedRelations.forEach(updatedRelation => {
            const index = graph.relations.findIndex(r =>
                r.from === updatedRelation.from &&
                r.to === updatedRelation.to &&
                r.relationType === updatedRelation.relationType
            );
            if (index !== -1) {
                graph.relations[index] = updatedRelation;
            }
        });

        await this.saveGraph(graph);
        return updatedRelations;
    }
}