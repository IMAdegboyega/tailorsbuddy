import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon } from './Icon';
import { useApp } from '../state/AppContext';

/**
 * The sketch canvas relies on @shopify/react-native-skia, a native module that
 * is present in development / production builds but may not be bundled in every
 * Expo Go client. If Skia fails to initialise, we catch it here and show a
 * graceful message instead of crashing the whole app.
 */
interface State {
  failed: boolean;
}

export class CanvasBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <CanvasUnavailable />;
    return this.props.children;
  }
}

function CanvasUnavailable() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { backToDetail } = useApp();
  return (
    <View style={styles.fill}>
      <View style={styles.mono}>
        <Text style={styles.monoMark}>TB</Text>
      </View>
      <Text style={styles.title}>The sketch canvas needs a development build</Text>
      <Text style={styles.body}>
        Drawing uses Skia, a native graphics module that isn’t included in Expo Go. Run the project
        with a development build (`npx expo run:android` / `run:ios`, or an EAS dev build) and the
        canvas will work. Everything else in the app runs in Expo Go.
      </Text>
      <Pressable onPress={backToDetail} style={styles.back}>
        <Icon name="chevronLeft" size={14} color={t.gold} strokeWidth={1.6} />
        <Text style={styles.backLabel}>BACK</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 40 },
    mono: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 1,
      borderColor: t.goldA(0.45),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    monoMark: { fontFamily: fonts.serifItalic, fontSize: 26, color: t.gold },
    title: { fontFamily: fonts.serif, fontSize: 26, color: t.creamBright, textAlign: 'center', marginBottom: 14 },
    body: { fontSize: 13, lineHeight: 20, color: t.creamA(0.6), textAlign: 'center', maxWidth: 460, fontFamily: fonts.sans },
    back: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 30,
      borderWidth: 1,
      borderColor: t.goldA(0.4),
      paddingVertical: 11,
      paddingHorizontal: 20,
      borderRadius: 2,
    },
    backLabel: { color: t.gold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
  });
