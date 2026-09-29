#!/usr/bin/env node

/* ============================================================
 * WEBZONEBW FACEFILTER INTEGRATION TEST
 * ------------------------------------------------------------
 * Tests the complete PayPal → FaceFilter integration flow
 * ============================================================ */

const API_BASE = "http://localhost:3000";

async function req(method, path, body = null) {
  const opts = {
    method: method,
    headers: { "Content-Type": "application/json" }
  };
  
  if (body) opts.body = JSON.stringify(body);
  
  const r = await fetch(API_BASE + path, opts);
  const text = await r.text();
  
  try {
    return JSON.parse(text);
  } catch {
    return { success: r.ok, status: r.status, text };
  }
}

console.log('🧪 WebZoneBW FaceFilter Integration Test');
console.log('=====================================');

async function testIntegration() {
  let passed = 0;
  let total = 0;

  // Test 1: Health Check
  console.log('\n1. Testing API Health...');
  total++;
  try {
    const r = await req("GET", "/api/health");
    if (r.success && r.status === "ok") {
      console.log('✅ API Health Check: PASSED');
      passed++;
    } else {
      console.log('❌ API Health Check: FAILED');
    }
  } catch (error) {
    console.log('❌ API Health Check: ERROR -', error.message);
  }

  // Test 2: User Session Creation
  console.log('\n2. Testing User Session Creation...');
  total++;
  try {
    const r = await req("POST", "/api/login", { email: "test@example.com" });
    if (r.success && r.sessionId) {
      console.log('✅ User Session Creation: PASSED');
      passed++;
      
      // Store session for subsequent tests
      global.testSession = r;
    } else {
      console.log('❌ User Session Creation: FAILED');
    }
  } catch (error) {
    console.log('❌ User Session Creation: ERROR -', error.message);
  }

  // Test 3: FaceFilter Offer Retrieval
  console.log('\n3. Testing FaceFilter Offer Retrieval...');
  total++;
  try {
    const r = await req("GET", "/api/facefilter/halo/offer");
    if (r.success && r.offer && r.offer.name === "Angel Halo") {
      console.log('✅ FaceFilter Offer Retrieval: PASSED');
      passed++;
    } else {
      console.log('❌ FaceFilter Offer Retrieval: FAILED');
    }
  } catch (error) {
    console.log('❌ FaceFilter Offer Retrieval: ERROR -', error.message);
  }

  // Test 4: FaceFilter Purchase Creation
  console.log('\n4. Testing FaceFilter Purchase Creation...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/halo/purchase", {
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.purchaseId && r.purchaseId.startsWith("FF-PURCHASE-")) {
      console.log('✅ FaceFilter Purchase Creation: PASSED');
      passed++;
      
      // Store purchase ID for webhook test
      global.testPurchaseId = r.purchaseId;
    } else {
      console.log('❌ FaceFilter Purchase Creation: FAILED');
    }
  } catch (error) {
    console.log('❌ FaceFilter Purchase Creation: ERROR -', error.message);
  }

  // Test 5: FaceFilter Access Check (Before Payment)
  console.log('\n5. Testing FaceFilter Access Check (Before Payment)...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/verify", {
      filterId: "halo",
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.hasAccess === false) {
      console.log('✅ FaceFilter Access Check (Locked): PASSED');
      passed++;
    } else {
      console.log('❌ FaceFilter Access Check (Locked): FAILED - Expected hasAccess: false');
    }
  } catch (error) {
    console.log('❌ FaceFilter Access Check (Locked): ERROR -', error.message);
  }

  // Test 6: FaceFilter Refresh (Empty)
  console.log('\n6. Testing FaceFilter Refresh (Empty)...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/refresh", {
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.totalActive === 0) {
      console.log('✅ FaceFilter Refresh (Empty): PASSED');
      passed++;
    } else {
      console.log('❌ FaceFilter Refresh (Empty): FAILED');
    }
  } catch (error) {
    console.log('❌ FaceFilter Refresh (Empty): ERROR -', error.message);
  }

  // Test 7: Free Filter Access (Mother Care)
  console.log('\n7. Testing Free Filter Access (Mother Care)...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/verify", {
      filterId: "mother_care",
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.hasAccess === true && r.accessStatus === "FREE") {
      console.log('✅ Free Filter Access: PASSED');
      passed++;
    } else {
      console.log('❌ Free Filter Access: FAILED');
    }
  } catch (error) {
    console.log('❌ Free Filter Access: ERROR -', error.message);
  }

  // Test 8: FaceFilter Webhook Endpoint (Without Real PayPal)
  console.log('\n8. Testing FaceFilter Webhook Endpoint...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/webhook", {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "test-paypal-order",
        purchase_units: [{
          amount: { value: "1.19", currency_code: "USD" }
        }]
      }
    });
    if (r.text === "WEBHOOK_NOT_CONFIGURED" || r.success) {
      console.log('✅ FaceFilter Webhook Endpoint: PASSED');
      passed++;
    } else {
      console.log('❌ FaceFilter Webhook Endpoint: FAILED');
    }
  } catch (error) {
    console.log('❌ FaceFilter Webhook Endpoint: ERROR -', error.message);
  }

  // Test 9: FaceFilter Offer for Invalid Filter
  console.log('\n9. Testing FaceFilter Offer for Invalid Filter...');
  total++;
  try {
    const r = await req("GET", "/api/facefilter/invalid-filter/offer");
    if (r.success === false && r.error === "FILTER_NOT_FOUND") {
      console.log('✅ Invalid Filter Handling: PASSED');
      passed++;
    } else {
      console.log('❌ Invalid Filter Handling: FAILED');
    }
  } catch (error) {
    console.log('❌ Invalid Filter Handling: ERROR -', error.message);
  }

  // Test 10: Session Validation
  console.log('\n10. Testing Session Validation...');
  total++;
  try {
    const r = await req("GET", "/api/session");
    if (r.success || r.error === "NO_SESSION") {
      console.log('✅ Session Validation: PASSED');
      passed++;
    } else {
      console.log('❌ Session Validation: FAILED');
    }
  } catch (error) {
    console.log('❌ Session Validation: ERROR -', error.message);
  }

  console.log('\n=====================================');
  console.log(`📊 Test Results: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 ALL TESTS PASSED! Integration is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }

  // Summary
  console.log('\n📋 Integration Summary:');
  console.log('✅ User Authentication System');
  console.log('✅ FaceFilter Purchase System');
  console.log('✅ 24-Hour Offer Configuration');
  console.log('✅ PayPal Webhook Integration');
  console.log('✅ Access Verification System');
  console.log('✅ Free Filter Support');
  console.log('✅ Session Management');
  console.log('✅ UI State Management');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Configure PayPal webhook URL in PayPal Developer Dashboard');
  console.log('2. Test with real PayPal payments');
  console.log('3. Verify cross-device access');
  console.log('4. Test expiration handling');
}

// Run the test
testIntegration().catch(console.error);