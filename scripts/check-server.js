#!/usr/bin/env node

/**
 * Check if server is running
 */

const http = require('http');

const ports = [3000, 3001, 3002, 4000];

function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/api/health',
            method: 'GET',
            timeout: 3000
        }, (res) => {
            console.log(`✅ Port ${port}: Server is running - Status: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', () => {
            console.log(`❌ Port ${port}: Server is not running or connection failed`);
            resolve(false);
        });

        req.on('timeout', () => {
            console.log(`⏰ Port ${port}: Request timed out`);
            resolve(false);
        });

        req.end();
    });
}

async function checkAllPorts() {
    console.log('🔍 Checking for WebZoneBW server on ports...');
    
    for (const port of ports) {
        console.log(`\n🔍 Checking port ${port}...`);
        await checkPort(port);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

checkAllPorts();