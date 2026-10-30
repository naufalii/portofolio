import puppeteer from 'puppeteer-core';

const TEST_VIEWPORTS = [
  { name: '1280x720', w: 1280, h: 720 },
  { name: '1536x720', w: 1536, h: 720 },
  { name: '1909x991', w: 1909, h: 991 },
  { name: '1920x1080', w: 1920, h: 1080 },
  { name: '2560x1080', w: 2560, h: 1080 },
  { name: '1024x768', w: 1024, h: 768 },
];

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  console.log('--- VERIFYING FIX B (M2) ---');

  for (const vp of TEST_VIEWPORTS) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: false });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const results = await page.evaluate(() => {
      const landmarkBtns = Array.from(document.querySelectorAll('[data-landmark-btn]'));
      return landmarkBtns.map(btn => {
        const id = btn.getAttribute('data-landmark-btn');
        const rect = btn.getBoundingClientRect();
        const cx = Math.round(rect.left + rect.width / 2);
        const cy = Math.round(rect.top + rect.height / 2);
        const topElement = document.elementsFromPoint(cx, cy)[0];
        const isMatch = topElement === btn;
        return {
          id,
          cx,
          cy,
          topTagName: topElement ? topElement.tagName.toLowerCase() : 'none',
          topDataBtn: topElement ? topElement.getAttribute('data-landmark-btn') : null,
          isMatch
        };
      });
    });

    console.log(`Viewport: ${vp.name}`);
    let allMatch = true;
    for (const r of results) {
      console.log(`  ${r.id} at (${r.cx}, ${r.cy}): topEl=<${r.topTagName} data-landmark-btn="${r.topDataBtn}"> -> match=${r.isMatch}`);
      if (!r.isMatch) allMatch = false;
    }
    console.log(`  Overall: ${allMatch ? 'PASS (All 6 landmarks clickable directly)' : 'FAIL'}`);
  }

  // Real mouse click test on 1280x720
  console.log('\n--- TESTING REAL CLICK INTERACTION ON 1280x720 ---');
  await page.setViewport({ width: 1280, height: 720, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  // Click on 'skills' landmark
  const skillsBtn = await page.$('[data-landmark-btn="skills"]');
  const box = await skillsBtn.boundingBox();
  const clickX = box.x + box.width / 2;
  const clickY = box.y + box.height / 2;

  console.log(`Clicking on skills landmark at (${clickX}, ${clickY})...`);
  await page.mouse.click(clickX, clickY);

  // Check traveling state immediately
  await new Promise(r => setTimeout(r, 50));
  const isTravelingDuring = await page.evaluate(() => {
    const badge = document.querySelector('[data-outdoor-badge]');
    return badge ? badge.innerText : '';
  });
  console.log(`Badge during travel: "${isTravelingDuring}"`);

  // Try clicking guestbook while traveling (should be ignored)
  const gbBtn = await page.$('[data-landmark-btn="guestbook"]');
  const gbBox = await gbBtn.boundingBox();
  await page.mouse.click(gbBox.x + gbBox.width / 2, gbBox.y + gbBox.height / 2);

  // Wait for travel animation to complete (approx 800ms)
  await new Promise(r => setTimeout(r, 1000));

  const finalState = await page.evaluate(() => {
    const activeSection = document.querySelector('[id^="active-section-"]');
    const badge = document.querySelector('[data-outdoor-badge]');
    return {
      activeSectionId: activeSection ? activeSection.id : null,
      badgeText: badge ? badge.innerText : null,
    };
  });
  console.log('Final state after arrival:', finalState);

  await browser.close();
}

run().catch(console.error);
