import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data = await page.evaluate(() => {
    const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const spriteWrapper = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
    const spriteImg = document.querySelector('[data-landmark-stage="true"] canvas, [data-landmark-stage="true"] img, [data-landmark-stage="true"] [data-sprite]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const main = document.querySelector('main')?.getBoundingClientRect();

    const landmarks = {};
    document.querySelectorAll('[data-landmark-btn]').forEach((btn) => {
      const id = btn.getAttribute('data-landmark-btn');
      const r = btn.getBoundingClientRect();
      landmarks[id] = {
        top: round(r.top),
        bottom: round(r.bottom),
        height: round(r.height),
      };
    });

    return {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      header: header ? { top: round(header.top), bottom: round(header.bottom), height: round(header.height) } : null,
      stage: stage ? { top: round(stage.top), bottom: round(stage.bottom), height: round(stage.height) } : null,
      spriteWrapper: spriteWrapper ? { top: round(spriteWrapper.top), bottom: round(spriteWrapper.bottom), height: round(spriteWrapper.height) } : null,
      spriteImg: spriteImg ? { top: round(spriteImg.top), bottom: round(spriteImg.bottom), height: round(spriteImg.height) } : null,
      dialog: dialog ? { top: round(dialog.top), bottom: round(dialog.bottom), height: round(dialog.height) } : null,
      main: main ? { top: round(main.top), bottom: round(main.bottom), height: round(main.height) } : null,
      landmarks,
    };
  });

  console.log('1280x720 Baseline DOM:');
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}

run().catch(console.error);
