import { KeystrokeItem } from '@/types/dashboard-produtividade';

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
    <section className="panel keystrokes-panel">
      <div className="panel-header panel-header-row">
        <div>
          <h2 className="section-title">Teclas e cliques</h2>
          <p className="section-description">
            Pressionamentos de teclas e cliques de mouse por pessoa e máquina.
          </p>
        </div>

        <div className="keystrokes-totals">
          <span>{formatNumber(totalKeystrokes)} teclas</span>
          <span>{formatNumber(totalClicks)} cliques</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          Não foi possível carregar teclas e cliques: {error}
        </div>
      )}

      {!error && keystrokes.length > 0 && (
        <div className="table-wrapper">
          <table className="productivity-table keystrokes-table">
            <thead>
              <tr>
                <th>Pessoa</th>
                <th>Máquina</th>
                <th>Teclas</th>
                <th>Cliques</th>
                <th>Duração</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>

            <tbody>
              {keystrokes.map((item, index) => (
                <tr key={`${item.personId ?? item.userName}-${item.deviceId ?? index}-${item.start ?? index}`}>
                  <td>
                    <strong className="user-name">
                      {item.userName ?? 'Usuário não informado'}
                    </strong>
                  </td>
                  <td>{item.machineName ?? '-'}</td>
                  <td>{formatNumber(item.keystrokesCount)}</td>
                  <td>{formatNumber(item.mouseClicksCount)}</td>
                  <td>{formatDuration(item.duration)}</td>
                  <td>{formatDateTime(item.start)}</td>
                  <td>{formatDateTime(item.end)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && keystrokes.length === 0 && (
        <div className="empty-state">
          Nenhum dado de teclas e cliques encontrado no período.
        </div>
      )}
    </section>
  );
}
