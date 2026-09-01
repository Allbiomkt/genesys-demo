import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator =
  ReturnType<typeof useGenesysSimulator>;

export function HistoryTab({
  simulator,
}: {
  simulator: Simulator;
}) {
  return (
    <div className="panel-page">
      <div className="panel-card">
        <h2>History</h2>

        {simulator.history.length === 0 ? (
          <p>No cycles available</p>
        ) : (
          <table className="panel-table">
            <thead>
              <tr>
                <th>Cycle</th>
                <th>Start</th>
                <th>Duration</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {simulator.history.map(
                (cycle) => (
                  <tr key={cycle.id}>
                    <td>{cycle.name}</td>

                    <td>
                      {new Date(
                        cycle.startedAt,
                      ).toLocaleString(
                        'es-ES',
                      )}
                    </td>

                    <td>
                      {
                        cycle.durationSeconds
                      }
                      s
                    </td>

                    <td>
                      <button
                        type="button"
                        className="panel-button danger"
                        onClick={() =>
                          simulator.deleteHistory(
                            cycle.id,
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
