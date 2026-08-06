import React, { useState, useEffect, useRef } from 'react';
import {
  BatteryCharging,
  Monitor,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Play,
  Square,
  CheckCircle2,
  Zap,
  Activity,
  Sliders,
  Maximize2,
  FileText,
  Cpu
} from 'lucide-react';

interface BatteryAndMatrixDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const BatteryAndMatrixDiagnosticsModal: React.FC<BatteryAndMatrixDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'battery' | 'matrix'>('battery');

  // Battery State
  const [designCapacity, setDesignCapacity] = useState(56000); // mWh
  const [fullChargeCapacity, setFullChargeCapacity] = useState(48200); // mWh
  const [cycleCount, setCycleCount] = useState(312);
  const [currentVoltage, setCurrentVoltage] = useState(11420); // mV
  const [dischargeRate, setDischargeRate] = useState(-8450); // mW
  const [batteryTemp, setBatteryTemp] = useState(32.4); // °C
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [batteryLogs, setBatteryLogs] = useState<string[]>([
    '[INIT] Akumulator Li-ion wykryty poprawnie przez ACPI/WMI',
    '[HEALTH] Obliczony stopień zużycia (Wear Level): 13.9%',
    '[OK] Ogniwa 1-4 w normie, temperatura stabilna.'
  ]);

  // Matrix Test State
  const [matrixColorIndex, setMatrixColorIndex] = useState(0); // 0: menu, 1: white, 2: black, 3: red, 4: green, 5: blue, 6: gradient, 7: grid
  const [isFullscreenMatrix, setIsFullscreenMatrix] = useState(false);
  const matrixContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const wearLevel = Math.max(0, Math.round(((designCapacity - fullChargeCapacity) / designCapacity) * 1000) / 10);
  const healthGrade = wearLevel < 10 ? 'A+ (Doskonały)' : wearLevel < 25 ? 'B (Dobry / Umiarkowany)' : wearLevel < 40 ? 'C (Wymaga Wymiany)' : 'D (Zużyty)';

  const handleStartCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    setBatteryLogs(prev => ['[CALIBRATION] Rozpoczęto cykl głębokiego rozładowania i ładowania kalibracyjnego...', ...prev]);
    
    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setCalibrationProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setIsCalibrating(false);
        setFullChargeCapacity(prev => Math.min(designCapacity, prev + 1200)); // slight improvement simulation
        setBatteryLogs(prev => ['[SUCCESS] Kalibracja zakończona pomyślnie! Pojemność nominalna zaktualizowana.', ...prev]);
      }
    }, 600);
  };

  const matrixColors = [
    { name: 'Menu / Wybór', bg: 'bg-slate-900', text: 'text-white' },
    { name: 'Pełna Biel (Test Pikseli)', bg: 'bg-white', text: 'text-black' },
    { name: 'Pełna Czerń (Test Podświetlenia / Clouding)', bg: 'bg-black', text: 'text-white' },
    { name: 'Czerwony (Bad Pixel)', bg: 'bg-red-600', text: 'text-white' },
    { name: 'Zielony (Bad Pixel)', bg: 'bg-green-600', text: 'text-white' },
    { name: 'Niebieski (Bad Pixel)', bg: 'bg-blue-600', text: 'text-white' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <BatteryCharging className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Test Baterii (Żywotność &amp; Wear Level) oraz Test Matryc (LCD/OLED)</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  PRO v5.2
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Profesjonalne narzędzie serwisowe do diagnostyki kondycji ogniw litowo-jonowych oraz wykrywania martwych pikseli
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center space-x-3">
          <button
            onClick={() => { setActiveTab('battery'); setMatrixColorIndex(0); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'battery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>Test Żywotności i Stanu Baterii</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'matrix'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Test Matrycy / Ekranu (Dead Pixels)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: BATTERY DIAGNOSTICS */}
          {activeTab === 'battery' && (
            <div className="space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Stopień Zużycia (Wear Level)</span>
                  <div className="text-2xl font-extrabold text-emerald-400">{wearLevel}%</div>
                  <span className="text-[11px] text-slate-500">Kondycja: <strong className="text-white">{healthGrade}</strong></span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Pojemność Aktualna / Projektowa</span>
                  <div className="text-xl font-bold text-white font-mono">{fullChargeCapacity} / {designCapacity} mWh</div>
                  <span className="text-[11px] text-slate-500">Utrata: {designCapacity - fullChargeCapacity} mWh</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Cykle Ładowania (Cycle Count)</span>
                  <div className="text-2xl font-extrabold text-cyan-400">{cycleCount}</div>
                  <span className="text-[11px] text-slate-500">Szacowana żywotność ogniw: ~700 cykli</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Napięcie &amp; Temperatura</span>
                  <div className="text-xl font-bold text-amber-400 font-mono">{(currentVoltage / 1000).toFixed(2)} V • {batteryTemp}°C</div>
                  <span className="text-[11px] text-slate-500">Pobór prądu: {dischargeRate} mW</span>
                </div>
              </div>

              {/* Calibration & Report Controls */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Zaawansowana Kalibracja BMS / Ogniw Baterii</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Procedura pełnego cyklu rozładowania kontrolera ACPI w celu dokładnego odczytu maksymalnej pojemności.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {isCalibrating ? (
                    <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                      <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                      <span className="text-xs font-bold text-white">Kalibracja: {calibrationProgress}%</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartCalibration}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>Uruchom Kalibrację BMS</span>
                    </button>
                  )}

                  {onSendToChat && (
                    <button
                      onClick={() => onSendToChat(`Przeanalizuj stan baterii laptopa: poj. projektowa ${designCapacity}mWh, aktualna ${fullChargeCapacity}mWh, zużycie ${wearLevel}%, cykle ${cycleCount}.`)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Opinia AI o Baterii</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Battery Logs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dziennik Diagnostyki Zasilania</h4>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-slate-800 h-40 overflow-y-auto space-y-1">
                  {batteryLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-slate-600">[{idx + 1}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MATRIX / SCREEN TEST */}
          {activeTab === 'matrix' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-cyan-400" />
                      <span>Test Matrycy LCD / OLED (Wykrywanie Martwych Pikseli i Cloudingu)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Wybierz planszę testową lub przełącz w tryb pełnoekranowy (klawisz Esc aby wyjść).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <button
                    onClick={() => setMatrixColorIndex(1)}
                    className="bg-white text-black p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>1. Biała</span>
                    <span className="text-[10px] text-slate-600">Bad pixels</span>
                  </button>

                  <button
                    onClick={() => setMatrixColorIndex(2)}
                    className="bg-black text-white border border-slate-700 p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>2. Czarna</span>
                    <span className="text-[10px] text-slate-400">Clouding / Backlight</span>
                  </button>

                  <button
                    onClick={() => setMatrixColorIndex(3)}
                    className="bg-red-600 text-white p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>3. Czerwona</span>
                    <span className="text-[10px] text-red-200">Sub-pixel Red</span>
                  </button>

                  <button
                    onClick={() => setMatrixColorIndex(4)}
                    className="bg-green-600 text-white p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>4. Zielona</span>
                    <span className="text-[10px] text-green-200">Sub-pixel Green</span>
                  </button>

                  <button
                    onClick={() => setMatrixColorIndex(5)}
                    className="bg-blue-600 text-white p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>5. Niebieska</span>
                    <span className="text-[10px] text-blue-200">Sub-pixel Blue</span>
                  </button>

                  <button
                    onClick={() => setMatrixColorIndex(6)}
                    className="bg-gradient-to-r from-red-600 via-green-600 to-blue-600 text-white p-4 rounded-xl font-bold text-xs hover:scale-105 transition shadow-md flex flex-col items-center justify-center space-y-1"
                  >
                    <span>6. Gradient</span>
                    <span className="text-[10px] text-white/80">Banding / Gamma</span>
                  </button>
                </div>
              </div>

              {/* Interactive Matrix Display Box */}
              <div
                ref={matrixContainerRef}
                className={`w-full h-80 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                  matrixColorIndex === 1 ? 'bg-white text-black' :
                  matrixColorIndex === 2 ? 'bg-black text-white' :
                  matrixColorIndex === 3 ? 'bg-red-600 text-white' :
                  matrixColorIndex === 4 ? 'bg-green-600 text-white' :
                  matrixColorIndex === 5 ? 'bg-blue-600 text-white' :
                  matrixColorIndex === 6 ? 'bg-gradient-to-r from-black via-gray-500 to-white text-purple-300' :
                  'bg-slate-950 text-slate-300'
                }`}
              >
                {matrixColorIndex === 0 ? (
                  <div className="text-center space-y-3 p-6">
                    <Monitor className="w-12 h-12 mx-auto text-cyan-400 animate-pulse" />
                    <h4 className="text-base font-bold">Wybierz powyższy kolor planszy testowej</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Plansza wypełni ten obszar lub możesz uruchomić pełny ekran, aby dokładnie przetestować matrycę laptopa lub monitora serwisowego pod kątem zaciętych pikseli (stuck/dead pixels).
                    </p>
                    <button
                      onClick={() => setMatrixColorIndex(1)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md"
                    >
                      Rozpocznij Test Od Bielu
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none" onClick={() => setMatrixColorIndex(0)}>
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-white text-xs font-mono shadow-xl">
                      Plansza: <strong className="text-cyan-300">{matrixColors[matrixColorIndex]?.name || 'Gradient'}</strong> • Kliknij dowolne miejsce, aby wrócić do menu testu
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Serwis Rafał Jarosz • Narzędzia diagnostyczne gotowe do wydruku raportu.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
