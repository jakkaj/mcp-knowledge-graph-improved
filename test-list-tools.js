#!/usr/bin/env node

// Import necessary packages for testing the list tools functionality
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Main function to test the list tools command
async function main() {
    console.log("Starting test for list tools command...");

    // The transport will spawn the server process

    // Set up the client transport that communicates with the server via stdio
    // Set up the client transport to spawn and communicate with the server via stdio
    const transport = new StdioClientTransport({
        command: "node",
        args: ["--no-warnings", "./dist/index.js", "--server", "--memory-path", "./.roo/memory.jsonl"],
        // Optional: Add logging for the spawned process if needed
        // log: (level, message) => console.log(`[Transport ${level}] ${message}`)
    });

    // Create a client that will connect to the server
    const client = new Client({ name: "test-client", version: "1.0.0" });

    try {
        // Connect to the server
        console.log("Connecting to server...");
        await client.connect(transport);
        console.log("Connected to server successfully!");

        // Call the listTools method on the client
        console.log("Listing tools...");
        const result = await client.listTools();

        // Display the result
        console.log("Tools list received:");
        console.log(JSON.stringify(result, null, 2));

        // Verify we have tools in the response
        if (result.tools && result.tools.length > 0) {
            console.log(`Success! Found ${result.tools.length} tools in the response.`);
        } else {
            console.error("Error: No tools found in the response.");
            process.exit(1);
        }

        // After the initial tools check, run the search_nodes tool and dump the output
        try {
            console.log('Calling search_nodes tool with query: "Freezed"...');
            const searchResult = await client.callTool({ name: "search_nodes", arguments: { query: "Freezed" } });
            console.log("search_nodes tool output:");
            console.log(JSON.stringify(searchResult, null, 2));
        } catch (err) {
            console.error("Error calling search_nodes tool:", err);
            process.exit(1);
        }
    } catch (error) {
        // Handle errors
        console.error("Error during test:", error);
        process.exit(1);
    } finally {
        // Clean up
        console.log("Closing client connection...");
        await client.close();

        // The transport handles killing the server process when the client closes
        console.log("Test completed.");
    }
}

// Run the test
main().catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
});