const fs = require('fs');

['privacy.html', 'terms.html', 'disclaimer.html', 'cookie-policy.html'].forEach(f => {
  const c = fs.readFileSync(f, 'utf8');
  const metaMatch = c.match(/<section[^>]*class="[^"]*legal-meta[^"]*"[^>]*>[\s\S]*?<\/section>/);
  if (metaMatch) {
    console.log(f, 'found legal-meta:', metaMatch[0].slice(0, 150));
  } else {
    // Check any date or meta block
    const dateMatch = c.match(/(?:Last Updated|Effective Date)[^<]*/gi);
    console.log(f, 'no legal-meta class, dates found:', dateMatch ? dateMatch.slice(0, 3) : 'none');
  }
});
