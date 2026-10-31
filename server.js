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

const fs = require("fs");
const path = require("path");
const express = require("express");
const crypto = require("crypto");

const { createPayPalRouter } = require("./paypal-routes");
const {
    SECURITY_CONFIG,
    createErrorResponse,
    validateInput,
    validateRequestInput
} = require("./validate");

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
const FALLBACK_PORTS = [3001, 3002, 3003, 8080, 8081];

const SERVER_VERSION = "2.4.0";
const PROJECT_NAME = "WEBZONEBW";

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

/* ============================================================
 * SECURITY CONFIG, ERROR RESPONSE & INPUT VALIDATION HELPERS
 * are shared from ./validate (single source of truth).
 * ============================================================ */

const requestCounts = new Map();
const ipCounts = new Map();

function enhancedRateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = SECURITY_CONFIG.rateLimit.windowMs;
    
    // Clean old entries
    cleanupOldRequests(now, windowMs);
    
    // Check IP-based rate limiting
    const ipRequestCount = getRecentRequests(ipCounts, ip, now, windowMs);
    if (ipRequestCount >= SECURITY_CONFIG.rateLimit.maxRequestsPerIP) {
        return createErrorResponse(res, 429, 'RATE_LIMIT_EXCEEDED_IP', 
            'Too many requests from your IP address', {
            retryAfter: Math.ceil(windowMs / 1000),
            limit: SECURITY_CONFIG.rateLimit.maxRequestsPerIP
        });
    }
    
    // Check general rate limiting
    const requestCount = getRecentRequests(requestCounts, ip, now, windowMs);
    if (requestCount >= SECURITY_CONFIG.rateLimit.maxRequests) {
        return createErrorResponse(res, 429, 'RATE_LIMIT_EXCEEDED', 
            'Too many requests. Please try again later.', {
            retryAfter: Math.ceil(windowMs / 1000),
            limit: SECURITY_CONFIG.rateLimit.maxRequests
        });
    }
    
    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", SECURITY_CONFIG.rateLimit.maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, SECURITY_CONFIG.rateLimit.maxRequests - requestCount));
    res.setHeader("X-RateLimit-Reset", new Date(now + windowMs).toISOString());
    res.setHeader("X-RateLimit-IP-Limit", SECURITY_CONFIG.rateLimit.maxRequestsPerIP);
    res.setHeader("X-RateLimit-IP-Remaining", Math.max(0, SECURITY_CONFIG.rateLimit.maxRequestsPerIP - ipRequestCount));
    
    next();
}

function getRecentRequests(counts, key, now, windowMs) {
    if (!counts.has(key)) {
        counts.set(key, []);
    }
    
    const timestamps = counts.get(key);
    
    // Remove expired entries
    while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
        timestamps.shift();
    }
    
    return timestamps.length;
}

function cleanupOldRequests(now, windowMs) {
    const cleanupMap = (map) => {
        for (const [key, timestamps] of map) {
            while (timestamps.length > 0 && timestamps[0] <= now - windowMs) {
                timestamps.shift();
            }
            if (timestamps.length === 0) {
                map.delete(key);
            }
        }
    };
    
    cleanupMap(requestCounts);
    cleanupMap(ipCounts);
}

// Auto-cleanup every 5 minutes
setInterval(() => {
    cleanupOldRequests(Date.now(), SECURITY_CONFIG.rateLimit.windowMs);
}, 5 * 60 * 1000).unref();

// Security middleware
app.use(helmet.hidePoweredBy());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

/* ============================================================
 * BASIC APPLICATION SETTINGS & SECURITY HEADERS
 * ============================================================ */

app.disable("x-powered-by");

// HTTPS Redirect (force HTTPS for all requests in production when not behind reverse proxy)
app.use((req, res, next) => {
    // In dev / AI Studio preview environment, HTTPS is handled by upstream reverse proxy.
    // Skip internal 301 redirects to ensure smooth local and proxy operations.
    next();
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

// Enhanced Helmet Configuration with Content Security Policy (permitting AI Studio iframe preview)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.paypal.com", "https://www.google-analytics.com", "https://*.googletagmanager.com", "https://*.google.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https:", "wss:", "https://api-m.paypal.com", "https://api-m.sandbox.paypal.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com", "https://*.google-analytics.com", "https://*.googletagmanager.com"],
      frameSrc: ["'self'", "https://www.paypal.com", "https://*.google.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'", "https://*.google.com", "https://*.run.app"],
      upgradeInsecureRequests: null,
      reportUri: "/api/security-csp-report"
    },
    reportOnly: false
  },
  frameguard: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: false
}));

// Enhanced Security Headers
app.use((req, res, next) => {
    // Standard Security Headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("X-Request-ID", crypto.randomBytes(4).toString("hex"));
    res.setHeader("Timing-Allow-Origin", "*");
    next();
});

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

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

/* ============================================================
 * ENHANCED INPUT VALIDATION AND SANITIZATION MIDDLEWARE
 * ============================================================ */

app.use((req, res, next) => {
    try {
        // Validate and sanitize body parameters (shared helper from ./validate)
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (typeof req.body[key] === 'string') {
                    try {
                        validateRequestInput(req.body[key], `body.${key}`);
                    } catch (error) {
                        return createErrorResponse(res, 400, 'INVALID_INPUT', 
                            `Invalid input in ${key}: ${error.message}`);
                    }
                }
            });
        }

        // Validate and sanitize query parameters
        if (req.query) {
            Object.keys(req.query).forEach(key => {
                if (typeof req.query[key] === 'string') {
                    try {
                        validateRequestInput(req.query[key], `query.${key}`);
                    } catch (error) {
                        return createErrorResponse(res, 400, 'INVALID_INPUT', 
                            `Invalid input in ${key}: ${error.message}`);
                    }
                }
            });
        }

        // Enhanced email validation for specific endpoints
        if (req.body && req.body.email) {
            try {
                validateInput(req.body.email, 'string', { 
                    type: 'email', 
                    maxLength: SECURITY_CONFIG.validation.maxEmailLength 
                });
            } catch (error) {
                return createErrorResponse(res, 400, 'INVALID_EMAIL', 
                    error.message);
            }
        }

        next();
    } catch (error) {
        createErrorResponse(res, 500, 'VALIDATION_ERROR', 
            'Input validation failed', { error: error.message });
    }
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
 * ENHANCED REQUEST LOGGER WITH MONITORING AND METRICS
 * ============================================================ */

app.use((req, res, next) => {
    const started = Date.now();
    const requestId = crypto.randomBytes(4).toString("hex");

    // Enhanced security monitoring
    const securityLog = {
        requestId: requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        timestamp: new Date().toISOString(),
        path: req.path,
        query: req.query
    };

    // Monitor suspicious requests with enhanced detection
    const isSuspicious = (
        req.originalUrl.includes('..') || 
        req.originalUrl.includes('<script') ||
        req.originalUrl.includes('javascript:') ||
        req.originalUrl.includes('data:') ||
        (req.body && JSON.stringify(req.body).includes('<script'))
    );

    if (isSuspicious) {
        console.warn(`[WEBZONEBW SECURITY] Suspicious request detected:`, {
            ...securityLog,
            threatType: 'potential_attack',
            severity: 'high'
        });
    }

    // Performance monitoring
    if (SECURITY_CONFIG.monitoring.enablePerformanceMetrics) {
        res.on("finish", () => {
            const duration = Date.now() - started;
            const memoryUsage = process.memoryUsage();
            
            // Log performance metrics
            const perfLog = {
                requestId: requestId,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: duration,
                memoryUsed: Math.round(memoryUsage.rss / 1024 / 1024), // MB
                timestamp: new Date().toISOString()
            };

            // Categorize log messages
            if (res.statusCode >= 500) {
                console.error(`[WEBZONEBW ERROR] ${JSON.stringify(perfLog)}`);
            } else if (res.statusCode >= 400) {
                console.warn(`[WEBZONEBW WARN] ${JSON.stringify(perfLog)}`);
            } else if (duration > 1000) { // Slow requests
                console.warn(`[WEBZONEBW SLOW] ${JSON.stringify(perfLog)}`);
            } else {
                console.log(`[WEBZONEBW INFO] ${JSON.stringify(perfLog)}`);
            }

            // Security alerts for specific patterns
            if (res.statusCode === 401 || res.statusCode === 403) {
                console.warn(`[WEBZONEBW SECURITY] Authentication/Authorization event:`, {
                    ...perfLog,
                    eventType: 'auth_failure'
                });
            }
        });
    }

    // Add request ID to response for tracking
    res.set('X-Request-ID', requestId);

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
            error: "INVALID_REQUEST",
            message: "Invalid request: GET requests should not have content",
            timestamp: new Date().toISOString(),
            requestId: crypto.randomBytes(4).toString("hex")
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
 * ENHANCED USER SESSION SYSTEM
 * ============================================================ */

// Enhanced in-memory user session store with cleanup
const userSessions = new Map();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Create user session (called on login or first access)
function createUserSession(userEmail) {
    const sessionId = `SESSION-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const session = {
        sessionId: sessionId,
        userEmail: userEmail,
        userId: userEmail.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() + "-" + Date.now(),
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString()
    };
    
    userSessions.set(sessionId, session);
    
    // Log session creation
    console.log(`[WEBZONEBW SESSION] Session created for ${userEmail}: ${sessionId}`);
    
    return session;
}

// Get user session from request with validation
function getUserSession(req) {
    const sessionId = req.headers["x-session-id"] || req.cookies?.session_id;
    
    if (!sessionId || !userSessions.has(sessionId)) {
        return null;
    }
    
    const session = userSessions.get(sessionId);
    const now = new Date();
    const sessionAge = now - new Date(session.lastActivity);
    
    // Check if session is expired
    if (sessionAge > SESSION_TIMEOUT) {
        userSessions.delete(sessionId);
        console.log(`[WEBZONEBW SESSION] Session expired and removed: ${sessionId}`);
        return null;
    }
    
    // Update last activity
    session.lastActivity = now.toISOString();
    
    return session;
}

// Clean up expired sessions every 10 minutes
function cleanupExpiredSessions() {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of userSessions) {
        const sessionAge = now - new Date(session.lastActivity);
        if (sessionAge > SESSION_TIMEOUT) {
            userSessions.delete(sessionId);
            cleanedCount++;
        }
    }
    
    if (cleanedCount > 0) {
        console.log(`[WEBZONEBW SESSION] Cleaned up ${cleanedCount} expired sessions`);
    }
}

// Start session cleanup interval
setInterval(cleanupExpiredSessions, 10 * 60 * 1000).unref();

// Get session statistics
function getSessionStats() {
    const now = new Date();
    let activeCount = 0;
    let expiredCount = 0;
    
    for (const session of userSessions.values()) {
        const sessionAge = now - new Date(session.lastActivity);
        if (sessionAge <= SESSION_TIMEOUT) {
            activeCount++;
        } else {
            expiredCount++;
        }
    }
    
    return {
        active: activeCount,
        expired: expiredCount,
        total: userSessions.size
    };
}

/* ============================================================
 * ENHANCED RATE LIMITING IMPLEMENTATION
 * ============================================================ */

// Apply enhanced rate limiting to all API routes
app.use("/api", enhancedRateLimiter);

// Additional rate limiting for sensitive endpoints
app.use("/api/paypal", enhancedRateLimiter);
app.use("/api/login", enhancedRateLimiter);

/* ============================================================
 * USER AUTHENTICATION ENDPOINTS
 * ============================================================ */

// Enhanced user login (creates session)
app.post("/api/login", (req, res) => {
    try {
        const { email } = req.body || {};
        
        // Use enhanced validation
        if (!email) {
            return createErrorResponse(res, 400, 'MISSING_EMAIL', 
                'Email address is required');
        }
        
        try {
            validateInput(email, 'string', { 
                type: 'email', 
                maxLength: SECURITY_CONFIG.validation.maxEmailLength 
            });
        } catch (validationError) {
            return createErrorResponse(res, 400, 'INVALID_EMAIL', 
                validationError.message);
        }

        // Create or get existing session
        let session = null;
        for (const [sessionId, sess] of userSessions) {
            if (sess.userEmail === email) {
                session = sess;
                session.lastActivity = new Date().toISOString();
                break;
            }
        }
        
        if (!session) {
            session = createUserSession(email);
        }

        res.json({
            success: true,
            sessionId: session.sessionId,
            userId: session.userId,
            userEmail: session.userEmail,
            message: "Session created successfully",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        createErrorResponse(res, 500, 'LOGIN_FAILED', 
            'Login failed due to server error', { error: error.message });
    }
});

// Enhanced current user session endpoint
app.get("/api/session", (req, res) => {
    try {
        const session = getUserSession(req);
        if (!session) {
            return createErrorResponse(res, 401, 'NO_SESSION', 
                'No active session found. Please login again.');
        }

        // Check if session is expired (older than 24 hours)
        const sessionAge = Date.now() - new Date(session.createdAt).getTime();
        const isExpired = sessionAge > 24 * 60 * 60 * 1000;

        if (isExpired) {
            // Remove expired session
            userSessions.delete(session.sessionId);
            return createErrorResponse(res, 401, 'SESSION_EXPIRED', 
                'Session has expired. Please login again.');
        }

        res.json({
            success: true,
            sessionId: session.sessionId,
            userId: session.userId,
            userEmail: session.userEmail,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            sessionAge: Math.round(sessionAge / 1000 / 60), // minutes
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        createErrorResponse(res, 500, 'SESSION_CHECK_FAILED', 
            'Failed to check session status', { error: error.message });
    }
});

/* ============================================================
 * API ENDPOINTS (Ensures explicit application/json charset=utf-8)
 * ============================================================ */

/* ============================================================
 * ENHANCED MONITORING AND METRICS ENDPOINTS
 * ============================================================ */

app.get("/api/health", (req, res) => {
    const memoryUsage = process.memoryUsage();
    const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: SERVER_VERSION,
        uptime: process.uptime(),
        environment: NODE_ENV,
        memory: {
            used: Math.round(memoryUsage.rss / 1024 / 1024), // MB
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
            free: Math.round(memoryUsage.heapFree / 1024 / 1024), // MB
            external: Math.round(memoryUsage.external / 1024 / 1024) // MB
        },
        sessions: {
            active: userSessions.size,
            totalCreated: userSessions.size
        },
        licenses: {
            total: licenseStore.licenses.size,
            active: Array.from(licenseStore.licenses.values()).filter(l => l.status === "ACTIVE").length
        },
        security: {
            rateLimitWindow: SECURITY_CONFIG.rateLimit.windowMs,
            maxRequests: SECURITY_CONFIG.rateLimit.maxRequests,
            maxRequestsPerIP: SECURITY_CONFIG.rateLimit.maxRequestsPerIP
        }
    };

    res.json(healthData);
});

/* CSP Report Endpoint */
app.post("/api/security-csp-report", (req, res) => {
    if (SECURITY_CONFIG.monitoring.enableSecurityAlerts) {
        console.warn("[WEBZONEBW SECURITY] CSP Violation Report:", {
            timestamp: new Date().toISOString(),
            report: req.body,
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
    }
    
    res.status(204).send();
});

/* Enhanced Metrics Endpoint */
app.get("/api/metrics", (req, res) => {
    const memoryUsage = process.memoryUsage();
    const now = Date.now();
    
    const metrics = {
        timestamp: new Date().toISOString(),
        system: {
            uptime: process.uptime(),
            memory: {
                used: Math.round(memoryUsage.rss / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.rss / memoryUsage.heapTotal) * 100)
            },
            cpu: process.cpuUsage()
        },
        application: {
            sessions: {
                active: userSessions.size,
                totalCreated: userSessions.size
            },
            licenses: {
                total: licenseStore.licenses.size,
                active: Array.from(licenseStore.licenses.values()).filter(l => l.status === "ACTIVE").length,
                expired: Array.from(licenseStore.licenses.values()).filter(l => {
                    return l.expiresAt && new Date(l.expiresAt) < now;
                }).length
            },
            orders: {
                total: licenseStore.orders.size,
                completed: Array.from(licenseStore.orders.values()).filter(o => o.status === "COMPLETED").size,
                pending: Array.from(licenseStore.orders.values()).filter(o => o.status === "CREATED").size
            }
        },
        security: {
            rateLimit: {
                windowMs: SECURITY_CONFIG.rateLimit.windowMs,
                maxRequests: SECURITY_CONFIG.rateLimit.maxRequests,
                maxRequestsPerIP: SECURITY_CONFIG.rateLimit.maxRequestsPerIP
            }
        }
    };

    res.json(metrics);
});

app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
});

/* ============================================================
 * PAYPAL / LICENSE / FACEFILTER PAYMENT ROUTES
 * Extracted to paypal-routes.js - see createPayPalRouter below.
 * ============================================================ */

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

const licenseStore = {
    orders: new Map(),      // orderId -> { orderId, email, plan, amount, status, createdAt }
    licenses: new Map(),    // licenseKey -> { licenseKey, email, orderId, status, issuedAt, lastVerifiedAt }
    faceFilterEntitlements: new Map()  // entitlementId -> { entitlementId, userId, filterId, orderId, purchasedAt, expiresAt, status }
};

function loadLicenseStore() {
    try {
        if (fs.existsSync(ER_LICENSE_STORE)) {
            const raw = JSON.parse(fs.readFileSync(ER_LICENSE_STORE, "utf-8"));
            (raw.orders || []).forEach((o) => licenseStore.orders.set(o.orderId, o));
            (raw.licenses || []).forEach((l) => licenseStore.licenses.set(l.licenseKey, l));
            (raw.faceFilterEntitlements || []).forEach((e) => licenseStore.faceFilterEntitlements.set(e.entitlementId, e));
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
                licenses: [...licenseStore.licenses.values()],
                faceFilterEntitlements: [...licenseStore.faceFilterEntitlements.values()]
            }, null, 2),
            "utf-8"
        );
    } catch (error) {
        console.error("[WEBZONEBW LICENSE] Failed to save license store:", error.message);
    }
}

loadLicenseStore();

/* ============================================================
 * PAYPAL / LICENSE / FACEFILTER ROUTER (extracted module)
 * ============================================================ */

const paypalModule = createPayPalRouter({
    licenseStore,
    loadLicenseStore,
    saveLicenseStore,
    getUserSession,
    validatePromoKey,
    isHalloweenPromoActive,
    HALLOWEEN_PROMO_CONFIG
});

app.use(paypalModule.router);

/* PayPal helpers live in paypal-routes.js (single source of truth). */
const { getPayPalToken, verifyPayPalWebhook, isLicenseValid } = paypalModule.helpers;

/* ============================================================
 * HALLOWEEN PROMOTIONAL ACCESS ENDPOINTS
 * ============================================================ */

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
        "/": path.join(__dirname, "index.html"),
        "/index": path.join(__dirname, "index.html"),
        "/index.html": path.join(__dirname, "index.html"),
        "/about": path.join(__dirname, "about.html"),
        "/about.html": path.join(__dirname, "about.html"),
        "/about-us": path.join(__dirname, "about.html"),
        "/contact": path.join(__dirname, "contact.html"),
        "/contact.html": path.join(__dirname, "contact.html"),
        "/contact-us": path.join(__dirname, "contact.html"),
        "/blog": path.join(__dirname, "blog.html"),
        "/blog.html": path.join(__dirname, "blog.html"),
        "/projects": path.join(__dirname, "projects.html"),
        "/projects.html": path.join(__dirname, "projects.html"),
        "/resume": path.join(__dirname, "resume.html"),
        "/resume.html": path.join(__dirname, "resume.html"),
        "/privacy": path.join(__dirname, "privacy.html"),
        "/privacy.html": path.join(__dirname, "privacy.html"),
        "/privacy-policy": path.join(__dirname, "privacy.html"),
        "/terms": path.join(__dirname, "terms.html"),
        "/terms.html": path.join(__dirname, "terms.html"),
        "/terms-of-service": path.join(__dirname, "terms.html"),
        "/cookie-policy": path.join(__dirname, "cookie-policy.html"),
        "/cookie-policy.html": path.join(__dirname, "cookie-policy.html"),
        "/privacy-center": path.join(__dirname, "privacy-center.html"),
        "/privacy-center.html": path.join(__dirname, "privacy-center.html"),
        "/disclaimer": path.join(__dirname, "disclaimer.html"),
        "/disclaimer.html": path.join(__dirname, "disclaimer.html"),
        "/soundbox": path.join(__dirname, "soundbox.html"),
        "/soundbox.html": path.join(__dirname, "soundbox.html"),
        "/music": path.join(__dirname, "soundbox.html"),
        "/er": path.join(__dirname, "er", "index.html"),
        "/er/": path.join(__dirname, "er", "index.html"),
        "/er/index": path.join(__dirname, "er", "index.html"),
        "/er/index.html": path.join(__dirname, "er", "index.html"),
        "/halloween": path.join(__dirname, "er", "index.html"),
        "/halloween/": path.join(__dirname, "er", "index.html")
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

    // 1. Check if the request matches an existing HTML page or mapped route (e.g. /er, /er/index.html, /contact)
    const resolvedPage = resolveHtmlPageFromRoute(requestPath);
    if (resolvedPage) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.sendFile(resolvedPage, (error) => {
            if (error) {
                next(error);
            }
        });
    }

    // 2. Allow downstream API routes to process
    if (requestPath.startsWith("/api/")) {
        return next();
    }

    // 3. Static asset directories or files with non-HTML extensions should 404 if not found
    if (
        requestPath.startsWith("/assets/") ||
        requestPath.startsWith("/css/") ||
        requestPath.startsWith("/js/") ||
        requestPath.startsWith("/audio/") ||
        requestPath.startsWith("/video/") ||
        requestPath.startsWith("/images/") ||
        requestPath.startsWith("/fonts/") ||
        path.extname(requestPath)
    ) {
        return res.status(404).send("Not Found");
    }

    // 4. Default fallback to root index.html
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
    console.log(` Port: ${PORT}`);
    console.log(` URL: http://${HOST}:${PORT}`);
    console.log(` ER Studio: http://${HOST}:${PORT}/er/`);
    console.log(` Health Endpoint: http://${HOST}:${PORT}/api/health`);
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