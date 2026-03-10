import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface SeparatorProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
}

function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return (
    <View
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
