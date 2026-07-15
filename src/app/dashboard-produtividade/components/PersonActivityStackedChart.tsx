'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { Box, Card, Chip, IconButton, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import {
  ActivityItem,
  UserProductivity,
} from '@/types/dashboard-produtividade';
import {
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type PersonActivityStackedChartProps = {
  activities: ActivityItem[];
  users?: UserProductivity[];
};

type ActivityLike = ActivityItem & Record<string, unknown>;

type SegmentKey =
  | 'work'
  | 'personal'
  | 'unapproved'
  | 'unclassified'
  | 'locked'
  | 'suspended'
  | 'idle';

type PersonChartItem = {
  key: string;
  name: string;
  login?: string;
  totalMs: number;
  segments: Record<SegmentKey, number>;
};

const pageSize = 5;
const chartHeight = 300;
const labelAreaHeight = 52;

const segmentDefs: Array<{
  key: SegmentKey;
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
}> = [
  {
    key: 'work',
    label: 'Uso de trabalho',
    color: tokens.color.success.bar,
    textColor: '#ffffff',
    borderColor: tokens.color.success.border,
  },
  {
    key: 'personal',
    label: 'Uso pessoal',
    color: tokens.color.info.bar,
    textColor: '#ffffff',
    borderColor: tokens.color.info.border,
  },
  {
    key: 'unapproved',
    label: 'Uso pessoal nao aprovado',
    color: tokens.color.danger.bar,
    textColor: '#ffffff',
    borderColor: tokens.color.danger.border,
  },
  {
    key: 'unclassified',
    label: 'Nao classificado',
    color: tokens.color.neutral.bar,
    textColor: '#ffffff',
    borderColor: tokens.color.neutral.border,
  },
  {
    key: 'locked',
    label: 'Estacao bloqueada',
    color: tokens.color.warning.bar,
    textColor: '#713F12',
    borderColor: tokens.color.warning.border,
  },
  {
    key: 'suspended',
    label: 'Suspenso',
    color: '#FDE68A',
    textColor: '#713F12',
    borderColor: tokens.color.warning.border,
  },
  {
    key: 'idle',
    label: 'Tempo ocioso',
    color: tokens.color.primary.soft,
    textColor: tokens.color.primary.dark,
    borderColor: tokens.color.primary.border,
  },
];

const emptySegments = (): Record<SegmentKey, number> => ({
  work: 0,
  personal: 0,
  unapproved: 0,
  unclassified: 0,
  locked: 0,
  suspended: 0,
  idle: 0,
});

function normalizeComparableText(value?: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
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

function getActivityUserKey(activity: ActivityLike) {
  return (
    getTextValue(activity, ['userId', 'login', 'userName', 'email', 'name']) ??
    'usuario-nao-informado'
  );
}

function getActivityUserName(activity: ActivityLike) {
  return (
    getTextValue(activity, ['userName', 'name', 'login', 'userId', 'email']) ??
    'Usuario nao informado'
  );
}

function getUserKey(user: UserProductivity) {
  return user.userId ?? user.id ?? user.userName ?? user.name ?? user.email ?? '';
}

function getUserName(user: UserProductivity) {
  return user.name ?? user.userName ?? user.email ?? user.userId ?? user.id ?? '';
}

function findUserByActivityKey(activityKey: string, users: UserProductivity[]) {
  const normalizedActivityKey = normalizeComparableText(activityKey);

  return users.find((user) => {
    return [user.userId, user.id, user.userName, user.name, user.email]
      .filter(Boolean)
      .some((value) => normalizeComparableText(String(value)) === normalizedActivityKey);
  });
}

function classifyActivity(activity: ActivityLike): SegmentKey {
  const category = getTextValue(activity, ['category'])?.trim().toUpperCase();
  const categoryName = getTextValue(activity, ['categoryName'])?.trim().toLowerCase() ?? '';

  if (category === 'B' || categoryName.includes('business')) {
    return 'work';
  }

  if (category === 'A' || categoryName === 'personal use') {
    return 'personal';
  }

  if (category === 'D' || categoryName.includes('unapproved')) {
    return 'unapproved';
  }

  if (category === 'L' || categoryName.includes('lock')) {
    return 'locked';
  }

  if (category === 'G' || categoryName.includes('suspended')) {
    return 'suspended';
  }

  if (category === 'C' || categoryName.includes('idle')) {
    return 'idle';
  }

  return 'unclassified';
}

function formatDuration(milliseconds: number) {
  if (!milliseconds || milliseconds <= 0) {
    return '0h';
  }

  const totalMinutes = Math.round(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
  }

  return `${minutes}min`;
}

function formatAxisHours(milliseconds: number) {
  return Math.round(milliseconds / 3600000).toString();
}

export function PersonActivityStackedChart({
  activities,
  users = [],
}: PersonActivityStackedChartProps) {
  const [page, setPage] = useState(0);
  const safeActivities = Array.isArray(activities) ? activities : [];
  const safeUsers = Array.isArray(users) ? users : [];

  const chartData = useMemo(() => {
    const map = new Map<string, PersonChartItem>();

    for (const activity of safeActivities) {
      const activityAny = activity as ActivityLike;
      const key = getActivityUserKey(activityAny);
      const user = findUserByActivityKey(key, safeUsers);
      const userKey = user ? getUserKey(user) : key;
      const current = map.get(userKey) ?? {
        key: userKey,
        name: user ? getUserName(user) : getActivityUserName(activityAny),
        login: user?.userId ?? getTextValue(activityAny, ['login', 'userId']),
        totalMs: 0,
        segments: emptySegments(),
      };
      const segmentKey = classifyActivity(activityAny);
      const durationMs = getActivityDurationMs(activityAny);

      current.segments[segmentKey] += durationMs;
      map.set(userKey, current);
    }

    for (const item of map.values()) {
      const user = safeUsers.find((currentUser) => getUserKey(currentUser) === item.key);
      const expectedMs = user?.expectedWorkTimeMs ?? 0;
      const nonIdleMs =
        item.segments.work +
        item.segments.personal +
        item.segments.unapproved +
        item.segments.unclassified +
        item.segments.locked +
        item.segments.suspended;

      if (expectedMs > 0) {
        item.segments.idle = Math.max(expectedMs - nonIdleMs, 0);
      }

      item.totalMs = segmentDefs.reduce((total, segment) => {
        return total + item.segments[segment.key];
      }, 0);
    }

    return Array.from(map.values())
      .filter((item) => item.totalMs > 0)
      .sort((first, second) => second.totalMs - first.totalMs);
  }, [safeActivities, safeUsers]);

  const totalPages = Math.max(Math.ceil(chartData.length / pageSize), 1);
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = chartData.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const maxTotalMs = Math.max(...pageItems.map((item) => item.totalMs), 1);
  const roundedMaxMs = Math.max(Math.ceil(maxTotalMs / 3600000) * 3600000, 3600000);
  const yTicks = [1, 0.75, 0.5, 0.25, 0];

  return (
    <Card
      sx={{
        ...dashboardPanelSx,
        borderRadius: '12px',
        borderLeft: '4px solid #F57C00',
        boxShadow: 'none',
        p: { xs: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          mb: 2,
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
            <QueryStatsIcon sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{
                fontFamily: tokens.font.display,
                color: tokens.color.ink,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Atividades de Pessoa
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: '#4D4D4D',
                fontSize: 13,
              }}
            >
              Tempo por categoria agrupado por colaborador.
            </Typography>
          </Box>
        </Box>

        <Chip
          icon={<ExpandMoreIcon sx={{ fontSize: '17px !important' }} />}
          label={`${chartData.length} pessoa${chartData.length === 1 ? '' : 's'}`}
          size="small"
          variant="outlined"
          sx={{
            height: 30,
            bgcolor: '#FFEEE6',
            borderColor: '#FFD8C8',
            color: '#FF4B0B',
            fontWeight: 700,
            '& .MuiChip-icon': {
              color: '#FF4B0B',
            },
          }}
        />
      </Box>

      <Box
        sx={{
          borderTop: '1px solid #E0E0E0',
          borderColor: 'divider',
          pt: 2,
        }}
      >
        <Box
          sx={{
            mb: 1,
            display: 'grid',
            gridTemplateColumns: '40px 1fr 40px',
            alignItems: 'center',
          }}
        >
          <IconButton
            size="small"
            disabled={safePage === 0}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          sx={{ color: tokens.color.muted }}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon />
          </IconButton>

          <Typography
            sx={{
              textAlign: 'center',
              color: tokens.color.ink,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Página {safePage + 1}
          </Typography>

          <IconButton
            size="small"
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            sx={{ color: tokens.color.muted }}
            aria-label="Próxima página"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box
            sx={{
              minWidth: 760,
              display: 'grid',
              gridTemplateColumns: '44px 1fr',
              columnGap: 1.5,
              p: 2,
              border: '1px solid #E0E0E0',
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box
              sx={{
                height: chartHeight,
                position: 'relative',
                color: tokens.color.muted,
                fontFamily: tokens.font.mono,
                fontSize: 12,
                pr: 0.5,
              }}
            >
              {yTicks.map((tick) => (
                <Typography
                  key={tick}
                  sx={{
                    position: 'absolute',
                    top: `${(1 - tick) * 100}%`,
                    right: 0,
                    transform: 'translateY(-50%)',
                    color: tokens.color.mutedLight,
                    fontFamily: tokens.font.mono,
                    fontSize: 12,
                  }}
                >
                  {formatAxisHours(roundedMaxMs * tick)}
                </Typography>
              ))}

              <Typography
                sx={{
                  position: 'absolute',
                  left: -22,
                  top: '50%',
                  transform: 'rotate(-90deg) translateX(-50%)',
                  transformOrigin: 'left top',
                  color: tokens.color.muted,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Duracao (horas)
              </Typography>
            </Box>

            <Box>
              <Box
                sx={{
                  position: 'relative',
                  height: chartHeight,
                  pb: 1,
                  borderBottom: '1px solid #DADADA',
                  bgcolor: '#ffffff',
                  borderRadius: '10px',
                }}
              >
                {yTicks.map((tick) => (
                  <Box
                    key={tick}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: `${(1 - tick) * 100}%`,
                      borderTop: `1px solid ${tick === 0 ? '#DADADA' : '#EFEFEF'}`,
                    }}
                  />
                ))}

                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${Math.max(pageItems.length, 1)}, minmax(110px, 1fr))`,
                    gap: 4,
                    alignItems: 'end',
                    px: 2,
                  }}
                >
                  {pageItems.map((item) => {
                    const barHeight = Math.max((item.totalMs / roundedMaxMs) * chartHeight, 2);

                    return (
                      <Box
                        key={item.key}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          pb: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 0.6,
                            color: tokens.color.ink,
                            fontFamily: tokens.font.mono,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {formatDuration(item.totalMs)}
                        </Typography>

                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 176,
                            height: barHeight,
                            minHeight: 3,
                            display: 'flex',
                            flexDirection: 'column-reverse',
                            borderRadius: '8px 8px 0 0',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {segmentDefs.map((segment) => {
                            const value = item.segments[segment.key];
                            const percent = item.totalMs > 0 ? (value / item.totalMs) * 100 : 0;

                            if (value <= 0) {
                              return null;
                            }

                            return (
                              <Box
                                key={`${item.key}-${segment.key}`}
                                title={`${segment.label}: ${formatDuration(value)} (${Math.round(percent)}%)`}
                                sx={{
                                  minHeight: percent > 0 ? 3 : 0,
                                  height: `${percent}%`,
                                  bgcolor: segment.color,
                                  display: 'grid',
                                  placeItems: 'center',
                                }}
                              >
                                {percent >= 6 && (
                                  <Typography
                                    sx={{
                                      color: segment.textColor,
                                      fontSize: 11,
                                      fontWeight: 800,
                                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.22)',
                                      lineHeight: 1,
                                    }}
                                  >
                                    {Math.round(percent)}%
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.max(pageItems.length, 1)}, minmax(110px, 1fr))`,
                  gap: 4,
                  px: 2,
                  pt: 1.8,
                  minHeight: labelAreaHeight,
                  alignItems: 'start',
                }}
              >
                {pageItems.map((item) => (
                  <Box
                    key={`${item.key}-label`}
                    sx={{
                      minWidth: 0,
                      textAlign: 'center',
                      px: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        color: tokens.color.ink,
                        fontSize: 12,
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </Typography>

                    <Typography
                      sx={{
                        color: tokens.color.muted,
                        fontSize: 11.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.login ?? item.key}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 1.5,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {segmentDefs.map((segment) => (
            <Chip
              key={segment.key}
              size="small"
              variant="outlined"
              label={segment.label}
              icon={
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: 0.6,
                    bgcolor: segment.color,
                    border: `1px solid ${segment.borderColor}`,
                  }}
                />
              }
              sx={{
                height: 28,
                bgcolor: '#ffffff',
                borderColor: segment.borderColor,
                color: '#4D4D4D',
                fontSize: 12,
                fontWeight: 700,
                '& .MuiChip-icon': {
                  ml: 1,
                },
              }}
            />
          ))}
        </Box>

        {chartData.length === 0 && (
          <Box
            sx={{
              mt: 2,
              p: 3,
              border: '1px dashed #FFD8C8',
              borderRadius: '12px',
              bgcolor: '#FFEEE6',
              textAlign: 'center',
            }}
          >
            <Typography sx={{ color: tokens.color.ink, fontWeight: 700, fontSize: 14 }}>
              Nenhuma atividade para montar o grafico
            </Typography>
            <Typography sx={{ mt: 0.5, color: tokens.color.muted, fontSize: 13 }}>
              Ajuste os filtros para visualizar o empilhamento por pessoa.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
