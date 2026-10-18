import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * SkillTreeSection - 3-Branch Interactive Skill Tree (Section 5)
 * Branches: Database (Oracle), SysAdmin (Linux), and Web Dev.
 * Interactive nodes with hover/tap inspection and pixel level bars.
 */
export function SkillTreeSection() {
  const [activeBranch, setActiveBranch] = useState('database');
  const [selectedSkill, setSelectedSkill] = useState(
    profile.skillTree.database[0] || null
  );

  const branches = [
    {
      id: 'database',
      title: 'DATABASE & ORACLE DBA',
      icon: '🗄️',
      color: 'var(--sunset)',
      skills: profile.skillTree.database,
    },
    {
      id: 'sysAdmin',
      title: 'LINUX SYSADMIN & JARINGAN',
      icon: '🐧',
      color: 'var(--moss-dark)',
      skills: profile.skillTree.sysAdmin,
    },
    {
      id: 'webDev',
      title: 'WEB & DEVOPS DASAR',
      icon: '🌐',
      color: 'var(--ink)',
      skills: profile.skillTree.webDev,
    },
  ];

  const currentBranchData =
    branches.find((b) => b.id === activeBranch) || branches[0];

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)" variant="default">
        <p className="text-xs sm:text-sm text-[var(--ink)]/80 mb-4">
          Visualisasi keahlian Naufal Ali Hilmi yang dipetakan ke dalam 3 cabang pohon kemampuan. Klik atau hover pada simpul skill untuk melihat rincian kompetensi teknis.
        </p>

        {/* Branch Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b-2 border-[var(--ink)]/20 pb-3 mb-4">
          {branches.map((branch) => {
            const isActive = activeBranch === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => {
                  setActiveBranch(branch.id);
                  setSelectedSkill(branch.skills[0]);
                }}
                className={`flex items-center gap-2 px-3 py-2 font-pixel text-xs sm:text-sm border-2 border-[var(--ink)] transition-all cursor-pointer select-none min-h-[44px] ${
                  isActive
                    ? 'bg-[var(--moss)] text-[var(--cloud)] shadow-[2px_2px_0_var(--ink)] -translate-y-0.5 font-bold'
                    : 'bg-[var(--cloud)] text-[var(--ink)] hover:bg-[var(--cream)] shadow-[1px_1px_0_var(--ink)]'
                }`}
                aria-selected={isActive}
              >
                <span>{branch.icon}</span>
                <span>{branch.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tree Display & Detail Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left / Top: Interactive Nodes */}
          <div className="md:col-span-7 space-y-3">
            <div className="font-pixel text-xs font-bold text-[var(--moss-dark)] uppercase">
              Simpul Keahlian: {currentBranchData.title}
            </div>

            <div className="space-y-2.5">
              {currentBranchData.skills.map((skill, index) => {
                const isSelected = selectedSkill?.name === skill.name;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSkill(skill)}
                    onMouseEnter={() => setSelectedSkill(skill)}
                    className={`w-full text-left p-3 border-2 border-[var(--ink)] transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[var(--cream)] shadow-[3px_3px_0_var(--ink)] border-l-8 border-l-[var(--sunset)]'
                        : 'bg-[var(--cloud)] hover:bg-[var(--cream)]/60 shadow-[1px_1px_0_var(--ink)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-pixel text-sm font-bold text-[var(--ink)]">
                        {skill.name}
                      </span>
                      <span className="font-pixel text-xs font-bold text-[var(--moss-dark)] bg-[var(--cream)] px-1.5 py-0.5 border border-[var(--ink)]/30">
                        LVL {skill.level}%
                      </span>
                    </div>

                    {/* Pixel Progress Bar */}
                    <div className="w-full h-3 bg-[var(--cloud)] border border-[var(--ink)] p-0.5 overflow-hidden">
                      <div
                        className="h-full bg-[var(--moss)] transition-all duration-300"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right / Bottom: Skill Detail Inspector Parchment */}
          <div className="md:col-span-5 border-2 border-[var(--ink)] bg-[#FFFDF7] p-5 shadow-[4px_4px_0_var(--ink)]">
            <div className="font-pixel text-xs font-bold text-[var(--sunset)] uppercase tracking-wider pb-1 border-b border-[var(--ink)]/20 mb-3">
              RINCIAN INSPEKSI SIMPUL
            </div>

            {selectedSkill ? (
              <div className="space-y-3">
                <div>
                  <h4 className="font-pixel text-lg font-bold text-[var(--ink)]">
                    {selectedSkill.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-pixel text-xs px-2 py-0.5 bg-[var(--moss)] text-[var(--cloud)] border border-[var(--ink)]">
                      KEMAMPUAN: {selectedSkill.level}%
                    </span>
                  </div>
                </div>

                <div className="border-t border-[var(--ink)]/15 pt-3">
                  <div className="font-pixel text-xs text-[var(--moss-dark)] font-bold mb-1">
                    LINGKUP KOMPETENSI:
                  </div>
                  <p className="font-body text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
                    {selectedSkill.detail}
                  </p>
                </div>

                <div className="bg-[var(--cream)] p-2.5 border border-[var(--ink)]/30 text-[11px] font-pixel text-[var(--ink)]/80 mt-4">
                  *Tingkat keahlian dinilai secara jujur berdasarkan hasil lab dan praktikum akademik tanpa angka buatan.
                </div>
              </div>
            ) : (
              <p className="text-xs font-body text-[var(--ink)]/70">
                Pilih atau arahkan kursor ke salah satu simpul untuk membaca detail.
              </p>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}

export default SkillTreeSection;
