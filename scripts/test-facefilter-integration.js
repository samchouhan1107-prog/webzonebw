#!/usr/bin/env node

/**
 * WebZoneBW FaceFilter 24-Hour Integration Test
 * 
 * This script tests the complete integration between PayPal payments
 * and FaceFilter 24-hour access entitlements.
 */

const http = require('http');

const BASE_URL = process.env.BASE || "http://localhost:3000";

function req(method, path, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        ...(data
          ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
          : {}),
        ...headers,
      },
    };
    const r = http.request(options, (res) => {
      let raw = "";
      res.on("data", (c) => (raw += c));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: raw }));
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

function check(name, cond, detail) {
  console.log(`${cond ? "✅ PASS" : "❌ FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!cond) process.exitCode = 1;
}

async function testFaceFilterIntegration() {
  console.log('🧪 WebZoneBW FaceFilter 24-Hour Integration Test');
  console.log('=================================================');

  // Test 1: Health Check
  console.log('\n1. Testing API Health...');
  let r = await req("GET", "/api/health");
  check("API Health endpoint returns 200", r.status === 200, `status=${r.status}`);

  // Test 2: FaceFilter Offer Retrieval
  console.log('\n2. Testing FaceFilter Offer Retrieval...');
  r = await req("GET", "/api/facefilter/halo/offer");
  check("Halo filter offer returns 200", r.status === 200, `status=${r.status}`);
  
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    check("Offer data structure valid", data.success && data.offer && data.offer.price === 99, `price=${data.offer?.price}`);
    check("Refund policy present", !!data.refundPolicy, "refund policy missing");
  }

  // Test 3: FaceFilter Purchase Creation
  console.log('\n3. Testing FaceFilter Purchase Creation...');
  r = await req("POST", "/api/facefilter/halo/purchase", {
    body: { userEmail: "test@example.com" }
  });
  check("Purchase creation returns 200", r.status === 200, `status=${r.status}`);
  
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    check("Purchase ID generated", data.success && data.purchaseId, `purchaseId=${data.purchaseId}`);
    check("Purchase ID has correct prefix", data.purchaseId?.startsWith("FF-PURCHASE-"), `invalid prefix`);
  }

  // Test 4: FaceFilter Access Verification
  console.log('\n4. Testing FaceFilter Access Verification...');
  r = await req("POST", "/api/facefilter/verify", {
    body: { filterId: "halo", userEmail: "test@example.com" }
  });
  check("Access verification returns 200", r.status === 200, `status=${r.status}`);
  
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    check("Access status returned", data.success && data.hasAccess !== undefined, `hasAccess=${data.hasAccess}`);
    check("Proper status message", !!data.message, "message missing");
  }

  // Test 5: Entitlements Retrieval
  console.log('\n5. Testing Entitlements Retrieval...');
  r = await req("GET", "/api/facefilter/entitlements?userEmail=test@example.com");
  check("Entitlements endpoint returns 200", r.status === 200, `status=${r.status}`);
  
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    check("Entitlements structure valid", data.success && Array.isArray(data.entitlements), "invalid structure");
  }

  // Test 6: Invalid Filter Handling
  console.log('\n6. Testing Invalid Filter Handling...');
  r = await req("GET", "/api/facefilter/invalid-filter/offer");
  check("Invalid filter returns 404", r.status === 404, `status=${r.status}`);

  // Test 7: Missing Parameters
  console.log('\n7. Testing Missing Parameters...');
  r = await req("POST", "/api/facefilter/halo/purchase", {
    body: {} // Missing required fields
  });
  check("Missing parameters returns 400", r.status === 400, `status=${r.status}`);

  // Test 8: PayPal Client ID (should work if configured)
  console.log('\n8. Testing PayPal Configuration...');
  r = await req("GET", "/api/paypal/client-id");
  if (r.status === 200) {
    const data = JSON.parse(r.body);
    check("PayPal client ID available", data.success && data.clientId, "PayPal not configured");
  } else {
    console.log("⚠️  PayPal not configured - skipping PayPal tests");
  }

  console.log('\n=================================================');
  console.log('Integration Test Complete');
  
  if (process.exitCode === 0) {
    console.log('🎉 All tests passed! FaceFilter integration is ready.');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
  }
}

// Run the tests
testFaceFilterIntegration().catch(error => {
  console.error('Test execution failed:', error.message);
  process.exit(1);
});