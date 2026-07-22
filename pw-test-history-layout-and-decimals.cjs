const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E History Layout Reordering and 1-Decimal Currency Verification Test...");
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

    // 1. Create a card Visa and card purchase Zapatillas
    console.log("Step 1: Creating Card Visa and Zapatillas purchase...");
    await page.locator('span:has-text("Tarjetas")').click();
    await page.waitForTimeout(800);
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Visa Galicia, Amex"]').fill('Visa');
    await page.locator('input[placeholder="0.00"]').fill('500000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    await page.locator('span:has-text("Inicio")').click();
    await page.waitForTimeout(800);

    // Add Zapatillas
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Gasto Único")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);
    await page.locator('select').first().selectOption('credit_card');
    await page.locator('select').nth(2).selectOption('3');
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Zapatillas');
    await page.locator('input[placeholder="0.00"]').fill('30000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // 2. Add Fixed Subscription (Alquiler)
    console.log("Step 2: Adding Fixed Subscription (Alquiler)...");
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Gasto Recurrente")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Netflix"]').fill('Alquiler');
    await page.locator('input[placeholder="0.00"]').fill('300000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);

    // 3. Navigate to Historial view
    console.log("Step 3: Checking Historial Layout...");
    await page.locator('span:has-text("Historial")').click();
    await page.waitForTimeout(1000);

    const fullText = await page.locator('body').innerText();

    // Verify 1 decimal currency formatting exists ($ 30.000,0 or $ 300.000,0)
    console.log("Checking 1-decimal currency formatting...");
    if (!fullText.includes(',0')) {
      throw new Error(`Currency amounts should contain 1 decimal place (e.g. ,0), current page text: ${fullText}`);
    }
    console.log("✅ 1-decimal currency formatting verified!");

    // Verify "Todos" tab shows both Zapatillas and Alquiler
    console.log("Testing 'Todos' tab content...");
    if (!fullText.includes('Zapatillas') || !fullText.includes('Alquiler')) {
      throw new Error("'Todos' tab should list both Zapatillas and Alquiler");
    }
    console.log("✅ 'Todos' tab displays both movement types.");

    // Test 'Gastos Variables' tab filter
    console.log("Testing 'Gastos Variables' tab filter...");
    await page.locator('button:has-text("Gastos Variables")').click();
    await page.waitForTimeout(500);
    const variablesText = await page.locator('body').innerText();
    if (!variablesText.includes('Zapatillas') || variablesText.includes('Alquiler')) {
      throw new Error("'Gastos Variables' tab should show Zapatillas and hide Alquiler");
    }
    console.log("✅ 'Gastos Variables' filter works correctly!");

    // Test 'Fijos / Suscripciones' tab filter
    console.log("Testing 'Fijos / Suscripciones' tab filter...");
    await page.locator('button:has-text("Fijos / Suscripciones")').click();
    await page.waitForTimeout(500);
    const fijosText = await page.locator('body').innerText();
    if (fijosText.includes('Zapatillas') || !fijosText.includes('Alquiler')) {
      throw new Error("'Fijos / Suscripciones' tab should hide Zapatillas and show Alquiler");
    }
    console.log("✅ 'Fijos / Suscripciones' filter works correctly!");

    // Test Search input filtering
    console.log("Testing Search input...");
    await page.locator('button:has-text("Todos")').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Buscar gasto (ej. luz, comida, tarjeta)..."]').fill('Alquiler');
    await page.waitForTimeout(500);
    const searchText = await page.locator('body').innerText();
    if (!searchText.includes('Alquiler') || searchText.includes('Zapatillas')) {
      throw new Error("Search query 'Alquiler' should filter results to show Alquiler only");
    }
    console.log("✅ Search input works correctly!");

    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");

  } catch (err) {
    console.error("❌ E2E Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-history-layout.png', fullPage: true });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
