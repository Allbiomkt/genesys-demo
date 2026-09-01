import type { useGenesysSimulator } from '../simulator/useGenesysSimulator';
import './vessel.css';

type Simulator = ReturnType<typeof useGenesysSimulator>;

export function VesselDemo({
  simulator,
}: {
  simulator: Simulator;
}) {
  const { state, status } = simulator;

  const liquidPercent =
    ((state.volume - 300) / (1500 - 300)) * 100;

  const bubbleCount = Math.round(
    Math.min(
      34,
      state.air / 15 + state.rpm / 180,
    ),
  );

  return (
    <div className="vessel-demo">
      <div className="vessel-copy">
        <span className="eyebrow">
          GENESYS V1 — LIVE DEMO
        </span>

        <h1>Run the process.</h1>

        <p>
          Interact with the Genesys controls and
          watch the culture respond.
        </p>

        <div className="process-status">
          <span
            className={
              state.running
                ? 'live-dot running'
                : 'live-dot'
            }
          />
          {status}
        </div>
      </div>

      <div className="reactor-stage">
        <div className="reactor-motor" />

        <div className="reactor-vessel">
          <div
            className="reactor-liquid"
            style={{
              height: `${Math.max(
                16,
                Math.min(88, liquidPercent),
              )}%`,
            }}
          >
            <div
              className="foam-layer"
              style={{
                height: `${Math.min(
                  28,
                  state.foam * 0.28,
                )}px`,
              }}
            />

            <div className="bubble-field">
              {Array.from({
                length: bubbleCount,
              }).map((_, index) => (
                <span
                  key={index}
                  className="demo-bubble"
                  style={{
                    left: `${
                      8 + ((index * 29) % 84)
                    }%`,
                    animationDelay: `${
                      (index % 8) * -0.27
                    }s`,
                    animationDuration: `${
                      2.2 +
                      (index % 5) * 0.25
                    }s`,
                  }}
                />
              ))}
            </div>
          </div>

          <span className="probe probe-left" />
          <span className="probe probe-right" />

          <div className="agitator-shaft" />

          <div
            className={
              state.running &&
              state.stirringRunning
                ? 'rushton-impeller spinning'
                : 'rushton-impeller'
            }
            style={{
              animationDuration: `${Math.max(
                0.18,
                650 / Math.max(state.rpm, 1),
              )}s`,
            }}
          >
            <div className="rushton-disc" />
            <span className="rushton-blade blade-left" />
            <span className="rushton-blade blade-right" />
            <div className="rushton-hub" />
          </div>
        </div>

        <div className="vessel-metrics">
          <div>
            <strong>
              {state.temperature.toFixed(1)}
            </strong>
            <span>°C</span>
          </div>

          <div>
            <strong>{state.pH.toFixed(2)}</strong>
            <span>pH</span>
          </div>

          <div>
            <strong>
              {state.pO2.toFixed(0)}
            </strong>
            <span>% pO₂</span>
          </div>

          <div>
            <strong>
              {state.volume.toFixed(0)}
            </strong>
            <span>cc</span>
          </div>
        </div>
      </div>
    </div>
  );
}