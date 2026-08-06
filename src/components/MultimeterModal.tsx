import React, { useState, useEffect } from 'react';
import { X, BookOpen, Zap, ShieldCheck, Activity, AlertCircle, Play, Pause, RotateCcw, LineChart, Cpu, Sliders, ArrowRight, Compass, Flame, Volume2, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MULTIMETER_GUIDE } from '../data/presets';

interface MultimeterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DataPoint {
  time: string;
  voltage: number;
  expected: number;
}

const RAIL_PRESETS = [
  { id: '19v-vin', name: '19.5V DC-IN Main Rail', targetVoltage: 19.5, noise: 0.12, unit: 'V', defaultResistance: 12500 },
  { id: '12v-ppbus', name: '12.6V PPBUS_G3H Battery Rail', targetVoltage: 12.6, noise: 0.08, unit: 'V', defaultResistance: 8400 },
  { id: '5v-stdby', name: '+5.0V Standby Rail', targetVoltage: 5.0, noise: 0.04, unit: 'V', defaultResistance: 3200 },
  { id: '3v3-kbc', name: '+3.3V KBC / BIOS Standby', targetVoltage: 3.3, noise: 0.02, unit: 'V', defaultResistance: 4800 },
  { id: 'vcore-cpu', name: '+1.05V CPU VCORE (Load Noise)', targetVoltage: 1.05, noise: 0.06, unit: 'V', defaultResistance: 18.5 },
  { id: 'short-rail', name: '5V Rail (ZWARCIE DO MASY / SHORT)', targetVoltage: 0.28, noise: 0.15, unit: 'V', defaultResistance: 0.18 },
];

export interface TraceNode {
  id: string;
  label: string;
  type: 'CAPACITOR' | 'VIA' | 'MOSFET_PIN' | 'IC_PAD' | 'INDUCTOR';
  xPct: number;
  yPct: number;
  description: string;
}

export interface PresetTracePath {
  id: string;
  title: string;
  startNode: TraceNode;
  endNode: TraceNode;
  expectedResistance: number; // in Ohms
  status: 'CONTINUOUS' | 'BROKEN' | 'HIGH_RESISTANCE';
  description: string;
}

export const PRESET_TRACE_PATHS: PresetTracePath[] = [
  {
    id: 'path-vcore-cap-via',
    title: 'Ścieżka #1: Kondensator MLCC C7890 <--> Przelotka VIA #12 (VCORE VRM)',
    startNode: { id: 'node-c7890', label: 'C7890 (MLCC VCORE)', type: 'CAPACITOR', xPct: 28, yPct: 35, description: 'Kondensator ceramiczny filtrujący VCORE' },
    endNode: { id: 'node-via12', label: 'VIA #12 (Przelotka VRM)', type: 'VIA', xPct: 45, yPct: 28, description: 'Miedziana przelotka do warstwy wewnętrznej CPU' },
    expectedResistance: 0.12,
    status: 'CONTINUOUS',
    description: 'Połączenie bezpośrednie na warstwie L2. Ciągłość potwierdzona - sygnał dźwiękowy beepera 2.4kHz.'
  },
  {
    id: 'path-kbc-bios',
    title: 'Ścieżka #2: KBC IT8586E (Pin 12) <--> Kość BIOS SPI Winbond (Pin 8 CS#)',
    startNode: { id: 'node-kbc', label: 'KBC Pin 12 (SPI_CS#)', type: 'IC_PAD', xPct: 70, yPct: 72, description: 'Sygnał wybudzenia pamięci BIOS Flash' },
    endNode: { id: 'node-bios', label: 'BIOS Pin 8 (3.3V / CS)', type: 'IC_PAD', xPct: 18, yPct: 78, description: 'Nóżka zasilania i wyboru układu SPI' },
    expectedResistance: 0.08,
    status: 'CONTINUOUS',
    description: 'Niska oporność ścieżki sygnałowej 3.3V. Sonda potwiedza pełny kontakt.'
  },
  {
    id: 'path-vin-broken-via',
    title: 'Ścieżka #3: Linia VIN 19V <--> Tranzystor PQ202 (PRZERWANA PRZELOTKA)',
    startNode: { id: 'node-vin', label: 'PR201 (Opornik Pomiarowy)', type: 'CAPACITOR', xPct: 15, yPct: 22, description: 'Główny bocznik prądowy 19V' },
    endNode: { id: 'node-pq202', label: 'PQ202 Drain (MOSFET)', type: 'MOSFET_PIN', xPct: 38, yPct: 18, description: 'Tranzystor High-Side sekcji zasilania' },
    expectedResistance: 1250000, // 1.25 M ohm = OPEN
    status: 'BROKEN',
    description: '⚠️ WYKRYTO PRZERWĘ W WARSTWIE L3! Uszkodzona przelotka przelotowa VIA po upadku laptopa.'
  },
  {
    id: 'path-gddr6-phase',
    title: 'Ścieżka #4: Bank VRAM GDDR6 <--> Przelotka Zasilania VDDQ (1.35V)',
    startNode: { id: 'node-vram', label: 'U102 VRAM BGA', type: 'IC_PAD', xPct: 35, yPct: 24, description: 'Nóżka zasilająca kość VRAM Micron' },
    endNode: { id: 'node-via-vram', label: 'VIA #88 (VRAM Plane)', type: 'VIA', xPct: 52, yPct: 22, description: 'Przelotka wielowarstwowa 1.35V' },
    expectedResistance: 0.15,
    status: 'CONTINUOUS',
    description: 'Poprawne przejście prądowe. Połączenie stabilne.'
  }
];

export const MultimeterModal: React.FC<MultimeterModalProps> = ({ isOpen, onClose }) => {
  const [selectedRail, setSelectedRail] = useState(RAIL_PRESETS[0]);
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [measurementMode, setMeasurementMode] = useState<'DC_V' | 'AC_RIPPLE' | 'RESISTANCE' | 'DIODE'>('DC_V');
  const [activeTab, setActiveTab] = useState<'live-chart' | 'cheat-sheet' | 'trace-tracker'>('live-chart');

  // Trace Continuity Tracker State
  const [selectedTracePath, setSelectedTracePath] = useState<PresetTracePath>(PRESET_TRACE_PATHS[0]);
  const [probeA, setProbeA] = useState<{ xPct: number; yPct: number; label: string }>({ xPct: 28, yPct: 35, label: 'Sonda CZERWONA (+)' });
  const [probeB, setProbeB] = useState<{ xPct: number; yPct: number; label: string }>({ xPct: 45, yPct: 28, label: 'Sonda CZARNA (-)' });
  const [customNodes, setCustomNodes] = useState<{ id: string; xPct: number; yPct: number; label: string }[]>([]);
  const [isBeeping, setIsBeeping] = useState<boolean>(true);

  // Resistance probe test state for Short to Ground animation (< 5 Ohm)
  const [probeResistance, setProbeResistance] = useState<number>(0.18); // In Ohms

  // Stats
  const [currentValue, setCurrentValue] = useState(19.5);
  const [minVal, setMinVal] = useState(19.5);
  const [maxVal, setMaxVal] = useState(19.5);
  const [avgVal, setAvgVal] = useState(19.5);

  // Determine if short-to-ground condition is active (< 5 Ohms or short-rail preset)
  const isShortToGround =
    selectedRail.id === 'short-rail' ||
    probeResistance < 5.0 ||
    (measurementMode === 'RESISTANCE' && probeResistance < 5.0);

  // Synchronize probe resistance when rail changes
  useEffect(() => {
    setProbeResistance(selectedRail.defaultResistance);
  }, [selectedRail]);

  // Initialize data array
  useEffect(() => {
    if (!isOpen) return;
    const initialPoints: DataPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const timeStr = new Date(now - i * 300).toLocaleTimeString('pl-PL', { second: '2-digit', minute: '2-digit' });
      initialPoints.push({
        time: timeStr,
        voltage: Number(selectedRail.targetVoltage.toFixed(3)),
        expected: selectedRail.targetVoltage,
      });
    }
    setChartData(initialPoints);
    setMinVal(selectedRail.targetVoltage);
    setMaxVal(selectedRail.targetVoltage);
    setAvgVal(selectedRail.targetVoltage);
  }, [isOpen, selectedRail]);

  // Real-time chart sampling timer loop (runs every 250ms)
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const interval = setInterval(() => {
      const randomNoise = (Math.random() - 0.5) * selectedRail.noise * 2;
      const computedVoltage = Number(Math.max(0, selectedRail.targetVoltage + randomNoise).toFixed(3));
      const timeStr = new Date().toLocaleTimeString('pl-PL', { second: '2-digit', minute: '2-digit' });

      setCurrentValue(computedVoltage);

      setChartData((prev) => {
        const next = [...prev.slice(1), { time: timeStr, voltage: computedVoltage, expected: selectedRail.targetVoltage }];
        
        // Calculate min, max, avg
        const vols = next.map((d) => d.voltage);
        setMinVal(Math.min(...vols));
        setMaxVal(Math.max(...vols));
        setAvgVal(Number((vols.reduce((a, b) => a + b, 0) / vols.length).toFixed(3)));

        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, selectedRail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className={`bg-slate-900 border rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl transition-all duration-300 text-slate-100 ${
        isShortToGround
          ? 'border-red-500 shadow-2xl shadow-red-950/80 ring-2 ring-red-500/50'
          : 'border-slate-700'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors duration-300 ${
          isShortToGround ? 'bg-red-950/90 border-red-500/50' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border transition ${
              isShortToGround ? 'bg-red-500/20 border-red-500/80 text-red-400 animate-pulse' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}>
              {isShortToGround ? <ShieldAlert className="w-6 h-6 animate-bounce" /> : <Activity className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                Multimetr Cyfrowy z Wykresem na Żywo (Real-Time Oscilloscope/Multimeter Scope)
                <span className={`text-[10px] border px-2 py-0.5 rounded-full font-mono ${
                  isShortToGround
                    ? 'bg-red-500 text-white border-red-400 animate-pulse font-bold'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isShortToGround ? '⚡ ZWARCIE < 5Ω' : 'LIVE 250ms'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Śledzenie zmian napięcia w czasie rzeczywistym, wykrywanie tętnień zasilacza i spadków napięć
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tab Switcher */}
        <div className="bg-slate-950 px-6 py-2 border-b border-slate-800 flex items-center space-x-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('live-chart')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'live-chart'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-4 h-4" /> Wykres na Żywo &amp; Sonda Multimetru
          </button>
          <button
            onClick={() => setActiveTab('trace-tracker')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'trace-tracker'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-300" /> Trace Continuity Tracker (Test Ścieżek)
          </button>
          <button
            onClick={() => setActiveTab('cheat-sheet')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              activeTab === 'cheat-sheet'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Tabela Rezystancji &amp; Szyn Zasilania
          </button>
        </div>

        {activeTab === 'live-chart' ? (
          <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-950">
            
            {/* Measurement Mode & Probe Resistance Control */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">Tryb Multimetru:</span>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {(['DC_V', 'RESISTANCE', 'AC_RIPPLE', 'DIODE'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setMeasurementMode(mode)}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        measurementMode === mode
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode === 'DC_V' && 'Napięcie (DC V)'}
                      {mode === 'RESISTANCE' && 'Oporność (Ω)'}
                      {mode === 'AC_RIPPLE' && 'Tętnienia (AC)'}
                      {mode === 'DIODE' && 'Test Diody (mV)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Probe Resistance Interactive Slider */}
              <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono flex-1 min-w-[280px]">
                <Sliders className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-400 shrink-0">Oporność Sondy:</span>
                <input
                  type="range"
                  min="0.01"
                  max="50.0"
                  step="0.05"
                  value={probeResistance}
                  onChange={(e) => setProbeResistance(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className={`px-2 py-0.5 rounded font-bold shrink-0 ${
                  probeResistance < 5.0 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-emerald-300'
                }`}>
                  {probeResistance < 1000 ? `${probeResistance.toFixed(2)} Ω` : `${(probeResistance / 1000).toFixed(1)} kΩ`}
                </span>
              </div>
            </div>

            {/* Short to Ground Vector Animation Section (< 5 Ohm) */}
            {isShortToGround && (
              <div className="bg-red-950/80 border-2 border-red-500 p-5 rounded-2xl shadow-2xl shadow-red-950/90 text-red-100 space-y-4 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white font-mono text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <Flame className="w-3.5 h-3.5 animate-bounce" /> DETEKTOR ZWARCIA DO MASY AKTYWNY (&lt; 5.0 Ω)
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 bg-red-600/30 border border-red-500/80 rounded-2xl text-red-300 animate-pulse shrink-0">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base flex items-center gap-2 font-mono">
                      ALARM: WYKRYTO ZWARCIE NISKOOPOROWE! ({probeResistance.toFixed(2)} Ω)
                      <span className="bg-red-500/30 text-red-200 border border-red-400 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                        <Volume2 className="w-3 h-3 animate-ping" /> BUZZER TONE ON
                      </span>
                    </h3>
                    <p className="text-xs text-red-200/90 mt-1">
                      Wykryta oporność wynosi <strong>{probeResistance.toFixed(2)} Ω</strong>, co mieści się poniżej progu krytycznego 5.0 Ω. Na podstawie zdjęcia termowizyjnego wyznaczono wektor prądu i najkrótszą drogę do źródła nagrzewania.
                    </p>
                  </div>
                </div>

                {/* Interactive Thermal Map & Directional Arrow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  
                  {/* Thermal Camera Snapshot Canvas Overlay */}
                  <div className="relative rounded-xl overflow-hidden border border-red-500/50 bg-slate-950 h-52 flex items-center justify-center group shadow-inner">
                    {/* Simulated PCB Thermal View with Heat Hotspot */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 opacity-90" />
                    
                    {/* PCB Traces & Component Outline */}
                    <div className="absolute inset-2 border border-slate-800 border-dashed rounded-lg flex items-center justify-between p-4 opacity-50">
                      <div className="w-12 h-12 border border-slate-700 rounded bg-slate-900/60 flex items-center justify-center text-[9px] font-mono text-slate-500">VIN DC</div>
                      <div className="w-16 h-10 border border-slate-700 rounded bg-slate-900/60 flex items-center justify-center text-[9px] font-mono text-slate-500">PQ202</div>
                      <div className="w-10 h-10 border border-slate-700 rounded bg-slate-900/60 flex items-center justify-center text-[9px] font-mono text-slate-500">GND</div>
                    </div>

                    {/* Thermal Hotspot Glow Circle */}
                    <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gradient-to-r from-yellow-500 via-red-600 to-purple-600 opacity-80 blur-xl animate-pulse" />
                    <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-yellow-300 border-2 border-white shadow-[0_0_20px_#f59e0b] animate-ping" />

                    {/* Animated Short Circuit Vector Path Arrow */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-full h-full text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]" viewBox="0 0 300 150">
                        <defs>
                          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                          </marker>
                        </defs>
                        {/* Vector Path */}
                        <path
                          d="M 50,75 C 100,40 150,110 200,75"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="4"
                          strokeDasharray="6 4"
                          className="animate-pulse"
                          markerEnd="url(#arrow)"
                        />
                      </svg>
                    </div>

                    {/* Target Pin Marker Label */}
                    <div className="absolute top-8 right-8 bg-red-600 text-white text-[10px] font-mono font-bold px-2 py-1 rounded shadow border border-red-300 flex items-center gap-1 animate-bounce">
                      <Flame className="w-3 h-3 text-yellow-300" /> C7890 MLCC (PUNKT GORĄCY 68.4°C)
                    </div>

                    {/* Start Probe Marker */}
                    <div className="absolute bottom-6 left-6 bg-slate-900 border border-emerald-400 text-emerald-300 text-[10px] font-mono px-2 py-1 rounded shadow">
                      📍 Sonda Pomiarowa ({probeResistance.toFixed(2)} Ω)
                    </div>
                  </div>

                  {/* Short Diagnostics Analysis Card */}
                  <div className="bg-slate-900/90 border border-red-500/40 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-red-300 font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-red-400" /> Wektor Wskazujący Drogę Zwarcia
                        </span>
                        <span className="text-[10px] text-red-400 font-normal">Thermal Correlation Engine</span>
                      </div>
                      
                      <div className="space-y-2 text-xs font-mono text-slate-300 mt-2">
                        <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-400">Prawdopodobne Źródło:</span>
                          <strong className="text-yellow-400">Kondensator C7890 (MLCC 10uF 25V)</strong>
                        </div>

                        <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-400">Szacowana Odległość:</span>
                          <strong className="text-emerald-400">1.4 cm od punktu przyłożenia sondy</strong>
                        </div>

                        <div className="flex justify-between bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-slate-400">Zalecany Prąd Próby:</span>
                          <strong className="text-red-300">1.0V DC / max 2.5A (Zasilacz Lab)</strong>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-500/20 border border-red-500/50 p-2.5 rounded-lg text-[11px] text-red-200 flex items-center justify-between font-mono">
                      <span>Wskazówka: Zamroź obszar Zamrażaczem PR-80 przed próba zwarciową!</span>
                      <ArrowRight className="w-4 h-4 text-red-300 shrink-0" />
                    </div>
                  </div>

                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Rail Picker */}
              <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <label className="text-xs text-slate-400 font-mono mb-1 block">Wybierz Szynę / Punkt Pomiarowy PCB:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RAIL_PRESETS.map((rail) => (
                    <button
                      key={rail.id}
                      onClick={() => setSelectedRail(rail)}
                      className={`p-2 rounded-lg text-left text-xs font-mono border transition ${
                        selectedRail.id === rail.id
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-[10px] text-slate-500 truncate">{rail.unit}: {rail.targetVoltage}V</div>
                      <div className="truncate">{rail.name.split(' ')[0]} {rail.name.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multimeter Digital LCD Readout Display */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>LCD MULTIMETER SCOPE</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    selectedRail.id === 'short-rail' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {selectedRail.id === 'short-rail' ? 'WARUNEK ZWARCIA' : 'POMIAR PRAWIDŁOWY'}
                  </span>
                </div>

                <div className="my-2 bg-black/90 border border-emerald-500/40 p-3 rounded-xl font-mono text-center shadow-inner">
                  <div className="text-3xl font-black tracking-widest text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                    {currentValue.toFixed(3)} <span className="text-sm font-normal text-emerald-300">{selectedRail.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-center gap-3">
                    <span>MIN: <strong className="text-emerald-300">{minVal}V</strong></span>
                    <span>MAX: <strong className="text-emerald-300">{maxVal}V</strong></span>
                    <span>ŚR: <strong className="text-emerald-300">{avgVal}V</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition ${
                      isPaused ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    {isPaused ? 'WZNAWIAJ' : 'HOLD (PAUZA)'}
                  </button>

                  <button
                    onClick={() => {
                      const points: DataPoint[] = [];
                      for (let i = 20; i >= 0; i--) {
                        points.push({ time: `${i}s`, voltage: selectedRail.targetVoltage, expected: selectedRail.targetVoltage });
                      }
                      setChartData(points);
                    }}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> RESET
                  </button>
                </div>
              </div>

            </div>

            {/* Live Chart Container */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Sygnał Napięciowy w Czasie Realnym (Wykres Falowy)
                </span>
                <span className="text-emerald-400 font-bold">Punkt Referencyjny: {selectedRail.targetVoltage}V</span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="voltageColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={selectedRail.id === 'short-rail' ? '#ef4444' : '#10b981'} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={selectedRail.id === 'short-rail' ? '#ef4444' : '#10b981'} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#f8fafc' }}
                      formatter={(val: any) => [`${val} V`, 'Napięcie']}
                    />
                    <Area
                      type="monotone"
                      dataKey="voltage"
                      stroke={selectedRail.id === 'short-rail' ? '#ef4444' : '#10b981'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#voltageColor)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Diagnostic Alert Footer */}
            {selectedRail.id === 'short-rail' && (
              <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl flex items-center gap-3 text-red-200 text-xs">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <strong className="block text-red-300 font-bold">WYKRYTO PRZYKŁADOWY ZAPAD NAPIĘCIA / ZWARCIE:</strong>
                  Napięcie spadło z nominalnego 5.0V do zaledwie {currentValue}V przy poborze prądu ponad 3.5A. Przejdź do próby zwarciowej z kamerą termowizyjną.
                </div>
              </div>
            )}

          </div>
        ) : activeTab === 'trace-tracker' ? (
          /* TAB 2: Trace Continuity Tracker (Rysowanie Ścieżek i Test Przejścia) */
          <div className="p-5 overflow-y-auto space-y-5 text-slate-300 text-xs flex-1 bg-slate-950">
            
            {/* Banner Header */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-emerald-300 flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Trace Continuity Tracker — Wizualizacja i Test Przejścia Ścieżek PCB</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Umożliwia wirtualne przyłożenie sond multimetru do kondensatorów MLCC, padów i przelotek (VIA) na zdjęciu płyty głównej w celu weryfikacji ciągłości miedzianego obwodu.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBeeping(!isBeeping)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-xs transition border ${
                    isBeeping ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Beeper Dźwiękowy: {isBeeping ? 'WŁ' : 'WYŁ'}</span>
                </button>
              </div>
            </div>

            {/* Preset Trace Selector Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Wybierz Ścieżkę i Punkty Pomiarowe Sondy:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_TRACE_PATHS.map((path) => (
                  <div
                    key={path.id}
                    onClick={() => {
                      setSelectedTracePath(path);
                      setProbeA({ xPct: path.startNode.xPct, yPct: path.startNode.yPct, label: path.startNode.label });
                      setProbeB({ xPct: path.endNode.xPct, yPct: path.endNode.yPct, label: path.endNode.label });
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between ${
                      selectedTracePath.id === path.id
                        ? 'bg-slate-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-white text-xs block">{path.title}</span>
                      <p className="text-[11px] text-slate-400">{path.description}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${
                      path.status === 'CONTINUOUS'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    }`}>
                      {path.status === 'CONTINUOUS' ? '0.12 Ω (BEEP OK)' : '1.25 MΩ (PRZERWA)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Motherboard Boardview Canvas */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Kamera / Podgląd Zdjęcia Płyty Głównej z Rysowaną Ścieżką (Live Probe Vector)</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  Kliknij w dowolne miejsce płyty, aby przesunąć Sondę CZERWONĄ (+)
                </span>
              </div>

              {/* Motherboard Graphic Stage */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setProbeA({ xPct: x, yPct: y, label: `Sonda CZERWONA (X:${x}%, Y:${y}%)` });
                }}
                className="w-full h-80 bg-slate-950 rounded-xl border border-slate-800 relative cursor-crosshair overflow-hidden group select-none"
              >
                {/* PCB Image Pattern Background */}
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Motherboard Silkscreen Vector Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Internal PCB bus traces */}
                  <path d="M 10,20 L 30,20 L 40,35 L 70,35 L 85,75" stroke="#1e293b" strokeWidth="0.8" fill="none" />
                  <path d="M 15,25 L 35,25 L 45,40 L 75,40 L 90,80" stroke="#1e293b" strokeWidth="0.8" fill="none" />
                  <circle cx="28" cy="35" r="3" fill="#334155" stroke="#10b981" strokeWidth="0.5" />
                  <circle cx="45" cy="28" r="2.5" fill="#334155" stroke="#10b981" strokeWidth="0.5" />
                  <circle cx="70" cy="72" r="3.5" fill="#334155" />
                  <circle cx="18" cy="78" r="3" fill="#334155" />

                  {/* ACTIVE TRACE PATH LINE BETWEEN PROBE A AND PROBE B */}
                  <line
                    x1={probeA.xPct}
                    y1={probeA.yPct}
                    x2={probeB.xPct}
                    y2={probeB.yPct}
                    stroke={selectedTracePath.status === 'CONTINUOUS' ? '#10b981' : '#ef4444'}
                    strokeWidth="2.5"
                    strokeDasharray={selectedTracePath.status === 'CONTINUOUS' ? '0' : '4'}
                    className={selectedTracePath.status === 'CONTINUOUS' ? 'animate-pulse' : ''}
                  />

                  {/* Glowing halo for active trace */}
                  <line
                    x1={probeA.xPct}
                    y1={probeA.yPct}
                    x2={probeB.xPct}
                    y2={probeB.yPct}
                    stroke={selectedTracePath.status === 'CONTINUOUS' ? '#34d399' : '#f87171'}
                    strokeWidth="6"
                    strokeOpacity="0.3"
                  />
                </svg>

                {/* Probe A Marker (RED PROBE) */}
                <div
                  style={{ left: `${probeA.xPct}%`, top: `${probeA.yPct}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group/probe"
                >
                  <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-bounce">
                    <span className="text-[10px] font-black text-white">+</span>
                  </div>
                  <div className="bg-red-950/90 border border-red-500/60 text-red-200 text-[10px] font-mono px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                    {probeA.label}
                  </div>
                </div>

                {/* Probe B Marker (BLACK PROBE) */}
                <div
                  style={{ left: `${probeB.xPct}%`, top: `${probeB.yPct}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
                >
                  <div className="w-6 h-6 bg-slate-900 rounded-full border-2 border-cyan-400 shadow-lg flex items-center justify-center">
                    <span className="text-[10px] font-black text-cyan-300">-</span>
                  </div>
                  <div className="bg-slate-900/90 border border-cyan-500/60 text-cyan-200 text-[10px] font-mono px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
                    {probeB.label}
                  </div>
                </div>

                {/* Continuity Status Badge Overlay */}
                <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 p-2.5 rounded-xl flex items-center gap-3 backdrop-blur-md">
                  <div className={`p-2 rounded-lg font-mono font-bold text-xs flex items-center gap-2 ${
                    selectedTracePath.status === 'CONTINUOUS'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {selectedTracePath.status === 'CONTINUOUS' ? (
                      <>
                        <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>0.12 Ω — BEEP CONTINUITY ACTIVE</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                        <span>1.25 MΩ — PRZERWANY OBWÓD (OPEN VIA)</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* TAB 3: Cheat Sheet / Reference Table */
          <div className="p-5 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm flex-1 bg-slate-950">
            {/* Safety Rule Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-start space-x-3 text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-300 text-xs">Zasada Bezpieczeństwa Próby Zwarciowej:</span>
                <p className="text-xs leading-relaxed mt-0.5">
                  Mierząc oporność do masy (Resistance to Ground), ZAWSZE odłącz zasilacz i baterię CMOS. Próbę zwarciową z zasilacza serwisowego podawaj wyłącznie na uszkodzoną linię (np. 19V max 1V / 1A), obserwując nagrzewanie w kamerze termowizyjnej.
                </p>
              </div>
            </div>

            {/* Test Points Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Tabela Wartości Referencyjnych Szyn Zasilania
              </h3>
              
              <div className="space-y-3">
                {MULTIMETER_GUIDE.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-amber-400 text-sm font-mono">{item.rail}</span>
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-xs font-mono">
                        Napięcie: {item.expected}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono my-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Test Diodowy / Oporność:</span>
                        <span className="text-emerald-400 font-bold">{item.diodeReading}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Oczekiwania:</span>
                        <span className="text-slate-300">Brak zwarcia do masy</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      <strong className="text-slate-300">Częste usterki:</strong> {item.commonCause}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Zamknij Multimetr
          </button>
        </div>

      </div>
    </div>
  );
};
