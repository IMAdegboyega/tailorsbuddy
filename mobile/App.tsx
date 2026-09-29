import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Jost_300Light,
  Jost_400Regular,
  Jost_500Medium,
  Jost_600SemiBold,
} from '@expo-google-fonts/jost';

import { ThemeProvider, useTheme } from './src/state/ThemeContext';
import { AppProvider, useApp } from './src/state/AppContext';
import { Rail } from './src/components/Rail';
import { Toast } from './src/components/Toast';
import { LoginScreen } from './src/screens/LoginScreen';
import { ClientsScreen } from './src/screens/ClientsScreen';
import { ClientDetailScreen } from './src/screens/ClientDetailScreen';
import { CanvasBoundary } from './src/components/CanvasBoundary';
import { ExportScreen } from './src/screens/ExportScreen';
import { PricingScreen } from './src/screens/PricingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { NewClientModal } from './src/screens/NewClientModal';
import { InvoiceEditorScreen } from './src/screens/InvoiceEditorScreen';
import { InvoicePreviewScreen } from './src/screens/InvoicePreviewScreen';

const CanvasScreen = React.lazy(() =>
  import('./src/screens/CanvasScreen').then((m) => ({ default: m.CanvasScreen }))
);

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { screen } = useApp();
  return (
    <View style={styles.shell}>
      <Rail />
      <View style={styles.main}>
        {screen === 'clients' && <ClientsScreen />}
        {screen === 'detail' && <ClientDetailScreen />}
        {screen === 'pricing' && <PricingScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </View>
    </View>
  );
}

function CanvasFallback() {
  const t = useTheme();
  return (
    <View style={[styles.canvasFallback, { backgroundColor: t.bg }]}>
      <ActivityIndicator color={t.gold} />
    </View>
  );
}

function Router() {
  const { screen } = useApp();
  const isFull =
    screen === 'login' ||
    screen === 'canvas' ||
    screen === 'export' ||
    screen === 'invoiceEditor' ||
    screen === 'invoicePreview';
  return (
    <>
      {screen === 'login' && <LoginScreen />}
      {screen === 'canvas' && (
        <CanvasBoundary>
          <Suspense fallback={<CanvasFallback />}>
            <CanvasScreen />
          </Suspense>
        </CanvasBoundary>
      )}
      {screen === 'export' && <ExportScreen />}
      {screen === 'invoiceEditor' && <InvoiceEditorScreen />}
      {screen === 'invoicePreview' && <InvoicePreviewScreen />}
      {!isFull && <Shell />}
      <NewClientModal />
      <Toast />
    </>
  );
}

/** Themed root — paints the safe-area background and status bar for the active palette. */
function ThemedRoot() {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: t.bg }]} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={t.mode === 'dark' ? 'light' : 'dark'} />
      <Router />
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_500Medium_Italic,
    CormorantGaramond_600SemiBold,
    Jost_300Light,
    Jost_400Regular,
    Jost_500Medium,
    Jost_600SemiBold,
  });

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const ready = fontsLoaded || !!fontError || timedOut;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const onLayout = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayout}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProvider>
            <ThemedRoot />
          </AppProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  shell: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, minWidth: 0, position: 'relative' },
  canvasFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
