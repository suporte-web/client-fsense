'use client';

import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Typography } from '@mui/material';
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
        p: { xs: 2.25, md: 2.5 },
        borderRadius: '12px',
        color: tokens.color.ink,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderLeft: '4px solid #FF4B0B',
        boxShadow: 'none',
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
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '10px',
              bgcolor: '#FFEEE6',
              color: '#FF4B0B',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            <DashboardCustomizeIcon sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: tokens.font.display,
                fontSize: { xs: 22, md: 28 },
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: 0,
                color: '#000000',
              }}
            >
              Dashboard de Produtividade
            </Typography>

            <Typography
              sx={{
                mt: 0.55,
                maxWidth: 720,
                color: '#4D4D4D',
                fontSize: { xs: 14, md: 15 },
                lineHeight: 1.45,
              }}
            >
              Indicadores de pessoas, equipes, jornadas e atividades do periodo.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon sx={{ fontSize: 18 }} />}
          onClick={onRefresh}
          disabled={loading}
          sx={{
            height: 48,
            px: 2.25,
            borderRadius: '12px',
            bgcolor: '#FF4B0B',
            fontWeight: 700,
            fontSize: 13,
            whiteSpace: 'nowrap',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#E84308',
              boxShadow: '0 4px 12px rgba(255, 75, 11, 0.24)',
            },
            '&.Mui-disabled': {
              bgcolor: '#FFEEE6',
              color: '#FF4B0B',
            },
          }}
        >
          {loading ? 'Atualizando...' : 'Atualizar dados'}
        </Button>
      </Box>
    </Box>
  );
}
