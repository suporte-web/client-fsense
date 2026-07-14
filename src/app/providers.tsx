'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { materialTheme } from '@/theme/material-theme';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider theme={materialTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
