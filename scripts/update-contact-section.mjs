import fs from 'fs';

const filePath = 'src/components/sections/ContactSection.jsx';
let content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');

// 1. Update export function signature
content = content.replace(
  /export function ContactSection\(\{ defaultTab = 'contact', isMobile = true \}\) \{/,
  "export function ContactSection({ defaultTab = 'contact', isMobile = false, isCompact = false }) {"
);

// 2. Locate boundaries
const startMarker = '{!isMobile ? (';
const endMarker = ') : (\n        /* Mobile View (Fase 8): Tabbed View';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `{!isMobile ? (
        /* Desktop View: Form di Kiri (8 cols) + Kotak Pos di Kanan (4 cols) */
        <Panel title="KOTAK POS (HUBUNGI SAYA)" variant="default" isCompact={isCompact}>
          <div className={\`grid grid-cols-1 lg:grid-cols-12 \${isCompact ? 'gap-3.5' : 'gap-6'} items-start\`}>
            {/* Left Column: Form */}
            <div className={\`lg:col-span-8 \${isCompact ? 'space-y-2' : 'space-y-4'}\`}>
              <p className={\`\${isCompact ? 'text-xs line-clamp-1 mb-1' : 'text-xs lg:text-sm mb-0'} text-[#24160B]/80 leading-relaxed\`}>
                Ingin mendiskusikan peluang kerja, internship, kolaborasi teknis, atau sekadar bertukar wawasan? Tuliskan suratmu di bawah ini:
              </p>

              <form onSubmit={handleContactSubmit} className={isCompact ? 'space-y-2' : 'space-y-3.5'} noValidate>
                {/* Honeypot anti-spam field */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="website-desktop">Website</label>
                  <input
                    type="text"
                    id="website-desktop"
                    name="website"
                    value={contactData.website}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, website: e.target.value }))
                    }
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-name-desktop"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-0.5 uppercase"
                  >
                    Nama Petualang / Pengirim:
                  </label>
                  <input
                    id="contact-name-desktop"
                    type="text"
                    name="name"
                    required
                    maxLength={40}
                    value={contactData.name}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: HR / Lead Engineer"
                    className={\`w-full \${isCompact ? 'p-1.5 text-xs' : 'p-2.5 text-xs lg:text-sm'} bg-[#FFFDF8] border-2 border-[#24160B] font-body focus:outline-none focus:ring-2 focus:ring-[#E8793A]\`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email-desktop"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-0.5 uppercase"
                  >
                    Alamat Email:
                  </label>
                  <input
                    id="contact-email-desktop"
                    type="email"
                    name="email"
                    required
                    value={contactData.email}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="nama@perusahaan.com"
                    className={\`w-full \${isCompact ? 'p-1.5 text-xs' : 'p-2.5 text-xs lg:text-sm'} bg-[#FFFDF8] border-2 border-[#24160B] font-body focus:outline-none focus:ring-2 focus:ring-[#E8793A]\`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message-desktop"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-0.5 uppercase"
                  >
                    Isi Surat / Pesan ({contactData.message.length}/500):
                  </label>
                  <textarea
                    id="contact-message-desktop"
                    name="message"
                    required
                    rows={isCompact ? 2 : 4}
                    maxLength={500}
                    value={contactData.message}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tuliskan pesanmu di sini..."
                    className={\`w-full \${isCompact ? 'p-1.5 text-xs' : 'p-2.5 text-xs lg:text-sm'} bg-[#FFFDF8] border-2 border-[#24160B] font-body focus:outline-none focus:ring-2 focus:ring-[#E8793A] resize-none\`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <PixelButton
                    type="submit"
                    variant="primary"
                    size={isCompact ? 'sm' : 'md'}
                    disabled={contactLoading}
                  >
                    {contactLoading ? 'MEMASUKKAN SURAT...' : 'KIRIM SURAT \u2192'}
                  </PixelButton>

                  <span className="text-[10px] font-pixel text-[#24160B]/60">
                    Rate limit: 3 surat/jam
                  </span>
                </div>
              </form>
            </div>

            {/* Right Column: Interactive Pixel Mailbox Illustration */}
            <div className={\`lg:col-span-4 border-2 border-[#24160B] bg-[#FFFDF8] \${isCompact ? 'p-2.5' : 'p-4'} shadow-[3px_3px_0_#24160B] flex flex-col items-center justify-center text-center\`}>
              <div className="font-pixel text-xs font-bold text-[#E8793A] mb-2 uppercase">
                KOTAK POS GHOZALI
              </div>

              {/* Mailbox SVG with Letter Animation */}
              <div className={\`relative \${isCompact ? 'w-16 h-16 my-1' : 'w-28 h-28 my-2'} flex items-center justify-center\`}>
                {/* Sliding Envelope upon success */}
                <div
                  className={\`absolute z-10 transition-all duration-700 \${
                    isSuccess
                      ? (isCompact ? 'top-6 opacity-100 scale-75' : 'top-10 opacity-100 scale-90 translate-y-3')
                      : '-top-6 opacity-0'
                  }\`}
                >
                  <div className="w-12 h-8 bg-[#F6EBD3] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] flex items-center justify-center font-pixel text-[10px] text-[#E8793A] font-bold">
                    \u2709\uFE0F POS
                  </div>
                </div>

                {/* Pixel Mailbox */}
                <svg
                  width={isCompact ? 54 : 80}
                  height={isCompact ? 54 : 80}
                  viewBox="0 0 32 32"
                  className="pixelated drop-shadow-[2px_2px_0_#24160B]"
                  shapeRendering="crispEdges"
                >
                  {/* Post */}
                  <rect x="14" y="18" width="4" height="14" fill="#24160B" />
                  {/* Mailbox Body */}
                  <rect x="7" y="6" width="18" height="14" fill="#5E8B4A" />
                  <rect x="7" y="6" width="18" height="4" fill="#3B5E34" />
                  {/* Mail Slot */}
                  <rect x="10" y="11" width="12" height="2" fill="#24160B" />
                  {/* Flag */}
                  <rect
                    x="23"
                    y={isSuccess ? '4' : '10'}
                    width="2"
                    height="7"
                    fill="#E8793A"
                  />
                  <rect
                    x="21"
                    y={isSuccess ? '4' : '10'}
                    width="4"
                    height="3"
                    fill="#E8793A"
                  />
                </svg>
              </div>

              <p className={\`font-pixel text-[#24160B] \${isCompact ? 'text-[11px] mt-1' : 'text-xs mt-2'}\`}>
                {isSuccess
                  ? 'Surat telah masuk!'
                  : 'Kotak pos siap menerima pesanmu.'}
              </p>

              <div className={\`\${isCompact ? 'mt-2 pt-2 space-y-1.5' : 'mt-4 pt-3 space-y-2'} border-t border-[#24160B]/20 w-full\`}>
                <a
                  href={profile.sosial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PixelButton variant="neutral" size="sm" className="w-full">
                    LinkedIn Profil \u2192
                  </PixelButton>
                </a>

                <a
                  href={profile.sosial.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PixelButton variant="neutral" size="sm" className="w-full">
                    GitHub Profil \u2192
                  </PixelButton>
                </a>
              </div>
            </div>
          </div>
        </Panel>
      `;

  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully updated ContactSection.jsx!');
} else {
  console.error('Boundaries not found:', { startIndex, endIndex });
}
