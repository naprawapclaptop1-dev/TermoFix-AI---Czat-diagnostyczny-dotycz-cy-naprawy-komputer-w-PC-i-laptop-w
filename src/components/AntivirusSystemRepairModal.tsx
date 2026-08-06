import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, Play, RefreshCw, Trash2, Lock,
  MinusCircle, Wrench, Cpu, Download, X, CheckCircle2,
  AlertTriangle, HardDrive, Terminal, Zap, FileCode, Search, Activity
} from 'lucide-react';

export interface AntivirusSystemRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const AntivirusSystemRepairModal: React.FC<AntivirusSystemRepairModalProps> = ({
  isOpen, onClose, onSendToChat
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanningFile, setCurrentScanningFile] = useState('');
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [threats, setThreats] = useState<any[]>([
    { id: '1', name: 'Trojan.Win32.Generic.Agent', type: 'Zagrożenie Krytyczne', path: 'C:\\Windows\\Temp\\srv.exe', status: 'Wykryto' },
    { id: '2', name: 'Adware.Browser.Injector', type: 'Średnie Ryzyko', path: 'C:\\Users\\Public\\inject.dll', status: 'Wykryto' }
  ]);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setCurrentScanningFile('Zakończono.');
            return 100;
          }
          const increment = Math.random() * 3 + 1;
          const filesArr = [
            'C:\\Windows\\System32\\ntoskrnl.exe',
            'C:\\Program Files\\NVIDIA Corporation\\nvlddmkm.sys',
            'C:\\Windows\\SysWOW64\\kernel32.dll',
            'Skanowanie sektora bootowania (MBR/GPT)...',
            'Sprawdzanie rejestru (HKLM\\Software)...',
          ];
          setCurrentScanningFile(filesArr[Math.floor(Math.random() * filesArr.length)]);
          setScannedFilesCount((c) => c + Math.floor(Math.random() * 150) + 10);
          return Math.min(prev + increment, 100);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);
    setThreats([
      { id: '1', name: 'Ransom.Win32.WannaCry.X', type: 'Krytyczne', path: 'C:\\Users\\Public\\Documents\\enc.exe', status: 'Wykryto' },
      { id: '2', name: 'Rootkit.MBR.Infection', type: 'Krytyczne', path: 'Sektor Rozruchowy (Rozmiar: 512B)', status: 'Wykryto' },
      { id: '3', name: 'VRAM_Fault_Simulator.sys', type: 'Ostrzeżenie', path: 'C:\\Windows\\System32\\drivers\\vram_flt.sys', status: 'Wykryto' },
    ]);
  };

  const handleFixAll = () => {
    setThreats((prev) => prev.map(t => ({ ...t, status: 'Usunięto / Naprawiono' })));
    if (onSendToChat) {
      onSendToChat('Zakończono pełne skanowanie systemu i rejestru. Usunięto złośliwe oprogramowanie i usunięto usterki MBR/GPT.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-red-500/30 w-full max-w-5xl h-[85vh] rounded-xl shadow-[0_0_50px_-15px_rgba(239,68,68,0.3)] flex flex-col overflow-hidden relative">
        
        {/* TOP BAR */}
        <div className="bg-gradient-to-r from-red-950/80 to-slate-900 border-b border-red-500/30 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
              {isScanning && <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"></div>}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide uppercase">
                TermoFix AI - Zintegrowany Antywirus & Menedżer Napraw
              </h2>
              <p className="text-red-400 text-xs font-mono font-bold mt-1">
                STATUS: ZAAWANSOWANA ANALIZA BEHAWIORALNA AKTYWNA | SILNIK HEURYSTYCZNY ONLINE
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-900 p-2.5 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* MAIN SPLIT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: RADAR & STATS */}
          <div className="w-1/3 bg-slate-950 border-r border-slate-800 p-6 flex flex-col space-y-6 overflow-y-auto">
            
            {/* Radar / Status Circular */}
            <div className="relative w-full aspect-square bg-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.4)_100%)]"></div>
              {/* Radar Sweep */}
              <div className={`absolute inset-0 origin-center bg-gradient-to-t from-red-500/20 to-transparent w-1/2 left-1/2 ${isScanning ? 'animate-spin' : 'hidden'}`} style={{ transformOrigin: 'left center' }}></div>
              
              <div className="z-10 flex flex-col items-center">
                <span className="text-5xl font-black text-white font-mono">
                  {Math.round(scanProgress)}%
                </span>
                <span className={`text-xs font-bold mt-2 uppercase tracking-widest ${isScanning ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                  {isScanning ? 'SKANOWANIE TRWA' : 'GOTOWY'}
                </span>
              </div>

              {/* Grid lines */}
              <div className="absolute inset-0 border border-slate-700/50 rounded-full m-8"></div>
              <div className="absolute inset-0 border border-slate-700/30 rounded-full m-16"></div>
              <div className="absolute w-full h-px bg-slate-800 top-1/2 -translate-y-1/2"></div>
              <div className="absolute h-full w-px bg-slate-800 left-1/2 -translate-x-1/2"></div>
            </div>

            {/* Scan Control */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <button
                onClick={startScan}
                disabled={isScanning}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-black py-4 rounded-lg uppercase tracking-wider flex items-center justify-center gap-3 transition-colors shadow-lg"
              >
                {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isScanning ? 'Skanowanie w toku...' : 'Rozpocznij Głęboki Skan (Rootkit/VRAM)'}
              </button>
            </div>

            {/* System Info Summary */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statystyki silnika analizy</h3>
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
                <div className="flex justify-between"><span>Przeskanowane pliki:</span> <span className="text-cyan-400">{scannedFilesCount.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Wykryte zagrożenia:</span> <span className="text-red-400 font-bold">{threats.length}</span></div>
                <div className="flex justify-between"><span>Baza sygnatur AI:</span> <span className="text-emerald-400">AKTUALNA (v2026.08)</span></div>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: THREAT LIST & DETAILS */}
          <div className="flex-1 bg-slate-900 p-6 flex flex-col">
            
            {/* Live Log */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6 font-mono text-xs flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-3 w-full">
                <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
                <span className="text-slate-400 shrink-0">Aktualny cel skanowania:</span>
                <span className="text-green-400 truncate flex-1">{currentScanningFile || 'Oczekiwanie na uruchomienie skanera...'}</span>
              </div>
            </div>

            {/* Header for list */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500" /> Wykryte Problemy / Zagrożenia
              </h3>
              {threats.some(t => t.status === 'Wykryto') && !isScanning && (
                <button
                  onClick={handleFixAll}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-2 shadow-lg"
                >
                  <Wrench className="w-4 h-4" /> Napraw / Usuń Wszystko
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {threats.map((threat, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-950/50 p-2.5 rounded-lg border border-red-500/20 shrink-0 mt-1 sm:mt-0">
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{threat.name}</h4>
                      <div className="text-[11px] text-slate-500 font-mono mt-1 mb-2">Ścieżka: {threat.path}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                          {threat.type}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${threat.status === 'Wykryto' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          Status: {threat.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {threat.status === 'Wykryto' && !isScanning && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-lg transition" title="Kwarantanna">
                        <Lock className="w-4 h-4" />
                      </button>
                      <button className="bg-red-900/50 hover:bg-red-800 text-red-200 p-2 rounded-lg transition border border-red-900" title="Usuń na stałe">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {threat.status !== 'Wykryto' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> Zabezpieczono
                    </div>
                  )}
                </div>
              ))}
              
              {threats.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <ShieldCheck className="w-16 h-16 opacity-20" />
                  <p className="text-sm">Brak wykrytych zagrożeń. System wydaje się czysty.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
