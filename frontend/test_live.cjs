const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1036, height: 558 });

  page.on('console', msg => console.log(msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR EXCEPTION:', err.message));

  try {
    await page.goto('https://vishalandalam040-ship-it.github.io/Eaglebox-cricket-venue-admin-dashboard/#/customers', {waitUntil: 'networkidle0', timeout: 15000});
    await page.screenshot({ path: 'live_screenshot.png' });
    console.log("Screenshot saved to live_screenshot.png");
  } catch (e) {
    console.log("Error:", e.message);
  }

  await browser.close();
})();
