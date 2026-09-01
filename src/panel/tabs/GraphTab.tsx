import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator =
  ReturnType<typeof useGenesysSimulator>;

export function GraphTab({
  simulator,
}: {
  simulator: Simulator;
}) {
  return (
    <div className="panel-page">
      <div className="panel-card">
        <h2>Monitoring</h2>

        <p>
          Temperature:{' '}
          {simulator.state.temperature.toFixed(2)} °C
        </p>

        <p>
          pH:{' '}
          {simulator.state.pH.toFixed(2)}
        </p>

        <p>
          pO₂:{' '}
          {simulator.state.pO2.toFixed(2)} %
        </p>

        <p>
          Air:{' '}
          {simulator.state.air} mL/min
        </p>

        <p>
          Stirring:{' '}
          {simulator.state.rpm} rpm
        </p>

        <div className="graph-placeholder">
          Sustituir este bloque por Chart.js
          cuando el panel principal esté
          cerrado visualmente.
        </div>
      </div>
    </div>
  );
}
