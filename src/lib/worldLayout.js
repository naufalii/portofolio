/**
 * worldLayout.js - Single Source of Truth for Overworld Layout Mathematics
 *
 * Implements 3 Desktop Tiers (D1 & D2):
 * - Desktop: W >= DESKTOP_MIN_W (1024) && H >= DESKTOP_MIN_H (480)
 * - Tier 1 (Standar): H >= 700 px (Header 208 px, groundY = 0.47*H, dialogTop = groundY + 38.19)
 * - Tier 2 (Padat): 480 <= H < 700 px (Header <= 96 px, groundY = 0.47*H, proportional gap, internal scroll)
 * - Tier 3 (Unsupported / Vertikal): W < 1024 px OR H < 480 px (Mobile vertical flow)
 */

export const DESKTOP_MIN_W = 1024;
export const DESKTOP_MIN_H = 480;
export const DESKTOP_STANDARD_H = 700;

export const BASELINE_HEIGHT = 720;
export const BASELINE_GROUND_Y = 338.40;
export const GROUND_Y_RATIO = 0.47; // 338.40 / 720 = 0.47
export const DIALOG_GROUND_GAP = 38.19; // 376.59 - 338.40 = 38.19

/**
 * Pure calculation function for world layout based on viewport dimensions and headerBottom.
 *
 * @param {number} W - Viewport width
 * @param {number} H - Viewport height
 * @param {number|null} headerBottom - Measured bottom of desktop header from DOM
 * @returns {object} Layout parameters
 */
export function computeWorldLayout(W, H, headerBottom = null) {
  const isDesktop = W >= DESKTOP_MIN_W && H >= DESKTOP_MIN_H && W >= H;

  if (!isDesktop) {
    return {
      isDesktop: false,
      tier: 'unsupported',
      isCompact: false,
      W,
      H,
      scale: 1,
      groundY: 152, // Mobile 3-layer parallax baseline
      dialogTop: null, // Mobile uses vertical flow
      mascotScale: 'responsive',
      gap: null,
      headerBottom,
      stageClearance: null,
    };
  }

  const isCompact = H < DESKTOP_STANDARD_H;
  const tier = isCompact ? 'compact' : 'standard';

  // Desktop S = H / 200, zero canvas vertical offset
  const scale = H / 200;
  const groundY = Math.round(GROUND_Y_RATIO * H * 100) / 100; // 0.47 * H
  const mascotScale = Math.round(2.2 * (scale / 3.6) * 100) / 100;

  // Mascot-to-dialog gap:
  // Standard: 38.19 px (exact 0px drift at 1280x720: 338.40 + 38.19 = 376.59)
  // Compact: gap = Math.max(12, Math.round(38.19 * (H / 720) * 100) / 100)
  const gap = isCompact
    ? Math.max(12, Math.round(DIALOG_GROUND_GAP * (H / BASELINE_HEIGHT) * 100) / 100)
    : DIALOG_GROUND_GAP;

  const dialogTop = Math.round((groundY + gap) * 100) / 100;

  let stageClearance = null;
  if (headerBottom !== null && headerBottom !== undefined) {
    stageClearance = Math.round((groundY - headerBottom) * 100) / 100;
  }

  return {
    isDesktop: true,
    tier,
    isCompact,
    W,
    H,
    scale,
    groundY,
    dialogTop,
    mascotScale,
    gap,
    headerBottom,
    stageClearance,
  };
}
