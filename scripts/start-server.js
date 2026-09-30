#!/usr/bin/env node

/**
 * WebZoneBW Enhanced Server Startup Script
 * 
 * This script helps manage port conflicts and provides
 * better error handling for server startup.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 WebZoneBW Enhanced Server Startup');
console.log('====================================');

// Check if port 3000 is available
function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const socket = new net.Socket();
        
        socket.setTimeout(1000);
        socket.connect(port, 'localhost', () => {
            socket.end();
            resolve(false); // Port is in use
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(true); // Port is available
        });
        
        socket.on('error', () => {
            resolve(true); // Port is available (connection refused)
        });
    });
}

// Kill existing processes on port 3000
function killPort3000() {
    return new Promise((resolve) => {
        console.log('🔍 Checking for processes on port 3000...');
        
        exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
            if (stdout && stdout.trim()) {
                console.log('⚠️ Found processes using port 3000, killing them...');
                exec('taskkill /F /IM node.exe /T', (killError, killStdout, killStderr) => {
                    if (killError) {
                        console.log('⚠️ Could not kill processes:', killError.message);
                    } else {
                        console.log('✅ Processes killed successfully');
                    }
                    setTimeout(resolve, 2000); // Wait 2 seconds for port to be released
                });
            } else {
                console.log('✅ No processes found on port 3000');
                resolve();
            }
        });
    });
}

// Start the server
async function startServer() {
    try {
        // Check if port 3000 is available
        const portAvailable = await checkPort(3000);
        
        if (!portAvailable) {
            console.log('🔍 Port 3000 is in use. Attempting to free it...');
            await killPort3000();
            
            // Check again after killing processes
            const portAvailableAfterKill = await checkPort(3000);
            if (!portAvailableAfterKill) {
                console.log('❌ Port 3000 is still in use. Please check what process is using it.');
                console.log('💡 You can try:');
                console.log('   - Run "netstat -ano | findstr :3000" to see the process ID');
                console.log('   - Run "taskkill /F /PID <PID>" to kill the process');
                console.log('   - Or use a different port: set PORT=3001 && npm start');
                process.exit(1);
            }
        }
        
        console.log('✅ Port 3000 is available');
        console.log('🚀 Starting WebZoneBW server...');
        
        // Start the main server
        const serverPath = path.join(__dirname, '..', 'server.js');
        const child = exec(`node "${serverPath}"`);
        
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
        
    } catch (error) {
        console.error('❌ Error starting server:', error.message);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer();