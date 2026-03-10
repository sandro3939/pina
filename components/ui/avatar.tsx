import { View, ViewProps } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface AvatarProps extends ViewProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-base',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

function Avatar({ className, size = 'md', ...props }: AvatarProps) {
  return (
    <View
      className={cn(
        'rounded-full bg-muted items-center justify-center overflow-hidden',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

interface AvatarFallbackProps extends ViewProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function AvatarFallback({ className, size = 'md', children, ...props }: AvatarFallbackProps) {
  return (
    <View className={cn('w-full h-full items-center justify-center bg-primary', className)} {...props}>
      {typeof children === 'string' ? (
        <Text className={cn('font-bold text-primary-foreground', textSizeClasses[size])}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Avatar, AvatarFallback };
