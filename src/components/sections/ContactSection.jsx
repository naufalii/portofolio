import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { PixelButton } from '../ui/PixelButton';
import { Toast } from '../ui/Toast';
import { submitContact } from '../../lib/api';
import { profile } from '../../content/profile';

/**
 * ContactSection - Kotak Pos (Hubungi Saya)
 * Implements Section 5 & 9:
 * - Contact form with Pydantic-compatible constraints
 * - Hidden honeypot field 'website'
 * - Mailbox & envelope slide-in animation on success
 * - Toast notification feedback
 */
export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '', // Honeypot field
  });

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setToast({
        message: 'Mohon isi semua field nama, email, dan pesan.',
        type: 'error',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await submitContact(formData);
      setIsSuccess(true);
      setToast({
        message: res.message || 'Pesan berhasil dikirim ke kotak pos!',
        type: 'success',
      });
      setFormData({ name: '', email: '', message: '', website: '' });

      // Reset letter animation after 4 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 4000);
    } catch (err) {
      setToast({
        message: err.message || 'Gagal mengirim pesan. Silakan coba kembali.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Panel title="KOTAK POS (HUBUNGI SAYA)" variant="default">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="md:col-span-8 space-y-4">
            <p className="text-xs sm:text-sm text-[var(--ink)]/80 leading-relaxed">
              Ingin mendiskusikan peluang internship System Administrator / Oracle DBA, kolaborasi teknis, atau sekadar bertukar wawasan? Tuliskan suratmu di bawah ini:
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              {/* Honeypot anti-spam field (hidden from real users) */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-pixel text-xs font-bold text-[var(--ink)] mb-1 uppercase"
                >
                  Nama Petualang / Pengirim:
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  required
                  maxLength={40}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: HR / Lead Engineer"
                  className="w-full p-2.5 bg-[var(--cloud)] border-2 border-[var(--ink)] font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sunset)]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-pixel text-xs font-bold text-[var(--ink)] mb-1 uppercase"
                >
                  Alamat Email:
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@perusahaan.com"
                  className="w-full p-2.5 bg-[var(--cloud)] border-2 border-[var(--ink)] font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sunset)]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-pixel text-xs font-bold text-[var(--ink)] mb-1 uppercase"
                >
                  Isi Surat / Pesan ({formData.message.length}/500):
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  maxLength={500}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tuliskan pesanmu di sini..."
                  className="w-full p-2.5 bg-[var(--cloud)] border-2 border-[var(--ink)] font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--sunset)] resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <PixelButton
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                >
                  {loading ? 'MEMASUKKAN SURAT...' : 'KIRIM SURAT &rarr;'}
                </PixelButton>

                <span className="text-[10px] font-pixel text-[var(--ink)]/60">
                  Rate limit: 3 surat/jam
                </span>
              </div>
            </form>
          </div>

          {/* Right Column: Interactive Pixel Mailbox Illustration */}
          <div className="md:col-span-4 border-2 border-[var(--ink)] bg-[#FFFDF7] p-4 shadow-[3px_3px_0_var(--ink)] flex flex-col items-center justify-center text-center">
            <div className="font-pixel text-xs font-bold text-[var(--sunset)] mb-3 uppercase">
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
                <div className="w-12 h-8 bg-[var(--cream)] border-2 border-[var(--ink)] shadow-[2px_2px_0_var(--ink)] flex items-center justify-center font-pixel text-[10px] text-[var(--sunset)] font-bold">
                  ✉️ POS
                </div>
              </div>

              {/* Pixel Mailbox */}
              <svg
                width="80"
                height="80"
                viewBox="0 0 32 32"
                className="pixelated drop-shadow-[3px_3px_0_var(--ink)]"
                shapeRendering="crispEdges"
              >
                {/* Post */}
                <rect x="14" y="18" width="4" height="14" fill="var(--ink)" />
                {/* Mailbox Body */}
                <rect x="7" y="6" width="18" height="14" fill="var(--moss)" />
                <rect x="7" y="6" width="18" height="4" fill="var(--moss-dark)" />
                {/* Mail Slot */}
                <rect x="10" y="11" width="12" height="2" fill="var(--ink)" />
                {/* Flag */}
                <rect
                  x="23"
                  y={isSuccess ? "4" : "10"}
                  width="2"
                  height="7"
                  fill="var(--sunset)"
                />
                <rect
                  x="21"
                  y={isSuccess ? "4" : "10"}
                  width="4"
                  height="3"
                  fill="var(--sunset)"
                />
              </svg>
            </div>

            <p className="text-xs font-pixel text-[var(--ink)] mt-2">
              {isSuccess
                ? 'Surat telah masuk ke dalam kotak pos!'
                : 'Kotak pos siap menerima pesanmu.'}
            </p>

            <div className="mt-4 pt-3 border-t border-[var(--ink)]/20 w-full space-y-2">
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

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />
    </div>
  );
}

export default ContactSection;
