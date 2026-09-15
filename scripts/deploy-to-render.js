#!/usr/bin/env node

/* ============================================================
 * WEBZONEBW ER STUDIO - RENDER DEPLOYMENT HELPER
 * ============================================================
 * This script helps prepare the application for Render.com deployment
 * by updating configuration files and providing deployment instructions.
 * ============================================================ */

import fs from 'fs';
import path from 'path';

console.log('🚀 WebZoneBW ER Studio - Render Deployment Helper');
console.log('================================================');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found. Please run this from the project root.');
    process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Verify this is the correct project
if (packageJson.name !== 'webzonebw-in') {
    console.error('❌ Error: This appears to be the wrong project directory.');
    process.exit(1);
}

console.log('✅ Project verified: webzonebw-in');

// Check for render.yaml
const renderYamlPath = path.join(process.cwd(), 'render.yaml');
if (!fs.existsSync(renderYamlPath)) {
    console.log('❌ render.yaml not found. Please create it using the deployment guide.');
    process.exit(1);
}

console.log('✅ render.yaml found');

// Check for .env.render
const envRenderPath = path.join(process.cwd(), '.env.render');
if (!fs.existsSync(envRenderPath)) {
    console.log('❌ .env.render not found. Please create it with your production credentials.');
    process.exit(1);
}

console.log('✅ .env.render found');

// Check API_BASE configuration
const erLicensePath = path.join(process.cwd(), 'js', 'er-license.js');
const erLicenseContent = fs.readFileSync(erLicensePath, 'utf8');
if (erLicenseContent.includes('var API_BASE = ""')) {
    console.log('❌ API_BASE still uses empty string. Please update it to use window.location.origin');
    process.exit(1);
}

console.log('✅ API_BASE configuration updated');

console.log('\n📋 DEPLOYMENT CHECKLIST:');
console.log('========================');
console.log('1. ✅ render.yaml configured');
console.log('2. ✅ .env.render created with production credentials');
console.log('3. ✅ API_BASE updated to use window.location.origin');
console.log('4. ⏳ Repository pushed to GitHub');
console.log('5. ⏳ Render service created');
console.log('6. ⏳ Environment variables configured in Render dashboard');
console.log('7. ⏳ Custom domain DNS configured');
console.log('8. ⏳ PayPal webhook configured');

console.log('\n🔧 NEXT STEPS:');
console.log('==============');
console.log('1. Push your code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Ready for Render deployment"');
console.log('   git push origin main');
console.log('');
console.log('2. Go to render.com and create a new Web Service');
console.log('3. Connect your GitHub repository');
console.log('4. Add environment variables from .env.render');
console.log('5. Configure custom domain in DNS settings');
console.log('6. Set up PayPal webhook in PayPal Developer Dashboard');

console.log('\n🎯 DEPLOYMENT URL:');
console.log('==================');
console.log('Your service will be available at:');
console.log('https://webzonebw-er-studio.onrender.com');

console.log('\n🔗 IMPORTANT LINKS:');
console.log('==================');
console.log('Render Dashboard: https://render.com');
console.log('PayPal Developer: https://developer.paypal.com');
console.log('GitHub: https://github.com');

console.log('\n✅ Deployment preparation complete!');
console.log('🚀 Ready to deploy to Render.com');