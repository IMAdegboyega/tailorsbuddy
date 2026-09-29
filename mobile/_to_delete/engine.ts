/**
 * Sketch engine: an offscreen Skia ink surface per view (front/back), with
 * freehand strokes, eraser, flood-fill fabric fills, undo/redo/clear and an
 * export compositor. This mirrors the two-canvas (bg croquis + ink) model and
 * the ImageData snapshot history used in Atelier Vaux.dc.html.
 */
import {
  Skia,
  type SkImage,
  type SkSurface,
  AlphaType,
  BlendMode,
  ColorType,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from '@shopify/react-native-skia';

import { FillFn, floodFill } from './fills';
import { Figure, paintCroquis } from './croquis';

export const CANVAS_W = 620;
export const CANVAS_H = 700;
const HISTORY_LIMIT = 18;

type View = 'front' | 'back';

interface Layer {
  surface: SkSurface;
  undo: SkImage[];
  redo: SkImage[];
}

const rgbaInfo = {
  width: CANVAS_W,
  height: CANVAS_H,
  colorType: ColorType.RGBA_8888,
  alphaType: AlphaType.Unpremul,
};

export class SketchEngine {
  private layers: Partial<Record<View, Layer>> = {};

  private ensure(view: View): Layer | null {
    let layer = this.layers[view];
    if (!layer) {
      const surface = Skia.Surface.MakeOffscreen(CANVAS_W, CANVAS_H);
      if (!surface) return null;
      surface.getCanvas().clear(Skia.Color('rgba(0,0,0,0)'));
      layer = { surface, undo: [], redo: [] };
      this.layers[view] = layer;
    }
    return layer;
  }

  /** Snapshot current ink for undo, before a new operation. */
  snapshot(view: View) {
    const layer = this.ensure(view);
    if (!layer) return;
    layer.surface.flush();
    layer.undo.push(layer.surface.makeImageSnapshot());
    if (layer.undo.length > HISTORY_LIMIT) layer.undo.shift();
    layer.redo = [];
  }

  /** Draw a single stroke segment onto the ink surface. */
  segment(
    view: View,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color: string,
    width: number,
    erase: boolean
  ) {
    const layer = this.ensure(view);
    if (!layer) return;
    const canvas = layer.surface.getCanvas();
    const paint = Skia.Paint();
    paint.setStyle(PaintStyle.Stroke);
    paint.setStrokeCap(StrokeCap.Round);
    paint.setStrokeJoin(StrokeJoin.Round);
    paint.setAntiAlias(true);
    if (erase) {
      paint.setBlendMode(BlendMode.Clear);
      paint.setStrokeWidth(width * 4);
    } else {
      paint.setColor(Skia.Color(color));
      paint.setStrokeWidth(width);
    }
    const path = Skia.Path.Make();
    path.moveTo(x0, y0);
    // Nudge so a single tap still paints a dot.
    path.lineTo(x1 + 0.01, y1 + 0.01);
    canvas.drawPath(path, paint);
    layer.surface.flush();
  }

  /** Flood fill the tapped region with a colour/fabric fill function. */
  fill(view: View, x: number, y: number, fn: FillFn): boolean {
    const layer = this.ensure(view);
    if (!layer) return false;
    layer.surface.flush();
    const snap = layer.surface.makeImageSnapshot();
    const pixels = snap.readPixels(0, 0, rgbaInfo) as Uint8Array | null;
    if (!pixels) return false;
    floodFill(pixels, CANVAS_W, CANVAS_H, Math.round(x), Math.round(y), fn);
    const data = Skia.Data.fromBytes(pixels);
    const img = Skia.Image.MakeImage(rgbaInfo, data, CANVAS_W * 4);
    if (!img) return false;
    const canvas = layer.surface.getCanvas();
    canvas.clear(Skia.Color('rgba(0,0,0,0)'));
    canvas.drawImage(img, 0, 0);
    layer.surface.flush();
    return true;
  }

  private restore(view: View, from: 'undo' | 'redo', to: 'undo' | 'redo') {
    const layer = this.ensure(view);
    if (!layer || !layer[from].length) return;
    layer.surface.flush();
    layer[to].push(layer.surface.makeImageSnapshot());
    const img = layer[from].pop() as SkImage;
    const canvas = layer.surface.getCanvas();
    canvas.clear(Skia.Color('rgba(0,0,0,0)'));
    canvas.drawImage(img, 0, 0);
    layer.surface.flush();
  }

  undo(view: View) {
    this.restore(view, 'undo', 'redo');
  }
  redo(view: View) {
    this.restore(view, 'redo', 'undo');
  }

  clear(view: View) {
    const layer = this.ensure(view);
    if (!layer) return;
    layer.surface.flush();
    layer.undo.push(layer.surface.makeImageSnapshot());
    if (layer.undo.length > HISTORY_LIMIT) layer.undo.shift();
    layer.surface.getCanvas().clear(Skia.Color('rgba(0,0,0,0)'));
    layer.surface.flush();
  }

  canUndo(view: View) {
    return !!this.layers[view]?.undo.length;
  }
  canRedo(view: View) {
    return !!this.layers[view]?.redo.length;
  }

  /** Current ink layer as an image (for live display over the croquis). */
  inkImage(view: View): SkImage | null {
    const layer = this.ensure(view);
    if (!layer) return null;
    layer.surface.flush();
    return layer.surface.makeImageSnapshot();
  }

  /** Compose croquis + ink and return a PNG data URI for export. */
  capture(view: View, figure: Figure = 'female'): string {
    const surface = Skia.Surface.MakeOffscreen(CANVAS_W, CANVAS_H);
    if (!surface) return '';
    const canvas = surface.getCanvas();
    paintCroquis(canvas, CANVAS_W, CANVAS_H, view, figure);
    const ink = this.inkImage(view);
    if (ink) canvas.drawImage(ink, 0, 0);
    surface.flush();
    const img = surface.makeImageSnapshot();
    const b64 = img.encodeToBase64();
    return `data:image/png;base64,${b64}`;
  }

  dispose() {
    this.layers = {};
  }
}
