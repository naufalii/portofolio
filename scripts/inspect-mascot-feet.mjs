import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 625, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const info = await page.evaluate(() => {
    const stage = document.querySelector('[data-landmark-stage]');
    const motionDiv = stage.children[0];
    const badge = motionDiv.children[0];
    const spriteWrapper = motionDiv.children[1];
    const spriteDiv = spriteWrapper.children[0];
    const svg = spriteDiv.querySelector('svg');

    const getR = (el) => {
      const r = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        cls: el.className,
        top: r.top,
        bottom: r.bottom,
        height: r.height,
        marginTop: cs.marginTop,
        marginBottom: cs.marginBottom,
        paddingTop: cs.paddingTop,
        paddingBottom: cs.paddingBottom,
      };
    };

    return {
      stage: getR(stage),
      motionDiv: getR(motionDiv),
      badge: getR(badge),
      spriteWrapper: getR(spriteWrapper),
      spriteDiv: getR(spriteDiv),
      svg: getR(svg),
    };
  });

  console.log('Stage to SVG hierarchy:', info);
  await browser.close();
}

run().catch(console.error);
