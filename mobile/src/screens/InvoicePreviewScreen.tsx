import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon } from '../components/Icon';
import { useApp } from '../state/AppContext';
import { INVOICE_TEMPLATES, InvoiceDoc } from '../invoice/templates';

export function InvoicePreviewScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { activeInvoice, setInvoiceTemplate, backToInvoiceEditor, showToast } = useApp();
  const inv = activeInvoice();

  if (!inv) {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.creamA(0.6), fontFamily: fonts.sans }}>No invoice selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {/* top bar */}
      <View style={styles.topbar}>
        <View style={styles.topLeft}>
          <Pressable onPress={backToInvoiceEditor} hitSlop={8} style={styles.back}>
            <Icon name="chevronLeft" size={17} color={t.goldA(0.85)} strokeWidth={1.8} />
          </Pressable>
          <View>
            <Text style={styles.topKicker}>DESIGN · {inv.number}</Text>
            <Text style={styles.topTitle}>Choose a template</Text>
          </View>
        </View>
        <View style={styles.topActions}>
          <Pressable onPress={() => showToast('Invoice PDF saved')} style={styles.ghost}>
            <Icon name="download" size={14} color={t.gold} strokeWidth={1.7} />
            <Text style={styles.ghostLabel}>SAVE</Text>
          </Pressable>
          <Pressable onPress={() => showToast('Invoice sent to ' + inv.billTo)} style={styles.solid}>
            <Icon name="send" size={14} color={t.onGold} strokeWidth={1.8} />
            <Text style={styles.solidLabel}>SEND</Text>
          </Pressable>
        </View>
      </View>

      {/* template chooser strip */}
      <View style={styles.stripWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip}>
          {INVOICE_TEMPLATES.map((tpl) => {
            const on = inv.templateId === tpl.id;
            return (
              <Pressable key={tpl.id} onPress={() => setInvoiceTemplate(tpl.id)} style={[styles.tplChip, on && { borderColor: t.gold, backgroundColor: t.goldA(0.08) }]}>
                <View style={styles.tplSwatch}>
                  {tpl.swatch.map((c, i) => (
                    <View key={i} style={{ flex: 1, backgroundColor: c }} />
                  ))}
                </View>
                <Text style={[styles.tplName, { color: on ? t.creamBright : t.creamA(0.7) }]} numberOfLines={1}>{tpl.name}</Text>
                <Text style={styles.tplBlurb} numberOfLines={1}>{tpl.blurb}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* rendered document */}
      <ScrollView style={styles.canvas} contentContainerStyle={styles.canvasBody} showsVerticalScrollIndicator={false}>
        <View style={styles.paper}>
          <InvoiceDoc inv={inv} />
        </View>
        <Text style={styles.hint}>Tap a template above to restyle this invoice · SAVE exports a PDF, SEND shares it with your client.</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1, backgroundColor: t.bg },
    topbar: {
      height: 62,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      backgroundColor: t.bgRail,
    },
    topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
    back: {
      width: 40,
      height: 40,
      borderRadius: radii.chip,
      backgroundColor: t.goldA(0.08),
      borderWidth: 1,
      borderColor: t.goldA(0.22),
      alignItems: 'center',
      justifyContent: 'center',
    },
    topKicker: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.6), fontFamily: fonts.sans },
    topTitle: { fontFamily: fonts.serif, fontSize: 20, color: t.creamBright, lineHeight: 22 },
    topActions: { flexDirection: 'row', gap: 10 },
    ghost: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: t.goldA(0.4), paddingVertical: 10, paddingHorizontal: 16, borderRadius: radii.pill },
    ghostLabel: { color: t.gold, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.sansMedium },
    solid: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: t.gold, paddingVertical: 11, paddingHorizontal: 16, borderRadius: radii.pill, ...softShadow('pill') },
    solidLabel: { color: t.onGold, fontSize: 11, letterSpacing: 1.5, fontFamily: fonts.sansSemiBold },

    stripWrap: { borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: t.bgRail },
    strip: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
    tplChip: {
      width: 116,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.soft,
      padding: 8,
      backgroundColor: t.bgCard,
    },
    tplSwatch: { flexDirection: 'row', height: 40, borderRadius: 8, overflow: 'hidden', marginBottom: 8 },
    tplName: { fontSize: 12, fontFamily: fonts.serif },
    tplBlurb: { fontSize: 10, color: t.creamA(0.4), fontFamily: fonts.sans, marginTop: 1 },

    canvas: { flex: 1, backgroundColor: t.bgCanvas },
    canvasBody: { padding: 18, paddingBottom: 50, alignItems: 'center' },
    paper: { width: '100%', maxWidth: 760, borderRadius: 6, overflow: 'hidden', ...softShadow('lift') },
    hint: { fontSize: 11, color: t.creamA(0.4), fontFamily: fonts.sans, textAlign: 'center', marginTop: 18, maxWidth: 480, lineHeight: 17 },
  });
