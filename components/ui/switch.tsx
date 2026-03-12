import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform, Animated } from 'react-native';
import { useRef, useEffect } from 'react';

function Switch({
  className,
  ...props
}: SwitchPrimitives.RootProps & React.RefAttributes<SwitchPrimitives.RootRef>) {
  const translateX = useRef(new Animated.Value(props.checked ? 14 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: props.checked ? 14 : 0,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.2, duration: 80, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, speed: 40, bounciness: 6, useNativeDriver: true }),
      ]),
    ]).start();
  }, [props.checked]);

  return (
    <SwitchPrimitives.Root
      className={cn(
        'flex h-[1.15rem] w-8 shrink-0 flex-row items-center rounded-full border border-transparent shadow-sm shadow-black/5',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 peer inline-flex outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.checked ? 'bg-primary' : 'bg-input dark:bg-input/80',
        props.disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      <Animated.View
        className={cn(
          'bg-background size-4 rounded-full',
          props.checked ? 'dark:bg-primary-foreground' : 'dark:bg-foreground',
        )}
        style={{ transform: [{ translateX }, { scale }] as any }}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
