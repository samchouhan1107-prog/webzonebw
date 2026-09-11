import { readFileSync, writeFileSync } from 'fs';

const file = 'C:\\Users\\HP\\Downloads\\WebZoneBW.in\\soundbox.html';
let content = readFileSync(file, 'utf8');
let count = 0;

// Each entry: [regex pattern to match corrupted line, replacement string]
const fixes = [
  // Brand subtitle bullet
  [/SYSTEMS\s+Ã[^\u0000-\u007F]+\u0000?\s*·?\s*SUPPORT\s+Ã[^\u0000-\u007F]+\u0000?\s*·?\s*INFRASTRUCTURE/,
   'SYSTEMS · SUPPORT · INFRASTRUCTURE'],

  // Sidebar nav icons - match by href context
  [/href="index\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Dashboard/,
   'href="index.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-house"></i></span>\n                        Dashboard'],

  [/href="er\/index\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*WebZoneBW-ER Studio/,
   'href="er/index.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-vr-cardboard"></i></span>\n                        WebZoneBW-ER Studio'],

  [/href="projects\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Projects/,
   'href="projects.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-folder"></i></span>\n                        Projects'],

  [/href="resume\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Resume/,
   'href="resume.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-file-lines"></i></span>\n                        Resume'],

  [/href="blog\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Blog/,
   'href="blog.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-book"></i></span>\n                        Blog'],

  [/href="soundbox\.html"[^>]*>\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Sound Box/,
   'href="soundbox.html" class="active" aria-current="page">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-volume-high"></i></span>\n                        Sound Box'],

  [/href="about\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*About Us/,
   'href="about.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-users"></i></span>\n                        About Us'],

  [/href="contact\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Contact Us/,
   'href="contact.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-envelope"></i></span>\n                        Contact Us'],

  [/href="privacy\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Privacy Policy/,
   'href="privacy.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></span>\n                        Privacy Policy'],

  [/href="cookie-policy\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Cookie Policy/,
   'href="cookie-policy.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-cookie"></i></span>\n                        Cookie Policy'],

  [/href="privacy-center\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Privacy Center/,
   'href="privacy-center.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>\n                        Privacy Center'],

  [/href="terms\.html">\s*\n\s*<span class="nav-icon"[^>]*>[^<]+<\/span>\s*\n\s*Terms of Service/,
   'href="terms.html">\n                        <span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-file-contract"></i></span>\n                        Terms of Service'],

  // Theme mode icon
  [/<span id="themeModeIcon"[^>]*>[^<]+<\/span>/,
   '<span id="themeModeIcon" aria-hidden="true"><i class="fa-solid fa-moon"></i></span>'],

  // User avatar
  [/<span class="user-avatar-icon">[^<]+<\/span>/,
   '<span class="user-avatar-icon"><i class="fa-solid fa-user"></i></span>'],
];

for (const [pattern, replacement] of fixes) {
  if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    count++;
  }
}

// Now fix all remaining mojibake: any <span>nav-icon content</span> that still has mojibake
// Match nav-icon spans where the content contains non-ASCII beyond normal range
const navIconPattern = /<span class="nav-icon" aria-hidden="true">[^<]*<\/span>/g;
let match;
const navReplacements = [];
while ((match = navIconPattern.exec(content)) !== null) {
  const inner = match[0];
  // Check if inner contains characters above U+00FF (mojibake indicator)
  let hasMojibake = false;
  for (let i = 0; i < inner.length; i++) {
    if (inner.charCodeAt(i) > 0x00FF && inner.charCodeAt(i) !== 0x2019 && inner.charCodeAt(i) !== 0x2018) {
      hasMojibake = true;
      break;
    }
  }
  if (hasMojibake) {
    navReplacements.push({ start: match.index, end: match.index + match[0].length, original: inner });
  }
}

// Replace remaining corrupted nav-icons with a generic icon (we'll need context)
// Actually, let's also fix comment mojibake and text mojibake
const textFixes = [
  // Em-dash patterns in comments and text
  [/WEBZONEBW\s+Ã[^\n]+SOUND BOX & CURATED PLAYLISTS/g, 'WEBZONEBW — SOUND BOX & CURATED PLAYLISTS'],
  [/Acoustic Soundscapes Ã[^\n]+Studio Discography Ã[^\n]+Archive/g, 'Acoustic Soundscapes · Studio Discography · Archive'],
  [/PERFORMANCE Ã[^\n]+PRECONNECT HINTS/g, 'PERFORMANCE — PRECONNECT HINTS'],
  [/Google Consent Mode v2 Ã[^\n]+defaults/g, 'Google Consent Mode v2 — defaults'],
  [/STRUCTURED DATA Ã[^\n]+WEBPAGE/g, 'STRUCTURED DATA — WEBPAGE'],
  [/Evolution \(1964[^)]*1970\)/g, 'Evolution (1964—1970)'],
  [/Historical Phases \(1964[^)]*1970\)/g, 'Historical Phases (1964—1970)'],
  [/Across 6 Historic Eras Ã[^\n]+Interactive/g, 'Across 6 Historic Eras · Interactive'],
  [/Soundscape Ã[^\n]+Master/g, 'Soundscape · Master'],
  [/Tracks Live Ã[^\n<]+/g, 'Tracks Live 🔥'],
  [/Phases 1[^)]*6\)/g, 'Phases 1—6)'],
  [/Tracks 1[^)]*5\)/g, 'Tracks 1–5)'],
  [/Tracks 6[^)]*9\)/g, 'Tracks 6–9)'],
  [/Tracks 10[^)]*13\)/g, 'Tracks 10–13)'],
  [/Tracks 14[^)]*17\)/g, 'Tracks 14–17)'],
  [/Tracks 18[^)]*21\)/g, 'Tracks 18–21)'],
  [/Tracks 22[^)]*23\)/g, 'Tracks 22–23)'],
  [/© 2026/g, '© 2026'],
];

for (const [pattern, replacement] of textFixes) {
  const before = content;
  content = content.replace(pattern, replacement);
  if (content !== before) count++;
}

// Fix emoji in h1 header
content = content.replace(/Ã[^\s]*\s*The Beatles: 6-Phase/g, '🎵 The Beatles: 6-Phase');

// Fix emoji in header badge
content = content.replace(/Live Ã[^\n<]+/g, 'Live 🔥');

// Fix audio source status and settings pill icons
const iconFixes = [
  [/(?:<span>)?Ã[^\n]*?Studio Console/g, '<span>🎛️</span> Studio Console'],
  [/(?:<span class="synth-note"[^>]*>)Ã[^\n]*?Inventory/g, '<span class="synth-note" id="audioSourceStatus">🎛️ Inventory'],
  [/(?:<span class="vol-icon"[^>]*>)Ã[^\n]*?<\/span>/g, '<span class="vol-icon" id="volIcon">🔊</span>'],
];

for (const [pattern, replacement] of iconFixes) {
  const before = content;
  content = content.replace(pattern, replacement);
  if (content !== before) count++;
}

// Fix all remaining "Â·" (double-encoded bullet) to "·"
content = content.replace(/Â·/g, '·');
content = content.replace(/ÃÂ¢Ã¢â€šÂ¬Ã…Â½/g, '·');
content = content.replace(/ÃÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å"/g, '—');
content = content.replace(/ÃÂ¢Ã¢â€šÂ¬Ã…Â"/g, '—');
content = content.replace(/ÃÂ¢Ã¢â€šÂ¬/g, '—');

// Fix "SYSTEMS Â· SUPPORT" pattern
content = content.replace(/SYSTEMS\s+Â·\s*SUPPORT/g, 'SYSTEMS · SUPPORT');

writeFileSync(file, content, 'utf8');
console.log(`Applied ${count} fixes`);
console.log('Remaining mojibake lines:', (content.match(/Ã/g) || []).length);
