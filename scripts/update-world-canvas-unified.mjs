import fs from 'fs';

let content = fs.readFileSync('src/components/world/WorldCanvas.jsx', 'utf8');

// 1. Remove DESKTOP_MIN_W, DESKTOP_MIN_H import
content = content.replace("import { DESKTOP_MIN_W, DESKTOP_MIN_H } from '../../lib/worldLayout';\r\n", "");
content = content.replace("import { DESKTOP_MIN_W, DESKTOP_MIN_H } from '../../lib/worldLayout';\n", "");

// 2. Add worldLayout prop
content = content.replace(
  "export function WorldCanvas({\r\n  phase = TIME_PHASES.DAY,\r\n  cameraX = 0,\r\n  isMobile = false,\r\n  className = '',\r\n}) {",
  "export function WorldCanvas({\r\n  phase = TIME_PHASES.DAY,\r\n  cameraX = 0,\r\n  isMobile = false,\r\n  worldLayout = null,\r\n  className = '',\r\n}) {"
);
if (!content.includes('worldLayout = null')) {
  content = content.replace(
    "export function WorldCanvas({\n  phase = TIME_PHASES.DAY,\n  cameraX = 0,\n  isMobile = false,\n  className = '',\n}) {",
    "export function WorldCanvas({\n  phase = TIME_PHASES.DAY,\n  cameraX = 0,\n  isMobile = false,\n  worldLayout = null,\n  className = '',\n}) {"
  );
}

// 3. Replace isDesk and canvas width calculation
const oldDeskRegex = /const isDesk = !isMobile && typeof window !== ['"]undefined['"][^;]+;\r?\n\s*const H = 200;\r?\n\s*const S = isDesk \? \(window\.innerHeight \/ 200\) : 1;\r?\n\s*const W = isDesk \? Math\.max\(360, Math\.round\(window\.innerWidth \/ S\)\) : 360;/;

const newDeskCode = `const isDesk = worldLayout ? worldLayout.isDesktop : (!isMobile);\n    const H = 200;\n    const S = isDesk ? (worldLayout ? worldLayout.scale : 1) : 1;\n    const W = isDesk ? Math.max(360, Math.round((worldLayout ? worldLayout.W : 360) / S)) : 360;`;

if (oldDeskRegex.test(content)) {
  content = content.replace(oldDeskRegex, newDeskCode);
  console.log('Replaced isDesk calculation in WorldCanvas.jsx');
} else {
  console.log('Regex did not match oldDeskRegex');
}

// 4. Update dependency array
content = content.replace(
  "}, [phase, cameraX, isMobile, isLowPower, reducedMotion]);",
  "}, [phase, cameraX, isMobile, worldLayout?.isDesktop, worldLayout?.scale, worldLayout?.W, worldLayout?.H, isLowPower, reducedMotion]);"
);

// 5. Update canvas className to check isDesk
content = content.replace(
  "className={`pixelated w-full h-full ${isMobile ? 'object-cover' : ''}`}",
  "className={`pixelated w-full h-full ${worldLayout ? (worldLayout.isDesktop ? '' : 'object-cover') : (isMobile ? 'object-cover' : '')}`}"
);

fs.writeFileSync('src/components/world/WorldCanvas.jsx', content, 'utf8');
console.log('Updated WorldCanvas.jsx successfully');
