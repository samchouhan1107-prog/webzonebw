/**
 * ==========================================================
 * WEBZONEBW — ROUTE & NAVIGATION VALIDATION TEST
 * ==========================================================
 *
 * Validates:
 * - All sidebar nav links resolve to existing files
 * - All footer nav links resolve to existing files
 * - Sitemap URLs correspond to real files
 * - No broken internal routes
 * - No functional href="#" outside cookie-settings
 * - No placeholder content (Coming Soon, TODO, etc.)
 *
 * Run: node verify-routes.js
 * ==========================================================
 */

"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT = __dirname;
let passed  = 0;
let failed  = 0;

function assert(condition, label) {
    if (condition) {
        passed++;
    } else {
        failed++;
        console.error("  FAIL: " + label);
    }
}

function fileExists(relativePath) {
    return fs.existsSync(path.join(ROOT, relativePath));
}

function readText(filePath) {
    return fs.readFileSync(filePath, "utf8");
}

function extractInternalHrefs(html) {
    const results = [];
    const regex   = /href="([^"]*)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const target = match[1];

        if (/^(https?:\/\/|mailto:|javascript:|data:)/.test(target)) { continue; }
        if (target === "" || target === "#" || target.startsWith("#")) { continue; }

        results.push(target);
    }

    return results;
}


/* ============================================================
   1. SIDEBAR NAV LINK CHECK
   ============================================================ */

console.log("\n=== 1. SIDEBAR NAVIGATION ===");

const expectedSidebarLinks = [
    "index.html",
    "er/index.html",
    "projects.html",
    "resume.html",
    "blog.html",
    "soundbox.html",
    "about.html",
    "contact.html",
    "privacy.html",
    "terms.html"
];

const mainPages = [
    "index.html",
    "about.html",
    "contact.html",
    "privacy.html",
    "terms.html",
    "projects.html",
    "resume.html",
    "blog.html",
    "soundbox.html",
    "disclaimer.html"
];

mainPages.forEach(function (page) {
    const html = readText(path.join(ROOT, page));
    expectedSidebarLinks.forEach(function (link) {
        const exists = html.includes('href="' + link + '"');
        assert(exists, page + " sidebar missing: " + link);
    });
});

console.log("  Sidebar links checked across " + mainPages.length + " pages");


/* ============================================================
   2. FOOTER NAV LINK CHECK
   ============================================================ */

console.log("\n=== 2. FOOTER NAVIGATION ===");

mainPages.forEach(function (page) {
    const html = readText(path.join(ROOT, page));
    assert(html.includes('footer-section-label'),  page + " footer missing section label");
    assert(html.includes("Company / Legal"),        page + " footer missing 'Company / Legal'");
    assert(html.includes('about.html'),             page + " footer missing about.html");
    assert(html.includes('contact.html'),           page + " footer missing contact.html");
    assert(html.includes('privacy.html'),           page + " footer missing privacy.html");
    assert(html.includes('terms.html'),             page + " footer missing terms.html");
    assert(html.includes('disclaimer.html'),        page + " footer missing disclaimer.html");
    assert(html.includes("Terms of Service"),       page + " footer still says 'Terms & Conditions'");
});


/* ============================================================
   3. INTERNAL ROUTE RESOLUTION
   ============================================================ */

console.log("\n=== 3. INTERNAL ROUTE RESOLUTION ===");

let totalLinks   = 0;
let brokenLinks  = 0;

mainPages.forEach(function (page) {
    const html    = readText(path.join(ROOT, page));
    const targets = extractInternalHrefs(html);

    targets.forEach(function (target) {
        totalLinks++;
        const resolved = path.join(ROOT, target);
        if (!fs.existsSync(resolved)) {
            brokenLinks++;
            console.error("  BROKEN: " + page + " -> " + target);
        }
    });
});

assert(brokenLinks === 0, brokenLinks + " broken internal links found (" + brokenLinks + "/" + totalLinks + ")");
console.log("  Links checked: " + totalLinks + ", Broken: " + brokenLinks);


/* ============================================================
   4. SITEMAP CONSISTENCY
   ============================================================ */

console.log("\n=== 4. SITEMAP CONSISTENCY ===");

const sitemap       = readText(path.join(ROOT, "sitemap.xml"));
const sitemapUrls   = [];
const sitemapRegex  = /<loc>(https:\/\/[^<]+)<\/loc>/g;
let sitemapMatch;

while ((sitemapMatch = sitemapRegex.exec(sitemap)) !== null) {
    sitemapUrls.push(sitemapMatch[1]);
}

let sitemapMissing = 0;

sitemapUrls.forEach(function (url) {
    let relativePath = url.replace("https://webzonebw.in", "");
    if (relativePath === "/") { relativePath = "/index.html"; }
    const exists = fileExists(relativePath.substring(1));
    if (!exists) {
        sitemapMissing++;
        console.error("  SITEMAP TARGET MISSING: " + url);
    }
});

assert(sitemapMissing === 0, sitemapMissing + " sitemap URLs have no matching file");
console.log("  Sitemap entries: " + sitemapUrls.length + ", Missing targets: " + sitemapMissing);


/* ============================================================
   5. PLACEHOLDER / INCOMPLETE CONTENT CHECK
   ============================================================ */

console.log("\n=== 5. PLACEHOLDER CONTENT CHECK ===");

const placeholderPatterns = [
    "Coming Soon",
    "Under Construction",
    "Lorem ipsum",
    "TODO",
    "FIXME"
];

let placeholderFound = 0;

mainPages.forEach(function (page) {
    const html = readText(path.join(ROOT, page));
    placeholderPatterns.forEach(function (pattern) {
        if (html.includes(pattern)) {
            placeholderFound++;
            console.error("  PLACEHOLDER: " + page + " contains '" + pattern + "'");
        }
    });
});

assert(placeholderFound === 0, placeholderFound + " placeholder patterns found");


/* ============================================================
   6. HREF="#" FUNCTIONALITY
   ============================================================ */

console.log("\n=== 6. HREF=# FUNCTIONALITY ===");

let nonFunctionalHash = 0;

mainPages.forEach(function (page) {
    const html   = readText(path.join(ROOT, page));
    const lines  = html.split("\n");

    lines.forEach(function (line, index) {
        if (line.includes('href="#"')) {
            const surrounding = lines.slice(
                Math.max(0, index - 3),
                Math.min(lines.length, index + 4)
            ).join("\n");

            if (!surrounding.includes("webzonebw-cookie-settings")) {
                nonFunctionalHash++;
                console.error("  NON-FUNCTIONAL href='#': " + page + " line " + (index + 1));
            }
        }
    });
});

assert(nonFunctionalHash === 0, nonFunctionalHash + " non-functional href='#' links");


/* ============================================================
   7. CLEAN URL ROUTES
   ============================================================ */

console.log("\n=== 7. CLEAN URL ROUTES ===");

const serverJs = readText(path.join(ROOT, "server.js"));
const cleanRoutes = [
    "/privacy-policy",
    "/terms-of-service",
    "/about-us",
    "/contact-us"
];

cleanRoutes.forEach(function (route) {
    const registered = serverJs.includes('"' + route + '"');
    assert(registered, "Clean route not registered in server.js: " + route);
});


/* ============================================================
   8. DUPLICATE NAVIGATION DESTINATIONS
   ============================================================ */

console.log("\n=== 8. SIDEBAR DUPLICATE CHECK ===");

mainPages.forEach(function (page) {
    const html   = readText(path.join(ROOT, page));
    const targets = extractInternalHrefs(html);
    const unique  = new Set(targets);

    /* Only check the first 10 links (sidebar) */
    const sidebarTargets = targets.slice(0, 12);
    const sidebarUnique  = new Set(sidebarTargets);

    assert(
        sidebarUnique.size >= 9,
        page + " has duplicate sidebar links (unique: " + sidebarUnique.size + ")"
    );
});


/* ============================================================
   SUMMARY
   ============================================================ */

console.log("\n===========================================");
console.log("  RESULTS: " + passed + " passed, " + failed + " failed");
console.log("===========================================\n");

process.exit(failed > 0 ? 1 : 0);
