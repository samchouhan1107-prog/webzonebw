#!/usr/bin/env node

/**
 * Simple Server Startup
 */

const http = require('http');
const serverPath = require.resolve('../server.js');

console.log('🚀 Simple WebZoneBW Server Startup');
console.log('==================================');

const child = require('child_process').fork(serverPath, {
    env: { ...process.env, PORT: '4000', NODE_ENV: 'production' },
    silent: false
});

child.on('message', (message) => {
    console.log(`[SERVER] ${message}`);
});

child.on('exit', (code) => {
    console.log(`\n🛑 Server exited with code ${code}`);
    process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    child.kill('SIGINT');
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});