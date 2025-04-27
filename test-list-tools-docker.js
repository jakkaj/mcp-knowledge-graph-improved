#!/usr/bin/env node

// Import necessary packages for testing the list tools functionality in Docker
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

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

// Create a JUnit XML test report
function createJUnitReport(testResults) {
    // Create a unique timestamp for the report
    const timestamp = new Date().toISOString().replace(/:/g, '_');
    
    // Start XML document
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites name="Docker MCP Tests" time="${testResults.totalTime}" tests="${testResults.testsCount}" failures="${testResults.failures.length}">\n`;
    xml += `  <testsuite name="Docker MCP Container Tests" timestamp="${new Date().toISOString()}" tests="${testResults.testsCount}" failures="${testResults.failures.length}" time="${testResults.totalTime}">\n`;
    
    // Add successful tests
    for (const test of testResults.tests) {
        xml += `    <testcase name="${escapeXml(test.name)}" classname="DockerMCPTests" time="${test.time}">\n`;
        if (test.failure) {
            xml += `      <failure message="${escapeXml(test.failure.message)}">${escapeXml(test.failure.details)}</failure>\n`;
        }
        if (test.output) {
            xml += `      <system-out>${escapeXml(test.output)}</system-out>\n`;
        }
        xml += `    </testcase>\n`;
    }
    
    // Close tags
    xml += '  </testsuite>\n';
    xml += '</testsuites>';
    
    return xml;
}

// Escape special characters for XML
function escapeXml(unsafe) {
    return unsafe.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

// Main function to test the list tools command in Docker
async function main() {
    console.log("Starting test for list tools command in Docker container...");
    
    // Initialize test results
    const testResults = {
        testsCount: 0,
        failures: [],
        tests: [],
        startTime: Date.now(),
        totalTime: 0
    };

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
            "jakkaj/mcp-knowledge-graph",
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

        // Test 1: Connection Test
        const testConnectStart = Date.now();
        try {
            testResults.testsCount++;
            const connectTestResult = {
                name: "Docker Container Connection Test",
                time: 0,
                output: "Successfully connected to MCP server in Docker container"
            };
            
            connectTestResult.time = (Date.now() - testConnectStart) / 1000;
            testResults.tests.push(connectTestResult);
        } catch (error) {
            testResults.testsCount++;
            testResults.failures.push({
                name: "Docker Container Connection Test",
                message: "Failed to connect to Docker container",
                details: error.toString()
            });
            testResults.tests.push({
                name: "Docker Container Connection Test",
                time: (Date.now() - testConnectStart) / 1000,
                failure: {
                    message: "Failed to connect to Docker container",
                    details: error.toString()
                }
            });
            throw error; // Re-throw to stop further tests
        }

        // Test 2: List Tools Test
        const testListToolsStart = Date.now();
        try {
            testResults.testsCount++;
            // Call the listTools method on the client
            console.log("Listing tools from Docker container...");
            const result = await client.listTools();
            
            // Capture the output for test results
            const toolsOutput = JSON.stringify(result, null, 2);
            console.log("Tools list received from Docker container:");
            console.log(toolsOutput);

            // Verify we have tools in the response
            if (result.tools && result.tools.length > 0) {
                console.log(`Success! Found ${result.tools.length} tools in the response from Docker container.`);
                
                const listToolsTestResult = {
                    name: "List Tools Test",
                    time: (Date.now() - testListToolsStart) / 1000,
                    output: `Found ${result.tools.length} tools in the response from Docker container.`
                };
                testResults.tests.push(listToolsTestResult);
            } else {
                throw new Error("No tools found in the response from Docker container.");
            }
        } catch (error) {
            testResults.failures.push({
                name: "List Tools Test",
                message: "Failed to list tools",
                details: error.toString()
            });
            testResults.tests.push({
                name: "List Tools Test",
                time: (Date.now() - testListToolsStart) / 1000,
                failure: {
                    message: "Failed to list tools",
                    details: error.toString()
                }
            });
            throw error; // Re-throw to stop further tests
        }

        // Test 3: Search Nodes Test
        const testSearchNodesStart = Date.now();
        try {
            testResults.testsCount++;
            console.log('Calling search_nodes tool with query: "Search Functionality"...');
            const searchResult = await client.callTool({ 
                name: "search_nodes", 
                arguments: { query: "Search Functionality" } 
            });
            
            // Capture the output for test results
            const searchOutput = JSON.stringify(searchResult, null, 2);
            console.log("search_nodes tool output:");
            console.log(searchOutput);
            
            const searchNodesTestResult = {
                name: "Search Nodes Test",
                time: (Date.now() - testSearchNodesStart) / 1000,
                output: "Successfully called search_nodes tool"
            };
            testResults.tests.push(searchNodesTestResult);
        } catch (error) {
            testResults.failures.push({
                name: "Search Nodes Test",
                message: "Failed to call search_nodes tool",
                details: error.toString()
            });
            testResults.tests.push({
                name: "Search Nodes Test",
                time: (Date.now() - testSearchNodesStart) / 1000,
                failure: {
                    message: "Failed to call search_nodes tool",
                    details: error.toString()
                }
            });
        }

    } catch (error) {
        // Handle errors
        console.error("Error during Docker container test:", error);
    } finally {
        // Clean up
        console.log("Closing client connection to Docker container...");
        try {
            await client.close();
        } catch (e) {
            console.error("Error closing client:", e);
        }

        // Calculate total test time
        testResults.totalTime = (Date.now() - testResults.startTime) / 1000;
        
        // Generate XML report
        const xmlReport = createJUnitReport(testResults);
        
        // Make sure the test-results directory exists
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results');
        }
        
        // Write the XML report to a file
        fs.writeFileSync('test-results/docker-test-results.xml', xmlReport);
        console.log("JUnit XML test report written to test-results/docker-test-results.xml");
        
        // Output summary to console
        console.log("\nTest Summary:");
        console.log(`Total tests: ${testResults.testsCount}`);
        console.log(`Failures: ${testResults.failures.length}`);
        console.log(`Time: ${testResults.totalTime}s`);
        
        // The transport handles killing the server process when the client closes
        console.log("Docker container test completed.");
        
        // Exit with appropriate status code
        if (testResults.failures.length > 0) {
            process.exit(1);
        }
    }
}

// Run the test
main().catch(error => {
    console.error("Unhandled error in Docker container test:", error);
    process.exit(1);
});