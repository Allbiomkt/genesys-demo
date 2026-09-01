import { useState } from 'react';

type Row = {
  id: string;
  time: number;
  temperature: number;
  pH: number;
  pO2: number;
};

const MAX_SETPOINTS = 10;

export function ProgrammingTab() {
  const [rows, setRows] =
    useState<Row[]>([]);

  const add = () => {
    if (
      rows.length >= MAX_SETPOINTS
    ) {
      return;
    }

    setRows((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        time: 0,
        temperature: 25,
        pH: 7,
        pO2: 100,
      },
    ]);
  };

  return (
    <div className="panel-page">
      <div className="panel-card">
        <div className="page-toolbar">
          <h2>Programming</h2>

          <button
            type="button"
            className="panel-button"
            onClick={add}
          >
            Add setpoint
          </button>
        </div>

        <table className="panel-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature</th>
              <th>pH</th>
              <th>pO₂</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.time}</td>
                <td>
                  {row.temperature}
                </td>
                <td>{row.pH}</td>
                <td>{row.pO2}</td>

                <td>
                  <button
                    type="button"
                    className="panel-button danger"
                    onClick={() =>
                      setRows(
                        (previous) =>
                          previous.filter(
                            (item) =>
                              item.id !==
                              row.id,
                          ),
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
