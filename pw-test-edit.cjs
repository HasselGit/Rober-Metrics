const { chromium } = require('playwright');

(async () => {
  console.log("Starting edit verification test...");
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

    // 1. Create a variable expense (Luz)
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Boleta de Luz');
    await page.locator('input[placeholder="0.00"]').fill('15000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Created Luz expense");

    // 2. Go to Historial tab
    await page.locator('text=Historial').click();
    await page.waitForTimeout(1000);

    // 3. Edit Luz expense
    // Find the row for Boleta de Luz and click Edit
    const luzRow = page.locator('div.glass-panel:has-text("Boleta de Luz")');
    await luzRow.locator('button:has-text("Editar")').click();
    await page.waitForTimeout(500);

    // Update Luz amount to 18000
    await page.locator('input[placeholder="0.00"]').fill('18000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Edited Luz expense amount to 18000");

    // Verify it updated in variables list
    const updatedLuzText = await page.locator('div.glass-panel:has-text("Boleta de Luz")').innerText();
    console.log(`Updated Luz row: ${updatedLuzText}`);
    if (!updatedLuzText.includes('18.000')) {
      throw new Error("Luz expense failed to update value to 18.000");
    }
    console.log("✅ Variable expense editing works perfectly!");

    // 4. Create a Fixed Expense (Alquiler) from central form
    await page.locator('text=Inicio').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button.fab').click();
    await page.waitForTimeout(500);
    await page.locator('select').first().selectOption('subscription');
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Ej. Supermercado"]').fill('Alquiler depto');
    await page.locator('input[placeholder="0.00"]').fill('200000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Created Alquiler subscription");

    // 5. Go to Historial tab -> Fijos
    await page.locator('text=Historial').click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Fijos")').click();
    await page.waitForTimeout(1000);

    // 6. Edit Alquiler subscription
    const alquilerRow = page.locator('div.glass-panel:has-text("Alquiler depto")');
    await alquilerRow.locator('button:has-text("Editar")').click();
    await page.waitForTimeout(500);

    // Update Alquiler amount to 250000
    await page.locator('input[placeholder="0.00"]').fill('250000');
    await page.locator('button:has-text("Guardar")').click();
    await page.waitForTimeout(1000);
    console.log("Edited Alquiler subscription amount to 250000");

    // Verify it updated in fijos list
    const updatedAlquilerText = await page.locator('div.glass-panel:has-text("Alquiler depto")').innerText();
    console.log(`Updated Alquiler row: ${updatedAlquilerText}`);
    if (!updatedAlquilerText.includes('250.000')) {
      throw new Error("Alquiler subscription failed to update value to 250.000");
    }
    console.log("✅ Fixed expense (subscription) editing works perfectly!");

  } catch (err) {
    console.error("❌ Test failed:", err);
    await page.screenshot({ path: 'screenshot-failure-edit.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();
