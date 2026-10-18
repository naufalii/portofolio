import React from 'react';
import { Link } from 'react-router-dom';
import { PixelButton } from '../components/ui/PixelButton';
import { Panel } from '../components/ui/Panel';
import { profile } from '../content/profile';

export function CVPage() {
  return (
    <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)] p-4 sm:p-8 font-body">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <PixelButton variant="neutral" size="sm">
              &larr; KEMBALI KE OVERWORLD
            </PixelButton>
          </Link>
          <a href={profile.cv_pdf} download="CV_Naufal_Ali_Hilmi.pdf">
            <PixelButton variant="secondary" size="sm">
              UNDUH CV (PDF)
            </PixelButton>
          </a>
        </div>

        {/* CV Header Panel */}
        <Panel variant="parchment" className="space-y-3">
          <div className="border-b-2 border-[var(--ink)]/20 pb-4">
            <h1 className="font-pixel text-2xl sm:text-3xl font-bold tracking-wide">
              {profile.nama}
            </h1>
            <p className="font-pixel text-sm sm:text-base text-[var(--moss-dark)] mt-1">
              {profile.target}
            </p>
            <p className="text-sm text-[var(--ink)]/80 mt-1">
              {profile.kampus}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2 text-sm">
            <a
              href={profile.sosial.github}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[var(--sunset)] hover:underline"
            >
              GitHub: {profile.sosial.github}
            </a>
            <a
              href={profile.sosial.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-pixel text-[var(--sunset)] hover:underline"
            >
              LinkedIn: {profile.sosial.linkedin}
            </a>
          </div>
        </Panel>

        {/* Content Preview */}
        <Panel title="RINGKASAN & TARGET KARIR" variant="default">
          <p className="text-base leading-relaxed">
            Mahasiswa Sistem Informasi Universitas Gunadarma dengan minat mendalam dan spesialisasi teknis dalam Database Administration (Oracle Architecture, SQL/PL*SQL, RMAN) serta Linux System Administration.
          </p>
        </Panel>

        <Panel title="PROYEK UNGGULAN" variant="default">
          <div className="space-y-4">
            {profile.quests.map((quest) => (
              <div key={quest.id} className="border-b border-[var(--ink)]/15 pb-3 last:border-b-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-pixel text-lg font-bold">{quest.judul}</h3>
                  <span className="text-xs font-pixel px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)]">
                    {quest.status}
                  </span>
                </div>
                <p className="text-sm mt-1">{quest.ringkasan}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {quest.stack.map((stk, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-[var(--ink)]/10 font-pixel">
                      {stk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default CVPage;
