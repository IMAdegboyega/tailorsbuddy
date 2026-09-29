import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { fonts, Palette } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../state/AppContext';

export function LoginScreen() {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  const { doLogin } = useApp();
  const [email, setEmail] = useState('severine@tailorsbuddy.com');
  const [pass, setPass] = useState('0000000000');

  const gradientTop = t.mode === 'dark' ? '#1A1610' : '#FCF8F1';

  return (
    <LinearGradient colors={[gradientTop, t.bg]} style={styles.fill}>
      <View style={styles.center}>
        <View style={styles.mono}>
          <Text style={styles.monoMark}>TB</Text>
        </View>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          TAILORS BUDDY
        </Text>
        <Text style={styles.tagline}>bespoke · since MCMXCII</Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Atelier email"
            placeholderTextColor={t.creamA(0.32)}
            autoCapitalize="none"
            keyboardType="email-address"
            selectionColor={t.gold}
            style={styles.input}
          />
          <TextInput
            value={pass}
            onChangeText={setPass}
            placeholder="Passphrase"
            placeholderTextColor={t.creamA(0.32)}
            secureTextEntry
            selectionColor={t.gold}
            style={[styles.input, { letterSpacing: 6 }]}
          />
          <PrimaryButton label="ENTER THE ATELIER" onPress={doLogin} style={styles.enter} />
        </View>
      </View>
      <Text style={styles.footer}>PARIS · LONDON · NEW YORK</Text>
    </LinearGradient>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    fill: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 34 },
    mono: {
      width: 72,
      height: 72,
      borderWidth: 1,
      borderColor: t.goldA(0.4),
      backgroundColor: t.goldA(0.08),
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },
    monoMark: { fontFamily: fonts.serifItalic, fontSize: 30, color: t.gold, letterSpacing: 1 },
    title: { fontFamily: fonts.serif, fontSize: 34, letterSpacing: 4, color: t.creamBright, textAlign: 'center' },
    tagline: { fontFamily: fonts.serifItalic, fontSize: 18, color: t.goldA(0.75), letterSpacing: 1.5, marginTop: 8 },
    form: { width: 280, marginTop: 46, gap: 14 },
    input: {
      borderBottomWidth: 1,
      borderBottomColor: t.goldA(0.28),
      color: t.cream,
      fontSize: 14,
      paddingVertical: 11,
      paddingHorizontal: 2,
      letterSpacing: 0.3,
      fontFamily: fonts.sans,
    },
    enter: { marginTop: 26, justifyContent: 'center', paddingVertical: 14 },
    footer: {
      position: 'absolute',
      bottom: 34,
      alignSelf: 'center',
      fontSize: 11,
      color: t.creamA(0.32),
      letterSpacing: 2,
      fontFamily: fonts.sans,
    },
  });
