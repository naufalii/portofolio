import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Sprite component following Section 7.3:
 * - 32x32 base dimensions
 * - Animations: idle (4 frames), walk (6 frames), wave (4 frames)
 * - Easing: steps(n)
 * - Renders PLACEHOLDER_SPRITE until final custom spritesheet is supplied.
 *
 * @param {'idle' | 'walk' | 'wave'} animation
 * @param {string} src - Path to PNG spritesheet
 * @param {number} scale - Multiplier (default 2 -> 64x64px)
 * @param {boolean} flip - Flip horizontally
 */
export function Sprite({
  animation = 'idle',
  src = null,
  scale = 2,
  flip = false,
  className = '',
}) {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);

  const frameCounts = {
    idle: 4,
    walk: 6,
    wave: 4,
  };

  const animFps = {
    idle: 4,
    walk: 8,
    wave: 6,
  };

  const maxFrames = frameCounts[animation] || 4;
  const fps = animFps[animation] || 4;

  useEffect(() => {
    if (reducedMotion) {
      setFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % maxFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [animation, maxFrames, fps, reducedMotion]);

  const size = 32 * scale;

  // If real spritesheet PNG is provided
  if (src) {
    return (
      <div
        className={`pixelated inline-block overflow-hidden relative ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          transform: flip ? 'scaleX(-1)' : 'none',
        }}
        role="img"
        aria-label={`Sprite maskot animasi ${animation}`}
      >
        <img
          src={src}
          alt={`Maskot ${animation}`}
          className="pixelated absolute max-w-none"
          style={{
            transform: `translateX(-${frame * size}px)`,
            height: `${size}px`,
          }}
        />
      </div>
    );
  }

  // PLACEHOLDER_SPRITE - 32x32 Procedural Pixel Character using Ghibli tokens
  // Frame-dependent procedural offsets for authentic retro step animation
  const bobY = animation === 'idle' ? (frame % 2 === 0 ? 0 : 1) : 0;
  const legOffset =
    animation === 'walk'
      ? frame % 2 === 0
        ? -2
        : 2
      : 0;
  const armWaveY = animation === 'wave' ? (frame % 2 === 0 ? -3 : 0) : 0;

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size + 14}px`,
        transform: flip ? 'scaleX(-1)' : 'none',
      }}
      role="img"
      aria-label={`Placeholder Sprite maskot animasi ${animation}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        className="pixelated overflow-visible"
        shapeRendering="crispEdges"
      >
        {/* Shadow */}
        <ellipse
          cx="16"
          cy="30"
          rx="8"
          ry="2"
          fill="var(--ink)"
          opacity="0.3"
        />

        {/* Legs / Boots (Walk animation shifts legs) */}
        <rect
          x={11 + (animation === 'walk' ? legOffset : 0)}
          y="24"
          width="4"
          height="5"
          fill="var(--ink)"
        />
        <rect
          x={17 - (animation === 'walk' ? legOffset : 0)}
          y="24"
          width="4"
          height="5"
          fill="var(--ink)"
        />

        {/* Torso & Coat (Moss Green) */}
        <g transform={`translate(0, ${bobY})`}>
          <rect x="10" y="14" width="12" height="10" fill="var(--moss)" />
          {/* Belt */}
          <rect x="10" y="21" width="12" height="2" fill="var(--ink)" />
          <rect x="15" y="21" width="2" height="2" fill="var(--sunset)" />

          {/* Left Arm */}
          <rect
            x="7"
            y={15 + (animation === 'walk' ? -legOffset : 0)}
            width="3"
            height="7"
            fill="var(--moss-dark)"
          />

          {/* Right Arm (Waving or Walking) */}
          <rect
            x="22"
            y={15 + armWaveY + (animation === 'walk' ? legOffset : 0)}
            width="3"
            height="7"
            fill="var(--moss-dark)"
          />
          {animation === 'wave' && (
            <rect
              x="22"
              y={12 + armWaveY}
              width="3"
              height="3"
              fill="var(--cream)"
            />
          )}

          {/* Backpack (Sunset orange) */}
          <rect x="6" y="15" width="2" height="7" fill="var(--sunset)" />

          {/* Head & Face (Cream) */}
          <rect x="11" y="7" width="10" height="7" fill="var(--cream)" />

          {/* Eyes (Ink) */}
          <rect x="14" y="9" width="1.5" height="2" fill="var(--ink)" />
          <rect x="18" y="9" width="1.5" height="2" fill="var(--ink)" />

          {/* Cheeks / Blush */}
          <rect x="13" y="11" width="1.5" height="1" fill="var(--sunset)" opacity="0.6" />
          <rect x="18.5" y="11" width="1.5" height="1" fill="var(--sunset)" opacity="0.6" />

          {/* Hair & Adventurer Cap */}
          <rect x="10" y="4" width="12" height="4" fill="var(--ink)" />
          <rect x="9" y="6" width="14" height="2" fill="var(--sunset)" />
          {/* Cap Visor */}
          <rect x="15" y="6" width="7" height="2" fill="var(--ink)" />
        </g>
      </svg>

      {/* Visual Badge required by Section 7.3 */}
      <span className="mt-1 text-[8px] font-pixel text-[var(--ink)] bg-[var(--cream)] border border-[var(--ink)] px-1 shadow-[1px_1px_0_var(--ink)] whitespace-nowrap">
        PLACEHOLDER_SPRITE
      </span>
    </div>
  );
}

export default Sprite;
