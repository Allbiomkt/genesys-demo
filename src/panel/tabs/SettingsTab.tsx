import { useState } from 'react';
import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator =
  ReturnType<typeof useGenesysSimulator>;

export function SettingsTab({
  simulator,
}: {
  simulator: Simulator;
}) {
  const [deviceName, setDeviceName] =
    useState('Genesys V1');

  const [coldPump, setColdPump] =
    useState(false);

  const [hotPump, setHotPump] =
    useState(false);

  const rows = [
    0,
    20,
    40,
    60,
    80,
    100,
  ];

  return (
    <div className="panel-page">
      <div className="panel-card">
        <h2>Settings</h2>

        <label>
          Device name
          <input
            value={deviceName}
            onChange={(event) =>
              setDeviceName(
                event.target.value,
              )
            }
          />
        </label>

        <p>
          Serial number:
          {' '}
          GV-DEMO-001
        </p>

        <p>
          Vessel volume:{' '}
          {simulator.state.volume.toFixed(
            2,
          )}{' '}
          cc
        </p>

        <div className="settings-switch-row">
          <label>
            <input
              type="checkbox"
              checked={coldPump}
              onChange={() =>
                setColdPump(
                  (value) => !value,
                )
              }
            />
            Cold water pump
          </label>

          <label>
            <input
              type="checkbox"
              checked={hotPump}
              onChange={() =>
                setHotPump(
                  (value) => !value,
                )
              }
            />
            Hot water pump
          </label>
        </div>

        <h3>pO₂ cascade</h3>

        <table className="panel-table">
          <thead>
            <tr>
              <th>Output (%)</th>
              <th>Stirring</th>
              <th>Air</th>
              <th>O₂</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((output) => (
              <tr key={output}>
                <td>{output}</td>
                <td>{output * 20}</td>
                <td>{output * 10}</td>
                <td>
                  <input
                    type="checkbox"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
