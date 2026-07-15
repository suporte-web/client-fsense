'use client';

import GroupsIcon from '@mui/icons-material/Groups';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Box, Card, Chip, LinearProgress, Typography } from '@mui/material';
import {
  ActivityItem,
  TeamItem,
  UserProductivity,
} from '@/types/dashboard-produtividade';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type TeamsListProps = {
  teams: TeamItem[];
  users?: UserProductivity[];
  activities?: ActivityItem[];
};

type ActivityLike = ActivityItem & Record<string, unknown>;

// mesma categoria de cor usada em "Equipes" no SummaryCards
const accent = {
  bg: '#fff7ed',
  text: '#ea580c',
  bar: '#f97316',
  border: '#fed7aa',
  soft: '#ffedd5',
};

function getTeamName(team: TeamItem) {
  return team.name ?? 'Equipe sem nome';
}

function getTeamUsers(team: TeamItem) {
  return team.totalUsers ?? 0;
}

function getUserTeamName(user: UserProductivity) {
  return user.teamName ?? 'Equipe nao informada';
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDuration(milliseconds: number) {
  if (!milliseconds || milliseconds <= 0) {
    return '0min';
  }

  const totalMinutes = Math.round(milliseconds / 60000);
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

function getTextValue(activity: ActivityLike, keys: string[]) {
  for (const key of keys) {
    const value = activity[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function getNumberValue(activity: ActivityLike, keys: string[]) {
  for (const key of keys) {
    const value = Number(activity[key]);

    if (Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return 0;
}

function getActivityTeamName(activity: ActivityLike) {
  return (
    getTextValue(activity, ['teamName', 'team', 'department', 'groupName']) ??
    'Equipe nao informada'
  );
}

function getActivityApplication(activity: ActivityLike) {
  return (
    getTextValue(activity, [
      'application',
      'app',
      'appName',
      'processName',
      'host',
      'site',
      'url',
      'domain',
      'title',
    ]) ?? 'Aplicativo/site nao informado'
  );
}

function getActivityDurationMs(activity: ActivityLike) {
  const durationMilliseconds = getNumberValue(activity, [
    'evtDurationMilliseconds',
    'durationMilliseconds',
    'totalMilliseconds',
    'timeInMilliseconds',
    'usedTimeMilliseconds',
  ]);

  if (durationMilliseconds > 0) {
    return durationMilliseconds;
  }

  return getNumberValue(activity, [
    'duration',
    'durationSeconds',
    'totalSeconds',
    'seconds',
    'timeInSeconds',
    'totalTimeSeconds',
    'usedTimeSeconds',
  ]) * 1000;
}

function isInactiveActivity(activity: ActivityLike) {
  const category = getTextValue(activity, ['category'])?.toUpperCase();
  const categoryName = getTextValue(activity, ['categoryName'])?.toLowerCase() ?? '';

  return (
    category === 'C' ||
    category === 'G' ||
    category === 'L' ||
    categoryName.includes('idle') ||
    categoryName.includes('lock') ||
    categoryName.includes('suspended')
  );
}

export function TeamsList({
  teams,
  users = [],
  activities = [],
}: TeamsListProps) {
  const safeTeams = Array.isArray(teams) ? teams : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeActivities = Array.isArray(activities) ? activities : [];

  const teamStatsMap = new Map<
    string,
    {
      name: string;
      people: number;
      expectedMs: number;
      activeMs: number;
      idleMs: number;
      applications: Map<string, number>;
    }
  >();

  for (const team of safeTeams) {
    const teamName = getTeamName(team);

    teamStatsMap.set(teamName, {
      name: teamName,
      people: getTeamUsers(team),
      expectedMs: 0,
      activeMs: 0,
      idleMs: 0,
      applications: new Map(),
    });
  }

  for (const user of safeUsers) {
    const teamName = getUserTeamName(user);
    const current = teamStatsMap.get(teamName) ?? {
      name: teamName,
      people: 0,
      expectedMs: 0,
      activeMs: 0,
      idleMs: 0,
      applications: new Map<string, number>(),
    };

    current.people += 1;
    current.expectedMs += user.expectedWorkTimeMs ?? 0;
    current.activeMs += user.activeTimeMs ?? 0;
    current.idleMs += user.idleTimeMs ?? user.idleTimeMilliseconds ?? 0;

    teamStatsMap.set(teamName, current);
  }

  for (const activity of safeActivities) {
    const activityAny = activity as ActivityLike;

    if (isInactiveActivity(activityAny)) {
      continue;
    }

    const teamName = getActivityTeamName(activityAny);
    const current = teamStatsMap.get(teamName) ?? {
      name: teamName,
      people: 0,
      expectedMs: 0,
      activeMs: 0,
      idleMs: 0,
      applications: new Map<string, number>(),
    };
    const application = getActivityApplication(activityAny);
    const durationMs = getActivityDurationMs(activityAny);

    current.applications.set(
      application,
      (current.applications.get(application) ?? 0) + durationMs,
    );
    teamStatsMap.set(teamName, current);
  }

  const sortedTeams = Array.from(teamStatsMap.values()).sort((first, second) => {
    const firstIdlePercent =
      first.expectedMs > 0 ? Math.round((first.idleMs / first.expectedMs) * 100) : 0;
    const secondIdlePercent =
      second.expectedMs > 0 ? Math.round((second.idleMs / second.expectedMs) * 100) : 0;

    return secondIdlePercent - firstIdlePercent || second.people - first.people;
  });

  const totalPeople = sortedTeams.reduce((total, team) => {
    return total + team.people;
  }, 0);

  return (
    <Card
      sx={{
        ...dashboardPanelSx,
        borderRadius: '12px',
        boxShadow: 'none',
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              ...dashboardIconBoxSx,
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#FFEEE6',
              color: '#FF4B0B',
            }}
          >
            <GroupsIcon sx={{ fontSize: 20 }} />
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: tokens.font.display,
                color: tokens.color.ink,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Ranking por equipe
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: '#4D4D4D',
                fontSize: 13,
              }}
            >
              {formatNumber(totalPeople)} pessoas por ociosidade e apps
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {sortedTeams.slice(0, 8).map((team, index) => {
          const idlePercent =
            team.expectedMs > 0 ? Math.round((team.idleMs / team.expectedMs) * 100) : 0;
          const topApps = Array.from(team.applications.entries())
            .sort((first, second) => second[1] - first[1])
            .slice(0, 3);

          return (
            <Box
              key={team.name ?? index}
              sx={{
                p: 1.5,
                border: '1px solid',
                borderColor: '#E0E0E0',
                borderRadius: '10px',
                bgcolor: '#ffffff',
                transition: 'background-color 160ms ease, border-color 160ms ease',
                '&:hover': {
                  bgcolor: '#FFF7ED',
                  borderColor: '#FFCCBC',
                },
              }}
            >
              <Box
                sx={{
                  mb: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Typography
                  sx={{
                    minWidth: 0,
                    color: tokens.color.ink,
                    fontSize: 13.5,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {team.name}
                </Typography>

                <Box
                  sx={{
                    flexShrink: 0,
                    px: 1.1,
                    py: 0.45,
                    borderRadius: 999,
                    bgcolor: '#FFF7ED',
                    border: '1px solid #FFCCBC',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: tokens.font.mono,
                      color: '#F45100',
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    {idlePercent}%
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mb: 0.9,
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Typography sx={{ color: tokens.color.muted, fontSize: 12 }}>
                  {formatNumber(team.people)} pessoas
                </Typography>

                <Typography sx={{ color: tokens.color.muted, fontSize: 12 }}>
                  {formatDuration(team.idleMs)} parado
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={idlePercent}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: '#FFEDD5',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#FF6D00',
                  },
                }}
              />

              <Box
                sx={{
                  mt: 1.2,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                }}
              >
                {topApps.length > 0 ? (
                  topApps.map(([application, durationMs]) => (
                    <Chip
                      key={`${team.name}-${application}`}
                      size="small"
                      icon={<QueryStatsIcon sx={{ fontSize: 14 }} />}
                      label={`${application} - ${formatDuration(durationMs)}`}
                      sx={{
                        maxWidth: '100%',
                        bgcolor: '#FFF7ED',
                        border: '1px solid #FFCCBC',
                        color: '#F45100',
                        fontSize: 11,
                        fontWeight: 700,
                        '& .MuiChip-label': {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: tokens.color.mutedLight, fontSize: 12 }}>
                    Sem apps/sites ativos no periodo
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}

        {sortedTeams.length === 0 && (
          <Box
            sx={{
              p: 4,
              border: '1px dashed #fdba74',
              borderRadius: 1,
              bgcolor: '#fff7ed',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                mx: 'auto',
                mb: 1.5,
                borderRadius: '50%',
                bgcolor: '#ffedd5',
                color: '#f97316',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <GroupsIcon />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                color: tokens.color.ink,
                fontSize: 14,
              }}
            >
              Nenhuma equipe cadastrada
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                color: tokens.color.muted,
                fontSize: 13,
              }}
            >
              Equipes retornadas pela API vao aparecer aqui.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
