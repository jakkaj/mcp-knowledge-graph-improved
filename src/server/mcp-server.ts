#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Use high-level McpServer
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js"; // Re-import for explicit handler
import { KnowledgeGraphManager } from '../graph/index.js';
import { Entity, Relation } from '../types/index.js';
import { z } from 'zod'; // Import Zod for defining tool schemas

// Create a knowledge graph manager instance
export const createServer = (memoryPath?: string) => {
    const knowledgeGraphManager = new KnowledgeGraphManager(memoryPath);
    // Create the McpServer instance with metadata
    const server = new McpServer({
        name: "@itseasy21/mcp-knowledge-graph",
        version: "1.0.7",
    });

    // --- Register tools using McpServer.tool() ---

    // create_entities
    server.tool(
        "create_entities",
        "Create multiple new entities in the knowledge graph",
        {
            entities: z.array(z.object({
                name: z.string().describe("The name of the entity"),
                entityType: z.string().describe("The type of the entity"),
                observations: z.array(z.string()).describe("An array of observation contents associated with the entity")
            }))
        },
        async (args) => {
            const result = await knowledgeGraphManager.createEntities(args.entities as Entity[]);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // create_relations
    server.tool(
        "create_relations",
        "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        {
            relations: z.array(z.object({
                from: z.string().describe("The name of the entity where the relation starts"),
                to: z.string().describe("The name of the entity where the relation ends"),
                relationType: z.string().describe("The type of the relation")
            }))
        },
        async (args) => {
            const result = await knowledgeGraphManager.createRelations(args.relations as Relation[]);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // add_observations
    server.tool(
        "add_observations",
        "Add new observations to existing entities in the knowledge graph",
        {
            observations: z.array(z.object({
                entityName: z.string().describe("The name of the entity to add the observations to"),
                contents: z.array(z.string()).describe("An array of observation contents to add")
            }))
        },
        async (args) => {
            const result = await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[]);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // delete_entities
    server.tool(
        "delete_entities",
        "Delete multiple entities and their associated relations from the knowledge graph",
        {
            entityNames: z.array(z.string()).describe("An array of entity names to delete")
        },
        async (args) => {
            await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
            return { content: [{ type: "text", text: "Entities deleted successfully" }] };
        }
    );

    // delete_observations
    server.tool(
        "delete_observations",
        "Delete specific observations from entities in the knowledge graph",
        {
            deletions: z.array(z.object({
                entityName: z.string().describe("The name of the entity containing the observations"),
                observations: z.array(z.string()).describe("An array of observations to delete")
            }))
        },
        async (args) => {
            await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[]);
            return { content: [{ type: "text", text: "Observations deleted successfully" }] };
        }
    );

    // delete_relations
    server.tool(
        "delete_relations",
        "Delete multiple relations from the knowledge graph",
        {
            relations: z.array(z.object({
                from: z.string().describe("The name of the entity where the relation starts"),
                to: z.string().describe("The name of the entity where the relation ends"),
                relationType: z.string().describe("The type of the relation")
            })).describe("An array of relations to delete")
        },
        async (args) => {
            await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
            return { content: [{ type: "text", text: "Relations deleted successfully" }] };
        }
    );

    // read_graph
    server.tool(
        "read_graph",
        "Read the entire knowledge graph",
        {}, // No parameters
        async () => {
            const result = await knowledgeGraphManager.readGraph();
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // search_nodes
    server.tool(
        "search_nodes",
        "Search for nodes in the knowledge graph based on a query",
        {
            query: z.string().describe("The search query to match against entity names, types, and observation content")
        },
        async (args) => {
            const result = await knowledgeGraphManager.searchNodes(args.query as string);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // open_nodes
    server.tool(
        "open_nodes",
        "Open specific nodes in the knowledge graph by their names",
        {
            names: z.array(z.string()).describe("An array of entity names to retrieve")
        },
        async (args) => {
            const result = await knowledgeGraphManager.openNodes(args.names as string[]);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // update_entities
    server.tool(
        "update_entities",
        "Update multiple existing entities in the knowledge graph",
        {
            entities: z.array(z.object({
                name: z.string().describe("The name of the entity to update"),
                // Optional fields for update
                entityType: z.string().optional().describe("The updated type of the entity"),
                observations: z.array(z.string()).optional().describe("The updated array of observation contents")
            }))
        },
        async (args) => {
            // Need to cast carefully as Entity type expects non-optional fields
            const entitiesToUpdate = args.entities.map(e => ({
                name: e.name,
                ...(e.entityType && { entityType: e.entityType }),
                ...(e.observations && { observations: e.observations }),
            })) as Entity[]; // Cast needed, ensure downstream handles partial updates
            const result = await knowledgeGraphManager.updateEntities(entitiesToUpdate);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );

    // update_relations
    server.tool(
        "update_relations",
        "Update multiple existing relations in the knowledge graph",
        {
            relations: z.array(z.object({
                from: z.string().describe("The name of the entity where the relation starts"),
                to: z.string().describe("The name of the entity where the relation ends"),
                relationType: z.string().describe("The type of the relation"),
                // Add optional fields for update if needed, e.g., newRelationType
            }))
        },
        async (args) => {
            // Need to cast carefully as Relation type expects non-optional fields
            const relationsToUpdate = args.relations.map(r => ({
                from: r.from,
                to: r.to,
                relationType: r.relationType,
                // Add other fields if the schema allows updates
            })) as Relation[]; // Cast needed
            const result = await knowledgeGraphManager.updateRelations(relationsToUpdate);
            return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        }
    );
    // Although McpServer should automatically handle listTools and callTool requests,
    // sometimes the automatic handling doesn't work correctly.
    // Adding an explicit handler for ListToolsRequestSchema to ensure it works properly
    server.server.setRequestHandler(ListToolsRequestSchema, async () => {
        console.error("ListToolsRequestSchema handler called");

        // Return all the available tools registered with the server
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
                                        name: { type: "string" },
                                        entityType: { type: "string" },
                                        observations: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    }
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
                                        from: { type: "string" },
                                        to: { type: "string" },
                                        relationType: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
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
                                        entityName: { type: "string" },
                                        contents: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    name: "delete_entities",
                    description: "Delete multiple entities and their associated relations from the knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {
                            entityNames: { type: "array", items: { type: "string" } }
                        }
                    }
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
                                        entityName: { type: "string" },
                                        observations: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    }
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
                                        from: { type: "string" },
                                        to: { type: "string" },
                                        relationType: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    name: "read_graph",
                    description: "Read the entire knowledge graph",
                    inputSchema: {
                        type: "object",
                        properties: {}
                    }
                },
                {
                    name: "search_nodes",
                    description: "Search for nodes in the knowledge graph based on a query",
                    inputSchema: {
                        type: "object",
                        properties: {
                            query: { type: "string" }
                        }
                    }
                },
                {
                    name: "open_nodes",
                    description: "Open specific nodes in the knowledge graph by their names",
                    inputSchema: {
                        type: "object",
                        properties: {
                            names: { type: "array", items: { type: "string" } }
                        }
                    }
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
                                        name: { type: "string" },
                                        entityType: { type: "string", optional: true },
                                        observations: { type: "array", items: { type: "string" }, optional: true }
                                    }
                                }
                            }
                        }
                    }
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
                                        from: { type: "string" },
                                        to: { type: "string" },
                                        relationType: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        };
    });


    return server;
};

// Function to start the server
export const startServer = async (memoryPath?: string) => {
    try {
        // Create a server instance
        const server = createServer(memoryPath);

        // Create and connect transport - this is the key part that was missing
        const transport = new StdioServerTransport();
        await server.connect(transport);



        // No need for process.stdin.resume(); the transport connection keeps it alive.
        return server;
    } catch (error) {
        console.error(`Error starting MCP server: ${(error as Error).message}`);
        throw error;
    }
};