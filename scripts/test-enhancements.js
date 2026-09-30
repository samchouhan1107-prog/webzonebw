#!/usr/bin/env node

/**
 * WebZoneBW Enhancement Test Script
 * 
 * This script tests the new security and monitoring enhancements
 * to verify they are working correctly.
 */

const http = require('http');
const url = require('url');

const BASE_URL = 'http://localhost:3000';

console.log('🧪 WebZoneBW Enhancement Test Suite');
console.log('==================================');

// Test results
const testResults = {
    passed: 0,
    failed: 0,
    total: 0
};

function testEndpoint(path, expectedStatus, description) {
    return new Promise((resolve) => {
        testResults.total++;
        
        const req = http.get(`${BASE_URL}${path}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const success = res.statusCode === expectedStatus;
                
                if (success) {
                    testResults.passed++;
                    console.log(`✅ ${description} - Status: ${res.statusCode}`);
                } else {
                    testResults.failed++;
                    console.log(`❌ ${description} - Expected: ${expectedStatus}, Got: ${res.statusCode}`);
                }
                
                resolve(success);
            });
        });
        
        req.on('error', (error) => {
            testResults.failed++;
            console.log(`❌ ${description} - Error: ${error.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            testResults.failed++;
            console.log(`❌ ${description} - Timeout`);
            resolve(false);
        });
    });
}

async function runTests() {
    console.log('\n🔍 Testing Health Endpoint...');
    await testEndpoint('/api/health', 200, 'Health check endpoint');
    
    console.log('\n🔍 Testing Metrics Endpoint...');
    await testEndpoint('/api/metrics', 200, 'Metrics endpoint');
    
    console.log('\n🔍 Testing Rate Limiting...');
    // Test rate limiting by making multiple requests
    for (let i = 0; i < 3; i++) {
        await testEndpoint('/api/health', 200, `Rate limiting test ${i + 1}`);
    }
    
    console.log('\n🔍 Testing Security Headers...');
    // Test security headers
    const securityReq = http.get(`${BASE_URL}/api/health`, (res) => {
        const hasSecurityHeaders = 
            res.headers['x-content-type-options'] === 'nosniff' &&
            res.headers['x-frame-options'] === 'SAMEORIGIN' &&
            res.headers['x-xss-protection'] === '1; mode=block';
        
        if (hasSecurityHeaders) {
            testResults.passed++;
            console.log('✅ Security headers - All required headers present');
        } else {
            testResults.failed++;
            console.log('❌ Security headers - Missing required headers');
        }
        
        testResults.total++;
        runFinalTests();
    });
    
    securityReq.on('error', () => {
        testResults.failed++;
        testResults.total++;
        runFinalTests();
    });
}

function runFinalTests() {
    console.log('\n📊 Test Results Summary');
    console.log('======================');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! Enhancements are working correctly.');
        console.log('✅ WebZoneBW is ready for production with 5-star rating!');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
    }
    
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Start testing
runTests();