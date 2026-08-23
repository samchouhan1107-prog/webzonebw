/* ============================================================
   WEBZONEBW — WEB SERVER
   WEBZONE ER • HALLOWEEN • STATIC SITE ENGINE
   ------------------------------------------------------------
   Version: 2.1
   Port:    3000
   Runtime: Node.js + Express
   ------------------------------------------------------------
   STANDARD PAGE STRUCTURE
   /er/index.html
   /halloween/index.html
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

const SERVER_VERSION = "2.1.0";
const PROJECT_NAME = "WEBZONEBW";

/* ============================================================
   BASIC APPLICATION SETTINGS
   ============================================================ */

app.disable("x-powered-by");

/* ============================================================
   MEDIA / CAMERA PERMISSIONS
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
   HEALTH API
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
   SERVER STATUS API
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
   ROOT STATIC FILE ENGINE
   ------------------------------------------------------------
   Handles:
   HTML
   CSS
   JavaScript
   Images
   Fonts
   Audio
   Video
   Other assets
   ============================================================ */

app.use(
    express.static(__dirname, {
        extensions: ["html", "htm"],
        index: "index.html",
        fallthrough: true,
        redirect: true,
        maxAge:
            process.env.NODE_ENV === "production"
                ? "1d"
                : 0
    })
);

/* ============================================================
   WEBZONE ER STUDIO
   ------------------------------------------------------------
   STANDARD:
   
   /er/
   /er/index.html
   
   Both resolve to:
   
   /er/index.html
   ============================================================ */

app.get(
    ["/er", "/er/"],
    (req, res) => {
        const erIndex = path.join(
            __dirname,
            "er",
            "index.html"
        );

        res.sendFile(erIndex, (error) => {
            if (error) {
                console.error(
                    "[ER] Unable to load er/index.html:",
                    error.message
                );

                if (!res.headersSent) {
                    res.status(404).send(
                        "WEBZONE ER Studio is unavailable."
                    );
                }
            }
        });
    }
);

/* ============================================================
   HALLOWEEN STUDIO
   ------------------------------------------------------------
   STANDARD:
   
   /halloween/
   /halloween/index.html
   
   Both resolve to:
   
   /halloween/index.html
   ============================================================ */

app.get(
    ["/halloween", "/halloween/"],
    (req, res) => {
        const halloweenIndex = path.join(
            __dirname,
            "halloween",
            "index.html"
        );

        res.sendFile(halloweenIndex, (error) => {
            if (error) {
                console.error(
                    "[HALLOWEEN] Unable to load halloween/index.html:",
                    error.message
                );

                if (!res.headersSent) {
                    res.status(404).send(
                        "WEBZONE Halloween Studio is unavailable."
                    );
                }
            }
        });
    }
);

/* ============================================================
   ER STATIC ASSETS
   ------------------------------------------------------------
   Everything inside /er is available using /er/...
   
   Examples:
   
   /er/index.html
   /er/style.css
   /er/script.js
   /er/assets/...
   /er/images/...
   ============================================================ */

app.use(
    "/er",
    express.static(
        path.join(__dirname, "er"),
        {
            extensions: ["html", "htm"],
            index: "index.html",
            fallthrough: true
        }
    )
);

/* ============================================================
   HALLOWEEN STATIC ASSETS
   ============================================================ */

app.use(
    "/halloween",
    express.static(
        path.join(__dirname, "halloween"),
        {
            extensions: ["html", "htm"],
            index: "index.html",
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

        res.status(404).sendFile(
            errorPage,
            (error) => {
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
            }
        );
    }
);

/* ============================================================
   API 404 HANDLER
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
   ============================================================ */

app.use((req, res, next) => {
    if (
        req.method !== "GET" &&
        req.method !== "HEAD"
    ) {
        return next();
    }

    /*
     * Never return index.html for missing assets.
     */
    if (
        req.path.startsWith("/api/") ||
        req.path.startsWith("/assets/") ||
        path.extname(req.path)
    ) {
        return res.status(404).send("Not Found");
    }

    const indexFile = path.join(
        __dirname,
        "index.html"
    );

    res.sendFile(
        indexFile,
        (error) => {
            if (error) {
                next(error);
            }
        }
    );
});

/* ============================================================
   GLOBAL ERROR HANDLER
   ============================================================ */

app.use(
    (error, req, res, next) => {
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

        if (
            req.originalUrl.startsWith("/api")
        ) {
            return res
                .status(statusCode)
                .json({
                    success: false,
                    error:
                        process.env.NODE_ENV ===
                        "production"
                            ? "Internal server error"
                            : error.message,
                    timestamp:
                        new Date().toISOString()
                });
        }

        return res
            .status(statusCode)
            .send(
                "WEBZONEBW — Internal Server Error"
            );
    }
);

/* ============================================================
   PROCESS ERROR HANDLING
   ============================================================ */

process.on(
    "uncaughtException",
    (error) => {
        console.error(
            "[FATAL] Uncaught Exception:",
            error
        );
    }
);

process.on(
    "unhandledRejection",
    (reason) => {
        console.error(
            "[FATAL] Unhandled Promise Rejection:",
            reason
        );
    }
);

/* ============================================================
   SERVER START
   ============================================================ */

const server = app.listen(
    PORT,
    HOST,
    () => {
        console.log("");
        console.log(
            "================================================"
        );
        console.log(
            " WEBZONEBW SERVER"
        );
        console.log(
            "================================================"
        );

        console.log(
            ` Project    : ${PROJECT_NAME}`
        );

        console.log(
            ` Version    : ${SERVER_VERSION}`
        );

        console.log(
            ` Node.js    : ${process.version}`
        );

        console.log(
            ` Environment: ${
                process.env.NODE_ENV ||
                "development"
            }`
        );

        console.log(
            ` Host       : ${HOST}`
        );

        console.log(
            ` Port       : ${PORT}`
        );

        console.log(
            ` Local      : http://localhost:${PORT}`
        );

        console.log(
            ` ER Studio  : http://localhost:${PORT}/er/`
        );

        console.log(
            ` Halloween  : http://localhost:${PORT}/halloween/`
        );

        console.log(
            ` Health     : http://localhost:${PORT}/api/health`
        );

        console.log(
            ` Status     : http://localhost:${PORT}/api/status`
        );

        console.log(
            "================================================"
        );

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

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);