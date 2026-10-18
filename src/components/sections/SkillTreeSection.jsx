import React, { useState } from 'react';
import { Panel } from '../ui/Panel';
import { profile } from '../../content/profile';

/**
 * SkillTreeSection - 3-Branch Interactive Skill Tree (Section 5 & Mobile Fix Fase 6)
 * - Horizontal tabs for 3 branches (Database, SysAdmin, Web Dev)
 * - Clear skill name on top, 12px height progress bar below, percentage on right
 * - Accordion detail per skill node on mobile (no huge clunky blocks)
 */
export function SkillTreeSection() {
  const [activeBranch, setActiveBranch] = useState('database');
  const [expandedSkill, setExpandedSkill] = useState(null);

  const branches = [
    {
      id: 'database',
      title: 'Database',
      fullTitle: 'DATABASE & ORACLE DBA',
      icon: '🗄️',
      skills: profile.skillTree.database,
    },
    {
      id: 'sysAdmin',
      title: 'SysAdmin',
      fullTitle: 'LINUX SYSADMIN & JARINGAN',
      icon: '🐧',
      skills: profile.skillTree.sysAdmin,
    },
    {
      id: 'webDev',
      title: 'Web Dev',
      fullTitle: 'WEB & DEVOPS DASAR',
      icon: '🌐',
      skills: profile.skillTree.webDev,
    },
  ];

  const currentBranchData =
    branches.find((b) => b.id === activeBranch) || branches[0];

  const handleTabChange = (branchId) => {
    setActiveBranch(branchId);
    setExpandedSkill(null);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <Panel title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)" icon="⚡" variant="default">
        <p className="text-xs sm:text-sm text-[var(--ink)]/80 mb-3.5 leading-relaxed">
          Keahlian teknis Naufal Ali Hilmi yang dipetakan ke 3 cabang kemampuan. Ketuk simpul skill untuk melihat cakupan kompetensi praktikum.
        </p>

        {/* Horizontal Tabs for 3 Branches (Fase 6) */}
        <div className="grid grid-cols-3 gap-2 border-b-2 border-[#24160B]/20 pb-3 mb-4 select-none">
          {branches.map((branch) => {
            const isActive = activeBranch === branch.id;
            return (
              <button
                key={branch.id}
                type="button"
                onClick={() => handleTabChange(branch.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 py-2 min-h-[44px] font-pixel text-xs sm:text-sm border-2 border-[#24160B] transition-all cursor-pointer ${
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

        {/* Branch Title Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-pixel text-xs sm:text-sm font-bold text-[#3B5E34] uppercase tracking-wide">
            {currentBranchData.fullTitle}
          </span>
          <span className="text-[11px] font-pixel text-[#24160B]/60">
            {currentBranchData.skills.length} Simpul Keahlian
          </span>
        </div>

        {/* Skill Nodes List */}
        <div className="space-y-2.5">
          {currentBranchData.skills.map((skill, index) => {
            const isExpanded = expandedSkill === skill.name;
            return (
              <div
                key={index}
                className="border-2 border-[#24160B] bg-[#FFFDF8] shadow-[2px_2px_0_#24160B] overflow-hidden"
              >
                {/* Tappable Header: Name on top, 12px bar below, percentage on right (Fase 6) */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedSkill(isExpanded ? null : skill.name)
                  }
                  className="w-full text-left p-3 flex flex-col gap-1.5 cursor-pointer min-h-[52px] active:bg-[#F6EBD3]/60"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-xs sm:text-sm font-bold text-[#24160B]">
                      {skill.name}
                    </span>
                    <span className="font-pixel text-xs font-bold text-[#E8793A]">
                      {skill.level}%
                    </span>
                  </div>

                  {/* 12px Pixel Progress Bar */}
                  <div className="w-full h-3 bg-[#F6EBD3] border border-[#24160B] p-[1px] overflow-hidden">
                    <div
                      className="h-full bg-[#5E8B4A] transition-all duration-300"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </button>

                {/* Expandable Competency Details (Fase 6) */}
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
      </Panel>
    </div>
  );
}

export default SkillTreeSection;
