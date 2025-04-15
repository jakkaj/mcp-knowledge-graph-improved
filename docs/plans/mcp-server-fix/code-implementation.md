# MCP Server Fix: Code Implementation

This document provides the specific code changes needed to fix the MCP server implementation. The primary issue is that the server is not properly connected to a transport mechanism, which is essential for the MCP protocol to function.

## Current Code vs. Fixed Code

### Current Non-Working Implementation

Current implementation in `src/server/mcp-server.ts`:

```typescript
// Function to start the server
export const startServer = async (memoryPath?: string) => {
    // Remove debug logs

    // Create a server instance
    const server = createServer(memoryPath);

    // Handle stdin directly for debugging
    process.stdin.on('data', (data) => {
        try {
            // Parse the JSON-RPC request
            const request = JSON.parse(data.toString().trim());
            // Remove debug log: Received request

            // Handle list_tools request directly
            if (request.method === "list_tools") {
                const response = {
                    jsonrpc: "2.0",
                    id: request.id,
                    result: {
                        tools: [
                            {
                                name: "test_tool",
                                description: "Test tool for debugging",
                                inputSchema: { type: "object", properties: {} }
                            }
                        ]
                    }
                };

                // Remove debug log: Sending response
                process.stdout.write(JSON.stringify(response) + '\n');
            }
        } catch (error) {
            // Remove debug log: Error handling request
        }
    });

    // Remove debug logs: Server created, Knowledge Graph MCP Server running on stdio, Waiting for JSON-RPC requests...

    // Keep the process alive
    process.stdin.resume();

    return server;
};
```

### Fixed Implementation

Fixed implementation for `src/server/mcp-server.ts`:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { KnowledgeGraphManager } from '../graph/index.js';
import { Entity, Relation } from '../types/index.js';

// Create a knowledge graph manager instance
export const createServer = (memoryPath?: string) => {
    const knowledgeGraphManager = new KnowledgeGraphManager(memoryPath);

    // Create the server instance with metadata
    const server = new Server({
        name: "@itseasy21/mcp-knowledge-graph",
        version: "1.0.7",
    }, {
        capabilities: {
            tools: {},
        },
    });

    // Register the tool definitions
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: [
                // ... tool definitions remain the same ...
            ],
        };
    });

    // Register the handler for tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;

        if (!args) {
            throw new Error(`No arguments provided for tool: ${name}`);
        }

        switch (name) {
            case "create_entities":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities as Entity[]), null, 2) }] };
            // ... other case statements remain the same ...
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });

    return server;
};

// Function to start the server
export const startServer = async (memoryPath?: string) => {
    // Create a server instance
    const server = createServer(memoryPath);
    
    // Create and connect transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("Knowledge Graph MCP Server running on stdio");
    
    return server;
};
```

## Changes Made

1. **Removed interfering custom code**:
   - Removed the custom `process.stdin.on('data', ...)` handler that was intercepting MCP messages
   - Removed the `process.stdin.resume()` line that was just keeping the process alive

2. **Added proper transport connection**:
   - Added import for `StdioServerTransport`
   - Created a new `StdioServerTransport` instance
   - Connected the server to the transport with `await server.connect(transport)`

3. **Simplified logging**:
   - Added a single log message to indicate server is running
   - Removed unnecessary debug logs

## Import Requirements

Make sure the following imports are at the top of the file:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { KnowledgeGraphManager } from '../graph/index.js';
import { Entity, Relation } from '../types/index.js';
```

## Testing the Implementation

After making these changes:

1. Build the project:
   ```
   make build
   ```

2. Test the server:
   ```
   make test-cli
   ```

3. If everything is working correctly, you should see a response from the server when the test command is run.

## Potential Issues

If you encounter any issues:

1. Check for syntax errors or missing imports
2. Verify that the MCP SDK packages are installed correctly
3. Make sure the `KnowledgeGraphManager` is being instantiated correctly
4. Check for any conflicting process signal handlers

This implementation maintains compatibility with the existing codebase while fixing the core issue of missing transport connection.