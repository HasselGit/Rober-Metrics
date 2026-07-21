const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Navigate to Historial tab
    await page.locator('text=Historial').click();
    await page.waitForTimeout(1000);
    
    // Screenshot history (variables tab)
    await page.screenshot({ path: 'screenshot-history-variables.png' });
    console.log("Variables history screenshot saved");

    // Click "Fijos / Suscripciones" button
    await page.locator('button:has-text("Fijos")').click();
    await page.waitForTimeout(1000);

    // Screenshot fijos tab (should be empty initially, or have default data if reset didn't clean subscriptions)
    await page.screenshot({ path: 'screenshot-history-fijos.png' });
    console.log("Fijos history screenshot saved");

  } catch (err) {
    console.error("Screenshot test failed:", err);
  } finally {
    await browser.close();
  }
})();
