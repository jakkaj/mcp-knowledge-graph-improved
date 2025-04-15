# MCP Server Fix Documentation

This directory contains documentation for fixing the issues with our Model Context Protocol (MCP) server implementation.

## Problem Summary

The MCP server is not working correctly because it's not properly connected to a transport mechanism, which is essential for MCP protocol communication. Instead of using the MCP SDK's transport system, the current implementation attempts to handle stdin/stdout directly, causing message handling issues.

## Documentation Index

1. [Executive Summary](./executive-summary.md) - Brief overview of the issue and solution
2. [Issue Analysis](./mcp-server-issue-analysis.md) - Detailed analysis of the server issues
3. [Implementation Plan](./implementation-plan.md) - Step-by-step plan for implementing the fix
4. [Code Implementation](./code-implementation.md) - Specific code changes needed

## Key Findings

1. **Missing Transport Connection**: The server is created but never connected to a StdioServerTransport.
2. **Custom Message Handling Interference**: Custom stdin/stdout handling code is intercepting messages.
3. **Incorrect Server Lifecycle**: The server startup process doesn't follow MCP protocol specifications.

## Implementation Checklist

- [ ] Remove custom stdin data handler that interferes with MCP protocol
- [ ] Remove process.stdin.resume() line that keeps the process alive
- [ ] Import StdioServerTransport from MCP SDK
- [ ] Create a StdioServerTransport instance in startServer function
- [ ] Connect the server to the transport using await server.connect(transport)
- [ ] Add appropriate error handling
- [ ] Test the implementation with make test-cli
- [ ] Verify Docker compatibility with make docker-test

## Code Fix Summary

The primary fix is to update the `startServer` function in `src/server/mcp-server.ts`:

```typescript
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

## Testing

After implementing the fix, test the server with:

```bash
# Test CLI integration
make test-cli

# Test Docker integration
make docker-test

# Full Docker test with multiple operations
make docker-test-full
```

## MCP Protocol Overview

The Model Context Protocol (MCP) is designed to standardize communication between AI models and external tools/resources. Key components:

1. **Server**: Handles request routing and tool registration
2. **Transport**: Manages communication over a specific channel (stdio, HTTP, etc.)
3. **Tools**: Functions exposed to AI models via standardized interfaces
4. **Resources**: Data sources accessible to AI models

The protocol uses JSON-RPC for communication, with specific schemas for tool listing, tool calls, and resource access.

## Additional Resources

- [MCP SDK Documentation](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [JSON-RPC Specification](https://www.jsonrpc.org/specification)