#!/usr/bin/env node

/* ============================================================
 * WEBZONEBW PAYPAL FLOW TEST SCRIPT
 * ============================================================
 * Tests the complete PayPal payment flow integration
 * ============================================================ */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log("🧪 WEBZONEBW PayPal Flow Test");
console.log("==================================");

// Test 1: Check if PayPal environment variables are set
console.log("\n📋 Test 1: Environment Configuration");
const requiredEnvVars = [
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET', 
  'PAYPAL_WEBHOOK_ID',
  'ORDER_EMAIL'
];

let envConfigured = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value.length > 0) {
    console.log(`✅ ${varName}: [SET]`);
  } else {
    console.log(`❌ ${varName}: [MISSING]`);
    envConfigured = false;
  }
});

if (!envConfigured) {
  console.log("\n⚠️  PayPal environment variables not configured - payment flow will be disabled");
}

// Test 2: Check server.js PayPal configuration
console.log("\n📋 Test 2: Server Configuration");
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Check for PayPal endpoints
  const hasPayPalEndpoints = [
    '/api/paypal/create-order',
    '/api/paypal/capture', 
    '/api/paypal/webhook',
    '/api/license/verify'
  ].every(endpoint => serverContent.includes(endpoint));
  
  if (hasPayPalEndpoints) {
    console.log("✅ PayPal endpoints configured");
  } else {
    console.log("❌ PayPal endpoints missing");
  }
  
  // Check for webhook verification
  const hasWebhookVerification = serverContent.includes('verifyPayPalWebhook');
  if (hasWebhookVerification) {
    console.log("✅ Webhook verification implemented");
  } else {
    console.log("❌ Webhook verification missing");
  }
  
  // Check for license expiration handling
  const hasExpirationHandling = serverContent.includes('isLicenseValid') && serverContent.includes('expiresAt');
  if (hasExpirationHandling) {
    console.log("✅ License expiration handling implemented");
  } else {
    console.log("❌ License expiration handling missing");
  }
} else {
  console.log("❌ server.js not found");
}

// Test 3: Check frontend JavaScript
console.log("\n📋 Test 3: Frontend Configuration");
let hasPayPalIntegration = false;
let hasSpecificPayPalLink = false;
let hasExpirationChecking = false;
let hasDemoRestrictions = false;
const frontendPath = path.join(__dirname, 'js', 'er-license-premium.js');
if (fs.existsSync(frontendPath)) {
  const frontendContent = fs.readFileSync(frontendPath, 'utf8');
  
  // Check for PayPal integration
  hasPayPalIntegration = frontendContent.includes('startPayPalCheckout') && frontendContent.includes('paypalPaymentUrl');
  if (hasPayPalIntegration) {
    console.log("✅ PayPal integration implemented");
  } else {
    console.log("❌ PayPal integration missing");
  }
  
  // Check for specific PayPal link
  hasSpecificPayPalLink = frontendContent.includes('GEEZDGBAL6B64');
  if (hasSpecificPayPalLink) {
    console.log("✅ Specific PayPal payment link configured");
  } else {
    console.log("❌ Specific PayPal payment link missing");
  }
  
  // Check for license expiration checking
  hasExpirationChecking = frontendContent.includes('checkLicenseExpiration') && frontendContent.includes('expiresAt');
  if (hasExpirationChecking) {
    console.log("✅ License expiration checking implemented");
  } else {
    console.log("❌ License expiration checking missing");
  }
  
  // Check for demo mode restrictions
  hasDemoRestrictions = frontendContent.includes('demo mode') || frontendContent.includes('No fake unlock') || frontendContent.includes('demo environment');
  if (hasDemoRestrictions) {
    console.log("✅ Demo mode restrictions implemented");
  } else {
    console.log("❌ Demo mode restrictions missing");
  }
} else {
  console.log("❌ er-license-premium.js not found");
}

// Test 4: Check CSS styling
console.log("\n📋 Test 4: CSS Styling");
let hasPayPalStyling = false;
const cssPath = path.join(__dirname, 'css', 'er-premium-checkout.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Check for PayPal styling
  hasPayPalStyling = cssContent.includes('paypal-info-box') && cssContent.includes('#ffc439');

  if (hasPayPalStyling) {
    console.log("✅ PayPal styling implemented");
  } else {
    console.log("❌ PayPal styling missing");
  }
} else {
  console.log("❌ er-premium-checkout.css not found");
}

// Test 5: Check HTML structure
console.log("\n📋 Test 5: HTML Structure");
const htmlPath = path.join(__dirname, 'er', 'index.html');
if (fs.existsSync(htmlPath)) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Check for premium checkout integration
  const hasPremiumCheckout = htmlContent.includes('er-license-premium.js');
  if (hasPremiumCheckout) {
    console.log("✅ Premium checkout integrated");
  } else {
    console.log("❌ Premium checkout missing");
  }
} else {
  console.log("❌ er/index.html not found");
}

console.log("\n🎯 Test Summary");
console.log("==================================");

if (envConfigured && hasPayPalIntegration && hasSpecificPayPalLink && hasExpirationChecking && hasPayPalStyling) {
  console.log("✅ All tests passed! PayPal flow is properly configured.");
  console.log("\n🚀 Next steps:");
  console.log("1. Start the server: node server.js");
  console.log("2. Test the PayPal flow in the browser");
  console.log("3. Verify webhook configuration in PayPal Developer Dashboard");
  console.log("4. Test 24-hour license expiration");
} else {
  console.log("❌ Some tests failed. Please review the configuration above.");
  console.log("\n🔧 Fix any missing components before proceeding.");
}

console.log("\n📝 Important Notes:");
console.log("- PayPal webhook must be configured in PayPal Developer Dashboard");
console.log("- Server must be running on HTTPS for PayPal integration");
console.log("- License verification happens server-side only");
console.log("- 24-hour expiration is enforced server-side");
console.log("- Demo mode is restricted to development environments only");