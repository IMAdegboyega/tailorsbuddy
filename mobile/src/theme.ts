/**
 * Couture theme tokens for Tailors Buddy — "Maison Soft" design language.
 *
 * Warm charcoal ground · soft rounded cards · gentle shadows · gold pills.
 * Two palettes (dark + warm-ivory light) share the same shape (Palette).
 * Components read the active palette via `useTheme()` (see state/ThemeContext)
 * and build their styles from it, so the whole app switches at runtime.
 */

import { Platform, ViewStyle } from 'react-native';

export interface Palette {
  mode: 'dark' | 'light';

  // Deepest ground (root background behind everything).
  black: string;
  // Surfaces.
  bg: string;        // app frame / ground
  bgRail: string;    // navigation rail column
  bgPanel: string;   // large content panels
  bgCanvas: string;  // atelier canvas ground
  bgCard: string;    // soft filled card (rows, tiles)
  bgRaise: string;   // raised element (active chip, swatch, dock button)

  // Hairline / soft divider colour.
  line: string;

  // Accent.
  gold: string;
  goldBright: string;
  // Text/icon colour that sits ON the gold accent (dark in both modes).
  onGold: string;

  // Primary text tones.
  cream: string;
  creamBright: string;

  // Cream croquis paper (identical in both modes — it's paper).
  paperTop: string;
  paperBottom: string;
  sketchLight: string;
  sketchDark: string;

  // Alpha helpers.
  goldA: (a: number) => string;
  creamA: (a: number) => string;
}

export const DARK: Palette = {
  mode: 'dark',
  black: '#0F0C08',
  bg: '#14100B',
  bgRail: '#14100B',
  bgPanel: '#1C1813',
  bgCanvas: '#14100B',
  bgCard: '#26201A',
  bgRaise: '#2E2720',
  line: 'rgba(233,225,210,0.07)',
  gold: '#C9925A',
  goldBright: '#D9A46A',
  onGold: '#17120C',
  cream: '#E9E1D2',
  creamBright: '#F0E9DB',
  paperTop: '#faf7f0',
  paperBottom: '#efe8db',
  sketchLight: '#f6f2ea',
  sketchDark: '#e9e2d5',
  goldA: (a) => `rgba(201,146,90,${a})`,
  creamA: (a) => `rgba(233,225,210,${a})`,
};

export const LIGHT: Palette = {
  mode: 'light',
  black: '#E7DED0',
  bg: '#EFE8DC',
  bgRail: '#EDE5D6',
  bgPanel: '#F7F1E7',
  bgCanvas: '#ECE4D6',
  bgCard: '#FCF8F1',
  bgRaise: '#FFFFFF',
  line: 'rgba(58,47,34,0.10)',
  gold: '#A9743F',
  goldBright: '#8C5E2E',
  onGold: '#FBF6EE',
  cream: '#3A2F22',
  creamBright: '#241C12',
  paperTop: '#faf7f0',
  paperBottom: '#efe8db',
  sketchLight: '#f6f2ea',
  sketchDark: '#e9e2d5',
  goldA: (a) => `rgba(169,116,63,${a})`,
  creamA: (a) => `rgba(58,47,34,${a})`,
};

/** Rounded-corner scale — the "soft" in Maison Soft. */
export const radii = {
  pill: 999,
  card: 20,
  soft: 16,
  chip: 14,
  tile: 12,
} as const;

/**
 * Soft-shadow presets. On dark grounds these read as a gentle lift; the bright
 * cream papers on the dark canvas read as a lightbox glow. Cross-platform:
 * iOS honours shadowColor/opacity/radius, Android uses elevation.
 */
export function softShadow(level: 'card' | 'lift' | 'pill' | 'paper' = 'card'): ViewStyle {
  const map = {
    card: { radius: 18, opacity: 0.22, offset: 8, elevation: 4 },
    lift: { radius: 26, opacity: 0.3, offset: 12, elevation: 8 },
    pill: { radius: 16, opacity: 0.28, offset: 6, elevation: 6 },
    paper: { radius: 22, opacity: 0.26, offset: 10, elevation: 6 },
  }[level];
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: map.opacity,
      shadowRadius: map.radius,
      shadowOffset: { width: 0, height: map.offset },
    },
    android: { elevation: map.elevation },
    default: {},
  }) as ViewStyle;
}

export const fonts = {
  serif: 'CormorantGaramond_500Medium',
  serifRegular: 'CormorantGaramond_400Regular',
  serifItalic: 'CormorantGaramond_500Medium_Italic',
  serifSemiBold: 'CormorantGaramond_600SemiBold',
  sans: 'Jost_400Regular',
  sansLight: 'Jost_300Light',
  sansMedium: 'Jost_500Medium',
  sansSemiBold: 'Jost_600SemiBold',
} as const;
