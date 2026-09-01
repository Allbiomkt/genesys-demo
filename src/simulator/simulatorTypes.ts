export type PumpMode = 'off' | 'forward' | 'reverse';

export type DemoTab =
  | 'main'
  | 'graph'
  | 'history'
  | 'notifications'
  | 'programming'
  | 'settings';

export interface PumpState {
  mode: PumpMode;
  rate: number;
  cumulative: number;
}

export interface AutomaticControls {
  temperature: boolean;
  pH: boolean;
  pO2: boolean;
  antifoam: boolean;
}

export interface GenesysState {
  running: boolean;
  cycleSeconds: number;

  rpm: number;
  stirringRunning: boolean;

  air: number;
  airRunning: boolean;

  temperatureSetpoint: number;
  pHSetpoint: number;
  pO2Setpoint: number;

  temperature: number;
  pH: number;
  pO2: number;

  volume: number;
  foam: number;

  acid: PumpState;
  base: PumpState;
  antifoam: PumpState;
  feed: PumpState;
  emptyFill: PumpState;

  automatic: AutomaticControls;
}

export interface HistoryCycle {
  id: string;
  name: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
}

export interface DemoNotification {
  id: string;
  message: string;
  timestamp: string;
}
