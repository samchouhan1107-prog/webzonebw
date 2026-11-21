# WEBZONEBW - pre-push secret scan over the staged git diff
# Fails (exit 1) if any credential-shaped literal is found.
$patterns = @(
    'sk_live_[A-Za-z0-9]+',
    'pk_live_[A-Za-z0-9]+',
    'sk_test_[A-Za-z0-9]{20,}',
    'AKIA[0-9A-Z]{16}',
    'ghp_[A-Za-z0-9]{30,}',
    'gho_[A-Za-z0-9]{30,}',
    'xox[bap]-[A-Za-z0-9-]{10,}',
    'AIza[0-9A-Za-z_-]{30,}',
    'BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY',
    'client_secret\s*[:=]\s*["''][A-Za-z0-9_-]{16,}["'']',
    'password\s*[:=]\s*["''][^"'']{6,}["'']',
    'api[_-]?key\s*[:=]\s*["''][A-Za-z0-9_-]{16,}["'']'
)

$diff = git diff --cached
$hits = @()
foreach ($p in $patterns) {
    $matches = $diff | Select-String -Pattern $p
    foreach ($m in $matches) {
        # Ignore env-var *references* (process.env.X) and placeholder text
        $line = $m.Line
        if ($line -match 'process\.env|your[_-]?|<[^>]+>|EXAMPLE|placeholder') { continue }
        $hits += [pscustomobject]@{ Pattern = $p; Line = $line.Trim().Substring(0, [Math]::Min(120, $line.Trim().Length)) }
    }
}

if ($hits.Count -gt 0) {
    Write-Output "POTENTIAL SECRETS FOUND:"
    $hits | Format-Table -AutoSize | Out-String | Write-Output
    exit 1
} else {
    Write-Output "OK: no credential-shaped literals in staged diff"
    exit 0
}
