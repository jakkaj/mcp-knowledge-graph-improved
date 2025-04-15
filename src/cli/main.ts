#!/usr/bin/env node

import minimist from 'minimist';
import { Command } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';

// Debug helper - keeps the process alive during debugging sessions
// If we're in debug mode, keep the process alive
const isDebugMode = process.execArgv.some(arg =>
    arg.includes('--inspect') || arg.includes('--debug'));

if (isDebugMode) {
    console.log("DEBUG MODE: Keeping process alive for breakpoint attachment");
    // Add a property to global to store the interval handle
    (global as any)._debugWaitHandle = setInterval(() => { }, 1000000);

    // Allow clean exit with Ctrl+C
    process.on('SIGINT', () => {
        if ((global as any)._debugWaitHandle) clearInterval((global as any)._debugWaitHandle);
        process.exit(0);
    });
}

// Import from the more centralized locations
import { KnowledgeGraphManager } from '../graph/index.js';
import { startServer } from '../server/index.js';
import { KnowledgeGraph } from '../types/index.js';

// Set up command-line argument parsing
const program = new Command();

program
    .name('knowledge-graph')
    .description('Knowledge Graph CLI and MCP Server')
    .version('1.0.7');

program
    .option('-m, --memory-path <path>', 'Path to memory file')
    .option('-s, --server', 'Run as MCP server')
    .option('-e, --export <path>', 'Export the graph to a JSON file')
    .option('-i, --import <path>', 'Import a graph from a JSON file');

program.parse(process.argv);

const options = program.opts();

// Main function to handle CLI operations
const main = async () => {
    // Check if we're in debug mode
    if (process.env.DEBUG_MODE === 'true') {
        console.log('Running in DEBUG mode');
    }

    // Get memory path from CLI args or environment variable
    const memoryPath = options.memoryPath || process.env.MEMORY_FILE_PATH;


    const knowledgeGraphManager = new KnowledgeGraphManager(memoryPath);

    // Import operation
    if (options.import) {
        try {
            const data = await fs.readFile(options.import, 'utf-8');
            const graph = JSON.parse(data) as KnowledgeGraph;
            const importedEntities = await knowledgeGraphManager.createEntities(graph.entities);
            const importedRelations = await knowledgeGraphManager.createRelations(graph.relations);
            console.log(`Imported ${importedEntities.length} entities and ${importedRelations.length} relations.`);
        } catch (error) {
            console.error(`Error importing graph: ${(error as Error).message}`);
            process.exit(1);
        }
    }

    // Export operation
    if (options.export) {
        try {
            const graph = await knowledgeGraphManager.readGraph();
            await fs.writeFile(options.export, JSON.stringify(graph, null, 2), 'utf-8');
            console.log(`Graph exported to ${options.export}`);
        } catch (error) {
            console.error(`Error exporting graph: ${(error as Error).message}`);
            process.exit(1);
        }
    }

    // Run in server mode if requested
    if (options.server) {
        try {
            await startServer(memoryPath);
        } catch (error) {
            console.error(`Error starting server: ${(error as Error).message}`);
            process.exit(1);
        }
    } else if (!options.import && !options.export) {
        // If no operation was performed, show help
        program.help();
    }
};

// Execute main function
main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
});