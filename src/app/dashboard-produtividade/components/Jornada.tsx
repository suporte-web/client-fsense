'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';
import type { Jornada } from '@/types/dashboard-produtividade';
import { DashboardProdutividadeService } from '@/services/dashboard-produtividade.service';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

type JornadasCardProps = {
  userId?: string;
  userName?: string;
};

const weekdayOrder = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

const weekdayAbbrev: Record<string, string> = {
  MONDAY: 'SEG',
  TUESDAY: 'TER',
  WEDNESDAY: 'QUA',
  THURSDAY: 'QUI',
  FRIDAY: 'SEX',
  SATURDAY: 'SAB',
  SUNDAY: 'DOM',
};

function formatTime(value?: string) {
  if (!value) return '-';
  return value.slice(0, 5);
}

function timeToPercent(value?: string): number | null {
  if (!value) return null;
  const [h, m] = value.slice(0, 5).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return ((h * 60 + m) / 1440) * 100;
}

interface DayBarProps {
  weekday: string;
  start?: string;
  end?: string;
  maxFlexibleDuration?: string | number | null;
  accent: string;
}

function DayBar({ weekday, start, end, maxFlexibleDuration, accent }: DayBarProps) {
  const startPct = timeToPercent(start);
  const endPct = timeToPercent(end);
  const isOff = startPct === null && endPct === null && !maxFlexibleDuration;
  const widthPct =
    startPct !== null && endPct !== null ? Math.max(endPct - startPct, 2) : null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '36px 1fr auto',
          sm: '42px 1fr auto',
        },
        alignItems: 'center',
        gap: 1.25,
        p: 1,
        borderRadius: '10px',
        bgcolor: isOff ? '#ffffff' : '#FFF7ED',
        border: '1px solid',
        borderColor: isOff ? '#E0E0E0' : '#FFCCBC',
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.font.mono,
          fontSize: 11,
          fontWeight: 700,
          color: isOff ? tokens.color.mutedLight : tokens.color.ink,
        }}
      >
        {weekdayAbbrev[weekday] ?? weekday}
      </Typography>

      <Box
        sx={{
          position: 'relative',
          height: 8,
          bgcolor: isOff ? 'transparent' : '#FFEDD5',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        {startPct !== null && widthPct !== null && (
          <Box
            sx={{
              position: 'absolute',
              left: `${startPct}%`,
              width: `${widthPct}%`,
              height: '100%',
              bgcolor: accent,
              borderRadius: 999,
            }}
          />
        )}
      </Box>

      <Typography
        sx={{
          fontFamily: tokens.font.mono,
          fontSize: 11,
          color: isOff ? tokens.color.mutedLight : tokens.color.muted,
          minWidth: 96,
          textAlign: 'right',
          fontWeight: 600,
        }}
      >
        {start && end
          ? `${formatTime(start)}-${formatTime(end)}`
          : maxFlexibleDuration
            ? `flex ${maxFlexibleDuration}`
            : 'folga'}
      </Typography>
    </Box>
  );
}

export function JornadasCard({ userId, userName }: JornadasCardProps) {
  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingWorkday, setMissingWorkday] = useState(false);

  function isMissingWorkdayError(err: unknown) {
    if (!(err instanceof Error)) {
      return false;
    }

    const message = err.message.toLowerCase();

    return (
      message.includes('statuscode":400') &&
      (message.includes('nao possui jornada vinculada') ||
        message.includes('não possui jornada vinculada'))
    );
  }

  async function loadJornadas() {
    if (!userId) {
      setJornadas([]);
      setError(null);
      setMissingWorkday(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setMissingWorkday(false);

      const response = await DashboardProdutividadeService.findJornadas({
        userId,
        page: 1,
        limit: 1,
      });

      setJornadas(response.data ?? []);
    } catch (err) {
      console.error('Erro ao carregar jornadas:', err);

      if (isMissingWorkdayError(err)) {
        setMissingWorkday(true);
        setError(null);
        setJornadas([]);
        return;
      }

      setError(
        err instanceof Error
          ? `Nao foi possivel carregar a jornada. ${err.message}`
          : 'Nao foi possivel carregar a jornada.',
      );
      setJornadas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJornadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const title = userId ? `Jornada de ${userName ?? 'colaborador'}` : 'Jornada do colaborador';
  const subtitle = userId
    ? 'Jornada vinculada a pessoa selecionada nos filtros.'
    : 'Selecione uma pessoa no filtro para visualizar a jornada vinculada.';

  return (
    <Card
      sx={{
        ...dashboardPanelSx,
        borderRadius: '12px',
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1.2,
            }}
          >
            <Box
              sx={{
                ...dashboardIconBoxSx,
                width: 54,
                height: 54,
                borderRadius: '10px',
                bgcolor: '#FFEEE6',
                color: '#FF4B0B',
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 24 }} />
            </Box>

            <Box sx={{ minWidth: 0, maxWidth: 320 }}>
              <Typography
                sx={{
                  fontFamily: tokens.font.display,
                  fontWeight: 700,
                  fontSize: 20,
                  color: tokens.color.ink,
                  letterSpacing: 0,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#4D4D4D',
                  fontSize: 13,
                  mt: 0.75,
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Box>

          {loading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: '10px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FFCCBC',
              }}
            >
              <CircularProgress size={20} sx={{ color: '#f97316' }} />
              <Typography variant="body2" sx={{ color: tokens.color.muted }}>
                Carregando jornada...
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Box
              sx={{
                p: 2,
                borderRadius: '10px',
                bgcolor: tokens.color.danger.bg,
                border: `1px solid ${tokens.color.danger.border}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: tokens.color.danger.text, mb: 1 }}
              >
                {error}
              </Typography>

              <Button
                size="small"
                onClick={loadJornadas}
                sx={{
                  color: tokens.color.danger.text,
                  fontWeight: 800,
                  textTransform: 'none',
                }}
              >
                Tentar novamente
              </Button>
            </Box>
          )}

          {!loading && !error && missingWorkday && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: '10px',
                bgcolor: '#FFF7ED',
                border: '1px solid #FFCCBC',
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#F45100' }}
              >
                Colaborador PJ sem jornada cadastrada
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: tokens.color.muted, fontSize: 13, mt: 0.75 }}
              >
                Este colaborador não possui jornada vinculada. Para PJ, o painel
                considera apenas os registros de uso retornados pela Fsense.
              </Typography>
            </Box>
          )}

          {!loading && !error && !missingWorkday && jornadas.length === 0 && (
            <Box
              sx={{
                p: 2.5,
                borderRadius: '12px',
                bgcolor: '#FFF7ED',
                border: '1px dashed #FFB074',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: tokens.color.ink }}
              >
                {userId ? 'Colaborador sem jornada vinculada' : 'Nenhum colaborador selecionado'}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: tokens.color.muted, fontSize: 13, mt: 0.5 }}
              >
                {userId
                  ? 'Verifique o cadastro da pessoa na API Fsense.'
                  : 'Use o filtro Pessoa para carregar apenas a jornada do colaborador escolhido.'}
              </Typography>
            </Box>
          )}

          {!loading &&
            !error &&
            jornadas.map((jornada) => {
              const schedules = jornada.workdayScheduleList ?? [];
              const scheduleByWeekday = new Map(
                schedules.map((s) => [s.weekday, s]),
              );
              const isFlexible = jornada.isFlexible;
              const accentSet = isFlexible
                ? {
                  bg: '#ffedd5',
                  text: '#c2410c',
                  bar: '#fb923c',
                }
                : {
                  bg: '#fff7ed',
                  text: '#ea580c',
                  bar: '#f97316',
                };

              return (
                <Box
                  key={jornada.id}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    gap: 1.75,
                    p: { xs: 2, md: 2.5 },
                    borderRadius: '12px',
                    bgcolor: '#ffffff',
                    border: '1px solid',
                    borderColor: '#E0E0E0',
                    boxShadow: 'none',
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
                      bgcolor: accentSet.bg,
                      opacity: 0.8,
                    }}
                  />

                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.75,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontFamily: tokens.font.display,
                            fontWeight: 700,
                            fontSize: 15,
                            color: tokens.color.ink,
                          }}
                        >
                          {jornada.name}
                        </Typography>

                        <Typography
                          sx={{
                            fontFamily: tokens.font.mono,
                            fontSize: 11,
                            color: tokens.color.mutedLight,
                            mt: 0.5,
                          }}
                        >
                          ID {jornada.id}
                        </Typography>
                      </Box>

                      <Chip
                        size="small"
                        label={isFlexible ? 'Flexivel' : 'Fixa'}
                        sx={{
                          bgcolor: accentSet.bg,
                          color: accentSet.text,
                          border: '1px solid #FFCCBC',
                          fontWeight: 700,
                          fontSize: 12,
                          height: 24,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 0.75,
                      }}
                    >
                      <Chip
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#fed7aa',
                          color: tokens.color.muted,
                          fontSize: 11,
                          height: 22,
                          bgcolor: '#ffffff',
                        }}
                        label={
                          jornada.workNationalHolidays
                            ? 'Trabalha feriado nacional'
                            : 'Não trabalha feriado nacional'
                        }
                      />

                      <Chip
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#fed7aa',
                          color: tokens.color.muted,
                          fontSize: 11,
                          height: 22,
                          bgcolor: '#ffffff',
                        }}
                        label={
                          jornada.workRegionalHolidays
                            ? 'Trabalha feriado regional'
                            : 'Não trabalha feriado regional'
                        }
                      />

                      {jornada.ignoreNonFocusLongerThan && (
                        <Chip
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#fed7aa',
                            color: tokens.color.muted,
                            fontSize: 11,
                            height: 22,
                            bgcolor: '#ffffff',
                          }}
                          label={`Ignora inatividade > ${jornada.ignoreNonFocusLongerThan}`}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                      }}
                    >
                      {weekdayOrder.map((weekday) => {
                        const schedule = scheduleByWeekday.get(weekday);

                        return (
                          <DayBar
                            key={weekday}
                            weekday={weekday}
                            start={schedule?.start}
                            end={schedule?.end}
                            maxFlexibleDuration={schedule?.maxFlexibleDuration}
                            accent={accentSet.bar}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              );
            })}
        </Box>
      </CardContent>
    </Card>
  );
}
