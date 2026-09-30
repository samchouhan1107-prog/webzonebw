#!/usr/bin/env node

/**
 * WebZoneBW Server Startup on Port 3002
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🚀 WebZoneBW Server Startup on Port 3002');
console.log('========================================');

const serverPath = path.join(__dirname, '..', 'server.js');
const env = { ...process.env, PORT: '3002', NODE_ENV: 'production' };
const child = exec(`node "${serverPath}"`, { env });

child.stdout.on('data', (data) => {
    console.log(data.trim());
});

child.stderr.on('data', (data) => {
    console.log(data.trim());
});

child.on('close', (code) => {
    console.log(`\n🛑 Server stopped with exit code ${code}`);
    process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    child.kill('SIGINT');
});