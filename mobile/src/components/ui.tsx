import React, { useMemo } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { fonts, Palette, radii, softShadow } from '../theme';
import { useTheme } from '../state/ThemeContext';
import { Icon, IconName } from './Icon';

/** A soft filled rounded card — the Maison Soft building block. */
export function SoftCard({
  children,
  style,
  raised = false,
  padded = true,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
  padded?: boolean;
}) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <View style={[styles.softCard, padded && styles.softCardPad, raised && softShadow('card'), style]}>
      {children}
    </View>
  );
}

/** Filled gold call-to-action pill with optional leading/trailing icon. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  trailingIcon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  trailingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        softShadow('pill'),
        { backgroundColor: pressed ? t.goldBright : t.gold, shadowColor: t.gold },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={14} color={t.onGold} strokeWidth={1.9} />}
      <Text style={styles.primaryLabel}>{label}</Text>
      {trailingIcon && <Icon name={trailingIcon} size={16} color={t.onGold} strokeWidth={1.9} />}
    </Pressable>
  );
}

/** Ghost gold pill (bordered). */
export function OutlineButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        { backgroundColor: pressed ? t.goldA(0.12) : t.goldA(0.05) },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={14} color={t.gold} strokeWidth={1.7} />}
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

/** A back link ("‹ ALL CLIENTS"). */
export function BackLink({ label, onPress }: { label: string; onPress?: () => void }) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <Pressable onPress={onPress} style={styles.backLink} hitSlop={8}>
      <Icon name="chevronLeft" size={13} color={t.goldA(0.7)} strokeWidth={1.6} />
      <Text style={styles.backLinkLabel}>{label}</Text>
    </Pressable>
  );
}

/** An eyebrow / kicker label. */
export function Kicker({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return <Text style={[styles.kicker, style]}>{children}</Text>;
}

/** Serif display heading. */
export function Display({
  children,
  size = 34,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return <Text style={[styles.display, { fontSize: size }, style]}>{children}</Text>;
}

/** Underlined text field with a small label. */
export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t]);
  return (
    <View style={[styles.field, style]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <TextInput
        placeholderTextColor={t.creamA(0.32)}
        selectionColor={t.gold}
        style={styles.fieldInput}
        {...props}
      />
    </View>
  );
}

/** The rounded-square TB monogram. */
export function Monogram({ size = 42, fontSize = 17 }: { size?: number; fontSize?: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        borderWidth: 1,
        borderColor: t.goldA(0.4),
        backgroundColor: t.goldA(0.08),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.serifItalic, fontSize, color: t.gold }}>TB</Text>
    </View>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    softCard: {
      backgroundColor: t.bgCard,
      borderRadius: radii.soft,
      borderWidth: 1,
      borderColor: t.line,
    },
    softCardPad: { padding: 20 },
    primary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: radii.pill,
    },
    primaryLabel: { color: t.onGold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansSemiBold },
    outline: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: radii.pill,
      borderWidth: 1,
      borderColor: t.goldA(0.35),
    },
    outlineLabel: { color: t.gold, fontSize: 11, letterSpacing: 2, fontFamily: fonts.sansMedium },
    backLink: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    backLinkLabel: { color: t.goldA(0.7), fontSize: 11, letterSpacing: 2, fontFamily: fonts.sans },
    kicker: { fontSize: 11, letterSpacing: 3, color: t.goldA(0.7), fontFamily: fonts.sans },
    display: { fontFamily: fonts.serif, color: t.creamBright },
    field: { gap: 6 },
    fieldLabel: { fontSize: 11, color: t.creamA(0.5), letterSpacing: 0.5, fontFamily: fonts.sans },
    fieldInput: {
      borderBottomWidth: 1,
      borderBottomColor: t.goldA(0.28),
      color: t.cream,
      fontSize: 14,
      paddingVertical: 8,
      fontFamily: fonts.sans,
    },
  });
