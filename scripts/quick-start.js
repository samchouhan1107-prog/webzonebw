#!/usr/bin/env node

/**
 * Quick Server Start
 */

console.log('🚀 Quick WebZoneBW Server Start');
console.log('================================');

// Set environment
process.env.PORT = '4000';
process.env.NODE_ENV = 'production';

// Start the server
require('../server.js');