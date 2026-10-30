import puppeteer from 'puppeteer-core';
import fs from 'fs';

async function generateMockup(width, height, filename) {
  const browser = await puppeteer.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile: false });
  await page.goto('http://localhost:4173/#hero', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Overlay non-interactive decorative props onto the page via an overlay canvas
  await page.evaluate(({ w, h }) => {
    const groundY = Math.round(0.47 * h);
    const S = h / 200;

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = w;
    overlayCanvas.height = h;
    overlayCanvas.style.position = 'fixed';
    overlayCanvas.style.inset = '0';
    overlayCanvas.style.pointerEvents = 'none';
    overlayCanvas.style.zIndex = '15';
    document.body.appendChild(overlayCanvas);

    const ctx = overlayCanvas.getContext('2d');

    // Nav center bounds
    const nav = document.querySelector('header nav');
    const nr = nav ? nav.getBoundingClientRect() : { left: (w - 1024)/2, right: (w + 1024)/2 };

    const leftBoundary = nr.left - 40;
    const rightBoundary = nr.right + 40;

    function drawPixelShrub(cx, cy, scale) {
      ctx.save();
      ctx.fillStyle = '#24160B';
      // Shadow
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2 * scale, 12 * scale, 4 * scale, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(36, 22, 11, 0.35)';
      ctx.fill();

      // Foliage layers (moss tones: #3B5E34, #5E8B4A, #7AA763)
      ctx.fillStyle = '#3B5E34';
      ctx.fillRect(cx - 10 * scale, cy - 12 * scale, 20 * scale, 12 * scale);
      ctx.fillStyle = '#5E8B4A';
      ctx.fillRect(cx - 8 * scale, cy - 15 * scale, 16 * scale, 12 * scale);
      ctx.fillStyle = '#7AA763';
      ctx.fillRect(cx - 5 * scale, cy - 14 * scale, 10 * scale, 6 * scale);

      // Flowers (sunset #E8793A, cream #FFFDF8)
      ctx.fillStyle = '#E8793A';
      ctx.fillRect(cx - 4 * scale, cy - 8 * scale, 2 * scale, 2 * scale);
      ctx.fillRect(cx + 3 * scale, cy - 10 * scale, 2 * scale, 2 * scale);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(cx + 1 * scale, cy - 6 * scale, 2 * scale, 2 * scale);
      ctx.restore();
    }

    function drawPixelFence(startX, endX, cy, scale) {
      ctx.save();
      ctx.fillStyle = '#3A2213';
      // Rails
      ctx.fillRect(startX, cy - 10 * scale, endX - startX, 2 * scale);
      ctx.fillRect(startX, cy - 5 * scale, endX - startX, 2 * scale);
      // Posts
      for (let x = startX; x <= endX; x += 22 * scale) {
        ctx.fillStyle = '#24160B';
        ctx.fillRect(x, cy - 14 * scale, 3 * scale, 14 * scale);
        ctx.fillStyle = '#754E30';
        ctx.fillRect(x + scale, cy - 13 * scale, scale, 12 * scale);
      }
      ctx.restore();
    }

    function drawPixelLantern(cx, cy, scale) {
      ctx.save();
      // Post
      ctx.fillStyle = '#24160B';
      ctx.fillRect(cx - scale, cy - 20 * scale, 2 * scale, 20 * scale);
      // Lantern housing
      ctx.fillStyle = '#3A2213';
      ctx.fillRect(cx - 3 * scale, cy - 24 * scale, 6 * scale, 6 * scale);
      // Glow
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(cx - 2 * scale, cy - 23 * scale, 4 * scale, 4 * scale);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(cx - scale, cy - 22 * scale, 2 * scale, 2 * scale);
      ctx.restore();
    }

    function drawSmallTree(cx, cy, scale) {
      ctx.save();
      // Trunk
      ctx.fillStyle = '#3A2213';
      ctx.fillRect(cx - 2 * scale, cy - 24 * scale, 4 * scale, 24 * scale);
      // Leaves (round pine / shrub)
      ctx.fillStyle = '#3B5E34';
      ctx.fillRect(cx - 12 * scale, cy - 36 * scale, 24 * scale, 16 * scale);
      ctx.fillStyle = '#5E8B4A';
      ctx.fillRect(cx - 10 * scale, cy - 44 * scale, 20 * scale, 14 * scale);
      ctx.fillStyle = '#7AA763';
      ctx.fillRect(cx - 6 * scale, cy - 48 * scale, 12 * scale, 10 * scale);
      ctx.restore();
    }

    // Left Wing Props
    if (leftBoundary > 100) {
      drawPixelFence(40, leftBoundary - 60, groundY, S * 0.85);
      drawSmallTree(80, groundY, S * 0.85);
      drawPixelShrub(160, groundY, S * 0.85);
      drawPixelLantern(240, groundY, S * 0.85);
      drawSmallTree(leftBoundary - 100, groundY, S * 0.85);
      drawPixelShrub(leftBoundary - 40, groundY, S * 0.85);
    }

    // Right Wing Props
    if (w - rightBoundary > 100) {
      drawPixelFence(rightBoundary + 60, w - 40, groundY, S * 0.85);
      drawPixelShrub(rightBoundary + 40, groundY, S * 0.85);
      drawSmallTree(rightBoundary + 120, groundY, S * 0.85);
      drawPixelLantern(rightBoundary + 220, groundY, S * 0.85);
      drawSmallTree(w - 100, groundY, S * 0.85);
      drawPixelShrub(w - 180, groundY, S * 0.85);
    }

    // Add proposal watermark
    ctx.fillStyle = 'rgba(246, 235, 211, 0.95)';
    ctx.fillRect(20, h - 50, 480, 36);
    ctx.strokeStyle = '#24160B';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, h - 50, 480, 36);
    ctx.fillStyle = '#24160B';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('PROPOSAL MAKET M5: Pengisian Sisi Dunia (Hanya Usulan - Tanpa Kode)', 30, h - 27);
  }, { w: width, h: height });

  await page.screenshot({ path: filename });
  console.log(`Mockup saved: ${filename}`);
  await browser.close();
}

async function run() {
  await generateMockup(1909, 991, 'docs/fixlaptop/after/m5_proposal_1909x991.png');
  await generateMockup(2560, 1080, 'docs/fixlaptop/after/m5_proposal_2560x1080.png');
}

run().catch(console.error);
