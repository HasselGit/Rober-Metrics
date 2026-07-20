const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  // Test local dist instead of vercel
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 10000 }).catch(e => {
    console.log("Could not reach preview server:", e.message.substring(0, 100));
  });
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML).catch(() => "could not get root");
  console.log("ROOT HTML LENGTH:", rootHtml.length);
  if (rootHtml.length < 100) {
    console.log("ROOT HTML:", rootHtml);
  } else {
    console.log("ROOT HTML (first 200):", rootHtml.substring(0, 200));
  }

  await browser.close();
})();
