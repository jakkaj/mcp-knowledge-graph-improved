#!/usr/bin/env node

// Import necessary packages for testing the list tools functionality in Docker
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * Test List Tools in Docker Container
 * 
 * This script tests the MCP list_tools command running inside a Docker container.
 * 
 * Prerequisites:
 * - Docker must be installed on your system
 * - The Docker image must be built using `make docker-build` before running this test
 *   (The makefile handles building the Docker image with the correct tag)
 * 
 * Usage:
 * - First build the Docker image: `make docker-build`
 * - Then run this test: `node test-list-tools-docker.js`
 * - Or use the makefile target: `make docker-test-mcp`
 */

// Main function to test the list tools command in Docker
async function main() {
    console.log("Starting test for list tools command in Docker container...");

    // Set up the client transport to spawn and communicate with the server via stdio
    // The transport uses Docker to run the server inside a container
    const transport = new StdioClientTransport({
        command: "docker",
        args: [
            "run",
            "-i",
            "--rm",
            "--init",
            "-v",
            "/home/jak/github/mcp-knowledge-graph-improved/.roo:/data",
            "mcp-knowledge-graph",
            "node",
            "dist/index.js",
            "--server",
            "--memory-path",
            "/data/memory.jsonl"
        ],
        // Optional: Add logging for the spawned process if needed
        // log: (level, message) => console.log(`[Transport ${level}] ${message}`)
    });

    // Create a client that will connect to the server
    const client = new Client({ name: "test-docker-client", version: "1.0.0" });

    try {
        // Connect to the server
        console.log("Connecting to server in Docker container...");
        await client.connect(transport);
        console.log("Connected to server in Docker container successfully!");

        // Call the listTools method on the client
        console.log("Listing tools from Docker container...");
        const result = await client.listTools();

        // Display the result
        console.log("Tools list received from Docker container:");
        console.log(JSON.stringify(result, null, 2));

        // Verify we have tools in the response
        if (result.tools && result.tools.length > 0) {
            console.log(`Success! Found ${result.tools.length} tools in the response from Docker container.`);
        } else {
            console.error("Error: No tools found in the response from Docker container.");
            process.exit(1);
        }

        // After the initial tools check, run the search_nodes tool and dump the output
        try {
            console.log('Calling search_nodes tool with query: "Search Functionality"...');
            const searchResult = await client.callTool({ name: "search_nodes", arguments: { query: "Search Functionality" } });
            console.log("search_nodes tool output:");
            console.log(JSON.stringify(searchResult, null, 2));
        } catch (err) {
            console.error("Error calling search_nodes tool:", err);
            process.exit(1);
        }
    } catch (error) {
        // Handle errors
        console.error("Error during Docker container test:", error);
        process.exit(1);
    } finally {
        // Clean up
        console.log("Closing client connection to Docker container...");
        await client.close();

        // The transport handles killing the server process when the client closes
        console.log("Docker container test completed.");
    }
}

// Run the test
main().catch(error => {
    console.error("Unhandled error in Docker container test:", error);
    process.exit(1);
});