import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import './App.css'

type Setter = Dispatch<SetStateAction<number>>
type BoolSetter = Dispatch<SetStateAction<boolean>>
type PumpMode = 'off' | 'forward' | 'reverse'

const DYNAMICS_SPEED = 0.1

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const approach = (current: number, target: number, factor: number) =>
  current + (target - current) * factor

const formatTime = (seconds: number) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const foamLabel = (foam: number) => {
  if (foam < 15) return 'Low'
  if (foam < 40) return 'Medium'
  return 'High'
}

function StepButtons({
  setValue,
  step = 1,
}: {
  setValue: Setter
  step?: number
}) {
  return (
    <div className="step-buttons">
      <button onClick={() => setValue(v => Number((v + step).toFixed(2)))}>
        ▲
      </button>

      <button
        onClick={() =>
          setValue(v => Math.max(0, Number((v - step).toFixed(2))))
        }
      >
        ▼
      </button>
    </div>
  )
}

function Pump({
  name,
  value,
  setValue,
  unit = 'CC/Min',
  mode,
  setMode,
  accumulated,
  step = 1,
}: {
  name: string
  value: number
  setValue: Setter
  unit?: string
  mode: PumpMode
  setMode: Dispatch<SetStateAction<PumpMode>>
  accumulated: number
  step?: number
}) {
  return (
    <div className="mini-card">
      <div className="pump-stack">
        <div className="control-title">
          {name}
          <span className={`dot ${mode !== 'off' ? 'active' : ''}`} />
        </div>

        <div className="control-value">
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>

        <div className="meta-row">{accumulated.toFixed(2)} CC</div>
      </div>

      <div className="pump-actions">
        <StepButtons setValue={setValue} step={step} />

        <div className="run-buttons">
          <button
            className={mode === 'forward' ? 'active' : ''}
            onClick={() =>
              setMode(m => (m === 'forward' ? 'off' : 'forward'))
            }
          >
            +
          </button>

          <button
            className={mode === 'reverse' ? 'active reverse' : ''}
            onClick={() =>
              setMode(m => (m === 'reverse' ? 'off' : 'reverse'))
            }
          >
            −
          </button>
        </div>
      </div>
    </div>
  )
}

function ProcessControl({
  name,
  value,
  setValue,
  unit,
  step,
  running,
  setRunning,
}: {
  name: string
  value: number
  setValue: Setter
  unit: string
  step: number
  running: boolean
  setRunning: BoolSetter
}) {
  return (
    <div className="mini-card">
      <div className="pump-stack">
        <div className="control-title">
          {name}
          <span className={`dot ${running ? 'active' : ''}`} />
        </div>

        <div className="control-value">
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>
      </div>

      <div className="pump-actions">
        <StepButtons setValue={setValue} step={step} />

        <button
          className={`run ${running ? 'running' : ''}`}
          onClick={() => setRunning(v => !v)}
        >
          {running ? '■' : '+'}
        </button>
      </div>
    </div>
  )
}

function Sensor({
  name,
  measured,
  setpoint,
  setSetpoint,
  unit,
  decimals = 0,
  enabled,
  setEnabled,
  step = 1,
}: {
  name: string
  measured: number
  setpoint: number
  setSetpoint: Setter
  unit: string
  decimals?: number
  enabled: boolean
  setEnabled: BoolSetter
  step?: number
}) {
  return (
    <div className="sensor-card">
      <div className="sensor-name">{name}</div>

      <div className="sensor-values">
        <div>
          {measured.toFixed(decimals)}
          <small>{unit}</small>
        </div>

        <div>
          {setpoint.toFixed(decimals)}
          <small>{unit}</small>
        </div>
      </div>

      <div className="sensor-controls">
        <StepButtons setValue={setSetpoint} step={step} />

        <button
          className={`auto ${enabled ? 'active' : ''}`}
          onClick={() => setEnabled(v => !v)}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  )
}

function DataBox({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="data-box">
      <span>{title}</span>
      <strong>{value}</strong>

      <div className="fake-chart">
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function Experiment({
  rpm,
  air,
  temperature,
  ph,
  po2,
  volume,
  foam,
  running,
  cycleTime,
}: {
  rpm: number
  air: number
  temperature: number
  ph: number
  po2: number
  volume: number
  foam: number
  running: boolean
  cycleTime: string
}) {
  const bubbleCount = running
    ? Math.max(6, Math.min(34, Math.round(air / 25)))
    : 0

  const liquidLevel = clamp(volume / 14, 35, 82)

  /*
    La espuma física sigue usando foam 0-100,
    pero visualmente hacemos que empiece a apreciarse antes.
  */
  const visualFoamHeight =
    foam < 0.5
      ? 0
      : clamp(10 + Math.sqrt(foam) * 5.5, 10, 65)

  const mixingIntensity = clamp(rpm / 1800, 0, 1)

  return (
    <section className="experiment-panel">
      <div className="experiment-heading">
        <div>
          <span className="eyebrow">LIVE PROCESS</span>

          <h1>Your experiment, in real time.</h1>

          <p>
            Change Genesys V1 parameters and see how the simulated process responds.
          </p>
        </div>

        <div className={`process-status ${running ? 'online' : ''}`}>
          <span />
          {running ? 'Experiment running' : 'Ready'}
        </div>
      </div>

      <div className="experiment-stage">
        <div className="left-readouts">
          <DataBox title="pH" value={ph.toFixed(2)} />
          <DataBox title="pO₂" value={`${po2.toFixed(1)} %`} />
        </div>

        <div className="reactor-hero">
          <div className="motor-hero">
            <div className="motor-top">
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="motor-neck" />
          </div>

          <div className="top-plate">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="hero-vessel">
            <div
              className="hero-liquid"
              style={{
                height: `${liquidLevel}%`,
              }}
            >
              <div
                className={`mix-vortex ${running ? 'active' : ''}`}
                style={{
                  opacity: running
                    ? 0.12 + mixingIntensity * 0.45
                    : 0,
                }}
              />
            </div>

            <div
              className="liquid-surface"
              style={{
                bottom: `calc(${liquidLevel}% - 5px)`,
              }}
            />

            <div
              className="foam-pro"
              style={{
                height: `${visualFoamHeight}px`,
                bottom: `${liquidLevel}%`,
                opacity: visualFoamHeight > 0 ? 1 : 0,
              }}
            >
              <div className="foam-body" />

              {Array.from({ length: 34 }).map((_, i) => {
                const size = 5 + (i % 5) * 2.4

                return (
                  <i
                    key={i}
                    className="foam-bubble"
                    style={{
                      left: `${3 + ((i * 29) % 92)}%`,
                      top: `${3 + ((i * 17) % 70)}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDelay: `${(i % 8) * 0.16}s`,
                      animationDuration: `${2 + (i % 5) * 0.35}s`,
                    }}
                  />
                )
              })}
            </div>

            {Array.from({ length: bubbleCount }).map((_, i) => (
              <i
                key={i}
                className="hero-bubble"
                style={{
                  left: `${8 + ((i * 23) % 84)}%`,
                  animationDelay: `${(i % 7) * 0.22}s`,
                  animationDuration: `${1.6 + (i % 5) * 0.28}s`,
                }}
              />
            ))}

            <div className="hero-shaft" />

            <div
  className={`rushton-impeller ${running ? 'spinning' : ''}`}
  style={{
    animationDuration: `${Math.max(
      0.18,
      650 / Math.max(rpm, 1)
    )}s`,
  }}
>
  <div className="rushton-disc" />

  <span className="rushton-blade blade-left" />
  <span className="rushton-blade blade-right" />

  <div className="rushton-hub" />
</div>

            <div className="probe probe-one" />
            <div className="probe probe-two" />

            <div className="glass-highlight highlight-one" />
            <div className="glass-highlight highlight-two" />
          </div>

          <div className="reactor-base" />
        </div>

        <div className="right-readouts">
          <DataBox
            title="Temperature"
            value={`${temperature.toFixed(1)} °C`}
          />

          <DataBox title="Agitation" value={`${rpm} RPM`} />

          <DataBox title="Air flow" value={`${air} CC/min`} />
        </div>
      </div>

      <div className="process-footer">
        <div>
          <span>Volume</span>
          <strong>{volume.toFixed(0)} mL</strong>
        </div>

        <div>
          <span>Foam</span>
          <strong>{foamLabel(foam)}</strong>
        </div>

        <div>
          <span>Cycle</span>
          <strong>{cycleTime}</strong>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [running, setRunning] = useState(false)
  const [cycleSeconds, setCycleSeconds] = useState(0)

  const [rpm, setRpm] = useState(500)
  const [stirringRunning, setStirringRunning] = useState(true)

  const [air, setAir] = useState(200)
  const [airRunning, setAirRunning] = useState(true)

  const [acid, setAcid] = useState(9)
  const [base, setBase] = useState(20)
  const [antifoam, setAntifoam] = useState(20)
  const [feed, setFeed] = useState(10)
  const [emptyFill, setEmptyFill] = useState(20)

  const [acidMode, setAcidMode] = useState<PumpMode>('off')
  const [baseMode, setBaseMode] = useState<PumpMode>('off')
  const [antifoamMode, setAntifoamMode] = useState<PumpMode>('off')
  const [feedMode, setFeedMode] = useState<PumpMode>('off')
  const [emptyFillMode, setEmptyFillMode] =
    useState<PumpMode>('off')

  const [tempSetpoint, setTempSetpoint] = useState(25)
  const [phSetpoint, setPhSetpoint] = useState(7)
  const [po2Setpoint, setPo2Setpoint] = useState(100)

  const [tempEnabled, setTempEnabled] = useState(false)
  const [phEnabled, setPhEnabled] = useState(false)
  const [po2Enabled, setPo2Enabled] = useState(false)

  const [temperature, setTemperature] = useState(25)
  const [ph, setPh] = useState(7.01)
  const [po2, setPo2] = useState(100)
  const [volume, setVolume] = useState(1004.61)
  const [foam, setFoam] = useState(0)

  const [acidAccum, setAcidAccum] = useState(1.05)
  const [baseAccum, setBaseAccum] = useState(0.54)
  const [antifoamAccum, setAntifoamAccum] = useState(0)
  const [feedAccum, setFeedAccum] = useState(3.08)
  const [emptyFillAccum, setEmptyFillAccum] = useState(0)

  const effectiveRpm =
    running && stirringRunning ? rpm : 0

  const effectiveAir =
    running && airRunning ? air : 0

  const cycleTime = formatTime(cycleSeconds)

  useEffect(() => {
    if (!running) return

    const id = setInterval(() => {
      setCycleSeconds(seconds => seconds + 1)

      const acidPerSecond =
        acidMode === 'forward'
          ? acid / 60
          : acidMode === 'reverse'
          ? -(acid / 60)
          : 0

      const basePerSecond =
        baseMode === 'forward'
          ? base / 60
          : baseMode === 'reverse'
          ? -(base / 60)
          : 0

      const antifoamPerSecond =
        antifoamMode === 'forward'
          ? antifoam / 60
          : antifoamMode === 'reverse'
          ? -(antifoam / 60)
          : 0

      const feedPerSecondBase =
        ((feed / 100) * volume) / 3600

      const feedPerSecond =
        feedMode === 'forward'
          ? feedPerSecondBase
          : feedMode === 'reverse'
          ? -feedPerSecondBase
          : 0

      const emptyFillPerSecond =
        emptyFillMode === 'forward'
          ? emptyFill / 60
          : emptyFillMode === 'reverse'
          ? -(emptyFill / 60)
          : 0

      const volumeDelta =
        acidPerSecond +
        basePerSecond +
        antifoamPerSecond +
        feedPerSecond +
        emptyFillPerSecond

      setVolume(v =>
        clamp(v + volumeDelta, 300, 1500)
      )

      setAcidAccum(v =>
        Math.max(0, v + acidPerSecond)
      )

      setBaseAccum(v =>
        Math.max(0, v + basePerSecond)
      )

      setAntifoamAccum(v =>
        Math.max(0, v + antifoamPerSecond)
      )

      setFeedAccum(v =>
        Math.max(0, v + feedPerSecond)
      )

      setEmptyFillAccum(v =>
        Math.max(
          0,
          v + Math.abs(emptyFillPerSecond)
        )
      )

      const targetTemperature =
        tempEnabled ? tempSetpoint : 25

      setTemperature(current =>
        Number(
          approach(
            current,
            targetTemperature,
            0.18 * DYNAMICS_SPEED
          ).toFixed(2)
        )
      )

      let nextPh = ph

      if (acidMode === 'forward') {
        nextPh -=
          0.015 *
          (acid / 20) *
          DYNAMICS_SPEED
      }

      if (baseMode === 'forward') {
        nextPh +=
          0.015 *
          (base / 20) *
          DYNAMICS_SPEED
      }

      if (phEnabled) {
        nextPh = approach(
          nextPh,
          phSetpoint,
          0.05 * DYNAMICS_SPEED
        )
      }

      nextPh = clamp(nextPh, 0, 14)
      setPh(Number(nextPh.toFixed(2)))

      let nextFoam = foam

      nextFoam +=
        (effectiveAir / 260) *
        DYNAMICS_SPEED

      nextFoam +=
        (effectiveRpm / 2200) *
        DYNAMICS_SPEED

      if (feedMode === 'forward') {
        nextFoam +=
          0.35 * DYNAMICS_SPEED
      }

      if (baseMode === 'forward') {
        nextFoam +=
          0.12 * DYNAMICS_SPEED
      }

      if (antifoamMode === 'forward') {
        nextFoam -=
          (antifoam / 18) *
          DYNAMICS_SPEED
      }

      nextFoam -=
        0.08 * DYNAMICS_SPEED

      nextFoam = clamp(nextFoam, 0, 100)

      setFoam(
        Number(nextFoam.toFixed(2))
      )

      let nextPo2 = po2

      const oxygenSupport =
        effectiveAir * 0.09 +
        effectiveRpm * 0.02

      const oxygenDemand =
        18 +
        nextFoam * 0.25 +
        (feedMode === 'forward' ? 2.5 : 0)

      const po2Change =
        (oxygenSupport -
          oxygenDemand -
          nextPo2 * 0.02) /
        4

      nextPo2 +=
        po2Change * DYNAMICS_SPEED

      if (po2Enabled) {
        nextPo2 = approach(
          nextPo2,
          po2Setpoint,
          0.03 * DYNAMICS_SPEED
        )
      }

      nextPo2 = clamp(nextPo2, 0, 150)

      setPo2(
        Number(nextPo2.toFixed(1))
      )
    }, 1000)

    return () => clearInterval(id)
  }, [
    running,
    acid,
    base,
    antifoam,
    feed,
    emptyFill,
    acidMode,
    baseMode,
    antifoamMode,
    feedMode,
    emptyFillMode,
    effectiveRpm,
    effectiveAir,
    tempEnabled,
    phEnabled,
    po2Enabled,
    tempSetpoint,
    phSetpoint,
    po2Setpoint,
    volume,
    ph,
    foam,
    po2,
  ])

  const systemStatus = useMemo(() => {
    if (!running) return 'Ready'
    if (foam > 40) return 'Foam warning'
    if (po2 < 20) return 'Low oxygen'
    return 'System OK'
  }, [running, foam, po2])

  return (
    <main className="demo-page">
      <Experiment
        rpm={effectiveRpm}
        air={effectiveAir}
        temperature={temperature}
        ph={ph}
        po2={po2}
        volume={volume}
        foam={foam}
        running={running}
        cycleTime={cycleTime}
      />

      <section className="genesys-panel">
        <header className="genesys-header">
          <div className="genesys-brand">
            <div className="genesys-logo">≋</div>
            <strong>ALLBIOTECH</strong>
          </div>

          <div className="cycle">
            <span>Cycle time</span>
            <strong>{cycleTime}</strong>
          </div>

          <nav>
            <span className="selected">
              ⌂
              <small>Home</small>
            </span>

            <span>
              ⌁
              <small>Monitoring</small>
            </span>

            <span>
              ▱
              <small>History</small>
            </span>

            <span>
              ●
              <small>Notifications</small>
            </span>

            <span>
              ▤
              <small>Programming</small>
            </span>

            <span>
              ⚙
              <small>Settings</small>
            </span>
          </nav>
        </header>

        <div className="control-grid">
          <Pump
            name="Acid"
            value={acid}
            setValue={setAcid}
            mode={acidMode}
            setMode={setAcidMode}
            accumulated={acidAccum}
          />

          <ProcessControl
            name="Stirring"
            value={rpm}
            setValue={setRpm}
            unit="RPM"
            step={100}
            running={stirringRunning}
            setRunning={setStirringRunning}
          />

          <Sensor
            name="Temperature"
            measured={temperature}
            setpoint={tempSetpoint}
            setSetpoint={setTempSetpoint}
            unit="°C"
            decimals={1}
            enabled={tempEnabled}
            setEnabled={setTempEnabled}
            step={1}
          />

          <Pump
            name="Base"
            value={base}
            setValue={setBase}
            mode={baseMode}
            setMode={setBaseMode}
            accumulated={baseAccum}
          />

          <ProcessControl
            name="Air"
            value={air}
            setValue={setAir}
            unit="CC/Min"
            step={50}
            running={airRunning}
            setRunning={setAirRunning}
          />

          <Sensor
            name="pH"
            measured={ph}
            setpoint={phSetpoint}
            setSetpoint={setPhSetpoint}
            unit="pH"
            decimals={2}
            enabled={phEnabled}
            setEnabled={setPhEnabled}
            step={0.1}
          />

          <Pump
            name="Antifoam"
            value={antifoam}
            setValue={setAntifoam}
            mode={antifoamMode}
            setMode={setAntifoamMode}
            accumulated={antifoamAccum}
          />

          <div className="center-control">
            <div className="mini-reactor">
              <div
                style={{
                  height: `${clamp(
                    volume / 18,
                    30,
                    70
                  )}%`,
                }}
              />
            </div>

            <button
              className={`start-cycle ${
                running ? 'stop' : ''
              }`}
              onClick={() =>
                setRunning(v => !v)
              }
            >
              {running ? '■' : '▶'}
            </button>
          </div>

          <Sensor
            name="pO₂"
            measured={po2}
            setpoint={po2Setpoint}
            setSetpoint={setPo2Setpoint}
            unit="%"
            decimals={1}
            enabled={po2Enabled}
            setEnabled={setPo2Enabled}
            step={5}
          />

          <Pump
            name="Feed"
            value={feed}
            setValue={setFeed}
            unit="% / h"
            mode={feedMode}
            setMode={setFeedMode}
            accumulated={feedAccum}
            step={1}
          />

          <div className="cycle-name">
            <strong>
              {volume.toFixed(2)} CC
            </strong>

            <input placeholder="Enter custom name" />

            <div className="panel-status">
              {systemStatus}
            </div>
          </div>

          <Pump
            name="Empty / Fill"
            value={emptyFill}
            setValue={setEmptyFill}
            mode={emptyFillMode}
            setMode={setEmptyFillMode}
            accumulated={emptyFillAccum}
            step={5}
          />
        </div>
      </section>
    </main>
  )
}