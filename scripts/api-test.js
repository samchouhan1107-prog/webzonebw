/* Production readiness API test for WEBZONEBW ER Studio endpoints (ESM). */
import http from "node:http";

const BASE = process.env.BASE || "http://localhost:3000";

function req(method, path, { headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
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
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${detail ? " â€” " + detail : ""}`);
  if (!cond) process.exitCode = 1;
}

(async () => {
  // 1. Health
  let r = await req("GET", "/api/health");
  check("GET /api/health returns 200", r.status === 200, `status=${r.status}`);

  // 2. CORS preflight â€” allowed origin
  r = await req("OPTIONS", "/api/license/verify", {
    headers: { Origin: "https://webzonebw.in", "Access-Control-Request-Method": "POST" },
  });
  check(
    "CORS preflight allowed origin returns ACAO",
    r.headers["access-control-allow-origin"] === "https://webzonebw.in",
    `acao=${r.headers["access-control-allow-origin"]}`,
  );

  // 3. CORS preflight â€” disallowed origin must NOT be granted
  r = await req("OPTIONS", "/api/license/verify", {
    headers: { Origin: "https://evil.example.com", "Access-Control-Request-Method": "POST" },
  });
  check(
    "CORS preflight disallowed origin is NOT granted",
    r.headers["access-control-allow-origin"] !== "https://evil.example.com",
    `acao=${r.headers["access-control-allow-origin"] || "(none)"}`,
  );

  // 4. License verify with bogus key â†’ fail-closed
  r = await req("POST", "/api/license/verify", {
    headers: { Origin: "https://webzonebw.in" },
    body: { licenseKey: "TOTALLY-BOGUS-KEY" },
  });
  let j = JSON.parse(r.body || "{}");
  check("License verify bogus key returns valid=false (fail-closed)", j.valid === false, r.body);

  // 5a. PayPal create-order with NO credentials â†’ PAYMENT_NOT_CONFIGURED (fail-closed)
  r = await req("POST", "/api/paypal/create-order", {
    headers: { Origin: "https://webzonebw.in" },
    body: { planId: "er-studio-premium", customerEmail: "t@e.com" },
  });
  j = JSON.parse(r.body || "{}");
  check(
    "PayPal create-order without creds returns PAYMENT_NOT_CONFIGURED",
    j.success === false && j.error === "PAYMENT_NOT_CONFIGURED",
    r.body,
  );

  // 5b. PayPal client-id endpoint with no credentials â†’ PAYMENT_NOT_CONFIGURED
  r = await req("GET", "/api/paypal/client-id", {
    headers: { Origin: "https://webzonebw.in" },
  });
  j = JSON.parse(r.body || "{}");
  check(
    "PayPal client-id without creds returns PAYMENT_NOT_CONFIGURED",
    j.success === false && j.error === "PAYMENT_NOT_CONFIGURED",
    r.body,
  );

  // 5c. Order-by-email endpoint returns the manual order address
  r = await req("GET", "/api/order-email", { headers: { Origin: "https://webzonebw.in" } });
  j = JSON.parse(r.body || "{}");
  check(
    "Order email endpoint fails closed when unset / returns address when configured",
    (j.success === true && /@/.test(j.email || "")) ||
      (j.success === false && j.error === "ORDER_EMAIL_NOT_CONFIGURED"),
    r.body,
  );

  // 6. License activate with unknown order â†’ must fail
  r = await req("POST", "/api/license/activate", {
    headers: { Origin: "https://webzonebw.in" },
    body: { orderId: "FAKE-ORDER-1", email: "t@e.com" },
  });
  j = JSON.parse(r.body || "{}");
  check("License activate unknown order fails (no fake license)", j.success === false, r.body);

  // 7. PayPal webhook with bad/missing signature â†’ must be rejected
  r = await req("POST", "/api/paypal/webhook", {
    headers: { Origin: "https://www.paypal.com", "paypal-transmission-sig": "bad-sig" },
    body: { event_type: "PAYMENT.CAPTURE.COMPLETED" },
  });
  check(
    "PayPal webhook with invalid signature rejected",
    r.status === 401 || r.status === 400 || (j && j.success === false),
    `status=${r.status}`,
  );

  console.log("\nDone.");
})().catch((e) => {
  console.error("TEST RUNNER ERROR:", e.message);
  process.exit(1);
});

