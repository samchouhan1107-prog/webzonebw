/* =====================================================
   WEBZONEBW SERVER - ROUTING CONFLICTS FIX
   ===================================================== */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing routing conflicts in server.js...');

const serverPath = path.join(__dirname, '..', 'server.js');
const backupPath = path.join(__dirname, '..', 'server.js.backup');

// Create backup
if (fs.existsSync(serverPath)) {
    fs.copyFileSync(serverPath, backupPath);
    console.log('✅ Backup created: server.js.backup');
}

// Read the file
const content = fs.readFileSync(serverPath, 'utf-8');

// Fix 1: Remove duplicate PayPal webhook handler (keep the enhanced one)
const lines = content.split('\n');
const fixedLines = [];
let skipLines = false;
let webhookHandlerCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Count PayPal webhook handlers
    if (line.includes('app.post("/api/paypal/webhook"')) {
        webhookHandlerCount++;
        
        // Keep only the first (enhanced) handler, skip the second (backup) one
        if (webhookHandlerCount === 1) {
            fixedLines.push(line);
            // Add the enhanced handler content
            while (i < lines.length && !lines[i].includes('});')) {
                i++;
                if (i < lines.length) {
                    fixedLines.push(lines[i]);
                }
            }
        } else {
            // Skip the duplicate handler
            while (i < lines.length && !lines[i].includes('});')) {
                i++;
            }
            continue;
        }
    } 
    // Fix 2: Remove duplicate license verification handler (keep the enhanced one)
    else if (line.includes('app.post("/api/license/verify"') && line.includes('const { licenseKey, promoKey }')) {
        // Skip this duplicate, we'll keep the first one
        while (i < lines.length && !lines[i].includes('});')) {
            i++;
        }
        continue;
    }
    // Fix 3: Remove duplicate health check (keep the first one)
    else if (line.includes('app.get("/api/health"') && i > 2800) {
        // Skip the duplicate health check at the end
        continue;
    }
    else {
        fixedLines.push(line);
    }
}

// Write the fixed content
fs.writeFileSync(serverPath, fixedLines.join('\n'));

console.log('✅ Routing conflicts fixed!');
console.log('📊 Summary of fixes:');
console.log('   - Removed duplicate PayPal webhook handler (kept enhanced version)');
console.log('   - Removed duplicate license verification endpoint');
console.log('   - Removed duplicate health check endpoint');

// Verify the fixes
const fixedContent = fs.readFileSync(serverPath, 'utf-8');
const webhookHandlers = (fixedContent.match(/app\.post\("\/api\/\/paypal\/webhook"/g) || []).length;
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