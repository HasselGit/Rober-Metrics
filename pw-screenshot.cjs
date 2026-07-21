const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });

  page.on('pageerror', error => console.log(`ERROR: ${error.message}`));

  await page.goto('https://robermetrics.vercel.app/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'screenshot-dashboard.png', fullPage: false });
  console.log("Dashboard screenshot saved");
  
  // Click on "Esenciales" row to open details sheet
  await page.locator('text=Esenciales').first().click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-details.png', fullPage: false });
  console.log("Details sheet screenshot saved");

  // Click on the top portion of the screen (backdrop) to close the bottom sheet
  await page.mouse.click(200, 50);
  await page.waitForTimeout(600);
  
  // Click on "Tarjetas" navigation tab
  await page.locator('text=Tarjetas').click();

  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'screenshot-cards.png', fullPage: false });
  console.log("Cards sheet screenshot saved");
  
  await browser.close();

})();
