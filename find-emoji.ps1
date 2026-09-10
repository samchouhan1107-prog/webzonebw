$f = 'C:\Users\HP\Downloads\WebZoneBW.in\index.html'
$b = [System.IO.File]::ReadAllBytes($f)
$c = [System.Text.Encoding]::UTF8.GetString($b)
$pattern = '[\x{1F600}-\x{1F64F}\x{1F300}-\x{1F5FF}\x{1F680}-\x{1F6FF}\x{1F1E0}-\x{1F1FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}]'
$found = [regex]::Matches($c, $pattern)
if ($found.Count -gt 0) {
    Write-Host "Found $($found.Count) emoji(s):"
    foreach ($m in $found) {
        $start = [Math]::Max(0, $m.Index - 40)
        $len = [Math]::Min(80, $c.Length - $start)
        $ctx = $c.Substring($start, $len)
        Write-Host "  Pos $($m.Index): $($m.Value) | $ctx"
    }
} else {
    Write-Host "No standard emojis found"
}
