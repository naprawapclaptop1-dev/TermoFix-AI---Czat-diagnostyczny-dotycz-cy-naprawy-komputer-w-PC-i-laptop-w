import React, { useState, useEffect } from 'react';
import {
  Zap,
  Activity,
  AlertOctagon,
  ShieldAlert,
  X,
  Play,
  CheckCircle2,
  Wrench,
  Cpu,
  Power,
  RotateCcw,
  Flame
} from 'lucide-react';

export interface AtxPowerSupplyRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AtxPowerSupplyRepairModal: React.FC<AtxPowerSupplyRepairModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [phase, setPhase] = useState<'idle' | 'discharging' | 'diagnosing' | 'repairing' | 'testing' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [voltages, setVoltages] = useState({
    v12: 0,
    v5: 0,
    v33: 0,
    v5sb: 0,
    v12neg: 0,
    pg: 0 // Power Good signal
  });

  const [faultFound, setFaultFound] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      setProgress(0);
      setLog([]);
      setVoltages({ v12: 0, v5: 0, v33: 0, v5sb: 0, v12neg: 0, pg: 0 });
      setFaultFound(null);
    }
  }, [isOpen]);

  const addLog = (msg: string) => {
    setLog(prev => [...prev, msg]);
  };

  const runRepairProcess = () => {
    setPhase('discharging');
    setLog([]);
    setProgress(0);
    setVoltages({ v12: 0, v5: 0, v33: 0, v5sb: 0, v12neg: 0, pg: 0 });
    
    addLog('[OSTRZEŻENIE] Rozpoczynam procedurę naprawy zasilacza ATX.');
    addLog('[KROK 1] Rozładowywanie kondensatorów obwodu pierwotnego (400V)...');

    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 10;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));

      if (p === 100) {
        clearInterval(interval);
        setTimeout(() => startDiagnosis(), 500);
      }
    }, 200);
  };

  const startDiagnosis = () => {
    setPhase('diagnosing');
    setProgress(0);
    addLog('[KROK 2] Pomiary na stronie pierwotnej. Mostek prostowniczy: OK.');
    addLog('Sprawdzanie układu APFC...');
    
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));
      
      if (p > 30 && p < 40) setVoltages(prev => ({ ...prev, v5sb: 5.11 }));
      if (p > 60 && !faultFound) {
        addLog('[ZWARCIE WYKRYTE] Linia 12V zaniżona (1.2V).');
        setFaultFound('Zwarty MOSFET po stronie wtórnej lub uszkodzony kondensator filtrujący.');
        setVoltages(prev => ({ ...prev, v12: 1.2, v5: 5.05, v33: 3.32 }));
      }

      if (p === 100) {
        clearInterval(interval);
        setTimeout(() => startRepair(), 1000);
      }
    }, 150);
  };

  const startRepair = () => {
    setPhase('repairing');
    setProgress(0);
    addLog('[KROK 3] Demontaż uszkodzonego komponentu...');
    addLog('Wylutowywanie MOSFET SR (Synchronous Rectifier)...');
    
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 5;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));

      if (p > 40 && p < 45) {
         addLog('Wymiana przepalonych kondensatorów 3300uF 16V...');
      }

      if (p > 80 && p < 85) {
         addLog('Lutowanie nowych elementów i czyszczenie PCB alkoholem izopropylowym.');
      }

      if (p === 100) {
        clearInterval(interval);
        setTimeout(() => startTesting(), 1000);
      }
    }, 200);
  };

  const startTesting = () => {
    setPhase('testing');
    setProgress(0);
    addLog('[KROK 4] Aktywacja zasilacza (PS-ON do masy). Testy obciążeniowe sztucznym obciążeniem...');
    
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 10;
      if (p > 100) p = 100;
      setProgress(Math.floor(p));

      // Simulate voltages climbing
      setVoltages({
        v12: Number((12.05 * (p/100)).toFixed(2)),
        v5: Number((5.10 * (p/100)).toFixed(2)),
        v33: Number((3.34 * (p/100)).toFixed(2)),
        v5sb: 5.11,
        v12neg: Number((-11.95 * (p/100)).toFixed(2)),
        pg: p > 90 ? 300 : 0 // Power Good signal ~300ms
      });

      if (p === 100) {
        clearInterval(interval);
        addLog('Wszystkie napięcia w normie ATX. Sygnał Power Good prawidłowy.');
        addLog('[ZAKOŃCZONO] Zasilacz sprawny. Gotowy do montażu w PC.');
        setPhase('success');
      }
    }, 150);
  };

  const handleShare = () => {
    if (onSendToChat) {
      onSendToChat(`Zakończono kompleksową naprawę zasilacza ATX. Wymieniono uszkodzone tranzystory MOSFET i kondensatory filtrujące po stronie wtórnej. Wszystkie napięcia powróciły do stabilnego poziomu (12V, 5V, 3.3V). Zasilacz przeszedł test obciążeniowy pomyślnie.`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500/20 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Stanowisko Naprawy Zasilaczy ATX
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  HIGH VOLTAGE
                </span>
              </h2>
              <p className="text-sm text-slate-400">Diagnostyka strony pierwotnej i wtórnej, układów PFC i PWM</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-4 flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
            <div className="text-amber-200/90 text-sm">
              <strong className="text-amber-400 block mb-1">Ostrzeżenie o niebezpieczeństwie (400V)</strong>
              Naprawa zasilaczy impulsowych wiąże się z pracą pod napięciem sieciowym i niebezpiecznym ładunkiem w kondensatorach filtrujących. Procedura automatycznie rozładowuje kondensatory przed demontażem płytki PCB.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" /> Pomiary Napięć ATX
                </h3>
                
                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-yellow-500 font-bold">+12V</span>
                    <span className={`text-lg ${voltages.v12 > 11.4 && voltages.v12 < 12.6 ? 'text-green-400' : 'text-red-400'}`}>
                      {voltages.v12 > 0 ? `${voltages.v12.toFixed(2)}V` : '0.00V'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-red-500 font-bold">+5V</span>
                    <span className={`text-lg ${voltages.v5 > 4.75 && voltages.v5 < 5.25 ? 'text-green-400' : 'text-red-400'}`}>
                      {voltages.v5 > 0 ? `${voltages.v5.toFixed(2)}V` : '0.00V'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-orange-500 font-bold">+3.3V</span>
                    <span className={`text-lg ${voltages.v33 > 3.135 && voltages.v33 < 3.465 ? 'text-green-400' : 'text-red-400'}`}>
                      {voltages.v33 > 0 ? `${voltages.v33.toFixed(2)}V` : '0.00V'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-purple-500 font-bold">+5VSB</span>
                    <span className={`text-lg ${voltages.v5sb > 4.75 && voltages.v5sb < 5.25 ? 'text-green-400' : 'text-red-400'}`}>
                      {voltages.v5sb > 0 ? `${voltages.v5sb.toFixed(2)}V` : '0.00V'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-blue-500 font-bold">-12V</span>
                    <span className={`text-lg ${voltages.v12neg < -10.8 && voltages.v12neg > -13.2 ? 'text-green-400' : (voltages.v12neg < 0 ? 'text-red-400' : 'text-slate-500')}`}>
                      {voltages.v12neg < 0 ? `${voltages.v12neg.toFixed(2)}V` : '0.00V'}
                    </span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400 font-bold">PG (ms)</span>
                    <span className={`text-lg ${voltages.pg >= 100 && voltages.pg <= 500 ? 'text-green-400' : 'text-red-400'}`}>
                      {voltages.pg > 0 ? `${voltages.pg}ms` : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {phase !== 'idle' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400 font-mono uppercase font-bold tracking-wider">
                      Status Operacji: {phase}
                    </span>
                    <span className="text-xs text-cyan-400 font-mono font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${phase === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {phase === 'idle' ? (
                <button
                  onClick={runRepairProcess}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl p-4 font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all"
                >
                  <Wrench className="w-5 h-5" /> Rozpocznij Pełną Naprawę Zasilacza
                </button>
              ) : phase === 'success' ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={runRepairProcess}
                    className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-3 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" /> Nowa Naprawa
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Zgłoś do AI
                  </button>
                </div>
              ) : (
                <button disabled className="w-full bg-slate-800 text-slate-400 rounded-xl p-4 font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                  <Flame className="w-5 h-5 animate-pulse text-rose-500" /> Procedura w toku...
                </button>
              )}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden h-[400px]">
              <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 shrink-0">
                <TerminalIcon />
                <span className="text-xs font-mono text-slate-400">Terminal Diagnostyczny PSU</span>
              </div>
              <div className="flex-1 p-4 font-mono text-[11px] text-emerald-400/80 overflow-y-auto space-y-2 leading-relaxed bg-[#0a0a0a] shadow-inner">
                {log.map((entry, idx) => (
                  <div key={idx} className={`${entry.includes('[OSTRZEŻENIE]') ? 'text-amber-400 font-bold' : ''} ${entry.includes('[ZWARCIE WYKRYTE]') ? 'text-rose-400 font-bold' : ''} ${entry.includes('[ZAKOŃCZONO]') ? 'text-emerald-300 font-bold' : ''}`}>
                    <span className="text-slate-600 mr-2">{'>'}</span>{entry}
                  </div>
                ))}
                {phase !== 'idle' && phase !== 'success' && (
                  <div className="animate-pulse flex items-center gap-2 text-slate-500">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce"></span>
                    Analiza układu...
                  </div>
                )}
                {log.length === 0 && phase === 'idle' && (
                  <div className="text-slate-600 italic">Oczekuję na rozpoczęcie procedury naprawczej...</div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

function TerminalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
  );
}
