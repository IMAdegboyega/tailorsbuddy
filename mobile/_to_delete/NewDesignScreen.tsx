import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, cream, fonts, gold } from '../theme';
import { GICONS, GarmentName, TEMPLATES } from '../data';
import { PrimaryButton } from '../components/ui';
import { Icon } from '../components/Icon';
import { useApp } from '../state/AppContext';

export function NewDesignScreen() {
  const { active, backToDetail, garment, pickGarment, toCanvas } = useApp();
  const client = active();
  const { width } = useWindowDimensions();

  const garmentNames = Object.keys(TEMPLATES) as GarmentName[];
  const avail = Math.max(240, width - 78 - 80);
  const cols = Math.max(2, Math.min(garmentNames.length, Math.floor(avail / 150)));
  const tplCount = garment ? TEMPLATES[garment].length : 0;

  return (
    <View style={styles.fill}>
      <View style={styles.header}>
        <Pressable onPress={backToDetail} style={styles.back} hitSlop={8}>
          <Icon name="chevronLeft" size={13} color={gold(0.7)} strokeWidth={1.6} />
          <Text style={styles.backLabel}>{client.name}</Text>
        </Pressable>
        <View style={styles.stepRow}>
          <Text style={styles.step}>STEP 1 OF 2</Text>
          <Text style={styles.stepDim}>— CHOOSE THE GARMENT</Text>
        </View>
        <Text style={styles.title}>What are we creating?</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {garmentNames.map((g) => {
          const on = garment === g;
          return (
            <View key={g} style={{ width: `${100 / cols}%`, padding: 8 }}>
              <Pressable
                onPress={() => pickGarment(g)}
                style={[
                  styles.card,
                  {
                    borderColor: on ? colors.gold : gold(0.2),
                    backgroundColor: on ? gold(0.07) : 'transparent',
                  },
                ]}
              >
                <Svg viewBox="0 0 80 120" width={70} height={105}>
                  <Path
                    d={GICONS[g]}
                    fill="none"
                    stroke={on ? colors.goldBright : gold(0.55)}
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={[styles.cardName, { color: on ? colors.creamBright : cream(0.65) }]}>{g}</Text>
                <Text style={styles.cardMeasures}>{TEMPLATES[g].length} MEASURES</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {garment && (
        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Loaded the <Text style={styles.footerAccent}>{garment}</Text> measurement template for{' '}
            {client.name} — <Text style={styles.footerAccent}>{tplCount} fields</Text> ready.
          </Text>
          <PrimaryButton
            label="OPEN SKETCH CANVAS"
            trailingIcon="arrowRight"
            onPress={toCanvas}
            style={{ paddingVertical: 14, paddingHorizontal: 24 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: { paddingTop: 26, paddingHorizontal: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  backLabel: { color: gold(0.7), fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
  stepRow: { flexDirection: 'row', alignItems: 'baseline', gap: 14, marginTop: 20, flexWrap: 'wrap' },
  step: { fontSize: 11, letterSpacing: 3, color: gold(0.7), fontFamily: fonts.sans },
  stepDim: { fontSize: 11, letterSpacing: 3, color: cream(0.3), fontFamily: fonts.sans },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.creamBright, marginTop: 8 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  cardName: { fontFamily: fonts.serif, fontSize: 19, marginTop: 6 },
  cardMeasures: { fontSize: 10, letterSpacing: 1.5, color: gold(0.6), marginTop: 4, fontFamily: fonts.sans },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 30,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  footerNote: { flex: 1, minWidth: 200, fontSize: 12, color: cream(0.5), fontFamily: fonts.sans },
  footerAccent: { color: colors.gold },
});
