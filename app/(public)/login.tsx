import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useAuth, ForceChangePasswordError } from '@/lib/contexts/AuthContext';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils, AlertCircle } from 'lucide-react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';
import { THEME } from '@/lib/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const primary = THEME[colorScheme ?? 'light'].primary;
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(auth)/(tabs)/');
    } catch (err) {
      if (err instanceof ForceChangePasswordError) {
        router.push('/(public)/force-change-password');
      } else {
        setError(err instanceof Error ? err.message : 'Errore durante il login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Hero ───────────────────────────────────────────────── */}
      <View style={{ paddingTop: insets.top + 40, paddingBottom: 52 }}>
        {/* Dot grid texture */}
        <View className="absolute inset-0 overflow-hidden">
          <Svg width="100%" height="100%">
            <Defs>
              <Pattern id="logindots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <Circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.18" />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#logindots)" />
          </Svg>
        </View>

        {/* Decorative circles */}
        <View className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <View className="absolute top-6 -right-4 w-28 h-28 rounded-full bg-white/5" />
        <View className="absolute -bottom-6 -left-10 w-36 h-36 rounded-full bg-white/5" />

        {/* Logo + branding */}
        <View className="items-center gap-4">
          <View className="w-20 h-20 rounded-3xl bg-white/20 items-center justify-center border border-white/25">
            <Utensils className="text-primary-foreground" size={36} />
          </View>
          <View className="items-center gap-1">
            <Text className="text-3xl font-bold text-primary-foreground">Pina</Text>
            <Text className="text-primary-foreground/70 text-sm">Pianifica la tua settimana a tavola</Text>
          </View>
        </View>
      </View>

      {/* ── Form card ──────────────────────────────────────────── */}
      <ScrollView
        className="flex-1 bg-background rounded-t-[32px]"
        contentContainerClassName="px-6 pt-8 gap-5"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-0.5 mb-1">
          <Text variant="h3" className="border-0 pb-0">Bentornato</Text>
          <Text variant="muted">Accedi al tuo account per continuare</Text>
        </View>

        <View className="gap-4">
          <View className="gap-1.5">
            <Label nativeID="email">Email</Label>
            <Input
              id="email"
              placeholder="nome@email.com"
              value={email}
              onChangeText={(v) => { setEmail(v); setError(null); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />
          </View>

          <View className="gap-1.5">
            <Label nativeID="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              value={password}
              onChangeText={(v) => { setPassword(v); setError(null); }}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? (
            <View className="flex-row items-center gap-2 bg-destructive/10 rounded-xl px-3 py-3">
              <AlertCircle className="text-destructive" size={14} />
              <Text className="text-destructive text-sm flex-1">{error}</Text>
            </View>
          ) : null}

          <Button onPress={handleLogin} disabled={isLoading} className="mt-1">
            <Text>{isLoading ? 'Accesso in corso...' : 'Accedi'}</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
