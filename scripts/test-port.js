#!/usr/bin/env node

/**
 * Simple Port Test Script
 */

const net = require('net');

function testPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(port, () => {
            console.log(`✅ Port ${port} is available (server listening)`);
            server.close(() => {
                console.log(`✅ Port ${port} is now free (server closed)`);
                resolve(true);
            });
        });
        
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`❌ Port ${port} is in use`);
            } else {
                console.log(`❌ Port ${port} error: ${error.message}`);
            }
            resolve(false);
        });
    });
}

async function testPorts() {
    const ports = [3000, 3001, 3002, 3003, 8080, 8081];
    
    for (const port of ports) {
        console.log(`\n🔍 Testing port ${port}...`);
        await testPort(port);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    }
}

testPorts();