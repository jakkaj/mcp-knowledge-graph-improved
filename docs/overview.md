# Technical Overview: Knowledge Graph Memory Server

## System Purpose

This server implements a persistent memory system using a local knowledge graph, designed to be used as a backend for Model Context Protocol (MCP) clients. It provides structured storage and retrieval of entities, relations, and observations, supporting versioning and atomic updates. The system is optimized for integration with tools like Claude, Cursor, and Cline.

---

## Core Data Structures

### Entity

- **Fields:**  
  - `name` (string): Unique identifier  
  - `entityType` (string): Type/classification  
  - `observations` (string[]): Atomic facts about the entity  
  - `createdAt` (string): ISO timestamp  
  - `version` (number): Version counter

### Relation

- **Fields:**  
  - `from` (string): Source entity name  
  - `to` (string): Target entity name  
  - `relationType` (string): Relationship type (active voice)  
  - `createdAt` (string): ISO timestamp  
  - `version` (number): Version counter

### KnowledgeGraph

- **Fields:**  
  - `entities` (Entity[]): All entities in the graph  
  - `relations` (Relation[]): All relations in the graph

---

## Storage Model

- All data is stored in a single JSONL file (default: `memory.jsonl`).
- Each line is a JSON object with a `type` field (`"entity"` or `"relation"`).
- The file is read in full and parsed into memory for each operation.
- All write operations overwrite the file with the new state (no append-only log).

---

## Main Components

### KnowledgeGraphManager

Handles all graph operations:
- **loadGraph()**: Reads and parses the JSONL file into a KnowledgeGraph object.
- **saveGraph(graph)**: Serializes the graph and writes it to disk.
- **createEntities(entities)**: Adds new entities (skips duplicates).
- **createRelations(relations)**: Adds new relations (skips duplicates).
- **addObservations(observations)**: Adds new observations to existing entities.
- **deleteEntities(entityNames)**: Removes entities and their relations.
- **deleteObservations(deletions)**: Removes specific observations from entities.
- **deleteRelations(relations)**: Removes specific relations.
- **readGraph()**: Returns the full graph.
- **searchNodes(query)**: Returns entities and relations matching a query (name, type, or observation).
- **openNodes(names)**: Returns specified entities and their relations.
- **updateEntities(entities)**: Updates existing entities, increments version.
- **updateRelations(relations)**: Updates existing relations, increments version.

### Server Initialization

- Uses the MCP SDK to expose tools over stdio.
- Registers all graph operations as MCP tools with JSON schema input validation.
- Handles requests for tool listing and tool invocation.

---

## Data Flow

1. **Request Handling:**  
   - Receives a tool call (e.g., `create_entities`) via stdio.
   - Parses and validates input.
   - Calls the corresponding KnowledgeGraphManager method.
   - Loads the graph from disk, performs the operation, saves the graph.
   - Returns the result or error.

2. **Persistence:**  
   - All changes are persisted to the JSONL file after each operation.
   - If the file does not exist, it is created on first write.

---

## Example: Entity Creation

1. Client calls `create_entities` with an array of entity objects.
2. Server loads the current graph from disk.
3. Filters out entities with duplicate names.
4. Adds new entities with timestamps and version numbers.
5. Saves the updated graph to disk.
6. Returns the list of created entities.

---

## Error Handling

- If the memory file does not exist, an empty graph is returned.
- Operations on non-existent entities/relations throw errors (except for deletions, which are silent if the target does not exist).
- All errors are propagated to the client as tool call errors.

---

## Extensibility

- The system is modular: new tools can be added by extending the KnowledgeGraphManager and registering new handlers.
- The storage path can be customized via CLI argument or environment variable.

---

## Diagram: Data Flow

```mermaid
sequenceDiagram
  participant Client
  participant Server
  participant FileSystem

  Client->>Server: Tool Call (e.g., create_entities)
  Server->>FileSystem: Read memory.jsonl
  Server->>Server: Update graph in memory
  Server->>FileSystem: Write memory.jsonl
  Server->>Client: Response