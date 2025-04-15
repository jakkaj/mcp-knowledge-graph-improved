# API and Tool Reference: Knowledge Graph Memory Server

This document describes the technical details of each tool (API operation) exposed by the server, based on the actual implementation in `index.ts`.

---

## Tool: create_entities

- **Purpose:** Add new entities to the knowledge graph.
- **Input Schema:**
  ```json
  {
    "entities": [
      {
        "name": "string",
        "entityType": "string",
        "observations": ["string"]
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.createEntities(entities)`.
  - Skips entities with duplicate names.
  - Adds `createdAt` (ISO timestamp) and `version` (default 1) to each new entity.
  - Persists the updated graph to disk.

---

## Tool: create_relations

- **Purpose:** Add new relations between entities.
- **Input Schema:**
  ```json
  {
    "relations": [
      {
        "from": "string",
        "to": "string",
        "relationType": "string"
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.createRelations(relations)`.
  - Skips duplicate relations (same from, to, relationType).
  - Adds `createdAt` and `version` to each new relation.

---

## Tool: add_observations

- **Purpose:** Add new observations to existing entities.
- **Input Schema:**
  ```json
  {
    "observations": [
      {
        "entityName": "string",
        "contents": ["string"]
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.addObservations(observations)`.
  - Throws error if entity does not exist.
  - Skips duplicate observations.

---

## Tool: delete_entities

- **Purpose:** Remove entities and their associated relations.
- **Input Schema:**
  ```json
  {
    "entityNames": ["string"]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.deleteEntities(entityNames)`.
  - Removes all relations where `from` or `to` matches any deleted entity.
  - Silent if entity does not exist.

---

## Tool: delete_observations

- **Purpose:** Remove specific observations from entities.
- **Input Schema:**
  ```json
  {
    "deletions": [
      {
        "entityName": "string",
        "observations": ["string"]
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.deleteObservations(deletions)`.
  - Silent if entity or observation does not exist.

---

## Tool: delete_relations

- **Purpose:** Remove specific relations from the graph.
- **Input Schema:**
  ```json
  {
    "relations": [
      {
        "from": "string",
        "to": "string",
        "relationType": "string"
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.deleteRelations(relations)`.
  - Silent if relation does not exist.

---

## Tool: read_graph

- **Purpose:** Retrieve the entire knowledge graph.
- **Input Schema:** `{}` (no input)
- **Implementation:**  
  - Calls `KnowledgeGraphManager.readGraph()`.
  - Returns all entities and relations.

---

## Tool: search_nodes

- **Purpose:** Search for entities and relations matching a query.
- **Input Schema:**
  ```json
  {
    "query": "string"
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.searchNodes(query)`.
  - Matches against entity name, type, and observation content (case-insensitive).
  - Returns matching entities and relations between them.

---

## Tool: open_nodes

- **Purpose:** Retrieve specific entities and their relations.
- **Input Schema:**
  ```json
  {
    "names": ["string"]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.openNodes(names)`.
  - Returns only the specified entities and relations between them.

---

## Tool: update_entities

- **Purpose:** Update existing entities.
- **Input Schema:**
  ```json
  {
    "entities": [
      {
        "name": "string",
        "entityType": "string",
        "observations": ["string"]
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.updateEntities(entities)`.
  - Throws error if entity does not exist.
  - Increments version and updates `createdAt`.

---

## Tool: update_relations

- **Purpose:** Update existing relations.
- **Input Schema:**
  ```json
  {
    "relations": [
      {
        "from": "string",
        "to": "string",
        "relationType": "string"
      }
    ]
  }
  ```
- **Implementation:**  
  - Calls `KnowledgeGraphManager.updateRelations(relations)`.
  - Throws error if relation does not exist.
  - Increments version and updates `createdAt`.

---

## Error Handling

- Most operations throw errors if the target entity or relation does not exist (except deletions, which are silent).
- All errors are returned as tool call errors to the client.

---

## Storage Format

- All entities and relations are stored as JSON objects in a single JSONL file.
- Each line is either:
  ```json
  { "type": "entity", ... }
  ```
  or
  ```json
  { "type": "relation", ... }
  ```
- The file is fully rewritten on each write operation.