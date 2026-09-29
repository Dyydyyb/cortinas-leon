const puppeteer = require('../node_modules/puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

async function runTest() {
  console.log('Launching browser with Edge...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // Test 1: Capture curtain closed
  console.log('Navigating to http://127.0.0.1:4173/ ...');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  
  // Capture closed curtain during rattling
  await new Promise(r => setTimeout(r, 100));
  await page.screenshot({ path: path.join(screenshotsDir, '01_curtain_closed.png') });
  console.log('Saved 01_curtain_closed.png');

  // Test 2: Capture curtain opening midway
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '02_curtain_opening.png') });
  console.log('Saved 02_curtain_opening.png');

  // Test 3: Wait for curtain to fully open and reveal Hero
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(screenshotsDir, '03_hero.png') });
  console.log('Saved 03_hero.png');

  // Test 4: Scroll to Rubros
  await page.evaluate(() => {
    document.getElementById('rubros').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '04_rubros.png') });
  console.log('Saved 04_rubros.png');

  // Test 5: Click slider next arrow to verify slide transition
  await page.click('#slider-next');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(screenshotsDir, '04b_rubros_slide2.png') });
  console.log('Saved 04b_rubros_slide2.png');

  // Test 6: Scroll to Servicios
  await page.evaluate(() => {
    document.getElementById('servicios').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '05_servicios.png') });
  console.log('Saved 05_servicios.png');

  // Test 7: Scroll to Motores Motic
  await page.evaluate(() => {
    document.getElementById('motic').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '06_motic.png') });
  console.log('Saved 06_motic.png');

  // Test 8: Scroll to Impact section
  await page.evaluate(() => {
    document.getElementById('ventajas').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '07_impact.png') });
  console.log('Saved 07_impact.png');

  // Test 9: Scroll to Galería
  await page.evaluate(() => {
    document.getElementById('galeria').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '08_galeria.png') });
  console.log('Saved 08_galeria.png');

  // Test 10: Scroll to Contacto
  await page.evaluate(() => {
    document.getElementById('contacto').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '09_contacto.png') });
  console.log('Saved 09_contacto.png');

  // Test 11: Scroll to Footer
  await page.evaluate(() => {
    document.querySelector('.site-footer').scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '10_footer.png') });
  console.log('Saved 10_footer.png');

  // Test 12: Mobile viewport test
  console.log('Testing Mobile Viewport...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(screenshotsDir, '11_mobile_hero.png') });
  console.log('Saved 11_mobile_hero.png');

  // Open mobile menu
  await page.click('#mobile-toggle');
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(screenshotsDir, '12_mobile_menu_open.png') });
  console.log('Saved 12_mobile_menu_open.png');

  await browser.close();
  console.log('ALL TESTS & CAPTURES COMPLETED SUCCESSFULLY!');
}

runTest().catch(console.error);
