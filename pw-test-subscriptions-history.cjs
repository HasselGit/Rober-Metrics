const { chromium } = require('playwright');

(async () => {
  console.log("Starting subscriptions history decoupling verification test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Reset DB
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForTimeout(3000);

    // 1. Create a subscription (Alquiler) in July 2026 with amount 300,000
    // Currently on load we are on July 2026. Let's create it from central form
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('select').first().selectOption('subscription');
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Alquiler depto');
    await page.locator('input[placeholder="0.00"]').fill('300000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Created Alquiler subscription of 300.000 in July 2026");

    // 2. Open Esenciales Details bottom sheet in July 2026 to verify amount is 300.000
    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    let sheetText = await page.locator('div.category-sheet').innerText();
    console.log(`July 2026 sheet text: ${sheetText.replace(/\n/g, ' ')}`);
    if (!sheetText.includes('300.000')) {
      throw new Error("Expected Alquiler to be 300.000 in July 2026");
    }
    // Close sheet
    await page.locator('div.category-sheet button').first().click();
    await page.waitForTimeout(500);

    // 3. Switch month to August 2026 and verify amount is still 300.000 (future continuation)
    await page.locator('input[type="month"]').fill('2026-08');
    await page.waitForTimeout(1000);
    console.log("Switched to August 2026");

    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    sheetText = await page.locator('div.category-sheet').innerText();
    console.log(`August 2026 sheet text (before edit): ${sheetText.replace(/\n/g, ' ')}`);
    if (!sheetText.includes('300.000')) {
      throw new Error("Expected Alquiler to inherit 300.000 in August 2026");
    }

    // 4. Edit Alquiler in August 2026 to be 330.000
    await page.locator('button:has-text("Editar")').first().click();
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder="0.00"]').fill('330000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Edited Alquiler to 330.000 in August 2026");

    // Open sheet in August 2026 again to verify it is 330.000
    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    sheetText = await page.locator('div.category-sheet').innerText();
    console.log(`August 2026 sheet text (after edit): ${sheetText.replace(/\n/g, ' ')}`);
    if (!sheetText.includes('330.000')) {
      throw new Error("Expected Alquiler to be updated to 330.000 in August 2026");
    }
    await page.locator('div.category-sheet button').first().click();
    await page.waitForTimeout(500);

    // 5. Switch month back to July 2026 and verify amount is still 300.000 (historical protection!)
    await page.locator('input[type="month"]').fill('2026-07');
    await page.waitForTimeout(1000);
    console.log("Switched back to July 2026");

    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    sheetText = await page.locator('div.category-sheet').innerText();
    console.log(`July 2026 sheet text (historical check): ${sheetText.replace(/\n/g, ' ')}`);
    if (!sheetText.includes('300.000') || sheetText.includes('330.000')) {
      throw new Error("Expected July 2026 Alquiler to remain strictly at 300.000, not 330.000");
    }
    await page.locator('div.category-sheet button').first().click();
    await page.waitForTimeout(500);

    // 6. Switch month to September 2026 and verify amount is 330.000 (future continuation of latest update)
    await page.locator('input[type="month"]').fill('2026-09');
    await page.waitForTimeout(1000);
    console.log("Switched to September 2026");

    await page.locator('span:has-text("Esenciales (50%)")').first().click();
    await page.waitForTimeout(1000);
    sheetText = await page.locator('div.category-sheet').innerText();
    console.log(`September 2026 sheet text: ${sheetText.replace(/\n/g, ' ')}`);
    if (!sheetText.includes('330.000')) {
      throw new Error("Expected September 2026 Alquiler to carry forward 330.000");
    }
    console.log("✅ Decoupled subscriptions history verification passed successfully!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-decoupled.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
