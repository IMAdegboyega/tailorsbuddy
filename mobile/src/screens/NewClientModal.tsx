import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Field } from '../components/ui';
import { useApp } from '../state/AppContext';

export function NewClientModal() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { showNewClient, ncName, ncContact, setNcName, setNcContact, addClient, cancelNewClient } = useApp();

  return (
    <Modal visible={showNewClient} transparent animationType="fade" onRequestClose={cancelNewClient}>
      <Pressable style={styles.backdrop} onPress={cancelNewClient}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>New Client</Text>
          <Text style={styles.subtitle}>Add a name to the atelier book.</Text>
          <View style={styles.form}>
            <Field label="Full name" value={ncName} onChangeText={setNcName} placeholder="e.g. Amaka Okafor" />
            <Field label="Contact" value={ncContact} onChangeText={setNcContact} placeholder="email or phone" />
          </View>
          <View style={styles.actions}>
            <Pressable onPress={cancelNewClient} style={({ pressed }) => [styles.cancel, pressed && { borderColor: t.goldA(0.5) }]}>
              <Text style={styles.cancelLabel}>CANCEL</Text>
            </Pressable>
            <Pressable onPress={addClient} style={({ pressed }) => [styles.add, { backgroundColor: pressed ? t.goldBright : t.gold }]}>
              <Text style={styles.addLabel}>ADD CLIENT</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: t.mode === 'dark' ? 'rgba(4,4,6,0.72)' : 'rgba(40,32,22,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: { width: 360, maxWidth: '100%', backgroundColor: t.bgPanel, borderWidth: 1, borderColor: t.line, borderRadius: radii.card, padding: 30, ...softShadow('lift') },
    title: { fontFamily: fonts.serif, fontSize: 24, color: t.creamBright, marginBottom: 4 },
    subtitle: { fontFamily: fonts.serifItalic, fontSize: 15, color: t.goldA(0.7), marginBottom: 24 },
    form: { gap: 18 },
    actions: { flexDirection: 'row', gap: 12, marginTop: 30 },
    cancel: { flex: 1, borderWidth: 1, borderColor: t.goldA(0.3), paddingVertical: 13, borderRadius: radii.pill, alignItems: 'center' },
    cancelLabel: { color: t.creamA(0.7), fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
    add: { flex: 1, paddingVertical: 13, borderRadius: radii.pill, alignItems: 'center' },
    addLabel: { color: t.onGold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansSemiBold },
  });
