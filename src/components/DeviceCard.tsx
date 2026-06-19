import React from 'react';
import { motion } from 'motion/react';
import { 
  Lightbulb, Thermometer, Lock, Unlock, Volume2, Play, Pause, 
  Trash2, ShieldAlert, Video, EyeOff, Radio, Battery, Sun, 
  Settings, CheckCircle2, AlertTriangle, Calendar 
} from 'lucide-react';
import { SmartDevice, LightDevice, ThermostatDevice, LockDevice, SpeakerDevice, VacuumDevice, CameraDevice } from '../types';

interface DeviceCardProps {
  device: SmartDevice;
  onUpdate: (id: string, updates: Partial<SmartDevice>) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onUpdate }) => {
  const isLight = device.type === 'light';
  const isThermostat = device.type === 'thermostat';
  const isLock = device.type === 'lock';
  const isSpeaker = device.type === 'speaker';
  const isVacuum = device.type === 'vacuum';
  const isCamera = device.type === 'camera';

  // Common UI State/Colors
  const getHeaderColor = () => {
    switch (device.type) {
      case 'light': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300';
      case 'thermostat': return 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300';
      case 'lock': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300';
      case 'speaker': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300';
      case 'vacuum': return 'bg-teal-50 text-teal-700 dark:bg-teal-950/20 dark:text-teal-300';
      case 'camera': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-300';
    }
  };

  const getStatusText = () => {
    if (isLight) return (device as LightDevice).isOn ? `${(device as LightDevice).brightness}% • ${(device as LightDevice).color}` : 'Off';
    if (isThermostat) {
      const therm = device as ThermostatDevice;
      return therm.isOn ? `${therm.mode.toUpperCase()} • ${therm.targetTemp}°F` : 'Off';
    }
    if (isLock) return (device as LockDevice).isLocked ? 'Locked' : 'Unlocked';
    if (isSpeaker) {
      const spk = device as SpeakerDevice;
      return spk.isOn ? (spk.isPlaying ? `Playing • ${spk.volume}%` : `Paused • ${spk.volume}%`) : 'Off';
    }
    if (isVacuum) {
      const vac = device as VacuumDevice;
      return vac.status.toUpperCase() + ` • ${vac.battery}%`;
    }
    if (isCamera) return (device as CameraDevice).isStreaming ? 'Streaming LIVE' : 'Offline';
    return '';
  };

  const isEnabled = () => {
    if (isLock) return true; // locks are always active
    if (isCamera) return (device as CameraDevice).isStreaming;
    if (isVacuum) return (device as VacuumDevice).status !== 'docked';
    return (device as any).isOn;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:shadow-md dark:bg-slate-900 border-slate-100 dark:border-slate-800 ${
        isEnabled() ? 'border-indigo-100 dark:border-indigo-950/50 shadow-indigo-50/20' : ''
      }`}
      id={`device-card-${device.id}`}
    >
      {/* Accent Top Border/Pill */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${isEnabled() ? 'bg-gradient-to-r from-teal-400 via-indigo-400 to-amber-400' : 'bg-slate-100 dark:bg-slate-800'}`} />

      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{device.room}</span>
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100 mt-0.5 tracking-tight">{device.name}</h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-450 mt-1 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isEnabled() ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
            {getStatusText()}
          </p>
        </div>

        <div className={`p-2.5 rounded-xl ${getHeaderColor()} flex items-center justify-center transition-colors`}>
          {isLight && <Lightbulb className="w-5 h-5" />}
          {isThermostat && <Thermometer className="w-5 h-5" />}
          {isLock && ((device as LockDevice).isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />)}
          {isSpeaker && <Volume2 className="w-5 h-5" />}
          {isVacuum && <Battery className="w-5 h-5" />}
          {isCamera && <Video className="w-5 h-5" />}
        </div>
      </div>

      {/* Detailed control panel */}
      <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-800/50 space-y-4">
        
        {/* LIGHT CONTROLS */}
        {isLight && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Power State</span>
              <button
                id={`toggle-light-${device.id}`}
                onClick={() => onUpdate(device.id, { isOn: !(device as LightDevice).isOn })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (device as LightDevice).isOn ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(device as LightDevice).isOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {(device as LightDevice).isOn && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Brightness</span>
                    <span>{(device as LightDevice).brightness}%</span>
                  </div>
                  <input
                    id={`brightness-slider-${device.id}`}
                    type="range"
                    min="10"
                    max="100"
                    value={(device as LightDevice).brightness}
                    onChange={(e) => onUpdate(device.id, { brightness: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500 block">Ambiance Color</span>
                  <div className="flex gap-2">
                    {['Warm White', 'Daylight', 'Amber', 'Soft Blue', 'Lavender'].map((colorName) => {
                      const bgMap: Record<string, string> = {
                        'Warm White': 'bg-amber-100 text-amber-800',
                        'Daylight': 'bg-slate-100 text-slate-800',
                        'Amber': 'bg-orange-100 text-orange-850',
                        'Soft Blue': 'bg-blue-50 text-blue-800',
                        'Lavender': 'bg-purple-100 text-purple-850',
                      };
                      const isActive = (device as LightDevice).color === colorName;
                      return (
                        <button
                          key={colorName}
                          onClick={() => onUpdate(device.id, { color: colorName })}
                          className={`text-[10px] px-2 py-1 rounded-md font-medium border transition-all ${
                            isActive 
                              ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-sm' 
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                          }`}
                        >
                          {colorName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* THERMOSTAT CONTROLS */}
        {isThermostat && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">System Mode</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-150/50">
                {(['off', 'heat', 'cool', 'eco'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => onUpdate(device.id, { mode: m, isOn: m !== 'off' })}
                    className={`text-[10px] uppercase font-bold px-2 py-1.5 rounded-md transition-all ${
                      ((device as ThermostatDevice).isOn ? (device as ThermostatDevice).mode === m : m === 'off')
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {(device as ThermostatDevice).isOn && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3.5 pt-1">
                {/* Temperature Ring Adjuster style */}
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Current Temperature</span>
                    <p className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-300">
                      {(device as ThermostatDevice).currentTemp}°F
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onUpdate(device.id, { targetTemp: (device as ThermostatDevice).targetTemp - 1 })}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 font-bold text-lg flex items-center justify-center shadow-sm select-none"
                    >
                      -
                    </button>
                    <div className="text-center px-1">
                      <span className="text-[9px] uppercase font-bold text-indigo-500 block">Target</span>
                      <span className="text-xl font-mono font-extrabold text-slate-850 dark:text-slate-100">
                        {(device as ThermostatDevice).targetTemp}°
                      </span>
                    </div>
                    <button
                      onClick={() => onUpdate(device.id, { targetTemp: (device as ThermostatDevice).targetTemp + 1 })}
                      className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 font-bold text-lg flex items-center justify-center shadow-sm select-none"
                    >
                      +
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* LOCK CONTROLS */}
        {isLock && (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-slate-500 block">Security Status</span>
              <span className={`text-xs ${(device as LockDevice).isLocked ? 'text-emerald-500 font-medium' : 'text-amber-500 font-semibold'}`}>
                {(device as LockDevice).isLocked ? 'Fully Secured' : 'Warning: Unlocked'}
              </span>
            </div>
            <button
              id={`toggle-lock-${device.id}`}
              onClick={() => onUpdate(device.id, { isLocked: !(device as LockDevice).isLocked })}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all border ${
                (device as LockDevice).isLocked
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100/50'
                  : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400 hover:bg-amber-100/50 animate-pulse'
              }`}
            >
              {(device as LockDevice).isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {(device as LockDevice).isLocked ? 'Unlock Door' : 'Lock Door'}
            </button>
          </div>
        )}

        {/* SPEAKER CONTROLS */}
        {isSpeaker && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Power State</span>
              <button
                onClick={() => onUpdate(device.id, { isOn: !(device as SpeakerDevice).isOn })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (device as SpeakerDevice).isOn ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(device as SpeakerDevice).isOn ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {(device as SpeakerDevice).isOn && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pt-1">
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/60 dark:border-slate-800/40 flex items-center justify-between">
                  <div className="truncate max-w-[150px]">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 block font-bold">Now Playing</span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 truncate block">
                      {(device as SpeakerDevice).currentTrack}
                    </span>
                  </div>

                  <button
                    onClick={() => onUpdate(device.id, { isPlaying: !(device as SpeakerDevice).isPlaying })}
                    className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 rounded-lg shadow-inner flex items-center justify-center transition-all"
                  >
                    {(device as SpeakerDevice).isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>Volume</span>
                    <span>{(device as SpeakerDevice).volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={(device as SpeakerDevice).volume}
                    onChange={(e) => onUpdate(device.id, { volume: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* VACUUM CONTROLS */}
        {isVacuum && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cleaner Status</span>
              <span className={`text-xs px-2.5 py-1 rounded-full uppercase font-bold tracking-wider text-[10px] ${
                (device as VacuumDevice).status === 'cleaning'
                  ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {(device as VacuumDevice).status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const currentStatus = (device as VacuumDevice).status;
                  const targetStatus = currentStatus === 'cleaning' ? 'paused' : 'cleaning';
                  onUpdate(device.id, { status: targetStatus });
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all border ${
                  (device as VacuumDevice).status === 'cleaning'
                    ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30'
                    : 'bg-teal-50 border-teal-100 text-teal-700 dark:bg-teal-950/20 dark:border-teal-900/30 hover:bg-teal-100/50'
                }`}
              >
                {(device as VacuumDevice).status === 'cleaning' ? 'Pause Cleaning' : 'Start Vacuum'}
              </button>

              {(device as VacuumDevice).status !== 'docked' && (
                <button
                  onClick={() => onUpdate(device.id, { status: 'returning' })}
                  className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                >
                  Return to Dock
                </button>
              )}
            </div>

            {/* Battery indicators */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] font-medium text-slate-400">
                <span>Robotic Battery Level</span>
                <span>{(device as VacuumDevice).battery}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-350 ${
                    (device as VacuumDevice).battery > 50 
                      ? 'bg-emerald-500' 
                      : (device as VacuumDevice).battery > 20 
                        ? 'bg-amber-400' 
                        : 'bg-rose-500'
                  }`}
                  style={{ width: `${(device as VacuumDevice).battery}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CAMERA CONTROLS */}
        {isCamera && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 font-semibold">Feed Status</span>
              <button
                onClick={() => onUpdate(device.id, { isStreaming: !(device as CameraDevice).isStreaming })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (device as CameraDevice).isStreaming ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${(device as CameraDevice).isStreaming ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {(device as CameraDevice).isStreaming ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="relative h-28 bg-slate-900 rounded-xl overflow-hidden flex flex-col justify-between p-3 border border-slate-800 shadow-inner"
              >
                {/* Camera feed live indicator */}
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-1.5 bg-rose-600 text-[9px] font-extrabold uppercase tracking-widest text-white px-1.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-950/60 px-1 rounded">
                    1080p • 30fps
                  </span>
                </div>

                {/* Simulated scan lines & text overlay */}
                <div className="absolute inset-0 bg-radial wave-overlay pointer-events-none opacity-20 bg-gradient-to-b from-transparent via-slate-800/10 to-slate-900/30" />
                
                <div className="text-center text-[11px] font-mono text-indigo-300 font-bold tracking-tight bg-slate-950/40 py-1 rounded backdrop-blur-[1px] z-10 flex items-center justify-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                  Secured Camera Grid active
                </div>

                <div className="z-10 flex gap-2 justify-between items-center text-[9px] font-mono text-slate-400 truncate">
                  <span className="truncate">Event: {(device as CameraDevice).lastEvent}</span>
                  {(device as CameraDevice).motionDetected && (
                    <span className="bg-red-500/80 text-white font-bold rounded px-1 animate-pulse shrink-0">MOTION</span>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-28 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-4">
                <EyeOff className="w-6 h-6 text-slate-300 dark:text-slate-750 mb-1.5" />
                <span className="text-xs font-semibold text-slate-400">Shield Active • Feed Disabled</span>
              </div>
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
};
