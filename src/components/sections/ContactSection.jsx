import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { Toast } from '../ui/Toast';
import { submitContact, getGuestbook, submitGuestbook } from '../../lib/api';
import { profile } from '../../content/profile';

/**
 * ContactSection - Kotak Pos (Hubungi Saya)
 * - Desktop: 12-column layout with contact form on left and interactive pixel mailbox on right (identik c383241)
 * - Mobile: Tabbed view ('Kirim Surat' & 'Papan Pesan') with 16px inputs and 48px buttons (identik mobile-current)
 */
export function ContactSection({ defaultTab = 'contact', isMobile = true }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Contact form state
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Guestbook state (mobile only)
  const [guestbookData, setGuestbookData] = useState({
    name: '',
    message: '',
    website: '',
  });
  const [entries, setEntries] = useState([]);
  const [guestbookLoading, setGuestbookLoading] = useState(false);
  const [guestbookSubmitting, setGuestbookSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);

  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Load guestbook entries for mobile
  const fetchGuestbook = async () => {
    try {
      setGuestbookLoading(true);
      const data = await getGuestbook();
      setEntries(data);
    } catch (err) {
      console.warn('Guestbook fetch notice:', err);
    } finally {
      setGuestbookLoading(false);
    }
  };

  useEffect(() => {
    if (isMobile && activeTab === 'guestbook') {
      fetchGuestbook();
    }
  }, [isMobile, activeTab]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (
      !contactData.name.trim() ||
      !contactData.email.trim() ||
      !contactData.message.trim()
    ) {
      setToast({
        message: 'Mohon lengkapi seluruh kolom formulir.',
        type: 'error',
      });
      return;
    }

    setContactLoading(true);

    try {
      await submitContact(contactData);
      setIsSuccess(true);
      setToast({
        message: 'Suratmu berhasil dikirimkan ke kotak pos Naufal!',
        type: 'success',
      });
      setContactData({ name: '', email: '', message: '', website: '' });

      setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
    } catch (err) {
      setToast({
        message: err.message || 'Gagal mengirim pesan. Silakan coba kembali.',
        type: 'error',
      });
    } finally {
      setContactLoading(false);
    }
  };

  const handleGuestbookSubmit = async (e) => {
    e.preventDefault();

    if (!guestbookData.name.trim() || !guestbookData.message.trim()) {
      setToast({
        message: 'Mohon isi nama dan pesan buku tamu.',
        type: 'error',
      });
      return;
    }

    setGuestbookSubmitting(true);

    try {
      const res = await submitGuestbook(guestbookData);
      setToast({
        message:
          res.message ||
          'Pesanmu telah disematkan dan akan tampil setelah disetujui moderator!',
        type: 'success',
      });
      setGuestbookData({ name: '', message: '', website: '' });
    } catch (err) {
      setToast({
        message: err.message || 'Gagal mengirim pesan.',
        type: 'error',
      });
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {!isMobile ? (
        /* Desktop View (Identik c383241): Form di Kiri (8 cols) + Kotak Pos Ghozali di Kanan (4 cols) */
        <Panel title="KOTAK POS (HUBUNGI SAYA)" variant="default">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-8 space-y-4">
              <p className="text-xs lg:text-sm text-[#24160B]/80 leading-relaxed">
                Ingin mendiskusikan peluang internship System Administrator / Oracle DBA, kolaborasi teknis, atau sekadar bertukar wawasan? Tuliskan suratmu di bawah ini:
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3.5" noValidate>
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
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1 uppercase"
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
                    className="w-full p-2.5 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email-desktop"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1 uppercase"
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
                    className="w-full p-2.5 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message-desktop"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1 uppercase"
                  >
                    Isi Surat / Pesan ({contactData.message.length}/500):
                  </label>
                  <textarea
                    id="contact-message-desktop"
                    name="message"
                    required
                    rows={4}
                    maxLength={500}
                    value={contactData.message}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tuliskan pesanmu di sini..."
                    className="w-full p-2.5 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-[#E8793A] resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <PixelButton
                    type="submit"
                    variant="primary"
                    size="md"
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
            <div className="lg:col-span-4 border-2 border-[#24160B] bg-[#FFFDF8] p-4 shadow-[3px_3px_0_#24160B] flex flex-col items-center justify-center text-center">
              <div className="font-pixel text-xs font-bold text-[#E8793A] mb-3 uppercase">
                KOTAK POS GHOZALI
              </div>

              {/* Mailbox SVG with Letter Animation */}
              <div className="relative w-28 h-28 my-2 flex items-center justify-center">
                {/* Sliding Envelope upon success */}
                <div
                  className={`absolute z-10 transition-all duration-700 ${
                    isSuccess
                      ? 'top-10 opacity-100 scale-90 translate-y-3'
                      : '-top-6 opacity-0'
                  }`}
                >
                  <div className="w-12 h-8 bg-[#F6EBD3] border-2 border-[#24160B] shadow-[2px_2px_0_#24160B] flex items-center justify-center font-pixel text-[10px] text-[#E8793A] font-bold">
                    ✉️ POS
                  </div>
                </div>

                {/* Pixel Mailbox */}
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 32 32"
                  className="pixelated drop-shadow-[3px_3px_0_#24160B]"
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

              <p className="text-xs font-pixel text-[#24160B] mt-2">
                {isSuccess
                  ? 'Surat telah masuk ke dalam kotak pos!'
                  : 'Kotak pos siap menerima pesanmu.'}
              </p>

              <div className="mt-4 pt-3 border-t border-[#24160B]/20 w-full space-y-2">
                <a
                  href={profile.sosial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PixelButton variant="neutral" size="sm" className="w-full">
                    LinkedIn Profil &rarr;
                  </PixelButton>
                </a>

                <a
                  href={profile.sosial.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <PixelButton variant="neutral" size="sm" className="w-full">
                    GitHub Profil &rarr;
                  </PixelButton>
                </a>
              </div>
            </div>
          </div>
        </Panel>
      ) : (
        /* Mobile View (Fase 8): Tabbed View 'Kirim Surat' & 'Papan Pesan' */
        <Panel title="KOTAK POS & PAPAN PESAN" icon="📬" variant="default">
          {/* Tabs Navigation (Fase 8) */}
          <div className="grid grid-cols-2 gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`flex items-center justify-center gap-2 py-2 px-3 font-pixel text-xs border-2 border-[#24160B] min-h-[44px] transition-all cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-[#5E8B4A] text-white shadow-[2px_2px_0_#24160B] font-bold'
                  : 'bg-[#FFFDF8] text-[#24160B] hover:bg-[#F6EBD3]'
              }`}
            >
              <span>📬</span>
              <span>Kirim Surat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guestbook')}
              className={`flex items-center justify-center gap-2 py-2 px-3 font-pixel text-xs border-2 border-[#24160B] min-h-[44px] transition-all cursor-pointer ${
                activeTab === 'guestbook'
                  ? 'bg-[#5E8B4A] text-white shadow-[2px_2px_0_#24160B] font-bold'
                  : 'bg-[#FFFDF8] text-[#24160B] hover:bg-[#F6EBD3]'
              }`}
            >
              <span>📝</span>
              <span>Papan Pesan</span>
            </button>
          </div>

          {/* TAB 1: FORM KONTAK */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <p className="text-xs text-[#24160B]/80 leading-relaxed">
                Tuliskan pesanmu untuk mendiskusikan peluang internship System Administrator / Oracle DBA atau kolaborasi:
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-3.5" noValidate>
                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
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
                    htmlFor="contact-name"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1"
                  >
                    Nama Petualang / Pengirim:
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    maxLength={40}
                    value={contactData.name}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: HR / Lead Engineer"
                    className="w-full p-3 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1"
                  >
                    Alamat Email:
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactData.email}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="nama@perusahaan.com"
                    className="w-full p-3 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1"
                  >
                    Isi Surat ({contactData.message.length}/500):
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    maxLength={500}
                    value={contactData.message}
                    onChange={(e) =>
                      setContactData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tuliskan pesanmu di sini..."
                    className="w-full p-3 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A] resize-none"
                  />
                </div>

                {/* Submit Button: Full-width, 48px height per Fase 8 */}
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full flex items-center justify-center min-h-[48px] px-4 py-2 border-3 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-sm font-bold shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer disabled:opacity-50"
                >
                  {contactLoading ? 'MEMASUKKAN SURAT...' : 'KIRIM SURAT \u2192'}
                </button>

                <div className="flex items-center justify-between text-[11px] font-pixel text-[#24160B]/60 pt-1">
                  <span>Rate limit: 3 surat/jam</span>
                  <span>Langsung terkirim</span>
                </div>
              </form>

              {/* Mailbox mini illustration */}
              <div className="pt-3 border-t border-[#24160B]/15 flex items-center gap-3 bg-[#F6EBD3]/40 p-3 border-2 border-[#24160B]/30">
                <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 32 32"
                    className="pixelated drop-shadow-[2px_2px_0_#24160B]"
                    shapeRendering="crispEdges"
                  >
                    <rect x="14" y="18" width="4" height="14" fill="#24160B" />
                    <rect x="7" y="6" width="18" height="14" fill="#5E8B4A" />
                    <rect x="7" y="6" width="18" height="4" fill="#3B5E34" />
                    <rect x="10" y="11" width="12" height="2" fill="#24160B" />
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
                <div className="text-xs font-body text-[#24160B] leading-tight">
                  <div className="font-pixel text-xs font-bold text-[#E8793A] mb-1">
                    KOTAK POS GHOZALI
                  </div>
                  <p>
                    {isSuccess
                      ? 'Surat telah dimasukkan ke kotak pos!'
                      : 'Kotak pos terbuka dan siap menampung pesanmu.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAPAN PESAN (GUESTBOOK) */}
          {activeTab === 'guestbook' && (
            <div className="space-y-4">
              <p className="text-xs text-[#24160B]/80 leading-relaxed">
                Tinggalkan catatan atau sapaan untuk ditempelkan di papan pesan petualang:
              </p>

              <form onSubmit={handleGuestbookSubmit} className="space-y-3" noValidate>
                {/* Honeypot field */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    value={guestbookData.website}
                    onChange={(e) =>
                      setGuestbookData((prev) => ({ ...prev, website: e.target.value }))
                    }
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gb-name"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1"
                  >
                    Nama Petualang:
                  </label>
                  <input
                    id="gb-name"
                    type="text"
                    required
                    maxLength={40}
                    value={guestbookData.name}
                    onChange={(e) =>
                      setGuestbookData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nama / Panggilanmu"
                    className="w-full p-3 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gb-message"
                    className="block font-pixel text-xs font-bold text-[#24160B] mb-1"
                  >
                    Pesan ({guestbookData.message.length}/500):
                  </label>
                  <textarea
                    id="gb-message"
                    required
                    rows={4}
                    maxLength={500}
                    value={guestbookData.message}
                    onChange={(e) =>
                      setGuestbookData((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Tuliskan catatan di papan..."
                    className="w-full p-3 bg-[#FFFDF8] border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A] resize-none"
                  />
                </div>

                {/* Submit button: full-width 48px */}
                <button
                  type="submit"
                  disabled={guestbookSubmitting}
                  className="w-full flex items-center justify-center min-h-[48px] px-4 py-2 border-3 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-sm font-bold shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer disabled:opacity-50"
                >
                  {guestbookSubmitting ? 'MENYEMATKAN...' : 'TEMPEL DI PAPAN \u2192'}
                </button>

                <p className="text-[11px] font-pixel text-[#24160B]/60 text-center">
                  Moderasi aktif &bull; Anti-spam rate limit 3 pesan/jam
                </p>
              </form>

              {/* Pinned Messages Board */}
              <div className="pt-3 border-t-2 border-[#24160B]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-xs font-bold text-[#3B5E34] uppercase">
                    PESAN TERSEMAT ({entries.length})
                  </span>
                  <button
                    type="button"
                    onClick={fetchGuestbook}
                    className="font-pixel text-xs text-[#E8793A] hover:underline cursor-pointer"
                  >
                    Segarkan ↻
                  </button>
                </div>

                {guestbookLoading ? (
                  <div className="p-4 text-center font-pixel text-xs text-[#24160B]/70">
                    Memuat tempelan pesan...
                  </div>
                ) : entries.length === 0 ? (
                  <div className="border-2 border-dashed border-[#24160B]/40 p-4 text-center bg-[#FFFDF8]">
                    <p className="font-pixel text-xs text-[#24160B]/70">
                      Belum ada pesan yang disetujui. Jadilah petualang pertama yang menempelkan pesan!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {entries.slice(0, visibleCount).map((entry) => (
                      <div
                        key={entry.id}
                        className="relative border-2 border-[#24160B] bg-[#FFFDF8] p-3 shadow-[2px_2px_0_#24160B]"
                      >
                        <div className="absolute -top-1.5 left-4 w-6 h-2 bg-[#F6EBD3] border border-[#24160B]/40 opacity-80" />
                        <p className="font-body text-xs text-[#24160B] leading-relaxed mb-2 mt-1 break-words">
                          "{entry.message}"
                        </p>
                        <div className="border-t border-[#24160B]/15 pt-1.5 flex items-center justify-between font-pixel text-[11px] text-[#3B5E34]">
                          <span className="font-bold truncate max-w-[140px]">
                            ~ {entry.name}
                          </span>
                          <span className="text-[#24160B]/60 text-[10px]">
                            {entry.created_at ? entry.created_at.split('T')[0] : ''}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Pagination: Lihat Lebih Banyak (+5) */}
                    {entries.length > visibleCount && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 5)}
                        className="w-full py-2.5 px-3 min-h-[44px] border-2 border-[#24160B] bg-[#FFFDF8] hover:bg-[#F6EBD3] text-[#24160B] font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px] cursor-pointer"
                      >
                        Lihat Lebih Banyak (+5 pesan) &rarr;
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </Panel>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default ContactSection;
