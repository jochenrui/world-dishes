/**
 * Share-card renderer. Draws a "passport" summary onto a <canvas> using ONLY
 * canvas primitives, system-font text, and emoji glyphs. It intentionally loads
 * NO external images and NO web fonts, so the canvas is never tainted and
 * `canvas.toDataURL('image/png')` / `toBlob` cannot throw a SecurityError under
 * a strict CSP. Deterministic given the same `data`.
 */

/** Everything the card needs, derived from computePassport/deriveStats + the user's name. */
export interface ShareCardData {
  /** Signed-in display name, or null for the anonymous "My …" title. */
  name: string | null;
  dishesTried: number;
  countriesVisited: number;
  continentsTasted: number;
  /** Emoji of the achievements the user has EARNED, in display order. */
  earnedAchievements: string[];
}

/** Fixed square export size. Rendered at devicePixelRatio for crispness. */
export const SHARE_CARD_SIZE = 1080;

// Cream / terracotta palette (mirrors the app's light theme, fixed so the export
// looks identical regardless of the viewer's active theme).
const COLORS = {
  bg: '#fbf7f0',
  card: '#ffffff',
  border: '#e7ddcd',
  primary: '#c23d29',
  accent: '#e8a020',
  text: '#2c2620',
  muted: '#6f6858',
};

const FONT_STACK =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Draw the share card at `SHARE_CARD_SIZE` logical px, scaled by devicePixelRatio.
 * Sets `canvas.width/height` (device px) and leaves `ctx` transformed so all
 * coordinates below are in logical px.
 */
export function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData): void {
  const size = SHARE_CARD_SIZE;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, size, size);

  // Inner card with terracotta border
  const pad = 56;
  roundRect(ctx, pad, pad, size - pad * 2, size - pad * 2, 40);
  ctx.fillStyle = COLORS.card;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = COLORS.border;
  ctx.stroke();

  // Terracotta accent bar across the top of the card
  ctx.save();
  roundRect(ctx, pad, pad, size - pad * 2, 150, 40);
  ctx.clip();
  ctx.fillStyle = COLORS.primary;
  ctx.fillRect(pad, pad, size - pad * 2, 150);
  ctx.restore();

  const cx = size / 2;

  // Eyebrow (inside the terracotta bar)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 30px ${FONT_STACK}`;
  ctx.fillText('🍽  A TASTE OF THE WORLD', cx, pad + 75);

  // Title
  const title = data.name
    ? `${data.name}'s World Dishes Passport`
    : 'My World Dishes Passport';
  ctx.fillStyle = COLORS.text;
  ctx.font = `800 58px ${FONT_STACK}`;
  fitText(ctx, title, size - pad * 2 - 80, 58, 34);
  ctx.fillText(title, cx, pad + 250);

  // Headline stats row (three cells)
  const stats: [number, string][] = [
    [data.dishesTried, data.dishesTried === 1 ? 'dish tried' : 'dishes tried'],
    [data.countriesVisited, data.countriesVisited === 1 ? 'country' : 'countries'],
    [data.continentsTasted, data.continentsTasted === 1 ? 'continent' : 'continents'],
  ];
  const statsY = pad + 430;
  const inner = size - pad * 2 - 120;
  const cellW = inner / 3;
  const startX = pad + 60 + cellW / 2;
  stats.forEach(([num, label], i) => {
    const x = startX + i * cellW;
    ctx.fillStyle = COLORS.primary;
    ctx.font = `800 96px ${FONT_STACK}`;
    ctx.fillText(String(num), x, statsY);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `600 26px ${FONT_STACK}`;
    ctx.fillText(label, x, statsY + 78);
  });

  // Divider
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad + 60, statsY + 170);
  ctx.lineTo(size - pad - 60, statsY + 170);
  ctx.stroke();

  // Achievements label + earned emoji row
  const achLabelY = statsY + 240;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `700 26px ${FONT_STACK}`;
  ctx.fillText(
    data.earnedAchievements.length ? 'ACHIEVEMENTS EARNED' : 'START YOUR JOURNEY',
    cx,
    achLabelY,
  );

  if (data.earnedAchievements.length) {
    // Show up to 9 emoji so they fit on one crisp row.
    const emoji = data.earnedAchievements.slice(0, 9);
    ctx.font = `64px ${FONT_STACK}`;
    const gap = 84;
    const rowW = (emoji.length - 1) * gap;
    let x = cx - rowW / 2;
    const y = achLabelY + 80;
    for (const e of emoji) {
      ctx.fillText(e, x, y);
      x += gap;
    }
  }

  // Footer
  ctx.fillStyle = COLORS.muted;
  ctx.font = `600 24px ${FONT_STACK}`;
  ctx.fillText('Taste your way around the world', cx, size - pad - 46);
}

/** Shrink the active font down toward `minPx` until `text` fits within `maxWidth`. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startPx: number,
  minPx: number,
): void {
  let px = startPx;
  ctx.font = `800 ${px}px ${FONT_STACK}`;
  while (ctx.measureText(text).width > maxWidth && px > minPx) {
    px -= 2;
    ctx.font = `800 ${px}px ${FONT_STACK}`;
  }
}
