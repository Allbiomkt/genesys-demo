import type { PumpMode } from '../../simulator/simulatorTypes';
import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator =
  ReturnType<typeof useGenesysSimulator>;

type Props = {
  simulator: Simulator;
};

type PumpName =
  | 'acid'
  | 'base'
  | 'antifoam'
  | 'feed'
  | 'emptyFill';

type SetpointKey =
  | 'temperatureSetpoint'
  | 'pHSetpoint'
  | 'pO2Setpoint';

function NumericButtons({
  onPlus,
  onMinus,
}: {
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div className="numeric-buttons">
      <button
        type="button"
        onClick={onPlus}
      >
        +
      </button>

      <button
        type="button"
        onClick={onMinus}
      >
        −
      </button>
    </div>
  );
}

function AutoSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={
        checked
          ? 'auto-switch on'
          : 'auto-switch'
      }
      onClick={onChange}
    >
      <span className="auto-switch-knob" />
      <strong>
        {checked ? 'ON' : 'OFF'}
      </strong>
    </button>
  );
}

function SensorBox({
  title,
  icon,
  measured,
  setpoint,
  unit,
  automatic,
  onAuto,
  onSetpoint,
  step,
}: {
  title: string;
  icon: string;
  measured: number;
  setpoint: number;
  unit: string;
  automatic: boolean;
  onAuto: () => void;
  onSetpoint: (value: number) => void;
  step: number;
}) {
  return (
    <article className="control-box sensor-box">
      <div className="control-left">
        <div className="control-icon-column">
          <div className="status-bubble">
            {automatic
              ? 'Auto'
              : 'Manual'}
          </div>

          <img
            className="field-icon"
            src={icon}
            alt=""
          />
        </div>

        <div className="control-maincontent">
          <div className="control-title">
            {title}
          </div>

          <div className="control-readouts">
            <div className="cb2 realtime">
              <input
                readOnly
                value={measured.toFixed(2)}
              />
              <span>{unit}</span>
            </div>

            <div className="cb2">
              <input
                readOnly
                value={setpoint.toFixed(2)}
              />
              <span>{unit}</span>
            </div>
          </div>

          <AutoSwitch
            checked={automatic}
            onChange={onAuto}
          />
        </div>
      </div>

      <NumericButtons
        onPlus={() =>
          onSetpoint(setpoint + step)
        }
        onMinus={() =>
          onSetpoint(setpoint - step)
        }
      />
    </article>
  );
}

function PumpBox({
  title,
  icon,
  pump,
  unit,
  onRate,
  onMode,
  twoDirections = true,
}: {
  title: string;
  icon: string;
  pump: {
    mode: PumpMode;
    rate: number;
    cumulative: number;
  };
  unit: string;
  onRate: (value: number) => void;
  onMode: (mode: PumpMode) => void;
  twoDirections?: boolean;
}) {
  const running =
    pump.mode !== 'off';

  return (
    <article className="control-box">
      <div className="control-left">
        <div className="control-icon-column">
          <div
            className={
              running
                ? 'status-circle running'
                : 'status-circle'
            }
          >
            {pump.mode === 'forward'
              ? '+'
              : pump.mode === 'reverse'
                ? '−'
                : ''}
          </div>

          <img
            className="field-icon"
            src={icon}
            alt=""
          />
        </div>

        <div className="control-maincontent">
          <div className="control-title">
            {title}
          </div>

          <div className="cb2 edit">
            <input
              readOnly
              value={pump.rate.toFixed(2)}
            />
            <span>{unit}</span>
          </div>

          <div className="pump-volume-row">
            <strong>
              {pump.cumulative.toFixed(2)}
            </strong>
            <span>cc</span>
          </div>
        </div>
      </div>

      <div className="pump-control-area">
        {!running ? (
          <>
            <div className="numeric-buttons">
              <button
                type="button"
                onClick={() =>
                  onRate(pump.rate + 1)
                }
              >
                ⯅
              </button>

              <button
                type="button"
                onClick={() =>
                  onRate(
                    Math.max(
                      0,
                      pump.rate - 1,
                    ),
                  )
                }
              >
                ⯆
              </button>
            </div>

            <div className="numeric-buttons">
              <button
                type="button"
                onClick={() =>
                  onMode('forward')
                }
              >
                +
              </button>

              <button
                type="button"
                disabled={!twoDirections}
                onClick={() =>
                  onMode('reverse')
                }
              >
                −
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            className="pump-stop"
            onClick={() =>
              onMode('off')
            }
          >
            ■
          </button>
        )}
      </div>
    </article>
  );
}

export function MainTab({
  simulator,
}: Props) {
  const {
    state,
    setNumeric,
    setPumpRate,
    setPumpMode,
    toggleAuto,
    startCycle,
    stopCycle,
    status,
  } = simulator;

  const setSetpoint = (
    key: SetpointKey,
    value: number,
  ) => {
    if (key === 'pHSetpoint') {
      setNumeric(
        key,
        Math.min(
          14,
          Math.max(0, value),
        ),
      );
      return;
    }

    if (key === 'pO2Setpoint') {
      setNumeric(
        key,
        Math.min(
          150,
          Math.max(0, value),
        ),
      );
      return;
    }

    setNumeric(
      key,
      Math.min(
        45,
        Math.max(10, value),
      ),
    );
  };

  const pump = (
    pumpName: PumpName,
    title: string,
    icon: string,
    unit: string,
    twoDirections = true,
  ) => (
    <PumpBox
      title={title}
      icon={icon}
      pump={state[pumpName]}
      unit={unit}
      twoDirections={twoDirections}
      onRate={(rate) =>
        setPumpRate(
          pumpName,
          rate,
        )
      }
      onMode={(mode) =>
        setPumpMode(
          pumpName,
          mode,
        )
      }
    />
  );

  return (
    <div className="main-tab-layout">
      <SensorBox
        title="Temperature"
        icon="/icons/temperature-half-solid.svg"
        measured={state.temperature}
        setpoint={
          state.temperatureSetpoint
        }
        unit="°C"
        automatic={
          state.automatic.temperature
        }
        onAuto={() =>
          toggleAuto('temperature')
        }
        onSetpoint={(value) =>
          setSetpoint(
            'temperatureSetpoint',
            value,
          )
        }
        step={0.1}
      />

      <article className="control-box">
        <div className="control-left">
          <div className="control-icon-column">
            <div
              className={
                state.stirringRunning
                  ? 'status-circle running'
                  : 'status-circle'
              }
            />

            <img
              className="field-icon"
              src="/icons/rotate-solid.svg"
              alt=""
            />
          </div>

          <div className="control-maincontent">
            <div className="control-title">
              Stirring
            </div>

            <div className="cb2 edit">
              <input
                readOnly
                value={state.rpm.toFixed(0)}
              />
              <span>rpm</span>
            </div>
          </div>
        </div>

        <NumericButtons
          onPlus={() =>
            setNumeric(
              'rpm',
              state.rpm + 50,
            )
          }
          onMinus={() =>
            setNumeric(
              'rpm',
              Math.max(
                0,
                state.rpm - 50,
              ),
            )
          }
        />
      </article>

      <article className="control-box">
        <div className="control-left">
          <div className="control-icon-column">
            <div
              className={
                state.airRunning
                  ? 'status-circle running'
                  : 'status-circle'
              }
            />

            <img
              className="field-icon"
              src="/icons/wind-solid.svg"
              alt=""
            />
          </div>

          <div className="control-maincontent">
            <div className="control-title">
              Air
            </div>

            <div className="cb2 edit">
              <input
                readOnly
                value={state.air.toFixed(0)}
              />
              <span>mL/min</span>
            </div>
          </div>
        </div>

        <NumericButtons
          onPlus={() =>
            setNumeric(
              'air',
              state.air + 25,
            )
          }
          onMinus={() =>
            setNumeric(
              'air',
              Math.max(
                0,
                state.air - 25,
              ),
            )
          }
        />
      </article>

      <SensorBox
        title="pH"
        icon="/icons/ph_b.svg"
        measured={state.pH}
        setpoint={state.pHSetpoint}
        unit=""
        automatic={
          state.automatic.pH
        }
        onAuto={() =>
          toggleAuto('pH')
        }
        onSetpoint={(value) =>
          setSetpoint(
            'pHSetpoint',
            value,
          )
        }
        step={0.01}
      />

      <SensorBox
        title="pO₂"
        icon="/icons/po2_b.svg"
        measured={state.pO2}
        setpoint={state.pO2Setpoint}
        unit="%"
        automatic={
          state.automatic.pO2
        }
        onAuto={() =>
          toggleAuto('pO2')
        }
        onSetpoint={(value) =>
          setSetpoint(
            'pO2Setpoint',
            value,
          )
        }
        step={1}
      />

      <article className="control-box product-control">
        <div className="start-stop-block">
          <div className="control-title">
            {status}
          </div>

          <div className="vessel-volume-display">
            {state.volume.toFixed(2)} cc
          </div>

          <button
            type="button"
            className={
              state.running
                ? 'start-stop-button stop'
                : 'start-stop-button'
            }
            onClick={
              state.running
                ? stopCycle
                : startCycle
            }
          >
            <img
              src={
                state.running
                  ? '/icons/circle-stop-solid.svg'
                  : '/icons/circle-play-solid.svg'
              }
              alt={
                state.running
                  ? 'Stop'
                  : 'Start'
              }
            />
          </button>
        </div>
      </article>

      {pump(
        'acid',
        'Acid',
        '/icons/pump_1_b.svg',
        'cc/min',
      )}

      {pump(
        'base',
        'Base',
        '/icons/pump_2_b.svg',
        'cc/min',
      )}

      {pump(
        'antifoam',
        'Antifoam',
        '/icons/pump_3_b.svg',
        'cc/min',
      )}

      {pump(
        'feed',
        'Feed',
        '/icons/pump_4_b.svg',
        '%/h',
      )}

      {pump(
        'emptyFill',
        'Fill / Empty',
        '/icons/fill-solid.svg',
        'cc/min',
      )}

      <article className="control-box sensor-box">
        <div className="control-left">
          <div className="control-icon-column">
            <img
              className="field-icon"
              src="/icons/S4_icon.svg"
              alt=""
            />
          </div>

          <div className="control-maincontent">
            <div className="control-title">
              S4
            </div>

            <div className="cb2 realtime">
              <input
                readOnly
                value={(0).toFixed(2)}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
