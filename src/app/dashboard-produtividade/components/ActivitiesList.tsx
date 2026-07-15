'use client';

import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import LanguageIcon from '@mui/icons-material/Language';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import {
  Box,
  Card,
  Chip,
  Divider,
  LinearProgress,
  Typography,
} from '@mui/material';
import { ActivityItem, UserProductivity } from '@/types/dashboard-produtividade';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type ActivitiesListProps = {
  activities: ActivityItem[];
  users?: UserProductivity[];
};

type ActivityLike = ActivityItem & Record<string, unknown>;

function formatDuration(seconds?: number) {
  if (!seconds || seconds <= 0) {
    return '-';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}min`;
  }

  return `${remainingSeconds}s`;
}

function normalizeComparableText(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getUserDisplayName(user: UserProductivity) {
  return user.name ?? user.userName ?? user.email ?? user.userId ?? user.id ?? '';
}

function findUserProductivity(userName: string, users: UserProductivity[]) {
  const normalizedUserName = normalizeComparableText(userName);

  return users.find((user) => {
    return [user.name, user.userName, user.email, user.userId, user.id]
      .filter(Boolean)
      .some((value) => normalizeComparableText(String(value)) === normalizedUserName) ||
      normalizeComparableText(getUserDisplayName(user)) === normalizedUserName;
  });
}

function getExpectedDurationSeconds(user?: UserProductivity) {
  const expectedMs = Number(user?.expectedWorkTimeMs ?? 0);

  return Number.isFinite(expectedMs) && expectedMs > 0
    ? Math.floor(expectedMs / 1000)
    : 0;
}

function getConsumptionPercent(durationSeconds: number, expectedSeconds: number) {
  if (expectedSeconds <= 0) {
    return undefined;
  }

  return Math.round((durationSeconds / expectedSeconds) * 100);
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

function getActivityUserName(activity: ActivityLike) {
  return (
    getTextValue(activity, [
      'userName',
      'name',
      'user',
      'fullName',
      'personName',
      'login',
      'userId',
      'email',
    ]) ?? 'Usuário não informado'
  );
}

function getActivityTeamName(activity: ActivityLike) {
  return (
    getTextValue(activity, ['teamName', 'team', 'department', 'groupName']) ??
    'Equipe não informada'
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
    ]) ?? 'Aplicativo/site não informado'
  );
}

function getActivityDuration(activity: ActivityLike) {
  const durationMilliseconds = getNumberValue(activity, [
    'evtDurationMilliseconds',
    'durationMilliseconds',
    'totalMilliseconds',
    'timeInMilliseconds',
    'usedTimeMilliseconds',
  ]);

  if (durationMilliseconds > 0) {
    return Math.floor(durationMilliseconds / 1000);
  }

  return getNumberValue(activity, [
    'duration',
    'durationSeconds',
    'totalSeconds',
    'seconds',
    'timeInSeconds',
    'totalTimeSeconds',
    'usedTimeSeconds',
  ]);
}

function getAppIcon(application: string) {
  const name = application.toLowerCase();

  if (
    name.includes('chrome') ||
    name.includes('edge') ||
    name.includes('google') ||
    name.includes('http') ||
    name.includes('www')
  ) {
    return <LanguageIcon fontSize="small" />;
  }

  if (
    name.includes('code') ||
    name.includes('visual') ||
    name.includes('dbeaver') ||
    name.includes('java') ||
    name.includes('intellij')
  ) {
    return <DesktopWindowsIcon fontSize="small" />;
  }

  return <WebAssetIcon fontSize="small" />;
}

export function ActivitiesList({ activities, users: productivityUsers = [] }: ActivitiesListProps) {
  const safeActivities = Array.isArray(activities) ? activities : [];

  const groupedByUser = safeActivities.reduce<Record<string, ActivityLike[]>>(
    (acc, activity) => {
      const activityAny = activity as ActivityLike;
      const userName = getActivityUserName(activityAny);

      if (!acc[userName]) {
        acc[userName] = [];
      }

      acc[userName].push(activityAny);

      return acc;
    },
    {},
  );

  const users = Object.entries(groupedByUser)
    .map(([userName, userActivities]) => {
      const applicationsMap = new Map<string, number>();
      const firstActivity = userActivities[0];
      const teamName = getActivityTeamName(firstActivity);

      for (const activity of userActivities) {
        const application = getActivityApplication(activity);
        const duration = getActivityDuration(activity);

        applicationsMap.set(
          application,
          (applicationsMap.get(application) ?? 0) + duration,
        );
      }

      const applications = Array.from(applicationsMap.entries())
        .map(([application, duration]) => ({
          application,
          duration,
        }))
        .sort((a, b) => b.duration - a.duration);

      const totalDuration = applications.reduce((total, item) => {
        return total + item.duration;
      }, 0);
      const productivityUser = findUserProductivity(userName, productivityUsers);
      const expectedDuration = getExpectedDurationSeconds(productivityUser);
      const consumptionPercent = getConsumptionPercent(totalDuration, expectedDuration);

      return {
        userName,
        teamName,
        applications,
        totalDuration,
        expectedDuration,
        consumptionPercent,
        workdayName: productivityUser?.workdayName,
      };
    })
    .sort((first, second) => second.totalDuration - first.totalDuration);

  const maxDuration = Math.max(...users.map((user) => user.totalDuration), 1);

  return (
    <Card
      sx={{
        ...dashboardPanelSx,
        borderRadius: '12px',
        borderLeft: '4px solid #FF4B0B',
        boxShadow: 'none',
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
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
            <WebAssetIcon sx={{ fontSize: 20 }} />
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
              Aplicativos e sites por pessoa
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: '#4D4D4D',
                fontSize: 13,
              }}
            >
              Consumo por app comparado com a jornada do dia.
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${users.length} pessoa${users.length === 1 ? '' : 's'}`}
          sx={{
            height: 30,
            bgcolor: '#FFEEE6',
            color: '#FF4B0B',
            border: '1px solid #FFD8C8',
            fontSize: 12,
            fontWeight: 700,
          }}
        />
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: 'divider' }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {users.map((user) => {
          const percent = Math.round((user.totalDuration / maxDuration) * 100);
          const jornadaPercent = user.consumptionPercent !== undefined
            ? Math.min(100, Math.max(0, user.consumptionPercent))
            : percent;

          return (
            <Box
              key={user.userName}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                p: 2,
                border: '1px solid',
                borderColor: '#E0E0E0',
                borderRadius: '12px',
                bgcolor: '#ffffff',
                boxShadow: 'none',
                transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  borderColor: '#FFCCBC',
                  boxShadow: '0 4px 12px rgba(255, 75, 11, 0.10)',
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -48,
                  right: -48,
                  width: 120,
                  height: 120,
                  borderRadius: '12px',
                  bgcolor: '#FFF7ED',
                  opacity: 0.72,
                }}
              />

              <Box sx={{ mb: 1.5, position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: tokens.font.display,
                        color: tokens.color.ink,
                        fontSize: 15,
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.userName}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.25,
                        color: '#4D4D4D',
                        fontSize: 12.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.teamName}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flexShrink: 0,
                      px: 1.2,
                      py: 0.6,
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
                      {formatDuration(user.totalDuration)}
                    </Typography>
                  </Box>
                </Box>

                    <LinearProgress
                      variant="determinate"
                      value={jornadaPercent}
                      sx={{
                        mt: 1.3,
                        height: 6,
                        borderRadius: 999,
                        bgcolor: '#FFEDD5',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#FF6D00',
                        },
                      }}
                    />

                {user.expectedDuration > 0 && (
                  <Typography
                    sx={{
                      mt: 0.85,
                      color: '#4D4D4D',
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    Jornada {formatDuration(user.expectedDuration)} | {user.consumptionPercent}% consumido
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 1.5, borderColor: 'divider' }} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.2,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {user.applications.slice(0, 5).map((item, index) => (
                  <Box
                    key={`${user.userName}-${item.application}-${index}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          flexShrink: 0,
                          borderRadius: '8px',
                          bgcolor: '#FFF3E0',
                          color: '#F45100',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {getAppIcon(item.application)}
                      </Box>

                      <Typography
                        sx={{
                          color: tokens.color.ink,
                          fontSize: 13.5,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.application}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: tokens.font.mono,
                        color: '#4D4D4D',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDuration(item.duration)}
                    </Typography>
                  </Box>
                ))}

                {user.applications.length > 5 && (
                  <Typography
                    sx={{
                      pt: 0.5,
                      color: '#ea580c',
                      fontSize: 12.5,
                      fontWeight: 700,
                    }}
                  >
                    +{user.applications.length - 5} aplicativo
                    {user.applications.length - 5 === 1 ? '' : 's'} oculto
                    {user.applications.length - 5 === 1 ? '' : 's'}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}

        {safeActivities.length === 0 && (
          <Box
            sx={{
              gridColumn: '1 / -1',
              p: 4,
              border: '1px dashed #FFB074',
              borderRadius: '12px',
              bgcolor: '#FFF7ED',
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
                bgcolor: '#FFEEE6',
                color: '#FF4B0B',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <WebAssetIcon />
            </Box>

            <Typography
              sx={{
                fontWeight: 700,
                color: tokens.color.ink,
                fontSize: 15,
              }}
            >
              Nenhuma atividade neste período
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: tokens.color.muted,
                fontSize: 13,
              }}
            >
              Ajuste os filtros para visualizar aplicativos e sites utilizados.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
