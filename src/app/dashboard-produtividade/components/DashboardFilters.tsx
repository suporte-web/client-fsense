'use client';

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import {
  DashboardFilters as DashboardFiltersType,
  TeamItem,
  UserProductivity,
} from '@/types/dashboard-produtividade';

import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type DashboardFiltersProps = {
  filters: DashboardFiltersType;
  users: UserProductivity[];
  teams: TeamItem[];
  loading?: boolean;
  onChange: (filters: DashboardFiltersType) => void;
};

const MAX_DAYS_RANGE = 14;

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDaysBetween(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
}

function isInvalidDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return false;
  }

  if (endDate < startDate) {
    return true;
  }

  return getDaysBetween(startDate, endDate) > MAX_DAYS_RANGE;
}

function getUserId(user: UserProductivity) {
  return (
    user.userId ??
    user.id ??
    user.email ??
    user.userName ??
    user.name ??
    ''
  );
}

function getUserName(user: UserProductivity) {
  return user.name ?? user.userName ?? user.email ?? 'Usuário sem nome';
}

function getTeamId(team: TeamItem) {
  return String(team.id ?? team.name ?? '');
}

function getTeamName(team: TeamItem) {
  return team.name ?? 'Equipe sem nome';
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 48,

    '&.Mui-disabled': {
      bgcolor: '#F8FAFC',
    },
  },

  '& .MuiSelect-icon': {
    color: '#64748B',
  },
};

const menuPaperSx = {
  mt: 0.8,
  maxHeight: 340,
  borderRadius: 1,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
};

export function DashboardFilters({
  filters,
  users,
  teams,
  loading = false,
  onChange,
}: DashboardFiltersProps) {
  const today = getTodayDate();

  const startDate = filters.startDate ?? today;
  const endDate = filters.endDate ?? startDate;

  const selectedDays = getDaysBetween(startDate, endDate);
  const dateRangeInvalid = isInvalidDateRange(startDate, endDate);

  const filteredUsers = filters.teamName
    ? users.filter((user) => user.teamName === filters.teamName)
    : users;

  function handleStartDateChange(value: string) {
    const nextStartDate = value || today;
    const nextEndDate = filters.endDate ?? nextStartDate;

    if (isInvalidDateRange(nextStartDate, nextEndDate)) {
      onChange({
        ...filters,
        startDate: nextStartDate,
        endDate: nextStartDate,
      });

      return;
    }

    onChange({
      ...filters,
      startDate: nextStartDate,
      endDate: nextEndDate,
    });
  }

  function handleEndDateChange(value: string) {
    const nextEndDate = value || startDate;

    if (isInvalidDateRange(startDate, nextEndDate)) {
      return;
    }

    onChange({
      ...filters,
      endDate: nextEndDate,
    });
  }

  function handleTeamChange(value: string) {
    const selectedTeam = teams.find(
      (team) => getTeamId(team) === value,
    );

    onChange({
      ...filters,
      teamId: value || undefined,
      teamName: selectedTeam
        ? getTeamName(selectedTeam)
        : undefined,
      userId: undefined,
      userName: undefined,
    });
  }

  function handleUserChange(value: string) {
    const selectedUser = users.find(
      (user) => getUserId(user) === value,
    );

    onChange({
      ...filters,
      userId: value || undefined,
      userName: selectedUser
        ? getUserName(selectedUser)
        : undefined,
    });
  }

  function clearFilters() {
    const currentDate = getTodayDate();

    onChange({
      startDate: currentDate,
      endDate: currentDate,
      teamId: undefined,
      teamName: undefined,
      userId: undefined,
      userName: undefined,
    });
  }

  return (
    <Card
      component="section"
      sx={{
        ...dashboardPanelSx,
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          pt: {
            xs: 2,
            md: 2.5,
          },
          pb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
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
                width: 46,
                height: 46,
                color: '#FFFFFF',
                background:
                  'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
                boxShadow:
                  '0 8px 20px rgba(234, 88, 12, 0.22)',
              }}
            >
              <FilterAltIcon sx={{ fontSize: 23 }} />
            </Box>

            <Box>
              <Typography
                component="h2"
                sx={{
                  fontFamily: tokens.font.display,
                  color: tokens.color.ink,
                  fontSize: {
                    xs: 16,
                    md: 17,
                  },
                  fontWeight: 800,
                  lineHeight: 1.25,
                }}
              >
                Filtros de consulta
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  color: '#64748B',
                  fontSize: {
                    xs: 12,
                    sm: 12.5,
                  },
                  lineHeight: 1.5,
                }}
              >
                Selecione o período, a equipe ou a pessoa para refinar os dados
                do dashboard.
              </Typography>
            </Box>
          </Box>

          {!dateRangeInvalid && selectedDays > 0 && (
            <Chip
              icon={
                <CalendarMonthOutlinedIcon
                  sx={{
                    fontSize: '17px !important',
                  }}
                />
              }
              label={`${selectedDays} ${
                selectedDays === 1
                  ? 'dia selecionado'
                  : 'dias selecionados'
              }`}
              variant="outlined"
              sx={{
                height: 34,
                bgcolor: 'background.paper',
                borderColor: 'divider',
                color: 'text.secondary',
                fontSize: 12,

                '& .MuiChip-icon': {
                  color: '#64748B',
                  ml: 1,
                },
              }}
            />
          )}
        </Box>
      </Box>

      <Divider
        sx={{
          borderColor: 'divider',
        }}
      />

      <Box
        sx={{
          px: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          py: {
            xs: 2,
            md: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: `
                minmax(330px, 1.35fr)
                minmax(210px, 0.8fr)
                minmax(210px, 0.8fr)
                auto
              `,
            },
            gap: {
              xs: 2,
              md: 2,
            },
            alignItems: 'end',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                mb: 0.9,
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              Período
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: {
                  xs: 'column',
                  sm: 'row',
                },
                alignItems: {
                  xs: 'stretch',
                  sm: 'center',
                },
                gap: 1.2,
              }}
            >
              <TextField
                type="date"
                value={startDate}
                disabled={loading}
                onChange={(event) =>
                  handleStartDateChange(event.target.value)
                }
                fullWidth
                size="small"
                sx={fieldSx}
                slotProps={{
                  htmlInput: {
                    max: today,
                  },
                }}
              />

              <Typography
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },
                  color: '#64748B',
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                até
              </Typography>

              <TextField
                type="date"
                value={endDate}
                disabled={loading}
                onChange={(event) =>
                  handleEndDateChange(event.target.value)
                }
                fullWidth
                size="small"
                sx={fieldSx}
                slotProps={{
                  htmlInput: {
                    min: startDate,
                    max: today,
                  },
                }}
              />
            </Box>
          </Box>

          <FormControl
            fullWidth
            size="small"
            disabled={loading}
            sx={fieldSx}
          >
            <InputLabel>Equipe</InputLabel>

            <Select
              label="Equipe"
              value={filters.teamId ?? ''}
              onChange={(event) =>
                handleTeamChange(String(event.target.value))
              }
              startAdornment={
                <InputAdornment position="start">
                  <GroupsOutlinedIcon
                    sx={{
                      color: '#94A3B8',
                      fontSize: 19,
                    }}
                  />
                </InputAdornment>
              }
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: menuPaperSx,
                  },
                },
              }}
            >
              <MenuItem value="">Todas as equipes</MenuItem>

              {teams.map((team) => {
                const teamId = getTeamId(team);

                return (
                  <MenuItem key={teamId} value={teamId}>
                    {getTeamName(team)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            size="small"
            disabled={loading}
            sx={fieldSx}
          >
            <InputLabel>Pessoa</InputLabel>

            <Select
              label="Pessoa"
              value={filters.userId ?? ''}
              onChange={(event) =>
                handleUserChange(String(event.target.value))
              }
              startAdornment={
                <InputAdornment position="start">
                  <PersonOutlineOutlinedIcon
                    sx={{
                      color: '#94A3B8',
                      fontSize: 19,
                    }}
                  />
                </InputAdornment>
              }
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: menuPaperSx,
                  },
                },
              }}
            >
              <MenuItem value="">Todas as pessoas</MenuItem>

              {filteredUsers.map((user) => {
                const userId = getUserId(user);

                return (
                  <MenuItem key={userId} value={userId}>
                    {getUserName(user)}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<FilterAltOffIcon />}
            onClick={clearFilters}
            disabled={loading}
            sx={{
              height: 48,
              px: 2.2,
              minWidth: {
                xs: '100%',
                md: 154,
              },
              bgcolor: '#FFFFFF',
              fontSize: 12.5,
              whiteSpace: 'nowrap',

              '& .MuiButton-startIcon': {
                mr: 0.8,
              },

              '&:hover': {
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.10)',
              },

              '&.Mui-disabled': {
                borderColor: '#CBD5E1',
                color: '#94A3B8',
              },
            }}
          >
            Limpar filtros
          </Button>
        </Box>

        {dateRangeInvalid && (
          <Alert
            severity="warning"
            variant="outlined"
            sx={{
              mt: 2,
              borderRadius: 1,
              borderColor: '#FDBA74',
              bgcolor: '#FFF7ED',
              color: '#9A3412',
              fontSize: 13,
              fontWeight: 600,

              '& .MuiAlert-icon': {
                color: '#EA580C',
              },
            }}
          >
            O período máximo permitido é de {MAX_DAYS_RANGE} dias.
          </Alert>
        )}
      </Box>
    </Card>
  );
}
