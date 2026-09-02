import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator = ReturnType<typeof useGenesysSimulator>;

const cascadeRows = [
  {
    output: 0,
    stirring: 0,
    air: 0,
  },
  {
    output: 20,
    stirring: 550,
    air: 600,
  },
  {
    output: 40,
    stirring: 950,
    air: 850,
  },
  {
    output: 60,
    stirring: 1200,
    air: 1250,
  },
  {
    output: 80,
    stirring: 1500,
    air: 1400,
  },
  {
    output: 100,
    stirring: 1750,
    air: 1700,
  },
];

function FakeSwitch() {
  return (
    <span className="settings-fake-switch">
      <span />
    </span>
  );
}

export function SettingsTab({ simulator }: { simulator: Simulator }) {
  return (
    <div className="settings-real-page">
      <div className="settings-real-content">
        <section className="settings-top-grid">
          <div className="water-pumps-control">
            <h3>Water pumps control</h3>

            <div className="water-pump-row">
              <img src="/icons/snowflake-regular.svg" alt="" />
              <FakeSwitch />

              <img src="/icons/droplet-solid.svg" alt="" />
              <FakeSwitch />
            </div>

            <div className="water-pump-row">
              <img src="/icons/fire-solid.svg" alt="" />
              <FakeSwitch />

              <img src="/icons/rotate-solid.svg" alt="" />
              <FakeSwitch />
            </div>
          </div>

          <div className="device-settings-block">
            <div className="device-setting-row">
              <strong>Device Name:</strong>
              <span>Genesys V1</span>
            </div>

            <div className="device-setting-row">
              <strong>Remote URL Address:</strong>
              <span>demo.local:5000</span>
            </div>

            <div className="device-setting-row">
              <strong>Serial Number:</strong>
              <span>GV-DEMO-001</span>
            </div>

            <div className="device-setting-row">
              <strong>Firmware and Software:</strong>
              <button type="button">Check Update</button>
            </div>

            <div className="device-setting-row">
              <strong>Total Starting Volume:</strong>
              <span>{simulator.state.volume.toFixed(0)}</span>
            </div>

            <div className="device-setting-row">
              <strong>Volume monitoring reset:</strong>
              <button type="button">Reset</button>
            </div>
          </div>
        </section>

        <section className="cascade-settings-block">
          <h2>pO₂ Settings cascade</h2>

          <div className="cascade-header-row">
            <strong>Output (%)</strong>
            <strong>Stirring (rpm)</strong>
            <strong>Air (cc/min)</strong>
            <strong>O2</strong>
          </div>

          {cascadeRows.map((row) => (
            <div className="cascade-setting-row" key={row.output}>
              <strong>{row.output}</strong>

              <div className="cascade-slider-cell">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={row.stirring}
                  readOnly
                />
                <span>{row.stirring}</span>
              </div>

              <div className="cascade-slider-cell">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  value={row.air}
                  readOnly
                />
                <span>{row.air}</span>
              </div>

              <FakeSwitch />
            </div>
          ))}
        </section>
      </div>

      <div className="settings-demo-overlay">
        <div className="settings-demo-message">
          Esta funcionalidad no está disponible en nuestra demo online
        </div>
      </div>
    </div>
  );
}
