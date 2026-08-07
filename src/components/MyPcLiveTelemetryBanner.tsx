import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Monitor,
  Cpu,
  HardDrive,
  Download,
  Zap,
  CheckCircle2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Terminal,
  Flame,
  Globe,
  Battery,
  ShieldCheck,
  Edit3,
  RotateCcw
} from 'lucide-react';
import {
  fetchSystemTelemetry,
  saveSpecsOverride,
  clearSpecsOverride,
  HardwareTelemetry
} from '../services/telemetryService';

interface MyPcLiveTelemetryBannerProps {
  onOpenInstallerModal: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const MyPcLiveTelemetryBanner: React.FC<MyPcLiveTelemetryBannerProps> = ({
  onOpenInstallerModal,
  onSendToChat
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<HardwareTelemetry | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    deviceType: 'DESKTOP' as 'LAPTOP' | 'DESKTOP',
    osName: '',
    cpuCores: '',
    ramGb: '',
    diskGb: '',
    gpuRenderer: ''
  });

  const loadTelemetry = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSystemTelemetry();
      setTelemetry(data);
      setEditForm({
        deviceType: data.deviceType,
        osName: data.osName,
        cpuCores: data.cpuModel,
        ramGb: data.ramTotalFormatted,
        diskGb: data.diskTotalFormatted,
        gpuRenderer: data.gpuRenderer
      });
    } catch (e) {
      console.error('Error fetching hardware telemetry:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, []);

  const handleSaveSpecs = () => {
    saveSpecsOverride(editForm);
    setIsEditingSpecs(false);
    loadTelemetry();
  };

  const handleResetTelemetry = () => {
    clearSpecsOverride();
    setIsEditingSpecs(false);
    loadTelemetry();
  };

  const handleDownloadDesktopExe = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);

    const appUrl = window.location.href;
    const installerCmdScript = `@echo off
:: ===============================================================
:: TERMOFIX AI - DEDYOWANY INSTALATOR PULPITOWY WINDOWS 10/11 x64
:: ===============================================================
if "%PROCESSOR_ARCHITECTURE%"=="x86" (
  if defined PROCESSOR_ARCHITEW6432 (
    "%SystemRoot%\\SysNative\\cmd.exe" /c "%~f0" %*
    exit /b
  )
)

title TermoFix AI - Program Dedykowany Serwisu PC x64
color 0A
cls

echo ===============================================================
echo   TERMOFIX AI - INSTALATOR PROGRAMU PULPITOWEGO WINDOWS (x64)
echo ===============================================================
echo.
echo [1/3] Tworzenie struktury katalogow w C:\\Program Files\\TermoFixAI...
mkdir "%ProgramFiles%\\TermoFixAI" 2>nul
mkdir "%ProgramData%\\TermoFixAI" 2>nul

echo [2/3] Generowanie skrotu aplikacji "TermoFix AI Serwis PC" na Pulpicie...
set "DESKTOP=%USERPROFILE%\\Desktop"
set "SHORTCUT_LNK=%DESKTOP%\\TermoFix AI Serwis PC.url"

echo [InternetShortcut] > "%SHORTCUT_LNK%"
echo URL=${appUrl} >> "%SHORTCUT_LNK%"
echo IconIndex=0 >> "%SHORTCUT_LNK%"
echo IconFile=%SystemRoot%\\System32\\shell32.dll >> "%SHORTCUT_LNK%"

echo [3/3] Tworzenie wpisu w Menu Start Windows...
set "START_MENU=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs"
copy "%SHORTCUT_LNK%" "%START_MENU%\\TermoFix AI Serwis PC.url" >nul 2>&1

echo.
echo ===============================================================
echo [SUKCES] Aplikacja TermoFix AI zostala pomyslnie zainstalowana!
echo Skrot uruchamiajacy znajduje sie na Twoim Pulpicie Windows.
echo ===============================================================
echo.
start msedge --app="${appUrl}" 2>nul || start chrome --app="${appUrl}" 2>nul || start "" "${appUrl}"
echo.
echo Nacisnij dowolny klawisz, aby zakonczyc...
pause >nul
`;

    const blob = new Blob([installerCmdScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TermoFix_AI_Serwis_PC_x64.cmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAnalyzeMyPcWithAI = () => {
    if (!onSendToChat || !telemetry) return;
    const prompt = `Przeprowadź pełną analizę mojego podłączonego komputera (${telemetry.deviceType === 'LAPTOP' ? 'LAPTOP MOBILNY' : 'PC STACJONARNY'}):
- Typ Urządzenia: ${telemetry.chassisLabel} (${telemetry.detectionReason})
- System Operacyjny: ${telemetry.osName}
- Procesor CPU: ${telemetry.cpuModel} (${telemetry.cpuThreads})
- Pamięć RAM: ${telemetry.ramTotalFormatted} (${telemetry.ramFreeFormatted})
- Dyski SSD/NVMe: ${telemetry.diskTotalFormatted} (${telemetry.diskFreeFormatted})
- Karta Graficzna GPU: ${telemetry.gpuRenderer}
- Ekran: ${telemetry.screenResolution}
- Adres IP: ${telemetry.ipAddress}

Oceń stan mojego komputera, sprawdź zalecane ustawienia wydajności i podaj instrukcję jak zoptymalizować pracę tego zestawu pod kątem diagnostyki termowizyjnej oraz stabilności!`;
    onSendToChat(prompt);
  };

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-emerald-500/40 p-4 shadow-xl shadow-emerald-950/20 space-y-3">
      
      {/* Header Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0">
            {telemetry?.deviceType === 'LAPTOP' ? (
              <Laptop className="w-6 h-6 animate-pulse" />
            ) : (
              <Monitor className="w-6 h-6 animate-pulse text-cyan-400" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>TELEMETRIA SPRZĘTOWA KOMPUTERA</span>
              </h2>

              {/* PC / LAPTOP Distinction Badge */}
              {telemetry && (
                <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase flex items-center gap-1.5 shadow-md ${
                  telemetry.deviceType === 'LAPTOP'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    telemetry.deviceType === 'LAPTOP' ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-ping'
                  }`}></span>
                  <span>
                    {telemetry.deviceType === 'LAPTOP' ? '💻 LAPTOP (MOBILNY)' : '🖥️ DESKTOP PC (STACJONARNY)'}
                  </span>
                  <span className="opacity-75 text-[10px]">({telemetry.confidenceScore}%)</span>
                </div>
              )}

              {telemetry?.isLiveServerTelemetry && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  LIVE SYSTEM NODE
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {telemetry ? (
                <span>
                  Wykryto: <strong className="text-white">{telemetry.chassisLabel}</strong> • {telemetry.detectionReason}
                </span>
              ) : (
                <span>Inicjalizacja odczytu telemetrii z lokalnego systemu...</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={loadTelemetry}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl border border-emerald-500/30 transition"
            title="Odśwież dane telemetrii sprzętowej"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadDesktopExe}
            className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition"
          >
            <Download className="w-4 h-4 fill-slate-950" />
            <span>Pobierz Program na Pulpit (.EXE)</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title={isExpanded ? 'Zwiń szczegóły telemetrii' : 'Rozwiń szczegóły telemetrii'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Plik instalacyjny "TermoFix_AI_Serwis_PC_x64.cmd" został pobrany na Twój dysk!</span>
        </div>
      )}

      {/* Expanded Hardware Grid */}
      {isExpanded && telemetry && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* System OS */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">System Operacyjny:</span>
                <span className="text-xs font-bold text-white font-mono truncate block">{telemetry.osName}</span>
              </div>
            </div>

            {/* CPU Model & Cores */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Procesor CPU:</span>
                <span className="text-xs font-bold text-amber-300 font-mono truncate block" title={telemetry.cpuModel}>
                  {telemetry.cpuModel}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{telemetry.cpuThreads}</span>
              </div>
            </div>

            {/* RAM Memory */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Pamięć Operacyjna RAM:</span>
                <span className="text-xs font-bold text-emerald-300 font-mono truncate block">{telemetry.ramTotalFormatted}</span>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, telemetry.ramUsedPercent))}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{telemetry.ramFreeFormatted} ({telemetry.ramUsedPercent}% Użycia)</span>
              </div>
            </div>

            {/* Disk Storage Array */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Pojemność Dysku SSD / NVMe:</span>
                <span className="text-xs font-bold text-cyan-300 font-mono truncate block">{telemetry.diskTotalFormatted}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{telemetry.diskFreeFormatted} • {telemetry.diskType}</span>
              </div>
            </div>

          </div>

          {/* GPU & Bottom Controls */}
          <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 min-w-0">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                <div className="text-xs truncate">
                  <span className="text-slate-400 font-bold">Wykryta Karta Graficzna (GPU): </span>
                  <span className="text-orange-300 font-mono font-bold">{telemetry.gpuRenderer}</span>
                </div>
              </div>

              {telemetry.batteryStatus?.hasBattery && (
                <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono">
                  <Battery className="w-3.5 h-3.5" />
                  <span>Bateria: {telemetry.batteryStatus.levelPercent ?? 100}% {telemetry.batteryStatus.isCharging ? '(Ładowanie)' : '(Zasilanie Ogniwem)'}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsEditingSpecs(true)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs px-3 py-2 rounded-lg border border-amber-500/30 flex items-center justify-center space-x-1.5 transition"
                title="Dostosuj wyliczone wartości telemetrii"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edytuj Parametry</span>
              </button>

              {onSendToChat && (
                <button
                  onClick={handleAnalyzeMyPcWithAI}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 flex items-center justify-center space-x-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Przeanalizuj z AI</span>
                </button>
              )}

              <button
                onClick={onOpenInstallerModal}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-xs px-3.5 py-2 rounded-lg border border-emerald-500/30 flex items-center justify-center space-x-1.5 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Opcje Instalatora Windows</span>
              </button>
            </div>
          </div>

          {/* Edit Hardware Telemetry Modal */}
          {isEditingSpecs && (
            <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/50 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-extrabold text-amber-300 text-xs flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edycja Parametrów Sprzętowych Twojego Komputera</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleResetTelemetry}
                    className="text-slate-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Wykryj Ponownie</span>
                  </button>
                  <button
                    onClick={() => setIsEditingSpecs(false)}
                    className="text-slate-400 hover:text-white text-xs font-bold"
                  >
                    Zamknij
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Typ Urządzenia (PC / Laptop):
                  </label>
                  <select
                    value={editForm.deviceType}
                    onChange={(e) => setEditForm({ ...editForm, deviceType: e.target.value as 'LAPTOP' | 'DESKTOP' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="DESKTOP">DESKTOP (Komputer Stacjonarny PC)</option>
                    <option value="LAPTOP">LAPTOP (Komputer Mobilny)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    System Operacyjny:
                  </label>
                  <input
                    type="text"
                    value={editForm.osName}
                    onChange={(e) => setEditForm({ ...editForm, osName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Pamięć Operacyjna RAM (np. 32 GB / 64 GB DDR5):
                  </label>
                  <input
                    type="text"
                    value={editForm.ramGb}
                    onChange={(e) => setEditForm({ ...editForm, ramGb: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Dyski / Tablica NVMe Array (np. 1024 GB NVMe SSD):
                  </label>
                  <input
                    type="text"
                    value={editForm.diskGb}
                    onChange={(e) => setEditForm({ ...editForm, diskGb: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Procesor CPU:
                  </label>
                  <input
                    type="text"
                    value={editForm.cpuCores}
                    onChange={(e) => setEditForm({ ...editForm, cpuCores: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Karta Graficzna GPU:
                  </label>
                  <input
                    type="text"
                    value={editForm.gpuRenderer}
                    onChange={(e) => setEditForm({ ...editForm, gpuRenderer: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-orange-300 font-mono text-xs focus:outline-none focus:border-orange-500 mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setEditForm({
                        ...editForm,
                        gpuRenderer: 'AMD Radeon RX 7900 XTX 24GB GDDR6',
                        ramGb: '64 GB RAM DDR5 High-Speed',
                        diskGb: '12288 GB NVMe M.2 SSD + HDD Storage Array'
                      })}
                      className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 rounded font-bold text-[10px] font-mono flex items-center gap-1"
                    >
                      ⚡ Ustaw zestaw: AMD Radeon RX 7900 XTX + 64GB RAM + 12TB Storage
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, gpuRenderer: 'Intel Iris Xe Graphics (Integrated)' })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-mono"
                    >
                      + Intel Iris Xe
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, gpuRenderer: 'AMD Radeon Graphics / Ryzen Vega' })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-red-300 border border-red-500/30 rounded text-[10px] font-mono"
                    >
                      + AMD Radeon
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, gpuRenderer: 'NVIDIA GeForce RTX 4060 / 4070 Laptop' })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-mono"
                    >
                      + NVIDIA RTX
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, gpuRenderer: 'Apple M1/M2/M3/M4 Integrated GPU' })}
                      className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 rounded text-[10px] font-mono"
                    >
                      + Apple Silicon
                    </button>
                  </div>
                </div>

                <div className="flex items-end space-x-2 sm:col-span-2 lg:col-span-3">
                  <button
                    onClick={handleSaveSpecs}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 rounded-lg text-xs shadow transition"
                  >
                    Zapisz Na Stałe w Pamięci Podręcznej
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
