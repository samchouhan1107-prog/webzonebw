# Production verification for WebZoneBW API (Render) and static host
$urls = @(
  'https://webzonebw-er-studio.onrender.com/api/health',
  'https://webzonebw-er-studio.onrender.com/status',
  'https://webzonebw-er-studio.onrender.com/api/status',
  'https://webzonebw-er-studio.onrender.com/er/',
  'https://webzonebw-er-studio.onrender.com/halloween/',
  'https://webzonebw.in/api/health',
  'https://webzonebw.in/api/paypal/client-id',
  'https://webzonebw.in/'
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -Method GET -UseBasicParsing -TimeoutSec 90
    $body = ''
    if ($r.Content) { $body = ($r.Content -replace "`n", ' '); if ($body.Length -gt 160) { $body = $body.Substring(0,160) } }
    Write-Output ("{0} -> {1} {2}" -f $u, [int]$r.StatusCode, $body)
  } catch {
    $w = $_.Exception.Response
    if ($w) {
      Write-Output ("{0} -> HTTP {1}" -f $u, [int]$w.StatusCode)
    } else {
      Write-Output ("{0} -> ERROR: {1}" -f $u, $_.Exception.Message)
    }
  }
}
