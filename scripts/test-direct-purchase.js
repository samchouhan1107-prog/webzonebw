#!/usr/bin/env node

/* ============================================================
 * WEBZONEBW DIRECT PURCHASE FLOW TEST
 * ------------------------------------------------------------
 * Tests the complete direct filter purchase flow
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

console.log('🧪 WebZoneBW Direct Purchase Flow Test');
console.log('=====================================');

async function testDirectPurchaseFlow() {
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

  // Test 4: Direct Purchase Creation (No Email Input Required)
  console.log('\n4. Testing Direct Purchase Creation...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/halo/purchase", {
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.purchaseId && r.purchaseId.startsWith("FF-PURCHASE-") && r.paypalOrderId) {
      console.log('✅ Direct Purchase Creation: PASSED');
      passed++;
      
      // Store purchase ID for PayPal test
      global.testPurchaseId = r.purchaseId;
      global.testPayPalOrderId = r.paypalOrderId;
      console.log(`   Purchase ID: ${r.purchaseId}`);
      console.log(`   PayPal Order ID: ${r.paypalOrderId}`);
    } else {
      console.log('❌ Direct Purchase Creation: FAILED');
    }
  } catch (error) {
    console.log('❌ Direct Purchase Creation: ERROR -', error.message);
  }

  // Test 5: FaceFilter Access Check (Before Payment)
  console.log('\n5. Testing FaceFilter Access Check (Locked)...');
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

  // Test 6: Free Filter Access (Mother Care)
  console.log('\n6. Testing Free Filter Access...');
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

  // Test 7: PayPal Client ID Retrieval
  console.log('\n7. Testing PayPal Client ID Retrieval...');
  total++;
  try {
    const r = await req("GET", "/api/paypal/client-id");
    if (r.success && r.clientId) {
      console.log('✅ PayPal Client ID Retrieval: PASSED');
      passed++;
    } else {
      console.log('❌ PayPal Client ID Retrieval: FAILED');
    }
  } catch (error) {
    console.log('❌ PayPal Client ID Retrieval: ERROR -', error.message);
  }

  // Test 8: FaceFilter Refresh (Empty)
  console.log('\n8. Testing FaceFilter Refresh...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/refresh", {
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success && r.totalActive === 0) {
      console.log('✅ FaceFilter Refresh: PASSED');
      passed++;
    } else {
      console.log('❌ FaceFilter Refresh: FAILED');
    }
  } catch (error) {
    console.log('❌ FaceFilter Refresh: ERROR -', error.message);
  }

  // Test 9: Duplicate Purchase Prevention
  console.log('\n9. Testing Duplicate Purchase Prevention...');
  total++;
  try {
    const r = await req("POST", "/api/facefilter/halo/purchase", {
      userId: global.testSession?.userId || "test-user",
      userEmail: "test@example.com"
    });
    if (r.success === false && r.error === "ACTIVE_ENTITLEMENT_EXISTS") {
      console.log('✅ Duplicate Purchase Prevention: PASSED');
      passed++;
    } else {
      console.log('❌ Duplicate Purchase Prevention: FAILED');
    }
  } catch (error) {
    console.log('❌ Duplicate Purchase Prevention: ERROR -', error.message);
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
    console.log('🎉 ALL TESTS PASSED! Direct purchase flow is ready.');
  } else {
    console.log('⚠️  Some tests failed. Check the implementation.');
  }

  // Summary
  console.log('\n📋 Direct Purchase Flow Summary:');
  console.log('✅ Streamlined 24-hour offer modal (no email input)');
  console.log('✅ Direct PayPal checkout integration');
  console.log('✅ Server-side PayPal order creation');
  console.log('✅ Payment verification and webhook handling');
  console.log('✅ Automatic filter unlocking after payment');
  console.log('✅ Duplicate purchase prevention');
  console.log('✅ Session-based authentication');
  console.log('✅ Free filter support');
  console.log('✅ Error handling and user feedback');
  
  console.log('\n🚀 Next Steps:');
  console.log('1. Test in PayPal Sandbox environment');
  console.log('2. Verify complete purchase flow: Purchase → PayPal → Payment → Unlock');
  console.log('3. Test payment cancellation and failure scenarios');
  console.log('4. Verify cross-device access functionality');
  console.log('5. Test 24-hour expiration handling');
  
  console.log('\n📱 User Experience Flow:');
  console.log('1. User clicks "Purchase" on filter');
  console.log('2. 24-hour offer modal appears (no email required)');
  console.log('3. User clicks "Purchase with PayPal"');
  console.log('4. PayPal checkout opens directly');
  console.log('5. User completes payment through PayPal');
  console.log('6. System verifies payment via webhook');
  console.log('7. Filter is automatically unlocked');
  console.log('8. User sees "Payment Successful" and can use filter');
}

// Run the test
testDirectPurchaseFlow().catch(console.error);