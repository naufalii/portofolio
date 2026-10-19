import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TIME_PHASES } from '../../hooks/useTimeOfDay';
import { getLandmarkPositions, drawLandmarkPixelArt } from '../../lib/landmarks';

/**
 * WorldCanvas - High-Fidelity 2D Pixel-Perfect Overworld Canvas
 * Implements Section 3 & 7 of PLAN.md & Mobile Fix Fase 9:
 * - Proper canvas boundary clipping (fixes top-left white block artifact)
 * - Cloud wrapping and safe Y offset below sticky header
 * - Mobile 3-layer parallax optimization
 * - Mobile particle count capped at 12
 * - Rich ambient life and section landmarks with 0.8 opacity
 */
export function WorldCanvas({
  phase = TIME_PHASES.DAY,
  cameraX = 0,
  isMobile = false,
  className = '',
}) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 4
    ) {
      setIsLowPower(true);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = 360;
    const H = 200;
    canvas.width = W;
    canvas.height = H;

    const SKY_COLORS = {
      dawn: {
        top: '#82589F',
        bottom: '#F2A66B',
        farHills: '#63476E',
        midHills: '#4A5B3D',
        foreHills: '#5E8B4A',
        light: 0.85,
      },
      day: {
        top: '#4A90E2',
        bottom: '#8FC6E8',
        farHills: '#476E4B',
        midHills: '#3B5E34',
        foreHills: '#5E8B4A',
        light: 1.0,
      },
      dusk: {
        top: '#3D234C',
        bottom: '#E8793A',
        farHills: '#4D3145',
        midHills: '#443A36',
        foreHills: '#4F4E34',
        light: 0.7,
      },
      night: {
        top: '#080E1E',
        bottom: '#18243C',
        farHills: '#141D2B',
        midHills: '#1C2E25',
        foreHills: '#253B2D',
        light: 0.45,
      },
    };

    const birds = [
      { x: 40, y: 45, speed: 0.45, wingFrame: 0 },
      { x: 55, y: 40, speed: 0.45, wingFrame: 1 },
      { x: 70, y: 48, speed: 0.45, wingFrame: 2 },
    ];

    const butterflies = [
      { x: 90, y: 145, baseOriginY: 145, phase: 0, color: '#E8B03A' },
      { x: 210, y: 150, baseOriginY: 150, phase: 2, color: '#FFFDF8' },
      { x: 310, y: 142, baseOriginY: 142, phase: 4, color: '#E8793A' },
    ];

    // Mobile: max 12 particles per Fase 9
    const maxParticles = isLowPower ? 0 : isMobile ? 12 : 28;
    const particles = Array.from({ length: maxParticles }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speedX: 0.2 + Math.random() * 0.4,
      speedY: 0.1 + (Math.random() - 0.3) * 0.2,
      size: Math.random() > 0.6 ? 2 : 1,
      opacity: 0.4 + Math.random() * 0.6,
      timer: Math.random() * Math.PI * 2,
    }));

    const stars = Array.from({ length: isMobile ? 25 : 45 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H * 0.65),
      size: Math.random() > 0.8 ? 2 : 1,
      flicker: Math.random() * Math.PI * 2,
    }));

    // Clouds positioned safely below top header (y >= 40)
    const clouds = [
      { x: 30, y: 42, width: 64, height: 16, speed: 0.05 },
      { x: 170, y: 38, width: 80, height: 20, speed: 0.035 },
      { x: 300, y: 48, width: 52, height: 14, speed: 0.045 },
    ];

    let animationFrameId;
    let isTabVisible = true;
    let isIntersecting = true;
    let lastTime = performance.now();
    let swayFrame = 0;
    let swayTimer = 0;
    let creatureTimer = 0;

    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) lastTime = performance.now();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) lastTime = performance.now();
    });
    observer.observe(canvas);

    const render = (currentTime) => {
      if (!isTabVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      swayTimer += deltaTime;
      if (swayTimer > 0.35) {
        swayFrame = (swayFrame + 1) % 3;
        swayTimer = 0;
      }

      creatureTimer += deltaTime;

      const currentSky = SKY_COLORS[phase] || SKY_COLORS.day;

      // Safe Clipping Boundary to prevent any render artifacts
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.clip();

      /* -------------------------------------------------------------
       * LAYER 1: SKY GRADIENT
       * ------------------------------------------------------------- */
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, currentSky.top);
      skyGrad.addColorStop(1, currentSky.bottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      /* -------------------------------------------------------------
       * LAYER 2: STARS & CLOUDS
       * ------------------------------------------------------------- */
      if (phase === TIME_PHASES.NIGHT || phase === TIME_PHASES.DUSK) {
        stars.forEach((star) => {
          star.flicker += reducedMotion ? 0 : 0.06;
          const alpha =
            phase === TIME_PHASES.NIGHT
              ? 0.5 + Math.sin(star.flicker) * 0.5
              : 0.2 + Math.sin(star.flicker) * 0.25;

          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        });
      }

      // Clouds with safe wrapping (Fase 9)
      clouds.forEach((cloud) => {
        if (!reducedMotion) {
          cloud.x += cloud.speed;
          if (cloud.x > W + 80) cloud.x = -cloud.width - 20;
        }

        const cloudParallaxX = cloud.x - (cameraX * 0.04);
        const cx = Math.floor(cloudParallaxX);
        const cy = Math.floor(cloud.y);

        if (cx > -cloud.width && cx < W + cloud.width) {
          ctx.fillStyle =
            phase === TIME_PHASES.NIGHT
              ? 'rgba(255, 255, 255, 0.12)'
              : phase === TIME_PHASES.DUSK
              ? 'rgba(255, 220, 190, 0.45)'
              : 'rgba(255, 255, 255, 0.7)';

          ctx.fillRect(cx + 8, cy, cloud.width - 16, cloud.height);
          ctx.fillRect(cx + 4, cy + 4, cloud.width - 8, cloud.height - 4);
          ctx.fillRect(cx, cy + 8, cloud.width, cloud.height - 8);
        }
      });

      /* -------------------------------------------------------------
       * AMBIENT CREATURES: FLYING BIRDS (Dawn & Day)
       * ------------------------------------------------------------- */
      if (phase !== TIME_PHASES.NIGHT && !reducedMotion) {
        birds.forEach((bird) => {
          bird.x += bird.speed;
          if (bird.x > W + 40) bird.x = -20;

          const isWingUp = Math.floor(creatureTimer * 6 + bird.wingFrame) % 2 === 0;
          const bx = Math.floor(bird.x);
          const by = Math.floor(bird.y);

          ctx.fillStyle = phase === TIME_PHASES.DUSK ? '#3A2022' : '#2C3A47';
          ctx.fillRect(bx, by, 3, 1);
          if (isWingUp) {
            ctx.fillRect(bx - 2, by - 2, 2, 2);
            ctx.fillRect(bx + 3, by - 2, 2, 2);
          } else {
            ctx.fillRect(bx - 2, by + 1, 2, 1);
            ctx.fillRect(bx + 3, by + 1, 2, 1);
          }
        });
      }

      /* -------------------------------------------------------------
       * LAYER 3: DISTANT MOUNTAIN SILHOUETTE
       * ------------------------------------------------------------- */
      const farParallaxX = -(cameraX * (isMobile ? 0.08 : 0.1));
      ctx.fillStyle = currentSky.farHills;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        const worldX = x - farParallaxX;
        const y = 92 + Math.sin(worldX * 0.012) * 16 + Math.cos(worldX * 0.024) * 8;
        ctx.lineTo(x, Math.floor(y));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      /* -------------------------------------------------------------
       * LAYER 4: MIDDLE HILLS (Desktop only; skipped on mobile for 3-layer parallax)
       * ------------------------------------------------------------- */
      if (!isMobile) {
        const midParallaxX = -(cameraX * 0.25);
        ctx.fillStyle = currentSky.midHills;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 4) {
          const worldX = x - midParallaxX;
          const y = 124 + Math.sin(worldX * 0.02) * 14 + Math.cos(worldX * 0.038) * 6;
          ctx.lineTo(x, Math.floor(y));
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      }

      /* -------------------------------------------------------------
       * LAYER 5: FOREGROUND MEADOW & ROADWAY
       * ------------------------------------------------------------- */
      const foreParallaxX = -(cameraX * (isMobile ? 0.35 : 0.5));
      ctx.fillStyle = currentSky.foreHills;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 4) {
        const worldX = x - foreParallaxX;
        const y = 152 + Math.sin(worldX * 0.03) * 7 + Math.cos(worldX * 0.06) * 3;
        ctx.lineTo(x, Math.floor(y));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Cobblestone / Earthy Path
      ctx.fillStyle = phase === TIME_PHASES.NIGHT ? '#1E2C22' : '#8C7456';
      for (let x = 0; x <= W; x += 8) {
        const worldX = x - foreParallaxX;
        const baseY = Math.floor(
          154 + Math.sin(worldX * 0.03) * 7 + Math.cos(worldX * 0.06) * 3
        );
        ctx.fillRect(x, baseY + 6, 6, 2);
        ctx.fillRect(x + 2, baseY + 9, 5, 2);
      }

      /* -------------------------------------------------------------
       * LANDMARKS ALONG THE OVERWORLD
       * Mobile (<1024px): 100% unaltered drawing and positions with 0.8 opacity
       * Desktop (>=1024px): Synchronized with tabs, locked to tabs (no parallax drift)
       * ------------------------------------------------------------- */
      if (isMobile) {
        ctx.globalAlpha = 0.8;
        const renderMobileLandmark = (landmarkWorldX, type) => {
          const lx = Math.floor(landmarkWorldX + foreParallaxX);
          if (lx < -80 || lx > W + 80) return;
          const baseY = Math.floor(
            152 + Math.sin(landmarkWorldX * 0.03) * 7 + Math.cos(landmarkWorldX * 0.06) * 3
          );
          drawLandmarkPixelArt(ctx, type, lx, baseY);
        };

        renderMobileLandmark(60, 'hero_village');
        renderMobileLandmark(180, 'quests_house');
        renderMobileLandmark(300, 'skills_tree');
        renderMobileLandmark(420, 'guild_hall');
        renderMobileLandmark(540, 'contact_post');
        renderMobileLandmark(660, 'guestbook_board');
        ctx.globalAlpha = 1.0;
      } else {
        ctx.globalAlpha = 0.85;
        const positions = getLandmarkPositions(canvas);
        positions.forEach((pos) => {
          drawLandmarkPixelArt(ctx, pos.type, Math.floor(pos.canvasX), Math.floor(pos.canvasY));
        });
        ctx.globalAlpha = 1.0;
      }

      /* -------------------------------------------------------------
       * FOREGROUND DECORATIVE PROPS: WILDFLOWERS, BUSHES & SWAYING GRASS
       * ------------------------------------------------------------- */
      const swayOffset = reducedMotion
        ? 0
        : swayFrame === 1
        ? 1
        : swayFrame === 2
        ? -1
        : 0;

      for (let x = 2; x < W; x += 14) {
        const worldX = x - foreParallaxX;
        const baseY = Math.floor(
          152 + Math.sin(worldX * 0.03) * 7 + Math.cos(worldX * 0.06) * 3
        );

        ctx.fillStyle = phase === TIME_PHASES.NIGHT ? '#3B5E34' : '#73A45C';
        ctx.fillRect(x, baseY - 4, 2, 4);
        ctx.fillRect(x + 2 + swayOffset, baseY - 7, 2, 7);
        ctx.fillRect(x + 4, baseY - 3, 2, 3);

        if (x % 28 === 0) {
          const flowerColor =
            x % 56 === 0 ? '#E8793A' : x % 84 === 0 ? '#E8B03A' : '#FFFDF8';
          ctx.fillStyle = flowerColor;
          ctx.fillRect(x + 2 + swayOffset, baseY - 9, 2, 2);
        }
      }

      /* -------------------------------------------------------------
       * AMBIENT BUTTERFLIES (Day / Dawn)
       * ------------------------------------------------------------- */
      if (phase !== TIME_PHASES.NIGHT && !reducedMotion) {
        butterflies.forEach((b) => {
          b.phase += 0.08;
          const bx = Math.floor((b.x + Math.sin(b.phase * 0.7) * 16 + foreParallaxX) % (W + 40));
          const by = Math.floor(b.baseOriginY + Math.cos(b.phase) * 8);

          if (bx > 0 && bx < W) {
            const wingFlap = Math.floor(b.phase * 4) % 2 === 0;
            ctx.fillStyle = b.color;
            ctx.fillRect(bx, by, 1, 1);
            if (wingFlap) {
              ctx.fillRect(bx - 1, by - 1, 1, 1);
              ctx.fillRect(bx + 1, by - 1, 1, 1);
            } else {
              ctx.fillRect(bx - 1, by, 1, 1);
              ctx.fillRect(bx + 1, by, 1, 1);
            }
          }
        });
      }

      /* -------------------------------------------------------------
       * LAYER 6: ATMOSPHERIC PARTICLES
       * ------------------------------------------------------------- */
      if (!isLowPower && particles.length > 0) {
        particles.forEach((p) => {
          if (!reducedMotion) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.timer += 0.08;

            if (p.x > W + 10) p.x = -5;
            if (p.y > H + 10) p.y = -5;
            if (p.y < -10) p.y = H + 5;
          }

          const px = Math.floor(p.x);
          const py = Math.floor(p.y);

          if (phase === TIME_PHASES.NIGHT) {
            const pulse = 0.4 + Math.sin(p.timer) * 0.55;
            ctx.fillStyle = `rgba(246, 235, 211, ${Math.max(0.1, pulse)})`;
            ctx.fillRect(px, py, p.size, p.size);
            if (p.size > 1 && pulse > 0.5) {
              ctx.fillStyle = 'rgba(232, 121, 58, 0.35)';
              ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
            }
          } else {
            const leafColor =
              phase === TIME_PHASES.DUSK
                ? 'rgba(232, 121, 58, 0.75)'
                : 'rgba(255, 255, 255, 0.75)';
            ctx.fillStyle = leafColor;
            ctx.fillRect(px, py, p.size, p.size);
            ctx.fillStyle = 'rgba(58, 42, 30, 0.35)';
            ctx.fillRect(px, py + 1, 1, 1);
          }
        });
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();
    };
  }, [phase, cameraX, isMobile, isLowPower, reducedMotion]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="pixelated w-full h-full object-cover"
        style={{ imageRendering: 'pixelated' }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 transition-colors duration-1000 pointer-events-none"
        style={{
          backgroundColor:
            phase === TIME_PHASES.NIGHT
              ? 'rgba(8, 14, 30, 0.28)'
              : phase === TIME_PHASES.DUSK
              ? 'rgba(232, 121, 58, 0.12)'
              : 'transparent',
        }}
      />
    </div>
  );
}

export default WorldCanvas;
