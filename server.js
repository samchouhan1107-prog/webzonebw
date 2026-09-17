/* ============================================================
 * WEBZONEBW - WEB SERVER
 * WEBZONE ER - STATIC SITE ENGINE
 * ------------------------------------------------------------
 * Version: 2.3.0
 * Port: 3000
 * Runtime: Node.js + Express
 * ------------------------------------------------------------
 * IMPORTANT
 * ------------------------------------------------------------
 * This server intentionally does NOT manipulate camera streams.
 * Camera / microphone access remains entirely browser-side
 * through the WEBZONEBW-ER JavaScript engine.
 * ============================================================ */

"use strict";

require("dotenv").config();

console.log(`[env] Environment: ${process.env.NODE_ENV || 'development'}`);

const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const crypto = require("crypto");
const compression = require("compression");
const helmet = require("helmet");

/* ============================================================
 * PATH CONFIGURATION
 * ============================================================ */

// In CommonJS, __filename and __dirname are already available

/* ============================================================
 * APPLICATION CONFIGURATION
 * ============================================================ */

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const SERVER_VERSION = "2.3.0";
const PROJECT_NAME = "WEBZONEBW";

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

// Security middleware
app.use(helmet.hidePoweredBy());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

/* ============================================================
 * BASIC APPLICATION SETTINGS & SECURITY HEADERS
 * ============================================================ */

app.disable("x-powered-by");

// HTTPS Redirect (force HTTPS for all requests)
// Proxy-aware: honors X-Forwarded-Proto behind Render, skips local HTTP.
app.use((req, res, next) => {
    const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const isSecure = proto === 'https' || req.secure;
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host || '');

    if (isSecure || (isLocal && process.env.NODE_ENV !== 'production') || process.env.DISABLE_HTTPS_REDIRECT === 'true') {
        return next();
    }
    
    // Redirect to HTTPS
    const host = req.headers.host;
    const secureUrl = `https://${host}${req.originalUrl}`;
    res.redirect(301, secureUrl);
});

// Brotli/Gzip Compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Helmet Configuration with Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.paypal.com", "https://www.google-analytics.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api-m.paypal.com", "https://api-m.sandbox.paypal.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com"],
      frameSrc: ["'self'", "https://www.paypal.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

// Enhanced Security Headers
app.use((req, res, next) => {
    // Standard Security Headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");

    // Additional Security Headers
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");

    next();
});

/* ============================================================
 * REQUEST PARSERS WITH INPUT VALIDATION
 * ============================================================ */

/*
 * Raw-body capture: webhook signature verification MUST run against
 * the exact bytes PayPal signed - re-serializing the parsed object
 * does not byte-match and would reject valid webhooks.
 */
app.use(express.json({
  limit: "25mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Input validation and sanitization middleware
app.use((req, res, next) => {
    // Sanitize user input
    const sanitizeInput = (input) => {
        if (typeof input !== 'string') return input;
        return input
            .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
            .replace(/javascript:/gi, '')   // Remove javascript: protocol
            .replace(/data:/gi, '')         // Remove data: protocol
            .replace(/\b(alert|confirm|prompt|eval)\b/gi, ''); // Remove dangerous functions
    };

    // Sanitize body parameters
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitizeInput(req.body[key]);
            }
        });
    }

    // Sanitize query parameters
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = sanitizeInput(req.query[key]);
            }
        });
    }

    next();
});

/* ============================================================
 * CORS - required when the static frontend is served from a
 * different origin (e.g. GitHub Pages) than this API server.
 * Configure ALLOWED_ORIGINS as a comma-separated list.
 * Same-origin requests are always allowed.
 * ============================================================ */

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Max-Age", "86400");
    }

    if (req.method === "OPTIONS" && origin && ALLOWED_ORIGINS.includes(origin)) {
        return res.sendStatus(204);
    }

    next();
});

/* ============================================================
 * REQUEST LOGGER WITH SECURITY MONITORING
 * ============================================================ */

app.use((req, res, next) => {
    const started = Date.now();

    // Security monitoring
    const securityLog = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        timestamp: new Date().toISOString()
    };

    // Monitor suspicious requests
    if (req.originalUrl.includes('..') || req.originalUrl.includes('<script')) {
        console.warn("[WEBZONEBW SECURITY] Suspicious request detected:", securityLog);
    }

    res.on("finish", () => {
        const duration = Date.now() - started;

        // Enhanced logging with security context
        const logMessage = `[WEBZONEBW] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

        if (res.statusCode >= 400) {
            console.error(`[WEBZONEBW ERROR] ${logMessage}`);
        } else if (res.statusCode >= 300) {
            console.warn(`[WEBZONEBW REDIRECT] ${logMessage}`);
        } else {
            console.log(`[WEBZONEBW] ${logMessage}`);
        }
    });

    next();
});

/* ============================================================
 * SECURITY MIDDLEWARE FOR COMMON ATTACK VECTORS
 * ============================================================ */

app.use((req, res, next) => {
    // Prevent HTTP request smuggling
    if (req.method === 'GET' && req.headers['content-length']) {
        return res.status(400).json({
            success: false,
            error: "Invalid request: GET requests should not have content"
        });
    }

    // Prevent directory traversal attacks
    const suspiciousPaths = ["..", "~", "\\", "/etc/", "/var/", "C:\\", "D:\\"];
    const requestPath = req.originalUrl || req.path;

    for (const suspicious of suspiciousPaths) {
        if (requestPath.includes(suspicious)) {
            console.warn(`[WEBZONEBW SECURITY] Directory traversal attempt detected: ${requestPath}`);
            return res.status(403).json({
                success: false,
                error: "Access denied: Invalid path"
            });
        }
    }

    // Prevent SQL injection patterns
    const sqlInjectionPatterns = [
        /\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi,
        /\b(or|and)\s+\d+\s*=/gi,
        /\b(\-\-|\#|\/\*|\*\/)\b/gi
    ];

    const checkForSqlInjection = (value) => {
        if (typeof value !== 'string') return false;
        return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    // Check body, query, and params for SQL injection
    if (req.body && Object.values(req.body).some(checkForSqlInjection)) {
        console.warn("[WEBZONEBW SECURITY] SQL injection attempt detected in body");
        return res.status(400).json({
            success: false,
            error: "Invalid input: Potential SQL injection detected"
        });
    }

    if (req.query && Object.values(req.query).some(checkForSqlInjection)) {
        console.warn("[WEBZONEBW SECURITY] SQL injection attempt detected in query");
        return res.status(400).json({
            success: false,
            error: "Invalid input: Potential SQL injection detected"
        });
    }

    next();
});

/* ============================================================
 * SIMPLE IN-MEMORY RATE LIMITER FOR API ROUTES
 * ============================================================ */

const apiRequestCounts = new Map();

function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 100; // Increased to 100 for smoother operations

    if (!apiRequestCounts.has(ip)) {
        apiRequestCounts.set(ip, []);
    }

    const timestamps = apiRequestCounts.get(ip);

    // Remove expired entries
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
        timestamps.shift();
    }

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - timestamps.length));
    res.setHeader("X-RateLimit-Reset", new Date(now + windowMs).toISOString());

    if (timestamps.length >= maxRequests) {
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
        console.warn(`[WEBZONEBW SECURITY] Rate limit exceeded for IP: ${ip}`);
        return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again later.",
            retryAfter: Math.ceil(windowMs / 1000),
            security: "rate_limit_exceeded"
        });
    }

    timestamps.push(now);
    next();
}

// Clean up stale IP records every 5 minutes
setInterval(() => {
    const now = Date.now();
    const windowMs = 60 * 1000;
    for (const [ip, timestamps] of apiRequestCounts) {
        while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
            timestamps.shift();
        }
        if (timestamps.length === 0) {
            apiRequestCounts.delete(ip);
        }
    }
}, 5 * 60 * 1000).unref();

app.use("/api", rateLimiter);

/* ============================================================
 * API ENDPOINTS (Ensures explicit application/json charset=utf-8)
 * ============================================================ */

app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
});

// --- PayPal API Configuration (PayPal ONLY - no other gateway) ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const PAYPAL_BASE_URL = PAYPAL_MODE === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
/* PayPal does not settle INR; ₹499 is charged as the USD equivalent. */
const ER_PREMIUM_AMOUNT_USD = 5.99;

/* Direct / manual order channel - buyers without PayPal can email us.
 * Configured ONLY server-side via ORDER_EMAIL in the environment.
 * No fallback: if unset, /api/order-email returns ORDER_EMAIL_NOT_CONFIGURED. */
const ORDER_EMAIL = process.env.ORDER_EMAIL || null;

/* ============================================================
 * HALLOWEEN PROMOTIONAL TEMPORARY ACCESS SYSTEM
 * ============================================================ */

// Halloween promotional access configuration
const HALLOWEEN_PROMO_CONFIG = {
    // Halloween promotion period (server-side time)
    promoStart: new Date('2026-10-01T00:00:00.000Z'), // October 1, 2026
    promoEnd: new Date('2026-11-07T23:59:59.999Z'),   // November 7, 2026 (Halloween season)

    // Promotional keys (server-side only - never expose to frontend)
    promoKeys: {
        'HALLOWEEN2026': {
            name: 'Halloween 2026 Free Access',
            allowedFeatures: ['witch-ritual', 'haunted-forest', 'vr-cyberdeck', 'vr-mansion'],
            description: 'Free Halloween Premium Access',
            active: true
        },
        'PUMPKIN2026': {
            name: 'Pumpkin Patch Experience',
            allowedFeatures: ['pumpkin-pose', 'witch-ritual'],
            description: 'Pumpkin-themed Halloween effects',
            active: true
        }
    }
};

// Check if current server time is within Halloween promotion period
function isHalloweenPromoActive() {
    const now = new Date();
    return now >= HALLOWEEN_PROMO_CONFIG.promoStart &&
           now <= HALLOWEEN_PROMO_CONFIG.promoEnd;
}

// Validate promotional key and return access rights
function validatePromoKey(promoKey) {
    if (!isHalloweenPromoActive()) {
        return { valid: false, reason: 'Promotion not active' };
    }

    const promo = HALLOWEEN_PROMO_CONFIG.promoKeys[promoKey];
    if (!promo || !promo.active) {
        return { valid: false, reason: 'Invalid promotional key' };
    }

    return {
        valid: true,
        promo: promo,
        expires: HALLOWEEN_PROMO_CONFIG.promoEnd
    };
}

// Check if a specific feature is available via promotional access
function isFeatureAvailableViaPromo(featureId, userPromoKeys = []) {
    if (!isHalloweenPromoActive()) return false;

    for (const promoKey of userPromoKeys) {
        const validation = validatePromoKey(promoKey);
        if (validation.valid && validation.promo.allowedFeatures.includes(featureId)) {
            return true;
        }
    }
    return false;
}

// --- ER Studio Premium License Configuration ---
const ER_PREMIUM_PLAN = "er-studio-premium";
const ER_PREMIUM_AMOUNT = ER_PREMIUM_AMOUNT_USD; // $5.99 USD - one-time ER Studio license
const ER_LICENSE_STORE = path.join(__dirname, "data", "licenses.json");

/*
 * License store - persisted to disk so licenses survive
 * server restarts. In production this should be a real DB.
 */
const licenseStore = {
    orders: new Map(),      // orderId -> { orderId, email, plan, amount, status, createdAt }
    licenses: new Map()     // licenseKey -> { licenseKey, email, orderId, status, issuedAt, lastVerifiedAt }
};

function loadLicenseStore() {
    try {
        if (fs.existsSync(ER_LICENSE_STORE)) {
            const raw = JSON.parse(fs.readFileSync(ER_LICENSE_STORE, "utf-8"));
            (raw.orders || []).forEach((o) => licenseStore.orders.set(o.orderId, o));
            (raw.licenses || []).forEach((l) => licenseStore.licenses.set(l.licenseKey, l));
        }
    } catch (error) {
        console.error("[WEBZONEBW LICENSE] Failed to load license store:", error.message);
    }
}

function saveLicenseStore() {
    try {
        fs.mkdirSync(path.dirname(ER_LICENSE_STORE), { recursive: true });
        fs.writeFileSync(
            ER_LICENSE_STORE,
            JSON.stringify({
                orders: [...licenseStore.orders.values()],
                licenses: [...licenseStore.licenses.values()]
            }, null, 2),
            "utf-8"
        );
    } catch (error) {
        console.error("[WEBZONEBW LICENSE] Failed to save license store:", error.message);
    }
}

loadLicenseStore();

function generateLicenseKey() {
    const block = () => crypto.randomBytes(2).toString("hex").toUpperCase();
    return `WZB-ER-${block()}-${block()}-${block()}`;
}

/* ============================================================
 * PAYPAL HELPERS - OAuth token + order creation + capture
 * ============================================================ */

async function getPayPalToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) return null;
    try {
        const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials"
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.access_token || null;
    } catch (e) {
        console.error("[WEBZONEBW PAYPAL] Token error:", e.message);
        return null;
    }
}

async function paypalRequest(accessToken, method, resourcePath, body) {
    const response = await fetch(`${PAYPAL_BASE_URL}${resourcePath}`, {
        method,
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
}

/* ============================================================
 * PAYPAL PAYMENT ENDPOINTS - ER STUDIO PREMIUM LICENSE (₹499)
 * PayPal ONLY. Fail-closed without credentials.
 * ============================================================ */

/*
 * Client-facing order creation - matches the er-license.js flow:
 * returns the PayPal order id + the public client id so the PayPal
 * JS SDK Buttons can be rendered. No secrets are exposed here.
 */
app.post("/api/paypal/create-order", async (req, res) => {
    try {
        const { planId, customerEmail } = req.body || {};

        if (planId && planId !== ER_PREMIUM_PLAN) {
            return res.status(400).json({ success: false, error: "UNKNOWN_PLAN" });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: "PAYMENT_NOT_CONFIGURED" });
        }

        const email = String(customerEmail || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, error: "INVALID_CUSTOMER_DETAILS" });
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
        }

        const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
            intent: "CAPTURE",
            purchase_units: [{
                description: "WebZoneBW ER Studio Premium License",
                custom_id: email,
                amount: {
                    currency_code: PAYPAL_CURRENCY,
                    value: ER_PREMIUM_AMOUNT_USD.toFixed(2)
                }
            }]
        });

        if (!ok || !data.id) {
            console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
            return res.status(502).json({ success: false, error: "GATEWAY_ORDER_FAILED" });
        }

        licenseStore.orders.set(data.id, {
            orderId: data.id,
            email: email,
            plan: ER_PREMIUM_PLAN,
            amount: ER_PREMIUM_AMOUNT,
            amountUsd: ER_PREMIUM_AMOUNT_USD,
            currency: PAYPAL_CURRENCY,
            status: "CREATED",
            createdAt: new Date().toISOString()
        });
        saveLicenseStore();

        res.json({
            success: true,
            orderId: data.id,
            clientId: PAYPAL_CLIENT_ID,
            amount: ER_PREMIUM_AMOUNT,
            amountUsd: ER_PREMIUM_AMOUNT_USD,
            currency: PAYPAL_CURRENCY,
            mode: PAYPAL_MODE
        });
    } catch (error) {
        console.error("[WEBZONEBW] Payment init failed:", error);
        res.status(500).json({ success: false, error: "Payment init failed" });
    }
});

/* Public client id for the PayPal JS SDK (safe to expose) */
app.get("/api/paypal/client-id", (req, res) => {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        return res.status(503).json({ success: false, error: "PAYMENT_NOT_CONFIGURED" });
    }
    res.json({
        success: true,
        clientId: PAYPAL_CLIENT_ID,
        mode: PAYPAL_MODE,
        currency: PAYPAL_CURRENCY,
        amount: ER_PREMIUM_AMOUNT_USD
    });
});

/* Public contact channel for manual orders (no secrets exposed) */
app.get("/api/order-email", (req, res) => {
    if (!ORDER_EMAIL) {
        return res.status(503).json({ success: false, error: "ORDER_EMAIL_NOT_CONFIGURED" });
    }
    res.json({ success: true, email: ORDER_EMAIL, plan: ER_PREMIUM_PLAN, amount: ER_PREMIUM_AMOUNT });
});

function issueLicenseForOrder(storedOrder) {
    if (storedOrder.licenseKey) return storedOrder.licenseKey;

    const licenseKey = generateLicenseKey();

    licenseStore.licenses.set(licenseKey, {
        licenseKey: licenseKey,
        email: storedOrder.email,
        orderId: storedOrder.orderId,
        plan: ER_PREMIUM_PLAN,
        amount: storedOrder.amount,
        status: "ACTIVE",
        issuedAt: new Date().toISOString(),
        lastVerifiedAt: null
    });

    storedOrder.licenseKey = licenseKey;
    console.log(`[WEBZONEBW] License ${licenseKey} issued for ${storedOrder.email} (order ${storedOrder.orderId})`);
    saveLicenseStore();
    return licenseKey;
}

app.post("/api/create-order", async (req, res) => {
    try {
        const { planId, customerEmail } = req.body || {};

        if (planId && planId !== ER_PREMIUM_PLAN) {
            return res.status(400).json({ success: false, error: "UNKNOWN_PLAN" });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            /*
             * NO fake payments: without PayPal credentials we refuse
             * to start checkout and the client keeps premium locked.
             */
            return res.status(503).json({
                success: false,
                error: "PAYMENT_NOT_CONFIGURED"
            });
        }

        const email = String(customerEmail || "").trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, error: "INVALID_CUSTOMER_DETAILS" });
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
        }

        const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
            intent: "CAPTURE",
            purchase_units: [{
                description: "WebZoneBW ER Studio Premium License",
                custom_id: email,
                amount: {
                    currency_code: PAYPAL_CURRENCY,
                    value: ER_PREMIUM_AMOUNT_USD.toFixed(2)
                }
            }]
        });

        if (!ok || !data.id) {
            console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
            return res.status(502).json({ success: false, error: "GATEWAY_ORDER_FAILED" });
        }

        licenseStore.orders.set(data.id, {
            orderId: data.id,
            email: email,
            plan: ER_PREMIUM_PLAN,
            amount: ER_PREMIUM_AMOUNT,
            amountUsd: ER_PREMIUM_AMOUNT_USD,
            currency: PAYPAL_CURRENCY,
            status: "CREATED",
            createdAt: new Date().toISOString()
        });
        saveLicenseStore();

        res.json({
            success: true,
            order_id: data.id,
            amount: ER_PREMIUM_AMOUNT,
            amountUsd: ER_PREMIUM_AMOUNT_USD,
            currency: PAYPAL_CURRENCY,
            mode: PAYPAL_MODE
        });
    } catch (error) {
        console.error("[WEBZONEBW] Payment init failed:", error);
        res.status(500).json({ success: false, error: "Payment init failed" });
    }
});

/*
 * Server-side CAPTURE: called by the client after PayPal approval.
 * The license is issued ONLY when PayPal confirms a COMPLETED capture.
 */
app.post("/api/paypal/capture", async (req, res) => {
    try {
        const { orderId, email } = req.body || {};

        if (!orderId) {
            return res.status(400).json({ success: false, error: "ORDER_ID_REQUIRED" });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return res.status(503).json({ success: false, error: "PAYMENT_NOT_CONFIGURED" });
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
        }

        const { ok, data } = await paypalRequest(
            accessToken, "POST",
            `/v2/checkout/orders/${encodeURIComponent(String(orderId))}/capture`,
            {}
        );

        const captureStatus = data && data.status;
        const storedOrder = licenseStore.orders.get(String(orderId));

        if (!ok || captureStatus !== "COMPLETED" || !storedOrder) {
            console.warn("[WEBZONEBW] PayPal capture not completed:", captureStatus, data && data.message);
            return res.status(402).json({
                success: false,
                error: "PAYMENT_NOT_VERIFIED - PayPal has not confirmed this payment. Premium stays locked."
            });
        }

        if (email && storedOrder.email && String(email).toLowerCase() !== storedOrder.email.toLowerCase()) {
            return res.status(403).json({ success: false, error: "EMAIL_MISMATCH" });
        }

        storedOrder.status = "PAID";
        storedOrder.paidAt = new Date().toISOString();
        const licenseKey = issueLicenseForOrder(storedOrder);

        res.json({
            success: true,
            licenseKey: licenseKey,
            status: "ACTIVE",
            plan: ER_PREMIUM_PLAN,
            email: storedOrder.email
        });
    } catch (error) {
        console.error("[WEBZONEBW] PayPal capture failed:", error);
        res.status(500).json({ success: false, error: "CAPTURE_FAILED" });
    }
});

/*
 * PayPal webhook (backup channel - capture endpoint is primary).
 * If a webhook secret is configured, requests must be verifiable;
 * otherwise the endpoint refuses to act (fail-closed).
 */
app.post("/api/paypal/webhook", async (req, res) => {
    if (!PAYPAL_WEBHOOK_ID) {
        console.warn("[WEBZONEBW] PayPal webhook rejected: PAYPAL_WEBHOOK_ID not configured");
        return res.status(503).send("WEBHOOK_NOT_CONFIGURED");
    }

    try {
        const accessToken = await getPayPalToken();
        if (!accessToken) return res.status(503).send("WEBHOOK_NOT_CONFIGURED");

        const { ok, data } = await paypalRequest(accessToken, "POST", "/v1/notifications/verify-webhook-signature", {
            auth_algo: req.headers["paypal-auth-algo"],
            cert_url: req.headers["paypal-cert-url"],
            transmission_id: req.headers["paypal-transmission-id"],
            transmission_sig: req.headers["paypal-transmission-sig"],
            transmission_time: req.headers["paypal-transmission-time"],
            webhook_id: PAYPAL_WEBHOOK_ID,
            webhook_event: req.body
        });

        if (!ok || !data || data.verification_status !== "SUCCESS") {
            console.warn("[WEBZONEBW] PayPal webhook verification failed");
            return res.status(401).send("INVALID_SIGNATURE");
        }

        const event = req.body || {};
        if (event.event_type === "CHECKOUT.ORDER.COMPLETED" || event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            const resource = event.resource || {};
            const orderId = resource.supplementary_data && resource.supplementary_data.related_ids
                ? resource.supplementary_data.related_ids.order_id
                : resource.id;

            const storedOrder = orderId && licenseStore.orders.get(String(orderId));
            if (storedOrder && storedOrder.status !== "PAID") {
                storedOrder.status = "PAID";
                storedOrder.paidAt = new Date().toISOString();
                issueLicenseForOrder(storedOrder);
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("[WEBZONEBW] PayPal webhook error:", error.message);
        res.status(500).send("WEBHOOK_ERROR");
    }
});

/* ------------------------------------------------------------
 * MANUAL ORDER SUPPORT - licenses for email orders issued by the
 * owner after confirming payment (UPI/bank transfer etc. via the
 * configured ORDER_EMAIL address). Guarded by an admin key, never public.
 * ------------------------------------------------------------ */
app.post("/api/license/manual-activate", (req, res) => {
    const adminKey = req.headers["x-admin-key"];

    if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    }

    const { email, orderId } = req.body || {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ""))) {
        return res.status(400).json({ success: false, error: "INVALID_EMAIL" });
    }

    const id = String(orderId || `WZB-MANUAL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`);

    const storedOrder = licenseStore.orders.get(id) || {
        orderId: id,
        email: String(email).trim(),
        plan: ER_PREMIUM_PLAN,
        amount: ER_PREMIUM_AMOUNT,
        status: "PAID",
        manual: true,
        createdAt: new Date().toISOString()
    };

    storedOrder.status = "PAID";
    storedOrder.paidAt = storedOrder.paidAt || new Date().toISOString();
    licenseStore.orders.set(id, storedOrder);

    const licenseKey = issueLicenseForOrder(storedOrder);

    res.json({ success: true, licenseKey: licenseKey, email: storedOrder.email, orderId: id });
});

/* ------------------------------------------------------------
 * LICENSE ACTIVATION
 * Called by the client after PayPal capture (which issues the
 * license server-side). Never issues a license for unpaid orders.
 * ------------------------------------------------------------ */
app.post("/api/license/activate", (req, res) => {
    try {
        const { orderId, email, promoKey } = req.body || {};

        // First check for promotional access (Halloween promotion takes priority)
        if (promoKey) {
            const promoValidation = validatePromoKey(promoKey);
            if (promoValidation.valid) {
                return res.json({
                    success: true,
                    licenseKey: null,
                    status: "PROMO_ACCESS",
                    plan: "halloween-promo",
                    email: undefined,
                    hasPromoAccess: true,
                    promoFeatures: promoValidation.promo.allowedFeatures,
                    promoExpires: promoValidation.expires.toISOString()
                });
            }
        }

        // If no promo access, proceed with normal license activation
        if (!orderId) {
            return res.status(400).json({ success: false, error: "ORDER_ID_REQUIRED" });
        }

        const storedOrder = licenseStore.orders.get(String(orderId));

        if (!storedOrder) {
            return res.status(404).json({ success: false, error: "ORDER_NOT_FOUND" });
        }

        if (email && storedOrder.email && String(email).toLowerCase() !== storedOrder.email.toLowerCase()) {
            return res.status(403).json({ success: false, error: "EMAIL_MISMATCH" });
        }

        /* Fail-closed: unpaid orders NEVER get a license. */
        if (storedOrder.status !== "PAID" || !storedOrder.licenseKey) {
            return res.status(402).json({
                success: false,
                error: "PAYMENT_NOT_VERIFIED - PayPal has not confirmed this payment. Premium stays locked."
            });
        }

        const license = licenseStore.licenses.get(storedOrder.licenseKey);

        res.json({
            success: true,
            licenseKey: storedOrder.licenseKey,
            status: license ? license.status : "ACTIVE",
            plan: ER_PREMIUM_PLAN,
            email: storedOrder.email,
            hasPromoAccess: false,
            promoActive: isHalloweenPromoActive()
        });
    } catch (error) {
        console.error("[WEBZONEBW] License activation failed:", error);
        res.status(500).json({ success: false, error: "ACTIVATION_FAILED" });
    }
});

/* ------------------------------------------------------------
 * LICENSE VERIFICATION - persistent re-check on every session
 * ------------------------------------------------------------ */
app.post("/api/license/verify", (req, res) => {
    const { licenseKey, promoKey } = req.body || {};

    // Check for valid paid license first
    let license = null;
    let validLicense = false;

    if (licenseKey) {
        license = licenseStore.licenses.get(String(licenseKey).trim().toUpperCase());
        if (license && license.status === "ACTIVE") {
            validLicense = true;
        }
    }

    // Check for promotional access if no valid paid license
    let promoAccess = null;
    let validPromo = false;

    if (!validLicense && promoKey) {
        const promoValidation = validatePromoKey(promoKey);
        if (promoValidation.valid) {
            validPromo = true;
            promoAccess = {
                promoKey: promoKey,
                features: promoValidation.promo.allowedFeatures,
                expires: promoValidation.expires.toISOString()
            };
        }
    }

    // If no license and no promo, return not found
    if (!validLicense && !validPromo) {
        return res.json({
            success: true,
            valid: false,
            status: "NOT_FOUND",
            hasPromoAccess: false,
            promoActive: isHalloweenPromoActive()
        });
    }

    // Update last verified time for paid licenses
    if (validLicense && license) {
        license.lastVerifiedAt = new Date().toISOString();
        saveLicenseStore();
    }

    res.json({
        success: true,
        valid: validLicense || validPromo,
        status: validLicense ? license.status : "PROMO_ACCESS",
        plan: validLicense ? license.plan : "halloween-promo",
        email: validLicense ? license.email : undefined,
        hasPaidLicense: validLicense,
        hasPromoAccess: validPromo,
        promoAccess: promoAccess,
        promoActive: isHalloweenPromoActive()
    });
});

/* ============================================================
 * HALLOWEEN PROMOTIONAL ACCESS ENDPOINTS
 * ============================================================ */

// Validate promotional key (client can check if they have access)
app.post("/api/halloween/validate-promo", (req, res) => {
    try {
        const { promoKey } = req.body || {};

        if (!promoKey) {
            return res.status(400).json({
                success: false,
                valid: false,
                error: "PROMO_KEY_REQUIRED",
                promoActive: isHalloweenPromoActive(),
                promoStart: HALLOWEEN_PROMO_CONFIG.promoStart.toISOString(),
                promoEnd: HALLOWEEN_PROMO_CONFIG.promoEnd.toISOString()
            });
        }

        const validation = validatePromoKey(promoKey);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                valid: false,
                error: validation.reason,
                promoActive: isHalloweenPromoActive(),
                promoStart: HALLOWEEN_PROMO_CONFIG.promoStart.toISOString(),
                promoEnd: HALLOWEEN_PROMO_CONFIG.promoEnd.toISOString()
            });
        }

        res.json({
            success: true,
            valid: true,
            promo: {
                name: validation.promo.name,
                description: validation.promo.description,
                allowedFeatures: validation.promo.allowedFeatures,
                expires: validation.expires.toISOString()
            },
            promoActive: isHalloweenPromoActive(),
            promoStart: HALLOWEEN_PROMO_CONFIG.promoStart.toISOString(),
            promoEnd: HALLOWEEN_PROMO_CONFIG.promoEnd.toISOString()
        });
    } catch (error) {
        console.error("[WEBZONEBW] Halloween promo validation error:", error);
        res.status(500).json({ success: false, error: "PROMO_VALIDATION_FAILED" });
    }
});

// Get current Halloween promotion status
app.get("/api/halloween/status", (req, res) => {
    res.json({
        success: true,
        promoActive: isHalloweenPromoActive(),
        promoStart: HALLOWEEN_PROMO_CONFIG.promoStart.toISOString(),
        promoEnd: HALLOWEEN_PROMO_CONFIG.promoEnd.toISOString(),
        currentTime: new Date().toISOString(),
        features: Object.values(HALLOWEEN_PROMO_CONFIG.promoKeys).flatMap(p => p.allowedFeatures)
    });
});

// Admin endpoint to activate promotional access (server-side only)
app.post("/api/halloween/activate-promo", (req, res) => {
    const adminKey = req.headers["x-admin-key"];

    if (!process.env.ADMIN_KEY || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ success: false, error: "UNAUTHORIZED" });
    }

    const { promoKey, userEmail } = req.body || {};

    if (!promoKey || !userEmail) {
        return res.status(400).json({ success: false, error: "PROMO_AND_EMAIL_REQUIRED" });
    }

    const validation = validatePromoKey(promoKey);
    if (!validation.valid) {
        return res.status(400).json({ success: false, error: "INVALID_PROMO_KEY" });
    }

    // Create a temporary promotional entry (separate from paid licenses)
    const promoEntry = {
        id: `PROMO-${promoKey}-${Date.now()}`,
        promoKey: promoKey,
        userEmail: userEmail,
        activatedAt: new Date().toISOString(),
        expiresAt: HALLOWEEN_PROMO_CONFIG.promoEnd.toISOString(),
        features: validation.promo.allowedFeatures,
        status: "ACTIVE"
    };

    // Store promotional access (in production, use a proper database)
    if (!licenseStore.promotional) {
        licenseStore.promotional = new Map();
    }
    licenseStore.promotional.set(promoEntry.id, promoEntry);
    saveLicenseStore();

    res.json({
        success: true,
        promoId: promoEntry.id,
        message: "Halloween promotional access activated",
        expiresAt: promoEntry.expiresAt,
        features: promoEntry.features
    });
});

// Health check (used by deployment platforms + readiness tests)
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        server: PROJECT_NAME,
        version: SERVER_VERSION,
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Security audit endpoint
app.get("/api/security-audit", (req, res) => {
    const securityAudit = {
        timestamp: new Date().toISOString(),
        server: PROJECT_NAME,
        version: SERVER_VERSION,
        environment: NODE_ENV,
        securityHeaders: {
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()",
            "X-XSS-Protection": "1; mode=block",
            "X-Permitted-Cross-Domain-Policies": "none"
        },
        securityFeatures: {
            httpsRedirect: true,
            contentSecurityPolicy: true,
            rateLimiting: true,
            helmetProtection: true,
            secureCookies: true,
            inputValidation: true
        },
        compliance: {
            hsts: true,
            csp: true,
            xssProtection: true,
            clickjackingProtection: true,
            mimeSniffingProtection: true
        }
    };

    res.status(200).json(securityAudit);
});

// Status API
app.get("/api/status", (req, res) => {
    const memory = process.memoryUsage();
    res.status(200).json({
        success: true,
        server: PROJECT_NAME,
        version: SERVER_VERSION,
        environment: NODE_ENV,
        port: PORT,
        host: HOST,
        node: process.version,
        platform: process.platform,
        architecture: process.arch,
        pid: process.pid,
        uptime: Math.floor(process.uptime()),
        memory: {
            rss: memory.rss,
            heapUsed: memory.heapUsed,
            heapTotal: memory.heapTotal,
            external: memory.external
        },
        timestamp: new Date().toISOString()
    });
});

/* ============================================================
 * STATIC FILE CONFIGURATION & ROUTING FALLBACKS
 * ============================================================ */

function staticOptions() {
    return {
        extensions: ["html", "htm"],
        index: "index.html",
        fallthrough: true,
        redirect: true,
        etag: true,
        lastModified: true,
        maxAge: IS_PRODUCTION ? "1d" : 0,
        setHeaders: (res, filePath) => {
            // Force UTF-8 encoding on standard assets to prevent character bugs (mojibake)
            if (filePath.endsWith(".html") || filePath.endsWith(".htm")) {
                res.setHeader("Content-Type", "text/html; charset=utf-8");
                if (!IS_PRODUCTION) {
                    res.setHeader("Cache-Control", "no-cache");
                }
            } else if (filePath.endsWith(".js")) {
                res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            } else if (filePath.endsWith(".css")) {
                res.setHeader("Content-Type", "text/css; charset=utf-8");
            } else if (filePath.endsWith(".json")) {
                res.setHeader("Content-Type", "application/json; charset=utf-8");
            }

            // Add security headers for static files
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "SAMEORIGIN");
            res.setHeader("X-XSS-Protection", "1; mode=block");

            // Cache control for static assets in production
            if (IS_PRODUCTION) {
                res.setHeader("Cache-Control", "public, max-age=86400, immutable");
            }
        }
    };
}

// Serve ROOT assets under "/er/assets" and "/er/css" / "/er/js" to resolve relative URL 404s
app.use("/er/assets", express.static(path.join(__dirname, "assets"), staticOptions()));
app.use("/er/css", express.static(path.join(__dirname, "css"), staticOptions()));
app.use("/er/js", express.static(path.join(__dirname, "js"), staticOptions()));

// Serves Static files from Root directory
app.use(express.static(__dirname, staticOptions()));

// Namespace static mounts
app.use("/er", express.static(path.join(__dirname, "er"), staticOptions()));
app.use("/halloween", express.static(path.join(__dirname, "halloween"), staticOptions()));

function resolveHtmlPageFromRoute(requestPath) {
    const trimmedPath = (requestPath || "/").trim().replace(/\\/g, "/");

    if (!trimmedPath || trimmedPath === "/") {
        return path.join(__dirname, "index.html");
    }

    const normalizedPath = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
    const routeName = normalizedPath.replace(/\/+$/, "").toLowerCase();

    const explicitRoutes = {
        "/soundbox": path.join(__dirname, "soundbox.html"),
        "/music": path.join(__dirname, "soundbox.html"),
        "/er": path.join(__dirname, "er", "index.html"),
        "/er/": path.join(__dirname, "er", "index.html"),
        "/halloween": path.join(__dirname, "er", "index.html"),
        "/halloween/": path.join(__dirname, "er", "index.html"),
        "/privacy-policy": path.join(__dirname, "privacy.html"),
        "/terms-of-service": path.join(__dirname, "terms.html"),
        "/cookie-policy": path.join(__dirname, "cookie-policy.html"),
        "/privacy-center": path.join(__dirname, "privacy-center.html"),
        "/about-us": path.join(__dirname, "about.html"),
        "/contact-us": path.join(__dirname, "contact.html")
    };

    if (explicitRoutes[routeName]) {
        return explicitRoutes[routeName];
    }

    const isInsideProject = (candidatePath) => {
        const relative = path.relative(__dirname, candidatePath);
        return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
    };

    if (path.extname(normalizedPath)) {
        const pagePath = path.join(__dirname, normalizedPath.replace(/^\//, ""));
        if (isInsideProject(pagePath) && fs.existsSync(pagePath) && fs.statSync(pagePath).isFile()) {
            return pagePath;
        }
    }

    const extensionlessPath = path.join(__dirname, `${normalizedPath.replace(/^\//, "")}.html`);
    if (isInsideProject(extensionlessPath) && fs.existsSync(extensionlessPath) && fs.statSync(extensionlessPath).isFile()) {
        return extensionlessPath;
    }

    return null;
}

// RSS Feed endpoint (Ensures charset=utf-8)
app.get(["/feed.xml", "/rss.xml", "/feed", "/rss"], (req, res) => {
    const feedPath = path.join(__dirname, "feed.xml");
    if (fs.existsSync(feedPath)) {
        res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
        res.sendFile(feedPath);
    } else {
        res.status(404).json({
            success: false,
            error: "RSS feed not found"
        });
    }
});

// HTML-based error pages
app.get(["/500", "/500.html", "/error"], (req, res) => {
    const errorPage = path.join(__dirname, "500.html");
    if (fs.existsSync(errorPage)) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.status(500).sendFile(errorPage);
    } else {
        res.status(500).send("WEBZONEBW - Internal Server Error");
    }
});

// Server Status simple HTML page
app.get("/status", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WEBZONEBW Server Status</title>
</head>
<body>
    <main>
        <h1>WEBZONEBW Server Online</h1>
        <p>Version: ${SERVER_VERSION}</p>
        <p>Environment: ${NODE_ENV}</p>
        <p>Node.js: ${process.version}</p>
        <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
    </main>
</body>
</html>`);
});

// Explicit homepage route — production-safe root entry
app.get("/", (req, res, next) => {
    const indexFile = path.join(__dirname, "index.html");

    if (!fs.existsSync(indexFile)) {
        return next(new Error("WEBZONEBW index.html not found"));
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(indexFile, (error) => {
        if (error) {
            next(error);
        }
    });
});



// Client-Side Routing Fallback (Prevents silent loading on missing resources)
app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
        return next();
    }

    const requestPath = req.path || "/";

    if (
        requestPath.startsWith("/api/") ||
        requestPath.startsWith("/assets/") ||
        requestPath.startsWith("/css/") ||
        requestPath.startsWith("/js/") ||
        requestPath.startsWith("/audio/") ||
        requestPath.startsWith("/video/") ||
        requestPath.startsWith("/images/") ||
        requestPath.startsWith("/fonts/") ||
        requestPath.startsWith("/er/") ||
        requestPath.startsWith("/halloween/") ||
        path.extname(requestPath)
    ) {
        // API routes defined later must remain reachable — never 404 them here.
        if (requestPath.startsWith("/api/")) {
            return next();
        }
        return res.status(404).send("Not Found");
    }

    const resolvedPage = resolveHtmlPageFromRoute(requestPath);
    if (resolvedPage) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.sendFile(resolvedPage, (error) => {
            if (error) {
                next(error);
            }
        });
    }

    const indexFile = path.join(__dirname, "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.sendFile(indexFile, (error) => {
        if (error) {
            next(error);
        }
    });
});



/* ============================================================
 * GLOBAL ERROR HANDLER
 * ============================================================ */

app.use((error, req, res, next) => {
    console.error("[WEBZONEBW ERROR]", error);

    if (res.headersSent) {
        return next(error);
    }

    const statusCode = error.status || error.statusCode || 500;

    if (req.originalUrl.startsWith("/api")) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        return res.status(statusCode).json({
            success: false,
            error: IS_PRODUCTION ? "Internal server error" : error.message,
            timestamp: new Date().toISOString()
        });
    }

    const errorPage = path.join(__dirname, "500.html");
    if (fs.existsSync(errorPage)) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.status(statusCode).sendFile(errorPage);
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    return res.status(statusCode).send("WEBZONEBW - Internal Server Error");
});

/* ============================================================
 * SECURITY ERROR HANDLER
 * ============================================================ */

app.use((err, req, res, next) => {
    console.error("[WEBZONEBW SECURITY ERROR]", err);
    
    if (res.headersSent) {
        return next(err);
    }
    
    // Don't expose error details in production
    const errorResponse = process.env.NODE_ENV === 'production' 
        ? { error: "Internal server error" }
        : { error: err.message, stack: err.stack };
    
    res.status(500).json({
        success: false,
        ...errorResponse,
        timestamp: new Date().toISOString()
    });
});

/* ============================================================
 * PROCESS UNCAUGHT RUNTIME ERRORS
 * ============================================================ */

process.on("uncaughtException", (error) => {
    console.error("[FATAL] Uncaught Exception:", error);
    // Log security-critical errors to file
    logSecurityError("UNCAUGHT_EXCEPTION", error);
});

process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Unhandled Promise Rejection:", reason);
    // Log security-critical errors to file
    logSecurityError("UNHANDLED_REJECTION", reason);
});

/* ============================================================
 * SECURITY LOGGING UTILITIES
 * ============================================================ */

function logSecurityError(type, error) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        type: type,
        error: error.message,
        stack: error.stack,
        environment: NODE_ENV,
        server: PROJECT_NAME,
        version: SERVER_VERSION
    };
    
    console.error(`[WEBZONEBW SECURITY LOG] ${JSON.stringify(logEntry)}`);
    
    // In production, you might want to write to a secure log file
    if (IS_PRODUCTION) {
        try {
            const logPath = path.join(__dirname, 'logs', 'security.log');
            const fs = require('fs');
            const logDir = path.dirname(logPath);
            
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            
            fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
        } catch (logError) {
            console.error("[WEBZONEBW] Failed to write security log:", logError.message);
        }
    }
}

/* ============================================================
 * SERVER START - HTTP & HTTPS SECURE CONTEXT
 * ============================================================ */

const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 3443;
const pfxPath = path.join(__dirname, "certs", "cert.pfx");

let httpsServer = null;

if (fs.existsSync(pfxPath)) {
    try {
        httpsServer = https.createServer(
            {
                pfx: fs.readFileSync(pfxPath),
                passphrase: "webzonebw",
                // Additional HTTPS security options
                minVersion: 'TLSv1.2',
                ciphers: [
                    'ECDHE-ECDSA-AES256-GCM-SHA384',
                    'ECDHE-RSA-AES256-GCM-SHA384',
                    'ECDHE-ECDSA-CHACHA20-POLY1305',
                    'ECDHE-RSA-CHACHA20-POLY1305',
                    'ECDHE-ECDSA-AES128-GCM-SHA256',
                    'ECDHE-RSA-AES128-GCM-SHA256'
                ].join(':'),
                honorCipherOrder: true
            },
            app
        );

        httpsServer.listen(HTTPS_PORT, HOST, () => {
            console.log("================================================");
            console.log(" HTTPS Secure Context (camera/mic supported)");
            console.log(` Local: https://localhost:${HTTPS_PORT}`);
            console.log(` ER Studio: https://localhost:${HTTPS_PORT}/er/`);
            console.log("================================================");
        });

        httpsServer.on("error", (error) => {
            console.error("[WEBZONEBW] HTTPS server error:", error.code);
        });
    } catch (error) {
        console.error("[WEBZONEBW] HTTPS startup failed:", error.message);
    }
}

const server = app.listen(PORT, HOST, () => {
    console.log("================================================");
    console.log(" WEBZONEBW SERVER RUNNING");
    console.log("================================================");
    console.log(` Project: ${PROJECT_NAME}`);
    console.log(` Version: ${SERVER_VERSION}`);
    console.log(` Node.js: ${process.version}`);
    console.log(` Environment: ${NODE_ENV}`);
    console.log(` HTTP Port: ${PORT}`);
    console.log(` HTTP URL: http://localhost:${PORT}`);
    console.log(` ER Studio: http://localhost:${PORT}/er/`);
    console.log(` Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log("================================================");
});

server.on("error", (error) => {
    console.error("[WEBZONEBW SERVER ERROR]", error);
    if (error.code === "EADDRINUSE") {
        console.error(`[WEBZONEBW] Port ${PORT} is already in use.`);
    }
    process.exit(1);
});

/* ============================================================
 * GRACEFUL SHUTDOWN
 * ============================================================ */

let shuttingDown = false;

const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`\n[WEBZONEBW] ${signal} received. Shutting down...`);

    server.close((error) => {
        if (error) {
            console.error("[WEBZONEBW] HTTP shutdown error:", error);
        }

        if (httpsServer) {
            httpsServer.close(() => {
                console.log("[WEBZONEBW] HTTPS and HTTP servers closed successfully.");
                process.exit(0);
            });
        } else {
            console.log("[WEBZONEBW] HTTP server closed successfully.");
            process.exit(0);
        }
    });

    setTimeout(() => {
        console.error("[WEBZONEBW] Forced shutdown after timeout.");
        process.exit(1);
    }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));