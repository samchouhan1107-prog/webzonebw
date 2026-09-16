$urls = @(
  'https://webzonebw.in/api/paypal/client-id',
  'https://webzonebw.in/api/health',
  'https://webzonebw-er-studio.onrender.com/',
  'https://webzonebw-er-studio.onrender.com/api/health'
)
foreach($u in $urls){
  $req = [System.Net.HttpWebRequest]::Create($u)
  $req.Method = 'GET'
  $req.Timeout = 90000
  try {
    $r = $req.GetResponse()
    $sr = New-Object IO.StreamReader($r.GetResponseStream())
    "{0} -> {1}: {2}" -f $u, [int]$r.StatusCode, $sr.ReadToEnd()
  } catch [System.Net.WebException] {
    $w = $_.Exception.Response
    if ($w) {
      $sr = New-Object IO.StreamReader($w.GetResponseStream())
      "{0} -> {1} | Server: {2} | X-Render: {3} | Body: {4}" -f $u, [int]$w.StatusCode, $w.Headers['Server'], $w.Headers['X-Render'], $sr.ReadToEnd()
    } else {
      "{0} -> ERROR: {1}" -f $u, $_.Exception.Message
    }
  }
}
