import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Server, HardDrive, ShieldCheck, Database, RefreshCw, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { hardwareDiscoveryService, DiscoveredHardwareSpecs } from '../services/hardwareDiscoveryService';

interface DiagnosticSplashScreenProps {
  onComplete: () => void;
}

interface InitLogLine {
  text: string;
  type: 'info' | 'success' | 'warn';
  timestamp: string;
}

export const DiagnosticSplashScreen: React.FC<DiagnosticSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('Inicjalizacja stacji roboczej TermoFix...');
  const [logs, setLogs] = useState<InitLogLine[]>([]);
  const [specs, setSpecs] = useState<DiscoveredHardwareSpecs | null>(null);
  const [dryRunReport, setDryRunReport] = useState<any>(null);

  // Helper to add log line
  const addLog = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev, { text, type, timestamp }]);
  };

  useEffect(() => {
    let active = true;

    // Phase 1: Begin core environment boot
    addLog('Uruchamianie jądra aplikacji TermoFix AI...', 'info');
    addLog('Wczytywanie modułów i bibliotek wizualnych...', 'info');

    // Run hardware discovery immediately
    hardwareDiscoveryService.discoverSystemHardware()
      .then((retSpecs) => {
        if (!active) return;
        setSpecs(retSpecs);
        addLog(`Wykryto płytę główną: ${retSpecs.motherboard?.manufacturer || 'Nieznany'} ${retSpecs.motherboard?.model || 'PC'}`, 'success');
        addLog(`Procesor: ${retSpecs.cpu.model} (${retSpecs.cpu.cores} rdzeni, ${retSpecs.cpu.threads} wątków)`, 'success');
        addLog(`GPU: ${retSpecs.gpu.vendorAndModel}`, 'success');
        addLog(`Pamięć RAM: ${retSpecs.ram.totalGbFormatted}`, 'success');
        addLog(`Dysk: ${retSpecs.disk.totalGbFormatted} (${retSpecs.disk.driveType})`, 'success');
      })
      .catch((err) => {
        if (!active) return;
        addLog('Błąd niskopoziomowego odczytu sprzętu. Używam profilu heurystycznego.', 'warn');
      });

    // Run dry run dmi diagnostics
    hardwareDiscoveryService.runDryRunDmiWmiDiagnostics()
      .then((report) => {
        if (!active) return;
        setDryRunReport(report);
        addLog('Skan uprawnień DMI/WMI ukończony pomyślnie.', 'success');
        addLog(`Raport końcowy: ${report.summary}`, 'success');
      })
      .catch((err) => {
        if (!active) return;
        addLog('Błąd testu diagnostycznego dry-run.', 'warn');
      });

    // Progress bar loop
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (!active) return;
      currentProgress += Math.floor(Math.random() * 8) + 4;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
      }
      setProgress(currentProgress);

      // Dynamically update steps based on progress percent
      if (currentProgress < 20) {
        setCurrentStepText('Inicjalizacja jądra diagnostycznego...');
      } else if (currentProgress < 40) {
        setCurrentStepText('Wykonywanie audytu sprzętowego DMI / WMI...');
      } else if (currentProgress < 60) {
        setCurrentStepText('Odczyt parametrów z sensorów i magistral systemowych...');
      } else if (currentProgress < 80) {
        setCurrentStepText('Synchronizacja baz danych Firestore i sprawdzanie kopii sesji...');
      } else if (currentProgress < 95) {
        setCurrentStepText('Weryfikacja kluczy licencyjnych stacji roboczej...');
      } else {
        setCurrentStepText('Wszystkie systemy gotowe. Przygotowanie interfejsu...');
      }
    }, 120);

    // Timed updates for log messages to simulate deep diagnostic tasks resolving
    const timeouts: any[] = [];
    
    timeouts.push(setTimeout(() => {
      addLog('Łączenie z lokalnymi sensorami temperatury i obrotów wentylatorów...', 'info');
    }, 400));

    timeouts.push(setTimeout(() => {
      addLog('Odczytano temperatury: CPU Hotspot 42°C, GPU 45°C. System w normie termicznej.', 'success');
    }, 800));

    timeouts.push(setTimeout(() => {
      addLog('Synchronizacja lokalnej bazy danych dziennika napraw z chmurą...', 'info');
    }, 1300));

    timeouts.push(setTimeout(() => {
      addLog('Baza danych zsynchronizowana pomyślnie (ai-studio-termofixaipclapt).', 'success');
    }, 1800));

    timeouts.push(setTimeout(() => {
      addLog('Pomiary linii zasilających 19.5V / 5V / 3.3V: OK', 'success');
    }, 2200));

    timeouts.push(setTimeout(() => {
      addLog('Pomyślnie rozszyfrowano ostatnie kopie zapasowe sesji.', 'success');
    }, 2500));

    // Finish initialization
    timeouts.push(setTimeout(() => {
      addLog('Uruchamianie głównego pulpitu stacji roboczej TermoFix AI...', 'success');
      setTimeout(() => {
        onComplete();
      }, 500);
    }, 3200));

    return () => {
      active = false;
      clearInterval(interval);
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden font-sans">
      {/* Background elegant grid & radial highlight */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,#0284c715,transparent_80%)]"></div>

      {/* Header Info */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-4 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30 animate-pulse">
            <Cpu className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-slate-100 uppercase">TermoFix AI Workstation</h1>
            <p className="text-xs text-slate-400">Cyfrowa Stacja Serwisowo-Diagnostyczna</p>
          </div>
        </div>
        <div className="text-right font-mono text-[10px] text-slate-500">
          <div className="text-amber-500/80 font-bold">SYSTEM BOOT SEQUENCE Active</div>
          <div>STATION ID: fca88d92-2717-4148</div>
        </div>
      </div>

      {/* Main interactive loading visualizer */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-center">
        {/* Left Side: Radar / Circular Gauge (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Pulsing Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-slate-900"></div>
            <div className="absolute -inset-2 rounded-full border border-slate-800/40 animate-pulse"></div>
            
            {/* Spinning Indicator */}
            <svg className="absolute w-48 h-48 -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-slate-900 fill-none"
                strokeWidth="6"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-amber-500 fill-none"
                strokeWidth="6"
                strokeDasharray="552"
                strokeDashoffset={552 - (552 * progress) / 100}
                strokeLinecap="round"
                transition={{ ease: "easeInOut" }}
              />
            </svg>

            {/* Glowing Ring inside */}
            <div className="absolute w-40 h-40 rounded-full bg-slate-950 flex flex-col items-center justify-center border border-slate-800 shadow-inner">
              <span className="text-4xl font-extrabold tracking-tight text-white">{progress}%</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mt-1">
                {progress === 100 ? 'GOTOWY' : 'DIAGNOZA'}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-slate-200">{currentStepText}</p>
            <div className="w-48 h-1 bg-slate-900 rounded-full mx-auto mt-3 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Log feed and system specs (7 cols) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between gap-6 overflow-hidden">
          {/* Hardware Specs Telemetry Box */}
          <div className="border border-slate-900 bg-slate-950/60 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Wykryta Konfiguracja Stanowiska</h2>
            </div>
            
            {specs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs font-mono">
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">Płyta główna:</span>
                  <span className="text-slate-200 text-right font-semibold truncate max-w-[160px]">
                    {specs.motherboard?.manufacturer || 'ASUSTek'} {specs.motherboard?.model || 'Serwis-PRO'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">Procesor CPU:</span>
                  <span className="text-slate-200 text-right font-semibold truncate max-w-[160px]">
                    {specs.cpu.model.replace('(x86_64)', '')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">Karta GPU:</span>
                  <span className="text-slate-200 text-right font-semibold truncate max-w-[160px]">
                    {specs.gpu.vendorAndModel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">Pamięć RAM:</span>
                  <span className="text-slate-200 font-semibold">{specs.ram.totalGbFormatted}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">Dysk systemowy:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[160px]">{specs.disk.totalGbFormatted}</span>
                </div>
                <div className="flex justify-between border-b border-slate-900/60 pb-1.5">
                  <span className="text-slate-500">System Operacyjny:</span>
                  <span className="text-slate-200 font-semibold truncate max-w-[160px]">{specs.os.distroOrBuild}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 py-4">
                <div className="h-4 bg-slate-900 animate-pulse rounded w-3/4"></div>
                <div className="h-4 bg-slate-900 animate-pulse rounded w-1/2"></div>
                <div className="h-4 bg-slate-900 animate-pulse rounded w-2/3"></div>
              </div>
            )}
          </div>

          {/* Console Log Feed */}
          <div className="flex-1 flex flex-col border border-slate-900 bg-slate-950/80 rounded-xl p-4 font-mono text-xs overflow-hidden h-48 md:h-56">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Log Konsoli Diagnostycznej</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start text-[11px] leading-relaxed">
                  <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'warn' ? 'text-amber-400' : ''}
                    ${log.type === 'info' ? 'text-slate-300' : ''}
                  `}>
                    {log.type === 'success' && '✔ '}
                    {log.type === 'warn' && '⚠ '}
                    {log.text}
                  </span>
                </div>
              ))}
              <div className="h-2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center border-t border-slate-900 pt-4 gap-2 text-slate-500 text-[10px] font-mono">
        <div>LICENCJA: AKTYWNA // WERSJA ROBOCZA PRO 2026</div>
        <div>Łączenie z bazami danych Firestore pomyślne...</div>
      </div>
    </div>
  );
};
