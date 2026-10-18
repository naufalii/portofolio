import React, { useState, useEffect } from 'react';

/**
 * PixelCursor - Custom retro pixel pointer for desktop devices only.
 * Implements Section 6 & 8:
 * - Only active when window matches (pointer: fine)
 * - Changes appearance when hovering buttons, links, and inputs
 * - Fully hides on touch devices
 */
export function PixelCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Check if device has fine pointer (desktop mouse)
    const mql = window.matchMedia('(pointer: fine)');
    setIsFinePointer(mql.matches);

    const updatePointerMode = (e) => {
      setIsFinePointer(e.matches);
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', updatePointerMode);
    } else {
      mql.addListener(updatePointerMode);
    }

    if (!mql.matches) return;

    // Apply cursor: none to body while fine pointer is active
    document.body.classList.add('custom-pixel-cursor');

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);

      // Check if target or parent is clickable
      const target = e.target;
      const isClickable =
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.cursor-pointer');

      setIsPointer(Boolean(isClickable));
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.body.classList.remove('custom-pixel-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (mql.removeEventListener) {
        mql.removeEventListener('change', updatePointerMode);
      } else {
        mql.removeListener(updatePointerMode);
      }
    };
  }, []);

  if (!isFinePointer || !isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isPointer ? 'scale(1.15) translate(-2px, -2px)' : 'scale(1)',
      }}
      aria-hidden="true"
    >
      {isPointer ? (
        // Retro Pixel Gauntlet / Pointing Finger
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="pixelated drop-shadow-[2px_2px_0_var(--ink)]"
          shapeRendering="crispEdges"
        >
          {/* Glove outline */}
          <rect x="7" y="1" width="4" height="12" fill="var(--ink)" />
          <rect x="5" y="7" width="8" height="13" fill="var(--ink)" />
          {/* Glove body */}
          <rect x="8" y="2" width="2" height="10" fill="var(--sunset)" />
          <rect x="6" y="8" width="6" height="11" fill="var(--cream)" />
          <rect x="6" y="15" width="6" height="4" fill="var(--sunset)" />
        </svg>
      ) : (
        // Retro Pixel Arrow
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          className="pixelated drop-shadow-[2px_2px_0_var(--ink)]"
          shapeRendering="crispEdges"
        >
          <path
            d="M 1 1 L 1 15 L 5 11 L 9 17 L 11 16 L 7 10 L 12 10 Z"
            fill="var(--cream)"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </div>
  );
}

export default PixelCursor;
