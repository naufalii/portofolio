import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * Sprite - Enhanced 48x48 Pixel Mascot Character (Section 2 Revision)
 * Upgraded features:
 * - 48x48 high-detail base resolution with 3-tier shading (highlight, midtone, shadow)
 * - Unique signature items: Flowing adventurer scarf, leather satchel bag, feathered traveler cap
 * - Multi-frame animations with steps():
 *    - Idle breathing bob (body & chest)
 *    - Natural eye blinking
 *    - Scarf & hair flutter
 *    - Full walking stride with swinging arms, legs, and trailing scarf
 *    - Friendly wave animation on hover / action
 *    - Soft pixel drop-shadow under feet
 * - Removed all random debug badges/IDs (Fixes Bug 1.c)
 */
export function Sprite({
  animation = 'idle',
  src = null,
  scale = 2,
  flip = false,
  className = '',
  onWave,
}) {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const activeAnimation = isHovered ? 'wave' : animation;

  // Frame counts
  const frameCounts = {
    idle: 6,
    walk: 8,
    wave: 6,
  };

  const animFps = {
    idle: 5,
    walk: 9,
    wave: 6,
  };

  const maxFrames = frameCounts[activeAnimation] || 6;
  const fps = animFps[activeAnimation] || 5;

  // Main animation frame stepper
  useEffect(() => {
    if (reducedMotion) {
      setFrame(0);
      return;
    }

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % maxFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [activeAnimation, maxFrames, fps, reducedMotion]);

  // Periodic eye blinking timer
  useEffect(() => {
    if (reducedMotion) return;

    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [reducedMotion]);

  const baseSize = 48;
  const pixelSize = baseSize * scale;

  // External spritesheet fallback
  if (src) {
    return (
      <div
        className={`pixelated inline-block overflow-hidden relative ${className}`}
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          transform: flip ? 'scaleX(-1)' : 'none',
        }}
        role="img"
        aria-label={`Sprite maskot animasi ${activeAnimation}`}
      >
        <img
          src={src}
          alt={`Maskot ${activeAnimation}`}
          className="pixelated absolute max-w-none"
          style={{
            transform: `translateX(-${frame * pixelSize}px)`,
            height: `${pixelSize}px`,
          }}
        />
      </div>
    );
  }

  /* -------------------------------------------------------------
   * PROCEDURAL 48x48 HIGH-DETAIL PIXEL MASCOT
   * 3-tier shading palette:
   * Cream (Face/Skin): #FFFDF8, #F6EBD3, #E8D9B8
   * Moss (Coat): #7AA763 (light), #5E8B4A (mid), #3B5E34 (dark)
   * Scarf & Cap (Sunset): #F59762 (light), #E8793A (mid), #B5501B (dark)
   * Ink (Boots/Outline): #24160B
   * ------------------------------------------------------------- */

  // Idle breathing offsets
  const isIdle = activeAnimation === 'idle';
  const isWalking = activeAnimation === 'walk';
  const isWaving = activeAnimation === 'wave';

  const bodyBobY = isIdle ? (frame % 2 === 0 ? 0 : 1) : 0;
  const chestExpansion = isIdle && (frame === 2 || frame === 3) ? 1 : 0;

  // Walking offsets
  const legSwing = isWalking
    ? frame === 0 || frame === 4
      ? 0
      : frame < 4
      ? -3
      : 3
    : 0;

  const bodyWalkBob = isWalking ? (frame % 2 === 0 ? -1 : 1) : 0;

  // Scarf flutter offset
  const scarfTrailX = isWalking
    ? frame % 2 === 0
      ? -4
      : -2
    : isIdle
    ? (frame % 3) - 1
    : 0;

  // Arm positions
  const armWaveY = isWaving ? (frame % 2 === 0 ? -6 : -2) : 0;
  const armWaveX = isWaving ? (frame % 2 === 0 ? 2 : 0) : 0;

  return (
    <div
      className={`relative inline-flex flex-col items-center select-none cursor-pointer transition-transform duration-100 ${className}`}
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        transform: flip ? 'scaleX(-1)' : 'none',
      }}
      role="img"
      aria-label="Maskot Petualang Naufal (Oracle DBA & SysAdmin)"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onWave}
      title="Klik atau hover untuk berinteraksi dengan maskot petualang!"
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 48 48"
        className="pixelated overflow-visible"
        shapeRendering="crispEdges"
      >
        {/* 1. SOFT PIXEL DROP SHADOW */}
        <ellipse
          cx="24"
          cy="45"
          rx={isWalking ? '9' : '11'}
          ry="3"
          fill="#24160B"
          opacity="0.35"
        />

        {/* 2. LEGS & BOOTS (with 3-tier shading and walking strides) */}
        <g transform={`translate(0, ${bodyWalkBob})`}>
          {/* Left Leg & Boot */}
          <g transform={`translate(${legSwing}, 0)`}>
            {/* Trouser Cuff (Dark Moss) */}
            <rect x="17" y="36" width="4" height="3" fill="#3B5E34" />
            {/* Leather Boot Body */}
            <rect x="16" y="39" width="6" height="5" fill="#24160B" />
            {/* Boot Highlight */}
            <rect x="17" y="39" width="3" height="1" fill="#5A3A22" />
            {/* Boot Sole */}
            <rect x="15" y="43" width="7" height="2" fill="#150C06" />
          </g>

          {/* Right Leg & Boot */}
          <g transform={`translate(${-legSwing}, 0)`}>
            {/* Trouser Cuff */}
            <rect x="27" y="36" width="4" height="3" fill="#3B5E34" />
            {/* Leather Boot Body */}
            <rect x="26" y="39" width="6" height="5" fill="#24160B" />
            {/* Boot Highlight */}
            <rect x="27" y="39" width="3" height="1" fill="#5A3A22" />
            {/* Boot Sole */}
            <rect x="26" y="43" width="7" height="2" fill="#150C06" />
          </g>
        </g>

        {/* 3. UPPER BODY & CLOTHING (Bobs during breathing & walking) */}
        <g transform={`translate(0, ${bodyBobY + bodyWalkBob})`}>
          {/* Satchel Bag (Left Side - Leather Brown with Brass Buckle) */}
          <rect x="11" y="27" width="5" height="7" fill="#5A3A22" />
          <rect x="12" y="28" width="3" height="5" fill="#754E30" />
          <rect x="13" y="30" width="2" height="2" fill="#E8B03A" />
          {/* Satchel Strap across chest */}
          <path
            d="M 14 26 L 31 19 L 33 21 L 16 28 Z"
            fill="#3A2213"
            opacity="0.85"
          />

          {/* Coat / Tunic (3-tier Shading: #3B5E34 shadow, #5E8B4A mid, #7AA763 light) */}
          <rect
            x={16 - chestExpansion}
            y="21"
            width={16 + chestExpansion * 2}
            height="16"
            fill="#5E8B4A"
          />
          {/* Coat Shadow (bottom & sides) */}
          <rect x="16" y="34" width="16" height="3" fill="#3B5E34" />
          <rect x="16" y="21" width="2" height="15" fill="#3B5E34" />
          {/* Coat Center Highlight Placket */}
          <rect x="23" y="21" width="2" height="14" fill="#7AA763" />
          {/* Leather Belt */}
          <rect x="16" y="32" width="16" height="3" fill="#24160B" />
          <rect x="22" y="31" width="4" height="4" fill="#E8B03A" />
          <rect x="23" y="32" width="2" height="2" fill="#24160B" />

          {/* Left Arm (Behind satchel) */}
          <g transform={`translate(0, ${isWalking ? -legSwing : 0})`}>
            <rect x="13" y="22" width="4" height="11" fill="#3B5E34" />
            <rect x="13" y="32" width="4" height="3" fill="#F6EBD3" />
          </g>

          {/* 4. HEAD, FACE & ADVENTURER HAT */}
          {/* Head & Neck */}
          <rect x="18" y="11" width="12" height="11" fill="#F6EBD3" />
          {/* Face Shadow (Chinstrap / Jawline) */}
          <rect x="18" y="20" width="12" height="2" fill="#E8D9B8" />

          {/* Cheeks / Blush */}
          <rect x="19" y="17" width="2" height="1.5" fill="#E8793A" opacity="0.65" />
          <rect x="27" y="17" width="2" height="1.5" fill="#E8793A" opacity="0.65" />

          {/* Eyes (Blinking mechanic) */}
          {isBlinking ? (
            // Closed eyes line
            <>
              <rect x="20" y="15" width="3" height="1" fill="#24160B" />
              <rect x="25" y="15" width="3" height="1" fill="#24160B" />
            </>
          ) : (
            // Expressive retro eyes with white highlight pixel
            <>
              <rect x="20" y="14" width="3" height="3" fill="#24160B" />
              <rect x="20" y="14" width="1" height="1" fill="#FFFFFF" />
              <rect x="25" y="14" width="3" height="3" fill="#24160B" />
              <rect x="25" y="14" width="1" height="1" fill="#FFFFFF" />
            </>
          )}

          {/* Friendly Smile */}
          <rect x="23" y="18" width="2" height="1" fill="#24160B" />

          {/* 5. FLOWING ADVENTURER SCARF (Signature Accessory) */}
          {/* Neck wrap */}
          <rect x="16" y="19" width="16" height="4" fill="#E8793A" />
          <rect x="17" y="20" width="14" height="2" fill="#F59762" />
          <rect x="16" y="22" width="16" height="1" fill="#B5501B" />
          {/* Trailing Tail of Scarf (Flutters behind on right) */}
          <g transform={`translate(${scarfTrailX}, 0)`}>
            <rect x="29" y="21" width="7" height="3" fill="#E8793A" />
            <rect x="33" y="23" width="5" height="4" fill="#E8793A" />
            <rect x="35" y="26" width="4" height="4" fill="#B5501B" />
            {/* Scarf Fringe */}
            <rect x="36" y="29" width="1" height="2" fill="#F59762" />
            <rect x="38" y="29" width="1" height="2" fill="#F59762" />
          </g>

          {/* 6. TRAVELER'S CAP (Structured Adventurer Cap with Feather) */}
          {/* Hair fringe */}
          <rect x="17" y="10" width="14" height="3" fill="#3A2213" />
          {/* Cap Brim */}
          <rect x="14" y="9" width="20" height="3" fill="#24160B" />
          {/* Cap Crown (3-tier Shading) */}
          <rect x="16" y="4" width="16" height="6" fill="#E8793A" />
          <rect x="18" y="4" width="12" height="2" fill="#F59762" />
          <rect x="16" y="8" width="16" height="2" fill="#B5501B" />
          {/* Small Adventurer Feather / Quill */}
          <polygon
            points="14,2 17,6 15,7 13,4"
            fill="#FFFDF8"
          />
          <polygon
            points="15,4 17,6 16,7"
            fill="#8FC6E8"
          />

          {/* 7. RIGHT ARM (Waving on hover, or walking swing) */}
          {isWaving ? (
            <g transform={`translate(${armWaveX}, ${armWaveY})`}>
              {/* Upper Arm raised */}
              <rect x="30" y="15" width="4" height="6" fill="#5E8B4A" />
              {/* Forearm angled up */}
              <rect x="32" y="10" width="4" height="6" fill="#7AA763" />
              {/* Open waving hand */}
              <rect x="32" y="6" width="5" height="5" fill="#F6EBD3" />
              <rect x="36" y="7" width="2" height="3" fill="#F6EBD3" />
            </g>
          ) : (
            <g transform={`translate(0, ${isWalking ? legSwing : 0})`}>
              <rect x="31" y="22" width="4" height="11" fill="#5E8B4A" />
              <rect x="31" y="32" width="4" height="3" fill="#F6EBD3" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

export default Sprite;
