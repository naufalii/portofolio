import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 625, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const breakdown = await page.evaluate(() => {
    const header = document.querySelector('header');
    const row1 = header.children[0];
    const row2 = header.children[1];
    const hr = header.getBoundingClientRect();
    const r1 = row1.getBoundingClientRect();
    const r2 = row2.getBoundingClientRect();
    const cs = window.getComputedStyle(header);
    return {
      headerTotal: hr.height,
      paddingTop: cs.paddingTop,
      paddingBottom: cs.paddingBottom,
      rowGap: cs.rowGap,
      row1Height: r1.height,
      row2Height: r2.height,
    };
  });

  console.log('Compact Header Breakdown:', breakdown);
  await browser.close();
}

run().catch(console.error);
