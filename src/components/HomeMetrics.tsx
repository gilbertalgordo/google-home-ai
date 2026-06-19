import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, Leaf, Gauge, 
  Flame, HelpCircle, RefreshCw, Zap 
} from 'lucide-react';
import { SmartDevice, LightDevice, ThermostatDevice, LockDevice, VacuumDevice } from '../types';

interface HomeMetricsProps {
  devices: SmartDevice[];
  ecoScore: number;
}

export const HomeMetrics: React.FC<HomeMetricsProps> = ({ devices, ecoScore }) => {
  // Calculations
  const lightsOn = devices.filter(d => d.type === 'light' && (d as LightDevice).isOn).length;
  const totalLights = devices.filter(d => d.type === 'light').length;
  
  const locksLockedCount = devices.filter(d => d.type === 'lock' && (d as LockDevice).isLocked).length;
  const totalLocks = devices.filter(d => d.type === 'lock').length;
  const allLocksSecured = locksLockedCount === totalLocks;

  const activeThermostats = devices.filter(d => d.type === 'thermostat' && (d as ThermostatDevice).isOn) as ThermostatDevice[];
  const avgTemp = activeThermostats.length > 0 
    ? Math.round(activeThermostats.reduce((sum, t) => sum + t.targetTemp, 0) / activeThermostats.length)
    : 72; // default comfortable temp

  // Dynamic status text
  const getSecurityStatus = () => {
    if (allLocksSecured) {
      return {
        text: "Home Secure",
        desc: "All entry doors locked",
        color: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
        icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />
      };
    } else {
      return {
        text: "Doors Unlocked",
        desc: `${totalLocks - locksLockedCount} entrance doors unlocked`,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 animate-pulse",
        icon: <ShieldAlert className="w-5 h-5 text-amber-600" />
      };
    }
  };

  const security = getSecurityStatus();

  // Dynamic Eco suggestion based on active devices
  const getEcoAdvice = () => {
    const suggestions: string[] = [];
    
    // lights check
    const brightLights = devices.filter(d => d.type === 'light' && (d as LightDevice).isOn && (d as LightDevice).brightness > 85);
    if (brightLights.length > 0) {
      suggestions.push(`Dimming high brightness lights in the ${brightLights[0].room} can boost efficiency.`);
    }

    // thermostat check
    const coolAc = activeThermostats.filter(t => t.mode === 'cool' && t.targetTemp < 72);
    if (coolAc.length > 0) {
      suggestions.push(`Raising the ${coolAc[0].room} AC by 2°F improves your ecological score.`);
    }

    const heatAc = activeThermostats.filter(t => t.mode === 'heat' && t.targetTemp > 72);
    if (heatAc.length > 0) {
      suggestions.push(`Lowering the ${heatAc[0].room} heating to 68°F during Sleep mode saves 5% resource expenditure.`);
    }

    if (suggestions.length === 0) {
      return "Excellent! Your smart devices are optimally adjusted for maximum resource savings.";
    }

    return suggestions[0];
  };

  const totalActiveAppliances = devices.filter(d => {
    if (d.type === 'light') return (d as LightDevice).isOn;
    if (d.type === 'thermostat') return (d as ThermostatDevice).isOn;
    if (d.type === 'speaker') return (d as any).isOn;
    if (d.type === 'vacuum') return (d as VacuumDevice).status === 'cleaning';
    if (d.type === 'camera') return (d as any).isStreaming;
    return false;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Eco Score Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm col-span-1 md:col-span-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Eco-Score</span>
          <Leaf className="w-5 h-5 text-emerald-500" />
        </div>
        
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-4xl font-mono font-extrabold text-slate-800 dark:text-slate-100">{ecoScore}</span>
          <span className="text-sm font-semibold text-slate-400">/100</span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${ecoScore > 80 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
            style={{ width: `${ecoScore}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Rating: {ecoScore > 85 ? 'Outstanding Energy Tier' : 'Optimal Efficiency Profile'}
        </p>
      </div>

      {/* 2. Security Status Card */}
      <div className={`rounded-2xl border p-5 shadow-sm col-span-1 md:col-span-1 flex flex-col justify-between transition-all ${security.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home Lock</span>
          {security.icon}
        </div>

        <div className="mt-3">
          <h4 className={`text-xl font-extrabold tracking-tight ${security.color}`}>{security.text}</h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{security.desc}</p>
        </div>
        
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2">
          {allLocksSecured ? '✓ ALL ENTRANCE PATHWAYS GUARDED' : '⚠️ LOCK MODIFICATION ADVISED'}
        </p>
      </div>

      {/* 3. Climate Average */}
      <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm col-span-1 md:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Temp</span>
          <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
        </div>

        <div className="mt-3">
          <h4 className="text-2xl font-mono font-extrabold text-slate-800 dark:text-slate-100">{avgTemp}°F</h4>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Across {activeThermostats.length} active zones
          </p>
        </div>

        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mt-2">
          Target Comfort Level
        </span>
      </div>

      {/* 4. Active Smart Advice & Load */}
      <div className="rounded-2xl border border-indigo-50/70 dark:border-indigo-950/40 bg-gradient-to-br from-indigo-50/20 to-teal-50/20 dark:from-slate-900 dark:to-slate-900 shadow-sm p-5 col-span-1 md:col-span-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Appliance Load</span>
          <Zap className="w-4 h-4 text-indigo-500" />
        </div>

        <div className="my-2.5">
          <span className="text-xl font-mono font-bold text-slate-800 dark:text-slate-100">
            {totalActiveAppliances} <span className="text-xs text-slate-400 font-sans">Active Nodes</span>
          </span>
          <p className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed italic border-l-2 border-indigo-400 pl-2">
            "{getEcoAdvice()}"
          </p>
        </div>
      </div>

    </div>
  );
};
