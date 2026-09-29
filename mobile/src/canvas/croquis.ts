/**
 * Builds the cream croquis (fashion figure) background as a Skia image.
 * Geometry ported from `drawCroquis` in Atelier Vaux.dc.html and parameterised
 * for a female or male silhouette.
 */
import {
  Skia,
  type SkCanvas,
  type SkImage,
  BlendMode,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  TileMode,
} from '@shopify/react-native-skia';

export type Figure = 'female' | 'male';

interface Proportions {
  neck: number; // neck half-width factor
  sh: number; // shoulder half-width factor
  bu: number; // bust/chest half-width factor
  wa: number; // waist half-width factor
  hi: number; // hip half-width factor
  leg: number; // leg thickness multiplier
  headRx: number; // head radius x factor
}

const FIGURES: Record<Figure, Proportions> = {
  // Hourglass — soft shoulders, defined waist, full hips.
  female: { neck: 0.15, sh: 0.92, bu: 0.72, wa: 0.5, hi: 0.9, leg: 1.0, headRx: 0.3 },
  // Inverted triangle — broad shoulders, straighter waist, narrower hips.
  male: { neck: 0.18, sh: 1.05, bu: 0.78, wa: 0.66, hi: 0.74, leg: 1.18, headRx: 0.32 },
};

export function paintCroquis(
  canvas: SkCanvas,
  w: number,
  h: number,
  view: 'front' | 'back',
  figure: Figure = 'female'
) {
  const P = FIGURES[figure];

  // Paper gradient background.
  const paper = Skia.Paint();
  const grad = Skia.Shader.MakeLinearGradient(
    { x: 0, y: 0 },
    { x: 0, y: h },
    [Skia.Color('#faf7f0'), Skia.Color('#efe8db')],
    [0, 1],
    TileMode.Clamp
  );
  paper.setShader(grad);
  canvas.drawRect({ x: 0, y: 0, width: w, height: h }, paper);

  // Faint horizontal grid.
  const grid = Skia.Paint();
  grid.setColor(Skia.Color('rgba(120,116,108,0.10)'));
  grid.setStyle(PaintStyle.Stroke);
  grid.setStrokeWidth(1);
  for (let y = 40; y < h; y += 40) {
    const p = Skia.Path.Make();
    p.moveTo(0, y);
    p.lineTo(w, y);
    canvas.drawPath(p, grid);
  }

  // Figure stroke paint.
  const line = Skia.Paint();
  line.setColor(Skia.Color('rgba(70,70,74,0.26)'));
  line.setStyle(PaintStyle.Stroke);
  line.setStrokeWidth(1.4);
  line.setStrokeJoin(StrokeJoin.Round);
  line.setStrokeCap(StrokeCap.Round);
  line.setAntiAlias(true);

  const cx = w / 2;
  const U = h * 0.112;
  const top = h * 0.04;

  // Head.
  const headRx = U * P.headRx;
  const headRy = U * 0.46;
  const headCy = top + U * 0.55;
  const head = Skia.Path.Make();
  head.addOval({ x: cx - headRx, y: headCy - headRy, width: headRx * 2, height: headRy * 2 });
  canvas.drawPath(head, line);

  // Neck.
  const neckTop = headCy + headRy * 0.82;
  const neckBot = top + U * 1.4;
  const nHW = U * P.neck;
  const neck = Skia.Path.Make();
  neck.moveTo(cx - nHW, neckTop);
  neck.lineTo(cx - nHW * 1.1, neckBot);
  neck.moveTo(cx + nHW, neckTop);
  neck.lineTo(cx + nHW * 1.1, neckBot);
  canvas.drawPath(neck, line);

  // Torso.
  const shY = top + U * 1.55;
  const shHW = U * P.sh;
  const buY = top + U * 2.4;
  const buHW = U * P.bu;
  const waY = top + U * 3.3;
  const waHW = U * P.wa;
  const hiY = top + U * 4.2;
  const hiHW = U * P.hi;
  [1, -1].forEach((dir) => {
    const p = Skia.Path.Make();
    p.moveTo(cx + dir * nHW * 1.1, neckBot);
    p.lineTo(cx + dir * shHW, shY);
    p.cubicTo(cx + dir * buHW, shY + (buY - shY) * 0.5, cx + dir * buHW, buY - U * 0.1, cx + dir * buHW, buY);
    p.cubicTo(cx + dir * buHW, buY + (waY - buY) * 0.55, cx + dir * waHW, waY - U * 0.25, cx + dir * waHW, waY);
    p.cubicTo(cx + dir * waHW, waY + (hiY - waY) * 0.4, cx + dir * hiHW, hiY - U * 0.35, cx + dir * hiHW, hiY);
    canvas.drawPath(p, line);
  });

  // Legs.
  const legW = P.leg;
  const crotchY = top + U * 4.55;
  const kneeY = top + U * 6.05;
  const ankY = top + U * 7.75;
  [1, -1].forEach((dir) => {
    const p = Skia.Path.Make();
    p.moveTo(cx + dir * hiHW, hiY);
    p.cubicTo(cx + dir * hiHW * 0.9, kneeY - U * 0.5, cx + dir * U * 0.32 * legW, kneeY, cx + dir * U * 0.3 * legW, kneeY);
    p.cubicTo(cx + dir * U * 0.28 * legW, kneeY + U * 0.85, cx + dir * U * 0.2 * legW, ankY, cx + dir * U * 0.18 * legW, ankY);
    p.lineTo(cx + dir * U * 0.05, ankY);
    p.cubicTo(cx + dir * U * 0.06, kneeY + U * 0.55, cx + dir * U * 0.12 * legW, kneeY, cx + dir * U * 0.12 * legW, kneeY);
    p.cubicTo(cx + dir * U * 0.13 * legW, crotchY + U * 0.35, cx + dir * 0.02, crotchY, cx, crotchY);
    canvas.drawPath(p, line);
  });

  // Arms.
  [1, -1].forEach((dir) => {
    const p = Skia.Path.Make();
    p.moveTo(cx + dir * shHW, shY);
    p.cubicTo(
      cx + dir * (shHW + U * 0.14),
      top + U * 3.0,
      cx + dir * (waHW + U * 0.38),
      top + U * 3.4,
      cx + dir * (waHW + U * 0.28),
      top + U * 4.0
    );
    canvas.drawPath(p, line);
  });

  if (view === 'front') {
    // A faint smile arc on the face.
    const smile = Skia.Path.Make();
    const r = headRx * 0.5;
    const cyf = headCy + headRy * 0.05;
    smile.addArc({ x: cx - r, y: cyf - r, width: r * 2, height: r * 2 }, 27, 126);
    canvas.drawPath(smile, line);
  } else {
    // Dashed centre line for the back view.
    const dash = Skia.Paint();
    dash.setColor(Skia.Color('rgba(70,70,74,0.26)'));
    dash.setStyle(PaintStyle.Stroke);
    dash.setStrokeWidth(1.4);
    dash.setPathEffect(Skia.PathEffect.MakeDash([4, 5]));
    dash.setBlendMode(BlendMode.SrcOver);
    const p = Skia.Path.Make();
    p.moveTo(cx, neckBot);
    p.lineTo(cx, hiY);
    canvas.drawPath(p, dash);
  }
}

/** Render the croquis into a standalone SkImage. */
export function makeCroquisImage(
  w: number,
  h: number,
  view: 'front' | 'back',
  figure: Figure = 'female'
): SkImage | null {
  const surface = Skia.Surface.MakeOffscreen(w, h);
  if (!surface) return null;
  paintCroquis(surface.getCanvas(), w, h, view, figure);
  surface.flush();
  return surface.makeImageSnapshot();
}
