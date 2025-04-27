# Memory MCP Server Interaction Rules

When interacting with the `memory` MCP server for knowledge graph operations, adhere to the following:

- **Purpose:** The `memory` server manages the project's knowledge graph, storing entities and their relationships.
- **Tool Usage:** Use the `use_mcp_tool` tool with `server_name: memory`.
- **Available Tools:** Familiarize yourself with the available tools like `create_entities`, `create_relations`, `add_observations`, `delete_entities`, `delete_observations`, `delete_relations`, `read_graph`, `search_nodes`, `open_nodes`, `update_entities`, `update_relations`. Refer to the MCP server details provided in the initial context for specific input schemas.
- **Entity Naming:** Use clear and consistent names for entities.
- **Relation Types:** Define meaningful relation types, typically using active voice verbs (e.g., "IMPLEMENTS", "USES", "DEFINES").
- **Observations:** Add concise and relevant observations to entities to capture key details.
- **Atomicity:** Prefer making multiple related changes (e.g., creating an entity and its relations) within a single `use_mcp_tool` call if the tool schema allows (like `create_entities` and `create_relations` accepting arrays), but break down complex updates into logical steps if necessary. Wait for confirmation after each step.
- **Searching:** Use `search_nodes` to find existing entities before creating duplicates.
- **Updates:** Use `update_entities` or `add_observations` to modify existing entities rather than deleting and recreating them unless necessary.