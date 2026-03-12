import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

export const THEME = {
  light: {
    background:        'hsl(38, 30%, 97%)',
    foreground:        'hsl(22, 18%, 12%)',
    card:              'hsl(0, 0%, 100%)',
    cardForeground:    'hsl(22, 18%, 12%)',
    primary:           'hsl(20, 78%, 50%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary:         'hsl(20, 60%, 93%)',
    secondaryForeground: 'hsl(20, 65%, 30%)',
    muted:             'hsl(36, 18%, 93%)',
    mutedForeground:   'hsl(30, 8%, 48%)',
    accent:            'hsl(32, 70%, 92%)',
    accentForeground:  'hsl(22, 18%, 12%)',
    destructive:       'hsl(0, 72%, 51%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border:            'hsl(34, 16%, 85%)',
    input:             'hsl(34, 16%, 85%)',
    ring:              'hsl(20, 78%, 50%)',
  },
  dark: {
    background:        'hsl(22, 12%, 7%)',
    foreground:        'hsl(36, 10%, 94%)',
    card:              'hsl(22, 12%, 10%)',
    cardForeground:    'hsl(36, 10%, 94%)',
    primary:           'hsl(20, 72%, 58%)',
    primaryForeground: 'hsl(0, 0%, 100%)',
    secondary:         'hsl(22, 12%, 17%)',
    secondaryForeground: 'hsl(20, 60%, 75%)',
    muted:             'hsl(22, 12%, 14%)',
    mutedForeground:   'hsl(24, 6%, 52%)',
    accent:            'hsl(22, 12%, 17%)',
    accentForeground:  'hsl(36, 10%, 94%)',
    destructive:       'hsl(0, 72%, 51%)',
    destructiveForeground: 'hsl(0, 0%, 100%)',
    border:            'hsl(22, 12%, 20%)',
    input:             'hsl(22, 12%, 20%)',
    ring:              'hsl(20, 72%, 58%)',
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
