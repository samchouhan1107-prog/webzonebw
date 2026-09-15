export default async function run(page) {
  const results = {};

  results.wiring = await page.evaluate(() => ({
    licenseApi: typeof window.WEBZONEBW_LICENSE !== "undefined",
    licenseStatus: window.WEBZONEBW_LICENSE ? window.WEBZONEBW_LICENSE.getStatus() : "missing",
    studio: typeof window.WEBZONEBW_ER_STUDIO !== "undefined" ? "present" : "missing",
    pipeline: typeof window.WEBZONEBW_ER_PIPELINE !== "undefined" ? "present" : "missing",
  }));

  await page.click('[data-smart-cat="pose"]');
  await page.waitForTimeout(300);
  results.poseCards = await page.evaluate(() =>
    document.querySelectorAll('#effectsCardGrid [data-cat="pose"]').length);

  await page.click('[data-smart-cat="vr"]');
  await page.waitForTimeout(300);
  results.vrCards = await page.evaluate(() =>
    document.querySelectorAll('#effectsCardGrid [data-cat="vr"]').length);

  await page.click('[data-smart-cat="premium"]');
  await page.waitForTimeout(300);
  results.premiumCards = await page.evaluate(() =>
    document.querySelectorAll('#effectsCardGrid [data-premium="true"]').length);

  await page.evaluate(() => window.WEBZONEBW_LICENSE.openCheckout());
  await page.waitForTimeout(500);
  results.checkoutModal = await page.evaluate(() => {
    const m = document.getElementById("erLicenseCheckout");
    if (!m) return { visible: false };
    return {
      visible: true,
      hasPayBtn: !!m.querySelector("#licPayBtn"),
      payText: (m.querySelector("#licPayBtn")?.textContent || "").trim(),
      mentionsPaypal: /paypal/i.test(m.textContent || ""),
      mentionsCashfree: /cashfree/i.test(m.textContent || ""),
      emailExposed: /samchouhan1107/i.test(m.textContent || ""),
      hasEmailOrderBtn: !!m.querySelector("#licEmailOrderBtn"),
    };
  });

  await page.evaluate(() => document.querySelector("#licPayBtn")?.click());
  await page.waitForTimeout(300);
  results.checkoutValidation = await page.evaluate(() => {
    const m = document.getElementById("erLicenseCheckout");
    return m ? m.querySelector("#licError")?.textContent : "modal-closed";
  });

  await page.evaluate(() => document.getElementById("erLicenseCheckout")?.remove());
  return JSON.stringify(results, null, 2);
}
