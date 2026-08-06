import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Sliders,
  CheckCircle2,
  Sparkles,
  X,
  Zap,
  Info,
  Thermometer,
  Bell,
  Check
} from 'lucide-react';
import { ThermalData, SpotPoint } from '../types';

export interface ComponentThreshold {
  id: string;
  categoryName: string;
  componentRef: string;
  safeLimitC: number;
  warningLimitC: number;
  criticalLimitC: number;
  descriptionPl: string;
}

export const LAPTOP_COMPONENT_THRESHOLDS: ComponentThreshold[] = [
  {
    id: 'th-mosfet',
    categoryName: 'Tranzystor MOSFET 19V High-Side',
    componentRef: 'PQ202 / PQ203 (AON6504)',
    safeLimitC: 65,
    warningLimitC: 75,
    criticalLimitC: 85,
    descriptionPl: 'Główna linia wejściowa zasilacza 19V/20V VIN w laptopie. Temperatury >85°C oznaczają zwarcie w strukturze krzemowej MOSFET lub przebity kondensator SMD.',
  },
  {
    id: 'th-vrm',
    categoryName: 'Sekcja Zasilania CPU VCORE / DrMOS',
    componentRef: 'FDMF6808N / AOZ5117QI',
    safeLimitC: 75,
    warningLimitC: 82,
    criticalLimitC: 90,
    descriptionPl: 'Fazy zasilania procesora mobilnego. Przegrzewanie powyżej 90°C uszkadza kontroler PWM.',
  },
  {
    id: 'th-vram',
    categoryName: 'Kości Pamięci VRAM / GPU BGA',
    componentRef: 'GDDR6 / Samsung / SK Hynix',
    safeLimitC: 70,
    warningLimitC: 80,
    criticalLimitC: 88,
    descriptionPl: 'Kości BGA VRAM w laptopie. Długotrwała praca powyżej 88°C prowadzi do błędu Kod 43.',
  },
  {
    id: 'th-standby',
    categoryName: 'Przetwornica Standby 3.3V / 5V ALW',
    componentRef: 'PU1 (BQ24780S / RT8206A)',
    safeLimitC: 60,
    warningLimitC: 68,
    criticalLimitC: 78,
    descriptionPl: 'Układ zasilania stanu wstrzymania LDO. Nagrzewanie >78°C sygnalizuje przeciążenie prądowe.',
  }
];

export const DESKTOP_COMPONENT_THRESHOLDS: ComponentThreshold[] = [
  {
    id: 'th-vrm-desktop',
    categoryName: 'Sekcja Zasilania DrMOS VRM 12V EPS',
    componentRef: 'DrMOS 105A / SPS Z790',
    safeLimitC: 70,
    warningLimitC: 85,
    criticalLimitC: 100,
    descriptionPl: 'Fazy VCORE zasilane z wtyczki 12V EPS ATX. Płyty stacjonarne wytrzymują do 105°C na fazach VRM pod obciążeniem.',
  },
  {
    id: 'th-cpu-desktop',
    categoryName: 'Rdzeń Procesora Stacjonarnego CPU',
    componentRef: 'Intel Core i9 / AMD Ryzen 9',
    safeLimitC: 65,
    warningLimitC: 85,
    criticalLimitC: 95,
    descriptionPl: 'Rdzenie CPU LGA1700 / AM5. Temperatury powyżej 95°C uruchamiają Throttling termiczny PROCHOT.',
  },
  {
    id: 'th-gpu-desktop',
    categoryName: 'Karta Graficzna GPU HotSpot',
    componentRef: 'RTX 4080 / RX 7900 XTX',
    safeLimitC: 75,
    warningLimitC: 90,
    criticalLimitC: 102,
    descriptionPl: 'Najgorętszy punkt rdzenia GPU (Hotspot). Norma producenta dopuszcza do 100-105°C HotSpot.',
  },
  {
    id: 'th-pch-desktop',
    categoryName: 'Chipset Płyty Stacjonarnej PCH',
    componentRef: 'Intel Z790 / AMD X670',
    safeLimitC: 55,
    warningLimitC: 68,
    criticalLimitC: 80,
    descriptionPl: 'Mostek PCH obsługujący linie PCIe NVMe. Przekroczenie 80°C grozi rozłączaniem dysków SSD M.2.',
  }
];

export const DEFAULT_COMPONENT_THRESHOLDS = LAPTOP_COMPONENT_THRESHOLDS;

export interface TriggeredAlert {
  id: string;
  componentName: string;
  componentRef: string;
  measuredTempC: number;
  safeLimitC: number;
  criticalLimitC: number;
  severity: 'CRITICAL' | 'WARNING';
  deltaC: number;
  descriptionPl: string;
}

interface RealtimeThermalAlertSystemProps {
  thermalData?: ThermalData;
  presetTitle?: string;
  onSendToChat?: (prompt: string) => void;
}

export const RealtimeThermalAlertSystem: React.FC<RealtimeThermalAlertSystemProps> = ({
  thermalData,
  presetTitle,
  onSendToChat,
}) => {
  const [deviceType, setDeviceType] = useState<'laptop' | 'desktop'>('laptop');

  const [thresholds, setThresholds] = useState<ComponentThreshold[]>(() => {
    try {
      const saved = localStorage.getItem('termofix_thermal_thresholds');
      return saved ? JSON.parse(saved) : LAPTOP_COMPONENT_THRESHOLDS;
    } catch {
      return LAPTOP_COMPONENT_THRESHOLDS;
    }
  });

  const handleDeviceTypeChange = (type: 'laptop' | 'desktop') => {
    setDeviceType(type);
    setThresholds(type === 'laptop' ? LAPTOP_COMPONENT_THRESHOLDS : DESKTOP_COMPONENT_THRESHOLDS);
  };

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Re-evaluate alerts on thermalData change
  const currentMaxTemp = thermalData?.maxTemp || 0;
  const spotPoints = thermalData?.spotPoints || [];

  // Evaluate active alerts
  const evaluateAlerts = (): TriggeredAlert[] => {
    if (!currentMaxTemp || currentMaxTemp <= 0) return [];

    const alerts: TriggeredAlert[] = [];

    // Evaluate maxTemp against overall threshold profiles
    thresholds.forEach((th) => {
      // Find matching spot point or fallback to maxTemp
      const matchingPoint = spotPoints.find(
        (sp) => sp.label?.toLowerCase().includes(th.componentRef.toLowerCase()) || sp.tempC >= th.warningLimitC
      );

      const tempToEvaluate = matchingPoint ? matchingPoint.tempC : currentMaxTemp;

      if (tempToEvaluate >= th.criticalLimitC) {
        alerts.push({
          id: `alt-crit-${th.id}`,
          componentName: th.categoryName,
          componentRef: th.componentRef,
          measuredTempC: tempToEvaluate,
          safeLimitC: th.safeLimitC,
          criticalLimitC: th.criticalLimitC,
          severity: 'CRITICAL',
          deltaC: parseFloat((tempToEvaluate - th.safeLimitC).toFixed(1)),
          descriptionPl: th.descriptionPl,
        });
      } else if (tempToEvaluate >= th.warningLimitC) {
        alerts.push({
          id: `alt-warn-${th.id}`,
          componentName: th.categoryName,
          componentRef: th.componentRef,
          measuredTempC: tempToEvaluate,
          safeLimitC: th.safeLimitC,
          criticalLimitC: th.criticalLimitC,
          severity: 'WARNING',
          deltaC: parseFloat((tempToEvaluate - th.safeLimitC).toFixed(1)),
          descriptionPl: th.descriptionPl,
        });
      }
    });

    return alerts;
  };

  const activeAlerts = evaluateAlerts();
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'CRITICAL');
  const hasCritical = criticalAlerts.length > 0;
  const topAlert = activeAlerts.sort((a, b) => b.measuredTempC - a.measuredTempC)[0];

  // Reset dismissal if maxTemp changes significantly (+/- 3°C)
  useEffect(() => {
    setIsDismissed(false);
  }, [currentMaxTemp]);

  // Audio Beep Effect using Web Audio API
  useEffect(() => {
    if (activeAlerts.length > 0 && soundEnabled && !isMuted && !isDismissed) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();

          osc.type = hasCritical ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(hasCritical ? 880 : 587, audioCtxRef.current.currentTime); // A5 or D5 tone

          gain.gain.setValueAtTime(0.08, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);

          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.4);
        }
      } catch (err) {
        // Ignore audio play restrictions
      }
    }
  }, [activeAlerts.length, hasCritical, isMuted, isDismissed, soundEnabled]);

  // Update threshold values handler
  const handleThresholdChange = (id: string, field: 'safeLimitC' | 'warningLimitC' | 'criticalLimitC', val: number) => {
    const updated = thresholds.map((t) => (t.id === id ? { ...t, [field]: val } : t));
    setThresholds(updated);
    try {
      localStorage.setItem('termofix_thermal_thresholds', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save updated thresholds', e);
    }
  };

  const handleResetDefaultThresholds = () => {
    setThresholds(DEFAULT_COMPONENT_THRESHOLDS);
    localStorage.removeItem('termofix_thermal_thresholds');
  };

  // Trigger AI consultation from Alert
  const handleAskAIForAlert = (alert: TriggeredAlert) => {
    if (!onSendToChat) return;
    const prompt = `[ALERT DANGER] Wykryto niebezpieczne przekroczenie temperatury roboczej komponentu!
- Komponent: ${alert.componentName} (${alert.componentRef})
- Zmierzona temperatura termowizji: ${alert.measuredTempC}°C
- Dopuszczalny bezpieczny limit: ${alert.safeLimitC}°C (Przekroczenie o +${alert.deltaC}°C)
- Poziom zagrożenia: ${alert.severity === 'CRITICAL' ? 'KRYTYCZNY (Zwarcie / Uszkodzenie)' : 'OSTRZEŻENIE (Thermal Throttling)'}
Opis usterki: ${alert.descriptionPl}

Podaj natychmiastową procedurę awaryjną dla serwisanta: jakie pakiety zasilania odłączyć, gdzie wykonać próbę zwarciową i jak sprawdzić elementy pomiarowe.`;

    onSendToChat(prompt);
  };

  if (activeAlerts.length === 0 || isDismissed) {
    // Return quiet status badge when temperatures are safe or dismissed
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-md flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-100 block">Monitor Progów Termicznych: NORMA</span>
            <span className="text-[10.5px] text-slate-400 font-mono">
              Max Temp PCB: <strong className="text-emerald-400">{currentMaxTemp}°C</strong> | Dopuszczalne limity zachowane
            </span>
          </div>

          {/* Quick Device Context Selector */}
          <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px] ml-2">
            <button
              onClick={() => handleDeviceTypeChange('laptop')}
              className={`px-2 py-0.5 rounded font-bold transition ${
                deviceType === 'laptop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laptop (19V)
            </button>
            <button
              onClick={() => handleDeviceTypeChange('desktop')}
              className={`px-2 py-0.5 rounded font-bold transition ${
                deviceType === 'desktop' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PC Stacjonarny (12V)
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isDismissed && activeAlerts.length > 0 && (
            <button
              onClick={() => setIsDismissed(false)}
              className="text-[10px] text-amber-400 hover:underline font-mono"
            >
              Pokaż wygaszony alarm ({activeAlerts.length})
            </button>
          )}

          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Konfiguruj Progi Tolerancji Dopuszczalnej Temperatury"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Modal Threshold Configuration */}
        {isConfigOpen && renderConfigModal()}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border shadow-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
      hasCritical
        ? 'bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-red-500/80 shadow-red-950/60 ring-2 ring-red-500/40'
        : 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-amber-500/80 shadow-amber-950/60'
    }`}>
      
      {/* Background Animated Hazard Pattern Lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Warning Icon & Component Info */}
        <div className="flex items-start space-x-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            hasCritical
              ? 'bg-red-600/20 text-red-400 border-red-500/50 animate-bounce'
              : 'bg-amber-600/20 text-amber-400 border-amber-500/50 animate-pulse'
          }`}>
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase tracking-wide border ${
                hasCritical
                  ? 'bg-red-500 text-slate-950 border-red-300 animate-pulse'
                  : 'bg-amber-500 text-slate-950 border-amber-300'
              }`}>
                {hasCritical ? 'KRYTYCZNY ALARM TEMPERATURY' : 'OSTRZEŻENIE TERMICZNE'}
              </span>

              <span className="text-xs font-bold text-slate-100 font-mono">
                {topAlert.componentName} ({topAlert.componentRef})
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              Zmierzono: <strong className="text-red-400 text-sm font-bold">{topAlert.measuredTempC}°C</strong> (Bezpieczny limit:{' '}
              <span className="text-emerald-400">{topAlert.safeLimitC}°C</span>, Przekroczenie o{' '}
              <span className="text-red-400 font-bold">+{topAlert.deltaC}°C</span>)
            </p>

            <p className="text-[11px] text-slate-400 line-clamp-2 max-w-2xl">
              {topAlert.descriptionPl}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
          
          {/* Ask AI Gemini for Emergency Protocol */}
          {onSendToChat && (
            <button
              onClick={() => handleAskAIForAlert(topAlert)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 transition shadow-lg shadow-amber-950/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan Awaryjny AI</span>
            </button>
          )}

          {/* Mute Audio Beep */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
            }`}
            title={isMuted ? 'Włącz dźwiękowy sygnał alarmu' : 'Wycisz dźwiękowy sygnał alarmu'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />}
          </button>

          {/* Config thresholds button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition text-xs"
            title="Dostosuj Progi Dopuszczalne"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
          </button>

          {/* Dismiss Alert */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
            title="Zamknij ostrzeżenie wizualne"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Threshold Modal */}
      {isConfigOpen && renderConfigModal()}

    </div>
  );

  // Render Modal to Edit Safe Operating Thresholds per Component
  function renderConfigModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100">Dostosuj Progi Tolerancji Termicznej Komponentów</h3>
                <p className="text-[11px] text-slate-400">Określ granice ostrzeżeń i krytycznego alarmu dla poszczególnych układów PCB</p>
              </div>
            </div>

            <button
              onClick={() => setIsConfigOpen(false)}
              className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {thresholds.map((th) => (
              <div key={th.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{th.categoryName}</span>
                  <span className="bg-slate-900 text-amber-400 border border-slate-800 px-2 py-0.5 rounded font-mono text-[10.5px]">
                    {th.componentRef}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900 p-2 rounded-lg border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 block font-mono">Norma (Safe)</span>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <input
                        type="number"
                        value={th.safeLimitC}
                        onChange={(e) => handleThresholdChange(th.id, 'safeLimitC', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1 text-center text-xs font-mono font-bold text-emerald-300"
                      />
                      <span className="text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 block font-mono">Ostrzeżenie (Warn)</span>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <input
                        type="number"
                        value={th.warningLimitC}
                        onChange={(e) => handleThresholdChange(th.id, 'warningLimitC', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1 text-center text-xs font-mono font-bold text-amber-300"
                      />
                      <span className="text-slate-400">°C</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-red-500/30">
                    <span className="text-[10px] text-red-400 block font-mono">Alarm (Critical)</span>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <input
                        type="number"
                        value={th.criticalLimitC}
                        onChange={(e) => handleThresholdChange(th.id, 'criticalLimitC', parseInt(e.target.value) || 0)}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1 text-center text-xs font-mono font-bold text-red-300"
                      />
                      <span className="text-slate-400">°C</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-slate-400 italic leading-relaxed">{th.descriptionPl}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={handleResetDefaultThresholds}
              className="text-slate-400 hover:text-slate-200 underline font-mono text-[11px]"
            >
              Przywróć Ustawienia Fabryczne
            </button>

            <button
              onClick={() => setIsConfigOpen(false)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl transition"
            >
              Zapisz i Zamknij
            </button>
          </div>

        </div>
      </div>
    );
  }
};
