import fs from 'fs';
import path from 'path';
import { profile } from '../src/content/profile.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function prerender() {
  console.log('--- Starting Prerender (Item 5) ---');
  const distDir = path.resolve('dist');
  const distIndexHtmlPath = path.join(distDir, 'index.html');

  if (!fs.existsSync(distIndexHtmlPath)) {
    throw new Error('dist/index.html not found! Run vite build before prerender.');
  }

  let indexHtml = fs.readFileSync(distIndexHtmlPath, 'utf8');

  // 1. Add <noscript> block to dist/index.html for Root Page (/)
  const rootNoscript = `
    <noscript>
      <div style="max-width:860px;margin:2rem auto;padding:1.5rem;background:#F6EBD3;color:#24160B;border:3px solid #24160B;font-family:sans-serif;line-height:1.6;">
        <h1 style="font-size:1.8rem;margin-bottom:0.4rem;color:#24160B;">${escapeHtml(profile.nama)}</h1>
        <p style="font-size:1.1rem;color:#E8793A;font-weight:bold;margin-bottom:1rem;">${escapeHtml(profile.tagline)}</p>
        <p style="margin-bottom:0.8rem;color:#333;"><strong>Lokasi &amp; Kampus:</strong> ${escapeHtml(profile.lokasi)} &bull; ${escapeHtml(profile.kampus)}</p>
        <p style="margin-bottom:1.2rem;">${escapeHtml(profile.summary)}</p>
        
        <h2 style="font-size:1.2rem;margin-top:1.2rem;margin-bottom:0.5rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:4px;">Tautan &amp; Ringkasan Dokumen</h2>
        <ul style="line-height:1.8;margin-left:1.5rem;">
          <li><a href="${escapeHtml(profile.sosial.github)}" target="_blank" rel="noopener noreferrer">Profil GitHub</a></li>
          <li><a href="${escapeHtml(profile.sosial.linkedin)}" target="_blank" rel="noopener noreferrer">Profil LinkedIn</a></li>
          <li><a href="${escapeHtml(profile.quests[0].repo)}" target="_blank" rel="noopener noreferrer">Repositori Lab Oracle 19c Administration</a></li>
          <li><a href="${escapeHtml(profile.sosial.source_code)}" target="_blank" rel="noopener noreferrer">Repositori Kode Website Portofolio</a></li>
          <li><a href="${escapeHtml(profile.cv_pdf)}" download>Unduh CV (PDF)</a></li>
          <li><a href="/cv">Halaman Mode CV Linear (HTML Lengkap)</a></li>
        </ul>
        <p style="margin-top:1.5rem;font-style:italic;color:#666;font-size:0.9rem;">Aktifkan JavaScript untuk menjelajahi portofolio interaktif.</p>
      </div>
    </noscript>
  `;

  // Inject noscript after <div id="root"></div> in index.html
  if (!indexHtml.includes('<noscript>')) {
    indexHtml = indexHtml.replace('<div id="root"></div>', `<div id="root"></div>\n${rootNoscript}`);
    fs.writeFileSync(distIndexHtmlPath, indexHtml, 'utf8');
    console.log('✓ Injected semantic <noscript> into dist/index.html');
  }

  // 2. Generate dist/cv/index.html
  const cvDir = path.join(distDir, 'cv');
  if (!fs.existsSync(cvDir)) {
    fs.mkdirSync(cvDir, { recursive: true });
  }

  // Filter public quests only (strictly exclude needsOwnerConfirm like Simplex)
  const publicQuests = profile.quests.filter(q => !q.needsOwnerConfirm);

  // Generate static semantic content for /cv
  const cvStaticContent = `
    <div style="background-color:#F6EBD3;color:#24160B;font-family:'Nunito',system-ui,sans-serif;min-height:100vh;padding:24px 16px;line-height:1.6;">
      <div style="max-width:880px;margin:0 auto;background:#FFFDF8;border:4px solid #24160B;box-shadow:6px 6px 0 #24160B;padding:32px 24px;">
        
        <!-- Header & Nav Bar -->
        <header style="border-bottom:3px solid #24160B;padding-bottom:16px;margin-bottom:24px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <h1 style="font-size:2rem;margin:0;color:#24160B;font-family:sans-serif;">${escapeHtml(profile.nama)}</h1>
            <p style="font-size:1.15rem;color:#E8793A;font-weight:bold;margin:4px 0 0 0;">${escapeHtml(profile.tagline)}</p>
            <p style="font-size:0.95rem;color:#555;margin:4px 0 0 0;">${escapeHtml(profile.lokasi)} &bull; ${escapeHtml(profile.kampus)}</p>
          </div>
          <div style="display:flex;gap:10px;">
            <a href="/" style="display:inline-block;padding:8px 14px;background:#F6EBD3;color:#24160B;border:2px solid #24160B;text-decoration:none;font-weight:bold;font-size:0.9rem;">&larr; Kembali ke Overworld</a>
            <a href="${escapeHtml(profile.cv_pdf)}" download style="display:inline-block;padding:8px 14px;background:#E8793A;color:#FFFFFF;border:2px solid #24160B;text-decoration:none;font-weight:bold;font-size:0.9rem;">Unduh CV (PDF) &darr;</a>
          </div>
        </header>

        <!-- Ringkasan Profil -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Ringkasan Profil</h2>
          <p style="font-size:1rem;color:#24160B;">${escapeHtml(profile.summary)}</p>
        </section>

        <!-- Pendidikan -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Pendidikan</h2>
          <div style="background:#F6EBD3;border:2px solid #24160B;padding:12px 16px;">
            <h3 style="font-size:1.1rem;margin:0;color:#24160B;">${escapeHtml(profile.pendidikan.institusi)}</h3>
            <p style="margin:4px 0;font-weight:bold;color:#E8793A;">${escapeHtml(profile.pendidikan.jurusan)}</p>
            <p style="margin:2px 0;font-size:0.9rem;color:#555;">${escapeHtml(profile.pendidikan.periode)} &bull; IPK: ${escapeHtml(profile.pendidikan.ipk)}</p>
          </div>
        </section>

        <!-- Proyek Unggulan -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Proyek Unggulan</h2>
          ${publicQuests.map(q => `
            <div style="border:2px solid #24160B;background:#F6EBD3;padding:14px;margin-bottom:14px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">
                <h3 style="font-size:1.05rem;margin:0;color:#24160B;">${escapeHtml(q.judul)}</h3>
                <span style="font-size:0.85rem;font-weight:bold;color:#5E8B4A;">${escapeHtml(q.periode)} &bull; ${escapeHtml(q.status)}</span>
              </div>
              <p style="margin:6px 0;font-size:0.95rem;color:#333;">${escapeHtml(q.ringkasan)}</p>
              <div style="margin:8px 0;">
                <strong style="font-size:0.85rem;color:#555;">Stack:</strong>
                ${q.stack.map(s => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:#FFFDF8;border:1px solid #24160B;font-size:0.8rem;">${escapeHtml(s)}</span>`).join('')}
              </div>
              <ul style="margin:8px 0 8px 18px;font-size:0.9rem;">
                ${q.detail.map(d => `<li style="margin-bottom:4px;">${escapeHtml(d)}</li>`).join('')}
              </ul>
              ${q.repo ? `<p style="margin:6px 0 0 0;font-size:0.85rem;"><a href="${escapeHtml(q.repo)}" target="_blank" rel="noopener noreferrer" style="color:#E8793A;font-weight:bold;">Lihat Repositori GitHub &rarr;</a></p>` : ''}
            </div>
          `).join('')}
        </section>

        <!-- Keahlian Teknis & Skill Tree -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Keahlian Teknis</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));gap:16px;">
            <div style="background:#F6EBD3;border:2px solid #24160B;padding:12px;">
              <h3 style="font-size:1rem;color:#E8793A;margin:0 0 8px 0;border-bottom:1px solid #24160B;padding-bottom:4px;">Database Administration</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.9rem;">
                ${profile.skillTree.database.map(s => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.detail)}</li>`).join('')}
              </ul>
            </div>
            <div style="background:#F6EBD3;border:2px solid #24160B;padding:12px;">
              <h3 style="font-size:1rem;color:#3B5E34;margin:0 0 8px 0;border-bottom:1px solid #24160B;padding-bottom:4px;">System Administration</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.9rem;">
                ${profile.skillTree.sysAdmin.map(s => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.detail)}</li>`).join('')}
              </ul>
            </div>
            <div style="background:#F6EBD3;border:2px solid #24160B;padding:12px;">
              <h3 style="font-size:1rem;color:#24160B;margin:0 0 8px 0;border-bottom:1px solid #24160B;padding-bottom:4px;">Web Development</h3>
              <ul style="margin:0;padding-left:18px;font-size:0.9rem;">
                ${profile.skillTree.webDev.map(s => `<li><strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.detail)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </section>

        <!-- Pengalaman Organisasi -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Pengalaman Organisasi &amp; Kepanitiaan</h2>
          ${profile.organisasi.map(o => `
            <div style="border:2px solid #24160B;background:#F6EBD3;padding:12px 16px;margin-bottom:12px;">
              <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;">
                <h3 style="font-size:1.05rem;margin:0;color:#24160B;">${escapeHtml(o.guild)}</h3>
                <span style="font-size:0.85rem;color:#555;">${escapeHtml(o.periode)}</span>
              </div>
              <p style="margin:4px 0;font-weight:bold;color:#E8793A;">${escapeHtml(o.peran)}</p>
              <ul style="margin:6px 0 0 18px;font-size:0.9rem;">
                ${o.poin.map(p => `<li style="margin-bottom:4px;">${escapeHtml(p)}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>

        <!-- Sertifikat Resmi -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Sertifikasi &amp; Piagam</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:10px;">
            ${profile.sertifikat.map(c => `
              <div style="background:#F6EBD3;border:1px solid #24160B;padding:10px 12px;">
                <h4 style="font-size:0.95rem;margin:0;color:#24160B;">${escapeHtml(c.judul)}</h4>
                <p style="margin:4px 0 0 0;font-size:0.85rem;color:#555;">${escapeHtml(c.penerbit)} &bull; ${escapeHtml(c.tahun)}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Bahasa -->
        <section style="margin-bottom:24px;">
          <h2 style="font-size:1.3rem;color:#3B5E34;border-bottom:2px solid #24160B;padding-bottom:6px;margin-bottom:12px;">Kemampuan Bahasa</h2>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            ${profile.bahasa.map(b => `
              <div style="background:#F6EBD3;border:2px solid #24160B;padding:8px 16px;">
                <strong>${escapeHtml(b.nama)}</strong>: <span style="color:#E8793A;font-weight:bold;">${escapeHtml(b.level)}</span>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Footer -->
        <footer style="border-top:2px solid #24160B;padding-top:16px;margin-top:24px;text-align:center;font-size:0.85rem;color:#666;">
          Dokumen Curriculum Vitae Naufal Ali Hilmi &bull; Mode CV Linear &bull; Universitas Gunadarma
        </footer>
      </div>
    </div>
  `;

  // Construct cv/index.html based on dist/index.html
  let cvHtml = indexHtml;

  // Replace Title & Description for /cv
  cvHtml = cvHtml.replace(/<title>.*?<\/title>/, `<title>CV — ${escapeHtml(profile.nama)}</title>`);
  cvHtml = cvHtml.replace(/<meta name="title" content=".*?" \/>/, `<meta name="title" content="CV — ${escapeHtml(profile.nama)}" />`);
  cvHtml = cvHtml.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="Curriculum Vitae ${escapeHtml(profile.nama)} — ${escapeHtml(profile.tagline)}: lab Oracle 19c, administrasi Linux, dan web development." />`
  );

  // Add canonical link
  const canonicalTag = '<link rel="canonical" href="https://portofolio-naufalalihilmi.vercel.app/cv" />';
  if (!cvHtml.includes('rel="canonical"')) {
    cvHtml = cvHtml.replace('</head>', `  ${canonicalTag}\n  </head>`);
  }

  // Inject static CV inside <div id="root"></div> so crawlers without JS read full CV
  cvHtml = cvHtml.replace('<div id="root"></div>', `<div id="root">${cvStaticContent}</div>`);

  fs.writeFileSync(path.join(cvDir, 'index.html'), cvHtml, 'utf8');
  console.log('✓ Generated static prerender dist/cv/index.html');

  // 3. Security & Privacy Safeguards Verification
  console.log('--- Verifying Privacy & Security Guards on dist/ ---');
  const distCvContent = fs.readFileSync(path.join(cvDir, 'index.html'), 'utf8');
  const forbiddenPatterns = [
    { name: '@gmail', regex: /@gmail/i },
    { name: '@yahoo', regex: /@yahoo/i },
    { name: 'Nomor telepon', regex: /08[0-9]{8,}/ },
    { name: 'Simplex (needsOwnerConfirm)', regex: /simplex/i }
  ];

  for (const { name, regex } of forbiddenPatterns) {
    if (regex.test(distCvContent)) {
      throw new Error(`SECURITY GUARD VIOLATION: "${name}" was detected in dist/cv/index.html!`);
    }
    if (regex.test(indexHtml)) {
      throw new Error(`SECURITY GUARD VIOLATION: "${name}" was detected in dist/index.html!`);
    }
  }

  console.log('✓ All security guards passed! No emails, phone numbers, or hidden items in static output.');
  console.log('Prerender completed successfully.');
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
