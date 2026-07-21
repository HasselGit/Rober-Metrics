const { chromium } = require('playwright');

(async () => {
  console.log("Starting test script...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set window size
  await page.setViewportSize({ width: 390, height: 844 });
  
  try {
    // Go to local dev server
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    // Clear localStorage to trigger cleaned_mock_v3 reset and reload
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForTimeout(4000);
    console.log("Database reset triggered and page reloaded");

    // 1. Verify initial total income for July 2026 is $1.200.000
    const incomeValue = (await page.locator('text=Ingresos').locator('xpath=..').locator('p:nth-child(3)').innerText()).replace(/\s+/g, ' ');
    console.log(`Initial July Income: ${incomeValue}`);
    if (incomeValue !== '$ 1.200.000') {
      throw new Error(`Expected July income to be $ 1.200.000, got ${incomeValue}`);
    }

    // 2. Select August 2026 in Month Picker
    const monthInput = await page.locator('input[type="month"]');
    await monthInput.fill('2026-08');
    await page.waitForTimeout(1000);
    console.log("Changed month picker to August 2026");

    // Verify August income is $1.200.000 (inherited)
    const augIncome = (await page.locator('text=Ingresos').locator('xpath=..').locator('p:nth-child(3)').innerText()).replace(/\s+/g, ' ');
    console.log(`August inherited income: ${augIncome}`);
    if (augIncome !== '$ 1.200.000') {
      throw new Error(`Expected inherited August income to be $ 1.200.000, got ${augIncome}`);
    }

    // 3. Open IncomeManager (click Ingresos card)
    await page.locator('text=Ingresos').locator('xpath=..').click();
    await page.waitForTimeout(1000);
    console.log("Opened Income Manager");

    // Edit Sueldo to 1.500.000
    const sueldoRow = page.locator('div.glass-card:has-text("Sueldo")').first();
    await sueldoRow.click();
    await page.waitForTimeout(500);
    
    await page.locator('input[placeholder="0"]').fill('1500000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Sueldo edited to 1.500.000");

    // Return to dashboard
    await page.locator('button:has-text("Volver")').click();
    await page.waitForTimeout(1000);
    console.log("Returned to dashboard");

    // Verify August income is now $1.700.000 (Sueldo 1.5M + Sobresueldo 100k + Velasco 100k)
    const augNewIncome = (await page.locator('text=Ingresos').locator('xpath=..').locator('p:nth-child(3)').innerText()).replace(/\s+/g, ' ');
    console.log(`August new income: ${augNewIncome}`);
    if (augNewIncome !== '$ 1.700.000') {
      throw new Error(`Expected August income to be $ 1.700.000, got ${augNewIncome}`);
    }

    // 4. Go back to July 2026
    await monthInput.fill('2026-07');
    await page.waitForTimeout(1000);
    console.log("Changed month picker back to July 2026");

    // Verify July income is still $1.200.000 (decoupled!)
    const julyIncomeDecoupled = (await page.locator('text=Ingresos').locator('xpath=..').locator('p:nth-child(3)').innerText()).replace(/\s+/g, ' ');
    console.log(`July decoupled income: ${julyIncomeDecoupled}`);
    if (julyIncomeDecoupled !== '$ 1.200.000') {
      throw new Error(`Expected July income to remain $ 1.200.000, got ${julyIncomeDecoupled}`);
    }
    console.log("✅ Decoupled Monthly Incomes (Excel Tabs style) tested successfully!");

    // 5. Test Card Creation and Purchase
    // Click on Tarjetas tab
    await page.locator('text=Tarjetas').click();
    await page.waitForTimeout(1000);
    console.log("Navigated to Tarjetas tab");

    // Click FAB to add card
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    
    await page.locator('input[placeholder="Ej. Visa Galicia, Amex"]').fill('Visa Galicia');
    await page.locator('input[placeholder="0.00"]').fill('2000000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Visa Galicia card created successfully");

    // Click on Visa Galicia card detail
    await page.locator('text=Visa Galicia').first().click();
    await page.waitForTimeout(1000);
    console.log("Opened Visa Galicia detail page");

    // Click "Agregar Consumo" button
    await page.locator('button:has-text("Agregar Consumo")').click();
    await page.waitForTimeout(500);
    
    // Fill purchase details
    await page.locator('input[placeholder="Ej. Zapatillas"]').fill('Notebook');
    await page.locator('input[placeholder="0.00"]').fill('600000');
    await page.locator('select').selectOption('3'); // 3 installments
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    console.log("Added Notebook purchase of 600.000 in 3 installments");

    // Go back to Inicio
    await page.locator('text=Inicio').click();
    await page.waitForTimeout(1000);
    console.log("Navigated back to Inicio tab");

    // Verify July expenses (Notebook: $200.000 per month)
    // No Esenciales should have $200.000 spent
    const julyRowText = (await page.locator('div').filter({ hasText: /^No Esenciales \(30%\)/ }).first().innerText()).replace(/\s+/g, ' ');
    console.log(`July No Esenciales Row Text: ${julyRowText}`);
    if (!julyRowText.includes('$ 200.000')) {
      throw new Error(`Expected July No Esenciales to contain $ 200.000, got: ${julyRowText}`);
    }

    // Go to August 2026
    await monthInput.fill('2026-08');
    await page.waitForTimeout(1000);
    const augRowText = (await page.locator('div').filter({ hasText: /^No Esenciales \(30%\)/ }).first().innerText()).replace(/\s+/g, ' ');
    console.log(`August No Esenciales Row Text: ${augRowText}`);
    if (!augRowText.includes('$ 200.000')) {
      throw new Error(`Expected August No Esenciales to contain $ 200.000, got: ${augRowText}`);
    }

    // Go to October 2026 (Month 4 -> should be cleared)
    await monthInput.fill('2026-10');
    await page.waitForTimeout(1000);
    const octRowText = (await page.locator('div').filter({ hasText: /^No Esenciales \(30%\)/ }).first().innerText()).replace(/\s+/g, ' ');
    console.log(`October No Esenciales Row Text: ${octRowText}`);
    if (!octRowText.includes('$ 0')) {
      throw new Error(`Expected October No Esenciales to contain $ 0, got: ${octRowText}`);
    }
    console.log("✅ Credit Card stateless amortization tested successfully!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure.png', fullPage: true });
    console.log("Failure screenshot saved as screenshot-failure.png");
  } finally {
    await browser.close();
    console.log("Test finished.");
  }
})();
