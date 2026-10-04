/* =====================================================
   WEBZONEBW SERVER - MANUAL ROUTING CONFLICTS FIX
   ===================================================== */

const fs = require('fs');
const path = require('path');

console.log('🔍 Manually fixing routing conflicts in server.js...');

const serverPath = path.join(__dirname, '..', 'server.js');
const backupPath = path.join(__dirname, '..', 'server.js.backup');

// Read the file
const content = fs.readFileSync(serverPath, 'utf-8');
const lines = content.split('\n');

// Find and remove the duplicate PayPal webhook handler (lines 1581-1607)
let fixedLines = [];
let removingWebhook2 = false;
let removingLicense2 = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Remove the second PayPal webhook handler (lines 1581-1607)
    if (line.includes('app.post("/api/paypal/webhook"') && i > 1500) {
        removingWebhook2 = true;
        console.log('🗑️  Removing duplicate PayPal webhook handler starting at line', i + 1);
        continue;
    }
    
    if (removingWebhook2) {
        if (line.includes('});')) {
            removingWebhook2 = false;
            continue;
        }
        continue;
    }
    
    // Remove the second license verification handler (lines 1894-1952)
    if (line.includes('app.post("/api/license/verify"') && i > 1800) {
        removingLicense2 = true;
        console.log('🗑️  Removing duplicate license verification handler starting at line', i + 1);
        continue;
    }
    
    if (removingLicense2) {
        if (line.includes('});')) {
            removingLicense2 = false;
            continue;
        }
        continue;
    }
    
    fixedLines.push(line);
}

// Write the fixed content
fs.writeFileSync(serverPath, fixedLines.join('\n'));

console.log('✅ Manual routing conflicts fix completed!');

// Verify the fixes
const fixedContent = fs.readFileSync(serverPath, 'utf-8');
const webhookHandlers = (fixedContent.match(/app\.post\("\/api\/paypal\/webhook"/g) || []).length;
const licenseVerifications = (fixedContent.match(/app\.post\("\/api\/license\/verify"/g) || []).length;
const healthChecks = (fixedContent.match(/app\.get\("\/api\/health"/g) || []).length;

console.log(`\n🔍 Verification results:`);
console.log(`   - PayPal webhook handlers: ${webhookHandlers} (should be 1)`);
console.log(`   - License verification endpoints: ${licenseVerifications} (should be 1)`);
console.log(`   - Health check endpoints: ${healthChecks} (should be 1)`);

if (webhookHandlers === 1 && licenseVerifications === 1 && healthChecks === 1) {
    console.log('🎉 All routing conflicts resolved successfully!');
} else {
    console.log('⚠️  Some conflicts may remain. Please review manually.');
}

console.log('\n📝 Next steps:');
console.log('   1. Test the PayPal webhook functionality');
console.log('   2. Verify license verification works correctly');
console.log('   3. Check that health monitoring is working');
console.log('   4. Monitor server logs for any issues');