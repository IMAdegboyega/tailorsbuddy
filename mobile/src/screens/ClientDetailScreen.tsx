import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Path } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { DPATHS, currencyByCode, initials, invoiceTotals, money } from '../data';
import { Icon } from '../components/Icon';
import { BackLink, PrimaryButton } from '../components/ui';
import { DetailTab, useApp } from '../state/AppContext';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'meas', label: 'Measurements' },
  { key: 'inspiration', label: 'Inspiration' },
  { key: 'notes', label: 'Notes' },
  { key: 'designs', label: 'Designs' },
  { key: 'invoices', label: 'Invoices' },
];

export function ClientDetailScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const {
    active,
    goClients,
    startNewDesign,
    detailTab,
    setDetailTab,
    addSection,
    renameSection,
    deleteSection,
    addField,
    renameField,
    setField,
    deleteField,
    setClientNotes,
    addReference,
    removeReference,
    clientInvoices,
    createInvoice,
    openInvoice,
    showToast,
  } = useApp();
  const client = active();
  const { width } = useWindowDimensions();

  const avail = Math.max(240, width - 78 - 80);
  const designCols = Math.max(2, Math.min(4, Math.floor(avail / 165)));
  const refCols = Math.max(2, Math.min(3, Math.floor(avail / 200)));
  const measCols = avail > 480 ? 2 : 1;

  const references = client.references ?? [];
  const sections = client.sections ?? [];
  const invoices = clientInvoices(client.id);
  const firstName = client.name.split(' ')[0];

  const addRef = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showToast('Photo access is needed to add references');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
        allowsMultipleSelection: true,
        selectionLimit: 8,
      });
      if (!res.canceled) res.assets.forEach((a) => addReference(a.uri));
    } catch {
      showToast('Could not open the photo library');
    }
  };

  const DesignThumb = ({ pathIndex }: { pathIndex: number }) => (
    <LinearGradient colors={[t.sketchLight, t.sketchDark]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.thumbFill}>
      <Svg viewBox="0 0 120 160" width="100%" height="100%">
        <Ellipse cx={60} cy={20} rx={8} ry={10} fill="none" stroke="#9a9088" strokeWidth={0.8} opacity={0.9} />
        <Path d={DPATHS[pathIndex]} fill="#dfd6c6" stroke="#9a9088" strokeWidth={0.8} opacity={0.9} />
      </Svg>
    </LinearGradient>
  );

  return (
    <View style={styles.fill}>
      <View style={styles.header}>
        <BackLink label="ALL CLIENTS" onPress={goClients} />
        <View style={styles.headRow}>
          <View style={styles.headLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(client.name)}</Text>
            </View>
            <View>
              <Text style={styles.name}>{client.name}</Text>
              <Text style={styles.contact}>{client.contact}</Text>
            </View>
          </View>
          <PrimaryButton label="NEW DESIGN" icon="plus" onPress={startNewDesign} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
          {TABS.map((tab) => {
            const on = detailTab === tab.key;
            return (
              <Pressable key={tab.key} onPress={() => setDetailTab(tab.key)} style={[styles.tab, on && styles.tabActive]}>
                <Text style={[styles.tabLabel, { color: on ? t.creamBright : t.creamA(0.4) }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* MEASUREMENTS — dynamic per-client sections & fields */}
      {detailTab === 'meas' && (
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.measHead}>
            <Text style={styles.measHint}>Recorded in inches</Text>
            <Text style={styles.updated}>{sections.length} SECTION{sections.length === 1 ? '' : 'S'}</Text>
          </View>
          {sections.map((section) => (
            <View key={section.id} style={styles.measSectionCard}>
              <View style={styles.secHeadRow}>
                <TextInput
                  value={section.label}
                  onChangeText={(v) => renameSection(section.id, v)}
                  placeholder="Section name"
                  placeholderTextColor={t.creamA(0.3)}
                  selectionColor={t.gold}
                  style={styles.secTitleInput}
                />
                <Pressable onPress={() => deleteSection(section.id)} hitSlop={8} style={styles.secDel}>
                  <Icon name="trash" size={14} color={t.goldA(0.6)} strokeWidth={1.5} />
                </Pressable>
              </View>
              <View style={styles.measGrid}>
                {section.fields.map((f) => (
                  <View key={f.id} style={[styles.fieldCard, { width: measCols === 2 ? '48%' : '100%' }]}>
                    <View style={styles.fieldTopRow}>
                      <TextInput
                        value={f.label}
                        onChangeText={(v) => renameField(section.id, f.id, v)}
                        placeholder="Label"
                        placeholderTextColor={t.creamA(0.3)}
                        selectionColor={t.gold}
                        style={styles.fieldLabelInput}
                      />
                      <Pressable onPress={() => deleteField(section.id, f.id)} hitSlop={10}>
                        <Icon name="trash" size={12} color={t.goldA(0.45)} strokeWidth={1.5} />
                      </Pressable>
                    </View>
                    <View style={styles.measValueWrap}>
                      <TextInput
                        value={f.value}
                        onChangeText={(v) => setField(section.id, f.id, v)}
                        keyboardType="decimal-pad"
                        placeholder="—"
                        placeholderTextColor={t.creamA(0.25)}
                        selectionColor={t.gold}
                        style={styles.measInput}
                      />
                      <Text style={styles.measUnit}>in</Text>
                    </View>
                  </View>
                ))}
                <Pressable onPress={() => addField(section.id)} style={[styles.addFieldTile, { width: measCols === 2 ? '48%' : '100%' }]}>
                  <Icon name="plus" size={15} color={t.goldA(0.7)} strokeWidth={1.6} />
                  <Text style={styles.addFieldLabel}>ADD MEASUREMENT</Text>
                </Pressable>
              </View>
            </View>
          ))}
          <Pressable onPress={addSection} style={styles.addSectionBtn}>
            <Icon name="plus" size={16} color={t.gold} strokeWidth={1.7} />
            <Text style={styles.addSectionLabel}>ADD SECTION</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* INSPIRATION */}
      {detailTab === 'inspiration' && (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.inspoHint}>
            What {client.name.split(' ')[0]} wants — add photos of styles, fabrics, or details to work from.
          </Text>
          <View style={styles.refGrid}>
            <Pressable onPress={addRef} style={({ pressed }) => [styles.refAdd, { width: `${100 / refCols}%` }, pressed && { opacity: 0.7 }]}>
              <View style={styles.refAddInner}>
                <Icon name="plus" size={26} color={t.goldA(0.7)} strokeWidth={1.3} />
                <Text style={styles.refAddLabel}>ADD REFERENCE</Text>
              </View>
            </Pressable>
            {references.map((uri, i) => (
              <View key={`${uri}-${i}`} style={[styles.refCell, { width: `${100 / refCols}%` }]}>
                <View style={styles.refImgWrap}>
                  <Image source={{ uri }} style={styles.refImg} resizeMode="cover" />
                  <Pressable onPress={() => removeReference(uri)} style={styles.refRemove} hitSlop={8}>
                    <Icon name="trash" size={13} color={t.creamBright} strokeWidth={1.6} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
          {references.length === 0 && (
            <Text style={styles.emptyNote}>No references yet — the board is a blank canvas.</Text>
          )}
        </ScrollView>
      )}

      {/* NOTES */}
      {detailTab === 'notes' && (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.notesCard}>
            <Text style={styles.sectionLabel}>THE BRIEF</Text>
            <Text style={styles.notesHint}>Special requests, deadlines, preferences — everything you need to remember for {client.name.split(' ')[0]}.</Text>
            <TextInput
              value={client.notes ?? ''}
              onChangeText={setClientNotes}
              placeholder="e.g. Prefers a high neckline · allergic to wool · wedding on 12 June · wants sleeves that can detach…"
              placeholderTextColor={t.creamA(0.3)}
              selectionColor={t.gold}
              multiline
              textAlignVertical="top"
              style={styles.notesInput}
            />
          </View>
        </ScrollView>
      )}

      {/* DESIGNS */}
      {detailTab === 'designs' && (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.designGrid}>
            <Pressable onPress={startNewDesign} style={({ pressed }) => [styles.newSketch, { width: `${100 / designCols}%` }, pressed && { backgroundColor: t.goldA(0.04) }]}>
              <View style={styles.newSketchInner}>
                <Icon name="plus" size={26} color={t.goldA(0.7)} strokeWidth={1.3} />
                <Text style={styles.newSketchLabel}>NEW SKETCH</Text>
              </View>
            </Pressable>
            {client.designs.map((d, i) => (
              <Pressable key={i} onPress={() => showToast('Opening “' + d.title + '”')} style={[styles.designCell, { width: `${100 / designCols}%` }]}>
                <View style={styles.thumbWrap}>
                  <DesignThumb pathIndex={d.p} />
                  <View style={styles.garmentTag}>
                    <Text style={styles.garmentTagText}>{d.garment}</Text>
                  </View>
                </View>
                <Text style={styles.designTitle}>{d.title}</Text>
                <Text style={styles.designDate}>{d.date}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {/* INVOICES */}
      {detailTab === 'invoices' && (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.invHead}>
            <Text style={styles.measHint}>Invoices for {firstName}</Text>
            <PrimaryButton label="CREATE INVOICE" icon="plus" onPress={() => createInvoice(client.id)} style={{ paddingVertical: 10 }} />
          </View>
          {invoices.length === 0 ? (
            <Text style={styles.emptyNote}>No invoices yet — create one and {firstName}’s details fill in automatically.</Text>
          ) : (
            invoices.map((inv) => {
              const tot = invoiceTotals(inv);
              return (
                <Pressable key={inv.id} onPress={() => openInvoice(client.id, inv.id)} style={styles.invRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.invNumber}>{inv.number}</Text>
                    <Text style={styles.invSub}>
                      {inv.issueDate} · {inv.items.length} item{inv.items.length === 1 ? '' : 's'} · {inv.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.invTotal}>{money(inv.currency, tot.total)}</Text>
                  <Icon name="chevronRight" size={16} color={t.goldA(0.5)} strokeWidth={1.4} />
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    header: { paddingTop: 26, paddingHorizontal: 40 },
    headRow: { marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    avatar: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: t.goldA(0.14),
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: fonts.serif, fontSize: 24, color: t.gold },
    name: { fontFamily: fonts.serif, fontSize: 32, color: t.creamBright, lineHeight: 34 },
    contact: { fontSize: 12, color: t.creamA(0.5), marginTop: 5, letterSpacing: 0.4, fontFamily: fonts.sans },
    tabsScroll: { marginTop: 26, borderBottomWidth: 1, borderBottomColor: t.line },
    tabs: { flexDirection: 'row', gap: 28 },
    tab: { paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: t.gold },
    tabLabel: { fontFamily: fonts.serif, fontSize: 18 },
    body: { paddingHorizontal: 40, paddingTop: 24, paddingBottom: 44 },

    // measurements
    measHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    measHint: { fontFamily: fonts.serifItalic, fontSize: 19, color: t.goldA(0.85) },
    updated: { fontSize: 11, color: t.creamA(0.4), letterSpacing: 1, fontFamily: fonts.sans },
    sectionLabel: { fontSize: 10, letterSpacing: 2.5, color: t.goldA(0.75), fontFamily: fonts.sansMedium },
    measSectionCard: {
      backgroundColor: t.bgPanel,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.card,
      padding: 16,
      marginBottom: 16,
      ...softShadow('card'),
    },
    secHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, paddingHorizontal: 4 },
    secTitleInput: { flex: 1, fontFamily: fonts.serif, fontSize: 22, color: t.creamBright, padding: 0 },
    secDel: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: t.goldA(0.06) },
    measGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    fieldCard: {
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.soft,
      backgroundColor: t.bgCard,
      paddingVertical: 13,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    fieldTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
    fieldLabelInput: { flex: 1, fontSize: 11, letterSpacing: 0.4, color: t.creamA(0.6), fontFamily: fonts.sans, padding: 0 },
    measValueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
    measInput: { flex: 1, color: t.creamBright, fontFamily: fonts.serif, fontSize: 26, padding: 0 },
    measUnit: { fontSize: 12, color: t.goldA(0.6), fontFamily: fonts.sans },
    addFieldTile: {
      borderWidth: 1.5,
      borderColor: t.goldA(0.28),
      borderStyle: 'dashed',
      borderRadius: radii.soft,
      backgroundColor: t.goldA(0.03),
      paddingVertical: 18,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    addFieldLabel: { fontSize: 10, letterSpacing: 1.5, color: t.goldA(0.7), fontFamily: fonts.sans },
    addSectionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      paddingVertical: 15,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: t.goldA(0.35),
      backgroundColor: t.goldA(0.05),
      marginTop: 4,
    },
    addSectionLabel: { fontSize: 11, letterSpacing: 2, color: t.gold, fontFamily: fonts.sansSemiBold },

    // invoices
    invHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' },
    invRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.soft,
      paddingVertical: 16,
      paddingHorizontal: 18,
      marginBottom: 12,
      ...softShadow('card'),
    },
    invNumber: { fontFamily: fonts.serif, fontSize: 19, color: t.creamBright },
    invSub: { fontSize: 11, color: t.creamA(0.45), marginTop: 3, letterSpacing: 0.4, fontFamily: fonts.sans },
    invTotal: { fontFamily: fonts.serif, fontSize: 18, color: t.gold },

    // inspiration
    inspoHint: { fontFamily: fonts.serifItalic, fontSize: 18, color: t.creamA(0.6), marginBottom: 18 },
    refGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8 },
    refAdd: { padding: 8 },
    refAddInner: {
      aspectRatio: 3 / 4,
      borderWidth: 1.5,
      borderColor: t.goldA(0.3),
      borderStyle: 'dashed',
      borderRadius: radii.soft,
      backgroundColor: t.goldA(0.04),
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    refAddLabel: { fontSize: 10, letterSpacing: 1.5, color: t.goldA(0.7), fontFamily: fonts.sans },
    refCell: { padding: 8 },
    refImgWrap: { aspectRatio: 3 / 4, borderRadius: radii.soft, overflow: 'hidden', borderWidth: 1, borderColor: t.line, position: 'relative', ...softShadow('card') },
    refImg: { width: '100%', height: '100%' },
    refRemove: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: 'rgba(16,13,10,0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyNote: { fontSize: 12, color: t.creamA(0.4), fontFamily: fonts.sans, marginTop: 8, textAlign: 'center' },

    // notes
    notesCard: { borderWidth: 1, borderColor: t.line, borderRadius: radii.card, backgroundColor: t.bgCard, padding: 24, ...softShadow('card') },
    notesHint: { fontSize: 12, color: t.creamA(0.5), fontFamily: fonts.sans, marginTop: 8, marginBottom: 16, lineHeight: 18 },
    notesInput: {
      minHeight: 220,
      color: t.cream,
      fontFamily: fonts.sans,
      fontSize: 15,
      lineHeight: 24,
      borderTopWidth: 1,
      borderTopColor: t.line,
      paddingTop: 16,
    },

    // designs
    designGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -10 },
    newSketch: { padding: 10 },
    newSketchInner: {
      aspectRatio: 3 / 4,
      borderWidth: 1.5,
      borderColor: t.goldA(0.3),
      borderStyle: 'dashed',
      borderRadius: radii.soft,
      backgroundColor: t.goldA(0.04),
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    newSketchLabel: { fontSize: 11, letterSpacing: 2, color: t.goldA(0.7), fontFamily: fonts.sans },
    designCell: { padding: 10 },
    thumbWrap: { aspectRatio: 3 / 4, borderWidth: 1, borderColor: t.line, borderRadius: radii.soft, overflow: 'hidden', position: 'relative', ...softShadow('card') },
    thumbFill: { flex: 1 },
    garmentTag: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.6)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 2 },
    garmentTagText: { fontSize: 9, letterSpacing: 1, color: '#8a7a55', fontFamily: fonts.sans },
    designTitle: { fontFamily: fonts.serif, fontSize: 15, color: t.creamBright, marginTop: 9 },
    designDate: { fontSize: 11, color: t.creamA(0.4), marginTop: 2, fontFamily: fonts.sans },
  });
