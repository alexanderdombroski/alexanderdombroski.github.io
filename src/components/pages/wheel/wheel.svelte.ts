export const wheelState = $state({
  items: [] as string[],
});

// ─── Wheel constants ──────────────────────────────────────────────────────────

export const COLORS = [
  '#e05c5c',
  '#d97f3a',
  '#c8a800',
  '#4c9a52',
  '#3a86c8',
  '#7b5ea7',
  '#c8547a',
  '#3aadad',
  '#8b7340',
  '#6a6a6a',
] as const;

/** Return the wheel colour for a given item index. */
export function itemColor(index: number): string {
  return COLORS[index % COLORS.length];
}

// ─── SVG geometry ─────────────────────────────────────────────────────────────

export const RADIUS = 180;
export const CX = 200;
export const CY = 200;

/** Convert a wheel angle (0 = top, clockwise) + radius to an SVG {x, y} point. */
export function polar(angle: number, r: number): { x: number; y: number } {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Build the SVG arc-path string for a single wheel slice. */
export function arcPath(start: number, end: number): string {
  const p1 = polar(start, RADIUS);
  const p2 = polar(end, RADIUS);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

// ─── Spin timing ──────────────────────────────────────────────────────────────

export const SPIN_DURATION_MS = 5200;
