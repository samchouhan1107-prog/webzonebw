/* ============================================================
 * WEBZONEBW - INPUT VALIDATION & ERROR RESPONSE HELPERS
 * ------------------------------------------------------------
 * Extracted from server.js so both the main server and the
 * PayPal route module share one validation implementation.
 * ============================================================ */

"use strict";

const crypto = require("crypto");

/* ============================================================
 * ENHANCED SECURITY AND MONITORING CONFIGURATION
 * ============================================================ */

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PRODUCTION = NODE_ENV === "production";

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
 * ENHANCED INPUT VALIDATION HELPER
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
 * REQUEST VALUE SANITIZATION (used by the global middleware)
 * ============================================================ */

function sanitizeRequestValue(input) {
    return input
        .replace(/<\/?[^>]+(>|$)/g, '') // Remove HTML tags
        .replace(/javascript:/gi, '')   // Remove javascript: protocol
        .replace(/data:/gi, '')         // Remove data: protocol
        .replace(/\b(alert|confirm|prompt|eval)\b/gi, ''); // Remove dangerous functions
}

/*
 * Validates a single request value (body/query string).
 * Throws on violation; returns the sanitized value on success.
 */
function validateRequestInput(input, source = 'unknown') {
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
    }
    return sanitizeRequestValue(input);
}

module.exports = {
    SECURITY_CONFIG,
    NODE_ENV,
    IS_PRODUCTION,
    createErrorResponse,
    validateInput,
    sanitizeRequestValue,
    validateRequestInput
};
