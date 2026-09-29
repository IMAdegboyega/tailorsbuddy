/**
 * Procedural fabric / colour fill functions and a scanline-tolerant flood fill,
 * ported from the `fillFn` + `floodFill` logic in Atelier Vaux.dc.html.
 *
 * A FillFn maps a pixel coordinate to an [r,g,b,a] tuple (0-255).
 */
import { Fabric } from '../data';

export type FillFn = (x: number, y: number) => [number, number, number, number];

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

export function hexRgb(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/** Solid colour fill. */
export function solidFill(rgb: [number, number, number]): FillFn {
  return () => [rgb[0], rgb[1], rgb[2], 255];
}

/** Procedural fabric texture fill, keyed by fabric id. */
export function fabricFill(fab: Fabric): FillFn {
  const b = fab.base;
  switch (fab.id) {
    case 'silk':
      return (x, y) => {
        const s = Math.sin(x * 0.028) * 16 + Math.sin(y * 0.012) * 7;
        return [clamp(b[0] + s), clamp(b[1] + s), clamp(b[2] + s), 255];
      };
    case 'satin':
      return (x, y) => {
        const s = Math.sin(x * 0.02 + y * 0.004) * 26;
        return [clamp(b[0] + s), clamp(b[1] + s), clamp(b[2] + s), 255];
      };
    case 'lace':
      return (x, y) => {
        const hole = x % 9 < 2 && y % 9 < 2;
        const d = hole ? -40 : (x + y) % 9 < 2 ? 12 : 0;
        return [clamp(b[0] + d), clamp(b[1] + d), clamp(b[2] + d), hole ? 150 : 255];
      };
    case 'denim':
      return (x, y) => {
        const w = ((x + y) % 4 < 2 ? -14 : 8) + (x % 3 < 1 ? -16 : 0);
        return [clamp(b[0] + w), clamp(b[1] + w), clamp(b[2] + w * 0.6), 255];
      };
    case 'velvet':
      return (x, y) => {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const f = (n - Math.floor(n)) * 24 - 12;
        return [clamp(b[0] + f), clamp(b[1] + f * 0.6), clamp(b[2] + f * 0.6), 255];
      };
    case 'tulle':
      return (x, y) => {
        const dot = x % 5 < 1 || y % 5 < 1 ? 18 : 0;
        return [clamp(b[0] + dot), clamp(b[1] + dot), clamp(b[2] + dot), 150];
      };
    default:
      return () => [b[0], b[1], b[2], 255];
  }
}

/**
 * Flood fill starting at (sx,sy), reading boundaries from `src` (an RGBA byte
 * buffer of the current canvas) but writing the fill into a NEW transparent
 * buffer — so the result is a layer containing only the filled region, which can
 * be drawn beneath the strokes. Tolerance/neighbourhood match the prototype.
 */
export function floodFillRegion(
  src: Uint8Array,
  w: number,
  h: number,
  sx: number,
  sy: number,
  fn: FillFn
): Uint8Array {
  const out = new Uint8Array(w * h * 4); // all zero = fully transparent
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return out;
  const si = (sy * w + sx) * 4;
  const tr = src[si],
    tg = src[si + 1],
    tb = src[si + 2],
    ta = src[si + 3];
  const match = (i: number) =>
    Math.abs(src[i] - tr) +
      Math.abs(src[i + 1] - tg) +
      Math.abs(src[i + 2] - tb) +
      Math.abs(src[i + 3] - ta) <
    100;
  const seen = new Uint8Array(w * h);
  const st: number[] = [sx, sy];
  while (st.length) {
    const y = st.pop() as number;
    const x = st.pop() as number;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (seen[p]) continue;
    const i = p * 4;
    if (!match(i)) continue;
    seen[p] = 1;
    const c = fn(x, y);
    out[i] = c[0];
    out[i + 1] = c[1];
    out[i + 2] = c[2];
    out[i + 3] = c[3] == null ? 255 : c[3];
    st.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
  return out;
}

/**
 * Flood fill an RGBA byte buffer in place, starting at (sx,sy), using `fn` to
 * colour each matched pixel. Tolerance and neighbourhood match the prototype.
 */
export function floodFill(
  data: Uint8Array,
  w: number,
  h: number,
  sx: number,
  sy: number,
  fn: FillFn
): void {
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;
  const si = (sy * w + sx) * 4;
  const tr = data[si],
    tg = data[si + 1],
    tb = data[si + 2],
    ta = data[si + 3];
  const match = (i: number) =>
    Math.abs(data[i] - tr) +
      Math.abs(data[i + 1] - tg) +
      Math.abs(data[i + 2] - tb) +
      Math.abs(data[i + 3] - ta) <
    100;
  const seen = new Uint8Array(w * h);
  const st: number[] = [sx, sy];
  while (st.length) {
    const y = st.pop() as number;
    const x = st.pop() as number;
    if (x < 0 || y < 0 || x >= w || y >= h) continue;
    const p = y * w + x;
    if (seen[p]) continue;
    const i = p * 4;
    if (!match(i)) continue;
    seen[p] = 1;
    const c = fn(x, y);
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
    data[i + 3] = c[3] == null ? 255 : c[3];
    st.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }
}
