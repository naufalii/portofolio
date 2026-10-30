import fs from 'fs';

let content = fs.readFileSync('src/hooks/useMediaQuery.js', 'utf8');
const target = 'const isMobile = useMediaQuery(`(max-width: ${DESKTOP_MIN_W - 1}px), (max-height: ${DESKTOP_MIN_H - 1}px)`);\r\n  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_MIN_W}px) and (min-height: ${DESKTOP_MIN_H}px)`);';
const replacement = 'const isMobile = useMediaQuery(`(max-width: ${DESKTOP_MIN_W - 1}px), (max-height: ${DESKTOP_MIN_H - 1}px), (orientation: portrait)`);\r\n  const isDesktop = useMediaQuery(`(min-width: ${DESKTOP_MIN_W}px) and (min-height: ${DESKTOP_MIN_H}px) and (orientation: landscape)`);';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/hooks/useMediaQuery.js', content, 'utf8');
  console.log('Successfully updated useMediaQuery.js');
} else {
  console.log('Target string not found in useMediaQuery.js');
}
