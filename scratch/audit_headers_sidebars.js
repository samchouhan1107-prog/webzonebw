const fs = require('fs');

const pages = [
  'index.html',
  'about.html',
  'contact.html',
  'projects.html',
  'resume.html',
  'blog.html',
  'soundbox.html',
  'privacy.html',
  'cookie-policy.html',
  'privacy-center.html',
  'terms.html',
  'disclaimer.html',
  'master.html',
  'er/index.html',
  'er-enhanced-demo.html'
];

pages.forEach(p => {
  if (!fs.existsSync(p)) return;
  const html = fs.readFileSync(p, 'utf8');
  console.log(`\n=== [${p}] ===`);
  const bodyMatch = html.match(/<body[^>]*>/);
  console.log('Body:', bodyMatch ? bodyMatch[0] : 'None');

  const hasMobileNav = html.includes('mobile-nav-bar');
  const hasSidebar = html.includes('id="mainSidebar"');
  const hasTopHeader = html.includes('top-header');
  const hasFooter = html.includes('site-footer');
  const hasThemeToggle = html.includes('id="themeToggleSwitch"');
  const hasConsentBootstrap = html.includes('consent-bootstrap.js');
  const hasCookieConsent = html.includes('cookie-consent.js');
  const hasCookieUtils = html.includes('cookie-utils.js');
  const hasGtag = html.includes('G-ZFZ54Z2997');
  const hasCookieSettingsLink = html.includes('webzonebw-cookie-settings') || html.includes('wbc-reopen');

  console.log({
    hasMobileNav,
    hasSidebar,
    hasTopHeader,
    hasFooter,
    hasThemeToggle,
    hasConsentBootstrap,
    hasCookieConsent,
    hasCookieUtils,
    hasGtag,
    hasCookieSettingsLink
  });
});
