import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, Leaf, Home, 
  Terminal, History, Send, Cpu, Sliders, HelpCircle, 
  RefreshCw, Radio, Play, Flame, HelpCircle as HelpIcon,
  Moon, Film, UserMinus, Plus, Wrench
} from 'lucide-react';
import { SmartDevice, SmartActionLog, AutomationRule, SmartHomeState, LightDevice, ThermostatDevice, LockDevice, SpeakerDevice, VacuumDevice, CameraDevice } from './types';
import { DeviceCard } from './components/DeviceCard';
import { HomeMetrics } from './components/HomeMetrics';
import { EnergyHub } from './components/EnergyHub';

// Initial device pool
const INITIAL_DEVICES: SmartDevice[] = [
  {
    id: 'light-living-room',
    name: 'Living Room Main Light',
    room: 'Living Room',
    type: 'light',
    isOn: true,
    brightness: 80,
    color: 'Warm White'
  } as LightDevice,
  {
    id: 'light-kitchen',
    name: 'Kitchen Pendant Lights',
    room: 'Kitchen',
    type: 'light',
    isOn: false,
    brightness: 40,
    color: 'Soft Blue'
  } as LightDevice,
  {
    id: 'light-bedroom',
    name: 'Bedroom Mood Uplight',
    room: 'Bedroom',
    type: 'light',
    isOn: false,
    brightness: 50,
    color: 'Lavender'
  } as LightDevice,
  {
    id: 'lock-front',
    name: 'Front Smart Door Lock',
    room: 'Entrance',
    type: 'lock',
    isLocked: true
  } as LockDevice,
  {
    id: 'lock-back',
    name: 'Back Patio Bolt Lock',
    room: 'Backyard',
    type: 'lock',
    isLocked: true
  } as LockDevice,
  {
    id: 'thermostat-nest',
    name: 'Google Nest Thermostat',
    room: 'Hallway',
    type: 'thermostat',
    isOn: true,
    currentTemp: 69,
    targetTemp: 71,
    mode: 'heat'
  } as ThermostatDevice,
  {
    id: 'speaker-hub',
    name: 'Kitchen Hub Max Speaker',
    room: 'Kitchen',
    type: 'speaker',
    isOn: true,
    volume: 55,
    isPlaying: true,
    currentTrack: 'Midnight City - M83'
  } as SpeakerDevice,
  {
    id: 'vacuum-main',
    name: 'Nest CleanVac Robot',
    room: 'Hallway',
    type: 'vacuum',
    status: 'docked',
    battery: 100
  } as VacuumDevice,
  {
    id: 'camera-front',
    name: 'Nest Cam IQ Outdoor',
    room: 'Entrance',
    type: 'camera',
    isStreaming: true,
    motionDetected: false,
    lastEvent: 'No activity detected'
  } as CameraDevice
];

const INITIAL_ROUTINES: AutomationRule[] = [
  {
    id: 'routine-morning',
    name: 'Good Morning Spark',
    time: '07:30 AM',
    trigger: 'Time is 07:30 AM',
    actions: ['Turn on Kitchen Pendant Lights', 'Set Thermostat to 72°F', 'Play morning track'],
    isActive: true
  },
  {
    id: 'routine-night',
    name: 'Deep Sleep Mode',
    time: '11:00 PM',
    trigger: 'Manual / Voice Command',
    actions: ['Turn off all lights', 'Lock dual entrance doors', 'Set Nest Thermostat to Eco mode'],
    isActive: true
  },
  {
    id: 'routine-cinema',
    name: 'Movie Theater Scene',
    time: 'Sunset',
    trigger: 'Smart Home Event',
    actions: ['Dim Living Room lights to 15%', 'Turn off Bedroom lights', 'Enable speaker playback'],
    isActive: true
  }
];

export default function App() {
  // Load initial states
  const [state, setState] = useState<SmartHomeState>(() => {
    const saved = localStorage.getItem('google_home_ai_state_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Local storage state load error", e);
      }
    }
    return {
      devices: INITIAL_DEVICES,
      logs: [
        { id: 'log-1', timestamp: '08:00 AM', message: 'Good Morning routine pre-heated living room.', type: 'success' },
        { id: 'log-2', timestamp: '09:24 AM', message: 'All locks secure. Security grid fully active.', type: 'info' }
      ],
      routines: INITIAL_ROUTINES,
      ecoScore: 88,
    };
  });

  // Chat Interface state
  const [inputText, setInputText] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [assistantSpeech, setAssistantSpeech] = useState<string>(
    'Welcome to your customized Google Home AI Dashboard. Adjust filters, trigger active routines, or text commands to modify the entire space instantly.'
  );
  const [lastSpeechError, setLastSpeechError] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<string>('All');

  // Trigger persistent save
  useEffect(() => {
    localStorage.setItem('google_home_ai_state_v1', JSON.stringify(state));
  }, [state]);

  const [isAutoUpdating, setIsAutoUpdating] = useState<boolean>(true);
  const [isAutoConnecting, setIsAutoConnecting] = useState<boolean>(false);
  const [discoveryStep, setDiscoveryStep] = useState<string>('');

  const handleAutoConnect = () => {
    setIsAutoConnecting(true);
    setDiscoveryStep('Scanning Nest local subnet for active offline nodes...');
    
    setTimeout(() => {
      setDiscoveryStep('Negotiating secure SSL Nest communication certificates...');
    }, 1200);

    setTimeout(() => {
      setDiscoveryStep('Resolving remote Google Home discovery protocol & syncing with main dashboard...');
    }, 2400);

    setTimeout(() => {
      setState((prev) => {
        const hasHumidifier = prev.devices.some(d => d.id === 'humidifier-master');
        const hasDoorbell = prev.devices.some(d => d.id === 'doorbell-nest');

        if (hasHumidifier && hasDoorbell) {
          return {
            ...prev,
            logs: [
              {
                id: `log-connect-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                message: 'Auto Connect: Already linked to all 11 neighborhood node systems.',
                type: 'info'
              },
              ...prev.logs
            ]
          };
        }

        const newDevicesToAdd: SmartDevice[] = [];
        if (!hasHumidifier) {
          newDevicesToAdd.push({
            id: 'humidifier-master',
            name: 'Nest Air Humidifier & Purifier',
            room: 'Bedroom',
            type: 'light',
            isOn: true,
            brightness: 65,
            color: 'Soft Yellow'
          } as LightDevice);
        }
        if (!hasDoorbell) {
          newDevicesToAdd.push({
            id: 'doorbell-nest',
            name: 'Nest Hello Smart Doorbell',
            room: 'Entrance',
            type: 'camera',
            isStreaming: true,
            motionDetected: false,
            lastEvent: 'Discovered via live SSID broadcast'
          } as CameraDevice);
        }

        return {
          ...prev,
          devices: [...prev.devices, ...newDevicesToAdd],
          logs: [
            {
              id: `log-connect-success-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Auto Connect Success: Linked ${newDevicesToAdd.length} newly discovered Nest smart appliances!`,
              type: 'success'
            },
            ...prev.logs
          ]
        };
      });

      setAssistantSpeech("Auto-discovery complete! I have successfully identified and connected the Nest Air Humidifier and the Nest Hello Smart Doorbell to your primary AI security grid.");
      setIsAutoConnecting(false);
      setDiscoveryStep('');
    }, 3600);
  };

  const [isAutoRepairing, setIsAutoRepairing] = useState<boolean>(false);
  const [repairStep, setRepairStep] = useState<string>('');

  const handleAutoRepair = () => {
    if (isAutoRepairing) return;
    setIsAutoRepairing(true);
    setRepairStep('Initiating master diagnostic handshake with all local appliances...');

    setTimeout(() => {
      setRepairStep('Re-calibrating Light spectral frequencies and thermostat sensor arrays...');
    }, 1000);

    setTimeout(() => {
      setRepairStep('Flushing Nest CleanVac internal memory caches and resetting lidar mapping...');
    }, 2000);

    setTimeout(() => {
      setRepairStep('Encrypting Front Smart Lock communication channels and securing physical access...');
    }, 3000);

    setTimeout(() => {
      setState((prev) => {
        const repairedDevices = prev.devices.map((device) => {
          if (device.type === 'lock') {
            return { ...device, isLocked: true } as LockDevice;
          }
          if (device.type === 'vacuum') {
            const vac = device as VacuumDevice;
            if (vac.status === 'paused' || vac.battery < 30) {
              return { ...vac, battery: 100, status: 'docked' } as VacuumDevice;
            }
          }
          if (device.type === 'camera') {
            const cam = device as CameraDevice;
            return { ...cam, motionDetected: false, isStreaming: true } as CameraDevice;
          }
          return device;
        });

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return {
          ...prev,
          devices: repairedDevices,
          logs: [
            {
              id: `log-repair-success-${Date.now()}`,
              timestamp,
              message: 'Nest Auto Repair Complete: Subsystem diagnostic check executed. Lock systems engaged. All appliances operating at 100% health.',
              type: 'success'
            },
            ...prev.logs
          ]
        };
      });

      setAssistantSpeech("All diagnostic anomalies resolved. I have successfully locked all vulnerable access points, recalibrated ambient thermostat feeds, reset your robotic maintenance sweeps, and placed your home perimeter under full defensive verification.");
      setIsAutoRepairing(false);
      setRepairStep('');
    }, 4200);
  };

  // IoT Node Provisioner states
  const [isProvisioningOpen, setIsProvisioningOpen] = useState<boolean>(false);
  const [newNodeName, setNewNodeName] = useState<string>('');
  const [newNodeRoom, setNewNodeRoom] = useState<string>('Living Room');
  const [newNodeCustomRoom, setNewNodeCustomRoom] = useState<string>('');
  const [newNodeType, setNewNodeType] = useState<'light' | 'thermostat' | 'lock' | 'speaker' | 'vacuum' | 'camera'>('light');

  const handleProvisionNode = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRoom = newNodeRoom === 'Custom' ? (newNodeCustomRoom.trim() || 'Other') : newNodeRoom;
    if (!newNodeName.trim()) return;

    const newId = `custom-node-${Date.now()}`;
    let newlyCreated: SmartDevice;

    switch (newNodeType) {
      case 'light':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'light',
          isOn: false,
          brightness: 50,
          color: 'Warm White'
        } as LightDevice;
        break;
      case 'thermostat':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'thermostat',
          isOn: false,
          currentTemp: 70,
          targetTemp: 72,
          mode: 'eco'
        } as ThermostatDevice;
        break;
      case 'lock':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'lock',
          isLocked: true
        } as LockDevice;
        break;
      case 'speaker':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'speaker',
          isOn: false,
          volume: 40,
          isPlaying: false,
          currentTrack: 'Pacific Coast Chill'
        } as SpeakerDevice;
        break;
      case 'vacuum':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'vacuum',
          status: 'docked',
          battery: 100
        } as VacuumDevice;
        break;
      case 'camera':
        newlyCreated = {
          id: newId,
          name: newNodeName.trim(),
          room: finalRoom,
          type: 'camera',
          isStreaming: true,
          motionDetected: false,
          lastEvent: 'Device initialized successfully'
        } as CameraDevice;
        break;
    }

    setState((prev) => ({
      ...prev,
      devices: [...prev.devices, newlyCreated],
      logs: [
        {
          id: `log-provision-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          message: `IoT Provisioned: Activated custom ${newNodeType} unit "${newNodeName}" in ${finalRoom}.`,
          type: 'success'
        },
        ...prev.logs
      ]
    }));

    setAssistantSpeech(`Custom node successfully provisioned! The newly registered "${newNodeName}" is now fully integrated into the Google Nest network and ready for live automation.`);
    setNewNodeName('');
    setNewNodeCustomRoom('');
    setNewNodeType('light');
    setIsProvisioningOpen(false);
  };

  // Eco Auto-Pilot Optimizer
  const handleEngageEcoPilot = () => {
    setState((prev) => {
      let optimizedCount = 0;
      const optimizedDevices = prev.devices.map((d) => {
        if (d.type === 'light' && (d as LightDevice).isOn) {
          optimizedCount++;
          return { ...d, brightness: Math.min((d as LightDevice).brightness, 40) } as LightDevice;
        }
        if (d.type === 'thermostat' && (d as ThermostatDevice).isOn && (d as ThermostatDevice).mode !== 'eco') {
          optimizedCount++;
          return { ...d, mode: 'eco', targetTemp: 68 } as ThermostatDevice;
        }
        if (d.type === 'vacuum' && (d as VacuumDevice).status === 'cleaning') {
          optimizedCount++;
          return { ...d, status: 'returning' } as VacuumDevice;
        }
        return d;
      });

      const messageText = optimizedCount > 0
        ? `Eco Auto-Pilot: Scaled down load on ${optimizedCount} smart zones. Carbon footprint reduced.`
        : "Eco Auto-Pilot: All node grids are currently operating at maximum energy-conservation levels.";

      return {
        ...prev,
        devices: optimizedDevices,
        ecoScore: Math.min(100, Math.max(98, prev.ecoScore + 8)),
        logs: [
          {
            id: `log-eco-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: messageText,
            type: 'success'
          },
          ...prev.logs
        ]
      };
    });

    setAssistantSpeech("Eco Auto-Pilot has successfully engaged. I've optimized all active heating systems to energy-saving temperatures, dimmed high-brightness light zones, and ensured zero waste across all active terminals.");
  };

  // Real-time Power footprint calculator (W)
  const calculateTotalLoad = () => {
    let watts = 0;
    state.devices.forEach((d) => {
      if (d.type === 'light') {
        const light = d as LightDevice;
        if (light.isOn) watts += 10 + (light.brightness * 0.4);
      } else if (d.type === 'thermostat') {
        const therm = d as ThermostatDevice;
        if (therm.isOn) {
          if (therm.mode === 'heat') watts += 800;
          else if (therm.mode === 'cool') watts += 1200;
          else if (therm.mode === 'eco') watts += 300;
          else watts += 50;
        }
      } else if (d.type === 'speaker') {
        const spk = d as SpeakerDevice;
        if (spk.isOn) watts += 5 + (spk.volume * 0.1);
      } else if (d.type === 'vacuum') {
        const vac = d as VacuumDevice;
        if (vac.status === 'cleaning') watts += 45;
        else if (vac.status === 'charging' || vac.status === 'returning') watts += 25;
      } else if (d.type === 'camera') {
        const cam = d as CameraDevice;
        if (cam.isStreaming) watts += 8;
      }
    });
    return Math.round(watts);
  };
  const totalLoadWatts = calculateTotalLoad();

  // Background automated smart-home simulation (Ambient Auto Updates)
  useEffect(() => {
    if (!isAutoUpdating) return;

    const intervalId = setInterval(() => {
      setState((prev) => {
        let changed = false;
        const updatedDevices = prev.devices.map((dev) => {
          // Thermostat adjustment
          if (dev.type === 'thermostat') {
            const therm = dev as ThermostatDevice;
            if (therm.isOn) {
              if (therm.currentTemp < therm.targetTemp) {
                changed = true;
                return { ...therm, currentTemp: therm.currentTemp + 1 } as ThermostatDevice;
              } else if (therm.currentTemp > therm.targetTemp) {
                changed = true;
                return { ...therm, currentTemp: therm.currentTemp - 1 } as ThermostatDevice;
              }
            }
          }

          // Vacuum battery adjustment
          if (dev.type === 'vacuum') {
            const vac = dev as VacuumDevice;
            if (vac.status === 'cleaning') {
              changed = true;
              const nextBattery = Math.max(0, vac.battery - 3);
              const nextStatus = nextBattery <= 10 ? 'returning' : 'cleaning';
              return { ...vac, battery: nextBattery, status: nextStatus } as VacuumDevice;
            } else if (vac.status === 'returning') {
              changed = true;
              const nextBattery = Math.max(0, vac.battery - 1);
              const nextStatus = nextBattery <= 2 ? 'charging' : 'returning';
              return { ...vac, battery: nextBattery, status: nextStatus } as VacuumDevice;
            } else if (vac.status === 'charging') {
              changed = true;
              const nextBattery = Math.min(100, vac.battery + 8);
              const nextStatus = nextBattery === 100 ? 'docked' : 'charging';
              return { ...vac, battery: nextBattery, status: nextStatus } as VacuumDevice;
            } else if (vac.status === 'docked' && vac.battery < 100) {
              changed = true;
              return { ...vac, status: 'charging' } as VacuumDevice;
            }
          }

          return dev;
        });

        // Small probability (15%) for random ambient events:
        const randomRoll = Math.random();
        let appendedLogs: SmartActionLog[] = [];
        let finalDevices = updatedDevices;

        if (randomRoll < 0.15) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const eventType = Math.floor(Math.random() * 3);

          if (eventType === 0) {
            // Camera Motion Alert
            finalDevices = updatedDevices.map((d) => {
              if (d.type === 'camera') {
                changed = true;
                return {
                  ...d,
                  motionDetected: true,
                  lastEvent: `Motion captured at front archway`
                } as CameraDevice;
              }
              return d;
            });
            appendedLogs.push({
              id: `log-ambient-cam-${Date.now()}`,
              timestamp,
              message: 'Alert: Nest Cam IQ Outdoor spotted presence near Front Walkway',
              type: 'warning'
            });

            // Auto turn off camera motion alert state after 5s
            setTimeout(() => {
              setState((current) => ({
                ...current,
                devices: current.devices.map((d) => 
                  d.type === 'camera' ? { ...d, motionDetected: false } as CameraDevice : d
                )
              }));
            }, 5000);

          } else if (eventType === 1) {
            // Speaker Track Shift
            const tracks = [
              'Morning Brew Acoustic',
              'Midnight City - M83',
              'Pacific Coast Ambient Chill',
              'Comfort Study Lo-Fi Beats',
              'Astral Projections - Synthwave'
            ];
            finalDevices = updatedDevices.map((d) => {
              if (d.type === 'speaker' && (d as SpeakerDevice).isOn && (d as SpeakerDevice).isPlaying) {
                const spk = d as SpeakerDevice;
                const currentIdx = tracks.indexOf(spk.currentTrack);
                const nextTrack = tracks[(currentIdx + 1) % tracks.length];
                changed = true;
                appendedLogs.push({
                  id: `log-ambient-spk-${Date.now()}`,
                  timestamp,
                  message: `Media update: Kitchen Hub transitioned track to "${nextTrack}"`,
                  type: 'info'
                });
                return { ...spk, currentTrack: nextTrack } as SpeakerDevice;
              }
              return d;
            });
          } else if (eventType === 2) {
            // Eco optimize or subtle light balance
            appendedLogs.push({
              id: `log-ambient-eco-${Date.now()}`,
              timestamp,
              message: 'Smart Nest system completed micro-dimming optimization. Eco-balance optimized.',
              type: 'success'
            });
            changed = true;
          }
        }

        // If vacuum went low-battery
        const oldVac = prev.devices.find(d => d.type === 'vacuum') as VacuumDevice;
        const newVac = finalDevices.find(d => d.type === 'vacuum') as VacuumDevice;
        if (oldVac && newVac && oldVac.status === 'cleaning' && newVac.status === 'returning') {
          appendedLogs.push({
            id: `log-critical-vac-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: 'Caution: Nest CleanVac return initiated. Physical battery low (10%).',
            type: 'warning'
          });
        }

        if (changed || appendedLogs.length > 0) {
          return {
            ...prev,
            devices: finalDevices,
            logs: [...appendedLogs, ...prev.logs].slice(0, 20)
          };
        }

        return prev;
      });
    }, 6000);

    return () => clearInterval(intervalId);
  }, [isAutoUpdating]);

  // Recalculate ECO indicator to reward lower power-state active values
  useEffect(() => {
    let activeScorePenalty = 0;
    state.devices.forEach((dev) => {
      if (dev.type === 'light' && (dev as LightDevice).isOn) {
        activeScorePenalty += ((dev as LightDevice).brightness / 100) * 4;
      }
      if (dev.type === 'thermostat' && (dev as ThermostatDevice).isOn) {
        const diff = Math.abs((dev as ThermostatDevice).targetTemp - 68);
        activeScorePenalty += diff * 1.5;
      }
      if (dev.type === 'speaker' && (dev as SpeakerDevice).isOn) {
        activeScorePenalty += 2;
      }
      if (dev.type === 'vacuum' && (dev as VacuumDevice).status === 'cleaning') {
        activeScorePenalty += 3;
      }
    });

    const calculatedScore = Math.max(50, Math.min(100, Math.round(95 - activeScorePenalty)));
    if (calculatedScore !== state.ecoScore) {
      setState(prev => ({ ...prev, ecoScore: calculatedScore }));
    }
  }, [state.devices, state.ecoScore]);

  // Handle manual update of single device
  const updateDevice = (id: string, updates: Partial<SmartDevice>) => {
    setState((prev) => {
      const updatedDevices = prev.devices.map((dev) => {
        if (dev.id === id) {
          const fresh = { ...dev, ...updates } as SmartDevice;
          return fresh;
        }
        return dev;
      });

      // Assemble a log entry stating what was tweaked
      const targetDevice = prev.devices.find(d => d.id === id);
      const logMessage = `Manual adjustment: ${targetDevice?.name} modified.`;
      
      return {
        ...prev,
        devices: updatedDevices,
        logs: [
          {
            id: `log-manual-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: logMessage,
            type: 'info'
          },
          ...prev.logs.slice(0, 15)
        ]
      };
    });
  };

  // Perform Gemini AI Assistant dynamic updates
  const submitAICommand = async (commandString: string) => {
    const textPrompt = commandString.trim();
    if (!textPrompt) return;

    if (textPrompt.toLowerCase().includes("auto connect") || textPrompt.toLowerCase().includes("discover devices")) {
      setInputText('');
      handleAutoConnect();
      return;
    }

    if (
      textPrompt.toLowerCase().includes("auto repair") || 
      textPrompt.toLowerCase().includes("repair devices") || 
      textPrompt.toLowerCase().includes("fix devices") || 
      textPrompt.toLowerCase().includes("system repair")
    ) {
      setInputText('');
      handleAutoRepair();
      return;
    }

    if (
      textPrompt.toLowerCase().includes("eco pilot") || 
      textPrompt.toLowerCase().includes("eco autopilot") || 
      textPrompt.toLowerCase().includes("optimize energy") || 
      textPrompt.toLowerCase().includes("minimize power")
    ) {
      setInputText('');
      handleEngageEcoPilot();
      return;
    }

    setIsPending(true);
    setLastSpeechError(null);
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt,
          devices: state.devices
        })
      });

      if (!response.ok) {
        const errObj = await response.json();
        throw new Error(errObj.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      console.log("Gemini parsed actions payload:", data);

      // Handle speech updating
      if (data.speech) {
        setAssistantSpeech(data.speech);
      }

      // Merge and execute mutational states
      setState((prev) => {
        let morphedDevices = [...prev.devices];
        const freshLogs: SmartActionLog[] = [];

        if (Array.isArray(data.mutations)) {
          morphedDevices = prev.devices.map((existingDevice) => {
            const mut = data.mutations.find((m: any) => m.id === existingDevice.id);
            if (mut) {
              return {
                ...existingDevice,
                ...mut
              } as SmartDevice;
            }
            return existingDevice;
          });
        }

        if (Array.isArray(data.logs)) {
          data.logs.forEach((logText: string, idx: number) => {
            freshLogs.push({
              id: `log-ai-${Date.now()}-${idx}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: logText,
              type: 'success'
            });
          });
        }

        // Add energy recommendations to log if found
        if (data.insights) {
          freshLogs.unshift({
            id: `log-ai-insight-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: `Insight: ${data.insights}`,
            type: 'warning'
          });
        }

        return {
          ...prev,
          devices: morphedDevices,
          logs: [...freshLogs, ...prev.logs].slice(0, 20)
        };
      });

    } catch (err: any) {
      console.error(err);
      setLastSpeechError(err.message || "Failed to contact Nest AI node. Ensure GEMINI_API_KEY is active.");
    } finally {
      setIsPending(false);
      setInputText('');
    }
  };

  // Specific routine quick triggers (triggers a quick mock or specific smart command)
  const executeRoutine = (routineName: string) => {
    let commandText = "";
    if (routineName.includes("Good Night") || routineName.includes("Night Shift")) {
      commandText = "I am going to bed now. Make the house secure and comfortable.";
    } else if (routineName.includes("Movie") || routineName.includes("Cinema")) {
      commandText = "Set up movie night mode in the living room.";
    } else if (routineName.includes("Away") || routineName.includes("Leave")) {
      commandText = "I'm leaving the house. Lock everything, turn off appliances and lights, and deploy the clean vacuum.";
    } else if (routineName.includes("Focus") || routineName.includes("Morning")) {
      commandText = "Set up focused workspace: warm master bedroom lights, cool kitchen lights off, speak to comfort.";
    }

    if (commandText) {
      submitAICommand(commandText);
    }
  };

  // Reset Home State to Defaults
  const resetHandler = () => {
    setState({
      devices: INITIAL_DEVICES,
      logs: [
        { id: `log-${Date.now()}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), message: 'Smart Home Hub successfully factory reset.', type: 'warning' }
      ],
      routines: INITIAL_ROUTINES,
      ecoScore: 90
    });
    setAssistantSpeech("Home environment safely reset. Ready for your instructions.");
    setLastSpeechError(null);
  };

  // Rooms lists for the filters
  const roomsList: string[] = ['All', ...Array.from(new Set(state.devices.map(d => d.room)))].map(r => String(r));

  const filteredDevices = roomFilter === 'All'
    ? state.devices
    : state.devices.filter(d => d.room === roomFilter);

  const getRoomMeta = (room: string) => {
    switch (room.toLowerCase()) {
      case 'living room': return { icon: '🛋️', color: 'from-orange-500/20 to-amber-500/10 border-orange-500/25 text-orange-400 font-bold' };
      case 'kitchen': return { icon: '🍳', color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/25 text-indigo-400 font-bold' };
      case 'bedroom': return { icon: '🛏️', color: 'from-pink-500/20 to-rose-500/10 border-pink-500/35 text-pink-400 font-bold' };
      case 'entrance': return { icon: '🚪', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/25 text-emerald-400 font-bold' };
      case 'backyard': return { icon: '🌳', color: 'from-green-500/20 to-emerald-500/10 border-green-500/25 text-green-400 font-bold' };
      default: return { icon: '🏷️', color: 'from-indigo-500/15 via-purple-500/10 to-transparent border-indigo-500/20 text-indigo-300 font-bold' };
    }
  };

  const getRoomDeviceCount = (room: string) => {
    const roomDevs = state.devices.filter(d => d.room === room);
    const activeCount = roomDevs.filter(d => {
      if (d.type === 'light') return (d as LightDevice).isOn;
      if (d.type === 'thermostat') return (d as ThermostatDevice).isOn;
      if (d.type === 'speaker') return (d as any).isOn;
      if (d.type === 'vacuum') return (d as VacuumDevice).status === 'cleaning';
      if (d.type === 'camera') return (d as any).isStreaming;
      return false;
    }).length;
    return { total: roomDevs.length, active: activeCount };
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans overflow-x-hidden relative flex flex-col justify-between selection:bg-indigo-500/35 selection:text-white pb-6">
      
      {/* Background Mesh Gradients - Frosted Glass Theme */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 px-6 py-5 md:px-10 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            {/* Dynamic visual indicator mimicking Google Nest color ring */}
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-red-500 to-yellow-500 p-0.5 shadow-md flex items-center justify-center animate-spin-slow">
              <div className="w-5 h-5 bg-[#0a0a0b] rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-gradient-to-tr from-cyan-400 to-purple-400 rounded-full" />
              </div>
            </div>
            <span className="text-xl font-medium tracking-tight">
              Google Nest <span className="font-light text-white/60">AI Hub</span>
            </span>
          </div>

          {/* Quick Room Fast Selector */}
          <div className="hidden lg:flex bg-white/5 border border-white/10 rounded-xl p-0.5 gap-1">
            {roomsList.map((room) => (
              <button
                key={room}
                onClick={() => setRoomFilter(room)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  roomFilter === room
                    ? 'bg-white/15 text-white shadow-sm font-bold border border-white/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handleAutoConnect()}
            disabled={isAutoConnecting}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
              isAutoConnecting 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/20 cursor-pointer active:scale-95'
            }`}
            title="Auto Connect discovered local smart home nodes"
          >
            <Radio className={`w-3.5 h-3.5 ${isAutoConnecting ? 'animate-pulse' : ''}`} />
            {isAutoConnecting ? 'Connecting...' : 'Auto Connect'}
          </button>

          <button
            onClick={() => handleAutoRepair()}
            disabled={isAutoRepairing || isAutoConnecting}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
              isAutoRepairing 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse' 
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/20 cursor-pointer active:scale-95'
            }`}
            title="Perform complete automated Nest device repair & diagnostics"
          >
            <Wrench className={`w-3.5 h-3.5 ${isAutoRepairing ? 'animate-spin' : ''}`} />
            {isAutoRepairing ? 'Repairing...' : 'Auto Repair'}
          </button>

          <button
            onClick={() => setIsAutoUpdating(!isAutoUpdating)}
            className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all outline-none ${
              isAutoUpdating 
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-white/5 text-white/50 border-white/10'
            }`}
            title="Toggle state simulator auto-updates"
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAutoUpdating ? 'bg-indigo-400 animate-pulse' : 'bg-white/30'}`} />
            Auto Update: {isAutoUpdating ? 'Active' : 'Paused'}
          </button>

          <button
            onClick={resetHandler}
            title="Reset simulated environment to start layout"
            className="p-2 border border-white/15 bg-white/5 hover:bg-white/10 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium text-white/80"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white/60" />
            Hub Reset
          </button>
          
          <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full text-[10px] uppercase tracking-widest text-indigo-300 font-extrabold flex items-center gap-1.5 shadow-glow">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Gemini Nest Pro
          </div>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <main className="relative z-10 flex-grow grid grid-cols-1 xl:grid-cols-4 gap-6 p-4 md:p-8 max-w-[1700px] w-full mx-auto">
        
        {/* Left Side: Environment Control, Eco & Routines */}
        <section className="xl:col-span-1 flex flex-col gap-6" id="left-sidebar">
          
          {/* Weather / Active Micro Climate */}
          <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/10 border border-white/10 shadow-lg relative overflow-hidden group">
            {/* Ambient heat map indicator inside */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-[40px] group-hover:bg-orange-500/20 transition-all duration-500" />
            
            <h2 className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Environment Stats
            </h2>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-5xl font-light tracking-tighter">72<span className="text-2xl text-white/40 font-normal">°F</span></p>
                <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                  <span>Nest Indoor Target Optimal</span>
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Clean Air
                </span>
                <p className="text-[10px] text-white/40 mt-1">94% Eco Efficiency</p>
              </div>
            </div>
          </div>

          {/* Preset Nest Routines */}
          <div className="flex-grow p-6 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5" />
                  Active Automations
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded-full text-white/60 font-semibold uppercase font-mono tracking-widest">
                  Live
                </span>
              </div>

              <div className="space-y-3.5">
                {state.routines.map((routine) => {
                  const getIcon = () => {
                    if (routine.name.includes("Morning")) return <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500"><Sparkles className="w-5 h-5" /></div>;
                    if (routine.name.includes("Sleep") || routine.name.includes("Night")) return <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Moon className="w-5 h-5" /></div>;
                    return <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Film className="w-5 h-5" /></div>;
                  };

                  return (
                    <div 
                      key={routine.id}
                      onClick={() => executeRoutine(routine.name)}
                      className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer hover:-translate-y-0.5 shadow-sm"
                      id={`routine-card-${routine.id}`}
                    >
                      {getIcon()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white/90 group-hover:text-white truncate">{routine.name}</p>
                          <span className="text-[9px] font-mono text-white/40">{routine.time}</span>
                        </div>
                        <p className="text-xs text-white/40 mt-0.5 group-hover:text-white/60 truncate">
                          {routine.actions[0]}. ({routine.actions.length} commands)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <span className="text-[10px] text-white/45 uppercase tracking-widest block mb-2.5 font-bold">Interactive Nest commands</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-white/80">
                <button 
                  onClick={() => executeRoutine("Good Night")}
                  className="px-3 py-2 bg-purple-900/35 border border-purple-500/20 rounded-xl text-center hover:bg-purple-900/50 transition-colors cursor-pointer"
                >
                  💤 Sleep Mode
                </button>
                <button 
                  onClick={() => executeRoutine("Movie Theater")}
                  className="px-3 py-2 bg-indigo-900/35 border border-indigo-500/20 rounded-xl text-center hover:bg-indigo-900/50 transition-colors cursor-pointer"
                >
                  🎬 Cinema Mode
                </button>
              </div>
            </div>
          </div>

          {/* Expandable IoT Custom Device Provisioner */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 shadow-lg relative overflow-hidden">
            <button
              onClick={() => setIsProvisioningOpen(!isProvisioningOpen)}
              className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${isProvisioningOpen ? 'rotate-45' : ''}`} />
                <h2 className="text-xs font-bold text-white/70 uppercase tracking-wider">Install IoT Custom Node</h2>
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold uppercase tracking-widest">
                {isProvisioningOpen ? 'Close' : 'Install'}
              </span>
            </button>

            <AnimatePresence>
              {isProvisioningOpen && (
                <motion.form
                  onSubmit={handleProvisionNode}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden space-y-4 text-xs"
                >
                  <p className="text-[11px] text-white/55 leading-normal">
                    Register a new smart appliance directly into your active Google Nest mesh state machine.
                  </p>
                  
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-white/60 font-semibold block">Device Node Name</label>
                    <input
                      type="text"
                      required
                      value={newNodeName}
                      onChange={(e) => setNewNodeName(e.target.value)}
                      placeholder="e.g. Master Bedroom Purifier, Garage Gate"
                      className="w-full bg-[#0a0a0b]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-white/60 font-semibold block">Category</label>
                      <select
                        value={newNodeType}
                        onChange={(e: any) => setNewNodeType(e.target.value)}
                        className="w-full bg-[#0a0a0b]/80 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="light">💡 Light Bulbs</option>
                        <option value="thermostat">🌡️ Thermostat</option>
                        <option value="lock">🔒 Security Lock</option>
                        <option value="speaker">🔊 Speaker Hub</option>
                        <option value="vacuum">🧹 Vacuum Sweep</option>
                        <option value="camera">📹 Security Cam</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-white/60 font-semibold block">Room Location</label>
                      <select
                        value={newNodeRoom}
                        onChange={(e) => setNewNodeRoom(e.target.value)}
                        className="w-full bg-[#0a0a0b]/80 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="Living Room">Living Room</option>
                        <option value="Kitchen">Kitchen</option>
                        <option value="Bedroom">Bedroom</option>
                        <option value="Entrance">Entrance</option>
                        <option value="Backyard">Backyard</option>
                        <option value="Custom">Custom...</option>
                      </select>
                    </div>
                  </div>

                  {newNodeRoom === 'Custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5 flex flex-col"
                    >
                      <label className="text-white/60 font-semibold block">Custom Room Name</label>
                      <input
                        type="text"
                        required
                        value={newNodeCustomRoom}
                        onChange={(e) => setNewNodeCustomRoom(e.target.value)}
                        placeholder="e.g. Nursery, Home Office, Gym"
                        className="w-full bg-[#0a0a0b]/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/60"
                      />
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all text-xs font-bold rounded-xl text-center cursor-pointer text-white shadow-md shadow-indigo-500/10"
                  >
                    Deploy Node Network
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Center: Device Cards & Live Operations Dashboard */}
        <section className="xl:col-span-2 flex flex-col gap-6">
          
          {/* High Priority Metrics banner */}
          <HomeMetrics devices={state.devices} ecoScore={state.ecoScore} />

          {/* Real-time Discovery & Connection Status Banner */}
          <AnimatePresence>
            {isAutoConnecting && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden mb-2"
              >
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Discovering Appliances...</span>
                      <span className="text-[10px] text-white/40 font-mono animate-pulse">Nest AutoConnect Active</span>
                    </div>
                    <p className="text-xs text-white/80 mt-1 font-mono truncate font-semibold">
                      {discoveryStep || 'Searching for wireless local devices...'}
                    </p>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-pulse-slow width-full-animated" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Automated Repair Status Banner */}
          <AnimatePresence>
            {isAutoRepairing && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden mb-2"
              >
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                    <Wrench className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Heuristic Diagnostic Repair...</span>
                      <span className="text-[10px] text-white/40 font-mono animate-pulse">Nest AutoRepair Active</span>
                    </div>
                    <p className="text-xs text-white/80 mt-1 font-mono truncate font-semibold">
                      {repairStep || 'Diagnosing device connections and states...'}
                    </p>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full animate-pulse-slow" style={{ width: '85%' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Eco Analytics & Footprint Optimizer Card */}
          <EnergyHub
            devices={state.devices}
            ecoScore={state.ecoScore}
            totalLoadWatts={totalLoadWatts}
            onEngageEcoPilot={handleEngageEcoPilot}
          />

          {/* Interactive Room Grid / Live Blueprint Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/55">Active Blueprints Room Grid</span>
              <span className="text-[10px] text-white/40 font-mono">Click room cell to filter</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {['All', ...roomsList.filter(r => r !== 'All')].map((room: string) => {
                const isSelected = roomFilter === room;
                const meta = getRoomMeta(room);
                const stats = room === 'All' 
                  ? { total: state.devices.length, active: state.devices.filter(d => {
                      if (d.type === 'light') return (d as LightDevice).isOn;
                      if (d.type === 'thermostat') return (d as ThermostatDevice).isOn;
                      if (d.type === 'speaker') return (d as any).isOn;
                      if (d.type === 'vacuum') return (d as VacuumDevice).status === 'cleaning';
                      if (d.type === 'camera') return (d as any).isStreaming;
                      return false;
                    }).length }
                  : getRoomDeviceCount(room);

                return (
                  <div
                    key={room}
                    onClick={() => setRoomFilter(room)}
                    className={`group relative rounded-2xl p-3 border overflow-hidden cursor-pointer transition-all duration-300 transform active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? `bg-[#18181b] border-indigo-500/40 text-white shadow-lg shadow-indigo-500/5`
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl select-none">{meta.icon}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${stats.active > 0 ? 'bg-indigo-400 animate-pulse' : 'bg-transparent'}`} />
                    </div>

                    <div className="mt-3.5">
                      <p className={`text-xs font-bold truncate transition-colors ${isSelected ? 'text-indigo-300' : 'text-white/80 group-hover:text-white'}`}>{room}</p>
                      <p className="text-[10px] text-white/45 mt-0.5 font-mono">
                        {stats.active > 0 ? `${stats.active} Active` : `${stats.total} Nodes`}
                      </p>
                    </div>

                    {/* Tiny responsive glowing bottom indicator strip */}
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 ${isSelected ? 'bg-indigo-400' : 'bg-transparent group-hover:bg-white/20'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub Header for Devices container */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Connected Appliances Grid
            </h2>

            {/* Quick Room filter for tablet/mobile view */}
            <div className="flex lg:hidden bg-white/5 border border-white/10 rounded-xl p-0.5 gap-1">
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="bg-transparent text-white text-xs font-bold py-1 px-2 border-0 outline-none focus:ring-0"
              >
                {roomsList.map(r => (
                  <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                ))}
              </select>
            </div>
            
            <span className="text-xs text-white/40">Showing {filteredDevices.length} devices</span>
          </div>

          {/* Interactive Responsive Grid of Smart Devices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredDevices.map((device) => (
                <DeviceCard 
                  key={device.id} 
                  device={device} 
                  onUpdate={updateDevice} 
                />
              ))}
            </AnimatePresence>
          </div>
          
        </section>

        {/* Right Side: Gemini Nest Assistant chat interface and live timelines */}
        <section className="xl:col-span-1 flex flex-col gap-6" id="right-sidebar">
          
          <div className="flex-grow flex flex-col rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg overflow-hidden relative">
            
            {/* Header speech bubble */}
            <div className="p-5 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative w-2 h-2 rounded-full bg-indigo-400">
                  <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping" />
                </div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/70">Google Nest Assistant</h2>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/25 text-indigo-300 font-extrabold rounded-lg font-mono">
                GEMINI 3.5
              </span>
            </div>

            {/* Assistant Speech Card */}
            <div className="p-5 bg-gradient-to-r from-indigo-500/10 via-teal-500/5 to-transparent border-b border-white/5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-0.5 flex-shrink-0 shadow-lg flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-indigo-300" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/50 block font-semibold mb-0.5">Nest Voice Broadcast</span>
                {isPending ? (
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" />
                    <span className="text-[10px] text-white/40 ml-1.5 italic font-mono">Reconfiguring smart nodes...</span>
                  </div>
                ) : (
                  <p className="text-xs text-white/95 leading-relaxed font-sans font-medium italic">
                    "{assistantSpeech}"
                  </p>
                )}
                {lastSpeechError && (
                  <p className="text-[11px] text-rose-400 bg-rose-950/30 px-2 py-1.5 rounded-lg border border-rose-900/30 mt-2 font-mono">
                    ⚠️ {lastSpeechError}
                  </p>
                )}
              </div>
            </div>

            {/* Scrollable smart timelines / logs of device modifications */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[300px] xl:max-h-[360px] scrollbar-thin scrollbar-thumb-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-extrabold flex items-center gap-1">
                <History className="w-3 h-3 text-white/40" />
                Control logs
              </span>
              
              <div className="space-y-3 font-mono text-[11px]">
                {state.logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors border ${
                      log.type === 'success' 
                        ? 'bg-indigo-950/20 border-indigo-900/30 text-indigo-300' 
                        : log.type === 'warning'
                          ? 'bg-amber-950/20 border-amber-900/30 text-amber-300'
                          : log.type === 'alert'
                            ? 'bg-rose-950/20 border-rose-900/30 text-rose-300'
                            : 'bg-white/5 border-white/5 text-white/70'
                    }`}
                  >
                    <span className="text-[9px] text-white/40 shrink-0 select-none mt-0.5">{log.timestamp}</span>
                    <p className="leading-normal flex-1 truncate-2-lines">{log.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Suggestions to ask Google Assistant */}
            <div className="px-4 py-2 border-t border-white/5 bg-white/5 flex gap-2 overflow-x-auto scrollbar-none items-center">
              <span className="text-[9px] text-white/40 uppercase tracking-widest shrink-0 font-bold">Ask:</span>
              {[
                "Good night routine",
                "Dim lights 30%",
                "Warm the house",
                "Clean up downstairs",
                "Lock all doors"
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInputText(suggestion);
                    submitAICommand(suggestion);
                  }}
                  className="px-2.5 py-1 text-[10px] whitespace-nowrap bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-full transition-all text-white/80"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Interactive text command line input footer */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAICommand(inputText);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isPending}
                  placeholder={isPending ? "Configuring space..." : "Control home via Nest AI..."}
                  className="w-full bg-[#0a0a0b]/60 border border-white/15 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-white placeholder-white/45 focus:outline-none focus:border-indigo-400/70 focus:ring-1 focus:ring-indigo-400/30 transition-all shadow-inner"
                />
                <button
                  id="submit-ai-prompt"
                  type="submit"
                  disabled={isPending || !inputText.trim()}
                  className="absolute right-2 px-3.5 py-2 hover:bg-white/10 active:scale-95 disabled:hover:bg-transparent rounded-xl transition-all font-bold text-xs flex items-center gap-1 bg-[#1c1c1f]/80 disabled:opacity-40 text-indigo-400 hover:text-indigo-300"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            
          </div>
          
          {/* Quick interactive tips block */}
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
              <HelpIcon className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/90">AI Multi-Mutation Tip</p>
              <p className="text-[10px] text-white/50">Typing commands like "Movie mood, eco heat, lock bedroom" modifies all three states instantly.</p>
            </div>
          </div>

        </section>

      </main>

      {/* Bottom Scene Switcher Preset Panel */}
      <footer className="relative z-10 px-8 py-4.5 mx-auto max-w-[1700px] w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-white/40" />
          <span className="text-xs font-mono text-white/40 tracking-wider">Quick Scene Presets:</span>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-none py-1">
          {[
            { name: "Focus Mode", color: "bg-orange-500" },
            { name: "Cinema Movie night", color: "bg-cyan-500" },
            { name: "Night Shift comfort", color: "bg-purple-500" },
            { name: "Away from Home", color: "bg-indigo-500" }
          ].map((scene) => (
            <div 
              key={scene.name}
              onClick={() => executeRoutine(scene.name)}
              className="px-4 py-2 bg-white/10 border border-white/20 hover:border-white/40 rounded-xl flex items-center gap-2.5 cursor-pointer hover:bg-white/15 active:bg-white/20 transition-all font-mono"
            >
              <div className={`w-2 h-2 rounded-full ${scene.color}`} />
              <span className="text-xs font-bold uppercase tracking-widest text-white/90">{scene.name.split(" ")[0]} Mode</span>
            </div>
          ))}
        </div>

        <span className="text-[10px] font-mono text-white/30">
          Google Home AI Dashboard • Secured by Gilbert Algordo
        </span>
      </footer>

    </div>
  );
}
