import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * SkillTreeSection - 3-Branch Interactive Skill Tree
 * - Desktop: 12-column grid with interactive nodes on left, inspector parchment on right (identik c383241)
 * - Mobile: 3 horizontal tabs + accordions with 12px progress bar (identik mobile-current)
 */
export function SkillTreeSection({ isMobile = false }) {
  const [activeBranch, setActiveBranch] = useState('database');
  const [selectedSkill, setSelectedSkill] = useState(
    profile.skillTree.database[0] || null
  );
  const [expandedSkill, setExpandedSkill] = useState(null);

  const branches = [
    {
      id: 'database',
      title: isMobile ? 'Database' : 'DATABASE & ORACLE DBA',
      fullTitle: 'DATABASE & ORACLE DBA',
      icon: '🗄️',
      skills: profile.skillTree.database,
    },
    {
      id: 'sysAdmin',
      title: isMobile ? 'SysAdmin' : 'LINUX SYSADMIN & JARINGAN',
      fullTitle: 'LINUX SYSADMIN & JARINGAN',
      icon: '🐧',
      skills: profile.skillTree.sysAdmin,
    },
    {
      id: 'webDev',
      title: isMobile ? 'Web Dev' : 'WEB & DEVOPS DASAR',
      fullTitle: 'WEB & DEVOPS DASAR',
      icon: '🌐',
      skills: profile.skillTree.webDev,
    },
  ];

  const currentBranchData =
    branches.find((b) => b.id === activeBranch) || branches[0];

  const handleBranchSelect = (branch) => {
    setActiveBranch(branch.id);
    setSelectedSkill(branch.skills[0] || null);
    setExpandedSkill(null);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)" icon="⚡" variant="default">
        <p className="text-xs lg:text-sm text-[#24160B]/80 mb-4 leading-relaxed">
          {isMobile
            ? 'Keahlian teknis Naufal Ali Hilmi yang dipetakan ke 3 cabang kemampuan. Ketuk simpul skill untuk melihat cakupan kompetensi praktikum.'
            : 'Visualisasi keahlian Naufal Ali Hilmi yang dipetakan ke dalam 3 cabang pohon kemampuan. Klik atau hover pada simpul skill untuk melihat rincian kompetensi teknis.'}
        </p>

        {isMobile ? (
          /* Mobile View (Fase 6): 3 Tabs + Accordion per Node */
          <>
            <div className="grid grid-cols-3 gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">
              {branches.map((branch) => {
                const isActive = activeBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleBranchSelect(branch)}
                    className={`flex flex-col items-center justify-center gap-1 px-2 py-2 min-h-[44px] font-pixel text-xs border-2 border-[#24160B] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5E8B4A] text-white shadow-[2px_2px_0_#24160B] -translate-y-0.5 font-bold'
                        : 'bg-[#FFFDF8] text-[#24160B] hover:bg-[#F6EBD3]'
                    }`}
                    aria-selected={isActive}
                  >
                    <span className="text-base leading-none">{branch.icon}</span>
                    <span className="truncate">{branch.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs font-bold text-[#3B5E34] uppercase tracking-wide">
                {currentBranchData.fullTitle}
              </span>
              <span className="text-[11px] font-pixel text-[#24160B]/60">
                {currentBranchData.skills.length} Simpul Keahlian
              </span>
            </div>

            <div className="space-y-2.5">
              {currentBranchData.skills.map((skill, index) => {
                const isExpanded = expandedSkill === skill.name;
                return (
                  <div
                    key={index}
                    className="border-2 border-[#24160B] bg-[#FFFDF8] shadow-[2px_2px_0_#24160B] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSkill(isExpanded ? null : skill.name)
                      }
                      className="w-full text-left p-3 flex flex-col gap-1.5 cursor-pointer min-h-[52px] active:bg-[#F6EBD3]/60"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-pixel text-xs font-bold text-[#24160B]">
                          {skill.name}
                        </span>
                        <span className="font-pixel text-xs font-bold text-[#E8793A]">
                          {skill.level}%
                        </span>
                      </div>

                      <div className="w-full h-3 bg-[#F6EBD3] border border-[#24160B] p-[1px] overflow-hidden">
                        <div
                          className="h-full bg-[#5E8B4A] transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#24160B]/15 bg-[#F6EBD3]/30 text-xs font-body text-[#24160B] leading-relaxed">
                        <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                          LINGKUP KOMPETENSI PRAKTIKUM:
                        </div>
                        <p>{skill.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-[#24160B]/15 text-[11px] font-pixel text-[#24160B]/60 text-center">
              *Tingkat keahlian dinilai jujur berdasarkan praktikum dan administrasi lab mandiri.
            </div>
          </>
        ) : (
          /* Desktop View (Identik c383241): Branch Selector + 12-Column Grid (Nodes + Parchment) */
          <>
            <div className="flex flex-wrap gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">
              {branches.map((branch) => {
                const isActive = activeBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleBranchSelect(branch)}
                    className={`flex items-center gap-2 px-3 py-2 font-pixel text-xs lg:text-sm border-2 border-[#24160B] transition-all cursor-pointer select-none min-h-[44px] ${
                      isActive
                        ? 'bg-[#5E8B4A] text-white shadow-[2px_2px_0_#24160B] -translate-y-0.5 font-bold'
                        : 'bg-[#FFFDF8] text-[#24160B] hover:bg-[#F6EBD3] shadow-[1px_1px_0_#24160B]'
                    }`}
                    aria-selected={isActive}
                  >
                    <span>{branch.icon}</span>
                    <span>{branch.fullTitle}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Top: Interactive Nodes */}
              <div className="lg:col-span-7 space-y-3">
                <div className="font-pixel text-xs font-bold text-[#3B5E34] uppercase">
                  Simpul Keahlian: {currentBranchData.fullTitle}
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
                        className={`w-full text-left p-3 border-2 border-[#24160B] transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#F6EBD3] shadow-[3px_3px_0_#24160B] border-l-8 border-l-[#E8793A]'
                            : 'bg-[#FFFDF8] hover:bg-[#F6EBD3]/60 shadow-[1px_1px_0_#24160B]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-pixel text-sm font-bold text-[#24160B]">
                            {skill.name}
                          </span>
                          <span className="font-pixel text-xs font-bold text-[#3B5E34] bg-[#FFFDF8] px-1.5 py-0.5 border border-[#24160B]/30">
                            LVL {skill.level}%
                          </span>
                        </div>

                        {/* Pixel Progress Bar */}
                        <div className="w-full h-3 bg-[#FFFDF8] border border-[#24160B] p-0.5 overflow-hidden">
                          <div
                            className="h-full bg-[#5E8B4A] transition-all duration-300"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right / Bottom: Skill Detail Inspector Parchment */}
              <div className="lg:col-span-5 border-2 border-[#24160B] bg-[#FFFDF8] p-5 shadow-[4px_4px_0_#24160B]">
                <div className="font-pixel text-xs font-bold text-[#E8793A] uppercase tracking-wider pb-1 border-b border-[#24160B]/20 mb-3">
                  RINCIAN INSPEKSI SIMPUL
                </div>

                {selectedSkill ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-pixel text-lg font-bold text-[#24160B]">
                        {selectedSkill.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-pixel text-xs px-2 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B]">
                          KEMAMPUAN: {selectedSkill.level}%
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-[#24160B]/15 pt-3">
                      <div className="font-pixel text-xs text-[#3B5E34] font-bold mb-1">
                        LINGKUP KOMPETENSI:
                      </div>
                      <p className="font-body text-xs lg:text-sm text-[#24160B] leading-relaxed">
                        {selectedSkill.detail}
                      </p>
                    </div>

                    <div className="bg-[#F6EBD3] p-2.5 border border-[#24160B]/30 text-[11px] font-pixel text-[#24160B]/80 mt-4">
                      *Tingkat keahlian dinilai secara jujur berdasarkan hasil lab dan praktikum akademik tanpa angka buatan.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-body text-[#24160B]/70">
                    Pilih atau arahkan kursor ke salah satu simpul untuk membaca detail.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}

export default SkillTreeSection;
