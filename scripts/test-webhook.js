#!/usr/bin/env node

/**
 * WebZoneBW ER Studio - PayPal Webhook Test Script
 * 
 * This script tests the PayPal webhook endpoint and verifies the configuration.
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 WebZoneBW ER Studio - PayPal Webhook Test');
console.log('==============================================');

// Configuration
const config = {
  webhookUrl: 'https://webzonebw.onrender.com/api/paypal/webhook',
  testPaymentUrl: 'https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY',
  expectedEvents: ['CHECKOUT.ORDER.COMPLETED', 'PAYMENT.CAPTURE.COMPLETED']
};

// Test webhook endpoint availability
async function testWebhookEndpoint() {
  console.log('🔍 Testing webhook endpoint availability...');
  
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'webhook-connection' })
    });
    
    if (response.ok) {
      console.log('✅ Webhook endpoint is accessible');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.log(`❌ Webhook endpoint returned: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing webhook endpoint: ${error.message}`);
    return false;
  }
}

// Test PayPal client ID endpoint
async function testPaypalClient() {
  console.log('🔍 Testing PayPal client ID endpoint...');
  
  try {
    const response = await fetch('https://webzonebw.onrender.com/api/paypal/client-id');
    
    if (response.ok) {
      const data = await response.json();
      if (data.clientId && data.clientId.startsWith('A')) {
        console.log('✅ PayPal client ID endpoint is working');
        console.log(`   Client ID: ${data.clientId.substring(0, 10)}...`);
        return true;
      } else {
        console.log('❌ PayPal client ID endpoint returned invalid data');
        return false;
      }
    } else {
      console.log(`❌ PayPal client ID endpoint returned: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing PayPal client ID: ${error.message}`);
    return false;
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint...');
  
  try {
    const response = await fetch('https://webzonebw.onrender.com/api/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Health endpoint is working');
      console.log(`   Status: ${data.status}`);
      return true;
    } else {
      console.log(`❌ Health endpoint returned: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing health endpoint: ${error.message}`);
    return false;
  }
}

// Generate test webhook payload
function generateTestWebhookPayload() {
  console.log('📝 Generating test webhook payload...');
  
  const payload = {
    event_type: 'CHECKOUT.ORDER.COMPLETED',
    resource: {
      id: '6PPYKEYGHDMNY',
      status: 'COMPLETED',
      payer: {
        email_address: 'test@example.com',
        name: {
          given_name: 'Test',
          surname: 'User'
        }
      },
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '5.99'
          }
        }
      ]
    },
    links: [
      {
        href: 'https://api.paypal.com/v2/checkout/orders/6PPYKEYGHDMNY',
        rel: 'self',
        method: 'GET'
      }
    ]
  };
  
  console.log('✅ Test payload generated');
  return payload;
}

// Test webhook with sample payload
async function testWebhookWithPayload() {
  console.log('🧪 Testing webhook with sample payload...');
  
  const payload = generateTestWebhookPayload();
  
  try {
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Auth-Algo': 'PayPal',
        'PayPal-Auth-Assertion': 'test-signature',
        'PayPal-Transmission-Id': 'test-transmission-id',
        'PayPal-Cert-Url': 'https://api.paypal.com/v1/notifications/certificates'
      },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('✅ Webhook test payload sent successfully');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return true;
    } else {
      console.log(`❌ Webhook test payload returned: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Response: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error testing webhook payload: ${error.message}`);
    return false;
  }
}

// Check server logs for webhook activity
async function checkServerLogs() {
  console.log('📋 Checking server logs for webhook activity...');
  
  // Note: This is a placeholder - actual log checking would require Render API access
  console.log('ℹ️  Server logs can be checked in Render Dashboard:');
  console.log('   https://dashboard.render.com/webzonebw-er-studio/logs');
  console.log('   Look for: POST /api/paypal/webhook entries');
}

// Generate test instructions
function generateTestInstructions() {
  console.log('\n📋 Manual Testing Instructions:');
  console.log('===============================');
  
  console.log('1. Test PayPal Payment Flow:');
  console.log('   URL: https://webzonebw.onrender.com/er/');
  console.log('   Action: Click "₹499 Upgrade" or "$5.99 Upgrade"');
  console.log('   Expected: PayPal modal opens, payment completes, license activates');
  
  console.log('\n2. Test Your PayPal Payment Link:');
  console.log('   URL: https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY');
  console.log('   Action: Complete payment (use test mode if available)');
  console.log('   Expected: Server receives webhook, license activates');
  
  console.log('\n3. Monitor Server Logs:');
  console.log('   Go to: https://dashboard.render.com/webzonebw-er-studio/logs');
  console.log('   Look for: POST /api/paypal/webhook entries');
  
  console.log('\n4. Check License Activation:');
  console.log('   After payment, verify premium filters are unlocked');
  console.log('   Check browser localStorage for license data');
}

// Main test function
async function main() {
  console.log('Starting webhook tests...\n');
  
  const tests = [
    { name: 'Health Endpoint', test: testHealthEndpoint },
    { name: 'PayPal Client ID', test: testPaypalClient },
    { name: 'Webhook Endpoint', test: testWebhookEndpoint },
    { name: 'Webhook Payload', test: testWebhookWithPayload }
  ];
  
  const results = [];
  
  for (const { name, test } of tests) {
    console.log(`\n--- Testing ${name} ---`);
    const result = await test();
    results.push({ name, result });
    
    if (result) {
      console.log(`✅ ${name} test passed`);
    } else {
      console.log(`❌ ${name} test failed`);
    }
  }
  
  // Check server logs
  await checkServerLogs();
  
  // Generate test instructions
  generateTestInstructions();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('===============');
  
  const passed = results.filter(r => r.result).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Webhook configuration looks good.');
    console.log('🚀 Ready for PayPal payment testing!');
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
    console.log('🔧 Fix the issues and run tests again.');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('=============');
  console.log('1. Configure webhook in PayPal Developer Dashboard');
  console.log('2. Test with your PayPal payment link');
  console.log('3. Monitor server logs for webhook receipt');
  console.log('4. Test complete payment flow from ER Studio');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { config, testWebhookEndpoint, testPaypalClient, testHealthEndpoint, testWebhookWithPayload };