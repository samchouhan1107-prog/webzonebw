import { readFileSync, writeFileSync } from 'fs';

const filePath = 'C:\\Users\\HP\\Downloads\\WebZoneBW.in\\soundbox.html';
const content = readFileSync(filePath, 'utf8');

// Map of mojibake sequences to their correct replacements
const fixes = [
  // Sidebar nav emojis → Font Awesome (matching index.html)
  // We'll replace the <span class="nav-icon"> content with Font Awesome icons
  // Dashboard
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00c2\u00bfÃ\u00c2\u00a0 </span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-house"></i></span>'],
  // ER Studio  
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ\u00c2\u00ae</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-vr-cardboard"></i></span>'],
  // Projects
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ¢\u0080\u00a2Ã\u00c2\u00bc</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-folder"></i></span>'],
  // Resume
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ¢\u0080\u009dÃ¢\u0080\u00be</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-file-lines"></i></span>'],
  // Blog
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ¢\u0080\u009dÃ\u00c2\u00bf</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-book"></i></span>'],
  // Sound Box
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00b5Ã\u00c2\u00b5</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-volume-high"></i></span>'],
  // About Us
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0080\u0098Ã\u00c2\u00a4</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-users"></i></span>'],
  // Contact Us
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00a2Ã\u0082\u0083Ã\u00e2\u0082\u00acÃ\u00c2\u00bf</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-envelope"></i></span>'],
  // Privacy Policy
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ\u00c2\u00bfÃ¢\u0080\u00a2</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-shield-halved"></i></span>'],
  // Cookie Policy
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00c2\u00bfÃ\u00c2\u00aa</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-cookie"></i></span>'],
  // Privacy Center
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00b5Ã\u00c2\u00b6Ã\u00c2\u00bf</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-lock"></i></span>'],
  // Terms of Service
  ['<span class="nav-icon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ¢\u0080\u009dÃ¢\u0080\u00b9</span>', '<span class="nav-icon" aria-hidden="true"><i class="fa-solid fa-file-contract"></i></span>'],
  // Theme mode icon
  ['<span id="themeModeIcon" aria-hidden="true">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00b5Ã\u0082\u0091Ã¢\u0082\u00a2</span>', '<span id="themeModeIcon" aria-hidden="true"><i class="fa-solid fa-moon"></i></span>'],
  // User avatar
  ['<span class="user-avatar-icon">Ã\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0080\u0098Ã\u00c2\u00a8Ã\u0083\u00a2Ã\u00e2\u0082\u00acÃ\u00c2\u00bfÃ\u0083\u00b0Ã\u0083\u00b6Ã\u0082\u00afÃ\u00e2\u0082\u00acÃ¢\u0080\u00a2Ã\u00c2\u00bb</span>', '<span class="user-avatar-icon"><i class="fa-solid fa-user"></i></span>'],
  // Header h1 music note + em-dash
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5 The Beatles: 6-Phase Evolution (1964\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c1970)', '\ud83c\udfb5 The Beatles: 6-Phase Evolution (1964\u20141970)'],
  // Header p em-dashes and bullet
  ['23 Essential Key Tracks Across 6 Historic Eras \u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2 Interactive Web Audio Soundscape \u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2 Master Playlist', '23 Essential Key Tracks Across 6 Historic Eras \u00b7 Interactive Web Audio Soundscape \u00b7 Master Playlist'],
  // Header badge fire emoji
  ['23 Key Tracks Live \u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00a2', '23 Key Tracks Live \ud83d\udd25'],
  // Section title 3 + em-dash
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00b3 The 6 Historical Phases (1964\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c1970)', '\u2462 The 6 Historical Phases (1964\u20141970)'],
  // Play All button dash
  ['<span>\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c\u00c2\u00b6</span> Play All 23 Tracks (Phases 1\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c6)', '<span>\u25b6</span> Play All 23 Tracks (Phases 1\u20146)'],
  // Section title playlists
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00bc Curated Phase Playlists', '\ud83c\udfb5 Curated Phase Playlists'],
  // Fab Four title
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00b8 The Fab Four Band Members', '\ud83c\udfb8 The Fab Four Band Members'],
  // Section subtitle bullet
  ['Dedicated playlists by historical phase and thematic collections \u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2 6 local inventory stems + synth catalogue fallback', 'Dedicated playlists by historical phase and thematic collections \u00b7 6 local inventory stems + synth catalogue fallback'],
  // Fab heading note bullet
  ['04 voices \u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2 one enduring sound', '04 voices \u00b7 one enduring sound'],
  // Fab card emojis
  ['<span class="fab-emoji">\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u0098\u00e2\u0080\u009d</span>', '<span class="fab-emoji">\ud83c\udfb9</span>'],  // John - guitar
  ['<span class="fab-emoji">\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00bb</span>', '<span class="fab-emoji">\ud83c\udfb7</span>'],  // Paul - piano
  ['<span class="fab-emoji">\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00ac\u00e2\u0082\u00a5\u00c2\u00bf</span>', '<span class="fab-emoji">\ud83c\udfb6</span>'],  // George - sitar
  ['<span class="fab-emoji">\u00c3\u00b0\u00c2\u00b6\u00c2\u00a5\u00c2\u00bf</span>', '<span class="fab-emoji">\ud83c\udf89</span>'],  // Ringo - drums
  // Copyright em-dash
  ['\u00c3\u0083\u00a2\u00c2\u0080\u00c2\u00a9 2026', '\u00a9 2026'],
  // Drawer close button
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00e2\u0080\u009c\u00e2\u0080\u009c', '\u2715'],
  // Drawer tabs - Sliders & EQ
  ['<span>\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00a1\u00c2\u00bf</span> Sliders &amp; EQ', '<span>\ud83d\udd0c</span> Sliders &amp; EQ'],
  // Drawer tab - Files
  ['<span>\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u009d\u00c2\u00bf</span> Suitable Files', '<span>\ud83d\udcc2</span> Suitable Files'],
  // Drawer tab - Waveforms
  ['<span>\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00b9</span> Waveforms', '<span>\ud83d\udc99</span> Waveforms'],
  // Drawer tab - Diagnostics
  ['<span>\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a1</span> Diagnostics', '<span>\ud83d\udcca</span> Diagnostics'],
  // Studio console icon
  ['<div class="drawer-icon-badge">\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00be\u00c2\u00bf</div>', '<div class="drawer-icon-badge">\ud83c\udf9b\ufe0f</div>'],
  // Settings pill button icon
  ['<span>\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00be\u00c2\u00bf</span> Studio Console &amp; Files', '<span>\ud83c\udf9b\ufe0f</span> Studio Console &amp; Files'],
  // Audio source status icon
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00be\u00c2\u00bf Inventory Audio + Synth Fallback', '\ud83c\udf9b\ufe0f Inventory Audio + Synth Fallback'],
  // Slider labels - various
  ['\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00ac\u00e2\u0080\u009d\u00c2\u00a0 Master Output Volume', '\ud83d\udd0a Master Output Volume'],
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a1\u00c2\u00bf Playback Tempo &amp; Speed', '\u23f1\ufe0f Playback Tempo &amp; Speed'],
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00bc Pitch Transposition', '\ud83c\udfb9 Pitch Transposition'],
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00b8 Bass EQ (150Hz Rickenbacker Lows)', '\ud83c\udfb8 Bass EQ (150Hz Rickenbacker Lows)'],
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a8 Treble EQ (3.5kHz Acoustic Chime)', '\ud83c\udfb9 Treble EQ (3.5kHz Acoustic Chime)'],
  ['\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u009d\u00c2\u00bb Lowpass Tone Cutoff', '\ud83c\udfb7 Lowpass Tone Cutoff'],
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00bf\u00e2\u0082\u00ac\u00c2\u00bf Abbey Road Studio 2 Reverb', '\ud83c\udf05 Abbey Road Studio 2 Reverb'],
  ['\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00ac\u00e2\u0082\u00a5\u00c2\u00bf Vinyl Crackle &amp; Tape Flutter', '\ud83e\udded Vinyl Crackle &amp; Tape Flutter'],
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00a7 Stereo Panning Position', '\ud83c\udfb9 Stereo Panning Position'],
  // Files tab icons
  ['<div class="files-hero-icon">\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u009d\u00c2\u00a5</div>', '<div class="files-hero-icon">\ud83d\udce5</div>'],
  ['<span id="customFileNameText">\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00bc custom_audio.mp3</span>', '<span id="customFileNameText">\ud83c\udfb5 custom_audio.mp3</span>'],
  ['\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00ac\u00e2\u0082\u00a5\u00c2\u00bf Suitable Phase Soundscape Stems (6 Phases)', '\ud83c\udfb8 Suitable Phase Soundscape Stems (6 Phases)'],
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a7\u00c2\u00bf Preset Files &amp; Chords Exporter', '\ud83d\udcbe Preset Files &amp; Chords Exporter'],
  ['<div class="tool-action-icon">\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u009d\u00e2\u0080\u00be</div>', '<div class="tool-action-icon">\ud83d\udcdc</div>'],
  ['<div class="tool-action-icon">\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00a5\u00c2\u00be</div>', '<div class="tool-action-icon">\ud83d\udcbe</div>'],
  // Waveform icons
  ['<div class="waveform-icon">\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a8</div>', '<div class="waveform-icon">\ud83c\udfb8</div>'],
  ['<div class="waveform-icon">\u00c3\u00b0\u00c2\u00b6\u00e2\u0080\u009d\u00c2\u00bf</div>', '<div class="waveform-icon">\ud83d\udc9b</div>'],
  ['<div class="waveform-icon">\u00c3\u00b0\u00c2\u00a5\u00c2\u00a1</div>', '<div class="waveform-icon">\ud83c\udfb6</div>'],
  ['<div class="waveform-icon">\u00c3\u00a3\u00e2\u0082\u00ac\u00c2\u00a0\u00c2\u00bf</div>', '<div class="waveform-icon">\ud83d\udd2a</div>'],
  ['<div class="waveform-icon">\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a1\u00c2\u00bf</div>', '<div class="waveform-icon">\ud83d\udd0a</div>'],
  // Diagnostics status
  ['Ready \u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00a2', 'Ready \ud83d\udd25'],
  // Reset button icon
  ['\u00c3\u00b0\u00c2\u00b6\u00e2\u0082\u00ac\u00e2\u0080\u009d\u00e2\u0080\u00be Reset All Sliders', '\ud83d\udd04 Reset All Sliders'],
  // Guide modal
  ['\u00c3\u00b0\u00c2\u00b6\u00c2\u00b5\u00c2\u00bc Beatles 6-Phase Sound Box Guide', '\ud83c\udfb5 Beatles 6-Phase Sound Box Guide'],
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a8 Key Features:', '\ud83d\udca1 Key Features:'],
  ['\u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a7\u00c2\u00bf', '\ud83d\udcbe'],
  ['Got It \u00c3\u00a2\u00e2\u0082\u00ac\u00c2\u00a2 Start Listening', 'Got It \u00b7 Start Listening'],
];

let fixed = content;
let count = 0;
for (const [from, to] of fixes) {
  if (fixed.includes(from)) {
    fixed = fixed.split(from).join(to);
    count++;
  }
}

// Write back with UTF-8 BOM to match the original
writeFileSync(filePath, '\ufeff' + fixed, 'utf8');

console.log(`Applied ${count} mojibake fixes`);
console.log(`File size: ${readFileSync(filePath).length} bytes`);
