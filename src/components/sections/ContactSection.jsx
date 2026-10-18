import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { Toast } from '../ui/Toast';
import { submitContact, getGuestbook, submitGuestbook } from '../../lib/api';
import { profile } from '../../content/profile';

/**
 * ContactSection - Kotak Pos & Papan Pesan (Mobile Fix Fase 8)
 * - Tabs: 'Kirim Surat' & 'Papan Pesan' to prevent form crowding
 * - Inputs with min-16px font-size to prevent iOS Safari auto-zoom
 * - Full-width 48px submit button
 * - Mailbox illustration max 80px
 * - Guestbook messages shown max 5 initially + 'Lihat Lebih Banyak'
 */
export function ContactSection({ defaultTab = 'contact' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync if defaultTab prop changes from overworld navigation
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

  // Guestbook state
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

  // Load guestbook entries
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
    if (activeTab === 'guestbook') {
      fetchGuestbook();
    }
  }, [activeTab]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name.trim() || !contactData.email.trim() || !contactData.message.trim()) {
      setToast({
        message: 'Mohon isi nama, email, dan pesan kontak.',
        type: 'error',
      });
      return;
    }

    setContactLoading(true);
    try {
      const res = await submitContact(contactData);
      setIsSuccess(true);
      setToast({
        message: res.message || 'Pesan berhasil dikirim ke kotak pos!',
        type: 'success',
      });
      setContactData({ name: '', email: '', message: '', website: '' });
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err) {
      setToast({
        message: err.message || 'Gagal mengirim pesan.',
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
        message: err.message || 'Gagal mengirim pesan buku tamu.',
        type: 'error',
      });
    } finally {
      setGuestbookSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Panel
        title={activeTab === 'contact' ? 'KOTAK POS (HUBUNGI SAYA)' : 'PAPAN PESAN PETUALANG'}
        icon={activeTab === 'contact' ? '📬' : '📝'}
        variant="default"
      >
        {/* Tab Switcher per Mobile Fix Fase 8 */}
        <div className="grid grid-cols-2 gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center justify-center gap-2 py-2 px-3 font-pixel text-xs sm:text-sm border-2 border-[#24160B] min-h-[44px] transition-all cursor-pointer ${
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
            className={`flex items-center justify-center gap-2 py-2 px-3 font-pixel text-xs sm:text-sm border-2 border-[#24160B] min-h-[44px] transition-all cursor-pointer ${
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
            <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed">
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
                {/* text-base (16px) prevents iOS Safari auto-zoom (Fase 8) */}
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
                {/* 4 rows per Fase 8 */}
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
                className="w-full flex items-center justify-center min-h-[48px] px-4 py-2 border-3 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-sm sm:text-base font-bold shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer"
              >
                {contactLoading ? 'MEMASUKKAN KE KOTAK POS...' : 'KIRIM SURAT &rarr;'}
              </button>

              <div className="flex items-center justify-between text-[11px] font-pixel text-[#24160B]/60 pt-1">
                <span>Anti-spam rate limit: 3 surat/jam</span>
                <span>Tersimpan aman</span>
              </div>
            </form>

            {/* Quick social links */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-[#24160B]/15">
              <a
                href={profile.sosial.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <button
                  type="button"
                  className="w-full min-h-[44px] px-2 py-1.5 border-2 border-[#24160B] bg-[#FFFDF8] font-pixel text-xs font-bold hover:bg-[#F6EBD3] shadow-[2px_2px_0_#24160B]"
                >
                  LinkedIn &rarr;
                </button>
              </a>

              <a
                href={profile.sosial.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block"
              >
                <button
                  type="button"
                  className="w-full min-h-[44px] px-2 py-1.5 border-2 border-[#24160B] bg-[#FFFDF8] font-pixel text-xs font-bold hover:bg-[#F6EBD3] shadow-[2px_2px_0_#24160B]"
                >
                  GitHub &rarr;
                </button>
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: PAPAN PESAN (GUESTBOOK) */}
        {activeTab === 'guestbook' && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed">
              Tinggalkan sapaan di papan pesan! Pesan akan tampil setelah disetujui moderator.
            </p>

            {/* Guestbook Form */}
            <form onSubmit={handleGuestbookSubmit} className="space-y-3 p-3.5 border-2 border-[#24160B] bg-[#FFFDF8]">
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
                <label htmlFor="gb-name" className="block font-pixel text-xs font-bold text-[#24160B] mb-1">
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
                  className="w-full p-2.5 bg-[#F6EBD3]/50 border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A]"
                />
              </div>

              <div>
                <label htmlFor="gb-msg" className="block font-pixel text-xs font-bold text-[#24160B] mb-1">
                  Pesan ({guestbookData.message.length}/500):
                </label>
                <textarea
                  id="gb-msg"
                  required
                  rows={3}
                  maxLength={500}
                  value={guestbookData.message}
                  onChange={(e) =>
                    setGuestbookData((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Tinggalkan pesan di papan..."
                  className="w-full p-2.5 bg-[#F6EBD3]/50 border-2 border-[#24160B] font-body text-base focus:outline-none focus:ring-2 focus:ring-[#E8793A] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={guestbookSubmitting}
                className="w-full flex items-center justify-center min-h-[48px] px-4 py-2 border-3 border-[#24160B] bg-[#5E8B4A] text-white font-pixel text-xs sm:text-sm font-bold shadow-[2px_2px_0_#24160B] active:translate-y-[1px]"
              >
                {guestbookSubmitting ? 'MENYEMATKAN...' : 'TEMPEL DI PAPAN &rarr;'}
              </button>
            </form>

            {/* Sticky Notes Display (Max 5 initially + Load More per Fase 8) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-[#24160B]/20 pb-1">
                <span className="font-pixel text-xs font-bold text-[#3B5E34] uppercase">
                  Pesan yang Tersemat ({entries.length})
                </span>
                <button
                  type="button"
                  onClick={fetchGuestbook}
                  className="font-pixel text-xs text-[#E8793A] hover:underline cursor-pointer min-h-[32px] px-2 flex items-center"
                >
                  Segarkan ↻
                </button>
              </div>

              {guestbookLoading ? (
                <div className="p-6 text-center font-pixel text-xs text-[#24160B]/70">
                  Memuat tempelan pesan...
                </div>
              ) : entries.length === 0 ? (
                <div className="border-2 border-dashed border-[#24160B]/40 p-5 text-center bg-[#FFFDF8]">
                  <p className="font-pixel text-xs text-[#24160B]/70">
                    Belum ada pesan yang disetujui. Jadilah petualang pertama yang menempelkan pesan!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {entries.slice(0, visibleCount).map((entry) => (
                    <div
                      key={entry.id}
                      className="border-2 border-[#24160B] bg-[#FFFDF8] p-3 shadow-[2px_2px_0_#24160B]"
                    >
                      <p className="font-body text-xs text-[#24160B] leading-relaxed mb-1.5 break-words">
                        "{entry.message}"
                      </p>
                      <div className="flex items-center justify-between font-pixel text-[10px] text-[#3B5E34]">
                        <span className="font-bold truncate max-w-[150px]">~ {entry.name}</span>
                        <span className="text-[#24160B]/60">{entry.created_at ? entry.created_at.split('T')[0] : ''}</span>
                      </div>
                    </div>
                  ))}

                  {/* 'Lihat Lebih Banyak' button if > visibleCount */}
                  {entries.length > visibleCount && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 5)}
                      className="w-full py-2 min-h-[44px] font-pixel text-xs text-[#E8793A] border-2 border-dashed border-[#24160B]/30 hover:bg-[#F6EBD3] cursor-pointer font-bold"
                    >
                      Lihat Lebih Banyak Pesan (+5) &darr;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default ContactSection;
