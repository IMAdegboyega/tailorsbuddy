import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { useApp } from '../state/AppContext';

/** Bottom-centred couture toast. */
export function Toast() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { toast } = useApp();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast) {
      anim.setValue(0);
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [toast, anim]);

  if (!toast) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.toast, { opacity: anim, transform: [{ translateY }] }]}>
        <Text style={styles.star}>✦</Text>
        <Text style={styles.text}>{toast}</Text>
      </Animated.View>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 0, right: 0, bottom: 28, alignItems: 'center', zIndex: 30 },
    toast: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.goldA(0.45),
      paddingVertical: 13,
      paddingHorizontal: 24,
      borderRadius: 3,
    },
    star: { color: t.gold, marginRight: 8, fontSize: 12 },
    text: { color: t.creamBright, fontSize: 12, letterSpacing: 1, fontFamily: fonts.sans },
  });
