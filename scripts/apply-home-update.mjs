import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Add import
if (!content.includes("from '../lib/worldLayout'")) {
  content = `import { computeWorldLayout } from '../lib/worldLayout';\n` + content;
}

// 2. Add worldLayout state and effect inside HomePage
const stateHook = `  const [worldLayout, setWorldLayout] = useState(() => {
    if (typeof window === 'undefined') return { isDesktop: false, scale: 1, groundY: 338.40, dialogTop: 376.59, mascotScale: 2.2 };
    return computeWorldLayout(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    const updateLayout = () => {
      const header = document.querySelector('header');
      const hr = header ? header.getBoundingClientRect() : null;
      const headerBottom = hr ? hr.bottom : null;
      setWorldLayout(computeWorldLayout(window.innerWidth, window.innerHeight, headerBottom));
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateLayout);
    }

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };
  }, []);`;

content = content.replace(
  '  const reducedMotion = useReducedMotion();',
  '  const reducedMotion = useReducedMotion();\n' + stateHook
);

// 3. Update stage container and Sprite scale
const oldDesktopStage = `<div
          ref={stageRef}
          data-landmark-stage="true"
          className="relative z-20 w-full max-w-4xl mx-auto px-4 flex justify-center items-center my-1 pointer-events-none overflow-visible"
        >`;

const newDesktopStage = `<div
          ref={stageRef}
          data-landmark-stage="true"
          className="pointer-events-none overflow-visible"
          style={
            !isMobile && worldLayout.isDesktop
              ? {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: \`\${worldLayout.groundY}px\`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  zIndex: 20,
                }
              : {
                  position: 'relative',
                  zIndex: 20,
                  width: '100%',
                  maxWidth: '56rem',
                  margin: '0 auto',
                  padding: '0 1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBlock: '0.25rem',
                }
          }
        >`;

content = content.replace(oldDesktopStage.replace(/\r?\n/g, '\n'), newDesktopStage);
content = content.replace(oldDesktopStage.replace(/\n/g, '\r\n'), newDesktopStage.replace(/\n/g, '\r\n'));

// Replace Sprite scale
content = content.replace(
  'scale={2.2}',
  'scale={!isMobile && worldLayout.isDesktop ? worldLayout.mascotScale : 2.2}'
);

// 4. Update main container (remove justify-center on desktop, set dialogTop)
const oldMain = `<main className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 py-3 lg:py-5 flex flex-col justify-center overflow-visible">`;
const newMain = `<main
        className="relative z-20 flex-1 w-full max-w-5xl mx-auto px-4 overflow-visible flex flex-col justify-center lg:justify-start"
        style={
          !isMobile && worldLayout.isDesktop
            ? {
                paddingTop: \`\${worldLayout.dialogTop - (worldLayout.headerBottom || 208)}px\`,
              }
            : undefined
        }
      >`;

content = content.replace(oldMain, newMain);

fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
console.log('Updated Home.jsx successfully');
