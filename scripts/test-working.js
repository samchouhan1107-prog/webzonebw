#!/usr/bin/env node

/**
 * Test Working Server
 */

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
    timeout: 10000
};

console.log('🔍 Testing WebZoneBW server on port 3001...');

const req = http.request(options, (res) => {
    console.log(`✅ Connected! Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('✅ Server is working!');
            console.log('📊 Server Info:');
            console.log(`   Status: ${json.status}`);
            console.log(`   Version: ${json.version}`);
            console.log(`   Uptime: ${json.uptime}s`);
            console.log(`   Environment: ${json.environment}`);
            console.log(`   Memory Used: ${json.memory.used}MB`);
            console.log(`   Active Sessions: ${json.sessions.active}`);
            console.log(`   Active Licenses: ${json.licenses.active}`);
        } catch (error) {
            console.log('❌ Invalid JSON response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
});

req.on('timeout', () => {
    console.log('❌ Request timed out');
    req.destroy();
});

req.end();