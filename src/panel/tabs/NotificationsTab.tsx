import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator =
  ReturnType<typeof useGenesysSimulator>;

export function NotificationsTab({
  simulator,
}: {
  simulator: Simulator;
}) {
  return (
    <div className="panel-page">
      <div className="panel-card">
        <h2>Notifications</h2>

        {simulator.notifications.length ===
        0 ? (
          <p>
            No notifications available
          </p>
        ) : (
          simulator.notifications.map(
            (notification) => (
              <article
                key={notification.id}
                className="notification-row"
              >
                <strong>
                  {
                    notification.message
                  }
                </strong>

                <span>
                  {new Date(
                    notification.timestamp,
                  ).toLocaleString(
                    'es-ES',
                  )}
                </span>
              </article>
            ),
          )
        )}
      </div>
    </div>
  );
}
