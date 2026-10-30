import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1255, height: 589, isMobile: false });
  await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 300));

  const items = await page.evaluate(() => {
    const panel = document.getElementById('active-section-contact');
    const all = Array.from(panel.querySelectorAll('*'));
    return all.map((el) => ({
      tag: el.tagName,
      className: el.className?.slice ? el.className.slice(0, 40) : '',
      text: el.innerText ? el.innerText.slice(0, 30).replace(/\n/g, ' ') : '',
      h: el.offsetHeight,
      w: el.offsetWidth,
    })).filter((x) => x.h > 0 && ['DIV', 'P', 'FORM', 'BUTTON', 'INPUT', 'TEXTAREA'].includes(x.tag));
  });

  console.log('DOM items at 1255x589:');
  items.slice(0, 25).forEach((it) => console.log(`${it.tag} (${it.h}px, ${it.w}px): [${it.text}] ${it.className}`));
  await browser.close();
}

test().catch(console.error);
