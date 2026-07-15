import KeyboardAltOutlinedIcon from '@mui/icons-material/KeyboardAltOutlined';
import MouseOutlinedIcon from '@mui/icons-material/MouseOutlined';
import { Box, Card, Chip, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { KeystrokeItem } from '@/types/dashboard-produtividade';
import {
  dashboardIconBoxSx,
  dashboardPanelSx,
  dashboardTokens as tokens,
} from '@/theme/dashboard-produtividade.tokens';

type KeystrokesPanelProps = {
  keystrokes: KeystrokeItem[];
  error?: string | null;
};

function formatNumber(value?: number) {
  return new Intl.NumberFormat('pt-BR').format(value ?? 0);
}

function formatDuration(duration?: number) {
  if (!duration || duration <= 0) {
    return '-';
  }

  const totalSeconds = duration > 1000 ? Math.round(duration / 1000) : Math.round(duration);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  if (minutes > 0) {
    return `${minutes}min ${seconds}s`;
  }

  return `${seconds}s`;
}

function formatDateTime(value?: string) {
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

const headCellSx = {
  fontFamily: tokens.font.display,
  fontWeight: 800,
  fontSize: 12.5,
  color: tokens.color.primary.dark,
  borderColor: tokens.color.primary.border,
  whiteSpace: 'nowrap',
};

export function KeystrokesPanel({ keystrokes, error }: KeystrokesPanelProps) {
  const totalKeystrokes = keystrokes.reduce(
    (total, item) => total + (item.keystrokesCount ?? 0),
    0,
  );
  const totalClicks = keystrokes.reduce(
    (total, item) => total + (item.mouseClicksCount ?? 0),
    0,
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={dashboardIconBoxSx}>
            <KeyboardAltOutlinedIcon sx={{ fontSize: 21 }} />
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
              Teclas e cliques
            </Typography>

            <Typography sx={{ mt: 0.35, color: tokens.color.muted, fontSize: 13 }}>
              Pressionamentos de teclas e cliques de mouse por pessoa e maquina.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            icon={<KeyboardAltOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            label={`${formatNumber(totalKeystrokes)} teclas`}
            size="small"
            sx={{
              bgcolor: tokens.color.primary.bg,
              border: `1px solid ${tokens.color.primary.border}`,
              color: tokens.color.primary.text,
              '& .MuiChip-icon': { color: tokens.color.primary.main },
            }}
          />

          <Chip
            icon={<MouseOutlinedIcon sx={{ fontSize: '16px !important' }} />}
            label={`${formatNumber(totalClicks)} cliques`}
            size="small"
            sx={{
              bgcolor: tokens.color.info.bg,
              border: `1px solid ${tokens.color.info.border}`,
              color: tokens.color.info.text,
              '& .MuiChip-icon': { color: tokens.color.info.text },
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ mb: 2.5, borderColor: 'divider' }} />

      {error && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.25,
            bgcolor: tokens.color.warning.bg,
            border: `1px solid ${tokens.color.warning.border}`,
          }}
        >
          <Typography sx={{ color: tokens.color.warning.text, fontSize: 13, fontWeight: 700 }}>
            Nao foi possivel carregar teclas e cliques: {error}
          </Typography>
        </Box>
      )}

      {!error && keystrokes.length > 0 && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table
            sx={{
              minWidth: 820,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.25,
              overflow: 'hidden',
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={headCellSx}>Pessoa</TableCell>
                <TableCell sx={headCellSx}>Maquina</TableCell>
                <TableCell sx={headCellSx}>Teclas</TableCell>
                <TableCell sx={headCellSx}>Cliques</TableCell>
                <TableCell sx={headCellSx}>Duracao</TableCell>
                <TableCell sx={headCellSx}>Inicio</TableCell>
                <TableCell sx={headCellSx}>Fim</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {keystrokes.map((item, index) => (
                <TableRow
                  key={`${item.personId ?? item.userName}-${item.deviceId ?? index}-${item.start ?? index}`}
                  sx={{
                    '&:last-child td': { borderBottom: 0 },
                    '& td': { borderColor: 'divider' },
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell>
                    <Typography sx={{ color: tokens.color.ink, fontSize: 13.5, fontWeight: 800 }}>
                      {item.userName ?? 'Usuario nao informado'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: tokens.color.muted, fontSize: 13 }}>
                    {item.machineName ?? '-'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: tokens.font.mono, fontWeight: 800 }}>
                    {formatNumber(item.keystrokesCount)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: tokens.font.mono, fontWeight: 800 }}>
                    {formatNumber(item.mouseClicksCount)}
                  </TableCell>
                  <TableCell sx={{ color: tokens.color.muted, fontSize: 13 }}>
                    {formatDuration(item.duration)}
                  </TableCell>
                  <TableCell sx={{ color: tokens.color.muted, fontSize: 13 }}>
                    {formatDateTime(item.start)}
                  </TableCell>
                  <TableCell sx={{ color: tokens.color.muted, fontSize: 13 }}>
                    {formatDateTime(item.end)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {!error && keystrokes.length === 0 && (
        <Box
          sx={{
            p: 4,
            border: `1px dashed ${tokens.color.primary.border}`,
            borderRadius: 1.25,
            bgcolor: tokens.color.primary.bg,
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 800, color: tokens.color.ink, fontSize: 15 }}>
            Nenhum dado de teclas e cliques encontrado no periodo.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
