/**
 * landmarks.js - Single Source of Truth for Overworld Landmarks
 * Defines coordinates, logical dimensions, and visual definitions for:
 * 1. Desa Awal (hero)
 * 2. Quest Log (quests)
 * 3. Skill Tree (skills)
 * 4. Guild Hall (guild)
 * 5. Kotak Pos (contact)
 * 6. Papan Pesan (guestbook)
 */

// Single uniform ground baseline in canvas for desktop landmarks & meadow
export const CANVAS_GROUND_Y = 94;

export const LANDMARK_DEFS = [
  {
    id: 'hero',
    name: 'Desa Awal',
    short: 'Desa',
    icon: '🏡',
    type: 'hero_village',
    // Logical bounding box (canvas pixels) - proportional cottage
    width: 32,
    height: 24,
    shadowRadiusX: 16,
    shadowRadiusY: 3,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 52,
    baseCanvasY: CANVAS_GROUND_Y,
  },
  {
    id: 'quests',
    name: 'Quest Log',
    short: 'Quest',
    icon: '📜',
    type: 'quests_house',
    // Proportional quest house/banner
    width: 28,
    height: 26,
    shadowRadiusX: 14,
    shadowRadiusY: 3,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 104,
    baseCanvasY: CANVAS_GROUND_Y,
  },
  {
    id: 'skills',
    name: 'Skill Tree',
    short: 'Skill',
    icon: '⚡',
    type: 'skills_tree',
    // Proportional great tree (harmoniously scaled)
    width: 40,
    height: 38,
    shadowRadiusX: 18,
    shadowRadiusY: 3.5,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 156,
    baseCanvasY: CANVAS_GROUND_Y,
  },
  {
    id: 'guild',
    name: 'Guild Hall',
    short: 'Guild',
    icon: '🏛️',
    type: 'guild_hall',
    // Proportional timber hall
    width: 34,
    height: 32,
    shadowRadiusX: 18,
    shadowRadiusY: 3,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 208,
    baseCanvasY: CANVAS_GROUND_Y,
  },
  {
    id: 'contact',
    name: 'Kotak Pos',
    short: 'Kontak',
    icon: '📬',
    type: 'contact_post',
    // Sturdy, enlarged post & fence
    width: 34,
    height: 30,
    shadowRadiusX: 16,
    shadowRadiusY: 2.5,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 260,
    baseCanvasY: CANVAS_GROUND_Y,
  },
  {
    id: 'guestbook',
    name: 'Papan Pesan',
    short: 'Pesan',
    icon: '📝',
    type: 'guestbook_board',
    // Sturdy, enlarged bulletin board
    width: 38,
    height: 28,
    shadowRadiusX: 18,
    shadowRadiusY: 3,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 312,
    baseCanvasY: CANVAS_GROUND_Y,
  },
];

/**
 * Computes screen pixel positions and canvas coordinates for all landmarks.
 * All landmarks stand on the exact same canvas ground baseline (CANVAS_GROUND_Y).
 */
export function getLandmarkPositions(canvasEl) {
  if (typeof document === 'undefined') return [];

  const cr = canvasEl
    ? canvasEl.getBoundingClientRect()
    : { left: 0, top: 0, width: 1280, height: 720 };

  const W = 360;
  const H = 200;
  const scaleX = cr.width / W;
  const scaleY = cr.height / H;

  // Single uniform ground baseline in screen pixels
  const groundScreenY = cr.top + CANVAS_GROUND_Y * scaleY;

  return LANDMARK_DEFS.map((lm, idx) => {
    const tabEl = document.querySelector(`[data-location-id="${lm.id}"]`);
    let screenX = 0;

    if (tabEl) {
      const tr = tabEl.getBoundingClientRect();
      screenX = tr.left + tr.width / 2;
    } else {
      // Proportional fallback based on tab layout
      const proportions = [0.28, 0.40, 0.50, 0.60, 0.71, 0.82];
      screenX = cr.left + cr.width * (proportions[idx] || 0.5);
    }

    const canvasX = (screenX - cr.left) * (W / cr.width);
    const canvasY = CANVAS_GROUND_Y;

    return {
      ...lm,
      screenX,
      screenY: groundScreenY,
      canvasX,
      canvasY,
      scaleX,
      scaleY,
    };
  });
}

/**
 * Draws procedural pixel art and oval ground shadow for a landmark on the 2D canvas context.
 */
export function drawLandmarkPixelArt(ctx, type, lx, baseY, phase = 'day', animStep = 0) {
  ctx.save();

  const isNight = phase === 'night';
  const isDusk = phase === 'dusk';

  // Find definition for shadow parameters
  const def = LANDMARK_DEFS.find((d) => d.type === type);
  const shadowRadiusX = def ? def.shadowRadiusX : 16;
  const shadowRadiusY = def ? def.shadowRadiusY : 3;

  // 1. SMALL OVAL GROUND SHADOW (so the landmark firmly stands on the earth)
  ctx.fillStyle =
    isNight
      ? 'rgba(8, 14, 30, 0.48)'
      : isDusk
      ? 'rgba(30, 18, 20, 0.38)'
      : 'rgba(36, 22, 11, 0.32)';
  ctx.beginPath();
  ctx.ellipse(lx, baseY, shadowRadiusX, shadowRadiusY, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. LANDMARK PIXEL ARTWORK (proportional and balanced)
  if (type === 'hero_village') {
    // Wall
    ctx.fillStyle = isNight ? '#D4C4A8' : '#F6EBD3';
    ctx.fillRect(lx - 13, baseY - 18, 26, 18);
    // Roof (terracotta 2-tier)
    ctx.fillStyle = '#B5501B';
    ctx.fillRect(lx - 16, baseY - 24, 32, 3);
    ctx.fillRect(lx - 14, baseY - 21, 28, 3);
    // Door
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 4, baseY - 11, 7, 11);

    // Window: blue in day, glowing warm amber/cream at night
    if (isNight) {
      // Soft light spill around window
      ctx.fillStyle = 'rgba(232, 176, 58, 0.28)';
      ctx.fillRect(lx - 11, baseY - 14, 6, 6);
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 10, baseY - 13, 4, 4);
      ctx.fillStyle = animStep === 0 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx - 9, baseY - 12, 2, 2);
      // Window frame
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 9, baseY - 13, 1, 4);
      ctx.fillRect(lx - 10, baseY - 11, 4, 1);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 10, baseY - 13, 4, 4);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 9, baseY - 13, 1, 4);
      ctx.fillRect(lx - 10, baseY - 11, 4, 1);
    } else {
      ctx.fillStyle = '#8FC6E8';
      ctx.fillRect(lx - 10, baseY - 13, 4, 4);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 9, baseY - 13, 1, 4);
      ctx.fillRect(lx - 10, baseY - 11, 4, 1);
    }

    // Lantern on post with soft radiant glow around it
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 9, baseY - 8, 1, 8); // timber post
    ctx.fillRect(lx + 8, baseY - 12, 3, 1); // iron cap

    if (isNight) {
      // 1. Soft radial ambient light glow around the lantern
      const glow = ctx.createRadialGradient(lx + 9.5, baseY - 9.5, 1, lx + 9.5, baseY - 9.5, 8);
      glow.addColorStop(0, 'rgba(255, 253, 248, 0.75)');
      glow.addColorStop(0.35, 'rgba(232, 176, 58, 0.45)');
      glow.addColorStop(0.7, 'rgba(232, 121, 58, 0.18)');
      glow.addColorStop(1, 'rgba(232, 176, 58, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx + 9.5, baseY - 9.5, 8, 0, Math.PI * 2);
      ctx.fill();

      // 2. Soft ground light pool beneath lantern
      ctx.fillStyle = 'rgba(232, 176, 58, 0.22)';
      ctx.fillRect(lx + 6, baseY - 2, 7, 2);

      // 3. Lantern glass & flame core
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx + 8, baseY - 11, 3, 3);
      ctx.fillStyle = animStep === 1 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx + 9, baseY - 10, 1, 1);
    } else if (isDusk) {
      ctx.fillStyle = 'rgba(242, 166, 107, 0.35)';
      ctx.fillRect(lx + 7, baseY - 12, 5, 5);
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx + 8, baseY - 11, 3, 3);
    } else {
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx + 8, baseY - 11, 3, 3);
    }
  } else if (type === 'quests_house') {
    // Support posts
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 10, baseY - 20, 2, 20);
    ctx.fillRect(lx + 10, baseY - 20, 2, 20);

    // Quest Cabin Wall (dark timber at night for high contrast, warm wood in day)
    ctx.fillStyle = isNight ? '#3A2012' : '#F6EBD3';
    ctx.fillRect(lx - 11, baseY - 18, 22, 11);
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 12, baseY - 19, 24, 2); // Eaves

    // Flagpole & Flag
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 8, baseY - 26, 1, 9);
    ctx.fillStyle = '#E8793A';
    ctx.fillRect(lx + 9, baseY - 26, 8, 5);

    // Quest House Window (high contrast warm glowing window on cabin wall)
    if (isNight) {
      // Warm light spill around window
      ctx.fillStyle = 'rgba(232, 176, 58, 0.3)';
      ctx.fillRect(lx - 6, baseY - 16, 12, 9);

      // Window frame outer
      ctx.fillStyle = '#24160B';
      ctx.fillRect(lx - 5, baseY - 15, 10, 7);

      // Glowing warm amber glass
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 4, baseY - 14, 8, 5);

      // Bright warm cream core in 2 panes
      const coreColor = animStep === 0 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillStyle = coreColor;
      ctx.fillRect(lx - 3, baseY - 13, 2, 3);
      ctx.fillRect(lx + 1, baseY - 13, 2, 3);

      // Window frame cross (mullion)
      ctx.fillStyle = '#24160B';
      ctx.fillRect(lx - 1, baseY - 14, 1, 5);
      ctx.fillRect(lx - 4, baseY - 12, 8, 1);

      // Light spill on ground
      ctx.fillStyle = 'rgba(232, 176, 58, 0.2)';
      ctx.fillRect(lx - 5, baseY - 2, 10, 2);
    } else if (isDusk) {
      ctx.fillStyle = '#24160B';
      ctx.fillRect(lx - 5, baseY - 15, 10, 7);
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 4, baseY - 14, 8, 5);
      ctx.fillStyle = '#24160B';
      ctx.fillRect(lx - 1, baseY - 14, 1, 5);
      ctx.fillRect(lx - 4, baseY - 12, 8, 1);
    } else {
      ctx.fillStyle = '#24160B';
      ctx.fillRect(lx - 5, baseY - 15, 10, 7);
      ctx.fillStyle = '#8FC6E8';
      ctx.fillRect(lx - 4, baseY - 14, 8, 5);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 1, baseY - 14, 1, 5);
      ctx.fillRect(lx - 4, baseY - 12, 8, 1);
    }

    // Quest post lantern on the left with soft radiant halo
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx - 12, baseY - 16, 2, 1); // iron hook
    if (isNight) {
      const qGlow = ctx.createRadialGradient(lx - 11, baseY - 14, 1, lx - 11, baseY - 14, 6);
      qGlow.addColorStop(0, 'rgba(255, 253, 248, 0.7)');
      qGlow.addColorStop(0.4, 'rgba(232, 176, 58, 0.4)');
      qGlow.addColorStop(1, 'rgba(232, 176, 58, 0)');
      ctx.fillStyle = qGlow;
      ctx.beginPath();
      ctx.arc(lx - 11, baseY - 14, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 12, baseY - 15, 2, 3);
      ctx.fillStyle = animStep === 2 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx - 12, baseY - 14, 1, 1);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 12, baseY - 15, 2, 3);
    } else {
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 12, baseY - 15, 2, 3);
    }

    // Quest parchment trim
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 11, baseY - 18, 22, 2);
  } else if (type === 'skills_tree') {
    // Great Skill Tree (harmoniously scaled to height 38)
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 4, baseY - 18, 8, 18);
    ctx.fillRect(lx - 6, baseY - 4, 12, 4);
    // Foliage Tier 1 (bottom)
    ctx.fillStyle = '#2D4B27';
    ctx.fillRect(lx - 19, baseY - 26, 38, 9);
    // Foliage Tier 2 (mid)
    ctx.fillStyle = '#486B47';
    ctx.fillRect(lx - 15, baseY - 32, 30, 7);
    // Foliage Tier 3 (top)
    ctx.fillStyle = '#659D5B';
    ctx.fillRect(lx - 10, baseY - 38, 20, 7);
    // Glowing orbs / sparks
    ctx.fillStyle = isNight ? '#A5E5FF' : '#8FC6E8';
    ctx.fillRect(lx - 6, baseY - 25, 2, 2);
    ctx.fillRect(lx + 7, baseY - 30, 2, 2);
    if (isNight) {
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx - 5, baseY - 24, 1, 1);
      ctx.fillRect(lx + 8, baseY - 29, 1, 1);
    }
  } else if (type === 'guild_hall') {
    // 3 Timber Pillars
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 14, baseY - 22, 3, 22);
    ctx.fillRect(lx - 1.5, baseY - 22, 3, 22);
    ctx.fillRect(lx + 11, baseY - 22, 3, 22);

    // Left Bay Window
    if (isNight) {
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 10, baseY - 17, 6, 7);
      ctx.fillStyle = animStep === 2 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx - 9, baseY - 16, 2, 2);
      ctx.fillRect(lx - 6, baseY - 16, 2, 2);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 7, baseY - 17, 1, 7);
      ctx.fillRect(lx - 10, baseY - 13, 6, 1);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 10, baseY - 17, 6, 7);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 7, baseY - 17, 1, 7);
      ctx.fillRect(lx - 10, baseY - 13, 6, 1);
    } else {
      ctx.fillStyle = '#8FC6E8';
      ctx.fillRect(lx - 10, baseY - 17, 6, 7);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 7, baseY - 17, 1, 7);
      ctx.fillRect(lx - 10, baseY - 13, 6, 1);
    }

    // Right Bay Window
    if (isNight) {
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx + 4, baseY - 17, 6, 7);
      ctx.fillStyle = animStep === 0 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx + 5, baseY - 16, 2, 2);
      ctx.fillRect(lx + 8, baseY - 16, 2, 2);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx + 7, baseY - 17, 1, 7);
      ctx.fillRect(lx + 4, baseY - 13, 6, 1);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx + 4, baseY - 17, 6, 7);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx + 7, baseY - 17, 1, 7);
      ctx.fillRect(lx + 4, baseY - 13, 6, 1);
    } else {
      ctx.fillStyle = '#8FC6E8';
      ctx.fillRect(lx + 4, baseY - 17, 6, 7);
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx + 7, baseY - 17, 1, 7);
      ctx.fillRect(lx + 4, baseY - 13, 6, 1);
    }

    // Architrave & Canopy
    ctx.fillStyle = '#5E8B4A';
    ctx.fillRect(lx - 16, baseY - 27, 32, 5);
    ctx.fillStyle = '#3B5E34';
    ctx.fillRect(lx - 11, baseY - 32, 22, 5);

    // Guild Crest / Central Entrance
    if (isNight) {
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 3, baseY - 18, 6, 9);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx - 2, baseY - 17, 4, 7);
      ctx.fillStyle = '#E8793A';
      ctx.fillRect(lx - 1, baseY - 15, 2, 3);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 3, baseY - 18, 6, 9);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx - 2, baseY - 17, 4, 7);
    } else {
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx - 3, baseY - 18, 6, 9);
      ctx.fillStyle = '#3B5E34';
      ctx.fillRect(lx - 2, baseY - 16, 4, 6);
    }
  } else if (type === 'contact_post') {
    // Sturdy wooden fence
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 16, baseY - 14, 2, 14);
    ctx.fillRect(lx - 4, baseY - 14, 2, 14);
    ctx.fillRect(lx - 16, baseY - 11, 14, 2);
    ctx.fillRect(lx - 16, baseY - 5, 14, 2);

    // Fence post lantern with soft ambient glow
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx - 17, baseY - 20, 4, 1); // cap
    if (isNight) {
      const pGlow = ctx.createRadialGradient(lx - 15, baseY - 17, 1, lx - 15, baseY - 17, 6);
      pGlow.addColorStop(0, 'rgba(255, 253, 248, 0.75)');
      pGlow.addColorStop(0.4, 'rgba(232, 176, 58, 0.4)');
      pGlow.addColorStop(1, 'rgba(232, 176, 58, 0)');
      ctx.fillStyle = pGlow;
      ctx.beginPath();
      ctx.arc(lx - 15, baseY - 17, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 17, baseY - 19, 4, 5);
      ctx.fillStyle = animStep === 1 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx - 16, baseY - 18, 2, 2);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx - 17, baseY - 19, 4, 5);
    } else {
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx - 16, baseY - 19, 2, 5);
    }

    // Mail Post
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 6, baseY - 18, 3, 18);
    // Mailbox (sunset orange)
    ctx.fillStyle = '#E8793A';
    ctx.fillRect(lx + 2, baseY - 26, 12, 9);
    ctx.fillStyle = '#B5501B';
    ctx.fillRect(lx + 2, baseY - 22, 12, 2);

    // Mailbox indicator light (optional small warm light point) & intake slot
    if (isNight) {
      // Small warm point light on top of mailbox
      ctx.fillStyle = 'rgba(232, 176, 58, 0.4)';
      ctx.fillRect(lx + 6, baseY - 28, 4, 3);
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx + 7, baseY - 27, 2, 2);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx + 7, baseY - 27, 1, 1);

      // Mailbox intake window / slot
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx + 4, baseY - 21, 6, 3);
      ctx.fillStyle = '#FFFDF8';
      ctx.fillRect(lx + 5, baseY - 20, 4, 1);
    } else if (isDusk) {
      ctx.fillStyle = '#F2A66B';
      ctx.fillRect(lx + 4, baseY - 21, 6, 3);
    } else {
      ctx.fillStyle = '#3A2012';
      ctx.fillRect(lx + 4, baseY - 21, 6, 2);
    }

    // Letter / Flag
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(lx + 11, baseY - 30, 2, 5);
    ctx.fillStyle = '#E8B03A';
    ctx.fillRect(lx + 13, baseY - 30, 2, 2);
  } else if (type === 'guestbook_board') {
    // Sturdy wooden posts
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 16, baseY - 26, 3, 26);
    ctx.fillRect(lx + 13, baseY - 26, 3, 26);
    // Bulletin Board
    ctx.fillStyle = '#8C7456';
    ctx.fillRect(lx - 18, baseY - 24, 36, 16);
    // Trim
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 19, baseY - 26, 38, 2);
    // Pinned notes
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(lx - 14, baseY - 21, 7, 6);
    ctx.fillStyle = '#F2A66B';
    ctx.fillRect(lx - 4, baseY - 19, 8, 6);
    ctx.fillStyle = '#8FC6E8';
    ctx.fillRect(lx + 6, baseY - 21, 7, 7);

    // Small roof lantern on bulletin board for nighttime reading
    if (isNight) {
      ctx.fillStyle = 'rgba(232, 176, 58, 0.35)';
      ctx.fillRect(lx - 2, baseY - 28, 4, 4);
      ctx.fillStyle = '#E8B03A';
      ctx.fillRect(lx - 1, baseY - 28, 2, 2);
      ctx.fillStyle = animStep === 0 ? '#FFFDF8' : '#F6EBD3';
      ctx.fillRect(lx - 1, baseY - 27, 1, 1);
    }
  }

  ctx.restore();
}
