const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E Live CurrencyInput Formatting Verification Test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  page.on('pageerror', error => console.log('BROWSER CRASH:', error.stack || error.message));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Open transaction form
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Gasto Recurrente")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);

    // Fill description and type 35000 into CurrencyInput placeholder="$ 0,0"
    await page.locator('input[placeholder="Ej. Netflix"]').fill('Luz');
    
    const amountInput = page.locator('input[placeholder="$ 0,0"]');
    await amountInput.fill('35000');
    await page.waitForTimeout(300);

    const formattedValue = await amountInput.inputValue();
    console.log(`Input value after typing '35000': "${formattedValue}"`);

    if (!formattedValue.includes('35.000') || !formattedValue.includes(',0')) {
      throw new Error(`Expected input field to format live as $ 35.000,0, got: "${formattedValue}"`);
    }

    console.log("✅ CurrencyInput live formatting verified successfully!");

    // Save transaction
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // Verify stored item in database
    const dbState = await page.evaluate(() => localStorage.getItem('neo_fintech_data'));
    if (!dbState.includes('35000')) {
      throw new Error(`Expected database to store parsed numeric value 35000, got: ${dbState}`);
    }

    console.log("✅ Parsed numeric value 35000 persisted cleanly in database!");
    console.log("🎉 ALL CURRENCY INPUT TESTS PASSED!");

  } catch (err) {
    console.error("❌ E2E Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-currency-input.png', fullPage: true });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
