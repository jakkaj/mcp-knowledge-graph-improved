// Type definitions for the knowledge graph

export interface Entity {
    name: string;
    entityType: string;
    observations: string[];
    createdAt: string;
    version: number;
}

export interface Relation {
    from: string;
    to: string;
    relationType: string;
    createdAt: string;
    version: number;
}

export interface KnowledgeGraph {
    entities: Entity[];
    relations: Relation[];
}
