import { useState } from 'react';

import type { PumpMode } from '../../simulator/simulatorTypes';
import type { useGenesysSimulator } from '../../simulator/useGenesysSimulator';

type Simulator = ReturnType<typeof useGenesysSimulator>;

type Props = {
  simulator: Simulator;
};

type PumpName = 'acid' | 'base' | 'antifoam' | 'feed' | 'emptyFill';

type SetpointKey = 'temperatureSetpoint' | 'pHSetpoint' | 'pO2Setpoint';

function FourWayControls({
  onUp,
  onDown,
  onPlus,
  onMinus,
}: {
  onUp: () => void;
  onDown: () => void;
  onPlus: () => void;
  onMinus: () => void;
}) {
  return (
    <div className="four-way-controls">
      <button type="button" onClick={onUp}>
        ▲
      </button>

      <button type="button" onClick={onPlus}>
        +
      </button>

      <button type="button" onClick={onDown}>
        ▼
      </button>

      <button type="button" onClick={onMinus}>
        −
      </button>
    </div>
  );
}

function VerticalControls({
  onUp,
  onDown,
}: {
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="vertical-controls">
      <button type="button" onClick={onUp}>
        ▲
      </button>

      <button type="button" onClick={onDown}>
        ▼
      </button>
    </div>
  );
}

function CompactSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={checked ? 'compact-switch on' : 'compact-switch'}
      onClick={onChange}
    >
      <span className="compact-switch-knob" />
      <strong>{checked ? 'ON' : 'OFF'}</strong>
    </button>
  );
}

function StatusDot({ running }: { running: boolean }) {
  return (
    <span className={running ? 'real-status-dot running' : 'real-status-dot'} />
  );
}

function PumpBox({
  className,
  title,
  ingredient,
  icon,
  pump,
  unit,
  onRate,
  onMode,
  step = 1,
  showCumulative = true,
}: {
  className: string;
  title: string;
  ingredient?: string;
  icon: string;
  pump: {
    mode: PumpMode;
    rate: number;
    cumulative: number;
  };
  unit: string;
  onRate: (value: number) => void;
  onMode: (mode: PumpMode) => void;
  step?: number;
  showCumulative?: boolean;
}) {
  const running = pump.mode !== 'off';

  return (
    <article className={`real-control-box pump-real ${className}`}>
      <div className="real-icon-column">
        <img className="real-field-icon pump-icon" src={icon} alt="" />
      </div>

      <div className="real-control-body">
        <div className="real-title-row">
          <strong>{title}</strong>
          <StatusDot running={running} />
        </div>

        {ingredient && <div className="ingredient-label">{ingredient}</div>}

        <div className="real-value-row">
          <div className="real-value edit-value">
            {pump.rate.toFixed(step < 1 ? 2 : 2)}
          </div>

          <span className="real-unit">{unit}</span>
        </div>

        {showCumulative && (
          <div className="cumulative-row">
            <strong>{pump.cumulative.toFixed(2)}</strong>
            <span>cc</span>
          </div>
        )}
      </div>

      <FourWayControls
        onUp={() => onRate(pump.rate + step)}
        onDown={() => onRate(Math.max(0, pump.rate - step))}
        onPlus={() => onMode('forward')}
        onMinus={() => onMode(pump.mode === 'reverse' ? 'off' : 'reverse')}
      />
    </article>
  );
}

function ActuatorBox({
  className,
  title,
  icon,
  value,
  unit,
  running,
  step,
  onValue,
  onRunning,
}: {
  className: string;
  title: string;
  icon: string;
  value: number;
  unit: string;
  running: boolean;
  step: number;
  onValue: (value: number) => void;
  onRunning: (running: boolean) => void;
}) {
  return (
    <article className={`real-control-box actuator-real ${className}`}>
      <div className="real-icon-column actuator-icon-column">
        <img className="real-field-icon actuator-icon" src={icon} alt="" />
      </div>

      <div className="real-control-body actuator-body">
        <div className="real-title-row">
          <strong>{title}</strong>
          <StatusDot running={running} />
        </div>

        <div className="real-value-row">
          <div className="real-value edit-value">{value.toFixed(0)}</div>

          <span className="real-unit">{unit}</span>
        </div>
      </div>

      <FourWayControls
        onUp={() => onValue(value + step)}
        onDown={() => onValue(Math.max(0, value - step))}
        onPlus={() => onRunning(true)}
        onMinus={() => onRunning(false)}
      />
    </article>
  );
}

function SensorBox({
  className,
  title,
  icon,
  measured,
  setpoint,
  unit,
  automatic,
  step,
  onAuto,
  onSetpoint,
}: {
  className: string;
  title: string;
  icon: string;
  measured: number;
  setpoint: number;
  unit: string;
  automatic: boolean;
  step: number;
  onAuto: () => void;
  onSetpoint: (value: number) => void;
}) {
  return (
    <article className={`real-control-box sensor-real ${className}`}>
      <div className="sensor-left-column">
        <button
          type="button"
          className="calibrate-pill"
          title="Demo calibration"
        >
          CALIBRATE
        </button>

        <img className="real-field-icon sensor-icon" src={icon} alt="" />

        <CompactSwitch checked={automatic} onChange={onAuto} />
      </div>

      <div className="real-control-body sensor-body">
        <div className="sensor-title">{title}</div>

        <div className="sensor-readout-row">
          <div className="real-value sensor-value">{measured.toFixed(2)}</div>

          <span className="real-unit">{unit}</span>
        </div>

        <div className="sensor-readout-row">
          <div className="real-value sensor-value target-value">
            {setpoint.toFixed(2)}
          </div>

          <span className="real-unit">{unit}</span>
        </div>
      </div>

      <VerticalControls
        onUp={() => onSetpoint(setpoint + step)}
        onDown={() => onSetpoint(setpoint - step)}
      />
    </article>
  );
}

function MiniProcessVessel() {
  return (
    <div className="mini-process-vessel">
      <div className="mini-motor" />
      <div className="mini-coupler" />
      <div className="mini-lid" />

      <div className="mini-glass">
        <div className="mini-liquid" />
        <span className="mini-probe mini-probe-left" />
        <span className="mini-probe mini-probe-right" />
        <span className="mini-shaft" />
        <span className="mini-impeller" />
      </div>
    </div>
  );
}

function CenterProcessBox({ simulator }: { simulator: Simulator }) {
  const { state, toggleAuto, startCycle, stopCycle } = simulator;

  const [programEnabled, setProgramEnabled] = useState(false);

  const [processName, setProcessName] = useState('');

  return (
    <article className="center-process-box">
      <div className="center-process-main">
        <div className="mini-vessel-column">
          <MiniProcessVessel />

          <strong className="center-volume">
            {state.volume.toFixed(0)} CC
          </strong>
        </div>

        <div className="center-action-column">
          <button
            type="button"
            className={
              state.running ? 'center-start-button stop' : 'center-start-button'
            }
            onClick={state.running ? stopCycle : startCycle}
          >
            <img
              src={
                state.running
                  ? '/icons/circle-stop-solid.svg'
                  : '/icons/circle-play-solid.svg'
              }
              alt={state.running ? 'Stop' : 'Start'}
            />
          </button>

          <div className="center-toggle-row">
            <img src="/icons/bubbles.svg" alt="" />

            <CompactSwitch
              checked={state.automatic.antifoam}
              onChange={() => toggleAuto('antifoam')}
            />
          </div>

          <div className="center-toggle-row">
            <img src="/icons/program_page_menu_icon_b.svg" alt="" />

            <CompactSwitch
              checked={programEnabled}
              onChange={() => setProgramEnabled((previous) => !previous)}
            />
          </div>
        </div>
      </div>

      <input
        className="process-name-input"
        value={processName}
        placeholder="Enter custom name"
        onChange={(event) => setProcessName(event.target.value)}
      />
    </article>
  );
}

export function MainTab({ simulator }: Props) {
  const { state, setState, setNumeric, setPumpRate, setPumpMode, toggleAuto } =
    simulator;

  const setSetpoint = (key: SetpointKey, value: number) => {
    if (key === 'pHSetpoint') {
      setNumeric(key, Math.min(14, Math.max(0, value)));
      return;
    }

    if (key === 'pO2Setpoint') {
      setNumeric(key, Math.min(150, Math.max(0, value)));
      return;
    }

    setNumeric(key, Math.min(45, Math.max(10, value)));
  };

  const pump = (
    pumpName: PumpName,
    className: string,
    title: string,
    ingredient: string | undefined,
    icon: string,
    unit: string,
    step = 1,
    showCumulative = true
  ) => (
    <PumpBox
      className={className}
      title={title}
      ingredient={ingredient}
      icon={icon}
      pump={state[pumpName]}
      unit={unit}
      step={step}
      showCumulative={showCumulative}
      onRate={(rate) => setPumpRate(pumpName, rate)}
      onMode={(mode) => setPumpMode(pumpName, mode)}
    />
  );

  return (
    <div className="main-tab-layout real-main-layout">
      {pump(
        'acid',
        'slot-acid',
        'Acid',
        'Ingredient 1',
        '/icons/pump_1_b.svg',
        'cc/min'
      )}

      {pump(
        'base',
        'slot-base',
        'Base',
        'Ingredient 2',
        '/icons/pump_2_b.svg',
        'cc/min'
      )}

      {pump(
        'antifoam',
        'slot-antifoam',
        'Antifoam',
        'Ingredient 3',
        '/icons/pump_3_b.svg',
        'cc/min'
      )}

      {pump(
        'feed',
        'slot-feed',
        'Feed',
        'Ingredient 4',
        '/icons/pump_4_b.svg',
        '%/h',
        0.05
      )}

      <ActuatorBox
        className="slot-stirring"
        title="Stirring"
        icon="/icons/rotate-solid.svg"
        value={state.rpm}
        unit="rpm"
        running={state.stirringRunning}
        step={50}
        onValue={(value) => setNumeric('rpm', value)}
        onRunning={(running) =>
          setState((previous) => ({
            ...previous,
            stirringRunning: running,
          }))
        }
      />

      <ActuatorBox
        className="slot-air"
        title="Air"
        icon="/icons/wind-solid.svg"
        value={state.air}
        unit="mL/min"
        running={state.airRunning}
        step={25}
        onValue={(value) => setNumeric('air', value)}
        onRunning={(running) =>
          setState((previous) => ({
            ...previous,
            airRunning: running,
          }))
        }
      />

      <CenterProcessBox simulator={simulator} />

      <SensorBox
        className="slot-temperature"
        title="Temperature"
        icon="/icons/temperature-half-solid.svg"
        measured={state.temperature}
        setpoint={state.temperatureSetpoint}
        unit="°C"
        automatic={state.automatic.temperature}
        step={0.1}
        onAuto={() => toggleAuto('temperature')}
        onSetpoint={(value) => setSetpoint('temperatureSetpoint', value)}
      />

      <SensorBox
        className="slot-ph"
        title="pH"
        icon="/icons/ph_b.svg"
        measured={state.pH}
        setpoint={state.pHSetpoint}
        unit="pH"
        automatic={state.automatic.pH}
        step={0.01}
        onAuto={() => toggleAuto('pH')}
        onSetpoint={(value) => setSetpoint('pHSetpoint', value)}
      />

      <SensorBox
        className="slot-po2"
        title="pO₂"
        icon="/icons/po2_b.svg"
        measured={state.pO2}
        setpoint={state.pO2Setpoint}
        unit="%"
        automatic={state.automatic.pO2}
        step={1}
        onAuto={() => toggleAuto('pO2')}
        onSetpoint={(value) => setSetpoint('pO2Setpoint', value)}
      />

      {pump(
        'emptyFill',
        'slot-emptyfill',
        'Empty / Fill',
        undefined,
        '/icons/fill-solid.svg',
        'cc/min',
        1,
        false
      )}
    </div>
  );
}
