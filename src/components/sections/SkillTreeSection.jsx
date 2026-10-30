import React, { useState, useEffect } from 'react';
import { Panel } from '../ui/Panel';
import { PaginationControls } from '../ui/PaginationControls';
import { profile } from '../../content/profile';
import { useDeviceType } from '../../hooks/useMediaQuery';
import { useSectionPagination } from '../../hooks/useSectionPagination';

/**
 * SkillTreeSection - 3-Branch Interactive Skill Tree
 * Follows Bagian 1, 2, 3 of Desktop Pagination Specification:
 * - Desktop: Paginated skill nodes on the left column, reactive inspector on the right
 * - Zero vertical overflow, zero internal scrolls, greedy item packing
 * - Mobile: Unaltered 3 horizontal tabs + accordions with progress bars
 */
export function SkillTreeSection({ isMobile: isMobileProp, isDesktop: isDesktopProp, isCompact = false }) {
  const { isMobile: isMobileDevice } = useDeviceType();
  const isMobile = isMobileProp !== undefined ? isMobileProp : isMobileDevice;
  const isDesktop = isDesktopProp !== undefined ? isDesktopProp : !isMobile;

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

  // Desktop items for pagination in active branch
  const branchSkillItems = currentBranchData.skills.map((s) => ({
    id: s.name,
    ...s,
    estimatedHeight: isCompact ? 40 : 48,
  }));

  const pagination = useSectionPagination(branchSkillItems, isDesktop, {
    sectionKey: `skills-${activeBranch}`,
    reservedHeight: isCompact ? 100 : 120,
    minItemHeight: 38,
  });

  // Ensure selectedSkill stays in sync when branch or page changes
  useEffect(() => {
    if (pagination.currentItems && pagination.currentItems.length > 0) {
      const exists = pagination.currentItems.some(
        (it) => it.name === selectedSkill?.name
      );
      if (!exists) {
        setSelectedSkill(pagination.currentItems[0]);
      }
    }
  }, [pagination.currentPage, pagination.currentItems, activeBranch]);

  const handleBranchSelect = (branch) => {
    setActiveBranch(branch.id);
    setSelectedSkill(branch.skills[0] || null);
    setExpandedSkill(null);
  };

  return (
    <div className="space-y-2 max-w-5xl mx-auto" ref={pagination.containerRef}>
      <Panel
        title="SKILL TREE (AKADEMI KEAHLIAN TEKNIS)"
        icon="⚡"
        variant="default"
        isCompact={isCompact}
      >
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
                      className="w-full text-left p-3 flex items-center justify-between gap-2 cursor-pointer min-h-[48px] active:bg-[#F6EBD3]/60"
                      aria-expanded={isExpanded}
                    >
                      <span className="font-pixel text-xs sm:text-sm font-bold text-[#24160B]">
                        {skill.name}
                      </span>
                      <span className="font-pixel text-[10px] sm:text-xs font-bold text-[#3B5E34] bg-[#F6EBD3] px-2 py-0.5 border border-[#24160B]/40 flex-shrink-0">
                        {skill.proof}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#24160B]/15 bg-[#F6EBD3]/30 text-xs font-body text-[#24160B] leading-relaxed">
                        <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                          LINGKUP KOMPETENSI TEKNIS:
                        </div>
                        <p>{skill.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2 border-t border-[#24160B]/15 text-[11px] font-pixel text-[#24160B]/60 text-center">
              *Label bukti merujuk pada proyek, pengalaman organisasi, atau sertifikat terverifikasi tanpa angka klaim buatan.
            </div>
          </>
        ) : (
          /* Desktop View: Branch Selector + 12-Column Grid (Paginated Nodes + Inspector) */
          <>
            <div className={`flex flex-wrap ${isCompact ? 'gap-1.5 pb-2 mb-2' : 'gap-2 border-b-2 border-[#24160B]/20 pb-2.5 mb-3.5'} select-none`}>
              {branches.map((branch) => {
                const isActive = activeBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleBranchSelect(branch)}
                    className={`flex items-center gap-1.5 ${isCompact ? 'px-2 py-0.5 min-h-[30px] text-xs' : 'px-3 py-1.5 min-h-[40px] text-xs lg:text-sm'} border-2 border-[#24160B] transition-all cursor-pointer select-none ${
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

            <div className={`grid grid-cols-1 lg:grid-cols-12 ${isCompact ? 'gap-3' : 'gap-5'} items-start`}>
              {/* Left Column: Interactive Skill Nodes (Paginated) */}
              <div className={`lg:col-span-7 ${isCompact ? 'space-y-1.5' : 'space-y-2'}`}>
                <div className="flex items-center justify-between border-b border-[#24160B]/15 pb-1">
                  <span className="font-pixel text-xs font-bold text-[#3B5E34] uppercase">
                    Simpul Keahlian: {currentBranchData.fullTitle}
                  </span>
                  <span className="font-pixel text-[10px] text-[#24160B]/60">
                    Total: {currentBranchData.skills.length} Simpul
                  </span>
                </div>

                <div className="space-y-1.5">
                  {pagination.currentItems.map((skill) => {
                    const isSelected = selectedSkill?.name === skill.name;
                    return (
                      <button
                        key={skill.name}
                        data-page-item-id={skill.name}
                        type="button"
                        onClick={() => setSelectedSkill(skill)}
                        onMouseEnter={() => setSelectedSkill(skill)}
                        className={`w-full text-left ${isCompact ? 'p-1.5' : 'p-2.5'} border-2 border-[#24160B] transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#F6EBD3] shadow-[2px_2px_0_#24160B] border-l-6 border-l-[#E8793A]'
                            : 'bg-[#FFFDF8] hover:bg-[#F6EBD3]/60 shadow-[1px_1px_0_#24160B]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-pixel text-xs lg:text-sm font-bold text-[#24160B] truncate">
                            {skill.name}
                          </span>
                          <span className="font-pixel text-[10px] font-bold text-[#3B5E34] bg-[#FFFDF8] px-1.5 py-0.2 border border-[#24160B]/30 shadow-[1px_1px_0_#24160B] flex-shrink-0">
                            {skill.proof}
                          </span>
                        </div>

                        <p className="text-[11px] font-body text-[#24160B]/75 line-clamp-1">
                          {skill.detail}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Skill Detail Inspector Parchment */}
              <div className={`lg:col-span-5 border-2 border-[#24160B] bg-[#FFFDF8] ${isCompact ? 'p-2.5 shadow-[2px_2px_0_#24160B]' : 'p-4 shadow-[3px_3px_0_#24160B]'}`}>
                <div className="font-pixel text-xs font-bold text-[#E8793A] uppercase tracking-wider pb-1 border-b border-[#24160B]/20 mb-2">
                  RINCIAN INSPEKSI SIMPUL
                </div>

                {selectedSkill ? (
                  <div className="space-y-2 font-body text-xs">
                    <div>
                      <h4 className={`font-pixel ${isCompact ? 'text-xs lg:text-sm' : 'text-base'} font-bold text-[#24160B]`}>
                        {selectedSkill.name}
                      </h4>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#5E8B4A] text-white border border-[#24160B]">
                          BUKTI: {selectedSkill.proof}
                        </span>
                        {selectedSkill.source && (
                          <span className="font-pixel text-[10px] px-1.5 py-0.5 bg-[#F6EBD3] text-[#24160B] border border-[#24160B]/40">
                            SUMBER: {selectedSkill.source}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-[#24160B]/15 pt-2">
                      <div className="font-pixel text-[11px] text-[#3B5E34] font-bold mb-0.5">
                        LINGKUP KOMPETENSI:
                      </div>
                      <p className="font-body text-xs text-[#24160B] leading-relaxed line-clamp-3">
                        {selectedSkill.detail}
                      </p>
                    </div>

                    <div className={`bg-[#F6EBD3] ${isCompact ? 'p-1 text-[10px] mt-1' : 'p-2 text-[11px] mt-2'} border border-[#24160B]/30 font-pixel text-[#24160B]/80`}>
                      *Penilaian kompetensi murni berbasis bukti lab & praktikum akademik.
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-body text-[#24160B]/70">
                    Pilih simpul keahlian untuk membaca detail kompetensi.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </Panel>

      {/* Pagination Controls toolbar (Desktop only, totalPages > 1) */}
      {isDesktop && (
        <PaginationControls
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPrev={pagination.prevPage}
          onNext={pagination.nextPage}
          sectionTitle={`Skill Tree (${currentBranchData.fullTitle})`}
        />
      )}
    </div>
  );
}

export default SkillTreeSection;
