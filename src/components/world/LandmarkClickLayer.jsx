import React, { useState, useEffect, useRef } from 'react';
import { getLandmarkPositions } from '../../lib/landmarks';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * LandmarkClickLayer - Interactive HTML click layer for Overworld Landmarks
 * Implements Section 3, 4, 5 of Seru #2:
 * - HTML <button> elements overlaying canvas at z-10 (under mascot z-20 and panel z-20)
 * - Click targets >= 44x44px with 8px padding
 * - tabindex="-1" and aria-hidden="true" to preserve accessibility tree & tab order
 * - Disabled (pointer-events: none) while mascot is traveling
 * - Active state: 2px ink/cream border with "Kamu di sini" badge (NO green)
 * - Hover state: 2px sunset border with 2px lift and "Landmark: <Name> ↗" badge
 * - Desktop only (>=1024px): returns null on mobile
 */
export function LandmarkClickLayer({
  activeLocation = 'hero',
  isTraveling = false,
  onSelectLandmark,
  isMobile = false,
}) {
  const reducedMotion = useReducedMotion();
  const [positions, setPositions] = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isMobile) return;

    const updatePositions = () => {
      const canvasEl = document.querySelector('canvas');
      const pos = getLandmarkPositions(canvasEl);
      setPositions(pos);
    };

    updatePositions();
    const tId = setTimeout(updatePositions, 100);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(updatePositions);
    }

    window.addEventListener('resize', updatePositions);
    window.addEventListener('orientationchange', updatePositions);

    let observer = null;
    const stageEl = document.querySelector('[data-landmark-stage]') ||
      document.querySelector('.will-change-transform')?.parentElement;
    const navEl = document.querySelector('header nav');

    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(updatePositions);
      if (stageEl) observer.observe(stageEl);
      if (navEl) observer.observe(navEl);
    }

    return () => {
      clearTimeout(tId);
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('orientationchange', updatePositions);
      if (observer) observer.disconnect();
    };
  }, [isMobile]);

  if (isMobile || positions.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {positions.map((pos) => {
        const isActive = activeLocation === pos.id;
        const isHovered = hoveredId === pos.id;

        // Exact 4px padding surrounding the landmark image on all sides
        const imgW = Math.round(pos.width * pos.scaleX);
        const imgH = Math.round(pos.height * pos.scaleY);
        const boxWidth = imgW + 8; // 4px padding left & right
        const boxHeight = imgH + 8; // 4px padding top & bottom

        // Position: centered at tabCenterX, bottom at pos.screenY + 4px (enclosing ground & shadow)
        const left = Math.round(pos.screenX - boxWidth / 2);
        const top = Math.round(pos.screenY - imgH - 4);

        return (
          <button
            key={pos.id}
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            data-landmark-btn={pos.id}
            disabled={isTraveling}
            onClick={() => {
              if (isTraveling || isActive) return;
              if (onSelectLandmark) {
                onSelectLandmark(pos.id, 'landmark');
              }
            }}
            onMouseEnter={() => {
              if (!isTraveling) setHoveredId(pos.id);
            }}
            onMouseLeave={() => setHoveredId(null)}
            className={`absolute flex flex-col items-center justify-start group cursor-pointer transition-transform ${
              isTraveling
                ? 'pointer-events-none'
                : 'pointer-events-auto'
            } ${
              !reducedMotion && isHovered && !isActive
                ? '-translate-y-0.5'
                : ''
            }`}
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${boxWidth}px`,
              height: `${boxHeight}px`,
            }}
          >
            {/* Visual Outline Box */}
            <div
              className={`w-full h-full border-2 transition-colors ${
                isActive
                  ? 'border-[#24160B] bg-[#FFFDF8]/20 shadow-[0_0_0_2px_#FFFDF8]'
                  : isHovered
                  ? 'border-[#E8793A] bg-[#E8793A]/10 shadow-[0_0_0_2px_#24160B]'
                  : 'border-transparent'
              }`}
            />

            {/* Badge for Active state ("Kamu di sini") */}
            {isActive && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FFFDF8] text-[#24160B] border-2 border-[#24160B] px-2 py-0.5 font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] pointer-events-none z-20 animate-none flex items-center gap-1.5"
              >
                <span className="w-2 h-2 bg-[#24160B] border border-[#FFFDF8] inline-block shadow-[1px_1px_0_#24160B]" />
                <span>Kamu di sini</span>
              </div>
            )}

            {/* Tooltip Badge for Hover state ("Landmark: <Name> ↗") */}
            {!isActive && isHovered && !isTraveling && (
              <div
                className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#FFFDF8] text-[#24160B] border-2 border-[#24160B] px-2 py-0.5 font-pixel text-xs font-bold shadow-[2px_2px_0_#24160B] pointer-events-none z-20 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 bg-[#E8793A] border border-[#24160B] inline-block shadow-[1px_1px_0_#24160B]" />
                <span>Landmark: {pos.name} ↗</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default LandmarkClickLayer;
