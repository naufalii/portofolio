import fs from 'fs';

let content = fs.readFileSync('src/lib/worldLayout.js', 'utf8');

// Set DESKTOP_MIN_H = 400 for scenario (ii) test
content = content.replace('export const DESKTOP_MIN_H = 480;', 'export const DESKTOP_MIN_H = 400;');

// Implement reduced mascot scale for H < 480
const oldMascotCode = 'const mascotScale = Math.round(2.2 * (scale / 3.6) * 100) / 100;';
const newMascotCode = `const standardMascotScale = Math.round(2.2 * (scale / 3.6) * 100) / 100;
  let mascotScale = standardMascotScale;
  if (H < 480) {
    const hBottom = headerBottom !== null && headerBottom !== undefined ? headerBottom : 94;
    const maxAllowedMascotH = (groundY - hBottom) - 38; // 28px badge stack + 10px buffer
    mascotScale = Math.min(standardMascotScale, Math.max(0.8, Math.round((maxAllowedMascotH / 48) * 100) / 100));
  }`;

content = content.replace(oldMascotCode, newMascotCode);

fs.writeFileSync('src/lib/worldLayout.js', content, 'utf8');
console.log('Temporary scenario (ii) layout applied.');
