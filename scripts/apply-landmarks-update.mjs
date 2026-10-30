import fs from 'fs';

let content = fs.readFileSync('src/lib/landmarks.js', 'utf8');

// 1. Add import
if (!content.includes("from './worldLayout'")) {
  content = `import { computeWorldLayout } from './worldLayout';\n` + content;
}

// 2. Update Skill Tree height to 35 (Opsi P1)
content = content.replace(
  `    id: 'skills',\n    name: 'Skill Tree',\n    short: 'Skill',\n    icon: '⚡',\n    type: 'skills_tree',\n    // Proportional great tree (harmoniously scaled)\n    width: 40,\n    height: 38,`,
  `    id: 'skills',\n    name: 'Skill Tree',\n    short: 'Skill',\n    icon: '⚡',\n    type: 'skills_tree',\n    // Proportional great tree (Opsi P1: height 35)\n    width: 40,\n    height: 35,`
);
content = content.replace(
  `    id: 'skills',\r\n    name: 'Skill Tree',\r\n    short: 'Skill',\r\n    icon: '⚡',\r\n    type: 'skills_tree',\r\n    // Proportional great tree (harmoniously scaled)\r\n    width: 40,\r\n    height: 38,`,
  `    id: 'skills',\r\n    name: 'Skill Tree',\r\n    short: 'Skill',\r\n    icon: '⚡',\r\n    type: 'skills_tree',\r\n    // Proportional great tree (Opsi P1: height 35)\r\n    width: 40,\r\n    height: 35,`
);

// 3. Update getLandmarkPositions
const oldFn = `export function getLandmarkPositions(canvasEl) {
  if (typeof document === 'undefined') return [];

  const cr = canvasEl
    ? canvasEl.getBoundingClientRect()
    : { left: 0, top: 0, width: 1280, height: 720 };

  const W = 360;
  const H = 200;
  const scaleX = cr.width / W;
  const scaleY = cr.height / H;

  // Single uniform ground baseline in screen pixels
  const groundScreenY = cr.top + CANVAS_GROUND_Y * scaleY;

  return LANDMARK_DEFS.map((lm, idx) => {
    const tabEl = document.querySelector(\`[data-location-id="\${lm.id}"]\`);
    let screenX = 0;

    if (tabEl) {
      const tr = tabEl.getBoundingClientRect();
      screenX = tr.left + tr.width / 2;
    } else {
      // Proportional fallback based on tab layout
      const proportions = [0.28, 0.40, 0.50, 0.60, 0.71, 0.82];
      screenX = cr.left + cr.width * (proportions[idx] || 0.5);
    }

    const canvasX = (screenX - cr.left) * (W / cr.width);
    const canvasY = CANVAS_GROUND_Y;

    return {
      ...lm,
      screenX,
      screenY: groundScreenY,
      canvasX,
      canvasY,
      scaleX,
      scaleY,
    };
  });
}`;

const newFn = `export function getLandmarkPositions(canvasEl, customLayout = null) {
  if (typeof document === 'undefined') return [];

  const cr = canvasEl
    ? canvasEl.getBoundingClientRect()
    : { left: 0, top: 0, width: 1280, height: 720 };

  const layout = customLayout || computeWorldLayout(cr.width, cr.height);

  if (!layout.isDesktop) {
    const W = 360;
    const H = 200;
    const scaleX = cr.width / W;
    const scaleY = cr.height / H;
    const groundScreenY = cr.top + CANVAS_GROUND_Y * scaleY;

    return LANDMARK_DEFS.map((lm, idx) => {
      const proportions = [0.28, 0.40, 0.50, 0.60, 0.71, 0.82];
      const screenX = cr.left + cr.width * (proportions[idx] || 0.5);
      const canvasX = (screenX - cr.left) * (W / cr.width);
      return {
        ...lm,
        screenX,
        screenY: groundScreenY,
        canvasX,
        canvasY: CANVAS_GROUND_Y,
        scaleX,
        scaleY,
      };
    });
  }

  // Desktop Pendekatan (b): S = H / 200, groundY = 0.47 * H
  const S = layout.scale;
  const groundScreenY = layout.groundY;
  const canvasY = CANVAS_GROUND_Y;

  return LANDMARK_DEFS.map((lm, idx) => {
    const tabEl = document.querySelector(\`[data-location-id="\${lm.id}"]\`);
    let screenX = 0;

    if (tabEl) {
      const tr = tabEl.getBoundingClientRect();
      screenX = tr.left + tr.width / 2;
    } else {
      const proportions = [0.28, 0.40, 0.50, 0.60, 0.71, 0.82];
      screenX = cr.left + cr.width * (proportions[idx] || 0.5);
    }

    const canvasX = (screenX - cr.left) / S;

    return {
      ...lm,
      screenX,
      screenY: groundScreenY,
      canvasX,
      canvasY,
      scaleX: S,
      scaleY: S,
    };
  });
}`;

content = content.replace(oldFn.replace(/\r?\n/g, '\n'), newFn);
content = content.replace(oldFn.replace(/\n/g, '\r\n'), newFn.replace(/\n/g, '\r\n'));

// 4. Update Skill tree pixel art (Opsi P1: height 35)
content = content.replace(
  `  } else if (type === 'skills_tree') {\n    // Great Skill Tree (harmoniously scaled to height 38)\n    ctx.fillStyle = '#3A2012';\n    ctx.fillRect(lx - 4, baseY - 18, 8, 18);\n    ctx.fillRect(lx - 6, baseY - 4, 12, 4);\n    // Foliage Tier 1 (bottom)\n    ctx.fillStyle = '#2D4B27';\n    ctx.fillRect(lx - 19, baseY - 26, 38, 9);\n    // Foliage Tier 2 (mid)\n    ctx.fillStyle = '#486B47';\n    ctx.fillRect(lx - 15, baseY - 32, 30, 7);\n    // Foliage Tier 3 (top)\n    ctx.fillStyle = '#659D5B';\n    ctx.fillRect(lx - 10, baseY - 38, 20, 7);\n    // Glowing orbs / sparks\n    ctx.fillStyle = isNight ? '#A5E5FF' : '#8FC6E8';\n    ctx.fillRect(lx - 6, baseY - 25, 2, 2);\n    ctx.fillRect(lx + 7, baseY - 30, 2, 2);\n    if (isNight) {\n      ctx.fillStyle = '#FFFDF8';\n      ctx.fillRect(lx - 5, baseY - 24, 1, 1);\n      ctx.fillRect(lx + 8, baseY - 29, 1, 1);\n    }`,
  `  } else if (type === 'skills_tree') {\n    // Great Skill Tree (Opsi P1: height 35)\n    ctx.fillStyle = '#3A2012';\n    ctx.fillRect(lx - 4, baseY - 17, 8, 17);\n    ctx.fillRect(lx - 6, baseY - 4, 12, 4);\n    // Foliage Tier 1 (bottom)\n    ctx.fillStyle = '#2D4B27';\n    ctx.fillRect(lx - 19, baseY - 24, 38, 8);\n    // Foliage Tier 2 (mid)\n    ctx.fillStyle = '#486B47';\n    ctx.fillRect(lx - 15, baseY - 30, 30, 7);\n    // Foliage Tier 3 (top)\n    ctx.fillStyle = '#659D5B';\n    ctx.fillRect(lx - 10, baseY - 35, 20, 6);\n    // Glowing orbs / sparks\n    ctx.fillStyle = isNight ? '#A5E5FF' : '#8FC6E8';\n    ctx.fillRect(lx - 6, baseY - 23, 2, 2);\n    ctx.fillRect(lx + 7, baseY - 28, 2, 2);\n    if (isNight) {\n      ctx.fillStyle = '#FFFDF8';\n      ctx.fillRect(lx - 5, baseY - 22, 1, 1);\n      ctx.fillRect(lx + 8, baseY - 27, 1, 1);\n    }`
);
content = content.replace(
  `  } else if (type === 'skills_tree') {\r\n    // Great Skill Tree (harmoniously scaled to height 38)\r\n    ctx.fillStyle = '#3A2012';\r\n    ctx.fillRect(lx - 4, baseY - 18, 8, 18);\r\n    ctx.fillRect(lx - 6, baseY - 4, 12, 4);\r\n    // Foliage Tier 1 (bottom)\r\n    ctx.fillStyle = '#2D4B27';\r\n    ctx.fillRect(lx - 19, baseY - 26, 38, 9);\r\n    // Foliage Tier 2 (mid)\r\n    ctx.fillStyle = '#486B47';\r\n    ctx.fillRect(lx - 15, baseY - 32, 30, 7);\r\n    // Foliage Tier 3 (top)\r\n    ctx.fillStyle = '#659D5B';\r\n    ctx.fillRect(lx - 10, baseY - 38, 20, 7);\r\n    // Glowing orbs / sparks\r\n    ctx.fillStyle = isNight ? '#A5E5FF' : '#8FC6E8';\r\n    ctx.fillRect(lx - 6, baseY - 25, 2, 2);\r\n    ctx.fillRect(lx + 7, baseY - 30, 2, 2);\r\n    if (isNight) {\r\n      ctx.fillStyle = '#FFFDF8';\r\n      ctx.fillRect(lx - 5, baseY - 24, 1, 1);\r\n      ctx.fillRect(lx + 8, baseY - 29, 1, 1);\r\n    }`,
  `  } else if (type === 'skills_tree') {\r\n    // Great Skill Tree (Opsi P1: height 35)\r\n    ctx.fillStyle = '#3A2012';\r\n    ctx.fillRect(lx - 4, baseY - 17, 8, 17);\r\n    ctx.fillRect(lx - 6, baseY - 4, 12, 4);\r\n    // Foliage Tier 1 (bottom)\r\n    ctx.fillStyle = '#2D4B27';\r\n    ctx.fillRect(lx - 19, baseY - 24, 38, 8);\r\n    // Foliage Tier 2 (mid)\r\n    ctx.fillStyle = '#486B47';\r\n    ctx.fillRect(lx - 15, baseY - 30, 30, 7);\r\n    // Foliage Tier 3 (top)\r\n    ctx.fillStyle = '#659D5B';\r\n    ctx.fillRect(lx - 10, baseY - 35, 20, 6);\r\n    // Glowing orbs / sparks\r\n    ctx.fillStyle = isNight ? '#A5E5FF' : '#8FC6E8';\r\n    ctx.fillRect(lx - 6, baseY - 23, 2, 2);\r\n    ctx.fillRect(lx + 7, baseY - 28, 2, 2);\r\n    if (isNight) {\r\n      ctx.fillStyle = '#FFFDF8';\r\n      ctx.fillRect(lx - 5, baseY - 22, 1, 1);\r\n      ctx.fillRect(lx + 8, baseY - 27, 1, 1);\r\n    }`
);

fs.writeFileSync('src/lib/landmarks.js', content, 'utf8');
console.log('Updated src/lib/landmarks.js successfully');
