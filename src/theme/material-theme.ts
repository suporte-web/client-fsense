import { createTheme } from '@mui/material/styles';

const orange = {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
};

export const materialTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: orange[600],
      light: orange[400],
      dark: orange[700],
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1C2541',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F6F7F9',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C2541',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    warning: {
      main: orange[600],
      light: orange[100],
      dark: orange[800],
      contrastText: orange[900],
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "'Inter', Arial, Helvetica, sans-serif",
    h1: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 800,
      letterSpacing: 0,
    },
    h2: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 800,
      letterSpacing: 0,
    },
    h3: {
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      fontWeight: 800,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 800,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F6F7F9',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 8px 18px rgba(234, 88, 12, 0.20)',
            '&:hover': {
              boxShadow: '0 10px 22px rgba(234, 88, 12, 0.24)',
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
              backgroundColor: 'rgba(249, 115, 22, 0.06)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: orange[600],
            borderWidth: 1.5,
          },
        },
        input: {
          fontSize: 13.5,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 13.5,
          color: '#64748B',
          '&.Mui-focused': {
            color: orange[600],
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 6,
          fontSize: 13.5,
          margin: '2px 6px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(249, 115, 22, 0.10)',
            color: orange[700],
            fontWeight: 800,
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(249, 115, 22, 0.15)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#E2E8F0',
          fontSize: 13,
        },
        head: {
          color: orange[800],
          fontWeight: 800,
          backgroundColor: orange[50],
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 7,
          borderRadius: 999,
          backgroundColor: orange[100],
        },
        bar: {
          borderRadius: 999,
          backgroundColor: orange[500],
        },
      },
    },
  },
});
