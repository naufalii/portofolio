import fs from 'fs';

// 1. WorldCanvas.jsx -> standard ground
let wc = fs.readFileSync('src/components/world/WorldCanvas.jsx', 'utf8');
wc = wc.replace(
  'const foreBaseY = isMobile\n        ? 152\n        : (canvas ? (338.40 / (canvas.getBoundingClientRect().height / H)) : CANVAS_GROUND_Y);',
  'const foreBaseY = isMobile ? 152 : CANVAS_GROUND_Y;'
);
// Also handle CRLF
wc = wc.replace(
  'const foreBaseY = isMobile\r\n        ? 152\r\n        : (canvas ? (338.40 / (canvas.getBoundingClientRect().height / H)) : CANVAS_GROUND_Y);',
  'const foreBaseY = isMobile ? 152 : CANVAS_GROUND_Y;'
);
fs.writeFileSync('src/components/world/WorldCanvas.jsx', wc, 'utf8');

// 2. landmarks.js -> groundScreenY = cr.top + CANVAS_GROUND_Y * scaleY
let lm = fs.readFileSync('src/lib/landmarks.js', 'utf8');
lm = lm.replace('const groundScreenY = 338.40;', 'const groundScreenY = cr.top + CANVAS_GROUND_Y * scaleY;');
lm = lm.replace('const canvasY = targetCanvasY;', 'const canvasY = CANVAS_GROUND_Y;');
fs.writeFileSync('src/lib/landmarks.js', lm, 'utf8');

// 3. Home.jsx -> stage and dialog moved to align with groundY = 507.60px and scale = 3.3
let home = fs.readFileSync('src/pages/Home.jsx', 'utf8');
home = home.replace(
  'data-landmark-stage="true"\n          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none overflow-visible"',
  'data-landmark-stage="true"\n          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 lg:mt-[155px] pointer-events-none overflow-visible"'
);
home = home.replace(
  'data-landmark-stage="true"\r\n          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none overflow-visible"',
  'data-landmark-stage="true"\r\n          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 lg:mt-[155px] pointer-events-none overflow-visible"'
);
home = home.replace('scale={2.2}', 'scale={3.3}');
home = home.replace('lg:pt-[20px]', 'lg:pt-[34px]');
fs.writeFileSync('src/pages/Home.jsx', home, 'utf8');

console.log('Setup Approach (b) completed.');
