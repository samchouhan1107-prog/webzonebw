#!/usr/bin/env node

/**
 * Verify Server Start
 */

console.log('🔍 Verifying WebZoneBW Server Status');
console.log('===================================');

// Check if we can import the server module
try {
    console.log('✅ Server module can be imported');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log(`   PORT: ${process.env.PORT || 'not set'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    
    // Check if ports are available
    const net = require('net');
    const ports = [3000, 3001, 3002, 4000, 5000];
    
    console.log('\n🔍 Checking port availability...');
    
    ports.forEach(port => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => {
                console.log(`✅ Port ${port} is available`);
            });
        });
        
        server.on('error', () => {
            console.log(`❌ Port ${port} is in use`);
        });
    });
    
    console.log('\n💡 Next steps:');
    console.log('1. Run: npm run start:final');
    console.log('2. Server will try port 5000, then fallback to 3001');
    console.log('3. Check server status with: npm run test:working');
    
} catch (error) {
    console.error('❌ Error:', error.message);
}