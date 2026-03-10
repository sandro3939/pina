import { useAuth } from '@/lib/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
