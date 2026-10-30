import puppeteer from 'puppeteer-core';

async function inspect() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  
  const testSizes = [
    { w: 1255, h: 589 },
    { w: 1366, h: 768 },
    { w: 1280, h: 720 },
    { w: 1024, h: 480 },
  ];

  for (const size of testSizes) {
    await page.setViewport({ width: size.w, height: size.h, isMobile: false });
    await page.goto('http://localhost:4173/#contact', { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 300));

    const breakdown = await page.evaluate(() => {
      const panel = document.getElementById('active-section-contact');
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      const form = panel.querySelector('form');
      const mailbox = panel.querySelector('.lg\\:col-span-4');
      const submitBtn = panel.querySelector('button[type="submit"]');
      const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;

      return {
        panelTop: rect.top,
        panelHeight: rect.height,
        windowH: window.innerHeight,
        formHeight: form ? form.offsetHeight : null,
        mailboxHeight: mailbox ? mailbox.offsetHeight : null,
        submitTop: submitRect ? submitRect.top : null,
        submitBottom: submitRect ? submitRect.bottom : null,
        overflowBelowWindow: submitRect ? Math.round(submitRect.bottom - window.innerHeight) : null,
      };
    });

    console.log(`${size.w}x${size.h}:`, breakdown);
  }

  await browser.close();
}

inspect().catch(console.error);
