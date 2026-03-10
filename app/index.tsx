import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/contexts/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(auth)/(tabs)/' : '/(public)/login'} />;
}
