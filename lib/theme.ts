import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background:        'hsl(36, 25%, 98%)',
    foreground:        'hsl(24, 10%, 10%)',
    card:              'hsl(0, 0%, 100%)',
    cardForeground:    'hsl(24, 10%, 10%)',
    primary:           'hsl(152, 52%, 35%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary:         'hsl(152, 38%, 92%)',
    secondaryForeground: 'hsl(152, 44%, 26%)',
    muted:             'hsl(36, 14%, 94%)',
    mutedForeground:   'hsl(36, 7%, 50%)',
    accent:            'hsl(152, 28%, 91%)',
    accentForeground:  'hsl(24, 10%, 10%)',
    destructive:       'hsl(0, 72%, 51%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border:            'hsl(36, 14%, 86%)',
    input:             'hsl(36, 14%, 86%)',
    ring:              'hsl(152, 52%, 35%)',
  },
  dark: {
    background:        'hsl(20, 8%, 8%)',
    foreground:        'hsl(36, 8%, 95%)',
    card:              'hsl(20, 8%, 11%)',
    cardForeground:    'hsl(36, 8%, 95%)',
    primary:           'hsl(152, 58%, 44%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary:         'hsl(20, 8%, 18%)',
    secondaryForeground: 'hsl(152, 42%, 72%)',
    muted:             'hsl(20, 8%, 15%)',
    mutedForeground:   'hsl(20, 5%, 52%)',
    accent:            'hsl(20, 8%, 18%)',
    accentForeground:  'hsl(36, 8%, 95%)',
    destructive:       'hsl(0, 72%, 51%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border:            'hsl(20, 8%, 22%)',
    input:             'hsl(20, 8%, 22%)',
    ring:              'hsl(152, 58%, 44%)',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border:     THEME.light.border,
      card:       THEME.light.card,
      notification: THEME.light.destructive,
      primary:    THEME.light.primary,
      text:       THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border:     THEME.dark.border,
      card:       THEME.dark.card,
      notification: THEME.dark.destructive,
      primary:    THEME.dark.primary,
      text:       THEME.dark.foreground,
    },
  },
};
