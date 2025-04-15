import { KnowledgeGraphManager } from '../graph/index.js';
import { Entity, Relation } from '../types/index.js';
import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import { describe, it, beforeEach, afterEach } from 'mocha';

describe('KnowledgeGraphManager', () => {
  const testMemoryPath = path.join(process.cwd(), 'test-memory.jsonl');
  let manager: KnowledgeGraphManager;

  beforeEach(async () => {
    await fs.writeFile(testMemoryPath, '');
    manager = new KnowledgeGraphManager(testMemoryPath);
  });

  afterEach(async () => {
    try { await fs.unlink(testMemoryPath); } catch {}
  });

  it('should create and read entities', async () => {
    const entities: Entity[] = [
      { name: 'A', entityType: 'Type1', observations: [], createdAt: '', version: 1 },
      { name: 'B', entityType: 'Type2', observations: [], createdAt: '', version: 1 }
    ];
    await manager.createEntities(entities);
    const graph = await manager.readGraph();
    assert.strictEqual(graph.entities.length, 2);
    assert.strictEqual(graph.entities[0].name, 'A');
    assert.strictEqual(graph.entities[1].name, 'B');
  });

  it('should create and read relations', async () => {
    const entities: Entity[] = [
      { name: 'A', entityType: 'Type1', observations: [], createdAt: '', version: 1 },
      { name: 'B', entityType: 'Type2', observations: [], createdAt: '', version: 1 }
    ];
    await manager.createEntities(entities);
    const relations: Relation[] = [
      { from: 'A', to: 'B', relationType: 'knows', createdAt: '', version: 1 }
    ];
    await manager.createRelations(relations);
    const graph = await manager.readGraph();
    assert.strictEqual(graph.relations.length, 1);
    assert.strictEqual(graph.relations[0].from, 'A');
    assert.strictEqual(graph.relations[0].to, 'B');
  });

  it('should add and delete observations', async () => {
    const entities: Entity[] = [
      { name: 'A', entityType: 'Type1', observations: [], createdAt: '', version: 1 }
    ];
    await manager.createEntities(entities);
    await manager.addObservations([{ entityName: 'A', contents: ['obs1', 'obs2'] }]);
    let graph = await manager.readGraph();
    assert.deepStrictEqual(graph.entities[0].observations, ['obs1', 'obs2']);
    await manager.deleteObservations([{ entityName: 'A', observations: ['obs1'] }]);
    graph = await manager.readGraph();
    assert.deepStrictEqual(graph.entities[0].observations, ['obs2']);
  });

  it('should delete entities and relations', async () => {
    const entities: Entity[] = [
      { name: 'A', entityType: 'Type1', observations: [], createdAt: '', version: 1 },
      { name: 'B', entityType: 'Type2', observations: [], createdAt: '', version: 1 }
    ];
    await manager.createEntities(entities);
    const relations: Relation[] = [
      { from: 'A', to: 'B', relationType: 'knows', createdAt: '', version: 1 }
    ];
    await manager.createRelations(relations);
    await manager.deleteEntities(['A']);
    const graph = await manager.readGraph();
    assert.strictEqual(graph.entities.length, 1);
    assert.strictEqual(graph.entities[0].name, 'B');
    assert.strictEqual(graph.relations.length, 0);
  });
});
