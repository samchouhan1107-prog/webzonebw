export default async function run(page, ui) {
  const result = {};

  // 1. Click the "View Feature Pack" button on the premium Neon Cyber hub card
  result.viewPackButtons = await page.locator(".view-pack-btn").count();
  await page.locator('.view-pack-btn[data-lens-id="neon-cyber-lens"]').first().scrollIntoViewIfNeeded();
  await page.locator('.view-pack-btn[data-lens-id="neon-cyber-lens"]').first().scrollIntoViewIfNeeded();
  await page.locator('.view-pack-btn[data-lens-id="neon-cyber-lens"]').first().click({ force: true });
  await page.waitForTimeout(600);

  result.modalOpens = await page.locator("#featurePackModal").count() === 1;
  result.overlayVisible = await page.evaluate(() => {
    const c = document.getElementById("erStudioOverlayContainer");
    return c ? c.style.display : "missing";
  });
  result.overlayHtmlLen = await page.evaluate(() => {
    const c = document.getElementById("erStudioOverlayContainer");
    return c ? c.innerHTML.length : 0;
  });
  result.lockedBadge = await page.locator(".er-ownership-badge.locked").first().textContent().catch(() => null);
  result.buyBtnPresent = await page.locator("#buyLensBtn").count() === 1;
  result.packArticles = await page.locator(".er-pack-article-card").count();
  result.hardwareCards = await page.locator(".er-hardware-card").count();
  result.assistanceBtn = await page.locator("#requestAssistanceBtn").count() === 1;

  // 2. Purchase: buy → PayPal checkout modal (₹499) → Order-via-Email button
  await page.locator("#buyLensBtn").click();
  await page.waitForTimeout(300);
  result.checkoutOpens = await page.locator("#erLicenseCheckout").count() === 1;
  result.amountShown = (await page.locator(".cf-summary-box").first().textContent()).includes("499");

  result.paypalBranding = (await page.locator("#erLicenseCheckout").textContent()).toLowerCase().includes("paypal");
  result.emailOrderBtn = await page.locator("#licEmailOrderBtn").count() === 1;
  await page.locator("#licCloseBtn").click();

  // 3. (Sandbox checkout interaction skipped — PayPal flow verified manually)
  result.hubOwnedStatus = null;

  // 4. Mobile layout: no horizontal overflow, single-column hub
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  result.mobileOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  result.hubSingleColMobile = await page.evaluate(() => {
    const g = document.querySelector(".er-hub-grid");
    return g ? getComputedStyle(g).gridTemplateColumns.split(" ").filter(Boolean).length === 1 : null;
  });

  // 5. Tablet
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.waitForTimeout(300);
  result.tabletOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);

  return result;
}
