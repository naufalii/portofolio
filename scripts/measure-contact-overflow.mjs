import puppeteer from 'puppeteer-core';

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const viewports = [
    { w: 1255, h: 589 },
    { w: 1366, h: 625 },
    { w: 1280, h: 590 },
    { w: 1024, h: 480 },
    { w: 1366, h: 768 },
    { w: 1536, h: 730 },
    { w: 1680, h: 1050 },
    { w: 2560, h: 1440 },
    { w: 1280, h: 699 },
    { w: 1280, h: 700 },
    { w: 1920, h: 1080 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });
    await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 200));

    const data = await page.evaluate(() => {
      const panel = document.getElementById('active-section-contact');
      if (!panel) return { err: 'no panel' };

      const overflow = panel.scrollHeight - panel.clientHeight;
      const submitBtn = panel.querySelector('button[type="submit"]');
      const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;
      const windowH = window.innerHeight;

      return {
        scrollHeight: Math.round(panel.scrollHeight),
        clientHeight: Math.round(panel.clientHeight),
        overflow: Math.round(overflow),
        submitTop: submitRect ? Math.round(submitRect.top) : null,
        submitBottom: submitRect ? Math.round(submitRect.bottom) : null,
        windowH,
        submitVisible: submitRect ? submitRect.bottom <= windowH : false,
        clearanceBottom: submitRect ? Math.round(windowH - submitRect.bottom) : null,
      };
    });

    console.log(`${vp.w}x${vp.h}:`, JSON.stringify(data));
  }

  await browser.close();
}

test().catch(console.error);
