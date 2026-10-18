import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--sky-night)] text-[var(--cream)] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Panel title="404: AREA TIDAK DITEMUKAN" variant="dark" className="text-center">
          <div className="py-6 space-y-4">
            <div className="font-pixel text-5xl sm:text-6xl text-[var(--sunset)] tracking-widest animate-pulse">
              404
            </div>
            <p className="font-pixel text-base sm:text-lg">
              Kamu tersesat di luar batas peta Overworld!
            </p>
            <p className="text-xs sm:text-sm text-[var(--cream)]/70 font-body">
              Jalur yang kamu tuju tidak ada atau belum dijelajahi oleh petualang mana pun.
            </p>
            <div className="pt-4">
              <Link to="/">
                <PixelButton variant="primary" size="md">
                  KEMBALI KE DESA AWAL
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
