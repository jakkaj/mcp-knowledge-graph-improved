#!/usr/bin/env node

// Import the MCP SDK using ES modules
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

// Create a simple server for testing
const server = new Server({
    name: "test-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});

// Log the schema details to understand the expected method names
console.error("ListToolsRequestSchema:", JSON.stringify(ListToolsRequestSchema, null, 2));
console.error("CallToolRequestSchema:", JSON.stringify(CallToolRequestSchema, null, 2));

// Register a simple handler for list_tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("ListToolsRequestSchema handler called");
    return {
        tools: [
            {
                name: "test_tool",
                description: "A test tool",
                inputSchema: { type: "object", properties: {} }
            }
        ]
    };
});

// Register a simple handler for call_tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    console.error("CallToolRequestSchema handler called with:", JSON.stringify(request));
    return { content: [{ type: "text", text: "Test response" }] };
});

// Main function
async function main() {
    try {
        // Connect to the transport
        const transport = new StdioServerTransport();
        console.error("Connecting to transport...");
        await server.connect(transport);
        console.error("Connected to transport");

        // Keep the process alive
        process.stdin.resume();
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

// Start the server
main();