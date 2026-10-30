import fs from 'fs';

let content = fs.readFileSync('src/components/world/WorldCanvas.jsx', 'utf8');

// 1. Remove object-cover
content = content.replace(
  'className="pixelated w-full h-full object-cover"',
  'className="pixelated w-full h-full"'
);

// 2. Setup W and H dynamically based on S = H_viewport / 200
const oldSetup = `    const W = 360;
    const H = 200;
    canvas.width = W;
    canvas.height = H;`;

const newSetup = `    const isDesk = !isMobile && typeof window !== 'undefined' && window.innerWidth >= 1024 && window.innerHeight >= 600;
    const H = 200;
    const S = isDesk ? (window.innerHeight / 200) : 1;
    const W = isDesk ? Math.max(360, Math.round(window.innerWidth / S)) : 360;
    canvas.width = W;
    canvas.height = H;`;

content = content.replace(oldSetup.replace(/\r?\n/g, '\n'), newSetup);
content = content.replace(oldSetup.replace(/\n/g, '\r\n'), newSetup.replace(/\n/g, '\r\n'));

// Ensure foreBaseY uses CANVAS_GROUND_Y on desktop
content = content.replace(
  /const foreBaseY = isMobile\s*\?\s*152[\s\S]*?: CANVAS_GROUND_Y;/g,
  'const foreBaseY = isMobile ? 152 : CANVAS_GROUND_Y;'
);

fs.writeFileSync('src/components/world/WorldCanvas.jsx', content, 'utf8');
console.log('Updated WorldCanvas.jsx successfully');
