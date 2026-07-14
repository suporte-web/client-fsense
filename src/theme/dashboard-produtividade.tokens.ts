export const dashboardTokens = {
  color: {
    ink: '#1C2541',
    canvas: '#F6F7F9',
    surface: '#FFFFFF',
    line: '#E2E8F0',
    muted: '#64748B',
    mutedLight: '#94A3B8',
    trackBg: '#FFEDD5',
    primary: {
      bg: '#FFF7ED',
      soft: '#FFEDD5',
      border: '#FED7AA',
      text: '#C2410C',
      main: '#EA580C',
      bar: '#F97316',
      dark: '#9A3412',
    },
    flex: { bg: '#FFEDD5', text: '#C2410C', bar: '#FB923C' },
    fixed: { bg: '#FFF7ED', text: '#EA580C', bar: '#F97316' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' },
    success: { bg: '#E1F5EE', border: '#9FE1CB', text: '#085041' },
  },
  font: {
    display: "'Space Grotesk', 'Inter', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'IBM Plex Mono', 'Roboto Mono', monospace",
  },
  radius: {
    card: 8,
    pill: 20,
  },
} as const;

export const dashboardPanelSx = {
  borderColor: 'divider',
  borderRadius: 1,
  bgcolor: 'background.paper',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
} as const;

export const dashboardIconBoxSx = {
  width: 42,
  height: 42,
  borderRadius: 1,
  bgcolor: dashboardTokens.color.primary.bg,
  color: dashboardTokens.color.primary.main,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
} as const;
