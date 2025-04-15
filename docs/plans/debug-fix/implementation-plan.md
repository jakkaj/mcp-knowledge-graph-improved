# Debugging Fix Implementation Plan

## Problem Statement

The breakpoint set in `src/cli/main.ts` (line 21) is not being hit during debugging sessions. After investigation, the issue appears to be in the application execution flow. The main entry point (`/index.ts`) is importing the compiled JavaScript file (`main.js`) rather than pointing to the TypeScript source, which causes a mismatch with the VS Code debugger's source mapping.

## Phase 1: Diagnosis and Verification

### Task 1.1: Understand Current Execution Flow
- Analyze how the entry point (`index.ts`) interacts with the CLI code
- Verify the import statements and execution paths
- Determine why the breakpoint isn't being hit

**Success Criteria:** Clear understanding of current execution flow and why breakpoints aren't working

### Task 1.2: Test Current Debug Configuration
- Run the application with the current debug configuration
- Check if any breakpoints are hit anywhere in the code
- Verify source maps are being generated correctly

**Success Criteria:** Confirm whether the issue is specific to `main.ts` or affects the entire application

## Phase 2: Debugging Configuration Fixes

### Task 2.1: Update VS Code Launch Configuration
- Modify the launch configuration to point directly to the source TypeScript files
- Add additional configurations as needed to debug different scenarios
- Ensure source maps are correctly configured

**Success Criteria:** Launch configuration directly targets TypeScript source files

### Task 2.2: Fix Source Map Configuration
- Verify TypeScript is configured to generate source maps correctly
- Check that the `outFiles` pattern in launch.json matches where the compiled JavaScript is located
- Ensure the source map paths are correct

**Success Criteria:** Source maps correctly map between TypeScript and JavaScript files

## Phase 3: Entry Point Modifications

### Task 3.1: Update Entry Point Structure
- Modify the root `index.ts` file to properly trigger the TypeScript CLI code
- Ensure TypeScript files are referenced instead of JavaScript files during development
- Fix any import/export inconsistencies

**Success Criteria:** Entry point properly references and executes TypeScript files

### Task 3.2: Create Direct Debug Entry Points
- Create dedicated debug entry points if needed to ensure direct execution of TypeScript files
- Update debug configurations to use these entry points

**Success Criteria:** Dedicated entry points exist for debug purposes

## Phase 4: Testing and Validation

### Task 4.1: Test Breakpoint in main.ts
- Set breakpoints in various locations in `main.ts`
- Debug the application using the new configuration
- Verify breakpoints are hit

**Success Criteria:** Breakpoints in `main.ts` are hit during debugging

### Task 4.2: Test Breakpoints Throughout Application
- Set breakpoints in various modules (graph, server, etc.)
- Debug through different execution paths
- Verify all breakpoints are hit correctly

**Success Criteria:** Breakpoints work correctly throughout the application

## Checklist

- [x] **Task 1.1:** Understand Current Execution Flow
- [x] **Task 1.2:** Test Current Debug Configuration
- [x] **Task 2.1:** Update VS Code Launch Configuration
- [x] **Task 2.2:** Fix Source Map Configuration
- [ ] **Task 3.1:** Update Entry Point Structure
- [ ] **Task 3.2:** Create Direct Debug Entry Points
- [ ] **Task 4.1:** Test Breakpoint in main.ts
- [ ] **Task 4.2:** Test Breakpoints Throughout Application

## Success Criteria

The implementation will be considered successful when:

1. Breakpoints set in `src/cli/main.ts` are correctly hit during debugging
2. All breakpoints throughout the application can be hit
3. The debugging experience works seamlessly with source maps
4. No code changes are required to switch between development and production builds