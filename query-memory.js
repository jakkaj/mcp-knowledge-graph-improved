#!/usr/bin/env node

// Simple CLI to query .roo/memory.jsonl using MCP server via stdio

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Parse query from command line arguments
const query = process.argv.slice(2).join(" ");
if (!query) {
    console.error("Usage: ./query-memory.js <query string>");
    process.exit(1);
}

async function main() {
    // Set up the client transport to spawn and communicate with the server via stdio
    const transport = new StdioClientTransport({
        command: "node",
        args: [
            "--no-warnings",
            "./dist/index.js",
            "--server",
            "--memory-path",
            "./.roo/memory.jsonl",
        ],
    });

    // Create a client that will connect to the server
    const client = new Client({ name: "query-cli", version: "1.0.0" });

    try {
        await client.connect(transport);

        // Call the search_nodes tool on the client
        const result = await client.callTool({
            name: "search_nodes",
            arguments: { query }
        });

        // Display the result
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error running query:", err);
        process.exit(1);
    }
}

main();