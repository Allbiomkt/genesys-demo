import type { MonitoringPoint } from '../../simulator/simulatorTypes';
import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator = ReturnType<typeof useGenesysSimulator>;

type Series = {
  id: string;
  label: string;
  min: number;
  max: number;
  unit: string;
  value: (point: MonitoringPoint) => number;
};

const CHART_WIDTH = 860;
const CHART_HEIGHT = 190;
const PAD_LEFT = 42;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 30;
const WINDOW_SECONDS = 10 * 60;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeFallbackPoint(simulator: Simulator): MonitoringPoint {
  const { state } = simulator;

  return {
    timestamp: new Date().toISOString(),
    cycleSeconds: state.cycleSeconds,
    rpm: state.stirringRunning ? state.rpm : 0,
    air: state.airRunning ? state.air : 0,
    acid: state.acid.mode === 'off' ? 0 : state.acid.rate,
    base: state.base.mode === 'off' ? 0 : state.base.rate,
    antifoam: state.antifoam.mode === 'off' ? 0 : state.antifoam.rate,
    feed: state.feed.mode === 'off' ? 0 : state.feed.rate,
    temperature: state.temperature,
    pH: state.pH,
    pO2: state.pO2,
    foam: state.foam,
  };
}

function formatMinute(seconds: number) {
  return `${Math.floor(seconds / 60)}m`;
}

function MonitoringChart({
  title,
  points,
  series,
}: {
  title: string;
  points: MonitoringPoint[];
  series: Series[];
}) {
  const lastSecond = points[points.length - 1]?.cycleSeconds ?? 0;

  const startSecond = Math.max(0, lastSecond - WINDOW_SECONDS);

  const visiblePoints = points.filter(
    (point) => point.cycleSeconds >= startSecond
  );

  const chartEndSecond = Math.max(startSecond + 60, lastSecond);

  const plotWidth = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;

  const plotHeight = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const x = (seconds: number) =>
    PAD_LEFT +
    ((seconds - startSecond) / Math.max(1, chartEndSecond - startSecond)) *
      plotWidth;

  const y = (value: number, min: number, max: number) =>
    PAD_TOP +
    (1 - (clamp(value, min, max) - min) / Math.max(0.0001, max - min)) *
      plotHeight;

  const firstMinute = Math.ceil(startSecond / 60);
  const lastMinute = Math.floor(chartEndSecond / 60);

  const minuteTicks = Array.from(
    {
      length: Math.max(1, lastMinute - firstMinute + 1),
    },
    (_, index) => (firstMinute + index) * 60
  ).slice(-11);

  return (
    <section className="monitoring-chart-card">
      <div className="monitoring-chart-heading">
        <strong>{title}</strong>

        <div className="monitoring-legend">
          {series.map((item) => {
            const last = visiblePoints[visiblePoints.length - 1];

            const current = last ? item.value(last) : 0;

            return (
              <span key={item.id} className={`legend-item legend-${item.id}`}>
                <i />
                {item.label}: {current.toFixed(item.id === 'ph' ? 2 : 1)}{' '}
                {item.unit}
              </span>
            );
          })}
        </div>
      </div>

      <svg
        className="monitoring-svg"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
        aria-label={`${title} live chart`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const gridY = PAD_TOP + ratio * plotHeight;

          return (
            <line
              key={ratio}
              className="monitoring-grid-line"
              x1={PAD_LEFT}
              y1={gridY}
              x2={CHART_WIDTH - PAD_RIGHT}
              y2={gridY}
            />
          );
        })}

        {minuteTicks.map((tick) => {
          const tickX = x(tick);

          return (
            <g key={tick}>
              <line
                className="monitoring-grid-line vertical"
                x1={tickX}
                y1={PAD_TOP}
                x2={tickX}
                y2={CHART_HEIGHT - PAD_BOTTOM}
              />

              <text
                className="monitoring-axis-label"
                x={tickX}
                y={CHART_HEIGHT - 8}
                textAnchor="middle"
              >
                {formatMinute(tick)}
              </text>
            </g>
          );
        })}

        {series.map((item) => {
          const linePoints = visiblePoints
            .map(
              (point) =>
                `${x(point.cycleSeconds)},${y(
                  item.value(point),
                  item.min,
                  item.max
                )}`
            )
            .join(' ');

          const last = visiblePoints[visiblePoints.length - 1];

          return (
            <g key={item.id}>
              {visiblePoints.length > 1 && (
                <polyline
                  className={`monitoring-series-line series-${item.id}`}
                  points={linePoints}
                />
              )}

              {last && (
                <circle
                  className={`monitoring-series-point series-${item.id}`}
                  cx={x(last.cycleSeconds)}
                  cy={y(item.value(last), item.min, item.max)}
                  r="4"
                />
              )}
            </g>
          );
        })}
      </svg>
    </section>
  );
}

export function GraphTab({ simulator }: { simulator: Simulator }) {
  const fallback = makeFallbackPoint(simulator);

  const points =
    simulator.monitoringPoints.length > 0
      ? simulator.monitoringPoints
      : [fallback];

  const actuatorSeries: Series[] = [
    {
      id: 'air',
      label: 'Air',
      min: 0,
      max: 1000,
      unit: 'mL/min',
      value: (point) => point.air,
    },
    {
      id: 'stirring',
      label: 'Stirring',
      min: 0,
      max: 2000,
      unit: 'rpm',
      value: (point) => point.rpm,
    },
    {
      id: 'acid',
      label: 'Acid',
      min: 0,
      max: 20,
      unit: 'cc/min',
      value: (point) => point.acid,
    },
    {
      id: 'base',
      label: 'Base',
      min: 0,
      max: 20,
      unit: 'cc/min',
      value: (point) => point.base,
    },
    {
      id: 'antifoam',
      label: 'Antifoam',
      min: 0,
      max: 20,
      unit: 'cc/min',
      value: (point) => point.antifoam,
    },
    {
      id: 'feed',
      label: 'Feed',
      min: 0,
      max: 20,
      unit: '%/h',
      value: (point) => point.feed,
    },
  ];

  const sensorSeries: Series[] = [
    {
      id: 'temperature',
      label: 'Temperature',
      min: 10,
      max: 45,
      unit: '°C',
      value: (point) => point.temperature,
    },
    {
      id: 'po2',
      label: 'pO₂',
      min: 0,
      max: 150,
      unit: '%',
      value: (point) => point.pO2,
    },
    {
      id: 'ph',
      label: 'pH',
      min: 0,
      max: 14,
      unit: '',
      value: (point) => point.pH,
    },
  ];

  return (
    <div className="panel-page monitoring-page">
      <div className="monitoring-toolbar">
        <div>
          <strong>Monitoring</strong>
          <span>
            Cycle time: {Math.floor(simulator.state.cycleSeconds / 60)}m{' '}
            {simulator.state.cycleSeconds % 60}s
          </span>
        </div>

        <span
          className={
            simulator.state.running
              ? 'monitoring-live running'
              : 'monitoring-live'
          }
        >
          {simulator.state.running ? 'LIVE' : 'READY'}
        </span>
      </div>

      <MonitoringChart
        title="Actuators"
        points={points}
        series={actuatorSeries}
      />

      <MonitoringChart title="Sensors" points={points} series={sensorSeries} />

      <p className="monitoring-note">
        The demo stores one sample every 5 seconds and displays the last 10
        minutes. Minute marks are shown on the horizontal axis. Start a cycle to
        build the graph in real time.
      </p>
    </div>
  );
}
