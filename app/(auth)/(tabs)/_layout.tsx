import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
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

function CustomTabBar({ state, navigation }: TabBarProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-background"
      style={{ paddingTop: 4, paddingBottom: insets.bottom }}
    >
      <View
        className="mx-3 flex-row bg-card rounded-2xl border border-border"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: colorScheme === 'dark' ? 0.25 : 0.07,
          shadowRadius: 10,
          elevation: 8,
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
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center py-2 gap-0.5 active:opacity-60"
            >
              {/* Icona con pill di sfondo se attiva */}
              <View
                className={cn(
                  'rounded-xl px-3 py-1',
                  isActive ? 'bg-primary/10' : 'bg-transparent',
                )}
              >
                <Icon
                  size={20}
                  color={isActive ? theme.primary : theme.mutedForeground}
                />
              </View>

              {/* Label */}
              <Text
                className={cn(
                  'text-[10px]',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground',
                )}
              >
                {label}
              </Text>
            </Pressable>
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
