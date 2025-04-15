#!/usr/bin/env node

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
                {
                    name: "create_entities",
                    description: "Create multiple new entities in the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            entities: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", description: "The name of the entity" },
                                        entityType: { type: "string", description: "The type of the entity" },
                                        observations: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "An array of observation contents associated with the entity"
                                        },
                                    },
                                    required: ["name", "entityType", "observations"],
                                },
                            },
                        },
                        required: ["entities"],
                    },
                },
                {
                    name: "create_relations",
                    description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
                    inputSchema: {
                        type: "object",
                        properties: {
                            relations: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        from: { type: "string", description: "The name of the entity where the relation starts" },
                                        to: { type: "string", description: "The name of the entity where the relation ends" },
                                        relationType: { type: "string", description: "The type of the relation" },
                                    },
                                    required: ["from", "to", "relationType"],
                                },
                            },
                        },
                        required: ["relations"],
                    },
                },
                {
                    name: "add_observations",
                    description: "Add new observations to existing entities in the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            observations: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        entityName: { type: "string", description: "The name of the entity to add the observations to" },
                                        contents: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "An array of observation contents to add"
                                        },
                                    },
                                    required: ["entityName", "contents"],
                                },
                            },
                        },
                        required: ["observations"],
                    },
                },
                {
                    name: "delete_entities",
                    description: "Delete multiple entities and their associated relations from the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            entityNames: {
                                type: "array",
                                items: { type: "string" },
                                description: "An array of entity names to delete"
                            },
                        },
                        required: ["entityNames"],
                    },
                },
                {
                    name: "delete_observations",
                    description: "Delete specific observations from entities in the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            deletions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        entityName: { type: "string", description: "The name of the entity containing the observations" },
                                        observations: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "An array of observations to delete"
                                        },
                                    },
                                    required: ["entityName", "observations"],
                                },
                            },
                        },
                        required: ["deletions"],
                    },
                },
                {
                    name: "delete_relations",
                    description: "Delete multiple relations from the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            relations: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        from: { type: "string", description: "The name of the entity where the relation starts" },
                                        to: { type: "string", description: "The name of the entity where the relation ends" },
                                        relationType: { type: "string", description: "The type of the relation" },
                                    },
                                    required: ["from", "to", "relationType"],
                                },
                                description: "An array of relations to delete"
                            },
                        },
                        required: ["relations"],
                    },
                },
                {
                    name: "read_graph",
                    description: "Read the entire knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
                {
                    name: "search_nodes",
                    description: "Search for nodes in the knowledge graph based on a query",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
                        },
                        required: ["query"],
                    },
                },
                {
                    name: "open_nodes",
                    description: "Open specific nodes in the knowledge graph by their names",
                    inputSchema: {
                        type: "object",
                        properties: {
                            names: {
                                type: "array",
                                items: { type: "string" },
                                description: "An array of entity names to retrieve",
                            },
                        },
                        required: ["names"],
                    },
                },
                {
                    name: "update_entities",
                    description: "Update multiple existing entities in the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            entities: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", description: "The name of the entity to update" },
                                        entityType: { type: "string", description: "The updated type of the entity" },
                                        observations: {
                                            type: "array",
                                            items: { type: "string" },
                                            description: "The updated array of observation contents"
                                        },
                                    },
                                    required: ["name"],
                                },
                            },
                        },
                        required: ["entities"],
                    },
                },
                {
                    name: "update_relations",
                    description: "Update multiple existing relations in the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            relations: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        from: { type: "string", description: "The name of the entity where the relation starts" },
                                        to: { type: "string", description: "The name of the entity where the relation ends" },
                                        relationType: { type: "string", description: "The type of the relation" },
                                    },
                                    required: ["from", "to", "relationType"],
                                },
                            },
                        },
                        required: ["relations"],
                    },
                },
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
            case "create_relations":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations as Relation[]), null, 2) }] };
            case "add_observations":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[]), null, 2) }] };
            case "delete_entities":
                await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
                return { content: [{ type: "text", text: "Entities deleted successfully" }] };
            case "delete_observations":
                await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[]);
                return { content: [{ type: "text", text: "Observations deleted successfully" }] };
            case "delete_relations":
                await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
                return { content: [{ type: "text", text: "Relations deleted successfully" }] };
            case "read_graph":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
            case "search_nodes":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(args.query as string), null, 2) }] };
            case "open_nodes":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(args.names as string[]), null, 2) }] };
            case "update_entities":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.updateEntities(args.entities as Entity[]), null, 2) }] };
            case "update_relations":
                return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.updateRelations(args.relations as Relation[]), null, 2) }] };
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });

    return server;
};

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