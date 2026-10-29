/**
 * worldLayout.js - Pure mathematical world layout calculator for Overworld RPG Panggung.
 * Implements Fase C (Item A) Pendekatan (b) Opsi B:
 * - isDesktop = W >= 1024 && H >= 700 (layar H < 700 px menggunakan tata letak vertikal mobile)
 * - S = H / 200 (exact height-based scale, zero vertical canvas offset, no object-cover)
 * - groundY = 0.47 * H (calibrated from 338.40 / 720 = 0.47, verified at 1280x720)
 * - dialogTop = groundY + 38.19 (exact 0px drift at 1280x720: 338.40 + 38.19 = 376.59)
 * - Mascot scale scales proportionally with world: 2.2 * (S / 3.6)
 */

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
  const isDesktop = W >= 1024 && H >= 700;

  if (!isDesktop) {
    return {
      isDesktop: false,
      W,
      H,
      scale: 1,
      groundY: 152, // Mobile 3-layer parallax baseline
      dialogTop: null, // Mobile uses vertical flow
      mascotScale: 'responsive',
      headerBottom,
      stageClearance: null,
    };
  }

  // Desktop (W >= 1024 && H >= 600) Pendekatan (b)
  const scale = H / 200;
  const groundY = Math.round(GROUND_Y_RATIO * H * 100) / 100; // 0.47 * H
  const dialogTop = Math.round((groundY + DIALOG_GROUND_GAP) * 100) / 100; // groundY + 38.19
  const mascotScale = Math.round(2.2 * (scale / 3.6) * 100) / 100;

  let stageClearance = null;

  if (headerBottom !== null && headerBottom !== undefined) {
    stageClearance = Math.round((groundY - headerBottom) * 100) / 100;
  }

  return {
    isDesktop: true,
    W,
    H,
    scale,
    groundY,
    dialogTop,
    mascotScale,
    headerBottom,
    stageClearance,
  };
}
