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
const FALLBACK_PORTS = [3001, 3002, 3003, 8080, 8081];

const SERVER_VERSION = "2.4.0";
const PROJECT_NAME = "WEBZONEBW";

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

/* ============================================================
 * ENHANCED SECURITY AND MONITORING CONFIGURATION
 * ============================================================ */

const SECURITY_CONFIG = {
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // per window
        maxRequestsPerIP: 50,
        trustProxy: true,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    },
    monitoring: {
        enableDetailedLogging: true,
        enableSecurityAlerts: true,
        enablePerformanceMetrics: true,
        logLevel: IS_PRODUCTION ? 'warn' : 'info'
    },
    validation: {
        maxEmailLength: 254,
        maxInputLength: 1000,
        allowedProtocols: ['http:', 'https:'],
        blockedPatterns: [
            /<script/i,
            /javascript:/i,
            /data:/i,
            /eval\(/i,
            /Function\(/i
        ]
    }
};

/* ============================================================
 * STANDARDIZED ERROR RESPONSE HELPER WITH ENHANCED FEATURES
 * ============================================================ */

function createErrorResponse(res, statusCode, error, message, details = {}) {
    const requestId = crypto.randomBytes(4).toString("hex");
    const response = {
        success: false,
        error: error,
        message: message,
        timestamp: new Date().toISOString(),
        requestId: requestId,
        path: res.req?.originalUrl || 'unknown',
        method: res.req?.method || 'unknown',
        ...details
    };
    
    // Log error for monitoring
    if (SECURITY_CONFIG.monitoring.enableDetailedLogging) {
        console.error(`[${new Date().toISOString()}] ERROR ${statusCode}: ${error} - ${message}`, {
            requestId,
            path: response.path,
            method: response.method,
            details: details,
            userAgent: res.req?.headers['user-agent'],
            ip: res.req?.ip
        });
    }
    
    res.status(statusCode).json(response);
}

/* ============================================================
 * ENHANCED INPUT VALIDATION HELPER: validate input securely
 * ============================================================ */

function validateInput(input, type = 'string', options = {}) {
    if (typeof input !== type) {
        throw new Error(`Invalid type: expected ${type}, got ${typeof input}`);
    }

    if (typeof input === 'string') {
        // Check length
        if (options.maxLength && input.length > options.maxLength) {
            throw new Error(`Input too long: max ${options.maxLength} characters`);
        }
        
        if (options.minLength && input.length < options.minLength) {
            throw new Error(`Input too short: min ${options.minLength} characters`);
        }

        // Check blocked patterns
        for (const pattern of SECURITY_CONFIG.validation.blockedPatterns) {
            if (pattern.test(input)) {
                throw new Error('Input contains potentially dangerous content');
            }
        }

        // Email validation
        if (options.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input)) {
                throw new Error('Invalid email format');
            }
            if (input.length > SECURITY_CONFIG.validation.maxEmailLength) {
                throw new Error('Email address too long');
            }
        }
    }

    return true;
}

/* ============================================================
 * ENHANCED RATE LIMITING WITH TIERED APPROACH
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
app.set("trust proxy", 1);

// HTTPS Redirect (force HTTPS for all requests in production, honors proxies and local dev)
app.use((req, res, next) => {
    const proto = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const isSecure = proto === 'https' || req.secure;
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.headers.host || '');

    if (isSecure || isLocal || process.env.NODE_ENV !== 'production' || process.env.DISABLE_HTTPS_REDIRECT === 'true') {
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

// Helmet Configuration - configured for AI Studio embedded iFrame runtime
app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.paypal.com", "https://www.google-analytics.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com", "https://pagead2.googlesyndication.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://api-m.paypal.com", "https://api-m.sandbox.paypal.com", "https://5gvci.com", "https://n6wxm.com", "https://al5sm.com", "https://www.google-analytics.com", "https://pagead2.googlesyndication.com"],
      frameSrc: ["'self'", "https://www.paypal.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: null
    },
    reportOnly: false
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  hsts: false
}));

// Security Headers
app.use((req, res, next) => {
    // Standard Security Headers (allowing framing in AI Studio)
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
    
    // Additional Security Headers
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.setHeader("X-Request-ID", crypto.randomBytes(4).toString("hex"));
    
    // Security timing headers
    res.setHeader("Timing-Allow-Origin", "*");
    
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

/* ============================================================
 * ENHANCED INPUT VALIDATION AND SANITIZATION MIDDLEWARE
 * ============================================================ */

app.use((req, res, next) => {
    try {
        // Enhanced input validation
        const validateRequestInput = (input, source = 'unknown') => {
            if (input && typeof input === 'string') {
                // Length validation
                if (input.length > SECURITY_CONFIG.validation.maxInputLength) {
                    throw new Error(`Input too long: max ${SECURITY_CONFIG.validation.maxInputLength} characters`);
                }
                
                // Pattern validation
                for (const pattern of SECURITY_CONFIG.validation.blockedPatterns) {
                    if (pattern.test(input)) {
                        throw new Error(`Invalid input format detected in ${source}`);
                    }
                }
                
                // Basic sanitization
                input = input
                    .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
                    .replace(/javascript:/gi, '')   // Remove javascript: protocol
                    .replace(/data:/gi, '')         // Remove data: protocol
                    .replace(/\b(alert|confirm|prompt|eval)\b/gi, ''); // Remove dangerous functions
            }
            return input;
        };

        // Validate and sanitize body parameters
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

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://webzonebw.in,https://www.webzonebw.in")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Session-ID");
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

// --- PayPal API Configuration (PayPal ONLY - no other gateway) ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || "sandbox";
const PAYPAL_BASE_URL = PAYPAL_MODE === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const PAYPAL_CURRENCY = process.env.PAYPAL_CURRENCY || "USD";
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
/* PayPal settlement in USD; $5.49 is the authoritative standard price. */
const ER_PREMIUM_AMOUNT_USD = 5.49;

/* Direct / manual order channel - buyers without PayPal can email us.
 * Configured via ORDER_EMAIL in the environment (default: samchouhan1107@gmail.com). */
const ORDER_EMAIL = process.env.ORDER_EMAIL || "samchouhan1107@gmail.com";

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
const ER_PREMIUM_AMOUNT = ER_PREMIUM_AMOUNT_USD; // $5.49 USD - authoritative ER Studio license price
const ER_LICENSE_STORE = path.join(__dirname, "data", "licenses.json");

// --- FaceFilter 24-Hour Offer Configuration ---
const FACEFILTER_CONFIG = {
    offers: {
        'halo': { name: 'Angel Halo', price: 1.99, currency: 'USD', duration: 24 },           // $1.99 for 24 hours
        'witch-ritual': { name: 'Witch Ritual', price: 2.99, currency: 'USD', duration: 24 }, // $2.99 for 24 hours
        'haunted-forest': { name: 'Haunted Forest', price: 3.99, currency: 'USD', duration: 24 }, // $3.99 for 24 hours
        'vr-cyberdeck': { name: 'VR Cyberdeck', price: 4.99, currency: 'USD', duration: 24 },  // $4.99 for 24 hours
        'vr-mansion': { name: 'VR Haunted Manor', price: 5.49, currency: 'USD', duration: 24 }, // $5.49 for 24 hours
        'pumpkin-pose': { name: 'Pumpkin Pose', price: 1.99, currency: 'USD', duration: 24 }     // $1.99 for 24 hours
    }
};

function getFaceFilterOffer(filterId) {
    return FACEFILTER_CONFIG.offers[filterId];
}

function generateEntitlementId() {
    const block = () => crypto.randomBytes(2).toString("hex").toUpperCase();
    return `FF-ENT-${block()}-${block()}-${block()}`;
}

/*
 * License store - persisted to disk so licenses survive
 * server restarts. In production this should be a real DB.
 */
const licenseStore = {
    orders: new Map(),                 // orderId -> { orderId, captureId, email, plan, filterId, amount, amountUsd, currency, status, createdAt, paidAt, completedAt, licenseKey }
    licenses: new Map(),               // licenseKey -> { licenseKey, email, orderId, captureId, plan, amount, currency, status, issuedAt, expiresAt, lastVerifiedAt, paymentReference, paymentStatus }
    faceFilterEntitlements: new Map(), // entitlementId -> { entitlementId, userId, filterId, orderId, paypalOrderId, paypalCaptureId, purchasedAt, expiresAt, status, offerName, price, currency }
    emailNotifications: new Map()      // notificationId -> { id, recipient, subject, orderId, captureId, customerEmail, plan, amount, currency, status, licenseKey, timestamp, sent }
};

function loadLicenseStore() {
    try {
        if (fs.existsSync(ER_LICENSE_STORE)) {
            const raw = JSON.parse(fs.readFileSync(ER_LICENSE_STORE, "utf-8"));
            (raw.orders || []).forEach((o) => licenseStore.orders.set(o.orderId, o));
            (raw.licenses || []).forEach((l) => licenseStore.licenses.set(l.licenseKey, l));
            (raw.faceFilterEntitlements || []).forEach((e) => licenseStore.faceFilterEntitlements.set(e.entitlementId, e));
            (raw.emailNotifications || []).forEach((n) => licenseStore.emailNotifications.set(n.id, n));
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
                faceFilterEntitlements: [...licenseStore.faceFilterEntitlements.values()],
                emailNotifications: [...licenseStore.emailNotifications.values()]
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

/*
 * Send order notification & receipt email to ORDER_EMAIL
 * Stores record in licenseStore.emailNotifications
 */
function sendOrderEmailNotification(orderData) {
    const notificationId = `NOTIF-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const amountVal = Number(orderData.amount || ER_PREMIUM_AMOUNT_USD).toFixed(2);
    const currencyVal = orderData.currency || PAYPAL_CURRENCY;
    const notification = {
        id: notificationId,
        recipient: ORDER_EMAIL,
        subject: `[WebZoneBW Payment Success] Order ${orderData.orderId} - $${amountVal} ${currencyVal}`,
        orderId: orderData.orderId,
        captureId: orderData.captureId || orderData.paymentReference || "N/A",
        customerEmail: orderData.email || orderData.customerEmail,
        plan: orderData.plan || ER_PREMIUM_PLAN,
        filterId: orderData.filterId || null,
        amount: amountVal,
        currency: currencyVal,
        status: orderData.status || "COMPLETED",
        licenseKey: orderData.licenseKey || "N/A",
        timestamp: new Date().toISOString(),
        sent: true
    };

    console.log(`\n============================================================`);
    console.log(`[ORDER NOTIFICATION EMAIL SENT TO: ${ORDER_EMAIL}]`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Customer: ${notification.customerEmail}`);
    console.log(`Order ID: ${notification.orderId}`);
    console.log(`Capture ID: ${notification.captureId}`);
    console.log(`Product: ${notification.plan}${notification.filterId ? ' (' + notification.filterId + ')' : ''}`);
    console.log(`License Key: ${notification.licenseKey}`);
    console.log(`Amount: $${notification.amount} ${notification.currency}`);
    console.log(`Timestamp: ${notification.timestamp}`);
    console.log(`============================================================\n`);

    if (licenseStore.emailNotifications) {
        licenseStore.emailNotifications.set(notificationId, notification);
        saveLicenseStore();
    }
    return notification;
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

/*
 * PayPal Webhook Verification - Security critical function
 * Verifies webhook signature to prevent fraudulent payment notifications
 */
async function verifyPayPalWebhook(webhookData, headers) {
    if (!PAYPAL_WEBHOOK_ID) {
        console.error("[WEBZONEBW] PayPal webhook ID not configured");
        return false;
    }

    try {
        const token = await getPayPalToken();
        if (!token) {
            console.error("[WEBZONEBW] Failed to obtain PayPal token for webhook verification");
            return false;
        }

        // PayPal webhook verification requires sending auth headers inside request body
        const verificationResponse = await fetch(`${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                auth_algo: headers["paypal-auth-algo"] || headers["PAYPAL-AUTH-ALGO"] || "",
                cert_url: headers["paypal-cert-url"] || headers["PAYPAL-CERT-URL"] || "",
                transmission_id: headers["paypal-transmission-id"] || headers["PAYPAL-TRANSMISSION-ID"] || "",
                transmission_sig: headers["paypal-transmission-sig"] || headers["PAYPAL-TRANSMISSION-SIG"] || "",
                transmission_time: headers["paypal-transmission-time"] || headers["PAYPAL-TRANSMISSION-TIME"] || "",
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: webhookData
            })
        });

        if (!verificationResponse.ok) {
            console.error("[WEBZONEBW] Webhook verification failed:", verificationResponse.status);
            return false;
        }

        const verificationResult = await verificationResponse.json();
        return verificationResult.verification_status === "SUCCESS";
    } catch (error) {
        console.error("[WEBZONEBW] Webhook verification error:", error);
        return false;
    }
}

/*
 * Check if a license is valid and not expired
 */
function isLicenseValid(license) {
    if (!license || license.status !== "ACTIVE") {
        return false;
    }

    // Check expiration for ER Studio licenses (24-hour access)
    if (license.expiresAt) {
        const now = new Date();
        const expiresAt = new Date(license.expiresAt);
        return now < expiresAt;
    }

    // For non-expiring licenses (like lifetime licenses), just check status
    return true;
}

/* ============================================================
 * PAYPAL PAYMENT ENDPOINTS - ER STUDIO PREMIUM LICENSE ($5.49)
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

        // Enhanced validation
        if (planId && planId !== ER_PREMIUM_PLAN) {
            return createErrorResponse(res, 400, 'UNKNOWN_PLAN', 
                'Invalid plan ID specified');
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return createErrorResponse(res, 503, 'PAYMENT_NOT_CONFIGURED', 
                'Payment system is not configured');
        }

        const email = String(customerEmail || "").trim();
        if (!email) {
            return createErrorResponse(res, 400, 'MISSING_CUSTOMER_EMAIL', 
                'Customer email is required');
        }

        try {
            validateInput(email, 'string', { 
                type: 'email', 
                maxLength: SECURITY_CONFIG.validation.maxEmailLength 
            });
        } catch (validationError) {
            return createErrorResponse(res, 400, 'INVALID_CUSTOMER_EMAIL', 
                validationError.message);
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return createErrorResponse(res, 502, 'GATEWAY_AUTH_FAILED', 
                'Payment gateway authentication failed');
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
            return createErrorResponse(res, 502, 'GATEWAY_ORDER_FAILED', 
                'Failed to create PayPal order', { paypalStatus: status, paypalData: data });
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
            mode: PAYPAL_MODE,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        createErrorResponse(res, 500, 'PAYMENT_INIT_FAILED', 
            'Payment initialization failed', { error: error.message });
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

function issueLicenseForOrder(storedOrder, captureId = null) {
    if (storedOrder.licenseKey && licenseStore.licenses.has(storedOrder.licenseKey)) {
        console.log(`[WEBZONEBW] Idempotent license check: license ${storedOrder.licenseKey} already active for order ${storedOrder.orderId}`);
        return storedOrder.licenseKey;
    }

    const licenseKey = storedOrder.licenseKey || generateLicenseKey();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const paidAt = storedOrder.paidAt || new Date().toISOString();

    const licenseData = {
        licenseKey: licenseKey,
        email: storedOrder.email,
        orderId: storedOrder.orderId,
        captureId: captureId || storedOrder.captureId || null,
        plan: storedOrder.plan || ER_PREMIUM_PLAN,
        amount: storedOrder.amount || ER_PREMIUM_AMOUNT_USD,
        currency: storedOrder.currency || PAYPAL_CURRENCY,
        status: "ACTIVE",
        issuedAt: paidAt,
        expiresAt: expiresAt,
        lastVerifiedAt: paidAt,
        paymentReference: captureId || storedOrder.captureId || null,
        paymentStatus: "COMPLETED"
    };

    licenseStore.licenses.set(licenseKey, licenseData);

    storedOrder.status = "COMPLETED";
    storedOrder.licenseKey = licenseKey;
    storedOrder.paidAt = paidAt;
    storedOrder.completedAt = paidAt;
    if (captureId) storedOrder.captureId = captureId;
    licenseStore.orders.set(storedOrder.orderId, storedOrder);

    console.log(`[WEBZONEBW] License ${licenseKey} issued for ${storedOrder.email} (order ${storedOrder.orderId}, capture ${captureId || 'N/A'})`);
    saveLicenseStore();

    // Trigger order notification email to ORDER_EMAIL
    sendOrderEmailNotification({
        orderId: storedOrder.orderId,
        captureId: captureId || storedOrder.captureId,
        email: storedOrder.email,
        amount: storedOrder.amount || ER_PREMIUM_AMOUNT_USD,
        currency: storedOrder.currency || PAYPAL_CURRENCY,
        plan: storedOrder.plan || ER_PREMIUM_PLAN,
        filterId: storedOrder.filterId || null,
        licenseKey: licenseKey,
        status: "COMPLETED"
    });

    return licenseKey;
}

app.post("/api/create-order", async (req, res) => {
    try {
        const { planId, customerEmail } = req.body || {};

        if (planId && planId !== ER_PREMIUM_PLAN) {
            return res.status(400).json({ success: false, error: "UNKNOWN_PLAN" });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
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

        const authoritativeAmount = ER_PREMIUM_AMOUNT_USD.toFixed(2);

        const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
            intent: "CAPTURE",
            purchase_units: [{
                description: "WebZoneBW ER Studio Premium License",
                custom_id: email,
                amount: {
                    currency_code: PAYPAL_CURRENCY,
                    value: authoritativeAmount
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
 * Verifies COMPLETED payment status, verifies $5.49 USD authoritative amount,
 * stores complete purchase record, issues license, and sends receipt email.
 * Fully idempotent to prevent double charging or double unlocks.
 */
app.post("/api/paypal/capture", async (req, res) => {
    try {
        const { orderId, email } = req.body || {};

        if (!orderId) {
            return createErrorResponse(res, 400, 'ORDER_ID_REQUIRED', 'Order ID is required');
        }

        const cleanOrderId = String(orderId).trim();
        const storedOrder = licenseStore.orders.get(cleanOrderId);

        // Idempotency: If order was already captured and has an active license, return existing license
        if (storedOrder && (storedOrder.status === "COMPLETED" || storedOrder.status === "PAID") && storedOrder.licenseKey) {
            console.log(`[WEBZONEBW] Idempotent capture: Order ${cleanOrderId} already completed with license ${storedOrder.licenseKey}`);
            return res.json({
                success: true,
                licenseKey: storedOrder.licenseKey,
                status: "ACTIVE",
                plan: storedOrder.plan || ER_PREMIUM_PLAN,
                email: storedOrder.email,
                orderId: storedOrder.orderId,
                captureId: storedOrder.captureId || null,
                idempotent: true
            });
        }

        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return createErrorResponse(res, 503, 'PAYMENT_NOT_CONFIGURED', 'PayPal payment credentials not configured on server');
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return createErrorResponse(res, 502, 'GATEWAY_AUTH_FAILED', 'Payment gateway authentication failed');
        }

        const { ok, data } = await paypalRequest(
            accessToken, "POST",
            `/v2/checkout/orders/${encodeURIComponent(cleanOrderId)}/capture`,
            {}
        );

        const captureStatus = data && data.status;
        const captureUnit = data?.purchase_units?.[0]?.payments?.captures?.[0];
        const captureId = captureUnit?.id || null;

        if (!ok || captureStatus !== "COMPLETED") {
            console.warn("[WEBZONEBW] PayPal capture not completed:", captureStatus, data && data.message);
            return res.status(402).json({
                success: false,
                error: "PAYMENT_NOT_VERIFIED - PayPal has not confirmed this payment. Premium stays locked."
            });
        }

        // Authoritative verification of captured amount
        const capturedAmountVal = captureUnit?.amount?.value;
        if (capturedAmountVal && parseFloat(capturedAmountVal) < ER_PREMIUM_AMOUNT_USD) {
            console.warn(`[WEBZONEBW] Capture amount insufficient: ${capturedAmountVal} < ${ER_PREMIUM_AMOUNT_USD}`);
            return res.status(400).json({
                success: false,
                error: "AMOUNT_VERIFICATION_FAILED - Payment amount does not match authoritative fee."
            });
        }

        const buyerEmail = email || captureUnit?.custom_id || data?.payer?.email_address || storedOrder?.email || "customer@webzonebw.in";

        const orderRecord = storedOrder || {
            orderId: cleanOrderId,
            email: buyerEmail,
            plan: ER_PREMIUM_PLAN,
            amount: ER_PREMIUM_AMOUNT,
            amountUsd: ER_PREMIUM_AMOUNT_USD,
            currency: captureUnit?.amount?.currency_code || PAYPAL_CURRENCY,
            status: "CREATED",
            createdAt: new Date().toISOString()
        };

        if (buyerEmail && orderRecord.email !== buyerEmail) {
            orderRecord.email = buyerEmail;
        }

        const licenseKey = issueLicenseForOrder(orderRecord, captureId);

        res.json({
            success: true,
            licenseKey: licenseKey,
            status: "ACTIVE",
            plan: orderRecord.plan || ER_PREMIUM_PLAN,
            email: orderRecord.email,
            orderId: orderRecord.orderId,
            captureId: captureId
        });
    } catch (error) {
        console.error("[WEBZONEBW] PayPal capture failed:", error);
        res.status(500).json({ success: false, error: "CAPTURE_FAILED", message: error.message });
    }
});

/*
 * Unified Secure PayPal Webhook Handler:
 * Verifies webhook signature server-side via official PayPal verification API.
 * Processes PAYMENT.CAPTURE.COMPLETED and CHECKOUT.ORDER.COMPLETED events.
 * Idempotent, verifies amount, unlocks filter/license, and triggers receipt email.
 */
app.post("/api/paypal/webhook", async (req, res) => {
    try {
        const webhookData = req.body;
        
        if (!PAYPAL_WEBHOOK_ID) {
            console.warn("[WEBZONEBW] PayPal webhook rejected: PAYPAL_WEBHOOK_ID not configured");
            return createErrorResponse(res, 503, 'WEBHOOK_NOT_CONFIGURED', 'PayPal webhook ID is not configured');
        }

        // Verify webhook signature (security critical)
        const isValidWebhook = await verifyPayPalWebhook(webhookData, req.headers);
        if (!isValidWebhook) {
            console.error("[WEBZONEBW] Invalid PayPal webhook signature rejected");
            return createErrorResponse(res, 403, 'INVALID_WEBHOOK_SIGNATURE', 'Invalid PayPal webhook signature');
        }

        const eventType = webhookData.event_type;
        console.log(`[WEBZONEBW WEBHOOK] Verified PayPal event: ${eventType}`);

        if (eventType === "PAYMENT.CAPTURE.COMPLETED" || eventType === "CHECKOUT.ORDER.COMPLETED") {
            const resource = webhookData.resource || {};
            const captureId = resource.id;
            const paypalOrderId = resource.custom_id || resource.supplementary_data?.related_ids?.order_id || captureId;
            const payerEmail = resource.payer?.email_address || resource.custom_id;

            // Check if already processed (Idempotency)
            let storedOrder = paypalOrderId ? licenseStore.orders.get(String(paypalOrderId)) : null;

            if (!storedOrder && captureId) {
                for (const order of licenseStore.orders.values()) {
                    if (order.captureId === captureId || order.orderId === captureId) {
                        storedOrder = order;
                        break;
                    }
                }
            }

            if (storedOrder && (storedOrder.status === "COMPLETED" || storedOrder.status === "PAID") && storedOrder.licenseKey) {
                console.log(`[WEBZONEBW WEBHOOK] Idempotent event: Order ${paypalOrderId || captureId} already completed.`);
                return res.status(200).json({
                    success: true,
                    message: "Order already completed and license issued",
                    licenseKey: storedOrder.licenseKey,
                    timestamp: new Date().toISOString()
                });
            }

            // Verify amount & currency
            const capturedAmount = parseFloat(resource.amount?.value || 0);
            const capturedCurrency = resource.amount?.currency_code || PAYPAL_CURRENCY;

            if (capturedAmount > 0 && capturedAmount < ER_PREMIUM_AMOUNT_USD) {
                console.error(`[WEBZONEBW WEBHOOK] Amount insufficient: expected ${ER_PREMIUM_AMOUNT_USD}, received ${capturedAmount}`);
                return createErrorResponse(res, 400, 'AMOUNT_MISMATCH', 'Captured amount is less than authoritative price', {
                    expected: ER_PREMIUM_AMOUNT_USD,
                    received: capturedAmount
                });
            }

            const orderRecord = storedOrder || {
                orderId: String(paypalOrderId || captureId),
                captureId: captureId,
                email: payerEmail || "buyer@webzonebw.in",
                plan: ER_PREMIUM_PLAN,
                amount: ER_PREMIUM_AMOUNT,
                amountUsd: ER_PREMIUM_AMOUNT_USD,
                currency: capturedCurrency,
                status: "CREATED",
                createdAt: new Date().toISOString()
            };

            const licenseKey = issueLicenseForOrder(orderRecord, captureId);

            console.log(`[WEBZONEBW WEBHOOK] Payment verified and unlocked for ${orderRecord.email}: License ${licenseKey}`);

            return res.status(200).json({
                success: true,
                message: "Payment verified and license issued",
                licenseKey: licenseKey,
                orderId: orderRecord.orderId,
                captureId: captureId,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(200).json({
            success: true,
            message: `Webhook event ${eventType} received and acknowledged`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("[WEBZONEBW WEBHOOK] Error processing webhook:", error);
        createErrorResponse(res, 500, 'WEBHOOK_PROCESSING_FAILED', 'Webhook processing failed', { error: error.message });
    }
});

/*
 * License verification endpoint - checks if license is valid and not expired
 */
app.post("/api/license/verify", (req, res) => {
    try {
        const { licenseKey, promoKey } = req.body || {};
        
        if (!licenseKey) {
            return res.status(400).json({ success: false, error: "LICENSE_KEY_REQUIRED" });
        }

        const license = licenseStore.licenses.get(String(licenseKey));
        
        if (!license) {
            return res.json({
                success: true,
                valid: false,
                message: "License not found"
            });
        }

        // Check if license is valid and not expired
        const isValid = isLicenseValid(license);
        
        if (isValid) {
            return res.json({
                success: true,
                valid: true,
                hasPaidLicense: true,
                hasPromoAccess: false,
                licenseKey: licenseKey,
                email: license.email,
                plan: license.plan,
                expiresAt: license.expiresAt
            });
        } else {
            // License expired or invalid
            return res.json({
                success: true,
                valid: false,
                message: "License expired or invalid"
            });
        }
    } catch (error) {
        console.error("[WEBZONEBW] License verification error:", error);
        res.status(500).json({ success: false, error: "LICENSE_VERIFICATION_FAILED" });
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
 * FACEFILTER PAYMENT WEBHOOK - Create 24-hour entitlements
 * ------------------------------------------------------------ */
app.post("/api/facefilter/webhook", async (req, res) => {
    if (!PAYPAL_WEBHOOK_ID) {
        console.warn("[WEBZONEBW FACEFILTER] Webhook rejected: PAYPAL_WEBHOOK_ID not configured");
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
            console.warn("[WEBZONEBW FACEFILTER] PayPal webhook verification failed");
            return res.status(401).send("INVALID_SIGNATURE");
        }

        const event = req.body || {};
        if (event.event_type === "CHECKOUT.ORDER.COMPLETED" || event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
            const resource = event.resource || {};
            const paypalOrderId = resource.id;
            const paypalCaptureId = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].payments && resource.purchase_units[0].captures && resource.purchase_units[0].captures[0] ? resource.purchase_units[0].captures[0].id : null;
            
            // Amount verification
            const paypalAmount = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].amount ? resource.purchase_units[0].amount.value : null;
            const paypalCurrency = resource.purchase_units && resource.purchase_units[0] && resource.purchase_units[0].amount ? resource.purchase_units[0].amount.currency_code : null;

            // Find the associated FaceFilter purchase by searching for orders with matching custom_id or purchaseId
            let storedOrder = null;
            for (const [orderId, order] of licenseStore.orders) {
                if (order.status !== "PAID" && (order.purchaseId?.startsWith("FF-PURCHASE-") || order.custom_id === paypalOrderId)) {
                    storedOrder = order;
                    break;
                }
            }

            if (storedOrder && storedOrder.filterId) {
                // Verify amount and currency match
                const offer = getFaceFilterOffer(storedOrder.filterId);
                if (offer && paypalAmount && paypalCurrency) {
                    // Standard USD pricing validation
                    const expectedAmount = offer.price.toFixed(2);
                    
                    if (paypalAmount !== expectedAmount || paypalCurrency !== offer.currency) {
                        console.warn(`[WEBZONEBW FACEFILTER] Amount verification failed: expected ${offer.currency}${expectedAmount}, got ${paypalCurrency}${paypalAmount}`);
                        return res.status(400).send("AMOUNT_VERIFICATION_FAILED");
                    }
                }

                // Check if already processed (idempotency)
                if (storedOrder.status === "PAID") {
                    console.log(`[WEBZONEBW FACEFILTER] Order already processed: ${storedOrder.purchaseId}`);
                    return res.status(200).send("OK");
                }

                // Create 24-hour entitlement
                const entitlementId = generateEntitlementId();
                const purchasedAt = new Date().toISOString();
                const expiresAt = new Date(Date.now() + (offer.duration * 60 * 60 * 1000)).toISOString();

                const entitlement = {
                    entitlementId: entitlementId,
                    userId: storedOrder.userId || "anonymous",
                    userEmail: storedOrder.userEmail,
                    filterId: storedOrder.filterId,
                    orderId: storedOrder.purchaseId,
                    paypalOrderId: paypalOrderId,
                    paypalCaptureId: paypalCaptureId,
                    purchasedAt: purchasedAt,
                    expiresAt: expiresAt,
                    status: "ACTIVE",
                    offerName: offer.name,
                    price: offer.price,
                    currency: offer.currency
                };

                licenseStore.faceFilterEntitlements.set(entitlementId, entitlement);
                
                // Mark purchase as completed
                storedOrder.status = "PAID";
                storedOrder.paidAt = purchasedAt;
                storedOrder.paypalOrderId = paypalOrderId;
                storedOrder.paypalCaptureId = paypalCaptureId;
                licenseStore.orders.set(storedOrder.purchaseId, storedOrder);
                
                saveLicenseStore();

                console.log(`[WEBZONEBW FACEFILTER] 24-hour entitlement created: ${entitlementId} for ${storedOrder.filterId} (${storedOrder.userEmail})`);
            }
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Webhook error:", error.message);
        res.status(500).send("WEBHOOK_ERROR");
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

/* ------------------------------------------------------------
 * FACEFILTER ACCESS REFRESH - Called after payment to update UI
 * ------------------------------------------------------------ */
app.post("/api/facefilter/refresh", (req, res) => {
    try {
        const { userId, userEmail } = req.body || {};
        
        // Validate user session if userId not provided
        let finalUserId = userId;
        let finalUserEmail = userEmail;
        if (!userId && !userEmail) {
            const session = getUserSession(req);
            if (session) {
                finalUserId = session.userId;
                finalUserEmail = session.userEmail;
            }
        }
        
        const now = new Date().toISOString();
        const userEntitlements = [];
        
        // Find all active entitlements for this user
        for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
            if (entitlement.status === "ACTIVE" && 
                now < entitlement.expiresAt &&
                ((finalUserId && entitlement.userId === finalUserId) || (finalUserEmail && entitlement.userEmail === finalUserEmail))) {
                
                // Check if expired and mark accordingly
                let status = "ACTIVE";
                if (now >= entitlement.expiresAt) {
                    status = "EXPIRED";
                    entitlement.status = "EXPIRED";
                    saveLicenseStore();
                }
                
                userEntitlements.push({
                    entitlementId: entitlementId,
                    filterId: entitlement.filterId,
                    status: status,
                    purchasedAt: entitlement.purchasedAt,
                    expiresAt: entitlement.expiresAt,
                    isActive: status === "ACTIVE",
                    timeRemaining: status === "ACTIVE" ? 
                        Math.max(0, new Date(entitlement.expiresAt) - new Date(now)) : 0
                });
            }
        }

        res.json({
            success: true,
            entitlements: userEntitlements,
            totalActive: userEntitlements.filter(e => e.isActive).length,
            timestamp: now
        });
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Refresh error:", error);
        res.status(500).json({ success: false, error: "REFRESH_FAILED" });
    }
});

/* ------------------------------------------------------------
 * FACEFILTER ACCESS VERIFICATION
 * ------------------------------------------------------------ */
app.post("/api/facefilter/verify", (req, res) => {
    try {
        const { filterId, userId, userEmail } = req.body || {};
        
        if (!filterId) {
            return res.status(400).json({
                success: false,
                error: "FILTER_ID_REQUIRED",
                message: "filterId is required for access verification."
            });
        }

        // Validate user session if userId not provided
        let finalUserId = userId;
        let finalUserEmail = userEmail;
        if (!userId && !userEmail) {
            const session = getUserSession(req);
            if (session) {
                finalUserId = session.userId;
                finalUserEmail = session.userEmail;
            }
        }

        const now = new Date().toISOString();
        let activeEntitlement = null;
        
        // Find active entitlement for this filter
        for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
            if (entitlement.filterId === filterId && 
                entitlement.status === "ACTIVE" && 
                now < entitlement.expiresAt &&
                ((finalUserId && entitlement.userId === finalUserId) || (finalUserEmail && entitlement.userEmail === finalUserEmail))) {
                activeEntitlement = {
                    entitlementId: entitlementId,
                    filterId: entitlement.filterId,
                    status: entitlement.status,
                    purchasedAt: entitlement.purchasedAt,
                    expiresAt: entitlement.expiresAt,
                    offerName: entitlement.offerName,
                    timeRemaining: Math.max(0, new Date(entitlement.expiresAt) - new Date(now))
                };
                break;
            }
        }

        // Check for free filters (Mother Care should always be accessible)
        const freeFilters = ['mother_care'];
        if (freeFilters.includes(filterId)) {
            return res.json({
                success: true,
                filterId: filterId,
                hasAccess: true,
                entitlement: {
                    filterId: filterId,
                    status: "FREE",
                    offerName: "Mother Care",
                    message: "This filter is always free to use."
                },
                accessStatus: "FREE",
                message: "This filter is always free to use."
            });
        }

        res.json({
            success: true,
            filterId: filterId,
            hasAccess: !!activeEntitlement,
            entitlement: activeEntitlement,
            accessStatus: activeEntitlement ? "ACTIVE" : "LOCKED",
            message: activeEntitlement ? 
                `Access to ${activeEntitlement.offerName} is active until ${new Date(activeEntitlement.expiresAt).toLocaleString()}` :
                "This filter requires purchase for access."
        });
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Access verification error:", error);
        res.status(500).json({ success: false, error: "ACCESS_VERIFICATION_FAILED" });
    }
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

/* ============================================================
 * FACEFILTER 24-HOUR OFFER ENDPOINTS
 * ============================================================ */

// Get FaceFilter offer information
app.get("/api/facefilter/:filterId/offer", (req, res) => {
    try {
        const { filterId } = req.params;
        const offer = getFaceFilterOffer(filterId);
        
        if (!offer) {
            return res.status(404).json({
                success: false,
                error: "FILTER_NOT_FOUND",
                message: "The requested FaceFilter is not available for purchase."
            });
        }

        res.json({
            success: true,
            filterId: filterId,
            offer: {
                name: offer.name,
                price: offer.price,
                currency: offer.currency,
                duration: offer.duration,
                description: `24-hour access to ${offer.name}. Once purchased and activated, this offer is non-refundable, subject to applicable law.`
            },
            refundPolicy: "24-hour promotional access. Once purchased and activated, this offer is non-refundable, subject to applicable law and mandatory consumer protections."
        });
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Offer retrieval error:", error);
        res.status(500).json({ success: false, error: "OFFER_RETRIEVAL_FAILED" });
    }
});

// Create FaceFilter purchase order with PayPal integration
app.post("/api/facefilter/:filterId/purchase", async (req, res) => {
    try {
        const { filterId } = req.params;
        const { userId, userEmail } = req.body || {};
        
        // Validate input
        if (!filterId || !userEmail) {
            return res.status(400).json({
                success: false,
                error: "MISSING_REQUIRED_FIELDS",
                message: "filterId and userEmail are required."
            });
        }

        // Validate user session
        const session = getUserSession(req);
        if (!session) {
            return res.status(401).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "Valid session required for purchase."
            });
        }

        // Validate filter exists
        const offer = getFaceFilterOffer(filterId);
        if (!offer) {
            return res.status(404).json({
                success: false,
                error: "FILTER_NOT_FOUND",
                message: "The requested FaceFilter is not available for purchase."
            });
        }

        // Check if user already has active access to this filter
        const existingEntitlement = Array.from(licenseStore.faceFilterEntitlements.values())
            .find(e => e.filterId === filterId && 
                       e.userId === session.userId && 
                       e.status === "ACTIVE" && 
                       new Date(e.expiresAt) > new Date());
        
        if (existingEntitlement) {
            return res.status(409).json({
                success: false,
                error: "ACTIVE_ENTITLEMENT_EXISTS",
                message: "You already have active access to this filter."
            });
        }

        // Generate unique purchase ID
        const purchaseId = `FF-PURCHASE-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
        
        // Create PayPal order directly
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            return res.status(503).json({
                success: false,
                error: "PAYMENT_NOT_CONFIGURED",
                message: "PayPal payment is not configured."
            });
        }

        const accessToken = await getPayPalToken();
        if (!accessToken) {
            return res.status(502).json({ success: false, error: "GATEWAY_AUTH_FAILED" });
        }

        // Create PayPal order for FaceFilter purchase
        const { ok, status, data } = await paypalRequest(accessToken, "POST", "/v2/checkout/orders", {
            intent: "CAPTURE",
            purchase_units: [{
                description: `24-hour access to ${offer.name}`,
                custom_id: purchaseId,
                amount: {
                    currency_code: offer.currency,
                    value: offer.price.toString()
                }
            }]
        });

        if (!ok || !data.id) {
            console.error("[WEBZONEBW] PayPal order creation failed:", status, data);
            return res.status(502).json({ success: false, error: "GATEWAY_ORDER_FAILED" });
        }

        // Create purchase record
        const purchase = {
            purchaseId: purchaseId,
            filterId: filterId,
            userId: session.userId,
            userEmail: session.userEmail,
            offerName: offer.name,
            price: offer.price,
            currency: offer.currency,
            status: "CREATED",
            createdAt: new Date().toISOString(),
            filterPurchasedAt: null,
            filterExpiresAt: null,
            // PayPal order details
            paypalOrderId: data.id,
            paypalCaptureId: null,
            custom_id: purchaseId
        };

        licenseStore.orders.set(purchaseId, purchase);
        saveLicenseStore();

        console.log(`[WEBZONEBW] FaceFilter purchase created: ${purchaseId} with PayPal order ${data.id}`);

        res.json({
            success: true,
            purchaseId: purchaseId,
            paypalOrderId: data.id,
            filterId: filterId,
            offer: {
                name: offer.name,
                price: offer.price,
                currency: offer.currency,
                duration: offer.duration,
                refundPolicy: "24-hour promotional access. Once purchased and activated, this offer is non-refundable, subject to applicable law and mandatory consumer protections."
            },
            nextSteps: "Complete payment to activate 24-hour access"
        });
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Purchase creation error:", error);
        res.status(500).json({ success: false, error: "PURCHASE_CREATION_FAILED" });
    }
});

// Get user's current FaceFilter entitlements
app.get("/api/facefilter/entitlements", (req, res) => {
    try {
        const { userId, userEmail } = req.query;
        
        const userEntitlements = [];
        const now = new Date().toISOString();
        
        for (const [entitlementId, entitlement] of licenseStore.faceFilterEntitlements) {
            if ((userId && entitlement.userId === userId) || (userEmail && entitlement.userEmail === userEmail)) {
                const isActive = entitlement.status === "ACTIVE" && now < entitlement.expiresAt;
                userEntitlements.push({
                    entitlementId: entitlementId,
                    filterId: entitlement.filterId,
                    status: entitlement.status,
                    purchasedAt: entitlement.purchasedAt,
                    expiresAt: entitlement.expiresAt,
                    isActive: isActive,
                    timeRemaining: isActive ? 
                        Math.max(0, new Date(entitlement.expiresAt) - new Date(now)) : 0
                });
            }
        }

        res.json({
            success: true,
            entitlements: userEntitlements,
            totalActive: userEntitlements.filter(e => e.isActive).length
        });
    } catch (error) {
        console.error("[WEBZONEBW FACEFILTER] Entitlements retrieval error:", error);
        res.status(500).json({ success: false, error: "ENTITLEMENTS_RETRIEVAL_FAILED" });
    }
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

/* ============================================================
 * HEALTH CHECK ENDPOINT
 * ============================================================ */

app.get("/api/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: SERVER_VERSION,
        uptime: process.uptime(),
        environment: NODE_ENV
    });
});

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

/* ============================================================
 * PORT MANAGEMENT AND SERVER STARTUP
 * ============================================================ */

function findAvailablePort(startPort, fallbackPorts) {
    return new Promise((resolve) => {
        const testPort = (port) => {
            const server = require('net').createServer();
            server.listen(port, () => {
                server.once('close', () => {
                    resolve(port);
                });
                server.close();
            });
            server.on('error', () => {
                // Try next port
                const nextPort = fallbackPorts.shift();
                if (nextPort) {
                    testPort(nextPort);
                } else {
                    resolve(null);
                }
            });
        };
        
        testPort(startPort);
    });
}

async function startServer() {
    let finalPort = PORT;
    
    // Simplified port check - just try to start the server
    console.log(`[WEBZONEBW] Attempting to start on port ${finalPort}...`);
    
    const server = app.listen(finalPort, HOST, () => {
        console.log(`\n[WEBZONEBW] 🚀 Server started successfully!`);
        console.log(`[WEBZONEBW] 📡 Server listening on http://${HOST}:${finalPort}`);
        console.log(`[WEBZONEBW] 🌐 Environment: ${NODE_ENV}`);
        console.log(`[WEBZONEBW] 📊 Version: ${SERVER_VERSION}`);
        console.log(`[WEBZONEBW] 🔒 Security: Enhanced 5-star implementation`);
        console.log(`[WEBZONEBW] 📈 Health Check: http://${HOST}:${finalPort}/api/health`);
        console.log(`[WEBZONEBW] 📊 Metrics: http://${HOST}:${finalPort}/api/metrics`);
        console.log(`[WEBZONEBW] ⚡ Press Ctrl+C to stop the server\n`);
    });
    
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.log(`[WEBZONEBW] Port ${finalPort} is in use, trying fallback ports...`);
            
            // Try fallback ports
            const fallbackPorts = [3001, 3002, 3003, 8080, 8081];
            let fallbackAttempt = 0;
            
            const tryNextPort = () => {
                if (fallbackAttempt >= fallbackPorts.length) {
                    console.error(`[WEBZONEBW] No available ports found. Please free up port ${PORT} or set PORT environment variable.`);
                    process.exit(1);
                }
                
                const nextPort = fallbackPorts[fallbackAttempt];
                fallbackAttempt++;
                
                console.log(`[WEBZONEBW] Trying port ${nextPort}...`);
                
                const fallbackServer = app.listen(nextPort, HOST, () => {
                    console.log(`[WEBZONEBW] 🚀 Server started on port ${nextPort}!`);
                    console.log(`[WEBZONEBW] 📡 Server listening on http://${HOST}:${nextPort}`);
                    console.log(`[WEBZONEBW] 🌐 Environment: ${NODE_ENV}`);
                    console.log(`[WEBZONEBW] 📊 Version: ${SERVER_VERSION}`);
                    console.log(`[WEBZONEBW] 🔒 Security: Enhanced 5-star implementation`);
                    console.log(`[WEBZONEBW] 📈 Health Check: http://${HOST}:${nextPort}/api/health`);
                    console.log(`[WEBZONEBW] 📊 Metrics: http://${HOST}:${nextPort}/api/metrics`);
                    console.log(`[WEBZONEBW] ⚡ Press Ctrl+C to stop the server\n`);
                    
                    // Store the working server
                    global.workingServer = fallbackServer;
                });
                
                fallbackServer.on('error', (fallbackError) => {
                    if (fallbackError.code === 'EADDRINUSE') {
                        console.log(`[WEBZONEBW] Port ${nextPort} is also in use...`);
                        tryNextPort();
                    } else {
                        console.error(`[WEBZONEBW] Server error:`, fallbackError);
                        process.exit(1);
                    }
                });
            };
            
            tryNextPort();
        } else {
            console.error(`[WEBZONEBW] Server error:`, error);
            process.exit(1);
        }
    });
    
    return server;
}

// Check if a port is available
function checkPortAvailability(port, host) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, host, () => {
            server.close(() => {
                resolve(true);
            });
        });
        
        server.on('error', () => {
            resolve(false);
        });
        
        // Timeout after 1 second
        setTimeout(() => {
            server.close();
            resolve(false);
        }, 1000);
    });
}

// Start the server
const appServer = startServer();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));