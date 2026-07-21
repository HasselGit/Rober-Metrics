const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E subscription creation test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 1. Clear database to start clean
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForTimeout(3000);

    // 2. Click the central FAB "+" button on dashboard
    await page.locator('button.fab').click();
    await page.waitForTimeout(1000);
    console.log("Opened central Transaction Form");

    // 3. Select type "Gasto Fijo / Suscripción"
    await page.locator('select').first().selectOption('subscription');
    await page.waitForTimeout(500);

    // Verify category "Ahorro" is not visible in DOM
    const categorySelector = page.locator('select').nth(1);
    const options = await categorySelector.evaluate(el => Array.from(el.options).map(o => o.value));
    console.log(`Available categories for Subscription: ${options}`);
    if (options.includes('ahorro')) {
      throw new Error("Category selection should NOT include Ahorro for subscriptions");
    }

    // Select category "no-esenciales" (No Esenciales 30%)
    await categorySelector.selectOption('no-esenciales');

    // Fill details
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Netflix Premium');
    await page.locator('input[placeholder="0.00"]').fill('12000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Netflix subscription created from central form");

    // 4. Navigate to Historial tab
    await page.locator('text=Historial').click();
    await page.waitForTimeout(1000);

    // 5. Select "Fijos / Suscripciones" sub-tab
    await page.locator('button:has-text("Fijos")').click();
    await page.waitForTimeout(1000);

    // Get the inner text of the Fijos tab
    const fijosText = (await page.locator('div').filter({ hasText: /^Netflix Premium/ }).first().innerText()).replace(/\s+/g, ' ');
    console.log(`Netflix Premium Card Info: ${fijosText}`);
    if (!fijosText.includes('$ 12.000')) {
      throw new Error(`Expected Netflix Premium to show $ 12.000, got: ${fijosText}`);
    }
    console.log("✅ Subscription creation through central form tested successfully!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-fijos.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
