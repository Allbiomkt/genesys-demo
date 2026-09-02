import type { ChangeEvent } from 'react';
import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator = ReturnType<typeof useGenesysSimulator>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function ProgrammingTab({ simulator }: { simulator: Simulator }) {
  const {
    state,
    activeProgramRow,
    setProgramEnabled,
    updateProgramRow,
    addProgramRow,
    deleteProgramRow,
  } = simulator;

  const rows = [...state.programRows].sort(
    (a, b) => a.timeMinutes - b.timeMinutes
  );

  const updateNumber = (
    id: string,
    key: 'timeMinutes' | 'temperature' | 'pH' | 'pO2',
    rawValue: string,
    min: number,
    max: number
  ) => {
    if (rawValue.trim() === '') {
      return;
    }

    const parsed = Number(rawValue);

    if (!Number.isFinite(parsed)) {
      return;
    }

    updateProgramRow(id, {
      [key]: clamp(parsed, min, max),
    });
  };

  return (
    <div className="panel-page programming-page">
      <div className="programming-card">
        <div className="programming-toolbar">
          <div>
            <h2>Programming</h2>
            <p>Set up to 10 process steps between 0 and 30 minutes.</p>
          </div>

          <div className="programming-actions">
            <button
              type="button"
              className={
                state.programEnabled
                  ? 'program-enable-button active'
                  : 'program-enable-button'
              }
              onClick={() => setProgramEnabled(!state.programEnabled)}
            >
              {state.programEnabled ? 'Program ON' : 'Program OFF'}
            </button>

            <button
              type="button"
              className="panel-button"
              disabled={state.programRows.length >= 10}
              onClick={addProgramRow}
            >
              Add setpoint
            </button>
          </div>
        </div>

        <div className="programming-status-row">
          <span>Time is measured from cycle START.</span>

          <strong>
            {state.programEnabled
              ? state.running
                ? activeProgramRow
                  ? `Active step: ${activeProgramRow.timeMinutes} min`
                  : 'Waiting for first step'
                : 'Waiting for cycle START'
              : 'Program disabled'}
          </strong>
        </div>

        <div className="programming-table-wrap">
          <table className="panel-table programming-table">
            <thead>
              <tr>
                <th>Time (min)</th>
                <th>Temperature (°C)</th>
                <th>pH</th>
                <th>pO₂ (%)</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    activeProgramRow?.id === row.id ? 'active-program-row' : ''
                  }
                >
                  <td>
                    <input
                      className="program-input"
                      type="number"
                      min={0}
                      max={30}
                      step={1}
                      value={row.timeMinutes}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateNumber(
                          row.id,
                          'timeMinutes',
                          event.target.value,
                          0,
                          30
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="program-input"
                      type="number"
                      min={10}
                      max={45}
                      step={0.1}
                      value={row.temperature}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateNumber(
                          row.id,
                          'temperature',
                          event.target.value,
                          10,
                          45
                        )
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="program-input"
                      type="number"
                      min={0}
                      max={14}
                      step={0.01}
                      value={row.pH}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateNumber(row.id, 'pH', event.target.value, 0, 14)
                      }
                    />
                  </td>

                  <td>
                    <input
                      className="program-input"
                      type="number"
                      min={0}
                      max={150}
                      step={1}
                      value={row.pO2}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        updateNumber(row.id, 'pO2', event.target.value, 0, 150)
                      }
                    />
                  </td>

                  <td>
                    <button
                      type="button"
                      className="panel-button danger"
                      onClick={() => deleteProgramRow(row.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="programming-footnote">
          When Program ON is active, the current step controls the temperature,
          pH and pO₂ targets in the simulator. The programmed step takes
          priority over the manual Auto switches while the cycle is running.
        </p>
      </div>
    </div>
  );
}
