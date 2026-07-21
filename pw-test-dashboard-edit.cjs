const { chromium } = require('playwright');

(async () => {
  console.log("Starting dashboard edit verification test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  page.on('pageerror', error => console.log('BROWSER CRASH:', error.stack || error.message));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Reset DB
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForTimeout(3000);

    // 1. Create a variable expense (Supermercado)
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Alimentos Coto');
    await page.locator('input[placeholder="0.00"]').fill('40000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Created Alimentos Coto expense of 40.000");

    // 2. Open Category details sheet (click Esenciales row)
    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    console.log("Opened Esenciales Details bottom sheet");

    // Verify Alimentos Coto is visible in bottom sheet
    const rowText = await page.locator('div.category-sheet').innerText();
    if (!rowText.includes('Alimentos Coto')) {
      throw new Error("Alimentos Coto should be visible inside Category sheet");
    }

    // 3. Click "Editar" inside the bottom sheet
    await page.locator('button:has-text("Editar")').first().click();
    await page.waitForTimeout(1000);
    console.log("Clicked Edit on Alimentos Coto inside bottom sheet");

    // Update Coto amount to 45000
    await page.locator('input[placeholder="0.00"]').fill('45000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Saved updated amount 45000");

    // 4. Open Category details sheet again to verify the value updated
    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    
    const updatedRowText = (await page.locator('div.category-sheet').innerText()).replace(/\s+/g, ' ');
    console.log(`Updated sheet text: ${updatedRowText}`);
    if (!updatedRowText.includes('45.000')) {
      throw new Error(`Expected updated sheet to contain $ 45.000, got: ${updatedRowText}`);
    }
    console.log("✅ Dashboard Category bottom sheet edit verification passed successfully!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-dashboard-edit.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
