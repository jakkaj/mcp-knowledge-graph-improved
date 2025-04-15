# JSON-RPC Protocol Fix Plan Summary

## Issue Summary

The MCP Knowledge Graph JSON-RPC interface is not functioning correctly. The command `echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | node dist/index.js` (with or without the `--server` flag) does not return any data. The process completes without producing any output or errors, which prevents proper interaction with the MCP server through the JSON-RPC protocol.

## Key Diagnostic Findings

After analyzing the codebase, we've identified several architectural issues:

1. **Execution Flow Problem**: The main entry point (`index.ts`) only exports components but doesn't execute the CLI code when run directly.

2. **CLI Execution Gap**: There's a disconnect between the exported modules and the CLI execution, preventing the server from handling stdin when run with `node dist/index.js`.

3. **Incomplete Server Initialization**: The server mode (using `--server` flag) is not properly activating the JSON-RPC handler.

4. **Parallel Implementations**: There are separate implementations of JSON-RPC handling in the main server code and the test script, causing potential confusion.

5. **I/O Channel Confusion**: Debug messages are sent to stderr while JSON-RPC responses should go to stdout, but this separation may not be working correctly.

Refer to the [Diagnostic Analysis](./diagnostic-analysis.md) for a detailed breakdown of the issues.

## Proposed Architecture

We've designed an improved architecture that addresses the identified issues. The key architectural changes include:

1. Updating the entry point to execute the CLI code when run directly
2. Improving server mode detection to handle piped input automatically
3. Standardizing the JSON-RPC handling into a single implementation
4. Ensuring proper I/O channel separation

See the [Architecture Diagram](./architecture-diagram.md) for a visual representation of the current and proposed architectures.

## Implementation Plan Overview

The implementation is divided into four phases:

### Phase 1: Diagnostic Verification
- Create test harness
- Analyze build process
- Debug server initialization

### Phase 2: Entry Point Correction
- Fix main entry point
- Improve CLI module integration
- Standardize JSON-RPC implementation

### Phase 3: Server Mode Enhancement
- Improve server mode detection
- Fix stdout/stderr handling
- Enhance stdin processing

### Phase 4: Testing and Documentation
- Create automated tests
- Update documentation
- Create example scripts

Refer to the [Implementation Plan](./implementation-plan.md) for detailed tasks and code examples.

## Next Steps

1. **Review and Approval**: Review this plan and provide feedback or approval
2. **Implementation**: Begin implementation starting with Phase 1
3. **Testing**: Test the changes to ensure they resolve the issue
4. **Documentation**: Update the documentation to reflect the changes

## Recommendations

1. **Switch to Code Mode**: To implement these changes, we recommend switching to Code mode where we can make the necessary code changes to the project.

2. **Incremental Testing**: Test each phase incrementally to ensure progress is made without introducing new issues.

3. **Consider Additional Features**: Once the basic JSON-RPC functionality is fixed, consider adding additional features such as:
   - Automatic content type detection
   - Support for batch requests
   - Improved error reporting

4. **Compatibility Check**: Ensure compatibility with existing MCP clients and tools after making these changes.

## Success Criteria

The implementation will be considered successful when:

- The command `echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | node dist/index.js` returns a valid JSON-RPC response
- All JSON-RPC methods work correctly through stdin/stdout
- Debug information appears on stderr only
- Documentation clearly explains the usage

By implementing this plan, we'll restore the expected JSON-RPC functionality and improve the overall architecture of the MCP Knowledge Graph server.