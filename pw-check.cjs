const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`ERROR: ${msg.text()}`);
    } else {
      console.log(`LOG: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
  });

  await page.goto('https://robermetrics.vercel.app/', { waitUntil: 'networkidle' });
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML);
  console.log("ROOT HTML LENGTH:", rootHtml.length);
  if (rootHtml.length < 50) {
    console.log("ROOT HTML:", rootHtml);
  }

  await browser.close();
})();
