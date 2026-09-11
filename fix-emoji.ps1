$path = 'c:\Users\HP\Downloads\WebZoneBW.in\index.html'
$bytes = [System.IO.File]::ReadAllBytes($path)

# Check if UTF-8 BOM present
$bom = ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
if ($bom) {
    $content = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
} else {
    $content = [System.Text.Encoding]::UTF8.GetString($bytes)
}

# Show a sample around nav icons to understand the encoding
$idx = $content.IndexOf('nav-icon')
if ($idx -gt 0) {
    $sample = $content.Substring($idx, 500)
    Write-Host "Sample around nav-icon:"
    Write-Host $sample
}

# Check hex bytes around first nav-icon
$byteIdx = [System.Text.Encoding]::UTF8.GetBytes($content).IndexOf([System.Text.Encoding]::UTF8.GetBytes('nav-icon'))
if ($byteIdx -gt 0) {
    $around = $bytes[$byteIdx..($byteIdx+200)]
    $hex = ($around | ForEach-Object { '{0:X2}' -f $_ }) -join ' '
    Write-Host "`nHex bytes:"
    Write-Host $hex
}
