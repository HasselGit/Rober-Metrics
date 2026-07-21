const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E 2-Step Form Wizard and Card-Linked Subscriptions verification test...");
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

    // 0. Create card "Visa"
    console.log("Step 0: Creating card 'Visa'...");
    await page.locator('span:has-text("Tarjetas")').click();
    await page.waitForTimeout(1000);
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Visa Galicia, Amex"]').fill('Visa');
    await page.locator('input[placeholder="0.00"]').fill('500000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Card 'Visa' created successfully.");

    // Go back to Inicio
    await page.locator('span:has-text("Inicio")').click();
    await page.waitForTimeout(1000);

    // 1. Create a card-linked subscription (YouTube Premium on credit card Visa)
    console.log("Step 1: Adding linked subscription...");
    await page.locator('button.fab').click();
    await page.waitForTimeout(800);

    // Step 1: select Gasto Recurrente
    await page.locator('button:has-text("Gasto Recurrente")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);

    // Step 2: fill fields
    await page.locator('select').first().selectOption('credit_card');
    await page.locator('input[placeholder="Ej. Netflix"]').fill('YouTube Premium');
    await page.locator('input[placeholder="0.00"]').fill('5000');
    // Select No Esenciales category
    await page.locator('select').nth(2).selectOption('no-esenciales');

    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Saved YouTube Premium as card-linked subscription");

    // 2. Create a card purchase in installments (Zapatillas on Visa)
    console.log("Step 2: Adding credit card purchase (Zapatillas)...");
    await page.locator('button.fab').click();
    await page.waitForTimeout(800);

    // Step 1: select Gasto Único
    await page.locator('button:has-text("Gasto Único")').click();
    await page.locator('button:has-text("Continuar")').click();
    await page.waitForTimeout(500);

    // Step 2: fill fields
    await page.locator('select').first().selectOption('credit_card');
    await page.locator('select').nth(2).selectOption('3'); // 3 cuotas
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Zapatillas');
    await page.locator('input[placeholder="0.00"]').fill('30000');
    await page.locator('select').nth(3).selectOption('no-esenciales'); // category No Esenciales

    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Saved Zapatillas card purchase");

    // 3. Verify unified Historial common list
    console.log("Step 3: Checking unified Historial tab...");
    await page.locator('span:has-text("Historial")').click();
    await page.waitForTimeout(1000);

    const dbState = await page.evaluate(() => localStorage.getItem('neo_fintech_data'));
    console.log("Database state after save:", dbState);

    const historyText = await page.locator('body').innerText();
    console.log("Historial tab text content:", historyText);

    if (!historyText.includes('Zapatillas')) {
      throw new Error("Zapatillas should show up in the common Historial list");
    }
    if (!historyText.toLowerCase().includes('tarjeta · visa · 3 cuotas de')) {
      throw new Error("Zapatillas card info label should show installments split details");
    }
    console.log("Zapatillas is correctly displayed in unified Historial");

    // 4. Verify Subscriptions history view
    await page.locator('button:has-text("Fijos / Suscripciones")').click();
    await page.waitForTimeout(800);
    const subHistoryText = await page.locator('body').innerText();
    if (!subHistoryText.includes('YouTube Premium')) {
      throw new Error("YouTube Premium should show up in Subscriptions tab");
    }
    console.log("YouTube Premium is correctly displayed in Subscriptions tab");

    // 5. Verify Credit Card Manager displays "Pago este mes" summing both Zapatillas + YouTube Premium
    console.log("Step 5: Verifying Credit Cards tab...");
    await page.locator('span:has-text("Tarjetas")').click();
    await page.waitForTimeout(1000);

    const cardsText = await page.locator('body').innerText();
    // 10.000 installment + 5.000 subscription = 15.000 ARS Visa billing this month
    if (!cardsText.includes('15.000')) {
      throw new Error(`Expected Visa 'A pagar este mes' to be $ 15.000, current dashboard text: ${cardsText}`);
    }
    console.log("CreditCardManager shows correct billing estimation: $15.000");

    // 6. Inspect card details and check lists
    console.log("Step 6: Inspecting Visa Detail View...");
    await page.locator('span:has-text("Visa")').first().click();
    await page.waitForTimeout(1000);

    const detailText = await page.locator('body').innerText();
    if (!detailText.includes('15.000')) {
      throw new Error(`Expected Visa Detail billing to be $ 15.000, got: ${detailText}`);
    }
    if (!detailText.includes('YouTube Premium') || !detailText.includes('Gasto Fijo Recurrente')) {
      throw new Error("Visa detail view should list linked recurring subscription with description and badge");
    }
    if (!detailText.includes('Zapatillas') || !detailText.includes('Cuota 1 de 3')) {
      throw new Error("Visa detail view should list Zapatillas installment with current/total installments progress");
    }
    console.log("Visa Detail lists both regular cuotas and linked fijos successfully!");

    console.log("✅ All tests passed successfully!");

  } catch (err) {
    console.error("❌ E2E Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-wizard-cc.png', fullPage: true });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
