import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// Derive isMobile directly from worldLayout.isDesktop
content = content.replace(
  "  const { isMobile } = useDeviceType();\r\n  const reducedMotion = useReducedMotion();\r\n  const [worldLayout, setWorldLayout] = useState(() => {\r\n    if (typeof window === 'undefined') return { isDesktop: false, scale: 1, groundY: 338.40, dialogTop: 376.59, mascotScale: 2.2 };\r\n    return computeWorldLayout(window.innerWidth, window.innerHeight);\r\n  });",
  "  const reducedMotion = useReducedMotion();\r\n  const [worldLayout, setWorldLayout] = useState(() => {\r\n    if (typeof window === 'undefined') return { isDesktop: false, scale: 1, groundY: 338.40, dialogTop: 376.59, mascotScale: 2.2 };\r\n    return computeWorldLayout(window.innerWidth, window.innerHeight);\r\n  });\r\n  const isDesktop = worldLayout.isDesktop;\r\n  const isMobile = !isDesktop;"
);

if (!content.includes('const isDesktop = worldLayout.isDesktop;')) {
  content = content.replace(
    "  const { isMobile } = useDeviceType();\n  const reducedMotion = useReducedMotion();\n  const [worldLayout, setWorldLayout] = useState(() => {\n    if (typeof window === 'undefined') return { isDesktop: false, scale: 1, groundY: 338.40, dialogTop: 376.59, mascotScale: 2.2 };\n    return computeWorldLayout(window.innerWidth, window.innerHeight);\n  });",
    "  const reducedMotion = useReducedMotion();\n  const [worldLayout, setWorldLayout] = useState(() => {\n    if (typeof window === 'undefined') return { isDesktop: false, scale: 1, groundY: 338.40, dialogTop: 376.59, mascotScale: 2.2 };\n    return computeWorldLayout(window.innerWidth, window.innerHeight);\n  });\n  const isDesktop = worldLayout.isDesktop;\n  const isMobile = !isDesktop;"
  );
}

// Pass worldLayout to WorldCanvas
content = content.replace(
  "      <WorldCanvas\r\n        phase={phase}\r\n        cameraX={cameraX}\r\n        isMobile={isMobile}\r\n      />",
  "      <WorldCanvas\r\n        phase={phase}\r\n        cameraX={cameraX}\r\n        isMobile={isMobile}\r\n        worldLayout={worldLayout}\r\n      />"
);

if (!content.includes('worldLayout={worldLayout}')) {
  content = content.replace(
    "      <WorldCanvas\n        phase={phase}\n        cameraX={cameraX}\n        isMobile={isMobile}\n      />",
    "      <WorldCanvas\n        phase={phase}\n        cameraX={cameraX}\n        isMobile={isMobile}\n        worldLayout={worldLayout}\n      />"
  );
}

fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
console.log('Updated Home.jsx successfully');
