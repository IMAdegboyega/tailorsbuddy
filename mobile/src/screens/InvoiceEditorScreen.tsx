import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { CURRENCIES, currencyByCode, invoiceTotals, money, num } from '../data';
import { Icon } from '../components/Icon';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../state/AppContext';

export function InvoiceEditorScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const {
    activeInvoice,
    updateInvoice,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    backToDetail,
    goInvoicePreview,
    showToast,
  } = useApp();

  const inv = activeInvoice();
  if (!inv) {
    return (
      <View style={[styles.fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: t.creamA(0.6), fontFamily: fonts.sans }}>No invoice selected.</Text>
      </View>
    );
  }
  const tot = invoiceTotals(inv);
  const cur = currencyByCode(inv.currency);

  const LabeledInput = ({ label, style, ...props }: TextInputProps & { label: string; style?: any }) => (
    <View style={[styles.li, style]}>
      <Text style={styles.liLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={t.creamA(0.3)}
        selectionColor={t.gold}
        style={styles.liInput}
        {...props}
      />
    </View>
  );

  return (
    <View style={styles.fill}>
      {/* top bar */}
      <View style={styles.topbar}>
        <View style={styles.topLeft}>
          <Pressable onPress={backToDetail} hitSlop={8} style={styles.back}>
            <Icon name="chevronLeft" size={17} color={t.goldA(0.85)} strokeWidth={1.8} />
          </Pressable>
          <View>
            <Text style={styles.topKicker}>INVOICE</Text>
            <Text style={styles.topTitle}>{inv.number}</Text>
          </View>
        </View>
        <PrimaryButton label="PREVIEW & DESIGN" icon="eye" onPress={goInvoicePreview} style={{ paddingVertical: 11 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* running total */}
        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalKick}>TOTAL DUE</Text>
            <Text style={styles.totalSub}>{inv.items.length} item{inv.items.length === 1 ? '' : 's'} · due {inv.dueDate}</Text>
          </View>
          <Text style={styles.totalValue}>{money(inv.currency, tot.total)}</Text>
        </View>

        {/* details */}
        <Text style={styles.section}>DETAILS</Text>
        <View style={styles.card}>
          <View style={styles.row2}>
            <LabeledInput label="Invoice no." value={inv.number} onChangeText={(v) => updateInvoice({ number: v })} style={styles.col} />
            <LabeledInput label="Issued" value={inv.issueDate} onChangeText={(v) => updateInvoice({ issueDate: v })} style={styles.col} />
          </View>
          <LabeledInput label="Due" value={inv.dueDate} onChangeText={(v) => updateInvoice({ dueDate: v })} style={{ marginTop: 14 }} />
          <Text style={[styles.liLabel, { marginTop: 16, marginBottom: 10 }]}>Currency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {CURRENCIES.map((c) => {
              const on = inv.currency === c.code;
              return (
                <Pressable key={c.code} onPress={() => updateInvoice({ currency: c.code })} style={[styles.curChip, on && { backgroundColor: t.gold, borderColor: t.gold }]}>
                  <Text style={[styles.curSym, { color: on ? t.onGold : t.gold }]}>{c.symbol}</Text>
                  <Text style={[styles.curCode, { color: on ? t.onGold : t.creamA(0.65) }]}>{c.code}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* from */}
        <Text style={styles.section}>FROM</Text>
        <View style={styles.card}>
          <LabeledInput label="Atelier" value={inv.atelierName} onChangeText={(v) => updateInvoice({ atelierName: v })} />
          <LabeledInput label="Tagline" value={inv.atelierTagline} onChangeText={(v) => updateInvoice({ atelierTagline: v })} style={{ marginTop: 14 }} />
          <LabeledInput label="Contact" value={inv.atelierContact} onChangeText={(v) => updateInvoice({ atelierContact: v })} style={{ marginTop: 14 }} />
        </View>

        {/* bill to */}
        <Text style={styles.section}>BILL TO</Text>
        <View style={styles.card}>
          <LabeledInput label="Client" value={inv.billTo} onChangeText={(v) => updateInvoice({ billTo: v })} />
          <LabeledInput label="Contact" value={inv.billContact} onChangeText={(v) => updateInvoice({ billContact: v })} style={{ marginTop: 14 }} />
        </View>

        {/* items */}
        <Text style={styles.section}>ITEMS</Text>
        {inv.items.map((it, i) => (
          <View key={it.id} style={styles.itemCard}>
            <View style={styles.itemHead}>
              <Text style={styles.itemIndex}>ITEM {i + 1}</Text>
              <View style={styles.itemHeadRight}>
                <Text style={styles.itemAmount}>{money(inv.currency, num(it.qty) * num(it.unitPrice))}</Text>
                {inv.items.length > 1 && (
                  <Pressable onPress={() => removeInvoiceItem(it.id)} hitSlop={8} style={styles.itemDel}>
                    <Icon name="trash" size={13} color={t.goldA(0.6)} strokeWidth={1.5} />
                  </Pressable>
                )}
              </View>
            </View>
            <TextInput
              value={it.description}
              onChangeText={(v) => updateInvoiceItem(it.id, { description: v })}
              placeholder="Description — e.g. Silk evening gown, hand-finished"
              placeholderTextColor={t.creamA(0.3)}
              selectionColor={t.gold}
              multiline
              style={styles.itemDesc}
            />
            <View style={styles.row2}>
              <LabeledInput label="Qty" value={it.qty} onChangeText={(v) => updateInvoiceItem(it.id, { qty: v })} keyboardType="decimal-pad" style={styles.col} />
              <LabeledInput label={`Unit price (${cur.symbol})`} value={it.unitPrice} onChangeText={(v) => updateInvoiceItem(it.id, { unitPrice: v })} keyboardType="decimal-pad" placeholder="0.00" style={styles.col} />
            </View>
          </View>
        ))}
        <Pressable onPress={addInvoiceItem} style={styles.addItem}>
          <Icon name="plus" size={15} color={t.gold} strokeWidth={1.7} />
          <Text style={styles.addItemLabel}>ADD ITEM</Text>
        </Pressable>

        {/* adjustments */}
        <Text style={styles.section}>ADJUSTMENTS</Text>
        <View style={styles.card}>
          <View style={styles.row2}>
            <LabeledInput label="Tax %" value={inv.taxRate} onChangeText={(v) => updateInvoice({ taxRate: v })} keyboardType="decimal-pad" placeholder="0" style={styles.col} />
            <LabeledInput label={`Discount (${cur.symbol})`} value={inv.discount} onChangeText={(v) => updateInvoice({ discount: v })} keyboardType="decimal-pad" placeholder="0" style={styles.col} />
          </View>
          <View style={styles.breakdown}>
            <BreakRow t={t} k="Subtotal" v={money(inv.currency, tot.sub)} />
            {tot.discount > 0 && <BreakRow t={t} k="Discount" v={'− ' + money(inv.currency, tot.discount)} />}
            {tot.tax > 0 && <BreakRow t={t} k={`Tax (${num(inv.taxRate)}%)`} v={money(inv.currency, tot.tax)} />}
            <BreakRow t={t} k="Total" v={money(inv.currency, tot.total)} strong />
          </View>
        </View>

        {/* notes */}
        <Text style={styles.section}>NOTES</Text>
        <View style={styles.card}>
          <TextInput
            value={inv.notes}
            onChangeText={(v) => updateInvoice({ notes: v })}
            placeholder="Payment terms, deposit, thanks…"
            placeholderTextColor={t.creamA(0.3)}
            selectionColor={t.gold}
            multiline
            textAlignVertical="top"
            style={styles.notesInput}
          />
        </View>

        <View style={styles.footActions}>
          <Pressable onPress={() => showToast('Invoice saved as draft')} style={styles.saveBtn}>
            <Text style={styles.saveLabel}>SAVE DRAFT</Text>
          </Pressable>
          <PrimaryButton label="PREVIEW & DESIGN" icon="eye" onPress={goInvoicePreview} style={{ flex: 1, justifyContent: 'center', paddingVertical: 14 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function BreakRow({ t, k, v, strong }: { t: Palette; k: string; v: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ color: strong ? t.creamBright : t.creamA(0.55), fontFamily: strong ? fonts.sansSemiBold : fonts.sans, fontSize: strong ? 13 : 12, letterSpacing: strong ? 1 : 0 }}>{k}</Text>
      <Text style={{ color: strong ? t.gold : t.cream, fontFamily: strong ? fonts.serif : fonts.sansMedium, fontSize: strong ? 20 : 13 }}>{v}</Text>
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
    topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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

    body: { padding: 20, paddingBottom: 60, maxWidth: 720, width: '100%', alignSelf: 'center' },

    totalCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: t.goldA(0.1),
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      borderRadius: radii.card,
      padding: 20,
      marginBottom: 8,
    },
    totalKick: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.8), fontFamily: fonts.sans },
    totalSub: { fontSize: 12, color: t.creamA(0.5), marginTop: 4, fontFamily: fonts.sans },
    totalValue: { fontFamily: fonts.serif, fontSize: 32, color: t.creamBright },

    section: { fontSize: 10, letterSpacing: 2.5, color: t.goldA(0.75), fontFamily: fonts.sansMedium, marginTop: 22, marginBottom: 12 },
    card: { backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.line, borderRadius: radii.card, padding: 18, ...softShadow('card') },
    row2: { flexDirection: 'row', gap: 14 },
    col: { flex: 1 },

    li: { gap: 6 },
    liLabel: { fontSize: 11, color: t.creamA(0.5), letterSpacing: 0.4, fontFamily: fonts.sans },
    liInput: {
      borderBottomWidth: 1,
      borderBottomColor: t.goldA(0.25),
      color: t.creamBright,
      fontSize: 15,
      paddingVertical: 7,
      fontFamily: fonts.sans,
    },

    curChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      backgroundColor: t.goldA(0.04),
    },
    curSym: { fontSize: 14, fontFamily: fonts.serif },
    curCode: { fontSize: 11, letterSpacing: 1, fontFamily: fonts.sans },

    itemCard: { backgroundColor: t.bgCard, borderWidth: 1, borderColor: t.line, borderRadius: radii.card, padding: 18, marginBottom: 12, ...softShadow('card') },
    itemHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    itemIndex: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.7), fontFamily: fonts.sansMedium },
    itemHeadRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemAmount: { fontFamily: fonts.serif, fontSize: 17, color: t.gold },
    itemDel: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: t.goldA(0.06) },
    itemDesc: {
      color: t.creamBright,
      fontSize: 15,
      fontFamily: fonts.sans,
      borderBottomWidth: 1,
      borderBottomColor: t.goldA(0.2),
      paddingVertical: 8,
      marginBottom: 14,
      minHeight: 40,
    },
    addItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      paddingVertical: 15,
      borderRadius: radii.pill,
      borderWidth: 1.5,
      borderColor: t.goldA(0.3),
      borderStyle: 'dashed',
      backgroundColor: t.goldA(0.04),
    },
    addItemLabel: { fontSize: 11, letterSpacing: 2, color: t.gold, fontFamily: fonts.sansSemiBold },

    breakdown: { marginTop: 16, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12 },

    notesInput: { minHeight: 120, color: t.cream, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22 },

    footActions: { flexDirection: 'row', gap: 12, marginTop: 26, alignItems: 'center' },
    saveBtn: { borderWidth: 1, borderColor: t.goldA(0.4), paddingVertical: 14, paddingHorizontal: 20, borderRadius: radii.pill },
    saveLabel: { color: t.gold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansMedium },
  });
