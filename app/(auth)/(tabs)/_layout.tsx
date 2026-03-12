import { Tabs } from 'expo-router';
import { View, Pressable, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Home, BookOpen, ShoppingCart, Package } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';

const TABS = [
  { name: 'index',    label: 'Settimana', Icon: Home },
  { name: 'recipes',  label: 'Ricette',   Icon: BookOpen },
  { name: 'shopping', label: 'Spesa',     Icon: ShoppingCart },
  { name: 'pantry',   label: 'Dispensa',  Icon: Package },
] as const;

type TabBarProps = {
  state: { index: number; routes: Array<{ key: string; name: string }> };
  navigation: { navigate: (name: string) => void; emit: (e: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean } };
};

type AnimatedTabProps = {
  isActive: boolean;
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  theme: (typeof THEME)['light'];
  onPress: () => void;
};

function AnimatedTab({ isActive, label, Icon, theme, onPress }: AnimatedTabProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 8,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center active:opacity-70"
      style={{ paddingVertical: 8, gap: 4 }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon
          size={isActive ? 24 : 20}
          color={isActive ? theme.primary : theme.mutedForeground}
        />
      </Animated.View>

      <Text
        className={cn(isActive ? 'font-bold text-[11px]' : 'text-muted-foreground text-[10px]')}
        style={isActive ? { color: theme.primary } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={{ paddingTop: 6, paddingBottom: insets.bottom || 12, paddingHorizontal: 16 }}
    >
      <View
        className="flex-row bg-card rounded-3xl"
        style={{
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: colorScheme === 'dark' ? 0.2 : 0.12,
          shadowRadius: 16,
          elevation: 10,
          padding: 6,
        }}
      >
        {state.routes.map((route, index) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const isActive = state.index === index;
          const { Icon, label } = tab;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <AnimatedTab
              key={route.key}
              isActive={isActive}
              label={label}
              Icon={Icon}
              theme={theme}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...(props as unknown as TabBarProps)} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Settimana' }} />
      <Tabs.Screen name="recipes"  options={{ title: 'Ricette' }} />
      <Tabs.Screen name="shopping" options={{ title: 'Spesa' }} />
      <Tabs.Screen name="pantry"   options={{ title: 'Dispensa' }} />
    </Tabs>
  );
}
