import React, { useState, useEffect } from 'react';
import {
  Flame,
  Play,
  Square,
  RotateCcw,
  Sliders,
  Thermometer,
  Activity,
  Cpu,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload,
  X,
  Wifi,
  Terminal,
  Clock,
  Zap,
  Sparkles,
  Database,
  Search,
  Check,
  ArrowRight
} from 'lucide-react';

interface Ir6500BgaStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface ProfileStep {
  id: number;
  name: string;
  targetTemp: number; // °C
  rampRate: number; // °C/sec
  holdTime: number; // seconds
}

export interface MotherboardBgaPreset {
  id: string;
  boardModel: string;
  chipsetName: string;
  packageType: string;
  solderType: string;
  pcbThicknessMm: number;
  layersCount: number;
  steps: ProfileStep[];
  description: string;
}

export const BGA_MOTHERBOARD_PRESETS: MotherboardBgaPreset[] = [
  {
    id: 'mb-macbook-820-00850',
    boardModel: 'Apple MacBook Pro A1707 (820-00850)',
    chipsetName: 'Intel CPU + Radeon Pro GPU BGA',
    packageType: 'FCBGA1528 / BGA1364 (Gruba płytka 1.6mm)',
    solderType: 'SAC305 Lead-Free (217°C Melting)',
    pcbThicknessMm: 1.6,
    layersCount: 12,
    steps: [
      { id: 1, name: 'Preheat Wstępny (Podgrzewanie B+)', targetTemp: 160, rampRate: 1.2, holdTime: 100 },
      { id: 2, name: 'Wygrzewanie (Soak Zone Apple PCB)', targetTemp: 190, rampRate: 1.0, holdTime: 75 },
      { id: 3, name: 'Peak Reflow (Rozpływ Kul BGA)', targetTemp: 240, rampRate: 2.2, holdTime: 50 },
      { id: 4, name: 'Kontrolowane Chłodzenie (Cooling)', targetTemp: 50, rampRate: 2.5, holdTime: 120 },
    ],
    description: 'Profil zoptymalizowany dla 12-warstwowych laminatów Apple o wysokiej pojemności cieplnej. Wymaga mocniejszego dolnego podgrzewacza.'
  },
  {
    id: 'mb-asus-rog-gl552',
    boardModel: 'ASUS ROG GL552VW / FX506 (X550VX)',
    chipsetName: 'NVIDIA GTX 960M / RTX 3060 BGA',
    packageType: 'BGA1364 / N16E-GR-A1',
    solderType: 'SAC305 Lead-Free (217°C Melting)',
    pcbThicknessMm: 1.2,
    layersCount: 8,
    steps: [
      { id: 1, name: 'Preheat (Podgrzew Wstępny)', targetTemp: 150, rampRate: 1.5, holdTime: 90 },
      { id: 2, name: 'Soak Zone (Wygrzewanie Flux)', targetTemp: 180, rampRate: 1.0, holdTime: 60 },
      { id: 3, name: 'Reflow (Topnienie Kul BGA)', targetTemp: 235, rampRate: 2.0, holdTime: 45 },
      { id: 4, name: 'Chłodzenie Kontrolowane', targetTemp: 50, rampRate: 2.5, holdTime: 110 },
    ],
    description: 'Zbalansowany profil dla płyt gamingowych ASUS. Zapobiega wygięciu laminatu w strefie GPU.'
  },
  {
    id: 'mb-lenovo-nm-a271',
    boardModel: 'Lenovo ThinkPad / Legion (NM-A271 / LA-C921P)',
    chipsetName: 'Intel Core i7-6700HQ + PCH',
    packageType: 'BGA1440 / FCBGA',
    solderType: 'Sn63/Pb37 Leaded (183°C Melting)',
    pcbThicknessMm: 1.0,
    layersCount: 10,
    steps: [
      { id: 1, name: 'Preheat Wstępny (Ołowiany Sn63)', targetTemp: 130, rampRate: 1.5, holdTime: 80 },
      { id: 2, name: 'Wygrzewanie (Soak Zone)', targetTemp: 160, rampRate: 1.0, holdTime: 50 },
      { id: 3, name: 'Reflow Sn63 (Topnienie 183°C)', targetTemp: 215, rampRate: 1.8, holdTime: 40 },
      { id: 4, name: 'Chłodzenie', targetTemp: 50, rampRate: 2.0, holdTime: 90 },
    ],
    description: 'Niskotemperaturowy profil dla regenerowanych układów reballowanych stopem ołowiowym Sn63/Pb37.'
  },
  {
    id: 'mb-dell-xps-9570',
    boardModel: 'Dell XPS 15 9570 / 7590 (LA-G341P)',
    chipsetName: 'Intel i7-8750H + GTX 1050 Ti BGA',
    packageType: 'BGA1528 / N17P-G0-A1',
    solderType: 'SAC305 Lead-Free (217°C Melting)',
    pcbThicknessMm: 1.4,
    layersCount: 10,
    steps: [
      { id: 1, name: 'Preheat (Ramka Aluminiowa Dell)', targetTemp: 155, rampRate: 1.3, holdTime: 95 },
      { id: 2, name: 'Soak / Wygrzewanie Topnika', targetTemp: 185, rampRate: 1.1, holdTime: 65 },
      { id: 3, name: 'Reflow BGA (Rozpływ SAC305)', targetTemp: 238, rampRate: 2.1, holdTime: 48 },
      { id: 4, name: 'Cooling Down (Etap Chłodzenia)', targetTemp: 50, rampRate: 2.4, holdTime: 120 },
    ],
    description: 'Profil z dodatkowym wygrzewaniem topnika fluksu, zapobiegający kulkowaniu pod układem.'
  }
];

export const Ir6500BgaStationModal: React.FC<Ir6500BgaStationModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentTemp, setCurrentTemp] = useState(24.5);
  const [topHeaterPower, setTopHeaterPower] = useState(0); // %
  const [bottomHeaterPower, setBottomHeaterPower] = useState(0); // %
  const [preheaterTemp, setPreheaterTemp] = useState(24.0);

  // Profile Optimizer State
  const [selectedMotherboard, setSelectedMotherboard] = useState<MotherboardBgaPreset>(BGA_MOTHERBOARD_PRESETS[0]);
  const [searchBoardQuery, setSearchBoardQuery] = useState('');
  const [appliedPresetId, setAppliedPresetId] = useState<string>('');

  // Standard Lead-Free BGA Profile (RoHS)
  const [profileSteps, setProfileSteps] = useState<ProfileStep[]>([
    { id: 1, name: 'Preheat (Podgrzew wstępny)', targetTemp: 150, rampRate: 1.5, holdTime: 90 },
    { id: 2, name: 'Soak / Soak Zone (Wygrzewanie)', targetTemp: 180, rampRate: 1.0, holdTime: 60 },
    { id: 3, name: 'Reflow (Rozpływ / Topnienie kul)', targetTemp: 235, rampRate: 2.0, holdTime: 45 },
    { id: 4, name: 'Cool Down (Chłodzenie kontrolowane)', targetTemp: 50, rampRate: 2.5, holdTime: 120 },
  ]);

  const [activeTab, setActiveTab] = useState<'profile' | 'optimizer' | 'manual' | 'logs'>('profile');
  const [manualTopSet, setManualTopSet] = useState(180);
  const [manualBotSet, setManualBotSet] = useState(200);
  const [logs, setLogs] = useState<string[]>([
    '[12:00:15] IR6500 EasyBGA Controller zainicjalizowany pomyślnie przez port COM3 (115200 baud).',
    '[12:00:16] Termopar K1 (Top Heater) odczyt: 24.5°C. Termopar K2 (Bottom IR): 24.0°C.',
    '[12:00:18] Gotowy do załadowania profilu termicznego BGA RoHS.'
  ]);

  // Simulation timer when running profile
  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        
        // Temperature simulation logic
        setCurrentTemp((prevTemp) => {
          const currentStep = profileSteps[currentStepIndex];
          if (!currentStep) {
            setIsRunning(false);
            return prevTemp;
          }

          const target = currentStep.targetTemp;
          if (prevTemp < target) {
            const next = prevTemp + currentStep.rampRate * 0.8;
            setTopHeaterPower(Math.min(100, Math.round((target / 250) * 85)));
            setBottomHeaterPower(Math.min(100, Math.round((target / 250) * 90)));
            return next > target ? target : next;
          } else {
            // Hold time reached? simulate progression
            return prevTemp;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentStepIndex, profileSteps]);

  if (!isOpen) return null;

  const handleStartProfile = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setElapsedSeconds(0);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] Uruchomiono profil BGA: "${profileSteps[0].name}"`,
      ...prev
    ]);
  };

  const handleStopProfile = () => {
    setIsRunning(false);
    setTopHeaterPower(0);
    setBottomHeaterPower(0);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ZATRZYMANIE AWARYJNE / STOP PROFILU przez operatora. Grzałki wyłączone.`,
      ...prev
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 border border-red-500/30 p-2.5 rounded-xl text-red-400 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>IR6500 BGA Rework Station Controller (www.easy.bga.com)</span>
                <span className="text-xs bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full font-mono border border-red-500/30">Dual IR Zone v3.8</span>
              </h2>
              <p className="text-xs text-slate-400">
                Precyzyjna stacja lutownicza BGA z panelem profilowania temperaturowego, grzałką górną ceramiczną IR i dolnym preheaterem kwarcowym.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className={isConnected ? 'text-emerald-400' : 'text-red-400'}>
                {isConnected ? 'USB COM3 (115200)' : 'Rozłączony'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800/60 border-b border-slate-700 px-6 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'profile' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Profil Temperaturowy (Reflow)</span>
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'optimizer' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Profile Optimizer (Baza Płyt)</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'manual' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sterowanie Ręczne (Manual IR)</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'logs' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Logi Komunikacji & USB</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(`Przeanalizuj profil temperaturowy BGA dla IR6500. Aktualna temperatura rdzenia: ${currentTemp.toFixed(1)}°C.`);
                  onClose();
                }}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Zapytaj AI o profil BGA</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-950">
          
          {/* Left Panel: Realtime Telemetry & Gauges (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-4">
            
            {/* Realtime Temperatures */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span>Wskaźniki Czujników (Termopary K)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">TC1: Top Heater (Rdzeń)</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-2xl font-black font-mono text-red-400">{currentTemp.toFixed(1)}</span>
                    <span className="text-xs text-slate-400">°C</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (currentTemp / 250) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[10px] text-slate-400 block font-medium">TC2: Bottom Preheater</span>
                  <div className="flex items-baseline space-x-1 mt-1">
                    <span className="text-2xl font-black font-mono text-amber-400">{(currentTemp * 0.75).toFixed(1)}</span>
                    <span className="text-xs text-slate-400">°C</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${Math.min(100, ((currentTemp * 0.75) / 200) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Heater Power Outputs */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Moc Grzałek (PWM)</span>
              </h3>

              <div className="space-y-2 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Top IR Heater:</span>
                  <span className="font-mono font-bold text-red-400">{topHeaterPower}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${topHeaterPower}%` }}></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-300">Bottom IR Preheater:</span>
                  <span className="font-mono font-bold text-amber-400">{bottomHeaterPower}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full transition-all duration-300" style={{ width: `${bottomHeaterPower}%` }}></div>
                </div>
              </div>
            </div>

            {/* Execution Controls */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Status Procesu BGA</span>
              </h3>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Czas trwania:</span>
                  <span className="font-mono font-bold text-white">
                    {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Aktualny etap:</span>
                  <span className="font-bold text-teal-300">{profileSteps[currentStepIndex]?.name || 'Zakończono'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {!isRunning ? (
                  <button
                    onClick={handleStartProfile}
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Start Profilu BGA</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopProfile}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-extrabold py-3 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>STOP / ZATRZYMAJ</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsRunning(false);
                    setCurrentTemp(24.5);
                    setElapsedSeconds(0);
                    setCurrentStepIndex(0);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-3 rounded-xl transition flex items-center justify-center"
                  title="Resetuj stację"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Tab content (Profile editor, Manual, or Logs) (8 cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto flex flex-col justify-between">
            
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Edytor Profilu Krzywej Reflow (RoHS Lead-Free)</h3>
                    <p className="text-xs text-slate-400">Zdefiniuj strefy temperatur, narastania (ramp) i czasów wygrzewania dla grzałki IR6500.</p>
                  </div>
                  <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                    <Download className="w-3.5 h-3.5" />
                    <span>Zapisz / Eksportuj Profil</span>
                  </button>
                </div>

                {/* Profile Steps table / cards */}
                <div className="space-y-3">
                  {profileSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition ${
                        currentStepIndex === idx && isRunning
                          ? 'bg-red-950/30 border-red-500 shadow-lg'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          currentStepIndex === idx && isRunning ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          0{step.id}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{step.name}</h4>
                          <span className="text-[11px] text-slate-400">Narzut narastania: {step.rampRate}°C/s</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Temp Docelowa</span>
                          <span className="text-base font-bold text-amber-400">{step.targetTemp}°C</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Czas Hold</span>
                          <span className="text-base font-bold text-teal-400">{step.holdTime}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Chart preview */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Wykres Krzywej Lutowania BGA (Live Preview)</span>
                    <span className="text-emerald-400 font-mono">Status: {isRunning ? 'AKTYWNY REFLOW' : 'OCZEKIWANIE'}</span>
                  </div>
                  <div className="h-32 w-full bg-slate-950 rounded-lg border border-slate-800 relative flex items-end p-2 overflow-hidden">
                    {/* Simulated SVG Wave */}
                    <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none" viewBox="0 0 100 50">
                      <path
                        d="M0,45 Q20,35 40,25 T70,10 T100,45"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                      IR6500 PID Controller Output Wave
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'optimizer' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl">
                  <div>
                    <h3 className="text-sm font-extrabold text-amber-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      <span>Profile Optimizer — Inteligentny Dobór Profilu BGA</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Sugeruje parametry profilu grzania (temperatura, czas rampingu, czas wygrzewania) na podstawie grubości PCB, liczby warstw i rodzaju stopu pobranych z bazy danych.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-mono border border-amber-500/40">
                      Baza Płyt: {BGA_MOTHERBOARD_PRESETS.length} modeli
                    </span>
                  </div>
                </div>

                {/* Motherboard Selector Grid & Search */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Wpisz model płyty głównej (np. 820-00850, GL552, NM-A271, Dell XPS)..."
                      value={searchBoardQuery}
                      onChange={(e) => setSearchBoardQuery(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[190px] overflow-y-auto pr-1">
                    {BGA_MOTHERBOARD_PRESETS.filter((preset) =>
                      preset.boardModel.toLowerCase().includes(searchBoardQuery.toLowerCase()) ||
                      preset.chipsetName.toLowerCase().includes(searchBoardQuery.toLowerCase())
                    ).map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedMotherboard(preset)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                          selectedMotherboard.id === preset.id
                            ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50 shadow-md'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">{preset.boardModel}</span>
                          <span className="text-[11px] text-amber-300 font-mono block">{preset.chipsetName}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>PCB: {preset.pcbThicknessMm}mm</span>
                            <span>•</span>
                            <span>Warstw: {preset.layersCount}</span>
                            <span>•</span>
                            <span className="text-teal-300">{preset.solderType}</span>
                          </div>
                        </div>
                        {selectedMotherboard.id === preset.id && (
                          <div className="bg-amber-500 text-slate-950 p-1 rounded-full">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Motherboard Optimization Parameters */}
                {selectedMotherboard && (
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-amber-400" />
                          <span>Rekomendowane Parametry Reflow dla {selectedMotherboard.boardModel}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{selectedMotherboard.description}</p>
                      </div>

                      <button
                        onClick={() => {
                          setProfileSteps(selectedMotherboard.steps);
                          setAppliedPresetId(selectedMotherboard.id);
                          setLogs((prev) => [
                            `[${new Date().toLocaleTimeString()}] Załadowano zoptymalizowany profil BGA dla "${selectedMotherboard.boardModel}" (${selectedMotherboard.solderType}).`,
                            ...prev
                          ]);
                          setActiveTab('profile');
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        <span>Zastosuj Sugerowany Profil Do Stacji</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Step Parameter Table preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      {selectedMotherboard.steps.map((st) => (
                        <div key={st.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 block font-sans truncate">{st.name}</span>
                          <div className="text-amber-400 font-bold text-sm">{st.targetTemp}°C</div>
                          <div className="text-teal-300 text-[10px]">Czas: {st.holdTime}s</div>
                          <div className="text-slate-400 text-[10px]">Ramp: {st.rampRate}°C/s</div>
                        </div>
                      ))}
                    </div>

                    {appliedPresetId === selectedMotherboard.id && (
                      <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Profil został pomyślnie zaaplikowany do pamięci IR6500!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Sterowanie Ręczne Grzałkami IR6500</h3>
                  <p className="text-xs text-slate-400">Włączaj ręcznie grzałkę górną ceramiczną oraz dolny preheater kwarcowy do testów.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase">Top IR Heater (Górna Grzałka)</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Zadana temperatura:</span>
                      <span className="font-mono font-bold text-white text-sm">{manualTopSet}°C</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="250"
                      value={manualTopSet}
                      onChange={(e) => setManualTopSet(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <button
                      onClick={() => setTopHeaterPower(manualTopSet > 50 ? 80 : 0)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs transition"
                    >
                      {topHeaterPower > 0 ? 'Wyłącz Top Heater' : 'Włącz Top Heater'}
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                    <h4 className="text-xs font-bold text-amber-400 uppercase">Bottom IR Preheater (Dolny Podgrzewacz)</h4>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300">Zadana temperatura:</span>
                      <span className="font-mono font-bold text-white text-sm">{manualBotSet}°C</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="220"
                      value={manualBotSet}
                      onChange={(e) => setManualBotSet(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <button
                      onClick={() => setBottomHeaterPower(manualBotSet > 50 ? 90 : 0)}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 rounded-xl text-xs transition"
                    >
                      {bottomHeaterPower > 0 ? 'Wyłącz Bottom Preheater' : 'Włącz Bottom Preheater'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-4 flex flex-col h-full">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Logi Konsoli i Komunikacji USB</h3>
                  <p className="text-xs text-slate-400">Komendy szeregowe wysyłane do mikrokontrolera stacji BGA IR6500.</p>
                </div>

                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 overflow-y-auto max-h-[350px]">
                  {logs.map((log, i) => (
                    <div key={i} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer close */}
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2 rounded-xl text-xs transition"
              >
                Zamknij Sterownik IR6500
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
