import { KnowledgeGraphManager } from '../graph/index.js';
import { Entity, Relation } from '../types/index.js';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { describe, it, beforeEach, afterEach } from 'mocha';

describe('KnowledgeGraphManager Search', () => {
    const testMemoryPath = path.join(process.cwd(), 'test-search-memory.jsonl');
    let manager: KnowledgeGraphManager;

    // Sample entities and relations for search tests
    const sampleEntities: Entity[] = [
        {
            name: 'modern_conversion_result_widget.dart',
            entityType: 'File',
            observations: ['Widget for displaying conversion results'],
            createdAt: '',
            version: 1
        },
        {
            name: 'legacy_widget.dart',
            entityType: 'File',
            observations: ['Legacy widget'],
            createdAt: '',
            version: 1
        },
        {
            name: 'Plan',
            entityType: 'Document',
            observations: ['Project plan document'],
            createdAt: '',
            version: 1
        }
    ];

    const sampleRelations: Relation[] = [
        {
            from: 'Plan',
            to: 'modern_conversion_result_widget.dart',
            relationType: 'references',
            createdAt: '',
            version: 1
        },
        {
            from: 'legacy_widget.dart',
            to: 'modern_conversion_result_widget.dart',
            relationType: 'related_to',
            createdAt: '',
            version: 1
        }
    ];

    beforeEach(async () => {
        await fs.writeFile(testMemoryPath, '');
        manager = new KnowledgeGraphManager(testMemoryPath);
        await manager.createEntities(sampleEntities);
        await manager.createRelations(sampleRelations);
    });

    afterEach(async () => {
        try { await fs.unlink(testMemoryPath); } catch { }
    });

    it('should set up test fixtures with sample entities and relations', async () => {
        const graph = await manager.readGraph();
        assert.strictEqual(graph.entities.length, 3, 'Should have 3 entities');
        assert.strictEqual(graph.relations.length, 2, 'Should have 2 relations');
        assert(graph.entities.some(e => e.name === 'modern_conversion_result_widget.dart'), 'Entity modern_conversion_result_widget.dart should exist');
        assert(graph.relations.some(r => r.from === 'Plan' && r.to === 'modern_conversion_result_widget.dart'), 'Relation from Plan to modern_conversion_result_widget.dart should exist');
    });

    // --- Core Search Test Cases ---

    it('should match entity by exact name', async () => {
        const result = await manager.searchNodes('modern_conversion_result_widget.dart');
        assert.strictEqual(result.entities.length, 1, 'Should find exactly one entity');
        assert.strictEqual(result.entities[0].name, 'modern_conversion_result_widget.dart');
    });

    it('should match entity name within a longer query (expected to fail until improved)', async () => {
        const result = await manager.searchNodes('Plan modern_conversion_result_widget.dart');
        // This should find the entity after improvement
        assert(result.entities.some(e => e.name === 'modern_conversion_result_widget.dart'), 'Should find modern_conversion_result_widget.dart in fuzzy query');
    });

    it('should match entity name at different positions in the query (expected to fail until improved)', async () => {
        const queries = [
            'modern_conversion_result_widget.dart is important',
            'File modern_conversion_result_widget.dart',
            'The widget modern_conversion_result_widget.dart is used'
        ];
        for (const query of queries) {
            const result = await manager.searchNodes(query);
            assert(result.entities.some(e => e.name === 'modern_conversion_result_widget.dart'), `Should find modern_conversion_result_widget.dart in query: "${query}"`);
        }
    });

    it('should match entity name case-insensitively', async () => {
        const result = await manager.searchNodes('MODERN_CONVERSION_RESULT_WIDGET.DART');
        assert(result.entities.some(e => e.name === 'modern_conversion_result_widget.dart'), 'Should match regardless of case');
    });

    it('should match by entity type', async () => {
        const result = await manager.searchNodes('Document');
        assert(result.entities.some(e => e.entityType === 'Document'), 'Should find entity with type Document');
    });

    // --- Relation Test Cases ---

    it('should return relations connected to matched entity', async () => {
        const result = await manager.searchNodes('modern_conversion_result_widget.dart');
        // Both relations should be returned since both connect to the matched entity
        assert.strictEqual(result.relations.length, 2, 'Should return both relations connected to modern_conversion_result_widget.dart');
        assert(result.relations.some(r => r.from === 'Plan' && r.to === 'modern_conversion_result_widget.dart'), 'Should include Plan -> modern_conversion_result_widget.dart');
        assert(result.relations.some(r => r.from === 'legacy_widget.dart' && r.to === 'modern_conversion_result_widget.dart'), 'Should include legacy_widget.dart -> modern_conversion_result_widget.dart');
    });

    it('should return relations for both incoming and outgoing connections (expected to fail until improved)', async () => {
        // Add a new entity and a relation from modern_conversion_result_widget.dart to Plan
        const newEntity: Entity = {
            name: 'ExtraDoc',
            entityType: 'Document',
            observations: [],
            createdAt: '',
            version: 1
        };
        const newRelation: Relation = {
            from: 'modern_conversion_result_widget.dart',
            to: 'Plan',
            relationType: 'documents',
            createdAt: '',
            version: 1
        };
        await manager.createEntities([newEntity]);
        await manager.createRelations([newRelation]);

        const result = await manager.searchNodes('modern_conversion_result_widget.dart');
        // Should include the outgoing relation as well
        assert(result.relations.some(r => r.from === 'modern_conversion_result_widget.dart' && r.to === 'Plan'), 'Should include modern_conversion_result_widget.dart -> Plan');
    });

    it('should return all relations shared by multiple matched entities (expected to fail until improved)', async () => {
        // Query that matches both Plan and modern_conversion_result_widget.dart
        const result = await manager.searchNodes('Plan modern_conversion_result_widget.dart');
        // Should include the relation between Plan and modern_conversion_result_widget.dart
        assert(result.relations.some(r => (r.from === 'Plan' && r.to === 'modern_conversion_result_widget.dart') || (r.from === 'modern_conversion_result_widget.dart' && r.to === 'Plan')), 'Should include relation between Plan and modern_conversion_result_widget.dart');
    });
});