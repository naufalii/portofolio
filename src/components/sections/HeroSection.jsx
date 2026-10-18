import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../ui/PixelButton';
import { Panel } from '../ui/Panel';
import { DialogBox } from '../ui/DialogBox';
import { profile } from '../../content/profile';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * HeroSection - Desa Awal (Starting Village)
 * Metaphor: Mascot + RPG dialogue box with typewriter effect (30ms/char),
 * skip on click/tap, and clear action buttons.
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
    }, 30); // 30ms/char per Section 5

    return () => clearInterval(interval);
  }, [dialogIndex, currentFullText, reducedMotion]);

  const handleAdvanceDialog = () => {
    // If currently typing, skip immediately to full text
    if (isTyping) {
      setDisplayedText(currentFullText);
      setIsTyping(false);
      return;
    }

    // Otherwise advance to next dialog line
    if (dialogIndex < profile.bio_dialog.length - 1) {
      setDialogIndex((prev) => prev + 1);
    } else {
      setDialogIndex(0);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* RPG Dialogue Box */}
      <DialogBox
        speaker={profile.nama}
        speakerRole={profile.target}
        showBlinker={!isTyping}
        onNext={handleAdvanceDialog}
        actions={
          <div className="flex flex-wrap items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <PixelButton
              variant="primary"
              size="md"
              onClick={onStartExplore}
              aria-label="Mulai jelajahi quest log"
            >
              Mulai Jelajah &rarr;
            </PixelButton>

            <Link to="/cv">
              <PixelButton variant="secondary" size="md" title="Buka ringkasan CV linear untuk recruiter">
                Mode CV (Format Dokumen)
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
        }
      >
        <div className="min-h-[58px] select-text">
          <p className="font-medium text-base sm:text-lg leading-relaxed text-[#24160B]">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#E8793A] animate-pulse" />
            )}
          </p>
        </div>
      </DialogBox>

      {/* Starting Village Info Board */}
      <Panel title="PAPAN GERBANG DESA AWAL" variant="default">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm leading-relaxed text-[#24160B]">
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-[#24160B]/20 pb-3 md:pb-0 md:pr-4">
            <div className="font-pixel text-sm font-bold text-[#E8793A]">
              PROFIL PETUALANG
            </div>
            <p>
              <strong>Nama:</strong> {profile.nama}
            </p>
            <p>
              <strong>Institusi:</strong> {profile.kampus}
            </p>
            <p>
              <strong>Target Karir:</strong> {profile.target}
            </p>
            <p className="text-[11px] text-[#24160B]/70 pt-1">
              *Klik kotak dialog di atas untuk membaca baris percakapan berikutnya (tekan untuk lewati efek ketik).
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-pixel text-sm font-bold text-[#3B5E34]">
              PANDUAN EKSPLORASI
            </div>
            <p>
              Kamu berada di <strong>Desa Awal</strong>. Pilih lokasi di navigasi peta untuk menjelajahi:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs">
              <li><strong>Quest Log:</strong> Laporan praktikum administrasi Oracle Database & web solver.</li>
              <li><strong>Skill Tree:</strong> 3 cabang pohon keahlian (Database Oracle, Linux SysAdmin, Web).</li>
              <li><strong>Guild Hall:</strong> Rekam jejak organisasi BEM FIKTI & UGPreneurs.</li>
              <li><strong>Kotak Pos & Papan Pesan:</strong> Kirim surat kontak langsung atau tempel pesan di buku tamu.</li>
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default HeroSection;
