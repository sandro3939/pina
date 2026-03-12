import { useRef, useCallback } from 'react';
import { Animated } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useScreenEntrance() {
  const scale = useRef(new Animated.Value(0.96)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(useCallback(() => {
    scale.setValue(0.96);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, speed: 40, bounciness: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, []));

  return { style: { flex: 1, opacity, transform: [{ scale }] } };
}
