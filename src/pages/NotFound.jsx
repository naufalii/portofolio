import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';
import { Sprite } from '../components/world/Sprite';

/**
 * NotFoundPage - 8-bit 404 Game Page (Section 6 & 12)
 * The player mascot is lost outside the boundaries of the overworld map.
 */
export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--sky-night)] text-[var(--cream)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Panel title="404: AREA TIDAK DITEMUKAN" variant="dark" className="text-center">
          <div className="py-6 space-y-5 flex flex-col items-center">
            {/* Mascot Sprite wandering in the dark */}
            <Sprite animation="walk" scale={2.5} />

            <div className="font-pixel text-5xl sm:text-6xl text-[var(--sunset)] tracking-widest animate-pulse">
              404
            </div>

            <p className="font-pixel text-base sm:text-lg text-[var(--cream)]">
              Kamu tersesat di luar batas peta Overworld!
            </p>

            <p className="text-xs sm:text-sm text-[var(--cream)]/75 font-body leading-relaxed max-w-xs">
              Jalur yang kamu tuju belum dipetakan oleh pengelana mana pun, atau koordinatnya telah berpindah tempat.
            </p>

            <div className="pt-3">
              <Link to="/">
                <PixelButton variant="primary" size="md">
                  KEMBALI KE DESA AWAL &rarr;
                </PixelButton>
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default NotFoundPage;
