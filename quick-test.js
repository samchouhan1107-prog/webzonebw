/**
 * Quick Test Script for WebZoneBW ER Studio
 * Tests the basic endpoints to verify deployment status
 */

console.log('🧪 Quick Test - WebZoneBW ER Studio');
console.log('====================================');

// Test URLs
const testUrls = [
  { name: 'Health Check', url: 'https://webzonebw.onrender.com/api/health' },
  { name: 'PayPal Client ID', url: 'https://webzonebw.onrender.com/api/paypal/client-id' },
  { name: 'Order Email', url: 'https://webzonebw.onrender.com/api/order-email' },
  { name: 'ER Studio', url: 'https://webzonebw.onrender.com/er/' }
];

// Function to test a URL
async function testUrl(test) {
  console.log(`\n🔍 Testing ${test.name}...`);
  console.log(`URL: ${test.url}`);
  
  try {
    const response = await fetch(test.url, {
      method: 'GET',
      timeout: 10000
    });
    
    if (response.ok) {
      console.log(`✅ ${test.name}: OK (${response.status})`);
      
      // Try to get response text for non-binary responses
      try {
        const text = await response.text();
        if (text.length > 0 && text.length < 200) {
          console.log(`   Response: ${text.substring(0, 100)}...`);
        }
      } catch (e) {
        // Binary response or error
      }
      
      return true;
    } else {
      console.log(`❌ ${test.name}: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${test.name}: Error - ${error.message}`);
    return false;
  }
}

// Test webhook endpoint
async function testWebhook() {
  console.log('\n🔍 Testing Webhook Endpoint...');
  console.log('URL: https://webzonebw.onrender.com/api/paypal/webhook');
  
  try {
    const response = await fetch('https://webzonebw.onrender.com/api/paypal/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'quick-test' }),
      timeout: 10000
    });
    
    if (response.ok) {
      console.log('✅ Webhook Endpoint: OK');
      return true;
    } else {
      console.log(`❌ Webhook Endpoint: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Webhook Endpoint: Error - ${error.message}`);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('Starting quick tests...\n');
  
  const results = [];
  
  // Test URLs
  for (const test of testUrls) {
    const result = await testUrl(test);
    results.push({ name: test.name, result });
  }
  
  // Test webhook
  const webhookResult = await testWebhook();
  results.push({ name: 'Webhook Endpoint', result: webhookResult });
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('===============');
  
  const passed = results.filter(r => r.result).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total} tests`);
  
  results.forEach(result => {
    console.log(`${result.result ? '✅' : '❌'} ${result.name}`);
  });
  
  console.log('\n🎯 Next Steps:');
  console.log('=============');
  
  if (passed === total) {
    console.log('🎉 All tests passed! Server is running properly.');
    console.log('🚀 Ready for PayPal webhook configuration!');
    
    console.log('\n📋 PayPal Webhook Setup:');
    console.log('=====================');
    console.log('1. Go to: https://developer.paypal.com');
    console.log('2. Navigate to: Dashboard → Webhooks');
    console.log('3. Create webhook with URL:');
    console.log('   https://webzonebw.onrender.com/api/paypal/webhook');
    console.log('4. Select events: CHECKOUT.ORDER.COMPLETED, PAYMENT.CAPTURE.COMPLETED');
    console.log('5. Test with your PayPal link:');
    console.log('   https://www.paypal.com/ncp/payment/6PPYKEYGHDMNY');
    
  } else {
    console.log('⚠️  Some tests failed. Check the issues above.');
    console.log('🔧 Check Render Dashboard for deployment issues.');
  }
  
  console.log('\n🔗 Important Links:');
  console.log('==================');
  console.log('Render Dashboard: https://dashboard.render.com');
  console.log('ER Studio: https://webzonebw.onrender.com/er/');
  console.log('PayPal Developer: https://developer.paypal.com');
}

// Run the tests
runTests().catch(console.error);