/* ============================================================
 * WEBZONEBW — WEB SERVER
 * WEBZONE ER — STATIC SITE ENGINE
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

import express from "express";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import compression from "compression";
import helmet from "helmet";

/* ============================================================
 * PATH CONFIGURATION
 * ============================================================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

/* ============================================================
 * BASIC APPLICATION SETTINGS & SECURITY HEADERS
 * ============================================================ */

app.disable("x-powered-by");

// Brotli/Gzip Compression
app.use(
    compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers["x-no-compression"]) {
                return false;
            }
            return compression.filter(req, res);
        }
    })
);

// Helmet Configuration (relaxed for Google Analytics, AdSense, etc.)
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false
    })
);

if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

// Media & Camera Permissions-Policy Headers
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self)");
    res.setHeader("Feature-Policy", "camera 'self'; microphone 'self'");
    next();
});

// Extra Standard Security Headers with UTF-8 default charset for API endpoints
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
});

/* ============================================================
 * REQUEST PARSERS
 * ============================================================ */

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

/* ============================================================
 * REQUEST LOGGER
 * ============================================================ */

app.use((req, res, next) => {
    const started = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - started;
        console.log(`[WEBZONEBW] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
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
        return res.status(429).json({
            success: false,
            error: "Too many requests. Please try again later.",
            retryAfter: Math.ceil(windowMs / 1000)
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

// --- Cashfree API Configuration ---
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_MODE = process.env.CASHFREE_MODE || "sandbox";
const CASHFREE_BASE_URL = CASHFREE_MODE === "production" 
    ? "https://api.cashfree.com/pg" 
    : "https://sandbox.cashfree.com/pg";

// Mock database for entitlement demo
const entitlements = new Map();

/* ============================================================
 * CASHFREE PAYMENT ENDPOINTS
 * ============================================================ */

app.post("/api/create-order", async (req, res) => {
    try {
        const { planId } = req.body;
        // In production: Validate user session here!
        const orderData = {
            order_amount: 299,
            order_currency: "INR",
            customer_details: {
                customer_id: "demo_user_123",
                customer_email: "user@example.com",
                customer_phone: "9999999999"
            }
        };

        const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "x-client-id": CASHFREE_CLIENT_ID,
                "x-client-secret": CASHFREE_CLIENT_SECRET,
                "x-api-version": "2022-09-01",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const data = await response.json();
        res.json({ success: true, payment_session_id: data.payment_session_id });
    } catch (error) {
        res.status(500).json({ success: false, error: "Payment init failed" });
    }
});

app.post("/api/cashfree/webhook", (req, res) => {
    const signature = req.headers["x-webhook-signature"];
    // In production: Validate signature using CASHFREE_CLIENT_SECRET
    const { order, payment } = req.body.data;
    
    if (payment.payment_status === "SUCCESS") {
        entitlements.set(order.customer_details.customer_id, {
            status: "ACTIVE",
            plan: "STUDIO_PLUS",
            verifiedAt: new Date().toISOString()
        });
        console.log(`[WEBZONEBW] Entitlement granted for: ${order.customer_details.customer_id}`);
    }
    
    res.status(200).send("OK");
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
 * PROCESS UNCAUGHT RUNTIME ERRORS
 * ============================================================ */

process.on("uncaughtException", (error) => {
    console.error("[FATAL] Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] Unhandled Promise Rejection:", reason);
});

/* ============================================================
 * SERVER START — HTTP & HTTPS SECURE CONTEXT
 * ============================================================ */

const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 3443;
const pfxPath = path.join(__dirname, "certs", "cert.pfx");

let httpsServer = null;

if (fs.existsSync(pfxPath)) {
    try {
        httpsServer = https.createServer(
            {
                pfx: fs.readFileSync(pfxPath),
                passphrase: "webzonebw"
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
