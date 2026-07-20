const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
    errors.push(error.message);
  });

  // Test the local dev server  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 }).catch(e => {
    console.log("Could not reach dev server:", e.message.substring(0, 150));
  });
  
  await page.waitForTimeout(2000);
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => "could not get root");
  console.log("ROOT HTML LENGTH:", rootHtml.length);
  if (rootHtml.length < 200) {
    console.log("ROOT HTML:", rootHtml);
  } else {
    console.log("ROOT HTML (first 300):", rootHtml.substring(0, 300));
  }

  await browser.close();
})();
