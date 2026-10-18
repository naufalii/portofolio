import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';
import { DialogBox } from '../components/ui/DialogBox';
import { profile } from '../content/profile';

export function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between border-4 border-[var(--ink)] bg-[var(--cream)] p-4 shadow-[4px_4px_0_var(--ink)]">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[var(--moss)] border-2 border-[var(--ink)]" />
          <span className="font-pixel text-lg sm:text-xl font-bold tracking-wider">
            {profile.nama}
          </span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-4 font-pixel text-sm sm:text-base">
          <Link to="/cv">
            <PixelButton variant="secondary" size="sm">
              MODE CV
            </PixelButton>
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl mx-auto my-8 space-y-8">
        {/* Hero RPG Dialog Preview */}
        <DialogBox
          speaker={profile.nama}
          speakerRole={profile.target}
          showBlinker={false}
          actions={
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/cv">
                <PixelButton variant="primary" size="md">
                  Lihat Mode CV
                </PixelButton>
              </Link>
              <a
                href={profile.sosial.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="neutral" size="md">
                  GitHub
                </PixelButton>
              </a>
              <a
                href={profile.sosial.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="neutral" size="md">
                  LinkedIn
                </PixelButton>
              </a>
            </div>
          }
        >
          <p className="font-medium">
            Selamat datang di dunia petualangan portofolio saya. Halaman ini sedang dibangun sesuai arsitektur Overworld Ghibli x Pixel Art.
          </p>
          <p className="mt-2 text-sm text-[var(--ink)]/80">
            {profile.kampus} &bull; Target: {profile.target}
          </p>
        </DialogBox>

        {/* Status Panel */}
        <Panel title="STATUS PROYEK OVERWORLD" variant="default">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[var(--ink)]/20 pb-2">
              <span className="font-pixel text-sm">FASE 1: FONDASI</span>
              <span className="font-pixel text-xs px-2 py-1 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                AKTIF
              </span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed">
              Fondasi teknis (Vite + React 18.3 + Tailwind v4 + Design Tokens + FastAPI backend) berhasil dikonfigurasi. Siap melanjutkan ke Fase 2: Peta Dunia, Parallax Canvas, dan Siklus Siang-Malam.
            </p>
          </div>
        </Panel>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center border-t-2 border-[var(--ink)]/20 pt-4 text-xs font-pixel text-[var(--ink)]/70">
        &copy; {new Date().getFullYear()} {profile.nama} &bull; Overworld Portfolio (Ghibli &times; Pixel Art)
      </footer>
    </div>
  );
}

export default HomePage;
