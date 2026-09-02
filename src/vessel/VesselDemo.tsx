import type { CSSProperties } from 'react';
import type { useGenesysSimulator } from '../simulator/useGenesysSimulator';
import './vessel.css';

type Simulator = ReturnType<typeof useGenesysSimulator>;

export function VesselDemo({ simulator }: { simulator: Simulator }) {
  const { state, status } = simulator;

  const liquidPercent = ((state.volume - 300) / (1500 - 300)) * 100;

  const bubbleCount =
    state.running && state.airRunning
      ? Math.round(Math.min(30, state.air / 17 + state.rpm / 220))
      : 0;

  return (
    <div className="vessel-demo">
      <div className="vessel-copy">
        <span className="eyebrow">GENESYS V1 — LIVE DEMO</span>

        <h1>Run the process.</h1>

        <p>Interact with the Genesys controls and watch the culture respond.</p>

        <div className="process-status">
          <span className={state.running ? 'live-dot running' : 'live-dot'} />
          {status}
        </div>
      </div>

      <div className="reactor-stage">
        <div className="reactor-rig">
          <div className="reactor-motor">
            <span className="motor-top" />
            <span className="motor-rib motor-rib-1" />
            <span className="motor-rib motor-rib-2" />
            <span className="motor-rib motor-rib-3" />
            <span className="motor-rib motor-rib-4" />
            <span className="motor-rib motor-rib-5" />
          </div>

          <div className="motor-coupler" />

          <div className="reactor-lid">
            <span className="lid-highlight" />
            <span className="lid-port lid-port-1" />
            <span className="lid-port lid-port-2" />
            <span className="lid-port lid-port-3" />
            <span className="lid-port lid-port-4" />
          </div>

          <div className="reactor-vessel">
            <span className="glass-highlight glass-highlight-left" />
            <span className="glass-highlight glass-highlight-right" />
            <span className="glass-edge glass-edge-left" />
            <span className="glass-edge glass-edge-right" />

            <div
              className="reactor-liquid"
              style={
                {
                  '--liquid-height': `${Math.max(
                    17,
                    Math.min(88, liquidPercent)
                  )}%`,
                } as CSSProperties
              }
            >
              <div className="liquid-meniscus" />

              <div
                className="foam-layer"
                style={{
                  height: `${Math.min(34, Math.max(2, state.foam * 0.32))}px`,
                  opacity: state.foam > 0.8 ? 1 : 0,
                }}
              />

              <div className="bubble-field">
                {Array.from({
                  length: bubbleCount,
                }).map((_, index) => {
                  const size = 5 + (index % 4) * 1.5;

                  return (
                    <span
                      key={index}
                      className="demo-bubble"
                      style={{
                        left: `${9 + ((index * 31) % 82)}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animationDelay: `${(index % 9) * -0.31}s`,
                        animationDuration: `${2.3 + (index % 5) * 0.32}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <span className="probe probe-left" />
            <span className="probe probe-right" />

            <div className="agitator-shaft" />

            <div
              className={
                state.running && state.stirringRunning
                  ? 'rushton-impeller spinning'
                  : 'rushton-impeller'
              }
              style={{
                animationDuration: `${Math.max(
                  0.18,
                  650 / Math.max(state.rpm, 1)
                )}s`,
              }}
            >
              <div className="rushton-disc" />
              <span className="rushton-blade blade-left" />
              <span className="rushton-blade blade-right" />
              <div className="rushton-hub" />
            </div>
          </div>

          <div className="reactor-shadow" />
        </div>

        <div className="vessel-metrics">
          <div>
            <strong>{state.temperature.toFixed(1)}</strong>
            <span>°C</span>
          </div>

          <div>
            <strong>{state.pH.toFixed(2)}</strong>
            <span>pH</span>
          </div>

          <div>
            <strong>{state.pO2.toFixed(0)}</strong>
            <span>% pO₂</span>
          </div>

          <div>
            <strong>{state.volume.toFixed(0)}</strong>
            <span>cc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
