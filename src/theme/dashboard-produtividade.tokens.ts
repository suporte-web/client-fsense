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
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', bar: '#3B82F6' },
    warning: { bg: '#FEF3C7', border: '#FDE68A', text: '#92400E', bar: '#F59E0B' },
    danger: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', bar: '#EF4444' },
    success: { bg: '#E1F5EE', border: '#9FE1CB', text: '#085041', bar: '#10B981' },
    neutral: { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', bar: '#94A3B8' },
    flex: { bg: '#FFEDD5', text: '#C2410C', bar: '#FB923C' },
    fixed: { bg: '#FFF7ED', text: '#EA580C', bar: '#F97316' },
  },
  font: {
    display: '"Roboto", "Helvetica", "Arial", sans-serif',
    body: '"Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  radius: {
    card: 10,
    pill: 20,
  },
} as const;

export const dashboardPanelSx = {
  borderColor: 'divider',
  borderRadius: 1.25,
  bgcolor: 'background.paper',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
} as const;

export const dashboardIconBoxSx = {
  width: 42,
  height: 42,
  borderRadius: 1.25,
  bgcolor: dashboardTokens.color.primary.bg,
  color: dashboardTokens.color.primary.main,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
} as const;
