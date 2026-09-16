# Probe Render backend API routes
$u = 'https://webzonebw-er-studio.onrender.com'
$paths = @('/', '/api/health', '/api/status', '/api/paypal/client-id')
foreach ($p in $paths) {
    try {
        $r = Invoke-WebRequest -Uri "$u$p" -Method GET -TimeoutSec 90 -UseBasicParsing
        $c = $r.Content
        if ($c.Length -gt 200) { $c = $c.Substring(0, 200) }
        "$p -> $($r.StatusCode): $c"
    } catch {
        $w = $_.Exception.Response
        if ($w) {
            "$p -> $([int]$w.StatusCode)"
        } else {
            "$p -> ERROR: $($_.Exception.Message)"
        }
    }
}
