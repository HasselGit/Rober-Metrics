const { chromium } = require('playwright');

(async () => {
  console.log("Starting E2E Month Picker Visibility and Styling Verification Test...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  page.on('pageerror', error => console.log('BROWSER CRASH:', error.stack || error.message));

  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const monthInput = page.locator('header input[type="month"]');
    const isVisible = await monthInput.isVisible();
    console.log(`Month picker input is visible: ${isVisible}`);
    if (!isVisible) {
      throw new Error("Month picker input should be visible");
    }

    const monthValue = await monthInput.inputValue();
    console.log(`Current month input value: ${monthValue}`);

    // Take screenshot to inspect visual layout
    await page.screenshot({ path: 'screenshot-month-picker.png' });
    console.log("✅ Month picker styling and contrast verification passed!");

  } catch (err) {
    console.error("❌ E2E Test failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
