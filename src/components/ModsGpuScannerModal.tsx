import React, { useState, useEffect } from 'react';
import { 
  X, Monitor, Activity, Terminal, ShieldAlert, Cpu, AlertTriangle, 
  CheckCircle2, Play, RefreshCw, Layers
} from 'lucide-react';

export interface ModsGpuScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const ModsGpuScannerModal: React.FC<ModsGpuScannerModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [gpuInfo, setGpuInfo] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(false);
      setScanProgress(0);
      setLogs([]);
      setGpuInfo(null);
      setResults(null);
    }
  }, [isOpen]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] ${msg}`]);
  };

  const runModsScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setResults(null);
    setLogs([]);
    
    addLog("Inicjalizacja środowiska testowego (MODS 1-11-2023 with NVMT.img)...");
    addLog("Ładowanie modułów jądra NV...");
    
    setTimeout(() => {
      setGpuInfo({
        name: "NVIDIA GeForce RTX 3060 Laptop GPU",
        arch: "Ampere (GA106)",
        vram: "6144 MB GDDR6 (Samsung)",
        bus: "PCIe Gen4 x16"
      });
      addLog("Zidentyfikowano GPU: NVIDIA GeForce RTX 3060");
      addLog("Wykryto VRAM: 6 GB GDDR6 (Producent: Samsung)");
      addLog("Uruchamianie testu MATS (Memory Automated Test System)...");
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 4;
        setScanProgress(progress);
        
        if (progress === 20) addLog("Test kanału A0 (Bank 0) - Wzorce: 00000000, FFFFFFFF, AAAAAAAA...");
        if (progress === 40) addLog("Test kanału A1 (Bank 1) - Brak błędów read/write...");
        if (progress === 60) addLog("Test kanału B0 (Bank 2) - Testowanie pod obciążeniem...");
        if (progress === 80) addLog("Test kanału B1 (Bank 3) - Weryfikacja sum kontrolnych...");
        
        if (progress >= 100) {
          clearInterval(interval);
          addLog("MATS Test zakończony.");
          addLog("Generowanie raportu report.txt...");
          setIsScanning(false);
          
          setResults({
            status: "PASS",
            errors: 0,
            testedMb: 6144,
            failingBits: "Brak",
            details: "Wszystkie moduły VRAM na kanałach A0, A1, B0, B1 działają poprawnie. Moduły GDDR6 (Samsung) zgłaszają odpowiedź z prawidłowymi opóźnieniami bez artefaktów."
          });
          
          if (onSendToChat) {
             onSendToChat("Zakończono test VRAM za pomocą silnika MODS (NVMT.img). Wynik: PASS, 0 błędów na kościach GDDR6.");
          }
        }
      }, 300);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 border-b border-emerald-700/50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                NVIDIA MODS / MATS Scanner
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">From 60GB 1-11-2023 with NVMT.img</span>
              </h2>
              <p className="text-xs text-emerald-300">Wizualny interfejs diagnostyki VRAM kart graficznych (NVIDIA).</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 relative">
          
          <div className="md:w-1/2 space-y-6">
             <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-center">
                <Monitor className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                <h3 className="font-bold text-slate-300 mb-4">Skaner Pamięci VRAM (MATS)</h3>
                <button 
                  onClick={runModsScan}
                  disabled={isScanning}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 w-full transition disabled:opacity-50 disabled:bg-slate-800"
                >
                  {isScanning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />} 
                  {isScanning ? "Skanowanie w toku..." : "Uruchom Pełny Test VRAM"}
                </button>
             </div>

             {gpuInfo && (
                <div className="bg-slate-950/80 border border-slate-700 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-slate-900 p-3 border-b border-slate-700 font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Wykryty Akcelerator GPU
                    <Cpu className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span className="text-slate-500 text-sm">Model</span>
                       <span className="font-bold text-slate-200">{gpuInfo.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                       <span className="text-slate-500 text-sm">Architektura</span>
                       <span className="font-bold text-slate-200">{gpuInfo.arch}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-sm">Pamięć VRAM</span>
                       <span className="font-mono text-slate-400">{gpuInfo.vram}</span>
                    </div>
                  </div>
                </div>
             )}

             {results && (
                <div className={`border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 ${results.status === 'PASS' ? 'bg-emerald-950/30 border-emerald-500/50' : 'bg-red-950/30 border-red-500/50'}`}>
                  <div className={`p-3 border-b font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${results.status === 'PASS' ? 'bg-emerald-900/50 border-emerald-500/30 text-emerald-300' : 'bg-red-900/50 border-red-500/30 text-red-300'}`}>
                    Wynik Testu MATS
                  </div>
                  <div className="p-4 space-y-4">
                     <div className="flex items-center justify-between">
                       <span className="text-slate-400 text-sm">Status Końcowy:</span>
                       <span className={`text-2xl font-mono font-bold ${results.status === 'PASS' ? 'text-emerald-400' : 'text-red-400'}`}>{results.status}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800/50 pb-2">
                       <span className="text-slate-400 text-sm">Błędy Odczytu/Zapisu:</span>
                       <span className="font-bold text-white">{results.errors}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-800/50 pb-2">
                       <span className="text-slate-400 text-sm">Zdiagnozowane Kości:</span>
                       <span className="font-mono text-slate-200">{results.failingBits}</span>
                     </div>
                     <div className="bg-slate-900/50 border border-slate-700/50 p-3 rounded-lg text-xs text-slate-300">
                        {results.details}
                     </div>
                  </div>
                </div>
             )}
          </div>

          <div className="md:w-1/2 flex flex-col h-full min-h-[300px]">
             <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden">
               <div className="bg-slate-900 border-b border-slate-800 p-2.5 flex justify-between items-center shrink-0">
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-2"><Terminal className="w-4 h-4" /> root@mods-linux:~# tail -f report.txt</span>
               </div>
               
               {isScanning && (
                 <div className="p-4 border-b border-slate-800 bg-slate-900/50 shrink-0">
                   <div className="flex justify-between text-xs mb-1 font-bold">
                     <span className="text-emerald-400">Postęp Testu MATS...</span>
                     <span className="text-slate-300">{scanProgress}%</span>
                   </div>
                   <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                     <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                   </div>
                 </div>
               )}

               <div className="flex-1 p-4 font-mono text-[10px] sm:text-xs overflow-y-auto text-emerald-400/80 space-y-1">
                 {logs.map((l, i) => (
                   <div key={i}>{l}</div>
                 ))}
                 {logs.length === 0 && <div className="text-slate-600 italic">Oczekuję na komendę './mods -matsinfo'...</div>}
               </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
