#!/usr/bin/env node

console.log("DEBUG 1: Root index.ts is loading");

// Export all functionality from the src directory
export * from './src/index.js';

console.log("DEBUG 2: After importing from src/index.js");

// Run the CLI by default when this module is executed directly
console.log("DEBUG 3: About to import main.js");
import './src/cli/main.js';
console.log("DEBUG 4: After importing main.js");
