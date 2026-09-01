import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  DemoNotification,
  GenesysState,
  HistoryCycle,
  PumpMode,
  PumpState,
} from './simulatorTypes';

const DYNAMICS_SPEED = 0.1;

const STATE_STORAGE_KEY = 'genesys-v1-demo-session';
const HISTORY_STORAGE_KEY = 'genesys-v1-demo-history';
const NOTIFICATIONS_STORAGE_KEY = 'genesys-v1-demo-notifications';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const makePump = (rate: number): PumpState => ({
  mode: 'off',
  rate,
  cumulative: 0,
});

const initialState: GenesysState = {
  running: false,
  cycleSeconds: 0,

  rpm: 500,
  stirringRunning: true,

  air: 200,
  airRunning: true,

  temperatureSetpoint: 25,
  pHSetpoint: 7,
  pO2Setpoint: 100,

  temperature: 25,
  pH: 7.01,
  pO2: 100,

  volume: 1004.61,
  foam: 0,

  acid: makePump(9),
  base: makePump(20),
  antifoam: makePump(20),
  feed: makePump(10),
  emptyFill: makePump(20),

  automatic: {
    temperature: false,
    pH: false,
    pO2: false,
    antifoam: false,
  },
};

function readStoredState(): GenesysState {
  try {
    const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
    if (!stored) return initialState;

    const parsed = JSON.parse(stored);

    return {
      ...initialState,
      ...parsed,
      acid: {
        ...initialState.acid,
        ...(parsed.acid ?? {}),
      },
      base: {
        ...initialState.base,
        ...(parsed.base ?? {}),
      },
      antifoam: {
        ...initialState.antifoam,
        ...(parsed.antifoam ?? {}),
      },
      feed: {
        ...initialState.feed,
        ...(parsed.feed ?? {}),
      },
      emptyFill: {
        ...initialState.emptyFill,
        ...(parsed.emptyFill ?? {}),
      },
      automatic: {
        ...initialState.automatic,
        ...(parsed.automatic ?? {}),
      },
    };
  } catch {
    return initialState;
  }
}

function readStoredArray<T>(key: string): T[] {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function pumpDirection(mode: PumpMode) {
  if (mode === 'forward') return 1;
  if (mode === 'reverse') return -1;
  return 0;
}

export function useGenesysSimulator() {
  const [state, setState] = useState<GenesysState>(readStoredState);

  const [history, setHistory] = useState<HistoryCycle[]>(() =>
    readStoredArray<HistoryCycle>(HISTORY_STORAGE_KEY),
  );

  const [notifications, setNotifications] = useState<
    DemoNotification[]
  >(() =>
    readStoredArray<DemoNotification>(
      NOTIFICATIONS_STORAGE_KEY,
    ),
  );

  const cycleStartedAt = useRef<string | null>(null);
  const notificationLocks = useRef<Record<string, boolean>>({});

  useEffect(() => {
    sessionStorage.setItem(
      STATE_STORAGE_KEY,
      JSON.stringify(state),
    );
  }, [state]);

  useEffect(() => {
    sessionStorage.setItem(
      HISTORY_STORAGE_KEY,
      JSON.stringify(history),
    );
  }, [history]);

  useEffect(() => {
    sessionStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications),
    );
  }, [notifications]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setState((previous) => {
        const next = structuredClone(previous);

        if (next.running) {
          next.cycleSeconds += 1;
        }

        const effectiveRpm =
          next.running && next.stirringRunning
            ? next.rpm
            : 0;

        const effectiveAir =
          next.running && next.airRunning
            ? next.air
            : 0;

        const acidFlow =
          (pumpDirection(next.acid.mode) *
            next.acid.rate) /
          60;

        const baseFlow =
          (pumpDirection(next.base.mode) *
            next.base.rate) /
          60;

        const antifoamFlow =
          (pumpDirection(next.antifoam.mode) *
            next.antifoam.rate) /
          60;

        const emptyFillFlow =
          (pumpDirection(next.emptyFill.mode) *
            next.emptyFill.rate) /
          60;

        const feedBase =
          ((next.feed.rate / 100) * next.volume) /
          3600;

        const feedFlow =
          pumpDirection(next.feed.mode) * feedBase;

        const volumeDelta =
          acidFlow +
          baseFlow +
          antifoamFlow +
          feedFlow +
          emptyFillFlow;

        next.volume = clamp(
          next.volume + volumeDelta,
          300,
          1500,
        );

        next.acid.cumulative += Math.abs(acidFlow);
        next.base.cumulative += Math.abs(baseFlow);
        next.antifoam.cumulative +=
          Math.abs(antifoamFlow);
        next.feed.cumulative += Math.abs(feedFlow);

        const temperatureTarget =
          next.automatic.temperature
            ? next.temperatureSetpoint
            : 25;

        next.temperature +=
          (temperatureTarget - next.temperature) *
          0.18 *
          DYNAMICS_SPEED;

        if (next.acid.mode === 'forward') {
          next.pH -=
            0.015 *
            (next.acid.rate / 20) *
            DYNAMICS_SPEED;
        }

        if (next.base.mode === 'forward') {
          next.pH +=
            0.015 *
            (next.base.rate / 20) *
            DYNAMICS_SPEED;
        }

        if (next.automatic.pH) {
          next.pH +=
            (next.pHSetpoint - next.pH) *
            0.05 *
            DYNAMICS_SPEED;
        }

        next.pH = clamp(next.pH, 0, 14);

        const feedRunning =
          next.feed.mode !== 'off';

        const baseRunning =
          next.base.mode !== 'off';

        const antifoamRunning =
          next.antifoam.mode !== 'off';

        next.foam +=
          (
            effectiveAir / 260 +
            effectiveRpm / 2200 +
            (feedRunning ? 0.35 : 0) +
            (baseRunning ? 0.12 : 0) -
            (antifoamRunning
              ? next.antifoam.rate / 18
              : 0) -
            0.08
          ) *
          DYNAMICS_SPEED;

        next.foam = clamp(next.foam, 0, 100);

        const oxygenSupport =
          effectiveAir * 0.09 +
          effectiveRpm * 0.02;

        const demand =
          18 +
          next.foam * 0.25 +
          (feedRunning ? 2.5 : 0);

        next.pO2 +=
          (
            oxygenSupport -
            demand -
            next.pO2 * 0.02
          ) /
          4 *
          DYNAMICS_SPEED;

        if (next.automatic.pO2) {
          next.pO2 +=
            (next.pO2Setpoint - next.pO2) *
            0.03 *
            DYNAMICS_SPEED;
        }

        next.pO2 = clamp(next.pO2, 0, 150);

        return next;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const pushOnce = (
      key: string,
      message: string,
    ) => {
      if (notificationLocks.current[key]) {
        return;
      }

      notificationLocks.current[key] = true;

      setNotifications((previous) => [
        {
          id: crypto.randomUUID(),
          message,
          timestamp: new Date().toISOString(),
        },
        ...previous,
      ]);
    };

    if (state.foam > 40) {
      pushOnce('foam', 'Foam level is high');
    } else {
      notificationLocks.current.foam = false;
    }

    if (state.pO2 < 20) {
      pushOnce('po2', 'Low dissolved oxygen');
    } else {
      notificationLocks.current.po2 = false;
    }

    if (state.volume <= 305) {
      pushOnce(
        'lowVolume',
        'Minimum vessel volume reached',
      );
    } else {
      notificationLocks.current.lowVolume = false;
    }

    if (state.volume >= 1495) {
      pushOnce(
        'highVolume',
        'Maximum vessel volume reached',
      );
    } else {
      notificationLocks.current.highVolume = false;
    }
  }, [state.foam, state.pO2, state.volume]);

  const status = useMemo(() => {
    if (!state.running) return 'Ready';
    if (state.foam > 40) return 'Foam warning';
    if (state.pO2 < 20) return 'Low oxygen';
    return 'System OK';
  }, [state.running, state.foam, state.pO2]);

  const setNumeric = (
    key:
      | 'rpm'
      | 'air'
      | 'temperatureSetpoint'
      | 'pHSetpoint'
      | 'pO2Setpoint',
    value: number,
  ) => {
    setState((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const setPumpRate = (
    pump:
      | 'acid'
      | 'base'
      | 'antifoam'
      | 'feed'
      | 'emptyFill',
    rate: number,
  ) => {
    setState((previous) => ({
      ...previous,
      [pump]: {
        ...previous[pump],
        rate: Math.max(0, rate),
      },
    }));
  };

  const setPumpMode = (
    pump:
      | 'acid'
      | 'base'
      | 'antifoam'
      | 'feed'
      | 'emptyFill',
    mode: PumpMode,
  ) => {
    setState((previous) => ({
      ...previous,
      [pump]: {
        ...previous[pump],
        mode,
      },
    }));
  };

  const toggleAuto = (
    key: keyof GenesysState['automatic'],
  ) => {
    setState((previous) => ({
      ...previous,
      automatic: {
        ...previous.automatic,
        [key]: !previous.automatic[key],
      },
    }));
  };

  const startCycle = () => {
    if (state.running) return;

    cycleStartedAt.current =
      new Date().toISOString();

    setState((previous) => ({
      ...previous,
      running: true,
      cycleSeconds: 0,
    }));
  };

  const stopCycle = () => {
    if (!state.running) return;

    const endedAt = new Date().toISOString();

    const startedAt =
      cycleStartedAt.current ??
      new Date(
        Date.now() -
          state.cycleSeconds * 1000,
      ).toISOString();

    setHistory((previous) => [
      {
        id: crypto.randomUUID(),
        name: `Genesys demo ${previous.length + 1}`,
        startedAt,
        endedAt,
        durationSeconds: state.cycleSeconds,
      },
      ...previous,
    ]);

    cycleStartedAt.current = null;

    setState((previous) => ({
      ...previous,
      running: false,
      acid: {
        ...previous.acid,
        mode: 'off',
      },
      base: {
        ...previous.base,
        mode: 'off',
      },
      antifoam: {
        ...previous.antifoam,
        mode: 'off',
      },
      feed: {
        ...previous.feed,
        mode: 'off',
      },
      emptyFill: {
        ...previous.emptyFill,
        mode: 'off',
      },
    }));
  };

  const deleteHistory = (id: string) => {
    setHistory((previous) =>
      previous.filter(
        (cycle) => cycle.id !== id,
      ),
    );
  };

  return {
    state,
    setState,
    status,
    history,
    notifications,
    setNumeric,
    setPumpRate,
    setPumpMode,
    toggleAuto,
    startCycle,
    stopCycle,
    deleteHistory,
  };
}
