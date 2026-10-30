import puppeteer from 'puppeteer-core';

async function setPhase(page, targetName) {
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) =>
        b.textContent.includes('▼') ||
        (b.getAttribute('aria-label') &&
          b.getAttribute('aria-label').includes('waktu'))
    );
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 200));

  await page.evaluate((name) => {
    const opts = Array.from(
      document.querySelectorAll('button, [role="menuitem"]')
    );
    const target = opts.find((o) =>
      o.textContent.toLowerCase().includes(name.toLowerCase())
    );
    if (target) target.click();
  }, targetName);
  await new Promise((r) => setTimeout(r, 400));
}

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 500));

  // Measure metrics
  const metrics = await page.evaluate(() => {
    const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
    const header = document.querySelector('header')?.getBoundingClientRect();
    const stage = document.querySelector('[data-landmark-stage="true"]')?.getBoundingClientRect();
    const spriteWrapper = document.querySelector('[data-landmark-stage="true"] .pointer-events-auto')?.getBoundingClientRect();
    const dialog = document.querySelector('[role="region"]')?.getBoundingClientRect();
    const skills = document.querySelector('[data-landmark-btn="skills"]')?.getBoundingClientRect();

    return {
      headerBottom: header ? round(header.bottom) : null,
      stageTop: stage ? round(stage.top) : null,
      stageBottom: stage ? round(stage.bottom) : null,
      spriteBottom: spriteWrapper ? round(spriteWrapper.bottom) : null,
      dialogTop: dialog ? round(dialog.top) : null,
      dialogBottom: dialog ? round(dialog.bottom) : null,
      skillsTop: skills ? round(skills.top) : null,
      skillsBottom: skills ? round(skills.bottom) : null,
    };
  });

  console.log('Approach (b) Metrics at 1920x1080:');
  console.log(JSON.stringify(metrics, null, 2));

  // Set Day
  await setPhase(page, 'siang');
  await page.screenshot({ path: 'docs/master/proto-shift/1920x1080-approach-b-day.png' });
  console.log('Saved 1920x1080-approach-b-day.png');

  // Set Night
  await setPhase(page, 'malam');
  await page.screenshot({ path: 'docs/master/proto-shift/1920x1080-approach-b-night.png' });
  console.log('Saved 1920x1080-approach-b-night.png');

  await browser.close();
}

run().catch(console.error);
