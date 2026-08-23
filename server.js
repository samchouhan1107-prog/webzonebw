/* ============================================================
   WEBZONEBW — WEB SERVER
   WEBZONE ER • HALLOWEEN • STATIC SITE ENGINE
   ------------------------------------------------------------
   Version: 2.0
   Port:    3000
   Runtime: Node.js + Express
   ============================================================ */

"use strict";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

/* ============================================================
   PATH CONFIGURATION
   ============================================================ */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   APPLICATION CONFIGURATION
   ============================================================ */

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const SERVER_VERSION = "2.0.0";
const PROJECT_NAME = "WEBZONEBW";

/* ============================================================
   BASIC APPLICATION SETTINGS
   ============================================================ */

app.disable("x-powered-by");

/* ============================================================
   MEDIA PERMISSIONS
   ------------------------------------------------------------
   Chrome blocks getUserMedia when Permissions-Policy
   omits camera, or when a reverse proxy sends camera=().
   Explicitly allow same-origin camera for ER Studio.
   ============================================================ */

app.use((req, res, next) => {
    res.setHeader(
        "Permissions-Policy",
        "camera=(self), microphone=()"
    );

    res.setHeader(
        "Feature-Policy",
        "camera 'self'; microphone 'none'"
    );

    next();
});

/* ============================================================
   REQUEST PARSERS
   ------------------------------------------------------------
   Supports:
   - JSON APIs
   - Base64 image payloads
   - URL encoded forms
   ============================================================ */

app.use(
    express.json({
        limit: "25mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "25mb"
    })
);

/* ============================================================
   REQUEST LOGGER
   ============================================================ */

app.use((req, res, next) => {
    const started = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - started;

        console.log(
            `[WEBZONEBW] ${req.method} ${req.originalUrl} ` +
            `${res.statusCode} ${duration}ms`
        );
    });

    next();
});

/* ============================================================
   HEALTH / STATUS API
   ============================================================ */

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "online",
        project: PROJECT_NAME,
        version: SERVER_VERSION,
        environment: process.env.NODE_ENV || "development",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

/* ============================================================
   SERVER INFORMATION
   ============================================================ */

app.get("/api/status", (req, res) => {
    res.status(200).json({
        success: true,
        server: PROJECT_NAME,
        version: SERVER_VERSION,
        port: PORT,
        host: HOST,
        node: process.version,
        platform: process.platform,
        uptime: Math.floor(process.uptime()),
        memory: {
            rss: process.memoryUsage().rss,
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal
        },
        timestamp: new Date().toISOString()
    });
});

/* ============================================================
   STATIC FILE ENGINE
   ------------------------------------------------------------
   Serves:
   - HTML
   - CSS
   - JavaScript
   - Images
   - Fonts
   - Audio
   - Video
   - Other static assets
   ============================================================ */

app.use(
    express.static(__dirname, {
        extensions: ["html", "htm"],
        index: "WebZOneBW-ER.Studio.html",
        fallthrough: true,
        redirect: true,
        maxAge: process.env.NODE_ENV === "production"
            ? "1d"
            : 0
    })
);

/* ============================================================
   WEBZONE ER / HALLOWEEN STUDIO
   ------------------------------------------------------------
   Supported URLs:

   /er
   /er/
   /halloween
   /halloween/
   ============================================================ */

app.get(
    ["/er", "/er/"],
    (req, res) => {
        const erIndex = path.join(
            __dirname,
            "er",
            "WebZoneBW-ER.Studio.html"
        );

        res.sendFile(erIndex, (error) => {
            if (error) {
                // Fallback to halloween/WebZoneBW-ER.Studio.html if needed
                const halloweenIndex = path.join(
                    __dirname,
                    "halloween",
                    "WebZoneBW-ER.Studio.html"
                );

                res.sendFile(halloweenIndex, (fallbackErr) => {
                    if (fallbackErr) {
                        console.error(
                            "[ER] Unable to load ER studio:",
                            fallbackErr.message
                        );

                        if (!res.headersSent) {
                            res.status(500).send(
                                "WEBZONE ER Studio is temporarily unavailable."
                            );
                        }
                    }
                });
            }
        });
    }
);

app.get(
    ["/halloween", "/halloween/"],
    (req, res) => {
        const halloweenIndex = path.join(
            __dirname,
            "halloween",
            "WebZoneBW-ER.Studio.html"
        );

        res.sendFile(halloweenIndex, (error) => {
            if (error) {
                const erIndex = path.join(
                    __dirname,
                    "er",
                    "WebZoneBW-ER.Studio.html"
                );

                res.sendFile(erIndex, (fallbackErr) => {
                    if (fallbackErr) {
                        console.error(
                            "[HALLOWEEN] Unable to load studio:",
                            fallbackErr.message
                        );

                        if (!res.headersSent) {
                            res.status(500).send(
                                "WEBZONE ER Studio is temporarily unavailable."
                            );
                        }
                    }
                });
            }
        });
    }
);

/* ============================================================
   WEBZONE ER & HALLOWEEN ASSET ROUTES
   ------------------------------------------------------------
   Keeps the er and halloween folders accessible as dedicated
   experiences while allowing their own CSS / JS / media files.
   ============================================================ */

app.use(
    "/er",
    express.static(
        path.join(__dirname, "er"),
        {
            extensions: ["html", "htm"],
            fallthrough: true
        }
    )
);

app.use(
    "/halloween",
    express.static(
        path.join(__dirname, "halloween"),
        {
            extensions: ["html", "htm"],
            fallthrough: true
        }
    )
);

/* ============================================================
   MAINTENANCE / 404 CENTER
   ============================================================ */

app.get(
    [
        "/404",
        "/404.html",
        "/maintenance",
        "/maintenance.html",
        "/status"
    ],
    (req, res) => {
        const errorPage = path.join(
            __dirname,
            "404.html"
        );

        res.status(404).sendFile(errorPage, (error) => {
            if (error) {
                console.error(
                    "[404] Unable to load 404 page:",
                    error.message
                );

                if (!res.headersSent) {
                    res.status(404).send(
                        "WEBZONEBW — Page not found."
                    );
                }
            }
        });
    }
);

/* ============================================================
   API 404 HANDLER
   ------------------------------------------------------------
   Prevents API requests from accidentally receiving index.html.
   ============================================================ */

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        error: "API endpoint not found",
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

/* ============================================================
   CLIENT-SIDE ROUTING FALLBACK
   ------------------------------------------------------------
   Express 5 compatible.

   Only GET / HEAD requests that reach this point are sent
   to the main WEBZONEBW application.
   ============================================================ */

app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
        return next();
    }

    const indexFile = path.join(
        __dirname,
        "WeBZoneBW-ER.Studio.html"
    );

    res.sendFile(indexFile, (error) => {
        if (error) {
            next(error);
        }
    });
});

/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */

app.use((error, req, res, next) => {
    console.error(
        "[WEBZONEBW ERROR]",
        error
    );

    if (res.headersSent) {
        return next(error);
    }

    const statusCode =
        error.status ||
        error.statusCode ||
        500;

    /* API error */
    if (req.originalUrl.startsWith("/api")) {
        return res.status(statusCode).json({
            success: false,
            error:
                process.env.NODE_ENV === "production"
                    ? "Internal server error"
                    : error.message,
            timestamp: new Date().toISOString()
        });
    }

    /* Website error */
    return res.status(statusCode).send(
        "WEBZONEBW — Internal Server Error"
    );
});

/* ============================================================
   PROCESS ERROR HANDLING
   ============================================================ */

process.on("uncaughtException", (error) => {
    console.error(
        "[FATAL] Uncaught Exception:",
        error
    );
});

process.on("unhandledRejection", (reason) => {
    console.error(
        "[FATAL] Unhandled Promise Rejection:",
        reason
    );
});

/* ============================================================
   SERVER START
   ============================================================ */

const server = app.listen(
    PORT,
    HOST,
    () => {
        console.log("");
        console.log("================================================");
        console.log(" WEBZONEBW SERVER");
        console.log("================================================");
        console.log(` Project   : ${PROJECT_NAME}`);
        console.log(` Version   : ${SERVER_VERSION}`);
        console.log(` Node.js   : ${process.version}`);
        console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
        console.log(` Host      : ${HOST}`);
        console.log(` Port      : ${PORT}`);
        console.log(` Local     : http://localhost:${PORT}`);
        console.log(` ER Studio : http://localhost:${PORT}/er`);
        console.log(` Halloween : http://localhost:${PORT}/halloween`);
        console.log(` Health    : http://localhost:${PORT}/api/health`);
        console.log(` Status    : http://localhost:${PORT}/api/status`);
        console.log("================================================");
        console.log("");
    }
);

/* ============================================================
   GRACEFUL SHUTDOWN
   ============================================================ */

const shutdown = (signal) => {
    console.log(
        `\n[WEBZONEBW] ${signal} received. Shutting down...`
    );

    server.close(() => {
        console.log(
            "[WEBZONEBW] Server closed successfully."
        );

        process.exit(0);
    });

    setTimeout(() => {
        console.error(
            "[WEBZONEBW] Forced shutdown."
        );

        process.exit(1);
    }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));