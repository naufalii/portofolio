import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { Toast } from '../ui/Toast';
import { getGuestbook, submitGuestbook } from '../../lib/api';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { useSectionPagination } from '../../hooks/useSectionPagination';

/**
 * GuestbookSection - Papan Pesan Petualang (Buku Tamu)
 * Follows Bagian 1, 2, 3 of Desktop Pagination Specification:
 * - Desktop: Sticky notes paginated into clean pages without internal scrollbars
 * - Left column: Submission form with moderation note
 * - Right column: Paginated sticky notes with tape accents
 */
export function GuestbookSection({ isMobile: isMobileProp, isDesktop: isDesktopProp, isCompact = false }) {
  const { isMobile: isMobileDevice } = useDeviceType();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice;
  const isDesktop = isDesktopProp !== undefined ? isDesktopProp : !isMobile;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', message: '', website: '' });
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getGuestbook();
      setEntries(data || []);
    } catch (err) {
      console.warn('Guestbook fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Items for sticky notes pagination (each note is an item)
  const noteItems = (entries && entries.length > 0 ? entries : []).map((e) => ({
    id: String(e.id),
    ...e,
    estimatedHeight: isCompact ? 75 : 90,
  }));

  const pagination = useSectionPagination(noteItems, isDesktop, {
    sectionKey: 'guestbook',
    reservedHeight: isCompact ? 100 : 120,
    minItemHeight: 70,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.message.trim()) {
      setToast({
        message: 'Mohon isi nama dan pesan buku tamu.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitGuestbook(formData);
      setToast({
        message:
          res.message ||
          'Pesanmu telah disematkan dan akan tampil setelah disetujui moderator!',
        type: 'success',
      });
      setFormData({ name: '', message: '', website: '' });
    } catch (err) {
      setToast({
        message: err.message || 'Gagal mengirim pesan.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-2 max-w-5xl mx-auto" ref={pagination.containerRef}>
      <Panel
        title="PAPAN PESAN PETUALANG (GUESTBOOK)"
        variant="default"
        isCompact={isCompact}
      >
        <p className={`${isCompact ? 'text-xs mb-2 line-clamp-1' : 'text-xs lg:text-sm mb-4'} text-[var(--ink)]/80 leading-relaxed`}>
          Tinggalkan pesan sapaan, kesan petualangan, atau masukan untuk Naufal Ali Hilmi! Untuk menjaga kenyamanan, setiap pesan akan dimoderasi terlebih dahulu sebelum disematkan di papan kayu ini.
        </p>

        <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-3' : 'gap-5'} items-start`}>
          {/* Left Column: Form */}
          <div className={`lg:col-span-5 border-2 border-[var(--ink)] bg-[var(--cloud)] ${isCompact ? 'p-2 shadow-[2px_2px_0_var(--ink)]' : 'p-3.5 shadow-[3px_3px_0_var(--ink)]'}`}>
            <h3 className={`font-pixel text-xs lg:text-sm font-bold text-[var(--sunset)] uppercase border-b-2 border-[var(--ink)] ${isCompact ? 'pb-0.5 mb-1.5' : 'pb-1 mb-2.5'}`}>
              Tulis Catatanmu
            </h3>

            <form onSubmit={handleSubmit} className={isCompact ? "space-y-1.5" : "space-y-2.5"} noValidate>
              {/* Honeypot field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="gb-name"
                  className="block font-pixel text-xs font-bold text-[var(--ink)] mb-0.5"
                >
                  Nama Petualang:
                </label>
                <input
                  id="gb-name"
                  type="text"
                  name="name"
                  required
                  maxLength={40}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama / Panggilanmu"
                  className={`w-full ${isCompact ? 'p-1.5 text-xs' : 'p-2 text-xs lg:text-sm'} bg-[var(--cream)] border-2 border-[var(--ink)] font-body focus:outline-none focus:ring-2 focus:ring-[var(--sunset)]`}
                />
              </div>

              <div>
                <label
                  htmlFor="gb-message"
                  className="block font-pixel text-xs font-bold text-[var(--ink)] mb-0.5"
                >
                  Pesan ({formData.message.length}/500):
                </label>
                <textarea
                  id="gb-message"
                  name="message"
                  required
                  rows={isCompact ? 2 : 3}
                  maxLength={500}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tinggalkan pesan di papan..."
                  className={`w-full ${isCompact ? 'p-1.5 text-xs' : 'p-2 text-xs lg:text-sm'} bg-[var(--cream)] border-2 border-[var(--ink)] font-body focus:outline-none focus:ring-2 focus:ring-[var(--sunset)] resize-none`}
                />
              </div>

              <div className="pt-0.5">
                <PixelButton
                  type="submit"
                  variant="primary"
                  size={isCompact ? "sm" : "md"}
                  disabled={submitting}
                  className="w-full"
                >
                  {submitting ? 'MENYEMATKAN...' : 'TEMPEL DI PAPAN \u2192'}
                </PixelButton>
              </div>

              <p className="text-[10px] font-pixel text-[var(--ink)]/60 text-center">
                Moderasi aktif &bull; Anti-spam rate limit 3 pesan/jam
              </p>
            </form>
          </div>

          {/* Right Column: Sticky Notes Board (Paginated on Desktop) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between border-b-2 border-[var(--ink)]/20 pb-1">
              <span className="font-pixel text-xs font-bold text-[var(--moss-dark)] uppercase">
                Pesan yang Tersemat ({entries.length})
              </span>
              <button
                type="button"
                onClick={fetchEntries}
                className="font-pixel text-[11px] text-[var(--sunset)] hover:underline cursor-pointer"
              >
                Segarkan ↻
              </button>
            </div>

            {loading ? (
              <div className="p-6 text-center font-pixel text-xs text-[var(--ink)]/70">
                Memuat tempelan pesan...
              </div>
            ) : entries.length === 0 ? (
              <div className="border-2 border-dashed border-[var(--ink)]/40 p-5 text-center bg-[#FFFDF7]">
                <p className="font-pixel text-xs text-[var(--ink)]/70">
                  Belum ada pesan yang disetujui. Jadilah petualang pertama yang menempelkan pesan!
                </p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompact ? 'gap-2' : 'gap-2.5'}`}>
                {pagination.currentItems.map((entry) => (
                  <div
                    key={entry.id}
                    data-page-item-id={entry.id}
                    className="relative border-2 border-[var(--ink)] bg-[#FFFDF7] p-2.5 shadow-[2px_2px_0_var(--ink)] flex flex-col justify-between"
                  >
                    {/* Retro sticky tape simulation */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-[var(--cream)] border border-[var(--ink)]/40 opacity-80" />

                    <p className="font-body text-xs text-[var(--ink)] leading-relaxed mb-2 mt-0.5 break-words line-clamp-3">
                      "{entry.message}"
                    </p>

                    <div className="border-t border-[var(--ink)]/15 pt-1.5 flex items-center justify-between font-pixel text-[10px] text-[var(--moss-dark)]">
                      <span className="font-bold truncate max-w-[120px]">
                        ~ {entry.name}
                      </span>
                      <span className="text-[var(--ink)]/60">
                        {entry.created_at ? entry.created_at.split('T')[0] : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default GuestbookSection;
