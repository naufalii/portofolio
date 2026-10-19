import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../ui/PixelButton';
import { Panel } from '../ui/Panel';
import { DialogBox } from '../ui/DialogBox';
import { profile } from '../../content/profile';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * HeroSection - Desa Awal (Starting Village)
 * Implements Mobile Fix Fase 2:
 * - Single-line name header
 * - Full-width 48px CTA buttons with 12px spacing
 * - Mode CV button with subtext "Tampilan halaman biasa"
 * - 2-column grid for GitHub and LinkedIn on >=360px
 * - Interactive LANJUT button with arrow icon
 */
export function HeroSection({ onStartExplore }) {
  const reducedMotion = useReducedMotion();
  const [dialogIndex, setDialogIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentFullText = profile.bio_dialog[dialogIndex] || '';

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(currentFullText);
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let charIndex = 0;

    const interval = setInterval(() => {
      charIndex++;
      setDisplayedText(currentFullText.slice(0, charIndex));

      if (charIndex >= currentFullText.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [dialogIndex, currentFullText, reducedMotion]);

  const handleAdvanceDialog = () => {
    if (isTyping) {
      setDisplayedText(currentFullText);
      setIsTyping(false);
      return;
    }

    if (dialogIndex < profile.bio_dialog.length - 1) {
      setDialogIndex((prev) => prev + 1);
    } else {
      setDialogIndex(0);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* RPG Dialogue Box */}
      <DialogBox
        speaker={profile.nama}
        speakerRole={profile.target}
        showBlinker={!isTyping}
        onNext={handleAdvanceDialog}
        actions={
          <div
            className="w-full lg:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Desktop (>=1024px): Exact c383241 PixelButtons */}
            <div className="hidden lg:flex items-center gap-2 pt-1">
              <PixelButton
                variant="primary"
                size="md"
                onClick={onStartExplore}
                aria-label="Mulai jelajahi quest log"
              >
                Mulai Jelajah &rarr;
              </PixelButton>

              <Link to="/cv">
                <PixelButton
                  variant="secondary"
                  size="md"
                  aria-label="Mode CV"
                  title="Buka ringkasan CV linear untuk recruiter"
                >
                  Mode CV &rarr;
                </PixelButton>
              </Link>

              <a
                href={profile.sosial.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="neutral" size="sm">
                  GitHub &rarr;
                </PixelButton>
              </a>

              <a
                href={profile.sosial.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="neutral" size="sm">
                  LinkedIn &rarr;
                </PixelButton>
              </a>
            </div>

            {/* Mobile (<1024px): Exact mobile-current layout */}
            <div className="flex flex-col gap-2.5 w-full lg:hidden pt-1">
              <button
                type="button"
                onClick={onStartExplore}
                className="w-full flex items-center justify-center min-h-[48px] px-4 py-2 border-3 border-[#24160B] bg-[#5E8B4A] text-white font-alt-pixel text-sm font-bold tracking-wider shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer whitespace-nowrap"
                aria-label="Mulai jelajahi quest log"
              >
                Mulai Jelajah &rarr;
              </button>

              <Link to="/cv" className="w-full block">
                <button
                  type="button"
                  aria-label="Mode CV"
                  className="w-full flex flex-col items-center justify-center min-h-[48px] px-4 py-1.5 border-3 border-[#24160B] bg-[#E8793A] text-white font-alt-pixel shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer text-center whitespace-nowrap"
                >
                  <span className="text-sm font-bold leading-tight tracking-wider">
                    Mode CV
                  </span>
                  <span className="text-[11px] font-body text-white/90 leading-none">
                    Tampilan halaman biasa (dokumen linear)
                  </span>
                </button>
              </Link>

              <div className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href={profile.sosial.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-center min-h-[48px] px-3 py-2 border-3 border-[#24160B] bg-[#FFFDF8] text-[#24160B] font-pixel text-xs font-bold shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-[#F6EBD3] whitespace-nowrap"
                  >
                    GitHub &rarr;
                  </button>
                </a>

                <a
                  href={profile.sosial.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-center min-h-[48px] px-3 py-2 border-3 border-[#24160B] bg-[#FFFDF8] text-[#24160B] font-pixel text-xs font-bold shadow-[3px_3px_0_#24160B] active:translate-y-[1px] active:shadow-none cursor-pointer hover:bg-[#F6EBD3] whitespace-nowrap"
                  >
                    LinkedIn &rarr;
                  </button>
                </a>
              </div>
            </div>
          </div>
        }
      >
        <div className="select-text">
          <p className="font-medium text-base lg:text-lg leading-relaxed text-[#24160B]">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#E8793A] animate-pulse" />
            )}
          </p>
        </div>
      </DialogBox>

      {/* Starting Village Info Board */}
      <Panel title="PAPAN GERBANG DESA AWAL" variant="default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs lg:text-sm leading-relaxed text-[#24160B]">
          <div className="space-y-1.5 border-b lg:border-b-0 lg:border-r border-[#24160B]/20 pb-3 lg:pb-0 lg:pr-4">
            <div className="font-pixel text-sm font-bold text-[#E8793A]">
              PROFIL PETUALANG
            </div>
            <p>
              <strong>Nama:</strong> {profile.nama}
            </p>
            <p>
              <strong>Institusi:</strong> {profile.kampus}
            </p>
            <p className="hidden lg:block">
              <strong>Fokus Karir:</strong> {profile.target}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="font-pixel text-sm font-bold text-[#3B5E34]">
              PANDUAN EKSPLORASI
            </div>
            <p>
              <span className="hidden lg:inline">Gunakan peta navigasi di atas</span>
              <span className="lg:hidden">Gunakan peta navigasi di bawah</span> untuk menjelajahi seluruh area:
            </p>
            <p className="hidden lg:block text-xs font-bold text-[#24160B]">
              Klik bangunan di peta atau tekan &larr; &rarr;
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Quest Log:</strong> Lab Oracle 19c Data Guard & Portofolio Overworld.</li>
              <li><strong>Skill Tree:</strong> 3 cabang keahlian (Database, SysAdmin, Web Dev).</li>
              <li><strong>Guild Hall:</strong> Organisasi BEM FIKTI, UGPreneurs, GDGoC & Piagam.</li>
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default HeroSection;
