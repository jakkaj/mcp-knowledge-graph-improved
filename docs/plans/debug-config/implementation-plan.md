# VS Code Debugging Configuration Plan

## Problem Statement

Breakpoints in TypeScript files, particularly at line 21 in `src/cli/main.ts`, are not being hit during debugging sessions. This issue likely occurs because the regular debugging process compiles the TypeScript files to JavaScript and then runs the JavaScript files, causing a mismatch between the source code locations and the running code.

## Phase 1: Configuration Setup

### Task 1.1: Update Launch Configuration
- Create a dedicated configuration for debugging TypeScript files directly
- Add configurations for debugging specific application components
- Ensure all configurations use proper source map settings

### Task 1.2: Create Debug Entry Point
- Create a separate debug entry point file
- Configure it to load TypeScript modules directly
- Add direct import of the main CLI module

## Phase 2: Fix TypeScript Debugging Setup

### Task 2.1: Add ts-node Support
- Add configuration to run TypeScript files directly through ts-node
- Configure proper module resolution for ESM modules
- Add proper runtime arguments for Node.js

### Task 2.2: Configure Source Map Support
- Ensure source maps are properly enabled in tsconfig files
- Configure outFiles setting in launch configurations
- Add skipFiles to avoid internal Node.js code

## Phase 3: Testing and Validation

### Task 3.1: Test Breakpoints in main.ts
- Set breakpoints in the main.ts file
- Run in debug mode with different configurations
- Verify breakpoints are hit correctly

### Task 3.2: Test Full Application Debugging
- Set breakpoints in various modules (graph, server, types)
- Follow full application execution path
- Ensure all components can be debugged

## Checklist

- [x] Task 1.1: Update Launch Configuration
- [x] Task 1.2: Create Debug Entry Point
- [x] Task 2.1: Add ts-node Support
- [x] Task 2.2: Configure Source Map Support
- [x] Task 3.1: Test Breakpoints in main.ts
- [ ] Task 3.2: Test Full Application Debugging

## Success Criteria

The debugging configuration will be considered successful when:
1. Breakpoints in main.ts are hit during debugging
2. Breakpoints in all TypeScript source files can be hit
3. Debug variables and call stack information are properly shown
4. Developers can easily debug without additional setup steps