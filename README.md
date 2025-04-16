# Knowledge Graph Memory Server and Project Planning

Knowledge Graph MCP is tailored for software engineering workflows within tools like Cline and Roo that support MCP Servers. 

> This is a fork of the original [Memory Server](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)


## Why?

When working with LLM coding agents you might notice a few different things. 

- It can be hard to get what you want -> you need need a solid plan (see below)
- Their contexts are short, and even when tehy are not (looking at you Cline and Roo), they tend to get less accurate with long contexts -> you need to be able to finish a phase, clear the chat and start the next phase with a fresh and empty context window




## Knowlege Graph Core Concepts

### Entities

Entities are the primary nodes in the knowledge graph. Each entity has:

- A unique name (identifier)
- An entity type (e.g., "person", "organization", "event")
- A list of observations
- Creation date and version tracking

The version tracking feature helps maintain a historical context of how knowledge evolves over time.

Example:

```json
{
  "name": "LoggingSystem",
  "entityType": "Architecture",
  "observations": ["Core components include LogLevel enum, LogEntry model, LogOutput interface, LogFilter interface, and LoggerService"]
}
```

### Relations

Relations define directed connections between entities. They are always stored in active voice and describe how entities interact or relate to each other. Each relation includes:

- Source and target entities
- Relationship type
- Creation date and version information

This versioning system helps track how relationships between entities evolve over time.

Example:

```json
{
  "from": "LoggingSystem",
  "to": "LoggerService",
  "relationType": "contains"
}
```

### Observations

Observations are discrete pieces of information about an entity. They are:

- Stored as strings
- Attached to specific entities
- Can be added or removed independently
- Should be atomic (one fact per observation)

Example:

```json
{
  "entityName": "FreezedUsagePatterns",
  "observations": [
    "Freezed 3.x uses sealed classes for unions instead of the older @freezed annotation pattern",
    "Model classes use private constructors with factory methods for custom functionality",
    "Non-const factories required in Freezed 3.x",
    "json_serializable integration for JSON serialization/deserialization"
  ]
}
```

## API

### Tools

- **create_entities**
  - Create multiple new entities in the knowledge graph
  - Input: `entities` (array of objects)
    - Each object contains:
      - `name` (string): Entity identifier
      - `entityType` (string): Type classification
      - `observations` (string[]): Associated observations
  - Ignores entities with existing names

<!-- Insert clarification about alwaysAllow in the config explanation section, not here. No change needed in the API tool list. -->
## Usage with Cursor, Cline or Claude Desktop

> **Note:** The Docker image must be built locally as described in the "Running with Docker" section below. The `-v` argument should point to a directory on your host where you want to persist memory (e.g., your project's `.roo` directory).

### Setup

> **Note:** Before setting up the configuration, you'll need to first [build the Docker image](#build-the-docker-image) as described in the "Running with Docker" section.

Add this to your `mcp.json` or `claude_desktop_config.json` to use the Docker-based server:

```json
{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-v",
        "/absolute/path/to/.roo:/data",
        "mcp-knowledge-graph",
        "node",
        "dist/index.js",
        "--server",
        "--memory-path",
        "/data/memory.jsonl"
      ],
      "alwaysAllow": [
        "create_entities",
        "create_relations",
        "add_observations",
        "delete_entities",
        "delete_observations",
        "delete_relations",
        "read_graph",
        "search_nodes",
        "open_nodes",
        "update_entities",
        "update_relations"
      ],
      "disabled": false
    }
  }
}
```

#### Field Explanations

- **mcpServers**: Top-level object mapping server names to configurations.
- **memory**: The name used to reference this server in Roo/Cline.
- **command**: The executable to launch the server (`docker` in this case).
- **args**: Arguments to pass to the command. This example runs the Docker container, mounts the `.roo` directory, and starts the server with a persistent memory file.
- **alwaysAllow**: *(Optional)* List of tool names that Roo/Cline can always invoke on this server.
  This field can also be set in your Roo or Cline client configuration instead of in the server config, depending on your workflow and security preferences.
- **disabled**: Set to `false` to enable the server.



### Custom Memory Path

To specify a custom path for the memory file when using Docker, set the `--memory-path` argument in your configuration. For example:

```json
{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-v",
        "/absolute/path/to/.roo:/data",
        "mcp-knowledge-graph",
        "node",
        "dist/index.js",
        "--server",
        "--memory-path",
        "/data/custom-memory.jsonl"
      ],
      "alwaysAllow": [
        "create_entities",
        "create_relations",
        "add_observations",
        "delete_entities",
        "delete_observations",
        "delete_relations",
        "read_graph",
        "search_nodes",
        "open_nodes",
        "update_entities",
        "update_relations"
      ],
      "disabled": false
    }
  }
}
```

- The `--memory-path` argument specifies the location of the memory file inside the container (e.g., `/data/custom-memory.jsonl`).
- The `-v` argument mounts your host directory (e.g., `.roo`) to `/data` in the container, ensuring persistence.

If no path is specified, it will default to `memory.jsonl` in the server's installation directory inside the container.

---

### Running with Docker

You can run the Knowledge Graph Memory Server in a Docker container for easy deployment and isolation.

#### Build the Docker Image

```bash
docker build -t mcp-knowledge-graph .
```

or

```sh
make docker-build
```

#### Run the Server

To run the server and persist memory to a local file, mount a directory from your host into the container. For example, to store memory in `.roo/memory.jsonl`:

```bash
docker run -i --rm --init \
  -v $(pwd)/.roo:/data \
  mcp-knowledge-graph \
  node dist/index.js --server --memory-path /data/memory.jsonl
```

- `-v $(pwd)/.roo:/data` mounts your local `.roo` directory to `/data` in the container.
- `--memory-path /data/memory.jsonl` tells the server to use the mounted file for persistent memory.

You can adjust the mount path and memory file location as needed.

---

### Using with Roo and Cline (.roo/mcp.json)

To use this MCP server with [Roo](https://github.com/modelcontextprotocol/roo) or [Cline](https://github.com/modelcontextprotocol/cline), configure your `.roo/mcp.json` file to point to the Dockerized server.

#### Example `.roo/mcp.json`

```json
{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--init",
        "-v",
        "/absolute/path/to/.roo:/data",
        "mcp-knowledge-graph",
        "node",
        "dist/index.js",
        "--server",
        "--memory-path",
        "/data/memory.jsonl"
      ],
      "alwaysAllow": [
        "create_entities",
        "create_relations",
        "add_observations",
        "delete_entities",
        "delete_observations",
        "delete_relations",
        "read_graph",
        "search_nodes",
        "open_nodes",
        "update_entities",
        "update_relations"
      ],
      "disabled": false
    }
  }
}
```

#### Field Explanations

- **mcpServers**: Top-level object mapping server names to configurations.
- **memory**: The name used to reference this server in Roo/Cline.
- **command**: The executable to launch the server (`docker` in this case).
- **args**: Arguments to pass to the command. This example runs the Docker container, mounts the `.roo` directory, and starts the server with a persistent memory file.
- **alwaysAllow**: List of tool names that Roo/Cline can always invoke on this server.
- **disabled**: Set to `false` to enable the server.

#### Usage

- Place this file at `.roo/mcp.json` in your project or home directory.
- Make sure the volume mount path in `args` matches your local setup.
- When you use Roo or Cline, they will automatically start the MCP server in Docker and connect to it.
- You can add multiple servers under `mcpServers` if needed.



### Example Developer Workflow Prompt

The prompt for utilizing memory depends on your use case. Below is a comprehensive example of using the knowledge graph memory server in a software development context, which you can add to your `.clinerules` file or custom instructions for AI tools like Roo, Cline, or Claude.

This example workflow demonstrates how to structure and organize a development process that leverages the knowledge graph for maintaining contextual awareness across a project.

> **Note:** This is just one possible workflow approach. You can adapt these guidelines to fit your team's specific needs and development practices.

```
## Plan Structure Guidelines
- When creating a plan, organize it into numbered phases (e.g., "Phase 1: Setup Dependencies")
- Break down each phase into specific tasks with numeric identifiers (e.g., "Task 1.1: Add Dependencies")
- Please only create one document per plan. 
- Include a detailed checklist at the end of the document that maps to all phases and tasks
- Mark tasks as `- [ ]` for pending tasks and `- [x]` for completed tasks
- Start all planning tasks as unchecked, and update them to checked as implementation proceeds
- Each planning task should have clear success criteria
- End the plan with success criteria that define when the implementation is complete
- plans and architectures that you produce should go under docs/plans/<new folder for this plan>

## Following Plans
- When coding you need to follow the plan phases and check off the tasks as they are completed.  
- As you complete a task, update the plan and mark that task complete before you being the next task. 
- Tasks that involved tests should not be marked complete until the tests pass. 

## Memory Knowledge Graph Workflow (REQUIRED)

Detailed plan available at: `docs/plans/memory_usage/improved_memory_usage.md`

### MANDATORY RETRIEVAL WORKFLOW:
1. At the START of every task: SEARCH memory for related concepts
   - Use specific terms related to your task (e.g., "search_nodes({"query": "logging"})")
   - Include in your thinking: "Memory shows: [key findings]"
2. Before EACH implementation step: VERIFY current understanding
   - Check if memory contains relevant information for your current subtask
3. Before answering questions: CHECK memory FIRST
   - Always prioritize memory over other research methods

### MANDATORY UPDATE WORKFLOW:
1. After LEARNING about codebase structure
2. After IMPLEMENTING new features or modifications
3. After DISCOVERING inconsistencies between memory and code
4. After USER shares new information about project patterns

### UPDATE ACTIONS:
- CREATE/UPDATE entities for components/concepts
- ADD atomic, factual observations (15 words max)
- DELETE outdated observations when information changes
- CONNECT related entities with descriptive relation types
- CONFIRM in your thinking: "Memory updated: [summary]"

### MEMORY QUALITY RULES:
- Entities = Components, Features, Patterns, Practices (with specific types)
- Observations = Single, specific facts about implementation details
- Relations = Use descriptive types (contains, uses, implements)
- AVOID duplicates by searching before creating new entries
- MAINTAIN high-quality, factual knowledge

## File Change Tracking (REQUIRED)

Detailed plan available at: `docs/plans/memory_usage/file_change_tracking.md`

### MANDATORY FILE CHANGE TRACKING WORKFLOW:
1. Before modifying a file: SEARCH memory for the file by name
2. After implementing substantive changes:
   - If file doesn't exist in memory, CREATE a SourceFile entity
   - CREATE a FileChange entity with descriptive name and observations
   - LINK the FileChange to the SourceFile with bidirectional relations
   - If working on a plan, LINK the FileChange to the Plan entity
3. When creating a plan: ADD it to memory graph as a Plan entity
4. When completing a plan: UPDATE its status in memory

### FILE CHANGE TRACKING GUIDELINES:
- Track only SUBSTANTIVE changes (features, architecture, bug fixes)
- Skip trivial changes (formatting, comments, minor refactoring)
- Use descriptive entity names indicating the nature of changes
- Always link changes to their relevant plans when applicable
- Keep file paths accurate and use present tense for descriptions
- Update SourceFile entities when understanding of file purpose changes
```

### Understanding the Developer Workflow

This comprehensive developer workflow integrates several key practices into a cohesive system:

1. **Plan Structure Guidelines** establish a consistent approach to creating development plans with clear phases, tasks, and success criteria. This structured approach ensures:
   - Consistent organization across all project plans
   - Clear tracking of progress through checklists
   - Proper documentation of implementation requirements
   - Centralized storage in the docs/plans directory

2. **Following Plans** enforces discipline in the development process by:
   - Requiring developers to follow the established sequence
   - Ensuring tasks are properly completed before moving forward
   - Verifying quality through test completion requirements
   - Maintaining an accurate record of implementation progress

3. **Memory Knowledge Graph Workflow** ensures the knowledge graph becomes a comprehensive representation of the codebase by establishing:
   - A retrieval process that makes developers consult existing knowledge first
   - Specific triggers for when the knowledge graph must be updated
   - Quality standards for entities, observations, and relations
   - Consistent patterns for knowledge representation
   - Verification steps before implementation to ensure accuracy

4. **File Change Tracking** creates a historical record of significant code changes by:
   - Documenting substantive modifications with proper context
   - Linking changes to source files and plans
   - Focusing on meaningful changes rather than trivial edits
   - Maintaining accurate path information and descriptive names
   - Creating a traceable history of implementation decisions

Together, these elements form a structured approach to development that preserves context, enforces good practices, and creates a knowledge base that grows with the project. The memory graph becomes a living documentation system that captures not just what was changed, but why changes were made and how they relate to the overall project architecture.

This approach is particularly valuable for:
- Onboarding new team members who need to understand project history
- Maintaining context across complex, long-running projects
- Ensuring consistent implementation of architectural decisions
- Creating an auditable trail of development decisions
- Enabling AI assistants to provide more contextually relevant help

By integrating planning, knowledge management, and change tracking, teams can maintain a consistent understanding of their codebase's evolution and make more informed decisions throughout the development lifecycle.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
