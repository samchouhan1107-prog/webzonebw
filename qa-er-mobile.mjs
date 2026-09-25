export default async function run(page) {
  const results = {};
  for (const [name, w, h] of [['mobile-390', 390, 844], ['mobile-360', 360, 740], ['small-320', 320, 568]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto('https://webzonebw.in/er/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    results[name] = await page.evaluate(() => {
      const doc = document.documentElement;
      const vw = doc.clientWidth;
      const overflowing = [];
      document.querySelectorAll('body *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width > 1 && (r.right > vw + 1 || r.left < -1)) {
          const cs = getComputedStyle(el);
          if (cs.position === 'fixed') return;
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
            w: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right)
          });
        }
      });
      return {
        scrollWidth: doc.scrollWidth, clientWidth: vw,
        horizScroll: doc.scrollWidth > doc.clientWidth,
        bodyScrollW: document.body.scrollWidth,
        overflowCount: overflowing.length,
        overflowing: overflowing.slice(0, 25),
        tapTargets: (() => {
          let small = 0;
          document.querySelectorAll('button, a').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) small++;
          });
          return small;
        })()
      };
    });
    await page.screenshot({ path: `qa-${name}.png`, fullPage: false });
  }
  return results;
}
