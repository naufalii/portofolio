import puppeteer from 'puppeteer-core';

const VIEWPORTS = [
  { name: '360x800', w: 360, h: 800 },
  { name: '390x844', w: 390, h: 844 },
  { name: '412x915', w: 412, h: 915 },
];

async function test() {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.w, height: vp.h, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 400));

    const breakdown = await page.evaluate(() => {
      const round = (n) => (n !== null && n !== undefined ? Math.round(n * 100) / 100 : null);
      const header = document.querySelector('header');
      const main = document.querySelector('main');
      const heroSection = document.querySelector('#section-hero');
      const dialog = document.querySelector('[role="region"]');
      const questsSection = document.querySelector('#section-quests');
      const label = questsSection ? questsSection.querySelector('[data-outdoor-label="true"]') : null;

      // Also get heights of children of heroSection
      const heroChildren = [];
      if (heroSection) {
        for (const child of heroSection.children) {
          const r = child.getBoundingClientRect();
          heroChildren.push({
            tag: child.tagName,
            class: child.className.slice(0, 40),
            top: round(r.top),
            bottom: round(r.bottom),
            height: round(r.height),
          });
        }
      }

      return {
        header: header ? { top: round(header.getBoundingClientRect().top), bottom: round(header.getBoundingClientRect().bottom), height: round(header.getBoundingClientRect().height) } : null,
        main: main ? { top: round(main.getBoundingClientRect().top), bottom: round(main.getBoundingClientRect().bottom), paddingTop: window.getComputedStyle(main).paddingTop } : null,
        heroSection: heroSection ? { top: round(heroSection.getBoundingClientRect().top), bottom: round(heroSection.getBoundingClientRect().bottom), height: round(heroSection.getBoundingClientRect().height) } : null,
        dialog: dialog ? { top: round(dialog.getBoundingClientRect().top), bottom: round(dialog.getBoundingClientRect().bottom), height: round(dialog.getBoundingClientRect().height) } : null,
        questsSection: questsSection ? { top: round(questsSection.getBoundingClientRect().top), bottom: round(questsSection.getBoundingClientRect().bottom) } : null,
        label: label ? { top: round(label.getBoundingClientRect().top), bottom: round(label.getBoundingClientRect().bottom), height: round(label.getBoundingClientRect().height) } : null,
        heroChildren,
      };
    });

    console.log(`=== VIEWPORT ${vp.name} ===`);
    console.log(JSON.stringify(breakdown, null, 2));
  }

  await browser.close();
}

test().catch(console.error);
