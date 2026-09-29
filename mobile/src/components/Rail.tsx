import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon, IconName } from './Icon';
import { Screen, useApp } from '../state/AppContext';

interface RailItem {
  name: IconName;
  active: boolean;
  onPress: () => void;
}

/** The slim left navigation rail that persists across the shell screens. */
export function Rail() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { screen, goClients, goPricing, goSettings } = useApp();

  const shellClients: Screen[] = ['clients', 'detail', 'newdesign'];
  const items: RailItem[] = [
    { name: 'users', active: shellClients.includes(screen), onPress: goClients },
    { name: 'dollar', active: screen === 'pricing', onPress: goPricing },
    { name: 'settings', active: screen === 'settings', onPress: goSettings },
  ];

  return (
    <View style={styles.rail}>
      <View style={styles.logo}>
        <Text style={styles.logoMark}>TB</Text>
      </View>
      <View style={styles.items}>
        {items.map((it) => (
          <Pressable
            key={it.name}
            onPress={it.onPress}
            style={({ pressed }) => [
              styles.item,
              it.active
                ? [{ backgroundColor: t.gold, shadowColor: t.gold }, softShadow('pill')]
                : { backgroundColor: pressed ? t.goldA(0.1) : 'transparent' },
            ]}
          >
            <Icon
              name={it.name}
              size={21}
              color={it.active ? t.onGold : t.goldA(0.55)}
              strokeWidth={it.active ? 1.9 : 1.6}
            />
          </Pressable>
        ))}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>SV</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    rail: {
      width: 76,
      flex: 0,
      backgroundColor: t.bgRail,
      alignItems: 'center',
      paddingVertical: 22,
    },
    logo: {
      width: 44,
      height: 44,
      borderWidth: 1,
      borderColor: t.goldA(0.4),
      backgroundColor: t.goldA(0.08),
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 34,
    },
    logoMark: { fontFamily: fonts.serifItalic, fontSize: 17, color: t.gold },
    items: { flex: 1, gap: 10, alignItems: 'center' },
    item: {
      width: 48,
      height: 48,
      borderRadius: radii.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: t.goldA(0.12),
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: fonts.serif, fontSize: 13, color: t.gold },
  });
