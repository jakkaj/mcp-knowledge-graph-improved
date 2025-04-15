#!/usr/bin/env node

/**
 * Debug entry point for the application.
 * This file is used only during development to provide proper source mapping for debugging.
 * It directly references the TypeScript source files.
 */

// Import CLI module directly
import './src/cli/main.js';

// This file should only be used for debugging with the VS Code debugger
// It allows breakpoints to be hit in the original TypeScript files
console.log('Debug entry point loaded');