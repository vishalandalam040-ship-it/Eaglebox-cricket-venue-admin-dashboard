const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR EXCEPTION:', err.message);
  });

  try {
    await page.goto('http://localhost:4173/Eaglebox-cricket-venue-admin-dashboard/#/customers', {waitUntil: 'networkidle0', timeout: 5000});
    console.log("Page loaded successfully.");
  } catch (e) {
    console.log("Error loading page:", e.message);
  }

  await browser.close();
})();
