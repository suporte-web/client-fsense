'use client';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimelineIcon from '@mui/icons-material/Timeline';
import {
  Avatar,
  Box,
  Card,
  Chip,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { UserProductivity } from '@/types/dashboard-produtividade';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type UsersProductivityTableProps = {
  users: UserProductivity[];
};

const accent = {
  bg: '#fff7ed',
  text: '#ea580c',
  bar: '#f97316',
  border: '#fed7aa',
  soft: '#ffedd5',
};

function getUserName(user: UserProductivity) {
  return user.name ?? user.userName ?? user.email ?? 'Usuário sem nome';
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);

  if (parts.length === 0) {
    return 'US';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatLastActivity(value?: string) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function getUserVolume(user: UserProductivity) {
  return (user.totalActivities ?? 0) + (user.totalEvents ?? 0);
}

const headCellSx = {
  fontFamily: tokens.font.display,
  fontWeight: 800,
  fontSize: 12.5,
  color: '#9a3412',
  borderColor: '#fed7aa',
  whiteSpace: 'nowrap',
};

export function UsersProductivityTable({ users }: UsersProductivityTableProps) {
  const safeUsers = Array.isArray(users) ? users : [];

  const sortedUsers = [...safeUsers].sort((first, second) => {
    return getUserVolume(second) - getUserVolume(first);
  });

  const maxVolume = Math.max(...sortedUsers.map(getUserVolume), 1);

  return (
    <Card
      sx={{
        ...dashboardPanelSx,
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
            }}
          >
            <TimelineIcon sx={{ fontSize: 21 }} />
          </Box>

          <Box>
            <Typography
              component="h2"
              sx={{
                fontFamily: tokens.font.display,
                color: tokens.color.ink,
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Produtividade por usuário
            </Typography>

            <Typography
              sx={{
                mt: 0.35,
                color: tokens.color.muted,
                fontSize: 13,
              }}
            >
              Ranking por volume de atividades e eventos no período.
            </Typography>
          </Box>
        </Box>

        <Chip
          label={`${formatNumber(sortedUsers.length)} pessoa${sortedUsers.length === 1 ? '' : 's'
            }`}
          size="small"
          sx={{
            height: 30,
            bgcolor: '#fff7ed',
            color: '#c2410c',
            border: '1px solid #fed7aa',
            fontSize: 12,
            '& .MuiChip-label': {
              px: 1.2,
            },
          }}
        />
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: 'divider' }} />

      <Box sx={{ overflowX: 'auto' }}>
        <Table
          sx={{
            minWidth: 820,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
            borderCollapse: 'separate',
            borderSpacing: 0,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={headCellSx}>Pessoa</TableCell>
              <TableCell sx={headCellSx}>Equipe</TableCell>
              <TableCell sx={headCellSx}>Volume</TableCell>
              <TableCell sx={headCellSx}>Atividades</TableCell>
              <TableCell sx={headCellSx}>Eventos</TableCell>
              <TableCell sx={headCellSx}>Último registro</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedUsers.slice(0, 10).map((user, index) => {
              const name = getUserName(user);
              const activities = user.totalActivities ?? 0;
              const events = user.totalEvents ?? 0;
              const volume = activities + events;
              const percent = Math.round((volume / maxVolume) * 100);

              return (
                <TableRow
                  key={user.id ?? user.userId ?? user.email ?? index}
                  sx={{
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                    '& td': {
                      borderColor: 'divider',
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {getInitials(name)}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            color: tokens.color.ink,
                            fontSize: 14,
                            fontWeight: 800,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {name}
                        </Typography>

                        {user.email && (
                          <Typography
                            sx={{
                              color: tokens.color.mutedLight,
                              fontSize: 12,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={user.teamName ?? '-'}
                      size="small"
                      sx={{
                        maxWidth: 190,
                        height: 30,
                        borderRadius: 999,
                        bgcolor: '#fff7ed',
                        color: '#c2410c',
                        border: '1px solid #fed7aa',
                        fontSize: 12,
                        '& .MuiChip-label': {
                          px: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        },
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 190 }}>
                    <Box
                      sx={{
                        mb: 0.7,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: tokens.font.mono,
                          color: tokens.color.ink,
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {formatNumber(volume)}
                      </Typography>

                      <Typography
                        sx={{
                          color: '#c2410c',
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {percent}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        height: 7,
                        borderRadius: 999,
                      }}
                    />
                  </TableCell>

                  <TableCell
                    sx={{
                      fontFamily: tokens.font.mono,
                      color: tokens.color.ink,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(activities)}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontFamily: tokens.font.mono,
                      color: tokens.color.ink,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(events)}
                  </TableCell>

                  <TableCell sx={{ color: tokens.color.muted, fontSize: 13 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <AccessTimeIcon
                        sx={{
                          fontSize: 16,
                          color: accent.text,
                        }}
                      />

                      {formatLastActivity(user.lastActivityAt)}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedUsers.length === 0 && (
          <Box
            sx={{
              mt: 2,
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
              <TimelineIcon />
            </Box>

            <Typography
              sx={{
                fontWeight: 800,
                color: tokens.color.ink,
                fontSize: 15,
              }}
            >
              Nenhum usuário encontrado para o período selecionado.
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                color: tokens.color.muted,
                fontSize: 13,
              }}
            >
              Ajuste os filtros para visualizar o ranking de produtividade.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
}
