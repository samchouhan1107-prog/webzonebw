import fs from 'fs';
import path from 'path';

// Read the server.js file
const serverPath = path.join(process.cwd(), 'server.js');
const content = fs.readFileSync(serverPath, 'utf8');

// Check for security headers
const securityChecks = {
    'HTTPS Redirect': content.includes('req.protocol === \'https\''),
    'Content Security Policy': content.includes('contentSecurityPolicy'),
    'X-Content-Type-Options': content.includes('X-Content-Type-Options'),
    'X-Frame-Options': content.includes('X-Frame-Options'),
    'X-XSS-Protection': content.includes('X-XSS-Protection'),
    'Strict-Transport-Security': content.includes('Strict-Transport-Security'),
    'Permissions-Policy': content.includes('Permissions-Policy'),
    'Input Validation': content.includes('sanitizeInput'),
    'SQL Injection Protection': content.includes('sqlInjectionPatterns'),
    'Directory Traversal Protection': content.includes('directory traversal'),
    'Rate Limiting': content.includes('rateLimiter'),
    'Helmet Security': content.includes('helmet'),
    'Security Audit Endpoint': content.includes('security-audit'),
    'Security Logging': content.includes('logSecurityError')
};

console.log('=== WEBZONEBW SECURITY AUDIT REPORT ===');
console.log('Generated:', new Date().toISOString());
console.log('');

console.log('✅ SECURITY FEATURES IMPLEMENTED:');
Object.entries(securityChecks).forEach(([feature, implemented]) => {
    const status = implemented ? '✅ IMPLEMENTED' : '❌ MISSING';
    console.log(`  ${feature}: ${status}`);
});

console.log('');
console.log('📊 SUMMARY:');
const implemented = Object.values(securityChecks).filter(Boolean).length;
const total = Object.keys(securityChecks).length;
const percentage = Math.round((implemented / total) * 100);

console.log(`  Security Score: ${implemented}/${total} (${percentage}%)`);
console.log(`  Status: ${percentage >= 80 ? 'EXCELLENT' : percentage >= 60 ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);