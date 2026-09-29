import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme, useThemeMode } from '../state/ThemeContext';
import { Field } from '../components/ui';
import { useApp } from '../state/AppContext';

export function SettingsScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { mode, setMode } = useThemeMode();
  const { goPricing } = useApp();
  const [name, setName] = useState('Séverine Vaux');
  const [atelier, setAtelier] = useState('Tailors Buddy');

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>ATELIER</Text>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.stack}>
        {/* profile */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PROFILE</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>SV</Text>
            </View>
            <View style={styles.profileFields}>
              <Field label="Name" value={name} onChangeText={setName} style={styles.col} />
              <Field label="Atelier" value={atelier} onChangeText={setAtelier} style={styles.col} />
            </View>
          </View>
        </View>

        {/* appearance */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>APPEARANCE</Text>
          <View style={styles.appearanceRow}>
            <Text style={styles.appearanceHint}>Choose the atelier’s mood</Text>
            <View style={styles.seg}>
              <Pressable onPress={() => setMode('dark')} style={[styles.segBtn, mode === 'dark' && styles.segOn]}>
                <Text style={[styles.segLabel, { color: mode === 'dark' ? t.onGold : t.goldA(0.8) }]}>DARK</Text>
              </Pressable>
              <Pressable onPress={() => setMode('light')} style={[styles.segBtn, mode === 'light' && styles.segOn]}>
                <Text style={[styles.segLabel, { color: mode === 'light' ? t.onGold : t.goldA(0.8) }]}>LIGHT</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* brand logo */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>BRAND LOGO — FOR EXPORTS</Text>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoMark}>TB</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Pressable style={({ pressed }) => [styles.upload, pressed && { backgroundColor: t.goldA(0.08) }]}>
                <Text style={styles.uploadLabel}>UPLOAD LOGO</Text>
              </Pressable>
              <Text style={styles.logoNote}>PNG or SVG · appears on every spec sheet</Text>
            </View>
          </View>
        </View>

        {/* plan status */}
        <View style={[styles.card, styles.planCard]}>
          <View>
            <Text style={styles.cardLabel}>PLAN STATUS</Text>
            <Text style={styles.planValue}>Yearly · Active</Text>
            <Text style={styles.planRenew}>Renews 14 March 2027</Text>
          </View>
          <Pressable onPress={goPricing} style={({ pressed }) => [styles.manage, pressed && { backgroundColor: t.goldA(0.08) }]}>
            <Text style={styles.manageLabel}>MANAGE PLAN</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    body: { padding: 34, paddingBottom: 60 },
    kicker: { fontSize: 11, letterSpacing: 3, color: t.goldA(0.7), marginBottom: 8, fontFamily: fonts.sans },
    title: { fontFamily: fonts.serif, fontSize: 36, color: t.creamBright, marginBottom: 30 },
    stack: { maxWidth: 620, gap: 14 },
    card: { borderWidth: 1, borderColor: t.line, borderRadius: radii.card, padding: 24, backgroundColor: t.bgCard, ...softShadow('card') },
    cardLabel: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.7), marginBottom: 18, fontFamily: fonts.sans },
    profileRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
    avatar: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: t.goldA(0.1),
      borderWidth: 1,
      borderColor: t.goldA(0.32),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: fonts.serif, fontSize: 22, color: t.gold },
    profileFields: { flex: 1, flexDirection: 'row', gap: 16 },
    col: { flex: 1 },
    appearanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
    appearanceHint: { fontFamily: fonts.serifItalic, fontSize: 16, color: t.creamA(0.65) },
    seg: { flexDirection: 'row', borderWidth: 1, borderColor: t.goldA(0.25), borderRadius: radii.pill, padding: 4, backgroundColor: t.goldA(0.04) },
    segBtn: { paddingVertical: 9, paddingHorizontal: 20, borderRadius: radii.pill },
    segOn: { backgroundColor: t.gold },
    segLabel: { fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansSemiBold },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    logoBox: {
      width: 88,
      height: 88,
      borderWidth: 1.5,
      borderColor: t.goldA(0.3),
      borderStyle: 'dashed',
      borderRadius: radii.soft,
      backgroundColor: t.goldA(0.04),
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoMark: { fontFamily: fonts.serifItalic, fontSize: 26, color: t.gold },
    upload: { alignSelf: 'flex-start', borderWidth: 1, borderColor: t.goldA(0.4), paddingVertical: 11, paddingHorizontal: 20, borderRadius: radii.pill },
    uploadLabel: { color: t.gold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
    logoNote: { fontSize: 11, color: t.creamA(0.4), marginTop: 10, fontFamily: fonts.sans },
    planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    planValue: { fontFamily: fonts.serif, fontSize: 20, color: t.creamBright },
    planRenew: { fontSize: 12, color: t.creamA(0.45), marginTop: 4, fontFamily: fonts.sans },
    manage: { borderWidth: 1, borderColor: t.goldA(0.4), paddingVertical: 11, paddingHorizontal: 20, borderRadius: radii.pill },
    manageLabel: { color: t.gold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
  });
