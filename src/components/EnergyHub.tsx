import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Zap, Sun, Award, AlertTriangle, TrendingDown, HelpCircle, Activity } from 'lucide-react';
import { SmartDevice, LightDevice, ThermostatDevice, VacuumDevice, SpeakerDevice, CameraDevice } from '../types';

interface EnergyHubProps {
  devices: SmartDevice[];
  ecoScore: number;
  totalLoadWatts: number;
  onEngageEcoPilot: () => void;
}

export const EnergyHub: React.FC<EnergyHubProps> = ({
  devices,
  ecoScore,
  totalLoadWatts,
  onEngageEcoPilot,
}) => {
  // Interactive Hub state variables
  const [maxPowerBudget, setMaxPowerBudget] = useState<number>(800);
  const [isSolarEnabled, setIsSolarEnabled] = useState<boolean>(true);
  const [simulatedSolarBase, setSimulatedSolarBase] = useState<number>(450); // custom base solar production
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Calculate live breakdown category loads
  let hvacWatts = 0;
  let lightingWatts = 0;
  let entertainmentWatts = 0;
  let maintenanceWatts = 0;
  let securityWatts = 0;

  devices.forEach((d) => {
    if (d.type === 'light') {
      const light = d as LightDevice;
      if (light.isOn) {
        lightingWatts += 10 + Math.round(light.brightness * 0.4);
      }
    } else if (d.type === 'thermostat') {
      const therm = d as ThermostatDevice;
      if (therm.isOn) {
        if (therm.mode === 'heat') hvacWatts += 800;
        else if (therm.mode === 'cool') hvacWatts += 1200;
        else if (therm.mode === 'eco') hvacWatts += 300;
        else hvacWatts += 50;
      }
    } else if (d.type === 'speaker') {
      const spk = d as SpeakerDevice;
      if (spk.isOn) {
        entertainmentWatts += 5 + Math.round(spk.volume * 0.1);
      }
    } else if (d.type === 'vacuum') {
      const vac = d as VacuumDevice;
      if (vac.status === 'cleaning') {
        maintenanceWatts += 45;
      } else if (vac.status === 'charging' || vac.status === 'returning') {
        maintenanceWatts += 25;
      }
    } else if (d.type === 'camera') {
      const cam = d as CameraDevice;
      if (cam.isStreaming) {
        securityWatts += 8;
      }
    }
  });

  const hvacPercent = totalLoadWatts > 0 ? (hvacWatts / totalLoadWatts) * 100 : 0;
  const lightingPercent = totalLoadWatts > 0 ? (lightingWatts / totalLoadWatts) * 100 : 0;
  const otherPercent = totalLoadWatts > 0 ? ((entertainmentWatts + maintenanceWatts + securityWatts) / totalLoadWatts) * 100 : 0;

  // Live Solar simulation calculation
  const currentSolarWatts = isSolarEnabled ? Math.round(simulatedSolarBase + (Math.sin(Date.now() / 60000) * 15)) : 0;
  const netGridWatts = totalLoadWatts - currentSolarWatts;
  const isBackfeeding = netGridWatts < 0;

  // Carbon credits & offsets based on usage and ecoScore
  // High eco score means lower carbon density
  const carbonIntensityFactor = 0.384; // kg CO2 per kWh
  const estimatedHourlyCo2Kg = Math.max(0, (totalLoadWatts * carbonIntensityFactor) / 1000);
  const standardHourlyCo2Kg = Math.max(0, (((totalLoadWatts + 320) * 1.2 * carbonIntensityFactor) / 1000));
  const hourlySavedCo2Kg = Math.max(0, standardHourlyCo2Kg - estimatedHourlyCo2Kg);
  
  // Weekly saved trees translation
  const weeklySavedCo2Kg = hourlySavedCo2Kg * 24 * 7;
  const treesEquivPlanted = Math.min(10, (weeklySavedCo2Kg / 2.3).toFixed(1) as any || 0);

  const isOverBudget = totalLoadWatts > maxPowerBudget;

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121216] via-[#101012] to-black border border-white/10 shadow-xl space-y-6">
      
      {/* Header and Smart Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h2 className="text-xs font-extrabold text-white/80 uppercase tracking-widest">
            Nest Live Energy Optimization Core
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white cursor-pointer transition-colors"
            title="Energy math guidelines"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-widest">
            v29.1 Active
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1.5 leading-relaxed overflow-hidden"
          >
            <p className="font-semibold text-white">How is the live power signature calculated?</p>
            <p className="text-[11px]">
              - **HVAC**: Active heating consumes 800W, active cooling occupies 1200W, and eco throttle dials back heating/cooling load to 300W.
            </p>
            <p className="text-[11px]">
              - **Lighting**: Live light bulbs consume 10W base, with progressive wattage scaling up to 40W dynamically matching current dimming profiles.
            </p>
            <p className="text-[11px]">
              - **Micro-Grid Integration**: Simulates instant backfeeding states, enabling localized power resale to public utility services when green solar generation offsets appliance load.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Bento Style widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Widget 1: Interactive Target Energy Budget Slider */}
        <div className="md:col-span-4 p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Demand Response Cap</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            
            <div className="mt-3.5">
              <p className="text-[10px] text-white/40">Custom Target Budget:</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-mono font-extrabold text-white">{maxPowerBudget}</span>
                <span className="text-xs text-white/50">Wh</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="200"
              max="2000"
              step="50"
              value={maxPowerBudget}
              onChange={(e) => setMaxPowerBudget(Number(e.target.value))}
              className="w-full select-none cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none accent-indigo-400 focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-white/30 font-mono">
              <span>Min limit (200Wh)</span>
              <span>Max limit (2000Wh)</span>
            </div>
          </div>

          {/* Budget status alerts */}
          <div className="pt-2">
            {isOverBudget ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Load Limit Breached</p>
                  <p className="text-[9px] text-rose-200/70 leading-normal">
                    Appliance load is {totalLoadWatts - maxPowerBudget}Wh above alert envelope. Click below to automate eco limits.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Optimal consumption</p>
                  <p className="text-[9px] text-emerald-200/70">
                    Operation fits securely within preset target bounds of {maxPowerBudget}Wh.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Advanced Interactive Solar Net-Grid Simulator */}
        <div className="md:col-span-4 p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Solar Micro Grid Simulator</span>
              <button
                onClick={() => setIsSolarEnabled(!isSolarEnabled)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  isSolarEnabled
                    ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                    : 'bg-white/5 border-white/15 text-white/40'
                }`}
              >
                {isSolarEnabled ? 'Live Solar ON' : 'Solar OFF'}
              </button>
            </div>

            {/* Simulated Live Generation vs. Drawing State */}
            {isSolarEnabled ? (
              <div className="mt-3.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400 animate-spin-slow" /> Solar Output
                    </p>
                    <p className="text-xl font-mono font-extrabold text-amber-300">{currentSolarWatts} W</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Net Grid Offset</p>
                    <p className={`text-xl font-mono font-extrabold ${isBackfeeding ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isBackfeeding ? `+${Math.abs(netGridWatts)} W` : `-${netGridWatts} W`}
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  <label className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Tune Base Simulated Sunshine</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={simulatedSolarBase}
                    onChange={(e) => setSimulatedSolarBase(Number(e.target.value))}
                    className="w-full cursor-pointer h-1 bg-white/10 rounded-lg appearance-none accent-amber-400 mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-white/30 space-y-1 py-1">
                <p className="text-xs">Solar microgrid offline.</p>
                <p className="text-[10px]">Enable solar simulation to trace backfeed benefits.</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            {isSolarEnabled && isBackfeeding ? (
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-[10px] text-emerald-300 flex items-center justify-center gap-1.5 font-bold uppercase tracking-wide">
                <span>🟢 Status: Backfeeding localized power!</span>
              </div>
            ) : isSolarEnabled ? (
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-300 flex items-center justify-center gap-1.5 font-semibold font-mono">
                <span>Drawing {netGridWatts}W from utility network</span>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white/40 flex items-center justify-center gap-1.5 font-mono">
                <span>Standard grid dependency</span>
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Live SVG Energy Category Allocation */}
        <div className="md:col-span-4 p-4.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between space-y-3.5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Live Signature Allocation</span>
              <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Active</span>
            </div>

            {totalLoadWatts > 0 ? (
              <div className="mt-4 space-y-3">
                {/* HVAC Allocation Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/75 font-semibold">
                    <span>🌡️ Climate Control (HVAC)</span>
                    <span className="font-mono text-white">{hvacWatts}W ({Math.round(hvacPercent)}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${hvacPercent}%` }} />
                  </div>
                </div>

                {/* Lighting Allocation Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/75 font-semibold">
                    <span>💡 Light bulb Grid</span>
                    <span className="font-mono text-white">{lightingWatts}W ({Math.round(lightingPercent)}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${lightingPercent}%` }} />
                  </div>
                </div>

                {/* Other Allocation Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-white/75 font-semibold">
                    <span>🔌 Dynamic Sweepers, Cam & Speaker</span>
                    <span className="font-mono text-white">{entertainmentWatts + maintenanceWatts + securityWatts}W ({Math.round(otherPercent)}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: `${otherPercent}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center text-white/30 space-y-1 py-1">
                <p className="text-xs">No active power signature detected.</p>
                <p className="text-[10px]">Turn on some lights or heating to view live bars.</p>
              </div>
            )}
          </div>

          <div className="font-mono text-[9px] text-white/40 flex items-center justify-between border-t border-white/5 pt-2.5">
            <span>Grid state frequency:</span>
            <span className="text-emerald-400">60 Hz stable</span>
          </div>
        </div>

      </div>

      {/* Carbon Offset Metrics & Energy Efficiency Score row */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Equivalent Carbon Offset Status</span>
              <Award className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-xs text-emerald-300 font-semibold font-mono mt-0.5">
              Saving {hourlySavedCo2Kg.toFixed(3)} kg CO₂ equivalents / hour (Estimated ~{treesEquivPlanted} Trees/week)
            </p>
          </div>
        </div>

        {/* Dynamic Eco pilot activation reminder matching the energy overload */}
        {isOverBudget && (
          <motion.button
            onClick={onEngageEcoPilot}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 1.8 }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 text-xs font-extrabold uppercase tracking-widest text-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 border-none cursor-pointer"
          >
            <Leaf className="w-3.5 h-3.5" />
            Correct Over-Budget Load
          </motion.button>
        )}
      </div>

    </div>
  );
};
