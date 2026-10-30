import puppeteer from 'puppeteer-core';

const RESIZE_SEQUENCE = [
  { name: '1920x1080', width: 1920, height: 1080, expectedMode: 'desktop_standard' },
  { name: '1366x625', width: 1366, height: 625, expectedMode: 'desktop_compact' },
  { name: '911x450', width: 911, height: 450, expectedMode: 'mobile_vertical' },
  { name: '1280x720', width: 1280, height: 720, expectedMode: 'desktop_standard' },
];

async function testRapidResize() {
  const browser = await puppeteer.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  // Start at initial viewport
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));

  const steps = [];

  for (const step of RESIZE_SEQUENCE) {
    // Perform rapid resize
    await page.setViewport({ width: step.width, height: step.height, deviceScaleFactor: 1 });
    // Minimal wait (150ms) to simulate real-time browser resize event
    await new Promise((r) => setTimeout(r, 200));

    const state = await page.evaluate((stepInfo) => {
      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;

      const desktopNav = document.querySelector('nav[aria-label="Peta Dunia Overworld"]');
      const mobileDock = document.querySelector('nav[aria-label="Peta Navigasi Mobile"]');

      const canvas = document.querySelector('canvas');
      const hasObjectCover = canvas ? canvas.classList.contains('object-cover') : null;

      const main = document.querySelector('main');
      const mainStyle = main ? main.getAttribute('style') : '';

      // Determine DOM Mode
      let domMode = 'unknown';
      if (mobileDock && !desktopNav) {
        domMode = 'mobile_vertical';
      } else if (desktopNav && hr && hr.height <= 96) {
        domMode = 'desktop_compact';
      } else if (desktopNav && hr && hr.height > 96) {
        domMode = 'desktop_standard';
      }

      // Determine Canvas Mode
      let canvasMode = 'unknown';
      if (hasObjectCover && canvas.width === 360 && canvas.height === 200) {
        canvasMode = 'mobile_vertical';
      } else if (!hasObjectCover && canvas.height === 200) {
        canvasMode = 'desktop';
      }

      const isSynchronized =
        (domMode === 'mobile_vertical' && canvasMode === 'mobile_vertical') ||
        (domMode.startsWith('desktop') && canvasMode === 'desktop');

      return {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        dom: {
          mode: domMode,
          headerHeight: hr ? Math.round(hr.height * 100) / 100 : null,
          hasMobileDock: !!mobileDock,
          hasDesktopNav: !!desktopNav,
        },
        canvas: {
          mode: canvasMode,
          width: canvas ? canvas.width : null,
          height: canvas ? canvas.height : null,
          hasObjectCover,
        },
        isSynchronized,
      };
    }, step);

    steps.push({
      step: step.name,
      expected: step.expectedMode,
      ...state,
    });
  }

  await browser.close();
  console.log(JSON.stringify(steps, null, 2));
}

testRapidResize().catch(console.error);
