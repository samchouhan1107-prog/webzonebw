export default async function run(page, ui) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));

  const btn = page.locator('.view-pack-btn[data-lens-id="neon-cyber-lens"]').first();
  await btn.scrollIntoViewIfNeeded();

  const viaEval = await page.evaluate(() => {
    const b = document.querySelector('.view-pack-btn[data-lens-id="neon-cyber-lens"]');
    if (!b) return "no button";
    const r = b.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    const info = (el) => el ? { tag: el.tagName, id: el.id, cls: el.className, z: getComputedStyle(el).zIndex, pos: getComputedStyle(el).position, pe: getComputedStyle(el).pointerEvents, rect: JSON.parse(JSON.stringify(el.getBoundingClientRect())) } : null;
    return { rect: { x: r.x, y: r.y, w: r.width, h: r.height }, topEl: info(top), sameAsBtn: top === b };
  });

  await page.waitForTimeout(800);
  const state = await page.evaluate(() => {
    const c = document.getElementById("erStudioOverlayContainer");
    return {
      containerDisplay: c ? c.style.display : "missing",
      containerLen: c ? c.innerHTML.length : 0,
      modalExists: !!document.getElementById("featurePackModal"),
      lockedBadge: document.querySelector(".er-ownership-badge.locked")?.textContent?.trim() || null,
    };
  });

  return { viaEval, state, errors };
}
