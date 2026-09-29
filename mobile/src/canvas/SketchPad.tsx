import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Canvas,
  Group,
  Image as SkiaImage,
  Path,
  Rect,
  Skia,
  useCanvasRef,
  AlphaType,
  ColorType,
  type SkImage,
  type SkPath,
} from '@shopify/react-native-skia';

import { CANVAS_H, CANVAS_W } from './constants';
import { Figure } from './croquis';
import { CROQUIS_VEC } from './croquisPaths';
import { FillFn, floodFillRegion } from './fills';
import { Icon } from '../components/Icon';

const PAPER = '#faf7f0';
const CHARCOAL = '#4A4642'; // croquis line colour

// Marks are stored in this logical space and scaled to the (small) display box
// with a cheap Skia group transform — so drawings survive resizes/full-screen
// while the actual canvas stays box-sized and fast.
const LW = CANVAS_W;
const LH = CANVAS_H;
const PEN_K = 2;
const MAX_ZOOM = 5;

export interface ToolState {
  tool: 'pencil' | 'eraser' | 'fill' | 'observe';
  ink: string;
  weight: number;
  fill: FillFn | null;
  used: { name: string; dot: string } | null;
}

export interface SketchPadHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  capture: () => SkImage | null;
  hasContent: () => boolean;
}

interface StrokeRec {
  path: SkPath;
  color: string;
  width: number;
  erase: boolean;
}

interface Snapshot {
  strokes: StrokeRec[];
  fills: SkImage[];
}

interface Bucket {
  strokes: StrokeRec[];
  fills: SkImage[];
  undo: Snapshot[];
  redo: Snapshot[];
}

const newBucket = (): Bucket => ({ strokes: [], fills: [], undo: [], redo: [] });

interface Props {
  view: 'front' | 'back';
  figure: Figure;
  width: number;
  height: number;
  getTools: () => ToolState;
  onFillUsed?: (u: { name: string; dot: string }) => void;
  onActivate?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const HISTORY_LIMIT = 24;

export const SketchPad = forwardRef<SketchPadHandle, Props>(function SketchPad(
  { view, figure, width, height, getTools, onFillUsed, onActivate, onToggleFullscreen, isFullscreen },
  ref
) {
  const canvasRef = useCanvasRef();
  // Vector croquis (traced) per figure + view — crisp at any zoom.
  const vec = CROQUIS_VEC[(figure === 'male' ? 'male' : 'female') + (view === 'front' ? 'Front' : 'Back')];
  const croquisPath = useMemo(() => Skia.Path.MakeFromSVGString(vec.d) ?? undefined, [vec.d]);
  const cScale = Math.min(LW / vec.w, LH / vec.h);
  const cOx = (LW - vec.w * cScale) / 2;
  const cOy = (LH - vec.h * cScale) / 2;

  const f = width / LW; // logical → box (uniform, since box keeps the canvas ratio)

  // Separate drawing per figure.
  const buckets = useRef<Record<Figure, Bucket>>({ female: newBucket(), male: newBucket() });
  const figureRef = useRef<Figure>(figure);
  figureRef.current = figure;
  const bucketFor = (fig: Figure) => buckets.current[fig];

  const [, setTick] = useState(0);
  const redraw = () => setTick((v) => v + 1);

  // ---- zoom / pan (RN transform on the box-sized canvas view) ----
  const [xf, setXfState] = useState({ k: 1, tx: 0, ty: 0 });
  const xfRef = useRef(xf);
  const clampXf = (n: { k: number; tx: number; ty: number }) => {
    const k = Math.min(MAX_ZOOM, Math.max(1, n.k));
    const tx = Math.min(0, Math.max(width * (1 - k), n.tx));
    const ty = Math.min(0, Math.max(height * (1 - k), n.ty));
    return { k, tx, ty };
  };
  const applyXf = (n: { k: number; tx: number; ty: number }) => {
    const c = clampXf(n);
    xfRef.current = c;
    setXfState(c);
  };
  const resetZoom = () => applyXf({ k: 1, tx: 0, ty: 0 });
  // viewport point → box (unzoomed) coords
  const toBox = (x: number, y: number) => {
    const { k, tx, ty } = xfRef.current;
    return { x: (x - tx) / k, y: (y - ty) / k };
  };

  const curPath = useRef<SkPath | null>(null);
  const curMeta = useRef<{ color: string; width: number; erase: boolean } | null>(null);
  const observing = useRef(false);
  const panLast = useRef({ x: 0, y: 0 });

  const pushHistory = () => {
    const b = bucketFor(figureRef.current);
    b.undo.push({ strokes: b.strokes, fills: b.fills });
    if (b.undo.length > HISTORY_LIMIT) b.undo.shift();
    b.redo = [];
  };

  // bx,by are box (unzoomed) coordinates.
  const doFill = (bx: number, by: number, fn: FillFn) => {
    const snap = canvasRef.current?.makeImageSnapshot();
    if (!snap) return;
    const iw = snap.width();
    const ih = snap.height();
    const info = { width: iw, height: ih, colorType: ColorType.RGBA_8888, alphaType: AlphaType.Unpremul };
    const src = snap.readPixels(0, 0, info) as Uint8Array | null;
    if (!src) return;
    const fx = Math.round((bx / width) * iw);
    const fy = Math.round((by / height) * ih);
    const out = floodFillRegion(src, iw, ih, fx, fy, fn);
    const img = Skia.Image.MakeImage(info, Skia.Data.fromBytes(out), iw * 4);
    if (!img) return;
    pushHistory();
    const b = bucketFor(figureRef.current);
    b.fills = [...b.fills, img];
    redraw();
  };

  const onStart = (vx: number, vy: number) => {
    onActivate?.();
    const t = getTools();
    if (t.tool === 'observe') {
      observing.current = true;
      panLast.current = { x: vx, y: vy };
      return;
    }
    const box = toBox(vx, vy);
    if (t.tool === 'fill') {
      if (t.fill) {
        doFill(box.x, box.y, t.fill);
        if (t.used) onFillUsed?.(t.used);
      }
      return;
    }
    const lx = box.x / f;
    const ly = box.y / f;
    pushHistory();
    const p = Skia.Path.Make();
    p.moveTo(lx, ly);
    p.lineTo(lx + 0.01, ly + 0.01);
    curPath.current = p;
    curMeta.current =
      t.tool === 'eraser'
        ? { color: '#000000', width: t.weight * PEN_K * 3, erase: true }
        : { color: t.ink, width: t.weight * PEN_K, erase: false };
    redraw();
  };

  const onMove = (vx: number, vy: number) => {
    if (observing.current) {
      const c = xfRef.current;
      applyXf({ k: c.k, tx: c.tx + (vx - panLast.current.x), ty: c.ty + (vy - panLast.current.y) });
      panLast.current = { x: vx, y: vy };
      return;
    }
    if (!curPath.current) return;
    const box = toBox(vx, vy);
    curPath.current.lineTo(box.x / f, box.y / f);
    redraw();
  };

  // Finger lifted normally with one finger — keep the stroke.
  const commitStroke = () => {
    if (curPath.current && curMeta.current) {
      const rec: StrokeRec = { path: curPath.current, ...curMeta.current };
      const b = bucketFor(figureRef.current);
      b.strokes = [...b.strokes, rec];
    }
    curPath.current = null;
    curMeta.current = null;
    redraw();
  };

  // Gesture cancelled (e.g. a second finger landed) — throw the mark away and
  // undo the history snapshot it pushed, so panning/zooming never leaves a line.
  const discardStroke = () => {
    if (curPath.current) {
      curPath.current = null;
      curMeta.current = null;
      bucketFor(figureRef.current).undo.pop();
      redraw();
    }
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .maxPointers(1)
        .onStart((e) => onStart(e.x, e.y))
        .onUpdate((e) => onMove(e.x, e.y))
        .onEnd(() => commitStroke())
        .onFinalize((_e, success) => {
          observing.current = false;
          if (!success) discardStroke();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height]
  );

  const pinchStart = useRef({ k: 1, boxFx: 0, boxFy: 0 });
  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .onBegin((e) => {
          // A second finger landed — abandon any in-progress mark so panning/
          // zooming with two fingers never draws or erases.
          observing.current = false;
          discardStroke();
          const { k, tx, ty } = xfRef.current;
          pinchStart.current = { k, boxFx: (e.focalX - tx) / k, boxFy: (e.focalY - ty) / k };
        })
        .onUpdate((e) => {
          const st = pinchStart.current;
          const k = Math.min(MAX_ZOOM, Math.max(1, st.k * e.scale));
          applyXf({ k, tx: e.focalX - k * st.boxFx, ty: e.focalY - k * st.boxFy });
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, height]
  );

  const composed = useMemo(() => Gesture.Simultaneous(pan, pinch), [pan, pinch]);

  useImperativeHandle(ref, () => ({
    undo: () => {
      const b = bucketFor(figureRef.current);
      if (!b.undo.length) return;
      b.redo.push({ strokes: b.strokes, fills: b.fills });
      const s = b.undo.pop() as Snapshot;
      b.strokes = s.strokes;
      b.fills = s.fills;
      redraw();
    },
    redo: () => {
      const b = bucketFor(figureRef.current);
      if (!b.redo.length) return;
      b.undo.push({ strokes: b.strokes, fills: b.fills });
      const s = b.redo.pop() as Snapshot;
      b.strokes = s.strokes;
      b.fills = s.fills;
      redraw();
    },
    clear: () => {
      const b = bucketFor(figureRef.current);
      if (!b.strokes.length && !b.fills.length) return;
      b.undo.push({ strokes: b.strokes, fills: b.fills });
      b.strokes = [];
      b.fills = [];
      redraw();
    },
    capture: () => canvasRef.current?.makeImageSnapshot() ?? null,
    hasContent: () => {
      const b = bucketFor(figureRef.current);
      return b.strokes.length > 0 || b.fills.length > 0;
    },
  }));

  const b = buckets.current[figure];

  // Static layer — paper + croquis + committed strokes/fills. Memoised so it is
  // NOT redrawn while a stroke is in progress (only when content is committed).
  const staticEl = useMemo(
    () => (
      <Group transform={[{ scale: f }]}>
        <Rect x={0} y={0} width={LW} height={LH} color={PAPER} />
        {croquisPath && (
          <Group transform={[{ translateX: cOx }, { translateY: cOy }, { scale: cScale }]}>
            <Group transform={[{ translateX: 0 }, { translateY: vec.h }, { scaleX: 0.1 }, { scaleY: -0.1 }]}>
              <Path path={croquisPath} color={CHARCOAL} />
            </Group>
          </Group>
        )}
        {b.fills.map((img, i) => (
          <SkiaImage key={`f${i}`} image={img} x={0} y={0} width={LW} height={LH} fit="fill" />
        ))}
        <Group layer>
          {b.strokes.map((sr, i) => (
            <Path key={`s${i}`} path={sr.path} style="stroke" strokeWidth={sr.width} strokeCap="round" strokeJoin="round" color={sr.color} blendMode={sr.erase ? 'clear' : 'srcOver'} />
          ))}
        </Group>
      </Group>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [f, croquisPath, cOx, cOy, cScale, vec.h, b.strokes, b.fills]
  );

  const cm = curMeta.current;

  return (
    <View style={{ width, height }}>
      <GestureDetector gesture={composed}>
        <View style={{ width, height, borderRadius: 16, overflow: 'hidden', backgroundColor: PAPER }}>
          <View
            style={{
              width,
              height,
              transform: [{ translateX: xf.tx }, { translateY: xf.ty }, { scale: xf.k }],
              transformOrigin: 'top left',
            }}
          >
            {/* static layer (heavy, only redraws on commit) */}
            <Canvas ref={canvasRef} style={{ width, height, position: 'absolute', left: 0, top: 0 }}>
              {staticEl}
            </Canvas>
            {/* live layer (light, redraws each move) */}
            <Canvas style={{ width, height, position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
              <Group transform={[{ scale: f }]}>
                {curPath.current && cm && (
                  <Path
                    path={curPath.current}
                    style="stroke"
                    strokeWidth={cm.width}
                    strokeCap="round"
                    strokeJoin="round"
                    color={cm.erase ? PAPER : cm.color}
                  />
                )}
              </Group>
            </Canvas>
          </View>
        </View>
      </GestureDetector>

      {onToggleFullscreen && (
        <Pressable onPress={onToggleFullscreen} style={[styles.cornerBtn, { left: 8 }]} hitSlop={8}>
          <Icon name={isFullscreen ? 'minimize' : 'maximize'} size={14} color="#E9E1D2" strokeWidth={1.6} />
        </Pressable>
      )}
      {xf.k > 1.01 && (
        <Pressable onPress={resetZoom} style={[styles.cornerBtn, styles.resetBtn, { right: 8 }]} hitSlop={8}>
          <Text style={styles.resetText}>{xf.k.toFixed(1)}× · RESET</Text>
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cornerBtn: {
    position: 'absolute',
    top: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(16,13,10,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(190,138,90,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: { width: 'auto', paddingHorizontal: 12, borderRadius: 20 },
  resetText: { color: '#E9E1D2', fontSize: 10, letterSpacing: 1 },
});
