# JSON-RPC Protocol Implementation Plan

## Problem Statement

The command `echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | node dist/index.js` does not return any data, even with the `--server` flag added. The process completes without producing any output or errors.

## Root Cause Analysis

After examining the codebase, several architectural issues were identified:

1. **Broken Entry Point**: The main entry point (`index.ts`) only exports components but doesn't execute the CLI code.
2. **CLI Execution**: The CLI module might not be properly linked in the build process.
3. **JSON-RPC Handling**: There are parallel implementations of JSON-RPC request handling (in `mcp-server.ts` and `test-jsonrpc.js`).
4. **Command Line Arguments**: The server only starts with the `--server` flag.

## Implementation Plan

### Phase 1: Diagnostic Verification

**Task 1.1: Create Test Harness**
- Create a simple script to verify the stdin/stdout handling functionality
- Test with both the main executable and test script
- Document observed behavior

**Task 1.2: Analyze Build Process**
- Review how TypeScript compilation is set up
- Verify how CLI is included in the build
- Check executable permissions of output files

**Task 1.3: Debug Server Initialization**
- Add additional debug logging to server startup process
- Trace execution flow from entry point to JSON-RPC handling
- Identify where the process might be exiting prematurely

### Phase 2: Entry Point Correction

**Task 2.1: Fix Main Entry Point**
- Update `index.ts` to properly execute the CLI code
- Ensure proper shebang line for executable scripts
- Verify file permissions after build

**Task 2.2: CLI Module Integration**
- Ensure CLI module is properly built and linked
- Update package.json bin configuration if necessary
- Fix any import/export issues

**Task 2.3: Standardize JSON-RPC Implementation**
- Consolidate JSON-RPC handling into a single implementation
- Ensure consistent error handling
- Standardize debugging output

### Phase 3: Server Mode Enhancement

**Task 3.1: Improve Server Mode Detection**
- Enhance CLI argument parsing for better server mode detection
- Add automatic server mode detection for piped input
- Document server mode behavior

**Task 3.2: Stdout/Stderr Handling**
- Ensure JSON-RPC responses go to stdout
- Keep debugging information on stderr
- Add clear separator for debugging information

**Task 3.3: Stdin Processing**
- Improve stdin reading mechanism
- Handle chunked input correctly
- Add timeout handling for incomplete requests

### Phase 4: Testing and Documentation

**Task 4.1: Create Automated Tests**
- Develop test suite for JSON-RPC functionality
- Create tests for server mode
- Test with various input conditions

**Task 4.2: Update Documentation**
- Update README with correct usage instructions
- Document server mode behavior
- Add troubleshooting section

**Task 4.3: Create Example Scripts**
- Create example scripts demonstrating correct usage
- Include examples in documentation
- Document best practices

## Implementation Details

### Entry Point Correction

The main issue appears to be that `index.ts` only exports components but doesn't execute the CLI code. The file should be updated to properly execute the CLI:

```typescript
// Export all components from a single entry point
export * from './types/index.js';
export * from './graph/index.js';
export * from './server/index.js';

// Execute CLI when file is run directly
if (require.main === module) {
  import('./cli/main.js').then(cli => {
    // CLI execution will happen here
  }).catch(err => {
    console.error('Failed to start CLI:', err);
    process.exit(1);
  });
}
```

### JSON-RPC Handling Standardization

The JSON-RPC implementation should be consolidated into a single approach:

```typescript
// Standard JSON-RPC handler
function handleJsonRpcRequest(data: Buffer | string) {
  try {
    // Parse the JSON-RPC request
    const request = JSON.parse(data.toString().trim());
    
    // Log to stderr for debugging
    console.error(`DEBUG: Received request: ${JSON.stringify(request)}`);
    
    // Process the request and get a response
    const response = processRequest(request);
    
    // Write the response to stdout
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    console.error(`ERROR: ${error}`);
    // Send error response to stdout
    const errorResponse = {
      jsonrpc: "2.0",
      id: null,
      error: {
        code: -32700,
        message: "Parse error"
      }
    };
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
  }
}
```

### Server Mode Detection

Improve server mode detection to automatically handle piped input:

```typescript
// Check if input is being piped in
const isInputPiped = !process.stdin.isTTY;

// If input is piped, automatically enter server mode
if (isInputPiped || options.server) {
  startServer(memoryPath);
} else {
  // If no operation was performed, show help
  program.help();
}
```

## Success Criteria

- The command `echo '{"jsonrpc":"2.0","id":"1","method":"list_tools","params":{}}' | node dist/index.js` returns a valid JSON-RPC response without requiring additional flags
- The `--server` flag works as expected for long-running server mode
- Debug information appears on stderr, not interfering with stdout JSON-RPC responses
- All JSON-RPC methods return appropriate responses
- Documentation clearly explains the correct usage

## Testing Strategy

1. Test basic JSON-RPC commands with piped input
2. Test server mode with interactive input
3. Test error handling with malformed requests
4. Test all supported methods and tools
5. Verify behavior matches documentation

## Implementation Checklist

- [ ] Phase 1: Diagnostic Verification
  - [ ] Task 1.1: Create Test Harness
  - [ ] Task 1.2: Analyze Build Process
  - [ ] Task 1.3: Debug Server Initialization
- [ ] Phase 2: Entry Point Correction
  - [ ] Task 2.1: Fix Main Entry Point
  - [ ] Task 2.2: CLI Module Integration
  - [ ] Task 2.3: Standardize JSON-RPC Implementation
- [ ] Phase 3: Server Mode Enhancement
  - [ ] Task 3.1: Improve Server Mode Detection
  - [ ] Task 3.2: Stdout/Stderr Handling
  - [ ] Task 3.3: Stdin Processing
- [ ] Phase 4: Testing and Documentation
  - [ ] Task 4.1: Create Automated Tests
  - [ ] Task 4.2: Update Documentation
  - [ ] Task 4.3: Create Example Scripts