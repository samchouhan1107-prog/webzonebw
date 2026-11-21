/* ==========================================================
   WEBZONEBW — syntax lint for shipped browser + server JS
   Runs `node --check` against every tracked .js/.mjs file
   (excluding node_modules) so broken syntax fails the build.
   ========================================================== */
"use strict";

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function walk(dir, out) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(js|mjs)$/.test(entry.name)) out.push(full);
    }
    return out;
}

const files = walk(process.cwd(), []);
let failed = 0;

for (const file of files) {
    try {
        execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    } catch (e) {
        failed++;
        console.error(`✗ ${path.relative(process.cwd(), file)}\n${e.stderr}`);
    }
}

if (failed) {
    console.error(`\n${failed} file(s) failed syntax check`);
    process.exit(1);
}
console.log(`✓ ${files.length} JS files passed syntax check`);
