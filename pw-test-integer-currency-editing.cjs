const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E Integer Currency Format & Backspace Editing Test...");
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

    // Open transaction form
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Gasto Recurrente")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);

    // Fill description and type 35000
    await page.locator('input[placeholder="Ej. Netflix"]').fill('Servicio Luz');
    const amountInput = page.locator('input[placeholder="$ 0"]');
    await amountInput.fill('35000');
    await page.waitForTimeout(300);

    let val1 = await amountInput.inputValue();
    console.log(`Value after typing 35000: "${val1}"`);
    if (!val1.includes('35.000') || val1.includes(',0')) {
      throw new Error(`Expected $ 35.000 (no decimals), got: "${val1}"`);
    }

    // Press Backspace once
    await amountInput.press('Backspace');
    await page.waitForTimeout(300);
    let val2 = await amountInput.inputValue();
    console.log(`Value after 1st Backspace: "${val2}"`);
    if (!val2.includes('3.500')) {
      throw new Error(`Expected $ 3.500 after 1st Backspace, got: "${val2}"`);
    }

    // Press Backspace second time
    await amountInput.press('Backspace');
    await page.waitForTimeout(300);
    let val3 = await amountInput.inputValue();
    console.log(`Value after 2nd Backspace: "${val3}"`);
    if (!val3.includes('350')) {
      throw new Error(`Expected $ 350 after 2nd Backspace, got: "${val3}"`);
    }

    // Save transaction with 350
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // Verify stored item in database
    const dbState = await page.evaluate(() => localStorage.getItem('neo_fintech_data'));
    if (!dbState.includes('350')) {
      throw new Error(`Expected database to store parsed numeric integer 350, got: ${dbState}`);
    }

    console.log("✅ Backspace editing and zero-decimal integer currency formatting verified successfully!");
    console.log("🎉 ALL INTEGER CURRENCY TESTS PASSED!");

  } catch (err) {
    console.error("❌ E2E Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-integer-editing.png', fullPage: true });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
