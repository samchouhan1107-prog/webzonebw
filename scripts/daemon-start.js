#!/usr/bin/env node

/**
 * WebZoneBW Daemon Start Script
 * Keeps the server running in the background
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 WebZoneBW Daemon Start');
console.log('==========================');

// Set environment
const env = {
    ...process.env,
    PORT: '4000',
    NODE_ENV: 'production'
};

// Start the server as a daemon
const serverProcess = spawn('node', [path.join(__dirname, '..', 'server.js')], {
    env: env,
    stdio: 'inherit',
    detached: true
});

serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log(`\n🛑 Server process exited with code ${code}`);
    if (code !== 0) {
        console.log('💡 Server crashed. Restarting...');
        setTimeout(() => {
            require('./daemon-start.js');
        }, 5000);
    }
});

// Handle parent process exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server daemon...');
    serverProcess.kill();
    process.exit(0);
});

// Keep the parent process alive
process.stdin.resume();

console.log('✅ Server daemon started. Press Ctrl+C to stop.');
console.log('📡 Server should be available on http://localhost:4000 or fallback ports.');
console.log('🔍 Check server status with: npm run check:server');