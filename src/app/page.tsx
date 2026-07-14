'use client';

import {
  Alert,
  Box,
  Container,
  Fade,
  Stack,
} from '@mui/material';

import { ActivitiesList } from './dashboard-produtividade/components/ActivitiesList';
import { DashboardFilters } from './dashboard-produtividade/components/DashboardFilters';
import { DashboardHeader } from './dashboard-produtividade/components/DashboardHeader';
import { JornadasCard } from './dashboard-produtividade/components/Jornada';
import { PersonActivityStackedChart } from './dashboard-produtividade/components/PersonActivityStackedChart';
import { SummaryCards } from './dashboard-produtividade/components/SummaryCards';
import { TeamsList } from './dashboard-produtividade/components/TeamsList';
import { UsersProductivityTable } from './dashboard-produtividade/components/UsersProductivityTable';
import { useDashboardProdutividade } from '@/hooks/useDashboardProdutividade';

export default function DashboardProdutividadePage() {
  const {
    summary,
    users,
    activities,
    teams,
    filters,
    loading,
    error,
    updateFilters,
    reload,
  } = useDashboardProdutividade();

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: {
          xs: 2,
          sm: 2.5,
          md: 3,
          lg: 4,
        },
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          width: '100%',
          maxWidth: '1536px',
          px: {
            xs: 1.5,
            sm: 2,
            md: 3,
            lg: 4,
          },
        }}
      >
        <Stack
          spacing={{
            xs: 2,
            md: 2.5,
          }}
        >
          <DashboardHeader
            loading={loading}
            onRefresh={reload}
          />

          <DashboardFilters
            filters={filters}
            users={users}
            teams={teams}
            loading={loading}
            onChange={updateFilters}
          />

          {error && (
            <Fade in>
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  borderRadius: 1,
                  borderColor: 'rgba(220, 38, 38, 0.22)',
                  bgcolor: 'rgba(254, 242, 242, 0.95)',
                  color: '#991B1B',
                  fontWeight: 600,
                  boxShadow: '0 8px 28px rgba(15, 23, 42, 0.05)',
                  '& .MuiAlert-icon': {
                    color: '#DC2626',
                  },
                }}
              >
                {error}
              </Alert>
            </Fade>
          )}

          <SummaryCards
            summary={summary}
            users={users}
            activities={activities}
            teams={teams}
          />

          <PersonActivityStackedChart
            activities={activities}
            users={users}
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1.7fr) minmax(340px, 0.85fr)',
                xl: 'minmax(0, 2fr) minmax(360px, 420px)',
              },
              gap: {
                xs: 2,
                md: 2.5,
              },
              alignItems: 'start',
            }}
          >
            <Stack
              spacing={{
                xs: 2,
                md: 2.5,
              }}
              sx={{
                minWidth: 0,
              }}
            >
              <UsersProductivityTable users={users} />

              <ActivitiesList
                activities={activities}
                users={users}
              />
            </Stack>

            <Stack
              spacing={{
                xs: 2,
                md: 2.5,
              }}
              sx={{
                minWidth: 0,
                alignSelf: 'start',
              }}
            >
              <JornadasCard
                userId={filters.userId}
                userName={filters.userName}
              />

              <TeamsList
                teams={teams}
                users={users}
                activities={activities}
              />
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
