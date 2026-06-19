export interface BaseDevice {
  id: string;
  name: string;
  room: string;
  type: 'light' | 'thermostat' | 'lock' | 'speaker' | 'vacuum' | 'camera';
}

export interface LightDevice extends BaseDevice {
  type: 'light';
  isOn: boolean;
  brightness: number; // 0-100
  color: string; // Hex value or color name (e.g. Warm White, Soft Yellow, #FF0000)
}

export interface ThermostatDevice extends BaseDevice {
  type: 'thermostat';
  isOn: boolean;
  currentTemp: number; // in °F
  targetTemp: number; // in °F
  mode: 'heat' | 'cool' | 'eco' | 'off';
}

export interface LockDevice extends BaseDevice {
  type: 'lock';
  isLocked: boolean;
}

export interface SpeakerDevice extends BaseDevice {
  type: 'speaker';
  isOn: boolean;
  volume: number; // 0-100
  isPlaying: boolean;
  currentTrack: string;
}

export interface VacuumDevice extends BaseDevice {
  type: 'vacuum';
  status: 'docked' | 'cleaning' | 'returning' | 'charging' | 'paused';
  battery: number; // 0-100
}

export interface CameraDevice extends BaseDevice {
  type: 'camera';
  isStreaming: boolean;
  motionDetected: boolean;
  lastEvent: string; // Timestamped event description
}

export type SmartDevice =
  | LightDevice
  | ThermostatDevice
  | LockDevice
  | SpeakerDevice
  | VacuumDevice
  | CameraDevice;

export interface SmartActionLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface AutomationRule {
  id: string;
  name: string;
  time: string; // e.g. "07:30" or "Sunset"
  trigger: string; // e.g. "Time is 7:30 AM" or "When I arrive"
  actions: string[]; // e.g. ["Turn on Living Room Light", "Set Temp to 72"]
  isActive: boolean;
}

export interface SmartHomeState {
  devices: SmartDevice[];
  logs: SmartActionLog[];
  routines: AutomationRule[];
  ecoScore: number; // calculated rating (e.g. 85/100)
}
