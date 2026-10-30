import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const data = await page.evaluate(() => {
    const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const spriteWrapper = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
    const spriteEl = document.querySelector('[data-landmark-stage="true"] img, [data-landmark-stage="true"] canvas, [data-landmark-stage="true"] [data-sprite]')?.getBoundingClientRect();
    const main = document.querySelector('main');
    const mainClasses = main ? main.className : '';
    const hasJustifyCenter = mainClasses.includes('justify-center');

    return {
      dialogTop: dialog ? round(dialog.top) : null,
      dialogBottom: dialog ? round(dialog.bottom) : null,
      stageTop: stage ? round(stage.top) : null,
      stageBottom: stage ? round(stage.bottom) : null,
      spriteWrapperBottom: spriteWrapper ? round(spriteWrapper.bottom) : null,
      spriteBottom: spriteEl ? round(spriteEl.bottom) : null,
      hasJustifyCenter,
      mainClasses,
    };
  });

  console.log('Mascot & Stage Metrics at 1920x1080:');
  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}

run().catch(console.error);
