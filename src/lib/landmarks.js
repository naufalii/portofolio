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

export const LANDMARK_DEFS = [
  {
    id: 'hero',
    name: 'Desa Awal',
    short: 'Desa',
    icon: '🏡',
    type: 'hero_village',
    // Logical bounding box (canvas pixels)
    width: 44,
    height: 32,
    anchorX: 0.5,
    anchorY: 1.0,
    // Base fallback canvas coordinates (in 360x200 canvas space)
    baseCanvasX: 52,
    baseCanvasY: 94,
  },
  {
    id: 'quests',
    name: 'Quest Log',
    short: 'Quest',
    icon: '📜',
    type: 'quests_house',
    width: 42,
    height: 36,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 104,
    baseCanvasY: 94,
  },
  {
    id: 'skills',
    name: 'Skill Tree',
    short: 'Skill',
    icon: '⚡',
    type: 'skills_tree',
    width: 64,
    height: 48,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 156,
    baseCanvasY: 94,
  },
  {
    id: 'guild',
    name: 'Guild Hall',
    short: 'Guild',
    icon: '🏛️',
    type: 'guild_hall',
    width: 48,
    height: 40,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 208,
    baseCanvasY: 94,
  },
  {
    id: 'contact',
    name: 'Kotak Pos',
    short: 'Kontak',
    icon: '📬',
    type: 'contact_post',
    width: 40,
    height: 28,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 260,
    baseCanvasY: 94,
  },
  {
    id: 'guestbook',
    name: 'Papan Pesan',
    short: 'Pesan',
    icon: '📝',
    type: 'guestbook_board',
    width: 44,
    height: 28,
    anchorX: 0.5,
    anchorY: 1.0,
    baseCanvasX: 312,
    baseCanvasY: 94,
  },
];

/**
 * Computes screen pixel positions and canvas coordinates for all landmarks.
 * Synchronizes horizontal center with OverworldMapNav tabs and vertical baseline with stage ground.
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

  // Find desktop stage element or mascot container
  const stageEl = document.querySelector('[data-landmark-stage]') ||
    document.querySelector('.will-change-transform')?.parentElement;

  let groundScreenY = 338;
  if (stageEl) {
    const sr = stageEl.getBoundingClientRect();
    // Stage ground baseline is slightly above stage bottom
    groundScreenY = sr.bottom - 16;
  }

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
    const canvasY = (groundScreenY - cr.top) * (H / cr.height);

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
 * Draws procedural pixel art for a landmark on the 2D canvas context.
 * Used exclusively by WorldCanvas to ensure identical artwork across all components.
 */
export function drawLandmarkPixelArt(ctx, type, lx, baseY) {
  if (type === 'hero_village') {
    // Cottage Wall
    ctx.fillStyle = '#F6EBD3';
    ctx.fillRect(lx - 20, baseY - 22, 28, 22);
    // Roof
    ctx.fillStyle = '#B5501B';
    ctx.fillRect(lx - 24, baseY - 30, 36, 4);
    ctx.fillRect(lx - 22, baseY - 26, 32, 4);
    // Door
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 12, baseY - 14, 8, 14);
    // Lantern
    ctx.fillStyle = '#E8B03A';
    ctx.fillRect(lx + 10, baseY - 12, 3, 3);
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 11, baseY - 9, 1, 9);
  } else if (type === 'quests_house') {
    // Quest House / Post
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 12, baseY - 26, 3, 26);
    ctx.fillRect(lx + 12, baseY - 26, 3, 26);
    ctx.fillStyle = '#F6EBD3';
    ctx.fillRect(lx - 14, baseY - 24, 29, 14);
    ctx.fillStyle = '#E8793A';
    ctx.fillRect(lx + 13, baseY - 34, 10, 6);
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 12, baseY - 35, 1, 12);
  } else if (type === 'skills_tree') {
    // Great Skill Tree
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 5, baseY - 26, 10, 26);
    // Foliage layers
    ctx.fillStyle = '#2D4B27';
    ctx.fillRect(lx - 28, baseY - 38, 56, 14);
    ctx.fillStyle = '#486B47';
    ctx.fillRect(lx - 24, baseY - 44, 48, 10);
    ctx.fillStyle = '#659D5B';
    ctx.fillRect(lx - 16, baseY - 48, 32, 8);
    // Glowing orbs / sparks
    ctx.fillStyle = '#8FC6E8';
    ctx.fillRect(lx - 12, baseY - 30, 3, 3);
    ctx.fillRect(lx + 10, baseY - 34, 3, 3);
  } else if (type === 'guild_hall') {
    // Grand Guild Hall
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 20, baseY - 28, 4, 28);
    ctx.fillRect(lx - 4, baseY - 28, 4, 28);
    ctx.fillRect(lx + 12, baseY - 28, 4, 28);
    ctx.fillStyle = '#5E8B4A';
    ctx.fillRect(lx - 24, baseY - 34, 44, 6);
    ctx.fillRect(lx - 16, baseY - 40, 28, 6);
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(lx - 3, baseY - 24, 10, 12);
  } else if (type === 'contact_post') {
    // Mail Post & Fence
    ctx.fillStyle = '#5A3A22';
    ctx.fillRect(lx - 18, baseY - 12, 2, 12);
    ctx.fillRect(lx - 4, baseY - 12, 2, 12);
    ctx.fillRect(lx - 18, baseY - 9, 16, 2);
    ctx.fillStyle = '#24160B';
    ctx.fillRect(lx + 8, baseY - 14, 3, 14);
    ctx.fillStyle = '#E8793A';
    ctx.fillRect(lx + 4, baseY - 22, 11, 8);
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(lx + 12, baseY - 25, 2, 5);
  } else if (type === 'guestbook_board') {
    // Bulletin Board
    ctx.fillStyle = '#3A2012';
    ctx.fillRect(lx - 16, baseY - 24, 3, 24);
    ctx.fillRect(lx + 14, baseY - 24, 3, 24);
    ctx.fillStyle = '#8C7456';
    ctx.fillRect(lx - 18, baseY - 22, 37, 14);
    ctx.fillStyle = '#FFFDF8';
    ctx.fillRect(lx - 14, baseY - 19, 6, 5);
    ctx.fillStyle = '#F2A66B';
    ctx.fillRect(lx - 5, baseY - 18, 7, 5);
    ctx.fillStyle = '#8FC6E8';
    ctx.fillRect(lx + 4, baseY - 20, 6, 6);
  }
}
