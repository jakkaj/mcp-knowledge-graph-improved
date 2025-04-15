import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Entity, Relation, KnowledgeGraph } from '../types/knowledge-graph.js';

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

  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

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