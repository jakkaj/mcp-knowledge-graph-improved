# MCP Server Fix Implementation Plan

## Overview

This document outlines the implementation plan for fixing our Model Context Protocol (MCP) server. The current server implementation is not properly connecting to the MCP transport mechanism, causing the server to not work correctly.

## Implementation Goals

1. Establish proper connection between the server and the MCP transport
2. Remove custom stdin handling that interferes with the MCP protocol
3. Ensure error handling is robust
4. Maintain compatibility with the existing codebase

## Implementation Steps

### Phase 1: Code Structure Review and Cleanup

#### Task 1.1: Review Current Implementation
- Understand the current modular approach with separate files
- Identify the code paths for server creation and startup
- Document dependencies and imports

#### Task 1.2: Cleanup Custom Handlers
- Remove the custom stdin data handler that interferes with the MCP protocol
- Remove any debug statements that might affect the MCP communication

### Phase 2: Server Connection Implementation

#### Task 2.1: Update the `startServer` Function
- Modify the `startServer` function to create and connect to a transport
- Implement proper async flow for server startup
- Add error handling for connection failures

#### Task 2.2: Transport Implementation
- Import the `StdioServerTransport` class
- Create and configure the transport instance
- Connect the server to the transport

### Phase 3: Testing and Verification

#### Task 3.1: Test Basic Server Connection
- Run the server in isolation
- Verify it starts without errors
- Check for proper server logs

#### Task 3.2: Test JSON-RPC Communication
- Send basic JSON-RPC requests to verify the server responds
- Test the `list_tools` command
- Test a basic tool call

## Detailed Implementation

### Update to `startServer` Function

The `startServer` function in `src/server/mcp-server.ts` needs to be updated to:

```typescript
// Function to start the server
export const startServer = async (memoryPath?: string) => {
    // Create a server instance
    const server = createServer(memoryPath);
    
    try {
        // Create and connect transport
        const transport = new StdioServerTransport();
        await server.connect(transport);
        
        console.error("Knowledge Graph MCP Server running on stdio");
        
        return server;
    } catch (error) {
        console.error(`Error connecting to transport: ${(error as Error).message}`);
        throw error;
    }
};
```

### Remove Custom stdin Handler

The following code should be removed completely as it interferes with the MCP protocol:

```typescript
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
```

### Remove Process Keep-Alive Code

The following code should be removed as it's not needed with proper MCP transport:

```typescript
// Keep the process alive
process.stdin.resume();
```

## Testing

After implementing the changes, test the server with:

1. Basic command: `node dist/index.js --server`
2. Test command from Makefile: `make test-cli`
3. Docker test: `make docker-test`

## Success Criteria

- [ ] The server starts without errors
- [ ] The server correctly responds to JSON-RPC requests
- [ ] All tools are properly registered and accessible
- [ ] No custom stdin/stdout handling interferes with the MCP protocol
- [ ] Error handling is robust and informative

## Implementation Timeline

1. Code cleanup and removal of custom handlers: 1 hour
2. Implementation of proper transport connection: 1 hour
3. Testing and verification: 2 hours

Total estimated time: 4 hours