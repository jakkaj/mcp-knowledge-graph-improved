#!/usr/bin/env node

// Export all functionality from the src directory
export * from './src/index.js';

// Run the CLI by default when this module is executed directly
import './src/cli/main.js';
