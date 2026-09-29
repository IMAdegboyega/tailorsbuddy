import React, { createContext, useContext, useMemo, useState } from 'react';

import { DARK, LIGHT, Palette } from '../theme';

export type ThemeMode = 'dark' | 'light';

interface ThemeCtx {
  t: Palette;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const value = useMemo<ThemeCtx>(
    () => ({
      t: mode === 'light' ? LIGHT : DARK,
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** The active palette. */
export function useTheme(): Palette {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx.t;
}

/** Theme mode + setters (for the Settings toggle). */
export function useThemeMode(): { mode: ThemeMode; setMode: (m: ThemeMode) => void; toggle: () => void } {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useThemeMode must be used within a ThemeProvider');
  return { mode: ctx.mode, setMode: ctx.setMode, toggle: ctx.toggle };
}

export type { Palette };
