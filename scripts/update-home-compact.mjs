import fs from 'fs';

let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// Ensure compact header has compact={true}
code = code.replace(
  `              <div className="flex items-center gap-2 flex-shrink-0">\r\n                <AudioPlayer compact={true} />\r\n\r\n                <DayNightIndicator\r\n                  phase={phase}\r\n                  onSelectPhase={setManualOverride}\r\n                  isManual={isManual}\r\n                />`,
  `              <div className="flex items-center gap-1.5 flex-shrink-0">\r\n                <AudioPlayer compact={true} />\r\n\r\n                <DayNightIndicator\r\n                  phase={phase}\r\n                  onSelectPhase={setManualOverride}\r\n                  isManual={isManual}\r\n                  compact={true}\r\n                />`
);

// Ensure standard header has no compact prop
code = code.replace(
  `              <div className="flex items-center gap-3">\r\n                <AudioPlayer compact={true} />`,
  `              <div className="flex items-center gap-3">\r\n                <AudioPlayer />`
);

// Update mascot wrapper to flex flex-col justify-end
code = code.replace(
  `            <div className="pointer-events-none">\r\n              <Sprite\r\n                animation={isTraveling ? 'walk' : isWavingHero ? 'wave' : 'idle'}`,
  `            <div className="pointer-events-none flex flex-col justify-end">\r\n              <Sprite\r\n                animation={isTraveling ? 'walk' : isWavingHero ? 'wave' : 'idle'}`
);

fs.writeFileSync('src/pages/Home.jsx', code, 'utf8');
console.log('Home.jsx updated successfully');
