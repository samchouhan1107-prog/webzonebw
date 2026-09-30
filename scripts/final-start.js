#!/usr/bin/env node

/**
 * Final Server Start - Simple and Direct
 */

console.log('🚀 Final WebZoneBW Server Start');
console.log('================================');

// Set environment
process.env.PORT = '5000';
process.env.NODE_ENV = 'production';

try {
    // Start the server directly
    require('../server.js');
    console.log('✅ Server started successfully!');
} catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
}