import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { todayLabel } from '../data';
import { Icon } from '../components/Icon';
import { OutlineButton, PrimaryButton } from '../components/ui';
import { useApp } from '../state/AppContext';

const CANVAS_RATIO = 620 / 700;

export function ExportScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const ctx = useApp();
  const { active, garment, usedList, designImage, backToCanvas } = ctx;
  const client = active();

  const specRows = useMemo(() => {
    const secs = client.sections ?? [];
    const rows = secs.flatMap((s) =>
      s.fields.filter((f) => f.value.trim() !== '').map((f) => ({ label: f.label, value: f.value + '"' }))
    );
    return rows.slice(0, 12);
  }, [client]);

  const fabricNote = usedList.length
    ? 'Rendered in ' +
      usedList.map((u) => u.name.toLowerCase()).join(', ') +
      '. Hand-finished seams, couture lining throughout. Fittings to confirm drape before final cut.'
    : 'Fabric to be confirmed at first fitting. Hand-finished seams and couture lining throughout.';

  const specRef = 'TB-' + String(client.id).padStart(3, '0') + '-' + (client.designs.length + 1);
  const today = todayLabel();
  const garmentLabel = garment ?? '';

  const gradientTop = t.mode === 'dark' ? '#131210' : '#FCF8F1';
  const barBg = t.mode === 'dark' ? 'rgba(8,8,10,0.9)' : 'rgba(246,241,232,0.9)';

  return (
    <LinearGradient colors={[gradientTop, t.bg]} style={styles.fill}>
      <View style={[styles.topbar, { backgroundColor: barBg }]}>
        <Pressable onPress={backToCanvas} style={styles.back} hitSlop={8}>
          <Icon name="chevronLeft" size={14} color={t.goldA(0.75)} strokeWidth={1.6} />
          <Text style={styles.backLabel}>BACK TO CANVAS</Text>
        </Pressable>
        <View style={styles.topActions}>
          <OutlineButton label="SAVE IMAGE" icon="download" onPress={() => ctx.showToast('Design image saved')} />
          <PrimaryButton label="SEND TO CLIENT" icon="send" onPress={() => ctx.showToast('Spec sheet sent to ' + client.name)} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* shareable card */}
        <View style={styles.cardCol}>
          <Text style={styles.sectionLabel}>SHAREABLE CARD</Text>
          <View style={styles.card}>
            <LinearGradient colors={[t.sketchLight, t.sketchDark]} style={styles.cardImg}>
              {!!designImage && <Image source={{ uri: designImage }} style={styles.cardImage} resizeMode="contain" />}
            </LinearGradient>
            <View style={styles.cardMeta}>
              <Text style={styles.cardBrand}>Tailors Buddy</Text>
              <Text style={styles.cardTitle}>
                {garmentLabel} for {client.name}
              </Text>
              <View style={styles.rule} />
              <Text style={styles.cardDate}>{today}</Text>
            </View>
          </View>
        </View>

        {/* spec sheet */}
        <View style={styles.specCol}>
          <Text style={styles.sectionLabel}>SPEC SHEET</Text>
          <View style={styles.spec}>
            <View style={styles.specHead}>
              <View>
                <Text style={styles.specBrand}>TAILORS BUDDY</Text>
                <Text style={styles.specSub}>couture specification sheet</Text>
              </View>
              <View style={styles.specMono}>
                <Text style={styles.specMonoMark}>TB</Text>
              </View>
            </View>

            <View style={styles.specMain}>
              <LinearGradient colors={[t.sketchLight, t.sketchDark]} style={styles.specImg}>
                {!!designImage && <Image source={{ uri: designImage }} style={styles.specImage} resizeMode="contain" />}
              </LinearGradient>
              <View style={styles.specInfo}>
                <View style={styles.specNameRow}>
                  <Text style={styles.specName}>{client.name}</Text>
                  <Text style={styles.specGarment}>{garmentLabel}</Text>
                </View>
                <Text style={styles.specContact}>{client.contact}</Text>
                <Text style={styles.specMeasLabel}>MEASUREMENTS · IN</Text>
                <View style={styles.specGrid}>
                  {specRows.map((s) => (
                    <View key={s.label} style={styles.specRow}>
                      <Text style={styles.specRowLabel}>{s.label}</Text>
                      <Text style={styles.specRowValue}>{s.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.specNotes}>
              <Text style={styles.specMeasLabel}>FABRIC &amp; FINISH NOTES</Text>
              <View style={styles.fabricTags}>
                {usedList.map((u) => (
                  <View key={u.name} style={styles.fabricTag}>
                    <View style={[styles.fabricDot, { backgroundColor: u.dot }]} />
                    <Text style={styles.fabricTagText}>{u.name}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.fabricNote}>{fabricNote}</Text>
            </View>

            <View style={styles.specFooter}>
              <Text style={styles.specRef}>
                Ref · {specRef} · {today}
              </Text>
              <View>
                <View style={styles.signLine} />
                <Text style={styles.signLabel}>S. VAUX · MAÎTRE TAILLEUR</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    topbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      paddingHorizontal: 24,
      borderBottomWidth: 1,
      borderBottomColor: t.line,
      flexWrap: 'wrap',
      gap: 12,
    },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    backLabel: { color: t.goldA(0.75), fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
    topActions: { flexDirection: 'row', gap: 12 },
    body: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 30, padding: 34, paddingBottom: 50 },
    cardCol: { width: 300 },
    sectionLabel: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.6), marginBottom: 12, fontFamily: fonts.sans },
    card: { borderWidth: 1, borderColor: t.line, borderRadius: radii.card, overflow: 'hidden', backgroundColor: t.bgCard, ...softShadow('card') },
    cardImg: { padding: 14, minHeight: 200, alignItems: 'center', justifyContent: 'center' },
    cardImage: { width: '100%', aspectRatio: CANVAS_RATIO, borderRadius: 2 },
    cardMeta: { padding: 20, paddingTop: 18, alignItems: 'center' },
    cardBrand: { fontFamily: fonts.serifItalic, fontSize: 15, color: t.gold, letterSpacing: 1 },
    cardTitle: { fontFamily: fonts.serif, fontSize: 22, color: t.creamBright, marginTop: 6, textAlign: 'center' },
    rule: { width: 36, height: 1, backgroundColor: t.goldA(0.4), marginVertical: 12 },
    cardDate: { fontSize: 11, color: t.creamA(0.5), letterSpacing: 0.5, fontFamily: fonts.sans },
    specCol: { width: 520, maxWidth: '100%' },
    spec: { backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.line, borderRadius: radii.card, padding: 34, ...softShadow('card') },
    specHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: t.goldA(0.22),
      paddingBottom: 20,
    },
    specBrand: { fontFamily: fonts.serif, fontSize: 26, letterSpacing: 4, color: t.creamBright },
    specSub: { fontFamily: fonts.serifItalic, fontSize: 15, color: t.goldA(0.75), marginTop: 2 },
    specMono: { width: 44, height: 44, borderRadius: 14, backgroundColor: t.goldA(0.08), borderWidth: 1, borderColor: t.goldA(0.35), alignItems: 'center', justifyContent: 'center' },
    specMonoMark: { fontFamily: fonts.serifItalic, fontSize: 15, color: t.gold },
    specMain: { flexDirection: 'row', gap: 26, marginTop: 24 },
    specImg: { width: 150, borderRadius: 2, padding: 8, minHeight: 170, alignItems: 'center', justifyContent: 'center' },
    specImage: { width: '100%', aspectRatio: CANVAS_RATIO },
    specInfo: { flex: 1, minWidth: 0 },
    specNameRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
    specName: { fontFamily: fonts.serif, fontSize: 20, color: t.creamBright },
    specGarment: { fontSize: 11, letterSpacing: 1, color: t.goldA(0.7), fontFamily: fonts.sans },
    specContact: { fontSize: 11, color: t.creamA(0.45), marginBottom: 14, fontFamily: fonts.sans },
    specMeasLabel: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.7), marginBottom: 8, fontFamily: fonts.sans },
    specGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    specRow: { width: '46%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: t.goldA(0.1) },
    specRowLabel: { fontSize: 11, color: t.creamA(0.6), fontFamily: fonts.sans },
    specRowValue: { fontFamily: fonts.serif, fontSize: 15, color: t.creamBright },
    specNotes: { marginTop: 22, borderTopWidth: 1, borderTopColor: t.goldA(0.18), paddingTop: 16 },
    fabricTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    fabricTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      borderRadius: 20,
      paddingVertical: 5,
      paddingLeft: 6,
      paddingRight: 12,
    },
    fabricDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: t.goldA(0.4) },
    fabricTagText: { fontSize: 11, color: t.creamA(0.75), fontFamily: fonts.sans },
    fabricNote: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 22, color: t.creamA(0.55) },
    specFooter: { marginTop: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    specRef: { fontSize: 10, letterSpacing: 1, color: t.creamA(0.35), fontFamily: fonts.sans },
    signLine: { width: 120, borderBottomWidth: 1, borderBottomColor: t.goldA(0.35), marginBottom: 5 },
    signLabel: { fontSize: 10, letterSpacing: 1, color: t.goldA(0.65), fontFamily: fonts.sans, textAlign: 'right' },
  });
