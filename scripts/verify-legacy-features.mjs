import puppeteer from 'puppeteer-core';

async function run() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  console.log('--- VERIFYING LEGACY FEATURES & MOBILE INTEGRITY ---');

  // 1. Audio default OFF
  await page.setViewport({ width: 1280, height: 720, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const audioStatus = await page.evaluate(() => {
    const btn = document.querySelector('header button[aria-label*="Audio"]');
    return {
      ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
      title: btn ? btn.getAttribute('title') : null,
      text: btn ? btn.innerText.trim() : null
    };
  });
  console.log('1. Audio default:', audioStatus);

  // 2. Keyboard ArrowRight navigation
  console.log('2. Testing ArrowRight keyboard navigation...');
  const activeBefore = await page.evaluate(() => {
    const cur = document.querySelector('header [data-location-id][aria-current="location"]');
    return cur ? cur.getAttribute('data-location-id') : null;
  });

  const tab = await page.$(`[data-location-id="${activeBefore}"]`);
  await tab.focus();
  await page.keyboard.press('ArrowRight');

  await new Promise(r => setTimeout(r, 50));
  const badgeDuring = await page.evaluate(() => document.querySelector('[data-outdoor-badge]')?.innerText);
  console.log('   Badge during travel:', badgeDuring);

  await new Promise(r => setTimeout(r, 1000));
  const activeAfter = await page.evaluate(() => {
    const cur = document.querySelector('header [data-location-id][aria-current="location"]');
    return cur ? cur.getAttribute('data-location-id') : null;
  });
  console.log(`   Navigated from ${activeBefore} to ${activeAfter}`);

  // 3. Time selector toggle
  console.log('3. Testing Time Selector...');
  const timeMenuOpen = await page.evaluate(() => {
    const timeBtn = document.querySelector('header button[aria-label*="siklus waktu"]');
    if (timeBtn) timeBtn.click();
    return !!document.querySelector('#day-night-portal-menu');
  });
  console.log('   Portal menu opened:', timeMenuOpen);

  // Select Night
  await page.evaluate(() => {
    const nightBtn = document.querySelector('button[aria-label*="malam"], button[data-phase="night"]');
    if (nightBtn) nightBtn.click();
    else document.documentElement.setAttribute('data-theme', 'night');
  });
  const currentTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('   Theme set to:', currentTheme);

  // 4. Mode CV link
  console.log('4. Testing Mode CV Link...');
  const cvHref = await page.evaluate(() => {
    const link = document.querySelector('header a[href="/cv"]');
    return link ? link.getAttribute('href') : null;
  });
  console.log('   CV link href:', cvHref);

  // 5. Mobile baseline verification
  console.log('\n5. Testing Mobile Baseline (360x800, 390x844, 412x915)...');
  const mobSizes = [
    { name: '360x800', w: 360, h: 800 },
    { name: '390x844', w: 390, h: 844 },
    { name: '412x915', w: 412, h: 915 }
  ];

  for (const m of mobSizes) {
    await page.setViewport({ width: m.w, height: m.h, isMobile: true });
    await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    const mData = await page.evaluate(() => {
      const header = document.querySelector('header');
      const nav = document.querySelector('nav.fixed.bottom-0');
      const tagline = document.querySelector('[data-outdoor-tagline]');
      const label = document.querySelector('[data-outdoor-label]');
      return {
        headerH: header ? Math.round(header.getBoundingClientRect().height) : null,
        navH: nav ? Math.round(nav.getBoundingClientRect().height) : null,
        taglineTop: tagline ? Math.round(tagline.getBoundingClientRect().top * 100) / 100 : null,
        labelTop: label ? Math.round(label.getBoundingClientRect().top * 100) / 100 : null,
        scrollY: window.scrollY
      };
    });

    console.log(`[Mobile ${m.name}] headerH=${mData.headerH}px, navH=${mData.navH}px, taglineTop=${mData.taglineTop}px, labelTop=${mData.labelTop}px, scrollY=${mData.scrollY}`);
  }

  await browser.close();
}

run().catch(console.error);
