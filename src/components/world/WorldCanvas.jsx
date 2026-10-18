import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { TIME_PHASES } from '../../hooks/useTimeOfDay';

/**
 * WorldCanvas - High-Fidelity 2D Pixel-Perfect Overworld Canvas
 * Implements Section 3 & 7 of PLAN.md & Revision:
 * - 6 Parallax layers with enriched depth
 * - Distinct landmarks per section:
 *    1. Hero: Village gate, cozy cottage & lantern
 *    2. Quests: Quest house, bulletin post & mission banner
 *    3. Skills: Ancient Grand Pixel Tree with crystal lanterns
 *    4. Guild: Timber Guild Hall with banners & columns
 *    5. Contact: Postbox & wooden fence with wildflowers
 *    6. Guestbook: Double-posted grand message board
 * - Ambient creatures:
 *    - Flocks of birds gliding across the sky
 *    - Fluttering pixel butterflies (day/dawn)
 *    - Pulsing glowing fireflies (night)
 * - Atmospheric particles: drifting leaves/dandelion seeds & twinkling starfield
 * - Dramatic contrast between Dawn, Day, Dusk, and Night
 * - Low-power self-throttling & auto-pause on tab hidden
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

    // Internal low-res pixel buffer (360x200 for cinematic 16:9 pixel art)
    const W = 360;
    const H = 200;
    canvas.width = W;
    canvas.height = H;

    // Dramatic Color Palettes per Time Phase (Point 3 Revision)
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

    // Ambient birds
    const birds = [
      { x: 40, y: 35, speed: 0.45, wingFrame: 0 },
      { x: 55, y: 30, speed: 0.45, wingFrame: 1 },
      { x: 70, y: 38, speed: 0.45, wingFrame: 2 },
    ];

    // Ambient butterflies (day/dawn)
    const butterflies = [
      { x: 90, y: 140, baseOriginY: 140, phase: 0, color: '#E8B03A' },
      { x: 210, y: 145, baseOriginY: 145, phase: 2, color: '#FFFDF8' },
      { x: 310, y: 138, baseOriginY: 138, phase: 4, color: '#E8793A' },
    ];

    // Atmospheric drifting leaves/seeds
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

    // Twinkling stars (night & dusk)
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * W,
      y: Math.random() * (H * 0.65),
      size: Math.random() > 0.8 ? 2 : 1,
      flicker: Math.random() * Math.PI * 2,
    }));

    // Clouds
    const clouds = [
      { x: 20, y: 20, width: 64, height: 16, speed: 0.05 },
      { x: 160, y: 14, width: 80, height: 20, speed: 0.035 },
      { x: 290, y: 30, width: 52, height: 14, speed: 0.045 },
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

    // Main render loop
    const render = (currentTime) => {
      if (!isTabVisible || !isIntersecting) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update sway step
      swayTimer += deltaTime;
      if (swayTimer > 0.35) {
        swayFrame = (swayFrame + 1) % 3;
        swayTimer = 0;
      }

      creatureTimer += deltaTime;

      const currentSky = SKY_COLORS[phase] || SKY_COLORS.day;

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

      // Clouds
      clouds.forEach((cloud) => {
        if (!reducedMotion) {
          cloud.x += cloud.speed;
          if (cloud.x > W + 60) cloud.x = -cloud.width;
        }

        const cloudParallaxX = cloud.x - (cameraX * 0.04) % W;
        const cx = Math.floor(cloudParallaxX);
        const cy = Math.floor(cloud.y);

        ctx.fillStyle =
          phase === TIME_PHASES.NIGHT
            ? 'rgba(255, 255, 255, 0.12)'
            : phase === TIME_PHASES.DUSK
            ? 'rgba(255, 220, 190, 0.45)'
            : 'rgba(255, 255, 255, 0.7)';

        ctx.fillRect(cx + 8, cy, cloud.width - 16, cloud.height);
        ctx.fillRect(cx + 4, cy + 4, cloud.width - 8, cloud.height - 4);
        ctx.fillRect(cx, cy + 8, cloud.width, cloud.height - 8);
      });

      /* -------------------------------------------------------------
       * AMBIENT CREATURES: FLYING BIRDS (Dawn & Day)
       * ------------------------------------------------------------- */
      if (phase !== TIME_PHASES.NIGHT && !reducedMotion) {
        birds.forEach((bird) => {
          bird.x += bird.speed;
          if (bird.x > W + 40) bird.x = -20;

          // Flapping wing step
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
      const farParallaxX = -(cameraX * 0.1);
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
       * LAYER 4: MIDDLE HILLS WITH ROLLING CONTOURS
       * ------------------------------------------------------------- */
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

      /* -------------------------------------------------------------
       * LAYER 5: FOREGROUND MEADOW & ROADWAY
       * ------------------------------------------------------------- */
      const foreParallaxX = -(cameraX * 0.5);
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

      // Cobblestone / Earthy Path winding along the meadow
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
       * LANDMARKS ALONG THE OVERWORLD (Point 3 Revision)
       * Landmarks shift according to the foreground camera:
       * Screen Landmark Position = BaseLandmarkX + foreParallaxX
       * ------------------------------------------------------------- */
      const renderLandmark = (landmarkWorldX, type) => {
        const lx = Math.floor(landmarkWorldX + foreParallaxX);
        // Only render if visible on screen
        if (lx < -80 || lx > W + 80) return;

        const baseY = Math.floor(
          152 + Math.sin(landmarkWorldX * 0.03) * 7 + Math.cos(landmarkWorldX * 0.06) * 3
        );

        if (type === 'hero_village') {
          // Cozy Starting Village Cottage & Wooden Gate
          // Cottage Wall
          ctx.fillStyle = '#F6EBD3';
          ctx.fillRect(lx - 24, baseY - 22, 28, 22);
          // Roof (Terracotta Orange)
          ctx.fillStyle = '#B5501B';
          ctx.fillRect(lx - 28, baseY - 30, 36, 4);
          ctx.fillRect(lx - 26, baseY - 26, 32, 4);
          // Door
          ctx.fillStyle = '#3A2012';
          ctx.fillRect(lx - 16, baseY - 14, 8, 14);
          // Chimney & Smoke
          ctx.fillStyle = '#754E30';
          ctx.fillRect(lx - 22, baseY - 36, 4, 8);
          // Glowing Lantern
          ctx.fillStyle = '#E8B03A';
          ctx.fillRect(lx + 10, baseY - 12, 3, 3);
          ctx.fillStyle = '#24160B';
          ctx.fillRect(lx + 11, baseY - 9, 1, 9);
        } else if (type === 'quests_house') {
          // Mission / Quest Log Board & Guild Post
          ctx.fillStyle = '#5A3A22';
          // Signposts
          ctx.fillRect(lx - 12, baseY - 26, 3, 26);
          ctx.fillRect(lx + 12, baseY - 26, 3, 26);
          // Wooden Board
          ctx.fillStyle = '#F6EBD3';
          ctx.fillRect(lx - 14, baseY - 24, 29, 14);
          ctx.fillStyle = '#24160B';
          ctx.fillRect(lx - 15, baseY - 25, 31, 1);
          ctx.fillRect(lx - 15, baseY - 10, 31, 1);
          // Red Quest Flag
          ctx.fillStyle = '#E8793A';
          ctx.fillRect(lx + 13, baseY - 34, 10, 6);
          ctx.fillStyle = '#24160B';
          ctx.fillRect(lx + 12, baseY - 35, 1, 12);
        } else if (type === 'skills_tree') {
          // Ancient Grand Pixel Tree with Canopy
          // Thick Trunk
          ctx.fillStyle = '#3A2012';
          ctx.fillRect(lx - 6, baseY - 42, 12, 42);
          // Foliage Canopy (Multi-layered green)
          ctx.fillStyle = '#2D4B27';
          ctx.fillRect(lx - 32, baseY - 58, 64, 24);
          ctx.fillStyle = '#486B47';
          ctx.fillRect(lx - 28, baseY - 66, 56, 16);
          ctx.fillStyle = '#659D5B';
          ctx.fillRect(lx - 20, baseY - 74, 40, 12);
          // Hanging Crystal / Lantern in tree
          ctx.fillStyle = '#8FC6E8';
          ctx.fillRect(lx - 14, baseY - 40, 3, 4);
          ctx.fillRect(lx + 12, baseY - 44, 3, 4);
        } else if (type === 'guild_hall') {
          // Timber Guild Hall with Columns & Spire
          ctx.fillStyle = '#3A2012';
          ctx.fillRect(lx - 20, baseY - 28, 4, 28);
          ctx.fillRect(lx - 4, baseY - 28, 4, 28);
          ctx.fillRect(lx + 12, baseY - 28, 4, 28);
          // Roof Spire
          ctx.fillStyle = '#5E8B4A';
          ctx.fillRect(lx - 24, baseY - 34, 44, 6);
          ctx.fillRect(lx - 16, baseY - 40, 28, 6);
          ctx.fillStyle = '#E8793A';
          ctx.fillRect(lx - 4, baseY - 46, 4, 6);
          // Guild Emblem Banner
          ctx.fillStyle = '#FFFDF8';
          ctx.fillRect(lx - 3, baseY - 24, 10, 12);
          ctx.fillStyle = '#E8793A';
          ctx.fillRect(lx - 1, baseY - 21, 6, 6);
        } else if (type === 'contact_post') {
          // Classic Country Postbox & Wooden Split-rail Fence
          // Fence
          ctx.fillStyle = '#5A3A22';
          ctx.fillRect(lx - 22, baseY - 12, 2, 12);
          ctx.fillRect(lx - 6, baseY - 12, 2, 12);
          ctx.fillRect(lx - 22, baseY - 9, 18, 2);
          ctx.fillRect(lx - 22, baseY - 5, 18, 2);
          // Postbox
          ctx.fillStyle = '#24160B';
          ctx.fillRect(lx + 8, baseY - 14, 3, 14);
          ctx.fillStyle = '#E8793A';
          ctx.fillRect(lx + 4, baseY - 22, 11, 8);
          ctx.fillStyle = '#FFFDF8';
          ctx.fillRect(lx + 12, baseY - 25, 2, 5); // Raised letter flag
        } else if (type === 'guestbook_board') {
          // Grand Double-Posted Notice Board with Colorful Memos
          ctx.fillStyle = '#3A2012';
          ctx.fillRect(lx - 16, baseY - 26, 3, 26);
          ctx.fillRect(lx + 14, baseY - 26, 3, 26);
          ctx.fillStyle = '#8C7456';
          ctx.fillRect(lx - 18, baseY - 24, 37, 16);
          // Sticky notes (yellow, pink, white)
          ctx.fillStyle = '#FFFDF8';
          ctx.fillRect(lx - 14, baseY - 21, 6, 5);
          ctx.fillStyle = '#F2A66B';
          ctx.fillRect(lx - 5, baseY - 19, 7, 5);
          ctx.fillStyle = '#8FC6E8';
          ctx.fillRect(lx + 4, baseY - 21, 6, 6);
        }
      };

      // Render landmarks at distinct world positions (Section 0 to 5)
      renderLandmark(60, 'hero_village');
      renderLandmark(180, 'quests_house');
      renderLandmark(300, 'skills_tree');
      renderLandmark(420, 'guild_hall');
      renderLandmark(540, 'contact_post');
      renderLandmark(660, 'guestbook_board');

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

        // Grass blades
        ctx.fillStyle = phase === TIME_PHASES.NIGHT ? '#3B5E34' : '#73A45C';
        ctx.fillRect(x, baseY - 4, 2, 4);
        ctx.fillRect(x + 2 + swayOffset, baseY - 7, 2, 7);
        ctx.fillRect(x + 4, baseY - 3, 2, 3);

        // Scattered Wildflower Blossoms (Point 3)
        if (x % 28 === 0) {
          const flowerColor =
            x % 56 === 0 ? '#E8793A' : x % 84 === 0 ? '#E8B03A' : '#FFFDF8';
          ctx.fillStyle = flowerColor;
          ctx.fillRect(x + 2 + swayOffset, baseY - 9, 2, 2);
        }
      }

      /* -------------------------------------------------------------
       * AMBIENT CREATURES: BUTTERFLIES (Day / Dawn)
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
       * LAYER 6: ATMOSPHERIC PARTICLES (Leaves/Seeds or Fireflies)
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
            // Glowing Fireflies
            const pulse = 0.4 + Math.sin(p.timer) * 0.55;
            ctx.fillStyle = `rgba(246, 235, 211, ${Math.max(0.1, pulse)})`;
            ctx.fillRect(px, py, p.size, p.size);
            if (p.size > 1 && pulse > 0.5) {
              ctx.fillStyle = 'rgba(232, 121, 58, 0.35)';
              ctx.fillRect(px - 1, py - 1, p.size + 2, p.size + 2);
            }
          } else {
            // Drifting Autumn / Spring Leaf
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

      {/* Atmospheric screen tint crossfade */}
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
