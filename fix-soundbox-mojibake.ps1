$path = 'C:\Users\HP\Downloads\WebZoneBW.in\soundbox.html'
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix mojibake - these are UTF-8 bytes misinterpreted as Latin-1
# Pattern: replace corrupted sequences with correct Unicode characters

# Em-dash: —
$content = $content.Replace([char]0x00E2 + [char]0x0080 + [char]0x0094, [char]0x2014)
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00E2 + [char]0x0082 + [char]0x00A5, [char]0x2014)

# Bullet: · 
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00C2 + [char]0x00A2, [char]0x00B7)

# Music note emoji: 🎵
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B5, [char]0x1F3B5)

# Headphones emoji: 🎧
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A7, [char]0x1F3A7)

# Camera emoji: 📷
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A4, [char]0x1F4F7)

# Musical notes emoji: 🎶
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B6, [char]0x1F3B6)

# Studio/Settings emoji: 🎛️
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BE, [char]0x1F39B)

# Vinyl record emoji: 🎵
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BF, [char]0x1F3B5)

# Fire emoji: 🔥
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00E2 + [char]0x0082 + [char]0x00A5, [char]0x1F525)

# Right arrow: ▶
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00C2 + [char]0x00BA, [char]0x25B6)

# Left arrow: ◀
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00C2 + [char]0x00B9, [char]0x25C0)

# Close/X button: ✕
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00E2 + [char]0x0082 + [char]0x00AC, [char]0x2715)

# Globe/Link emoji: 🔗
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B1, [char]0x1F517)

# Heart emoji: ❤️
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B9, [char]0x2764)

# Checkmark emoji: ✅
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00E2 + [char]0x0082 + [char]0x00B3, [char]0x2705)

# Settings/Gear emoji: ⚙️
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00E2 + [char]0x0082 + [char]0x00A7, [char]0x2699)

# Factory/Studio emoji: 🏭
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00E2 + [char]0x0082 + [char]0x00A4, [char]0x1F3ED)

# Lock emoji: 🔒
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A9, [char]0x1F512)

# Shield emoji: 🛡️
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A1, [char]0x1F6E1)

# Cookie emoji: 🍪
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00AA, [char]0x1F36A)

# Trophy emoji: 🏆
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x0097, [char]0x1F3C6)

# Key emoji: 🔑
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B3, [char]0x1F511)

# Wrench emoji: 🔧
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A8, [char]0x1F527)

# File emoji: 📄
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B4, [char]0x1F4C4)

# Folder emoji: 📁
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BB, [char]0x1F4C1)

# Magnifying glass emoji: 🔍
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A0, [char]0x1F50D)

# Info emoji: ℹ️
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00C2 + [char]0x00A1, [char]0x2139)

# Waveform emoji: 〰️
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00C2 + [char]0x00B0, [char]0x3030)

# Diagnostics emoji: 📊
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BE, [char]0x1F4CA)

# Reset emoji: 🔄
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00B2, [char]0x1F504)

# Export emoji: 📤
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A4, [char]0x1F4E4)

# Import emoji: 📥
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A5, [char]0x1F4E5)

# Save emoji: 💾
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A6, [char]0x1F4BE)

# Clipboard emoji: 📋
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BC, [char]0x1F4CB)

# Waveform/Sound emoji: 🔊
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A2, [char]0x1F50A)

# Headphones emoji: 🎧
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A7, [char]0x1F3A7)

# Microphone emoji: 🎤
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A4, [char]0x1F3A4)

# Music album emoji: 💿
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00BF, [char]0x1F4BF)

# Star emoji: ⭐
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x009F, [char]0x2B50)

# Lightbulb emoji: 💡
$content = $content.Replace([char]0x00C3 + [char]0x00B0 + [char]0x00C2 + [char]0x00B6 + [char]0x00C2 + [char]0x00A1, [char]0x1F4A1)

# Success/Checkmark: ✅
$content = $content.Replace([char]0x00C3 + [char]0x00A2 + [char]0x00E2 + [char]0x0082 + [char]0x00AC + [char]0x00E2 + [char]0x0082 + [char]0x00B3, [char]0x2705)

# Write back with proper UTF-8 encoding (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "Fixed mojibake in soundbox.html"
Write-Host "File size: $((Get-Item $path).Length) bytes"
