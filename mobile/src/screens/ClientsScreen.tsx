import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon } from '../components/Icon';
import { Kicker, PrimaryButton } from '../components/ui';
import { initials, useApp } from '../state/AppContext';

export function ClientsScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { clients, search, setSearch, openClient, openNewClient, createInvoice } = useApp();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q));
  }, [clients, search]);

  return (
    <View style={styles.fill}>
      <View style={styles.header}>
        <View>
          <Kicker style={{ marginBottom: 8 }}>THE CLIENTELE</Kicker>
          <Text style={styles.title}>Clients</Text>
        </View>
        <PrimaryButton label="NEW CLIENT" icon="plus" onPress={openNewClient} />
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Icon name="search" size={16} color={t.goldA(0.6)} strokeWidth={1.5} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name…"
            placeholderTextColor={t.creamA(0.32)}
            selectionColor={t.gold}
            style={styles.searchInput}
          />
          <Text style={styles.count}>{filtered.length} CLIENTS</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => openClient(c.id)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: t.bgRaise, transform: [{ scale: 0.995 }] }]}
          >
            <View style={styles.rowAvatar}>
              <Text style={styles.rowAvatarText}>{initials(c.name)}</Text>
            </View>
            <View style={styles.rowMid}>
              <Text style={styles.rowName}>{c.name}</Text>
              <Text style={styles.rowSub}>
                {c.designs.length} design{c.designs.length === 1 ? '' : 's'} ·{' '}
                {c.contact.split('·')[0].trim()}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowRightLabel}>LAST DESIGN</Text>
              <Text style={styles.rowRightValue}>{c.lastDesign}</Text>
            </View>
            <Pressable
              onPress={() => createInvoice(c.id)}
              hitSlop={8}
              style={({ pressed }) => [styles.invoiceBtn, pressed && { backgroundColor: t.goldA(0.16) }]}
            >
              <Icon name="dollar" size={15} color={t.gold} strokeWidth={1.7} />
            </Pressable>
            <Icon name="chevronRight" size={16} color={t.goldA(0.5)} strokeWidth={1.4} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    header: {
      paddingTop: 34,
      paddingHorizontal: 40,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    title: { fontFamily: fonts.serif, fontSize: 38, color: t.creamBright },
    searchWrap: { paddingHorizontal: 40, paddingBottom: 16 },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.soft,
      paddingVertical: 15,
      paddingHorizontal: 18,
    },
    searchInput: { flex: 1, color: t.cream, fontSize: 14, letterSpacing: 0.3, fontFamily: fonts.sans, padding: 0 },
    count: { fontSize: 11, color: t.creamA(0.4), letterSpacing: 1, fontFamily: fonts.sans },
    list: { paddingHorizontal: 40, paddingTop: 6, paddingBottom: 34, gap: 12 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
      paddingVertical: 16,
      paddingHorizontal: 18,
      backgroundColor: t.bgCard,
      borderWidth: 1,
      borderColor: t.line,
      borderRadius: radii.soft,
      ...softShadow('card'),
    },
    rowAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: t.goldA(0.14),
      borderWidth: 1,
      borderColor: t.goldA(0.28),
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowAvatarText: { fontFamily: fonts.serif, fontSize: 18, color: t.gold },
    rowMid: { flex: 1, minWidth: 0 },
    rowName: { fontFamily: fonts.serif, fontSize: 20, color: t.creamBright },
    rowSub: { fontSize: 12, color: t.creamA(0.45), marginTop: 3, letterSpacing: 0.3, fontFamily: fonts.sans },
    invoiceBtn: {
      width: 38,
      height: 38,
      borderRadius: radii.chip,
      backgroundColor: t.goldA(0.08),
      borderWidth: 1,
      borderColor: t.goldA(0.22),
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowRight: { alignItems: 'flex-end' },
    rowRightLabel: { fontSize: 10, letterSpacing: 2, color: t.goldA(0.6), fontFamily: fonts.sans },
    rowRightValue: { fontFamily: fonts.serif, fontSize: 16, color: t.cream, marginTop: 2 },
  });
