#!/usr/bin/env node

/**
 * Test Endpoint Script
 */

const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/health',
    method: 'GET',
    timeout: 5000
};

const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log(`✅ Health endpoint response:`);
        console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
});

req.on('error', (error) => {
    console.log(`❌ Error connecting to endpoint: ${error.message}`);
});

req.on('timeout', () => {
    console.log('❌ Request timed out');
    req.destroy();
});

req.end();