import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 500, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const debug = await page.evaluate(() => {
    const header = document.querySelector('header');
    const hr = header ? header.getBoundingClientRect() : null;
    const main = document.querySelector('main');
    const mr = main ? main.getBoundingClientRect() : null;
    const mainCs = main ? window.getComputedStyle(main) : null;
    const dialog = document.querySelector('[role="region"]');
    const dr = dialog ? dialog.getBoundingClientRect() : null;
    const landmarkBtns = Array.from(document.querySelectorAll('[data-landmark-btn]')).map(b => {
      const r = b.getBoundingClientRect();
      const cx = Math.round(r.left + r.width / 2);
      const cy = Math.round(r.top + r.height / 2);
      const topEl = document.elementsFromPoint(cx, cy)[0];
      return {
        id: b.getAttribute('data-landmark-btn'),
        top: r.top,
        bottom: r.bottom,
        cx,
        cy,
        isMatch: topEl === b,
        topElDesc: topEl ? `<${topEl.tagName.toLowerCase()} class="${(topEl.className||'').toString().slice(0, 40)}">` : null
      };
    });

    return {
      headerH: hr ? hr.height : null,
      headerBottom: hr ? hr.bottom : null,
      mainTop: mr ? mr.top : null,
      mainPaddingTop: mainCs ? mainCs.paddingTop : null,
      dialogTop: dr ? dr.top : null,
      dialogBottom: dr ? dr.bottom : null,
      landmarkBtns
    };
  });

  console.log('Debug 1024x500:', JSON.stringify(debug, null, 2));
  await browser.close();
}

run().catch(console.error);
