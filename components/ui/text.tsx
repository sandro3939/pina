import { cn } from '@/lib/utils';
import * as Slot from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, Text as RNText, type Role } from 'react-native';

const textVariants = cva(
  cn(
    'text-foreground text-base font-sans',
    Platform.select({
      web: 'select-text',
    })
  ),
  {
    variants: {
      variant: {
        default: '',
        h1: cn(
          'text-center text-3xl font-extrabold tracking-tight',
          Platform.select({ web: 'scroll-m-20 text-balance' })
        ),
        h2: cn(
          'border-border border-b pb-2 text-2xl font-bold tracking-tight',
          Platform.select({ web: 'scroll-m-20 first:mt-0' })
        ),
        h3: cn('text-xl font-bold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        h4: cn('text-lg font-semibold tracking-tight', Platform.select({ web: 'scroll-m-20' })),
        p: 'mt-3 leading-7 sm:mt-6',
        blockquote: 'mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6',
        code: cn(
          'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold'
        ),
        lead: 'text-muted-foreground text-xl',
        large: 'text-lg font-semibold',
        small: 'text-xs font-medium leading-none',
        muted: 'text-muted-foreground text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type TextVariantProps = VariantProps<typeof textVariants>;

type TextVariant = NonNullable<TextVariantProps['variant']>;

const ROLE: Partial<Record<TextVariant, Role>> = {
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  blockquote: Platform.select({ web: 'blockquote' as Role }),
  code: Platform.select({ web: 'code' as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
};

const TextClassContext = React.createContext<string | undefined>(undefined);

function getFontFamily(className: string | undefined): string {
  if (!className) return 'PlusJakartaSans_400Regular';

  const classes = className.split(' ');

  if (classes.includes('font-extrabold') || classes.includes('font-black')) return 'PlusJakartaSans_800ExtraBold';
  if (classes.includes('font-bold'))     return 'PlusJakartaSans_700Bold';
  if (classes.includes('font-semibold')) return 'PlusJakartaSans_600SemiBold';
  if (classes.includes('font-medium'))   return 'PlusJakartaSans_500Medium';

  return 'PlusJakartaSans_400Regular';
}

function Text({
  className,
  asChild = false,
  variant = 'default',
  style,
  ...props
}: React.ComponentProps<typeof RNText> &
  TextVariantProps &
  React.RefAttributes<RNText> & {
    asChild?: boolean;
  }) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;

  const combinedClassName = cn(textVariants({ variant }), textClass, className);
  const fontFamily = getFontFamily(combinedClassName);

  return (
    <Component
      className={combinedClassName}
      style={[{ fontFamily }, style]}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      {...props}
    />
  );
}

export { Text, TextClassContext };
