import React, { useState } from 'react';
import {
  Thermometer,
  Layers,
  Cpu,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  Info,
  Sliders
} from 'lucide-react';

interface ThermalCalibrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCalibrationComplete?: (emissivity: number, material: string) => void;
}

interface MaterialPreset {
  id: string;
  name: string;
  emissivity: number;
  description: string;
  icon: React.ReactNode;
}

const PRESETS: MaterialPreset[] = [
  {
    id: 'pcb',
    name: 'PCB (Solder Mask)',
    emissivity: 0.93,
    description: 'Matte green/black/blue circuit board surface.',
    icon: <Layers className="w-5 h-5" />
  },
  {
    id: 'heatsink',
    name: 'Aluminum Heatsink (Anodized)',
    emissivity: 0.85,
    description: 'Black or colored anodized aluminum cooling fins.',
    icon: <Thermometer className="w-5 h-5" />
  },
  {
    id: 'die',
    name: 'Silicon Die (Exposed)',
    emissivity: 0.70,
    description: 'Bare silicon chip surface (shiny but non-metallic).',
    icon: <Cpu className="w-5 h-5" />
  },
  {
    id: 'metal_shield',
    name: 'EMI Shield (Polished Metal)',
    emissivity: 0.15,
    description: 'Highly reflective metal covers. WARNING: Very hard to measure accurately. Use Kapton tape.',
    icon: <Target className="w-5 h-5" />
  }
];

export const ThermalCalibrationWizardModal: React.FC<ThermalCalibrationWizardModalProps> = ({
  isOpen,
  onClose,
  onCalibrationComplete
}) => {
  const [step, setStep] = useState(1);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [customEmissivity, setCustomEmissivity] = useState<number>(0.95);
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    let finalEmissivity = 0.95;
    let finalMaterial = 'Custom';

    if (useCustom) {
      finalEmissivity = customEmissivity;
    } else {
      const preset = PRESETS.find(p => p.id === selectedPresetId);
      if (preset) {
        finalEmissivity = preset.emissivity;
        finalMaterial = preset.name;
      }
    }

    if (onCalibrationComplete) {
      onCalibrationComplete(finalEmissivity, finalMaterial);
    }
    setStep(1);
    setSelectedPresetId('');
    setUseCustom(false);
    onClose();
  };

  const selectedPreset = PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Kreator Kalibracji Termowizji</h2>
              <p className="text-[10px] text-amber-400 font-mono mt-0.5">Optymalizacja Emisyjności Kamery IR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 rounded-full z-0 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
            
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= num ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Wybierz materiał docelowy</h3>
                <p className="text-sm text-slate-400">Różne materiały emitują promieniowanie podczerwone w różny sposób. Wybierz materiał, który będziesz analizować.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setUseCustom(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      selectedPresetId === preset.id && !useCustom
                        ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${selectedPresetId === preset.id && !useCustom ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                        {preset.icon}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">{preset.name}</div>
                        <div className="text-xs font-mono text-amber-500">ε = {preset.emissivity.toFixed(2)}</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{preset.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-xs text-slate-500 font-bold uppercase">LUB</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              <button
                onClick={() => {
                  setUseCustom(true);
                  setSelectedPresetId('');
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  useCustom
                    ? 'bg-amber-950/40 border-amber-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${useCustom ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Własna Emisyjność (Custom)</div>
                    <p className="text-[11px] text-slate-400">Ręcznie wprowadź współczynnik emisyjności.</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">Potwierdź Emisyjność</h3>
                <p className="text-sm text-slate-400">Upewnij się, że ustawiony współczynnik jest właściwy dla analizowanego elementu.</p>
              </div>

              {useCustom ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                  <label className="text-sm font-bold text-slate-300">Wprowadź współczynnik (0.01 - 1.00)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1.00"
                    value={customEmissivity}
                    onChange={(e) => setCustomEmissivity(parseFloat(e.target.value))}
                    className="w-32 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-2xl font-black font-mono text-center text-amber-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-amber-500/10 rounded-full text-amber-400 mb-2">
                    {selectedPreset?.icon}
                  </div>
                  <h4 className="text-lg font-bold text-slate-200">{selectedPreset?.name}</h4>
                  <div className="text-4xl font-black font-mono text-amber-400">
                    ε = {selectedPreset?.emissivity.toFixed(2)}
                  </div>
                </div>
              )}

              <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-200/70 leading-relaxed">
                  <strong className="text-blue-300 block mb-1">Dlaczego to jest ważne?</strong>
                  Kamera termowizyjna oblicza temperaturę na podstawie odbieranego promieniowania podczerwonego. Złe ustawienie emisyjności (np. mierzenie błyszczącego metalu przy ε=0.95) spowoduje zaniżenie wskazań temperatury nawet o kilkadziesiąt stopni.
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-2xl font-bold text-white">Gotowe!</h3>
                <p className="text-slate-400 text-sm">
                  Kamera jest teraz skalibrowana do pomiaru <strong className="text-amber-400">{useCustom ? 'własnego materiału' : selectedPreset?.name}</strong> z emisyjnością <strong className="font-mono text-amber-400">ε={useCustom ? customEmissivity : selectedPreset?.emissivity.toFixed(2)}</strong>.
                </p>
              </div>

              {(selectedPresetId === 'metal_shield' || (useCustom && customEmissivity < 0.5)) && (
                <div className="mt-6 bg-rose-950/40 border border-rose-900/50 rounded-xl p-4 flex gap-3 max-w-md w-full text-left">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-200/70 leading-relaxed">
                    <strong className="text-rose-300 block mb-1">Ostrzeżenie: Niska emisyjność!</strong>
                    Pomiary powierzchni o tak niskiej emisyjności są bardzo podatne na odbicia ciepła z otoczenia (np. z Twojego ciała lutownicy). Zaleca się naklejenie taśmy izolacyjnej (Kapton) lub zamalowanie punktu markerem i pomiar z ε=0.95.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center shrink-0">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              step === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            Wstecz
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={(step === 1 && !selectedPresetId && !useCustom)}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dalej <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              Zakończ Kalibrację
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
