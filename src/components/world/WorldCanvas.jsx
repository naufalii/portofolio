import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TIME_PHASES } from '../../hooks/useTimeOfDay';

/**
 * WorldCanvas - Native 2D Pixel-perfect Overworld Background Canvas.
 * Implements Section 7.1 and 7.2 of PLAN.md:
 * - Low-res internal rendering buffer (320x180) scaled via CSS pixelated
 * - 6 parallax layers:
 *    1. Sky (time-based gradient)
 *    2. Far clouds + Night stars
 *    3. Distant mountain silhouette
 *    4. Middle hills
 *    5. Foreground grass with pixel sway
 *    6. Particles (dandelions / fireflies)
 * - Auto-pauses on tab inactive and off-screen
 * - Performance self-throttling on weak devices / low FPS
 */
export function WorldCanvas({
  phase = TIME_PHASES.DAY,
  cameraX = 0,
  isMobile = false,
  className = '',
}) {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [fps, setFps] = useState(60);
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    // Detect hardware concurrency constraint
    if (typeof navigator !== 'undefined' && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) {
      setIsLowPower(true);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Internal low-res buffer dimensions
    const INTERNAL_WIDTH = 320;
    const INTERNAL_HEIGHT = 180;
    canvas.width = INTERNAL_WIDTH;
    canvas.height = INTERNAL_HEIGHT;

    // Palette tokens (Section 4.1)
    const PALETTE = {
      cream: '#F6EBD3',
      cloud: '#FFFFFF',
      skyDayTop: '#68B0DE',
      skyDayBottom: '#8FC6E8',
      skyDawnTop: '#8FC6E8',
      skyDawnBottom: '#F2A66B',
      skyDuskTop: '#6B4A6A',
      skyDuskBottom: '#F2A66B',
      skyNightTop: '#0C1322',
      skyNightBottom: '#1F2A44',
      moss: '#5E8B4A',
      mossDark: '#3B5E34',
      sunset: '#E8793A',
      ink: '#3A2A1E',
    };

    // Parallax particle setup
    const maxParticles = isLowPower ? 0 : isMobile ? 10 : 25;
    const particles = Array.from({ length: maxParticles }, () => ({
      x: Math.random() * INTERNAL_WIDTH,
      y: Math.random() * INTERNAL_HEIGHT,
      speedX: 0.15 + Math.random() * 0.35,
      speedY: (Math.random() - 0.4) * 0.25,
      size: Math.random() > 0.6 ? 2 : 1,
      opacity: 0.4 + Math.random() * 0.6,
      glowTimer: Math.random() * Math.PI * 2,
    }));

    // Fixed Stars for night/dusk
    const stars = Array.from({ length: 35 }, () => ({
      x: Math.random() * INTERNAL_WIDTH,
      y: Math.random() * (INTERNAL_HEIGHT * 0.6),
      size: Math.random() > 0.8 ? 2 : 1,
      flicker: Math.random() * Math.PI,
    }));

    // Cloud objects
    const clouds = [
      { x: 30, y: 22, width: 56, height: 16, speed: 0.08 },
      { x: 150, y: 14, width: 72, height: 20, speed: 0.05 },
      { x: 260, y: 35, width: 44, height: 14, speed: 0.07 },
    ];

    let animationFrameId;
    let isTabVisible = true;
    let isIntersecting = true;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let swayFrame = 0;
    let swayTimer = 0;

    // Visibility handlers (Section 7.1)
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        lastTime = performance.now();
      }
    });
    observer.observe(canvas);

    // Render loop
    const render = (currentTime) => {
      if (!isTabVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Track FPS for performance throttling
      frameCount++;
      if (currentTime - fpsTimer >= 2000) {
        const calculatedFps = Math.round((frameCount * 1000) / (currentTime - fpsTimer));
        setFps(calculatedFps);
        if (calculatedFps < 40) {
          setIsLowPower(true);
        }
        frameCount = 0;
        fpsTimer = currentTime;
      }

      // Update grass sway step
      swayTimer += deltaTime;
      if (swayTimer > 0.4) {
        swayFrame = (swayFrame + 1) % 3;
        swayTimer = 0;
      }

      /* -------------------------------------------------------------
       * LAYER 1: Sky Gradient
       * ------------------------------------------------------------- */
      let skyTop = PALETTE.skyDayTop;
      let skyBottom = PALETTE.skyDayBottom;

      if (phase === TIME_PHASES.DAWN) {
        skyTop = PALETTE.skyDawnTop;
        skyBottom = PALETTE.skyDawnBottom;
      } else if (phase === TIME_PHASES.DUSK) {
        skyTop = PALETTE.skyDuskTop;
        skyBottom = PALETTE.skyDuskBottom;
      } else if (phase === TIME_PHASES.NIGHT) {
        skyTop = PALETTE.skyNightTop;
        skyBottom = PALETTE.skyNightBottom;
      }

      const skyGrad = ctx.createLinearGradient(0, 0, 0, INTERNAL_HEIGHT);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(1, skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      /* -------------------------------------------------------------
       * LAYER 2: Stars (Night / Dusk) & Clouds (Day / Dawn / Dusk)
       * ------------------------------------------------------------- */
      if (phase === TIME_PHASES.NIGHT || phase === TIME_PHASES.DUSK) {
        // Draw pixel stars
        stars.forEach((star) => {
          star.flicker += reducedMotion ? 0 : 0.05;
          const alpha =
            phase === TIME_PHASES.NIGHT
              ? 0.5 + Math.sin(star.flicker) * 0.4
              : 0.2 + Math.sin(star.flicker) * 0.2;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        });
      }

      // Draw clouds with stepped drift
      clouds.forEach((cloud) => {
        if (!reducedMotion) {
          cloud.x += cloud.speed;
          if (cloud.x > INTERNAL_WIDTH + 50) {
            cloud.x = -cloud.width;
          }
        }

        const cloudParallaxX = cloud.x - (cameraX * 0.05) % INTERNAL_WIDTH;
        const cx = Math.floor(cloudParallaxX);
        const cy = Math.floor(cloud.y);

        ctx.fillStyle =
          phase === TIME_PHASES.NIGHT
            ? 'rgba(255, 255, 255, 0.12)'
            : phase === TIME_PHASES.DUSK
            ? 'rgba(255, 230, 200, 0.45)'
            : 'rgba(255, 255, 255, 0.65)';

        // Pixel cloud shape with staircase edges
        ctx.fillRect(cx + 8, cy, cloud.width - 16, cloud.height);
        ctx.fillRect(cx + 4, cy + 4, cloud.width - 8, cloud.height - 4);
        ctx.fillRect(cx, cy + 8, cloud.width, cloud.height - 8);
      });

      /* -------------------------------------------------------------
       * LAYER 3: Distant Mountain Silhouette
       * ------------------------------------------------------------- */
      const farParallaxX = -(cameraX * 0.12);
      ctx.fillStyle =
        phase === TIME_PHASES.NIGHT
          ? '#1A2536'
          : phase === TIME_PHASES.DUSK
          ? '#5A4C56'
          : '#486B47';

      ctx.beginPath();
      ctx.moveTo(0, INTERNAL_HEIGHT);
      for (let x = 0; x <= INTERNAL_WIDTH; x += 4) {
        const worldX = x - farParallaxX;
        const y =
          88 +
          Math.sin(worldX * 0.012) * 16 +
          Math.cos(worldX * 0.024) * 8;
        ctx.lineTo(x, Math.floor(y));
      }
      ctx.lineTo(INTERNAL_WIDTH, INTERNAL_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Skip layers 4 & 5 detail on mobile if 3-layer optimization active
      /* -------------------------------------------------------------
       * LAYER 4: Middle Hills & Trees
       * ------------------------------------------------------------- */
      const midParallaxX = -(cameraX * 0.28);
      ctx.fillStyle =
        phase === TIME_PHASES.NIGHT
          ? '#23382D'
          : phase === TIME_PHASES.DUSK
          ? '#4A5B3D'
          : PALETTE.mossDark;

      ctx.beginPath();
      ctx.moveTo(0, INTERNAL_HEIGHT);
      for (let x = 0; x <= INTERNAL_WIDTH; x += 4) {
        const worldX = x - midParallaxX;
        const y =
          118 +
          Math.sin(worldX * 0.02) * 14 +
          Math.cos(worldX * 0.04) * 6;
        ctx.lineTo(x, Math.floor(y));
      }
      ctx.lineTo(INTERNAL_WIDTH, INTERNAL_HEIGHT);
      ctx.closePath();
      ctx.fill();

      /* -------------------------------------------------------------
       * LAYER 5: Foreground Meadow & Swaying Grass
       * ------------------------------------------------------------- */
      const foreParallaxX = -(cameraX * 0.55);
      ctx.fillStyle =
        phase === TIME_PHASES.NIGHT
          ? '#2C4933'
          : phase === TIME_PHASES.DUSK
          ? '#55683F'
          : PALETTE.moss;

      ctx.beginPath();
      ctx.moveTo(0, INTERNAL_HEIGHT);
      for (let x = 0; x <= INTERNAL_WIDTH; x += 4) {
        const worldX = x - foreParallaxX;
        const y =
          145 +
          Math.sin(worldX * 0.035) * 8 +
          Math.cos(worldX * 0.07) * 4;
        ctx.lineTo(x, Math.floor(y));
      }
      ctx.lineTo(INTERNAL_WIDTH, INTERNAL_HEIGHT);
      ctx.closePath();
      ctx.fill();

      // Grass tufts with stepping sway
      const swayOffset = reducedMotion ? 0 : swayFrame === 1 ? 1 : swayFrame === 2 ? -1 : 0;
      ctx.fillStyle = phase === TIME_PHASES.NIGHT ? '#3B5E34' : '#73A45C';

      for (let x = 4; x < INTERNAL_WIDTH; x += 20) {
        const worldX = x - foreParallaxX;
        const baseY = Math.floor(
          145 +
          Math.sin(worldX * 0.035) * 8 +
          Math.cos(worldX * 0.07) * 4
        );
        // Draw 3-blade pixel grass tuft
        ctx.fillRect(x, baseY - 4, 2, 4);
        ctx.fillRect(x + 2 + swayOffset, baseY - 6, 2, 6);
        ctx.fillRect(x + 4, baseY - 3, 2, 3);
      }

      /* -------------------------------------------------------------
       * LAYER 6: Atmospheric Particles (Dandelion / Fireflies)
       * ------------------------------------------------------------- */
      if (!isLowPower && particles.length > 0) {
        particles.forEach((p) => {
          if (!reducedMotion) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.glowTimer += 0.08;

            // Wrap around edges
            if (p.x > INTERNAL_WIDTH + 10) p.x = -5;
            if (p.y > INTERNAL_HEIGHT + 10) p.y = -5;
            if (p.y < -10) p.y = INTERNAL_HEIGHT + 5;
          }

          const px = Math.floor(p.x);
          const py = Math.floor(p.y);

          if (phase === TIME_PHASES.NIGHT) {
            // Glowing fireflies
            const pulse = 0.4 + Math.sin(p.glowTimer) * 0.5;
            ctx.fillStyle = `rgba(246, 235, 211, ${Math.max(0.1, pulse)})`;
            ctx.fillRect(px, py, p.size, p.size);
            // Ambient glow dot
            if (p.size > 1 && pulse > 0.5) {
              ctx.fillStyle = `rgba(232, 121, 58, 0.25)`;
              ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
            }
          } else {
            // Dandelion seed drifting
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
            ctx.fillRect(px, py, p.size, p.size);
            // Seed stem
            ctx.fillStyle = `rgba(58, 42, 30, 0.4)`;
            ctx.fillRect(px, py + 1, 1, 2);
          }
        });
      }

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
        style={{
          imageRendering: 'pixelated',
        }}
        aria-hidden="true"
      />

      {/* Screen tint overlay for smooth 1.5s crossfade between time phases */}
      <div
        className="absolute inset-0 transition-colors duration-1000 pointer-events-none"
        style={{
          backgroundColor:
            phase === TIME_PHASES.NIGHT
              ? 'rgba(15, 22, 38, 0.25)'
              : phase === TIME_PHASES.DUSK
              ? 'rgba(232, 121, 58, 0.12)'
              : 'transparent',
        }}
      />
    </div>
  );
}

export default WorldCanvas;
