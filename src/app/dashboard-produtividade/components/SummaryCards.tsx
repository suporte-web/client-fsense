'use client';

import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import PauseCircleOutlinedIcon from '@mui/icons-material/PauseCircleOutlined';

import TimelineIcon from '@mui/icons-material/Timeline';
import { Box, Card, Typography } from '@mui/material';
import {
  ActivityItem,
  DashboardSummary,
  TeamItem,
  UserProductivity,
} from '@/types/dashboard-produtividade';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';


type SummaryCardsProps = {
  summary?: DashboardSummary | null;
  users?: UserProductivity[];
  activities?: ActivityItem[];
  teams?: TeamItem[];
};

const teamAccent = {
  bg: '#E8F3EA',
  text: '#2E7D32',
  border: '#2E7D32',
};

const activityAccent = {
  bg: '#FFEEE6',
  text: '#FF4B0B',
  border: '#F57C00',
};

const idleAccent = {
  bg: '#E3F2FB',
  text: '#0288D1',
  border: '#0288D1',
};

const neutralAccent = {
  bg: '#FFEEE6',
  text: '#FF4B0B',
  border: '#FF4B0B',
};



function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getPercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((value / total) * 100));
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function formatDecimal(value: number) {
  return value.toFixed(1).replace('.', ',');
}

function formatDurationMinutes(value: number) {
  const totalMinutes = Math.max(0, Math.round(value));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
}

function millisecondsToMinutes(value?: number) {
  const milliseconds = getNumber(value);

  return milliseconds !== undefined ? milliseconds / 60000 : undefined;
}

function hasUserMovement(user: UserProductivity) {
  return Boolean(
    (user.totalActivities ?? 0) > 0 ||
    (user.totalEvents ?? 0) > 0 ||
    user.lastActivityAt,
  );
}

function getUserIdleTimeMinutes(user: UserProductivity) {
  const idleTimeMinutes = getNumber(user.idleTimeMinutes ?? user.idleMinutes);

  if (idleTimeMinutes !== undefined) {
    return idleTimeMinutes;
  }

  const idleTimeSeconds = getNumber(user.idleTimeSeconds);

  if (idleTimeSeconds !== undefined) {
    return idleTimeSeconds / 60;
  }

  const idleTimeMilliseconds = getNumber(user.idleTimeMilliseconds);

  if (idleTimeMilliseconds !== undefined) {
    return idleTimeMilliseconds / 60000;
  }

  return undefined;
}


// function dashboardParams(filters?: DashboardFilters) {
//   return {  
//     userId: filters?.userId,
//     teamId: filters?.teamId,
//     startDate: filters?.startDate,
//     endDate: filters?.endDate,
//   };
// }

export function SummaryCards({
  summary,
  users = [],
  activities = [],
  teams = [],
}: SummaryCardsProps) {
  const totalUsers = summary?.totalUsers ?? users.length;
  const totalTeams = summary?.totalTeams ?? teams.length;
  const totalActivities = summary?.totalActivities ?? activities.length;

  const activeUsers =
    summary?.activeUsers ??
    summary?.totalActiveUsers ??
    users.filter(hasUserMovement).length;

  const idleUsers =
    summary?.idleUsers ??
    summary?.totalIdleUsers ??
    Math.max(totalUsers - activeUsers, 0);

  const idleUserPercent =
    summary?.idleUserPercent !== undefined
      ? clampPercent(summary.idleUserPercent)
      : getPercent(idleUsers, totalUsers);

  const usersIdleTimeMinutes = users.reduce((total, user) => {
    return total + (getUserIdleTimeMinutes(user) ?? 0);
  }, 0);

  const hasUserIdleTime = users.some((user) => {
    return getUserIdleTimeMinutes(user) !== undefined;
  });

  const idleTimeMinutes =
    millisecondsToMinutes(summary?.idleness?.idleTimeMs) ??
    getNumber(summary?.idleTimeMinutes) ??
    getNumber(summary?.totalIdleTimeMinutes) ??
    (hasUserIdleTime ? usersIdleTimeMinutes : undefined);

  const hasIdleTimeMetric = idleTimeMinutes !== undefined;

  const totalWorkTimeMinutes =
    millisecondsToMinutes(summary?.idleness?.expectedTotalTimeMs) ??
    getNumber(summary?.totalWorkTimeMinutes);

  const idleTimePercent =
    getNumber(summary?.idleness?.idlenessPercentage) !== undefined
      ? clampPercent(summary.idleness.idlenessPercentage)
      : getNumber(summary?.idleTimePercent) !== undefined
        ? clampPercent(summary.idleTimePercent)
        : hasIdleTimeMetric && totalWorkTimeMinutes !== undefined
          ? getPercent(idleTimeMinutes, totalWorkTimeMinutes)
          : idleUserPercent;

  const averageActivities = totalUsers > 0 ? totalActivities / totalUsers : 0;
  const averageUsersPerTeam = totalTeams > 0 ? totalUsers / totalTeams : 0;

  const cards = [
    {
      label: 'Pessoas monitoradas',
      valueText: formatNumber(totalUsers),
      helper: `${activeUsers} com registros no período`,
      icon: <GroupsIcon />,
      accent: teamAccent,
    },
    {
      label: 'Equipes',
      valueText: formatNumber(totalTeams),
      helper: `${formatDecimal(averageUsersPerTeam)} pessoas por equipe`,
      icon: <InsightsIcon />,
      accent: neutralAccent,
    },
    {
      label: 'Atividades',
      valueText: formatNumber(totalActivities),
      helper: `${formatDecimal(averageActivities)} por pessoa`,
      icon: <TimelineIcon />,
      accent: activityAccent,
    },
    {
      label: 'Ociosidade',
      valueText: hasIdleTimeMetric
        ? formatDurationMinutes(idleTimeMinutes)
        : `${idleUserPercent}%`,
      helper: hasIdleTimeMetric
        ? `${idleTimePercent}% da jornada monitorada`
        : `${idleUsers} pessoas sem registros no período`,
      icon: <PauseCircleOutlinedIcon />,
      accent: idleAccent,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          xl: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 2,
      }}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          sx={{
            ...dashboardPanelSx,
            minHeight: 174,
            p: 2.25,
            borderRadius: '12px',
            borderLeft: `4px solid ${card.accent.border}`,
            boxShadow: 'none',
            overflow: 'hidden',
            transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
            '&:hover': {
              borderColor: card.accent.border,
              boxShadow: `0 4px 12px ${card.accent.border}33`,
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box
            sx={{
              width: '100%',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, pr: 1 }}>
              <Typography
                sx={{
                  color: '#4D4D4D',
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {card.label}
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  fontFamily: tokens.font.body,
                  color: '#000000',
                  fontSize: { xs: 36, md: 40 },
                  lineHeight: 1.05,
                  fontWeight: 700,
                  letterSpacing: 0,
                }}
              >
                {card.valueText}
              </Typography>

              <Typography
                sx={{
                  mt: 1.4,
                  color: '#4D4D4D',
                  fontSize: 14,
                  lineHeight: 1.45,
                }}
              >
                {card.helper}
              </Typography>
            </Box>

            <Box
              sx={{
                ...dashboardIconBoxSx,
                width: 54,
                height: 54,
                borderRadius: '10px',
                color: card.accent.text,
                bgcolor: card.accent.bg,
                border: 0,
                '& svg': {
                  fontSize: 24,
                },
              }}
            >
              {card.icon}
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
