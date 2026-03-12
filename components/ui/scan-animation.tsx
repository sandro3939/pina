import { useRef, useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useColorScheme } from 'nativewind';
import { THEME } from '@/lib/theme';
import type { LucideIcon } from 'lucide-react-native';

type Props = {
  Icon?: LucideIcon;
  size?: number;
};

export function ScanAnimation({ Icon, size = 128 }: Props) {
  const { colorScheme } = useColorScheme();
  const primary = THEME[colorScheme ?? 'light'].primary;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, { toValue: size - 24, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: size, height: size, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: primary, opacity: 0.1 }} />
      {/* Corner brackets */}
      <View style={{ position: 'absolute', top: 12, left: 12, width: 16, height: 16, borderTopWidth: 2, borderLeftWidth: 2, borderColor: primary, borderTopLeftRadius: 4 }} />
      <View style={{ position: 'absolute', top: 12, right: 12, width: 16, height: 16, borderTopWidth: 2, borderRightWidth: 2, borderColor: primary, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', bottom: 12, left: 12, width: 16, height: 16, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: primary, borderBottomLeftRadius: 4 }} />
      <View style={{ position: 'absolute', bottom: 12, right: 12, width: 16, height: 16, borderBottomWidth: 2, borderRightWidth: 2, borderColor: primary, borderBottomRightRadius: 4 }} />
      {/* Scan line */}
      <Animated.View style={{
        position: 'absolute', top: 12, left: 12, right: 12, height: 2,
        backgroundColor: primary,
        borderRadius: 1,
        shadowColor: primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        transform: [{ translateY }],
      }} />
      {Icon && <Icon size={40} color={primary} style={{ opacity: 0.25 } as any} />}
    </View>
  );
}
