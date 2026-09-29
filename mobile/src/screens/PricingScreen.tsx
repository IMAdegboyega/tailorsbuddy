import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon } from '../components/Icon';
import { Field } from '../components/ui';
import { useApp } from '../state/AppContext';

interface Plan {
  tag: string;
  price: string;
  per: string;
  features: string[];
  featured: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    tag: 'MONTHLY',
    price: '$1',
    per: '/ month',
    features: ['Unlimited clients', 'Spec-sheet export', 'Full fabric library', 'Client approval links'],
    featured: false,
  },
  {
    tag: 'YEARLY',
    price: '$10',
    per: '/ year',
    features: ['Everything in Monthly', 'Priority render exports', 'Custom brand watermark', 'Two months free'],
    featured: true,
    badge: 'BEST VALUE · 2 MONTHS FREE',
  },
];

export function PricingScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { showToast } = useApp();
  const { width } = useWindowDimensions();
  const stack = width - 78 < 620;

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Text style={styles.kicker}>MEMBERSHIP</Text>
        <Text style={styles.title}>Keep the atelier in your pocket</Text>
        <Text style={styles.subtitle}>Every plan includes the full couture toolkit.</Text>
      </View>

      <View style={[styles.plans, stack && { flexDirection: 'column' }]}>
        {PLANS.map((p) => (
          <View key={p.tag} style={[styles.plan, p.featured ? styles.planFeatured : styles.planPlain]}>
            {p.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{p.badge}</Text>
              </View>
            )}
            <Text style={[styles.planTag, { color: p.featured ? t.goldBright : t.goldA(0.75) }]}>{p.tag}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{p.price}</Text>
              <Text style={styles.per}>{p.per}</Text>
            </View>
            <View style={styles.planRule} />
            <View style={styles.features}>
              {p.features.map((f) => (
                <View key={f} style={styles.feature}>
                  <Icon name="check" size={15} color={p.featured ? t.goldBright : t.gold} strokeWidth={2} />
                  <Text style={[styles.featureText, { color: t.creamA(p.featured ? 0.85 : 0.75) }]}>{f}</Text>
                </View>
              ))}
            </View>
            <Pressable
              onPress={() => showToast('Welcome to Tailors Buddy — membership active')}
              style={({ pressed }) => [
                styles.subscribe,
                p.featured
                  ? { backgroundColor: pressed ? t.goldBright : t.gold }
                  : { borderWidth: 1, borderColor: t.goldA(0.5), backgroundColor: pressed ? t.goldA(0.08) : 'transparent' },
              ]}
            >
              <Text style={[styles.subscribeLabel, { color: p.featured ? t.onGold : t.gold }]}>SUBSCRIBE</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.payment}>
        <Text style={styles.payLabel}>PAYMENT DETAILS</Text>
        <Field label="Card number" placeholder="0000 0000 0000 0000" keyboardType="number-pad" style={{ marginBottom: 14 }} />
        <View style={styles.payRow}>
          <Field label="Name on card" placeholder="S. Vaux" style={styles.payCol} />
          <Field label="Expiry" placeholder="MM / YY" style={styles.payCol} />
          <Field label="CVC" placeholder="•••" style={styles.payCol} />
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    body: { padding: 38, paddingBottom: 60 },
    head: { alignItems: 'center', marginBottom: 34 },
    kicker: { fontSize: 11, letterSpacing: 3, color: t.goldA(0.7), marginBottom: 10, fontFamily: fonts.sans },
    title: { fontFamily: fonts.serif, fontSize: 36, color: t.creamBright, textAlign: 'center' },
    subtitle: { fontFamily: fonts.serifItalic, fontSize: 19, color: t.creamA(0.55), marginTop: 8, textAlign: 'center' },
    plans: { flexDirection: 'row', gap: 22, justifyContent: 'center', maxWidth: 760, width: '100%', alignSelf: 'center' },
    plan: { flex: 1, borderRadius: radii.card, padding: 28, paddingTop: 30 },
    planPlain: { borderWidth: 1, borderColor: t.line, backgroundColor: t.bgCard, ...softShadow('card') },
    planFeatured: { borderWidth: 1, borderColor: t.goldA(0.4), backgroundColor: t.bgCard, ...softShadow('lift') },
    badge: {
      position: 'absolute',
      top: -11,
      alignSelf: 'center',
      backgroundColor: t.gold,
      paddingVertical: 5,
      paddingHorizontal: 14,
      borderRadius: radii.pill,
    },
    badgeText: { fontSize: 9, letterSpacing: 1.5, color: t.onGold, fontFamily: fonts.sansSemiBold },
    planTag: { fontSize: 11, letterSpacing: 3, fontFamily: fonts.sans },
    priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 16 },
    price: { fontFamily: fonts.serif, fontSize: 48, color: t.creamBright },
    per: { fontSize: 13, color: t.creamA(0.5), fontFamily: fonts.sans },
    planRule: { height: 1, backgroundColor: t.goldA(0.18), marginVertical: 24 },
    features: { gap: 13 },
    feature: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
    featureText: { fontSize: 13, flex: 1, fontFamily: fonts.sans, lineHeight: 18 },
    subscribe: { marginTop: 28, paddingVertical: 14, borderRadius: radii.pill, alignItems: 'center' },
    subscribeLabel: { fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansSemiBold },
    payment: {
      maxWidth: 760,
      width: '100%',
      alignSelf: 'center',
      marginTop: 26,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.card,
      backgroundColor: t.bgCard,
      padding: 24,
      ...softShadow('card'),
    },
    payLabel: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.7), marginBottom: 16, fontFamily: fonts.sans },
    payRow: { flexDirection: 'row', gap: 18 },
    payCol: { flex: 1 },
  });
