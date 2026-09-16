$paths = @('/', '/api/health', '/api/paypal/client-id')
foreach ($p in $paths) {
    $url = "https://webzonebw.onrender.com$p"
    Write-Output "=== $url ==="
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 90
        Write-Output ("STATUS: " + [int]$r.StatusCode)
        Write-Output ("SERVER: " + $r.Headers['server'])
        $body = $r.Content
        if ($body.Length -gt 300) { $body = $body.Substring(0,300) }
        Write-Output ("BODY: " + $body)
    } catch {
        $w = $_.Exception.Response
        if ($w) {
            Write-Output ("STATUS: " + [int]$w.StatusCode)
            Write-Output ("SERVER: " + $w.Headers['server'])
            $sr = New-Object IO.StreamReader($w.GetResponseStream())
            Write-Output ("BODY: " + $sr.ReadToEnd())
        } else {
            Write-Output ("ERROR: " + $_.Exception.Message)
        }
    }
}
