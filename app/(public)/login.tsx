import { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, ForceChangePasswordError } from '@/lib/contexts/AuthContext';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Utensils } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-4">
            <Utensils className="text-white" size={32} />
          </View>
          <Text variant="h2" className="border-0 pb-0">Pina</Text>
          <Text variant="muted">Pianifica la tua settimana a tavola</Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="gap-1.5">
            <Label nativeID="email">Email</Label>
            <Input
              id="email"
              placeholder="nome@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View className="gap-1.5">
            <Label nativeID="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <Text className="text-destructive text-sm">{error}</Text>
          )}

          <Button onPress={handleLogin} disabled={isLoading} className="mt-2">
            <Text>{isLoading ? 'Accesso in corso...' : 'Accedi'}</Text>
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
