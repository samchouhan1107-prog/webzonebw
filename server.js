/* ============================================================
   WEBZONEBW — WEB SERVER
   WEBZONE ER • STATIC SITE ENGINE
   ------------------------------------------------------------
   Version: 2.2
   Port:    3000
   Runtime: Node.js + Express
   ------------------------------------------------------------
   STANDARD PAGE STRUCTURE

   /
   /index.html

   /er/
   /er/index.html

   /halloween/
   /halloween/index.html

   ------------------------------------------------------------
   IMPORTANT
   ------------------------------------------------------------
   This server intentionally does NOT manipulate camera streams.

   Camera / microphone access remains entirely browser-side
   through the WEBZONEBW-ER JavaScript engine.

   This keeps the camera experience independent from the
   Express static-file server.
   ============================================================ */

"use strict";

import express from "express";
import fs from "fs";
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

const SERVER_VERSION = "2.2.0";
const PROJECT_NAME = "WEBZONEBW";

const NODE_ENV =
    process.env.NODE_ENV || "development";

const IS_PRODUCTION =
    NODE_ENV === "production";

/* ============================================================
   BASIC APPLICATION SETTINGS
   ============================================================ */

app.disable("x-powered-by");

/*
 * Express should trust a reverse proxy only when explicitly
 * requested. This is useful later for HTTPS deployments while
 * keeping local development predictable.
 */
if (process.env.TRUST_PROXY === "true") {
    app.set("trust proxy", 1);
}

/* ============================================================
   MEDIA / CAMERA PERMISSIONS
   ------------------------------------------------------------
   Camera is allowed for this origin.

   Microphone is also allowed for this origin because the
   WEBZONEBW-ER interface contains optional microphone /
   audio-reactive functionality.

   NOTE:
   This does NOT grant permission automatically.
   The browser still requires user consent.
   ============================================================ */

app.use((req, res, next) => {

    res.setHeader(
        "Permissions-Policy",
        "camera=(self), microphone=(self)"
    );

    /*
     * Legacy header retained for older environments.
     */
    res.setHeader(
        "Feature-Policy",
        "camera 'self'; microphone 'self'"
    );

    next();
});

/* ============================================================
   BASIC SECURITY HEADERS
   ------------------------------------------------------------
   These are deliberately conservative.

   We do NOT add restrictive COOP / COEP / CSP policies here
   because the ER experience may load external libraries,
   images, camera resources and other browser assets.
   ============================================================ */

app.use((req, res, next) => {

    res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
    );

    res.setHeader(
        "Referrer-Policy",
        "strict-origin-when-cross-origin"
    );

    res.setHeader(
        "X-Frame-Options",
        "SAMEORIGIN"
    );

    next();
});

/* ============================================================
   REQUEST PARSERS
   ------------------------------------------------------------ */

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
   ------------------------------------------------------------ */

app.use((req, res, next) => {

    const started = Date.now();

    res.on("finish", () => {

        const duration =
            Date.now() - started;

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

        environment: NODE_ENV,

        uptime: process.uptime(),

        timestamp: new Date().toISOString()

    });

});

/* ============================================================
   SERVER STATUS API
   ============================================================ */

app.get("/api/status", (req, res) => {

    const memory =
        process.memoryUsage();

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

        uptime: Math.floor(
            process.uptime()
        ),

        memory: {

            rss: memory.rss,

            heapUsed: memory.heapUsed,

            heapTotal: memory.heapTotal,

            external: memory.external

        },

        timestamp:
            new Date().toISOString()

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

   ------------------------------------------------------------
   DEVELOPMENT
   ------------------------------------------------------------
   Files are not aggressively cached.

   ------------------------------------------------------------
   PRODUCTION
   ------------------------------------------------------------
   Static resources receive a modest cache period.
   ============================================================ */

app.use(
    express.static(__dirname, {

        extensions: [
            "html",
            "htm"
        ],

        index: "index.html",

        fallthrough: true,

        redirect: true,

        etag: true,

        lastModified: true,

        maxAge: IS_PRODUCTION
            ? "1d"
            : 0,

        setHeaders: (res, filePath) => {

            /*
             * Prevent stale HTML during development.
             */
            if (
                !IS_PRODUCTION &&
                (
                    filePath.endsWith(".html") ||
                    filePath.endsWith(".htm")
                )
            ) {

                res.setHeader(
                    "Cache-Control",
                    "no-cache"
                );

            }

        }

    })
);

function resolveHtmlPageFromRoute(requestPath) {

    const trimmedPath =
        (requestPath || "/")
            .trim()
            .replace(/\\/g, "/");

    if (!trimmedPath || trimmedPath === "/") {
        return path.join(__dirname, "index.html");
    }

    const normalizedPath =
        trimmedPath.startsWith("/")
            ? trimmedPath
            : `/${trimmedPath}`;

    const routeName =
        normalizedPath
            .replace(/\/+$/, "")
            .toLowerCase();

    const explicitRoutes = {
        "/soundbox": path.join(__dirname, "soundbox.html"),
        "/music": path.join(__dirname, "soundbox.html"),
        "/er": path.join(__dirname, "er", "index.html"),
        "/er/": path.join(__dirname, "er", "index.html"),
        "/halloween": path.join(__dirname, "halloween", "index.html"),
        "/halloween/": path.join(__dirname, "halloween", "index.html")
    };

    if (explicitRoutes[routeName]) {
        return explicitRoutes[routeName];
    }

    if (path.extname(normalizedPath)) {
        const pagePath = path.join(__dirname, normalizedPath.replace(/^\//, ""));
        if (fs.existsSync(pagePath) && fs.statSync(pagePath).isFile()) {
            return pagePath;
        }
    }

    const extensionlessPath =
        path.join(__dirname, `${normalizedPath.replace(/^\//, "")}.html`);

    if (fs.existsSync(extensionlessPath) && fs.statSync(extensionlessPath).isFile()) {
        return extensionlessPath;
    }

    return null;
}

/* ============================================================
   WEBZONE ER STUDIO
   ------------------------------------------------------------
   /er
   /er/

   Resolve to:

   /er/index.html
   ============================================================ */

app.get(
    [
        "/er",
        "/er/"
    ],
    (req, res) => {

        const erIndex =
            path.join(
                __dirname,
                "er",
                "index.html"
            );

        res.sendFile(
            erIndex,
            (error) => {

                if (!error) {
                    return;
                }

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
        );

    }
);

/* ============================================================
   SOUND BOX ROUTES
   ------------------------------------------------------------
   /soundbox
   /soundbox/
   /music
   /music/

   Resolve to:

   /soundbox.html
   ============================================================ */

app.get(
    [
        "/soundbox",
        "/soundbox/",
        "/music",
        "/music/"
    ],
    (req, res) => {

        const soundboxPage =
            path.join(
                __dirname,
                "soundbox.html"
            );

        res.sendFile(
            soundboxPage,
            (error) => {

                if (!error) {
                    return;
                }

                console.error(
                    "[SOUNDBOX] Unable to load soundbox.html:",
                    error.message
                );

                if (!res.headersSent) {

                    res.status(404).send(
                        "WEBZONEBW Sound Box is unavailable."
                    );

                }

            }
        );

    }
);

/* ============================================================
   WEBZONEBW-ER ROUTE ALIAS (SEASONAL FILTER PACK)
   ------------------------------------------------------------
   /halloween and /halloween/ are personal-reference aliases
   for the WEBZONEBW-ER studio. The seasonal (October) filter
   pack will live inside WEBZONEBW-ER, not as a separate site.

   Resolves to the ER studio page.
   ============================================================ */

app.get(
    [
        "/halloween",
        "/halloween/"
    ],
    (req, res) => {

        const erIndex =
            path.join(
                __dirname,
                "er",
                "index.html"
            );

        res.sendFile(
            erIndex,
            (error) => {

                if (!error) {
                    return;
                }

                console.error(
                    "[WEBZONEBW-ER] Unable to load " +
                    "er/index.html:",
                    error.message
                );

                if (!res.headersSent) {

                    res.status(404).send(
                        "WEBZONEBW-ER Studio is unavailable."
                    );

                }

            }
        );

    }
);

/* ============================================================
   ER STATIC ASSETS
   ------------------------------------------------------------
   Everything inside:

   /er/

   remains available under:

   /er/...

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
        path.join(
            __dirname,
            "er"
        ),
        {

            extensions: [
                "html",
                "htm"
            ],

            index: "index.html",

            fallthrough: true,

            redirect: true,

            etag: true,

            lastModified: true,

            maxAge: IS_PRODUCTION
                ? "1d"
                : 0,

            setHeaders: (res, filePath) => {

                /*
                 * Do not aggressively cache HTML.
                 */
                if (
                    !IS_PRODUCTION &&
                    (
                        filePath.endsWith(".html") ||
                        filePath.endsWith(".htm")
                    )
                ) {

                    res.setHeader(
                        "Cache-Control",
                        "no-cache"
                    );

                }

            }

        }
    )
);

/* ============================================================
   WEBZONEBW-ER STATIC ASSETS (SEASONAL FILTER PACK)
   ------------------------------------------------------------
   The /halloween namespace keeps serving the seasonal filter
   assets (js/halloween.js) used by the WEBZONEBW-ER studio.
   ============================================================ */

app.use(
    "/halloween",
    express.static(
        path.join(
            __dirname,
            "halloween"
        ),
        {

            extensions: [
                "html",
                "htm"
            ],

            index: "index.html",

            fallthrough: true,

            redirect: true,

            etag: true,

            lastModified: true,

            maxAge: IS_PRODUCTION
                ? "1d"
                : 0,

            setHeaders: (res, filePath) => {

                if (
                    !IS_PRODUCTION &&
                    (
                        filePath.endsWith(".html") ||
                        filePath.endsWith(".htm")
                    )
                ) {

                    res.setHeader(
                        "Cache-Control",
                        "no-cache"
                    );

                }

            }

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
        "/maintenance.html"
    ],
    (req, res) => {

        const errorPage =
            path.join(
                __dirname,
                "404.html"
            );

        res.status(404).sendFile(
            errorPage,
            (error) => {

                if (!error) {
                    return;
                }

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
        );

    }
);

/* ============================================================
   SERVER STATUS PAGE
   ------------------------------------------------------------
   /status

   This intentionally returns a small human-readable status
   page rather than being confused with /api/status.
   ============================================================ */

app.get(
    "/status",
    (req, res) => {

        res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
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

    }
);

/* ============================================================
   API 404 HANDLER
   ============================================================ */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            error: "API endpoint not found",

            path: req.originalUrl,

            method: req.method,

            timestamp:
                new Date().toISOString()

        });

    }
);

/* ============================================================
   CLIENT-SIDE ROUTING FALLBACK
   ------------------------------------------------------------
   IMPORTANT:

   Missing assets are NEVER redirected to index.html.

   This prevents errors such as:

   /er/missing.js
   /assets/missing.png
   /css/missing.css

   from silently receiving the main homepage.
   ============================================================ */

app.use(
    (req, res, next) => {

        if (
            req.method !== "GET" &&
            req.method !== "HEAD"
        ) {

            return next();

        }

        const requestPath =
            req.path || "/";

        /*
         * Never route these namespaces to the homepage.
         */
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

            return res
                .status(404)
                .send("Not Found");

        }

        const resolvedPage =
            resolveHtmlPageFromRoute(requestPath);

        if (resolvedPage) {
            return res.sendFile(
                resolvedPage,
                (error) => {

                    if (error) {
                        next(error);
                    }

                }
            );
        }

        /*
         * Root-level client-side application fallback.
         *
         * Existing HTML pages remain handled normally by
         * express.static() before this point.
         */
        const indexFile =
            path.join(
                __dirname,
                "index.html"
            );

        return res.sendFile(
            indexFile,
            (error) => {

                if (error) {
                    next(error);
                }

            }
        );

    }
);

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

        /*
         * API requests receive JSON.
         */
        if (
            req.originalUrl.startsWith("/api")
        ) {

            return res
                .status(statusCode)
                .json({

                    success: false,

                    error:
                        IS_PRODUCTION
                            ? "Internal server error"
                            : error.message,

                    timestamp:
                        new Date().toISOString()

                });

        }

        /*
         * Browser requests receive a simple
         * server error response.
         */
        return res
            .status(statusCode)
            .send(
                "WEBZONEBW — Internal Server Error"
            );

    }
);

/* ============================================================
   PROCESS ERROR HANDLING
   ------------------------------------------------------------
   These handlers log unexpected errors.

   They intentionally do not attempt to restart the server
   automatically because silent restarts can make debugging
   camera / browser issues much harder.
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

const server =
    app.listen(
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
                ` Environment: ${NODE_ENV}`
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
                ` ER Studio  : http://localhost:${PORT}/er/ (alias: /halloween/)`
            );

            console.log(
                ` Health     : http://localhost:${PORT}/api/health`
            );

            console.log(
                ` API Status : http://localhost:${PORT}/api/status`
            );

            console.log(
                ` Web Status : http://localhost:${PORT}/status`
            );

            console.log(
                "================================================"
            );

            console.log("");

        }
    );

/* ============================================================
   SERVER ERROR HANDLING
   ------------------------------------------------------------
   Handles startup errors such as:

   EADDRINUSE
   EACCES
   ============================================================ */

server.on(
    "error",
    (error) => {

        console.error(
            "[WEBZONEBW SERVER ERROR]",
            error
        );

        if (
            error.code ===
            "EADDRINUSE"
        ) {

            console.error(
                `[WEBZONEBW] Port ${PORT} is already in use.`
            );

            console.error(
                "[WEBZONEBW] Stop the existing server " +
                "or choose another PORT."
            );

        }

        if (
            error.code ===
            "EACCES"
        ) {

            console.error(
                `[WEBZONEBW] Permission denied for port ${PORT}.`
            );

        }

        process.exit(1);

    }
);

/* ============================================================
   GRACEFUL SHUTDOWN
   ============================================================ */

let shuttingDown = false;

const shutdown = (signal) => {

    if (shuttingDown) {
        return;
    }

    shuttingDown = true;

    console.log(
        `\n[WEBZONEBW] ${signal} received. ` +
        `Shutting down...`
    );

    /*
     * Stop accepting new connections.
     *
     * Existing requests are allowed to finish.
     */
    server.close((error) => {

        if (error) {

            console.error(
                "[WEBZONEBW] Shutdown error:",
                error
            );

            process.exit(1);

        }

        console.log(
            "[WEBZONEBW] Server closed successfully."
        );

        process.exit(0);

    });

    /*
     * Safety timeout.
     */
    setTimeout(() => {

        console.error(
            "[WEBZONEBW] Forced shutdown after timeout."
        );

        process.exit(1);

    }, 10000).unref();

};

/* ============================================================
   SHUTDOWN SIGNALS
   ============================================================ */

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

/* ============================================================
   END OF WEBZONEBW SERVER
   ============================================================ */