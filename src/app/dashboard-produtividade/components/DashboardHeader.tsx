'use client';

import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Chip, Typography } from '@mui/material';
import { dashboardTokens as tokens } from '@/theme/dashboard-produtividade.tokens';

type DashboardHeaderProps = {
  loading?: boolean;
  onRefresh: () => void;
};

export function DashboardHeader({ loading, onRefresh }: DashboardHeaderProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, md: 2.5 },
        borderRadius: 1,
        color: '#fff',
        bgcolor: 'primary.main',
        boxShadow: '0 12px 28px rgba(234, 88, 12, 0.24)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            icon={<DashboardCustomizeIcon sx={{ color: '#fff !important' }} />}
            label="Painel de acompanhamento"
            size="small"
            sx={{
              mb: 1.2,
              width: 'fit-content',
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              '& .MuiChip-icon': {
                fontSize: 16,
              },
            }}
          />

          <Typography
            component="h1"
            sx={{
              fontFamily: tokens.font.display,
              fontSize: { xs: 24, md: 32 },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: 0,
            }}
          >
            Dashboard de Produtividade
          </Typography>

          <Typography
            sx={{
              mt: 1.2,
              maxWidth: 720,
              color: 'rgba(255, 255, 255, 0.88)',
              fontSize: { xs: 14, md: 15 },
              lineHeight: 1.6,
            }}
          >
            Indicadores de pessoas, equipes, jornadas e atividades do período.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
          onClick={onRefresh}
          disabled={loading}
          sx={{
            height: 42,
            px: 2,
            bgcolor: '#fff',
            color: 'primary.dark',
            fontWeight: 800,
            fontSize: 13,
            '&:hover': {
              bgcolor: '#fff7ed',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.16)',
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(255, 255, 255, 0.65)',
              color: '#ea580c',
            },
          }}
        >
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </Button>
      </Box>
    </Box>
  );
}
