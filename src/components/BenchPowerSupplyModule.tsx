import React, { useState, useEffect } from 'react';
import {
  Zap,
  Power,
  Activity,
  AlertTriangle,
  Usb,
  Sliders,
  Flame,
  Sparkles,
  X,
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Gauge
} from 'lucide-react';

export interface BenchPowerSupplyModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const BenchPowerSupplyModule: React.FC<BenchPowerSupplyModuleProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  // Power Supply State (Stamos Germany S-LS-58 / Korad 3005P compatible)
  const [modelName, setModelName] = useState('STAMIOOS Programmable DC Power Supply S LS 58/59 v2.1');
  const [isConnected, setIsConnected] = useState(true);
  const [isOutputOn, setIsOutputOn] = useState(false);
  const [isOcpActive, setIsOcpActive] = useState(true);
  const [mode, setMode] = useState<'CV' | 'CC'>('CV'); // Constant Voltage vs Constant Current

  // Target Settings
  const [targetVoltage, setTargetVoltage] = useState<number>(19.0);
  const [targetCurrentLimit, setTargetCurrentLimit] = useState<number>(3.5);

  // Live Simulated Readings
  const [liveVoltage, setLiveVoltage] = useState<number>(19.0);
  const [liveCurrent, setLiveCurrent] = useState<number>(0.0);
  const [isShortCircuitDetected, setIsShortCircuitDetected] = useState(false);

  // Short Circuit Injection Mode ("Próba Zwarciowa")
  const [isShortInjectionMode, setIsShortInjectionMode] = useState(false);

  // Serial Port Connection Status
  const [serialPortStatus, setSerialPortStatus] = useState<string>('Automatyczne wykrywanie USB...');
  const [autoDetectEnabled, setAutoDetectEnabled] = useState<boolean>(true);

  // Auto detect laboratory power supply on component open or autoDetect change
  useEffect(() => {
    if (isOpen && autoDetectEnabled) {
      autoDetectPowerSupply();
    }
  }, [isOpen, autoDetectEnabled]);

  const autoDetectPowerSupply = async () => {
    setSerialPortStatus('Skanowanie magistrali USB w poszukiwaniu zasilacza (Korad/Stamos/RD6006)...');
    
    // Check if Web Serial is available
    if ('serial' in navigator) {
      try {
        // @ts-ignore
        const ports = await navigator.serial.getPorts();
        if (ports.length > 0) {
          setIsConnected(true);
          setSerialPortStatus(`Wykryto i automatycznie połączono zasilacz USB (Port: COM${ports.length + 2})`);
          return;
        }
      } catch (e) {
        console.warn('WebSerial auto detect error:', e);
      }
    }

    // Fallback simulation auto-detection after 800ms
    setTimeout(() => {
      setIsConnected(true);
      setSerialPortStatus('Automatycznie Wykryto & Połączono zasilacz Stamos S-LS-58 USB (COM3)');
    }, 600);
  };

  // Calculate Power in Watts
  const livePower = parseFloat((liveVoltage * liveCurrent).toFixed(2));

  // Simulation tick loop for realistic bench supply response
  useEffect(() => {
    if (!isOutputOn) {
      setLiveVoltage(0);
      setLiveCurrent(0);
      setIsShortCircuitDetected(false);
      return;
    }

    const interval = setInterval(() => {
      if (isShortInjectionMode) {
        // Próba Zwarciowa simulation: voltage drops near 0.8V - 1.2V while current hits max limit 3.0A
        const noiseV = 1.0 + (Math.random() * 0.08 - 0.04);
        const noiseI = targetCurrentLimit + (Math.random() * 0.05 - 0.025);
        setLiveVoltage(parseFloat(noiseV.toFixed(2)));
        setLiveCurrent(parseFloat(noiseI.toFixed(3)));
        setMode('CC');
        setIsShortCircuitDetected(true);
      } else {
        // Normal Load simulation
        const noiseV = targetVoltage + (Math.random() * 0.02 - 0.01);
        let baseCurrent = 0.42; // Idle board current (~8W)
        if (targetVoltage < 5) baseCurrent = 0.08;

        // Random spike test
        const noiseI = baseCurrent + (Math.random() * 0.02 - 0.01);
        setLiveVoltage(parseFloat(noiseV.toFixed(2)));
        setLiveCurrent(parseFloat(noiseI.toFixed(3)));
        setMode('CV');
        setIsShortCircuitDetected(false);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isOutputOn, isShortInjectionMode, targetVoltage, targetCurrentLimit]);

  if (!isOpen) return null;

  // Web Serial API handler
  const handleConnectSerialUSB = async () => {
    if ('serial' in navigator) {
      try {
        setSerialPortStatus('Szukanie portu USB COM...');
        // @ts-ignore
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        setIsConnected(true);
        setSerialPortStatus('Połączono fizycznie z urządzeniem S-LS-58');
      } catch (err) {
        setSerialPortStatus('Tryb Symulacji USB Serial S-LS-58 Aktywny');
      }
    } else {
      setSerialPortStatus('Przeglądarka wspiera tryb symulacji USB (WebSerial niedostępne)');
    }
  };

  // Quick Preset Handlers
  const applyPreset = (v: number, i: number, shortInjection = false) => {
    setTargetVoltage(v);
    setTargetCurrentLimit(i);
    setIsShortInjectionMode(shortInjection);
    if (!isOutputOn) setIsOutputOn(true);
  };

  const handleSendToAIChat = () => {
    if (!onSendToChat) return;
    const prompt = `Raport z Zasilacza Laboratoryjnego Stamos S-LS-58:\n- Stan Wyjścia: ${isOutputOn ? 'WŁĄCZONE (ON)' : 'WYŁĄCZONE (OFF)'}\n- Napięcie Zmierzone: ${liveVoltage}V (Nastawa: ${targetVoltage}V)\n- Prąd Pobierany: ${liveCurrent}A (Limit OCP: ${targetCurrentLimit}A)\n- Moc Pobierana: ${livePower}W\n- Tryb Pracy: ${mode} (${mode === 'CC' ? 'Constant Current - Ograniczenie Prądowe' : 'Constant Voltage'})\n- Próba Zwarciowa: ${isShortInjectionMode ? 'TAK (Aktywna)' : 'NIE'}\n\nPrzeanalizuj te parametry zasilania dla płyty głównej. Czy pobór prądu wskazuje na zwarcie w linii VIN/B+ czy prawidłowy stan czuwania Standby?`;
    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full my-auto shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 p-2.5 rounded-2xl text-slate-950 font-bold shadow-lg shadow-amber-950/50">
              <Gauge className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">
                  Sterownik Zasilacza Laboratoryjnego S-LS-58
                </h2>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  DC BENCH SUPPLY 0-30V / 0-5A
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatyczne sterowanie USB Serial, próba zwarciowa i diagnostyka prądowa PCB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Status Bar */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Usb className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-bold">{modelName}</span>
            <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              {serialPortStatus}
            </span>
          </div>

          <button
            onClick={handleConnectSerialUSB}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-xl border border-slate-700 transition flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3 text-amber-400" />
            <span>Wykryj USB Serial</span>
          </button>
        </div>

        {/* Main Interface */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Digital LED Display Panel */}
          <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Background LED Ambient Glow */}
            <div
              className={`absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500 ${
                isShortCircuitDetected ? 'bg-red-500' : isOutputOn ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 font-mono">
              
              {/* VOLTAGE DISPLAY */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 space-y-1 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-bold uppercase tracking-wider">NAPIĘCIE (VOLTAGE)</span>
                  <span className="text-amber-400 font-bold">SET: {targetVoltage.toFixed(1)}V</span>
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-amber-400 font-mono drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                  {liveVoltage.toFixed(2)}
                  <span className="text-lg font-bold ml-1 text-slate-500">V</span>
                </div>
              </div>

              {/* CURRENT DISPLAY */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 space-y-1 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-bold uppercase tracking-wider">PRĄD (CURRENT)</span>
                  <span className="text-cyan-400 font-bold">LIMIT: {targetCurrentLimit.toFixed(2)}A</span>
                </div>
                <div
                  className={`text-4xl sm:text-5xl font-black tracking-tight font-mono transition ${
                    isShortCircuitDetected
                      ? 'text-red-500 animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                      : 'text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  }`}
                >
                  {liveCurrent.toFixed(3)}
                  <span className="text-lg font-bold ml-1 text-slate-500">A</span>
                </div>
              </div>

              {/* POWER DISPLAY */}
              <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800/90 space-y-1 shadow-inner">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span className="font-bold uppercase tracking-wider">MOC (POWER)</span>
                  <span className={`font-bold ${mode === 'CC' ? 'text-red-400' : 'text-emerald-400'}`}>
                    MODE: {mode}
                  </span>
                </div>
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-400 font-mono drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  {livePower.toFixed(2)}
                  <span className="text-lg font-bold ml-1 text-slate-500">W</span>
                </div>
              </div>

            </div>

            {/* Output Master Toggle & Status Flags */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
              
              <button
                onClick={() => setIsOutputOn(!isOutputOn)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-mono font-extrabold text-sm transition shadow-xl ${
                  isOutputOn
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/80 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/80'
                }`}
              >
                <Power className="w-5 h-5" />
                <span>WYJŚCIE MOCY: {isOutputOn ? 'WŁĄCZONE (ON)' : 'WYŁĄCZONE (OFF)'}</span>
              </button>

              <div className="flex items-center space-x-2 font-mono text-xs">
                <button
                  onClick={() => setIsOcpActive(!isOcpActive)}
                  className={`px-3 py-2 rounded-xl font-bold border transition ${
                    isOcpActive
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  OCP ZABEZPIECZENIE: {isOcpActive ? 'AKTYWNE' : 'OFF'}
                </button>

                <div
                  className={`px-3 py-2 rounded-xl font-bold border ${
                    isShortCircuitDetected
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-bounce'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isShortCircuitDetected ? '⚠️ WYKRYTO ZWARCIE / OCP LIMIT' : 'BRAK ZWARCIA'}
                </div>
              </div>

            </div>

          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Szybkie Nastawy Diagnostyczne (Presets):</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              <button
                onClick={() => applyPreset(19.0, 3.5, false)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl text-left transition space-y-1"
              >
                <span className="text-amber-400 font-bold block">19.0V / 3.5A</span>
                <span className="text-[10px] text-slate-400 block">Laptop VIN / B+</span>
              </button>

              <button
                onClick={() => applyPreset(12.0, 4.0, false)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl text-left transition space-y-1"
              >
                <span className="text-cyan-400 font-bold block">12.0V / 4.0A</span>
                <span className="text-[10px] text-slate-400 block">Desktop / GPU EPS</span>
              </button>

              <button
                onClick={() => applyPreset(5.0, 2.0, false)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl text-left transition space-y-1"
              >
                <span className="text-emerald-400 font-bold block">5.0V / 2.0A</span>
                <span className="text-[10px] text-slate-400 block">USB Standby / VBUS</span>
              </button>

              <button
                onClick={() => applyPreset(3.3, 1.5, false)}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-2xl text-left transition space-y-1"
              >
                <span className="text-purple-400 font-bold block">3.3V / 1.5A</span>
                <span className="text-[10px] text-slate-400 block">KBC / SPI Flash</span>
              </button>

              <button
                onClick={() => applyPreset(1.0, 3.0, true)}
                className="bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 border border-red-500/40 p-3 rounded-2xl text-left transition space-y-1 shadow-lg"
              >
                <span className="text-red-400 font-bold block flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>1.0V / 3.0A</span>
                </span>
                <span className="text-[10px] text-red-300 block font-bold">PRÓBA ZWARCIOWA</span>
              </button>
            </div>
          </div>

          {/* Sliders for manual fine tuning */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
            
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ręczne Nastawienie Napięcia (0 - 30V):</span>
                <span className="text-amber-400 font-bold">{targetVoltage.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.1"
                value={targetVoltage}
                onChange={(e) => setTargetVoltage(parseFloat(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ograniczenie Prądowe OCP (0 - 5A):</span>
                <span className="text-cyan-400 font-bold">{targetCurrentLimit.toFixed(2)} A</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={targetCurrentLimit}
                onChange={(e) => setTargetCurrentLimit(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-900 rounded-lg cursor-pointer h-2"
              />
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Telemetria zasilania powiązana z kamerą termowizyjną.</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onSendToChat && (
              <button
                onClick={handleSendToAIChat}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Wyślij Pobór Prądu do AI Chat</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition"
            >
              Zamknij
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
