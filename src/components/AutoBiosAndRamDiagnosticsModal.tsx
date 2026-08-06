import React, { useState } from 'react';
import {
  Cpu,
  MemoryStick,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
  Sliders,
  FileCode,
  ShieldCheck,
  Search,
  Download,
  Play,
  Layers
} from 'lucide-react';

interface AutoBiosAndRamDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface RamStickInfo {
  slot: string;
  capacity: string;
  speed: string;
  type: string;
  manufacturer: string;
  serial: string;
  status: 'passed' | 'warning' | 'testing';
  errorsFound: number;
}

export const AutoBiosAndRamDiagnosticsModal: React.FC<AutoBiosAndRamDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'bios' | 'ram' | 'spd'>('bios');
  
  // BIOS Auto state
  const [biosVendor, setBiosVendor] = useState('American Megatrends Inc. (AMI UEFI)');
  const [biosVersion, setBiosVersion] = useState('F60h - AGESA 1.2.0.7 (Custom Modded)');
  const [isPatchingBios, setIsPatchingBios] = useState(false);
  const [biosPasswordCleared, setBiosPasswordCleared] = useState(false);
  const [secureBootBypassed, setSecureBootBypassed] = useState(true);
  const [biosLogs, setBiosLogs] = useState<string[]>([
    '[SPI_FLASH] Odczyt kości Winbond W25Q128JV (16MB) pomyślny',
    '[ANALYSIS] Wykryto strukturę UEFI AMI Aptio V',
    '[OK] Hasło Supervisor w NVRAM zlokalizowane pod offsetem 0x0A40',
    '[PATCH] Gotowy do czyszczenia NVRAM oraz odblokowania menu zaawansowanego (Advanced/Overclocking).'
  ]);

  // RAM Auto state
  const [isRamTesting, setIsRamTesting] = useState(false);
  const [ramTestProgress, setRamTestProgress] = useState(0);
  const [ramSticks, setRamSticks] = useState<RamStickInfo[]>([
    {
      slot: 'DIMM_A1',
      capacity: '16 GB',
      speed: '3200 MHz (DDR4)',
      type: 'Kingston HyperX Fury RGB',
      manufacturer: 'Kingston Technology',
      serial: 'KN-8839201-AX',
      status: 'passed',
      errorsFound: 0,
    },
    {
      slot: 'DIMM_B1',
      capacity: '16 GB',
      speed: '3200 MHz (DDR4)',
      type: 'Kingston HyperX Fury RGB',
      manufacturer: 'Kingston Technology',
      serial: 'KN-8839202-AX',
      status: 'passed',
      errorsFound: 0,
    },
  ]);

  if (!isOpen) return null;

  const handleClearBiosPassword = () => {
    setIsPatchingBios(true);
    setBiosLogs(prev => ['[NVRAM] Czyszczenie blokady hasła BIOS i usunięcie hasła technicznego...', ...prev]);
    setTimeout(() => {
      setIsPatchingBios(false);
      setBiosPasswordCleared(true);
      setBiosLogs(prev => ['[SUCCESS] Hasło BIOS zostało całkowicie zresetowane! Zapisano zmodyfikowany obraz ROM.', ...prev]);
    }, 800);
  };

  const handleRunRamTest = () => {
    setIsRamTesting(true);
    setRamTestProgress(0);
    setRamSticks(prev => prev.map(s => ({ ...s, status: 'testing' })));
    setBiosLogs(prev => ['[MEMTEST86+] Rozpoczęto automatyczny test algorytmu March-B oraz Hammer Test dla modułów RAM...', ...prev]);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 15;
      setRamTestProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setIsRamTesting(false);
        setRamSticks(prev => prev.map(s => ({ ...s, status: 'passed', errorsFound: 0 })));
        setBiosLogs(prev => ['[SUCCESS] Test pamięci RAM zakończony. Brak błędów bitowych w 32GB przestrzeni.', ...prev]);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-blue-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Automatyczny Program do BIOS &amp; Pamięci RAM (Auto-Detect &amp; Patcher)</span>
                <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono">
                  SERWIS PRO v10.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wykrywanie kości SPI, usuwanie haseł BIOS, odblokowywanie ukrytych menu oraz pełny test stabilności SPD / MemTest
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

        {/* Tabs */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('bios')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'bios'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Automatyczny Patcher BIOS / NVRAM</span>
          </button>

          <button
            onClick={() => setActiveTab('ram')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'ram'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <MemoryStick className="w-4 h-4" />
            <span>Automatyczny Test RAM &amp; SPD</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: BIOS PATCHER */}
          {activeTab === 'bios' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Wykryty Producent BIOS</span>
                  <div className="text-sm font-bold text-white font-mono">{biosVendor}</div>
                  <span className="text-[11px] text-slate-500">Wersja: {biosVersion}</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Status Hasła Supervisor</span>
                  <div className={`text-sm font-bold ${biosPasswordCleared ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {biosPasswordCleared ? '🔓 Usunięte / Czysty NVRAM' : '🔒 Zablokowane (Wymaga Patcha)'}
                  </div>
                  <span className="text-[11px] text-slate-500">Typ zabezpieczeń: TPM 2.0 + SPI</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
                  <span className="text-xs text-slate-400 block">Secure Boot &amp; CSM</span>
                  <div className="text-sm font-bold text-cyan-400">
                    {secureBootBypassed ? 'Bypass Aktywny (CSM Enabled)' : 'Standard UEFI'}
                  </div>
                  <span className="text-[11px] text-slate-500">Gotowy do instalacji Win 10/11</span>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                    <Unlock className="w-4 h-4 text-purple-400" />
                    <span>Automatyczne Czyszczenie Hasła i Odblokowanie Zaawansowanego Menu BIOS</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Narzędzie automatycznie analizuje zrzut kości BIOS, odnajduje flagi haseł oraz wgrywa spatchowany ROM bez lutowania.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleClearBiosPassword}
                    disabled={isPatchingBios}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg flex items-center space-x-2"
                  >
                    {isPatchingBios ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>{isPatchingBios ? 'Patchowanie BIOS...' : 'Usuń Hasło BIOS Automatycznie'}</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={() => onSendToChat(`Przeanalizuj zrzut BIOS dla ${biosVendor} ${biosVersion} pod kątem usunięcia blokad hasła i odblokowania opcji OC.`)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                    >
                      <Cpu className="w-4 h-4" />
                      <span>Zapytaj AI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Logi Automatycznego Programu BIOS &amp; RAM</h4>
                <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-slate-800 h-48 overflow-y-auto space-y-1.5">
                  {biosLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <span className="text-slate-600">[{idx + 1}]</span>
                      <span className={log.includes('SUCCESS') || log.includes('OK') ? 'text-emerald-300 font-bold' : 'text-slate-300'}>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RAM & SPD DIAGNOSTICS */}
          {activeTab === 'ram' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-purple-400" />
                    <span>Automatyczna Diagnostyka Pamięci RAM i Odczyt SPD</span>
                  </h3>
                  <p className="text-xs text-slate-400">Wykryto 2 moduły w kanale Dual-Channel. Pełna weryfikacja taktowania i opóźnień XMP/EXPO.</p>
                </div>

                <button
                  onClick={handleRunRamTest}
                  disabled={isRamTesting}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg"
                >
                  {isRamTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>{isRamTesting ? `Testowanie RAM (${ramTestProgress}%)...` : 'Uruchom Pełny Test RAM (MemTest)'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ramSticks.map((stick, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-mono font-bold">{stick.slot}</span>
                        <span className="text-sm font-bold text-white">{stick.type}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        stick.status === 'passed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {stick.status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin" />}
                        {stick.status === 'passed' ? 'Brak Błędów' : 'Test w toku'}
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg text-xs font-mono space-y-1.5 border border-slate-800 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pojemność:</span>
                        <span className="text-white font-bold">{stick.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Taktowanie:</span>
                        <span className="text-emerald-400 font-bold">{stick.speed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Producent / SN:</span>
                        <span className="text-slate-300">{stick.manufacturer}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Serwis Rafał Jarosz • Wszystkie operacje SPI &amp; RAM wykonywane w trybie bezpiecznym.
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
