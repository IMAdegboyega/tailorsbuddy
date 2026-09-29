import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { FABRICS, Fabric, INKS, WEIGHTS, WEIGHT_LABELS } from '../data';
import { Icon, IconName } from '../components/Icon';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../state/AppContext';
import { CANVAS_RATIO } from '../canvas/constants';
import { SketchPad, SketchPadHandle, ToolState } from '../canvas/SketchPad';
import { FillFn, fabricFill } from '../canvas/fills';

const FABRIC_CHIP: Record<string, string[]> = {
  silk: ['#d9c7a3', '#f0e6cf', '#c9b489'],
  satin: ['#20202a', '#4a4a58', '#1a1a22'],
  lace: ['#efe9dd', '#e3dccb', '#cfc7b4'],
  denim: ['#38507a', '#2e4060', '#243350'],
  velvet: ['#7a2a40', '#5a1d30', '#4a1526'],
  tulle: ['#f0d9d6', '#e3c3c0', '#d9b3af'],
};

const TOPBAR_H = 62;
const LABEL_H = 30;
const DOCK_W = 58;          // floating tool dock column
const DOCK_BAND = DOCK_W + 22;
const TRAY_W = 286;         // materials tray
const TRAY_DOCK_MIN = 780;  // width at/above which the tray docks open

type FS = 'front' | 'back' | null;

export function CanvasScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const {
    active,
    garment,
    backToDetail,
    exportDesign,
    tool,
    setTool,
    ink,
    setInk,
    weight,
    setWeight,
    figure,
    setFigure,
    fabric,
    setFabric,
    markFabric,
  } = useApp();
  const client = active();
  const { width: winW } = useWindowDimensions();

  const frontRef = useRef<SketchPadHandle>(null);
  const backRef = useRef<SketchPadHandle>(null);
  const activeView = useRef<'front' | 'back'>('front');

  const fillFnRef = useRef<FillFn | null>(null);
  const usedRef = useRef<{ name: string; dot: string } | null>(null);

  const toolStateRef = useRef<ToolState>({ tool, ink, weight, fill: null, used: null });
  toolStateRef.current = { tool, ink, weight, fill: fillFnRef.current, used: usedRef.current };
  const getTools = useRef(() => toolStateRef.current).current;

  const [fullscreen, setFullscreen] = useState<FS>(null);

  const [fillSize, setFillSize] = useState({ w: 0, h: 0 });
  const onFill = (e: LayoutChangeEvent) =>
    setFillSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const fw = fillSize.w || winW;
  const fh = fillSize.h || 600;

  // The tray docks open on wide layouts; otherwise it slides in as a sheet.
  const trayDocked = fw >= TRAY_DOCK_MIN && !fullscreen;

  // ---- pad geometry ----
  const gap = 18;
  const regionTop = TOPBAR_H;
  const regionH = Math.max(160, fh - regionTop);
  const bandLeft = DOCK_BAND;
  const bandRight = trayDocked ? TRAY_W + 20 : 20;
  const bandW = Math.max(160, fw - bandLeft - bandRight);

  let nW = Math.max(110, (bandW - gap) / 2);
  let nH = nW / CANVAS_RATIO;
  const nAvailH = Math.max(150, regionH - 28 - LABEL_H);
  if (nH > nAvailH) {
    nH = nAvailH;
    nW = nH * CANVAS_RATIO;
  }
  const nTotalW = nW * 2 + gap;
  const nStartX = bandLeft + (bandW - nTotalW) / 2;
  const nTop = regionTop + (regionH - (nH + LABEL_H)) / 2 + LABEL_H;

  // fullscreen size
  let fsW = Math.max(120, fw - DOCK_BAND - 24);
  let fsH = fsW / CANVAS_RATIO;
  const fsAvailH = Math.max(160, fh - 24 - LABEL_H);
  if (fsH > fsAvailH) {
    fsH = fsAvailH;
    fsW = fsH * CANVAS_RATIO;
  }

  const geoFor = (which: 'front' | 'back') => {
    if (fullscreen) {
      if (fullscreen !== which) return { hidden: true, left: 0, top: 0, w: nW, h: nH, fs: false, z: 0 };
      return { hidden: false, left: DOCK_BAND + (fw - DOCK_BAND - fsW) / 2, top: (fh - (fsH + LABEL_H)) / 2 + LABEL_H, w: fsW, h: fsH, fs: true, z: 20 };
    }
    const left = which === 'front' ? nStartX : nStartX + nW + gap;
    return { hidden: false, left, top: nTop, w: nW, h: nH, fs: false, z: 1 };
  };

  const chooseFabric = (fab: Fabric) => {
    fillFnRef.current = fabricFill(fab);
    usedRef.current = { name: fab.name, dot: FABRIC_CHIP[fab.id]?.[1] ?? '#BE8A5A' };
    setFabric(fab.id);
    setTool('fill');
    armHide();
  };

  const activePad = () => (activeView.current === 'back' ? backRef.current : frontRef.current);

  const doExport = () => {
    const p = activePad();
    const img =
      p && p.hasContent()
        ? p.capture()
        : frontRef.current?.hasContent()
        ? frontRef.current.capture()
        : (frontRef.current ?? backRef.current)?.capture() ?? null;
    exportDesign(img ? `data:image/png;base64,${img.encodeToBase64()}` : '');
  };

  const toggleFullscreen = (which: 'front' | 'back') => {
    setFullscreen((cur) => {
      const next = cur === which ? null : which;
      if (next) activeView.current = which;
      hideDrawer();
      return next;
    });
  };

  // ---- full-screen tool drawer (auto-hides) ----
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearHide = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
  };
  const hideDrawer = () => {
    clearHide();
    setDrawerOpen(false);
    Animated.timing(drawerAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };
  const armHide = () => {
    clearHide();
    hideTimer.current = setTimeout(hideDrawer, 4200);
  };
  const showDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    armHide();
  };

  // ---- materials tray (slide-in sheet when not docked) ----
  const trayAnim = useRef(new Animated.Value(0)).current;
  const [traySheet, setTraySheet] = useState(false);
  const openTray = () => {
    setTraySheet(true);
    Animated.timing(trayAnim, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  };
  const closeTray = () => {
    Animated.timing(trayAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setTraySheet(false));
  };

  // ---------- small building blocks ----------
  const DockBtn = ({ icon, on, onPress }: { icon: IconName; on?: boolean; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={[styles.dockBtn, on && { backgroundColor: t.gold }]}
    >
      <Icon name={icon} size={19} color={on ? t.onGold : t.goldA(0.85)} strokeWidth={on ? 1.9 : 1.6} />
    </Pressable>
  );

  // The tool dock (vertical, floating). `variant` tunes it for the drawer.
  const ToolDock = ({ onAny }: { onAny?: () => void }) => (
    <View style={styles.dock}>
      <DockBtn icon="pencil" on={tool === 'pencil'} onPress={() => { onAny?.(); setTool(tool === 'pencil' ? 'observe' : 'pencil'); }} />
      <DockBtn icon="eraser" on={tool === 'eraser'} onPress={() => { onAny?.(); setTool(tool === 'eraser' ? 'observe' : 'eraser'); }} />
      <View style={styles.dockSep} />
      <DockBtn icon="undo" onPress={() => { onAny?.(); activePad()?.undo(); }} />
      <DockBtn icon="redo" onPress={() => { onAny?.(); activePad()?.redo(); }} />
      <DockBtn icon="trash" onPress={() => { onAny?.(); activePad()?.clear(); }} />
      {!trayDocked && (
        <>
          <View style={styles.dockSep} />
          <DockBtn icon="sliders" on={traySheet} onPress={() => { onAny?.(); traySheet ? closeTray() : openTray(); }} />
        </>
      )}
    </View>
  );

  const inkActive = tool === 'pencil';

  // The materials tray content — shared by the docked panel and the sheet.
  const TrayContent = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.trayBody}>
      <Text style={styles.traySection}>INK</Text>
      <View style={styles.inkGrid}>
        {INKS.map((v) => (
          <Pressable key={v} onPress={() => { setInk(v); armHide(); }} style={[styles.inkItem, ink === v && inkActive && styles.inkItemOn, ink === v && inkActive && { borderColor: t.gold }]}>
            <View style={[styles.inkDot, { backgroundColor: v }]} />
          </Pressable>
        ))}
      </View>

      <Text style={[styles.traySection, { marginTop: 22 }]}>WEIGHT</Text>
      <View style={styles.weightRow}>
        {WEIGHTS.map((w) => {
          const on = weight === w;
          return (
            <Pressable key={w} onPress={() => { setWeight(w); armHide(); }} style={styles.weightItem}>
              <View style={[styles.weightDot, on && { backgroundColor: t.gold, borderColor: t.gold }]}>
                <View style={{ width: w * 2 + 3, height: w * 2 + 3, borderRadius: 99, backgroundColor: on ? t.onGold : t.goldA(0.7) }} />
              </View>
              <Text style={[styles.weightLabel, on && { color: t.creamBright, fontFamily: fonts.sansMedium }]}>{WEIGHT_LABELS[w] ?? String(w)}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.traySection, { marginTop: 22 }]}>FABRICS</Text>
      <View style={styles.fabricGrid}>
        {FABRICS.map((fab) => {
          const on = fabric === fab.id && tool === 'fill';
          return (
            <Pressable key={fab.id} onPress={() => chooseFabric(fab)} style={styles.fabricCell}>
              <LinearGradient
                colors={FABRIC_CHIP[fab.id] as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.fabricChip, { borderColor: on ? t.gold : t.line, borderWidth: on ? 2 : 1 }]}
              />
              <Text style={styles.fabricName}>{fab.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.traySection, { marginTop: 22 }]}>FIGURE</Text>
      <View style={styles.figureSeg}>
        <Pressable onPress={() => setFigure('female')} style={[styles.segBtn, figure === 'female' && { backgroundColor: t.bgRaise, ...softShadow('card') }]}>
          <Text style={[styles.segLabel, { color: figure === 'female' ? t.creamBright : t.creamA(0.5) }]}>FEMALE</Text>
        </Pressable>
        <Pressable onPress={() => setFigure('male')} style={[styles.segBtn, figure === 'male' && { backgroundColor: t.bgRaise, ...softShadow('card') }]}>
          <Text style={[styles.segLabel, { color: figure === 'male' ? t.creamBright : t.creamA(0.5) }]}>MALE</Text>
        </Pressable>
      </View>
    </ScrollView>
  );

  const drawerX = drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [-(DOCK_W + 34), 0] });
  const trayX = trayAnim.interpolate({ inputRange: [0, 1], outputRange: [TRAY_W + 40, 0] });

  return (
    <View style={styles.fill} onLayout={onFill}>
      {/* top bar */}
      <View style={styles.topbar}>
        <View style={styles.topLeft}>
          <Pressable onPress={backToDetail} hitSlop={8} style={styles.topBack}>
            <Icon name="chevronLeft" size={17} color={t.goldA(0.85)} strokeWidth={1.8} />
          </Pressable>
          <View style={styles.headMeta}>
            <View style={styles.clientChip}>
              <Text style={styles.clientChipText}>{client.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}</Text>
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.topKicker}>DESIGNING FOR</Text>
              <Text style={styles.topClient} numberOfLines={1}>
                {client.name} ·{' '}
                <Text style={styles.topGarment}>{garment ?? (figure === 'male' ? 'Male' : 'Female')}</Text>
              </Text>
            </View>
          </View>
        </View>
        <PrimaryButton label="EXPORT" icon="upload" onPress={doExport} style={{ paddingVertical: 11 }} />
      </View>

      {/* background behind pads */}
      <View
        pointerEvents="none"
        style={[
          styles.canvasBg,
          fullscreen
            ? { top: 0, height: fh, backgroundColor: t.black, zIndex: 5 }
            : { top: regionTop, height: regionH, backgroundColor: t.bgCanvas, zIndex: 0 },
        ]}
      />

      {/* both pads stay mounted (state preserved); geometry drives layout */}
      {(['front', 'back'] as const).map((which) => {
        const g = geoFor(which);
        return (
          <View
            key={which}
            style={{ position: 'absolute', left: g.left, top: g.top, width: g.w, height: g.h, zIndex: g.z, display: g.hidden ? 'none' : 'flex' }}
          >
            <View style={styles.padLabelPill}>
              <Text style={styles.padLabel}>{which.toUpperCase()}</Text>
            </View>
            <View style={styles.paperShadow}>
              <SketchPad
                ref={which === 'front' ? frontRef : backRef}
                view={which}
                figure={figure}
                width={g.w}
                height={g.h}
                getTools={getTools}
                onFillUsed={markFabric}
                onActivate={() => (activeView.current = which)}
                onToggleFullscreen={() => toggleFullscreen(which)}
                isFullscreen={g.fs}
              />
            </View>
          </View>
        );
      })}

      {/* floating tool dock (non-fullscreen) */}
      {!fullscreen && (
        <View style={[styles.dockWrap, { top: regionTop, height: regionH }]} pointerEvents="box-none">
          <ToolDock />
        </View>
      )}

      {/* docked materials tray (wide, non-fullscreen) */}
      {trayDocked && (
        <View style={[styles.trayDock, { top: regionTop, height: regionH }]}>
          <TrayContent />
        </View>
      )}

      {/* full-screen drawer + FAB */}
      {fullscreen && (
        <>
          {!drawerOpen && (
            <Pressable onPress={showDrawer} style={styles.fab}>
              <Icon name="sliders" size={20} color={t.onGold} strokeWidth={1.7} />
            </Pressable>
          )}
          <Animated.View
            pointerEvents={drawerOpen ? 'auto' : 'none'}
            style={[styles.drawerWrap, { transform: [{ translateX: drawerX }] }]}
          >
            <View style={styles.dock}>
              <DockBtn icon="minimize" onPress={() => { armHide(); toggleFullscreen(fullscreen); }} />
              <View style={styles.dockSep} />
              <DockBtn icon="pencil" on={tool === 'pencil'} onPress={() => { armHide(); setTool(tool === 'pencil' ? 'observe' : 'pencil'); }} />
              <DockBtn icon="eraser" on={tool === 'eraser'} onPress={() => { armHide(); setTool(tool === 'eraser' ? 'observe' : 'eraser'); }} />
              <View style={styles.dockSep} />
              <DockBtn icon="undo" onPress={() => { armHide(); activePad()?.undo(); }} />
              <DockBtn icon="redo" onPress={() => { armHide(); activePad()?.redo(); }} />
              <DockBtn icon="trash" onPress={() => { armHide(); activePad()?.clear(); }} />
              <View style={styles.dockSep} />
              <DockBtn icon="sliders" on={traySheet} onPress={() => { armHide(); traySheet ? closeTray() : openTray(); }} />
            </View>
          </Animated.View>
        </>
      )}

      {/* materials tray sheet (narrow / fullscreen) */}
      {traySheet && !trayDocked && (
        <>
          <Pressable style={styles.trayBackdrop} onPress={closeTray} />
          <Animated.View style={[styles.traySheet, { transform: [{ translateX: trayX }] }]}>
            <View style={styles.traySheetHead}>
              <Text style={styles.traySheetTitle}>Materials</Text>
              <Pressable onPress={closeTray} hitSlop={8} style={styles.trayClose}>
                <Icon name="chevronRight" size={16} color={t.goldA(0.8)} strokeWidth={1.7} />
              </Pressable>
            </View>
            <TrayContent />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1, backgroundColor: t.bg },

    // top bar
    topbar: {
      height: TOPBAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      backgroundColor: t.bgRail,
      zIndex: 6,
    },
    topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
    topBack: {
      width: 40,
      height: 40,
      borderRadius: radii.chip,
      backgroundColor: t.goldA(0.08),
      borderWidth: 1,
      borderColor: t.goldA(0.22),
      alignItems: 'center',
      justifyContent: 'center',
    },
    headMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
    clientChip: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: t.goldA(0.14),
      borderWidth: 1,
      borderColor: t.goldA(0.26),
      alignItems: 'center',
      justifyContent: 'center',
    },
    clientChipText: { fontFamily: fonts.serif, fontSize: 15, color: t.gold },
    topKicker: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.6), fontFamily: fonts.sans },
    topClient: { fontFamily: fonts.serif, fontSize: 18, color: t.creamBright, lineHeight: 20 },
    topGarment: { fontFamily: fonts.serifItalic, color: t.gold },

    canvasBg: { position: 'absolute', left: 0, right: 0 },

    // paper label pill (floats over the top edge of each paper)
    padLabelPill: {
      position: 'absolute',
      top: -14,
      alignSelf: 'center',
      zIndex: 3,
      backgroundColor: t.bgRaise,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.pill,
      paddingVertical: 5,
      paddingHorizontal: 16,
      ...softShadow('card'),
    },
    padLabel: { fontSize: 10, letterSpacing: 2.5, color: t.goldA(0.9), fontFamily: fonts.sansMedium },
    paperShadow: { borderRadius: 16, backgroundColor: '#faf7f0', ...softShadow('paper') },

    // tool dock
    dockWrap: { position: 'absolute', left: 0, width: DOCK_BAND, alignItems: 'center', justifyContent: 'center', zIndex: 12 },
    dock: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 7,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.pill,
      ...softShadow('lift'),
    },
    dockBtn: {
      width: 44,
      height: 44,
      borderRadius: radii.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dockSep: { width: 22, height: 1, backgroundColor: t.line, marginVertical: 2 },

    // docked tray
    trayDock: {
      position: 'absolute',
      right: 0,
      width: TRAY_W,
      backgroundColor: t.bgPanel,
      borderLeftWidth: 1,
      borderLeftColor: t.line,
      zIndex: 8,
    },
    trayBody: { padding: 22, paddingBottom: 60 },
    traySection: { fontSize: 10, letterSpacing: 2.5, color: t.goldA(0.75), fontFamily: fonts.sansMedium, marginBottom: 14 },

    inkGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
    inkItem: { padding: 4, borderRadius: 99, borderWidth: 1.5, borderColor: 'transparent' },
    inkItemOn: {},
    inkDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: t.creamA(0.2) },

    weightRow: { flexDirection: 'row', justifyContent: 'space-between' },
    weightItem: { alignItems: 'center', gap: 9, flex: 1 },
    weightDot: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weightLabel: { fontSize: 10, letterSpacing: 0.4, color: t.creamA(0.5), fontFamily: fonts.sans },

    fabricGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    fabricCell: { width: '31%', alignItems: 'center', gap: 7, marginBottom: 16 },
    fabricChip: { width: '100%', height: 46, borderRadius: radii.tile },
    fabricName: { fontSize: 10, letterSpacing: 0.4, color: t.creamA(0.6), fontFamily: fonts.sans },

    figureSeg: {
      flexDirection: 'row',
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.pill,
      padding: 4,
    },
    segBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: 'center' },
    segLabel: { fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.sansSemiBold },

    // fullscreen drawer
    fab: {
      position: 'absolute',
      left: 16,
      bottom: 26,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: t.gold,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 30,
      ...softShadow('lift'),
      shadowColor: t.gold,
    },
    drawerWrap: {
      position: 'absolute',
      left: 14,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      zIndex: 31,
    },

    // tray sheet
    trayBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,6,4,0.4)', zIndex: 40 },
    traySheet: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: TRAY_W,
      backgroundColor: t.bgPanel,
      borderLeftWidth: 1,
      borderLeftColor: t.line,
      zIndex: 41,
      ...softShadow('lift'),
    },
    traySheetHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 4,
    },
    traySheetTitle: { fontFamily: fonts.serif, fontSize: 24, color: t.creamBright },
    trayClose: {
      width: 34,
      height: 34,
      borderRadius: 12,
      backgroundColor: t.goldA(0.08),
      borderWidth: 1,
      borderColor: t.goldA(0.2),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
