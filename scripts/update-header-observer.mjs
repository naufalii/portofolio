import fs from 'fs';

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const oldBlock = `    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateLayout);
    }

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
    };`;

const newBlock = `    updateLayout();
    window.addEventListener('resize', updateLayout);
    window.addEventListener('orientationchange', updateLayout);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateLayout);
    }
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateLayout);
    }

    let headerObserver = null;
    const headerEl = document.querySelector('header');
    if (headerEl && typeof ResizeObserver !== 'undefined') {
      headerObserver = new ResizeObserver(updateLayout);
      headerObserver.observe(headerEl);
    }

    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateLayout);
      }
      if (headerObserver) {
        headerObserver.disconnect();
      }
    };`;

content = content.replace(oldBlock.replace(/\r?\n/g, '\r\n'), newBlock.replace(/\r?\n/g, '\r\n'));
fs.writeFileSync('src/pages/Home.jsx', content, 'utf8');
console.log('Home.jsx updated with header ResizeObserver');
