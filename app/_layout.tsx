// Must be first — polyfills
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Using an insecure random number generator', 'No tokens available']);

import '../global.css';
import '@/lib/icons-interop';
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { PortalHost } from '@rn-primitives/portal';
import { ThemeProvider } from '@react-navigation/native';
import { NAV_THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('system');
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans_400Regular': require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'),
    'PlusJakartaSans_500Medium': require('@expo-google-fonts/plus-jakarta-sans/500Medium/PlusJakartaSans_500Medium.ttf'),
    'PlusJakartaSans_600SemiBold': require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'),
    'PlusJakartaSans_700Bold': require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'),
    'PlusJakartaSans_800ExtraBold': require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf'),
  });

  useEffect(() => {
    const hideSplash = async () => {
      if (fontsLoaded || fontError) {
        try { await SplashScreen.hideAsync(); } catch { /* ignore */ }
      }
    };
    hideSplash();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Slot />
              <PortalHost />
            </AuthProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
