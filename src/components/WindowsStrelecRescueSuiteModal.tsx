import React, { useState } from 'react';
import {
  Monitor,
  Disc,
  ShieldAlert,
  Wrench,
  HardDrive,
  Cpu,
  Wifi,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  FolderOpen,
  Cpu as GpuIcon,
  Zap,
  X,
  RefreshCw,
  Sliders
} from 'lucide-react';

interface WindowsStrelecRescueSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const WindowsStrelecRescueSuiteModal: React.FC<WindowsStrelecRescueSuiteModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'drivers' | 'partition' | 'antivirus' | 'iso_builder'>('desktop');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleLog, setConsoleLog] = useState<string[]>([
    '[INIT] Windows PE Strelec & SerGEI Live Rescue Environment v2026.8 initialized.',
    '[INFO] Serwis Rafał Jarosz - Professional BGA & Laptop Diagnostics loaded.',
    '[OK] Storage drivers (Intel RST, AMD NVMe, Realtek) mounted successfully.'
  ]);

  if (!isOpen) return null;

  const runRescueTask = (taskName: string, logs: string[]) => {
    setIsExecuting(true);
    setSelectedTool(taskName);
    setConsoleLog((prev) => [...prev, `\n[START] ${taskName}...`]);

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setConsoleLog((prev) => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setIsExecuting(false);
        setConsoleLog((prev) => [...prev, `[SUCCESS] Zadanie "${taskName}" zakończone pomyślnie.`]);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl max-h-[96vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Windows PE Strelec Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 border-b border-blue-500/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/30 border border-blue-400/40 p-2 rounded-xl text-blue-300">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Windows PE SerGEI & Strelec Rescue Suite (Serwis Rafał Jarosz)</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2.5 py-0.5 rounded-full font-mono border border-blue-400/40">WinPE 11 Pro Live</span>
              </h2>
              <p className="text-xs text-slate-400">
                Kompleksowe środowisko ratunkowe USB/ISO z wbudowanymi sterownikami, narzędziami partycjonowania i naprawy Windows.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Strelec Style Menu Bar) */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'desktop' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Pulpit & Narzędzia PE</span>
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'drivers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Iniekcja Sterowników Offline</span>
          </button>
          <button
            onClick={() => setActiveTab('partition')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'partition' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Partycje & Kopia (Acronis/Macrium)</span>
          </button>
          <button
            onClick={() => setActiveTab('antivirus')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'antivirus' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SmartScreen & Antivirus Fix</span>
          </button>
          <button
            onClick={() => setActiveTab('iso_builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'iso_builder' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>Kreator Bootowalnego ISO</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-950 flex-1 flex flex-col">
          
          {activeTab === 'desktop' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Strelec Launcher Shortcuts */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-cyan-400" />
                  <span>Narzędzia Serwisowe WinPE (Strelec / SerGEI Suite)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  <div
                    onClick={() => runRescueTask('Naprawa Rozruchu BCD / UEFI (Bootrec)', [
                      '[SCAN] Skanowanie partycji systemowych EFI / C:\\...',
                      '[FIX] Odbudowa magazynu BCD (bootrec /rebuildbcd)...',
                      '[OK] Sfatygowane sektory rozruchowe naprawione.'
                    ])}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Odbudowa BCD / UEFI Boot
                    </div>
                    <p className="text-[11px] text-slate-400">Naprawia błędy "Operating System Not Found", czarny ekran i brak bootloader.</p>
                  </div>

                  <div
                    onClick={() => runRescueTask('Reset Hasła Administratora Windows (SAM / NTPassword)', [
                      '[READ] Odczyt pliku rejestru C:\\Windows\\System32\\config\\SAM...',
                      '[WRITE] Nadpisanie flagi konta Administrator na puste hasło...',
                      '[OK] Hasło zostało pomyślnie zresetowane.'
                    ])}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Reset Hasła Windows (SAM)
                    </div>
                    <p className="text-[11px] text-slate-400">Usuwa lub resetuje zapomniane hasło logowania do systemu klienta.</p>
                  </div>

                  <div
                    onClick={() => runRescueTask('Skanowanie SFC / DISM Image Repair', [
                      '[DISM] Sprawdzanie spójności magazynu komponentów (CheckHealth)...',
                      '[SFC] Weryfikacja plików systemowych .dll i .exe...',
                      '[OK] Zastąpiono uszkodzone pliki oryginalnymi wersjami.'
                    ])}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> SFC & DISM System Repair
                    </div>
                    <p className="text-[11px] text-slate-400">Automatyczna naprawa uszkodzonych plików systemowych Windows.</p>
                  </div>

                  <div
                    onClick={() => runRescueTask('Pełna Diagnostyka S.M.A.R.T. Dysków NVMe / SSD / HDD', [
                      '[NVMe] Odpytanie kontrolera o temperatury i licznik TBW...',
                      '[SSD] Sprawdzanie realnej prędkości odczytu kontrolera...',
                      '[OK] Dysk w pełni sprawny (brak realokowanych sektorów).'
                    ])}
                    className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-4 rounded-xl cursor-pointer transition space-y-1.5"
                  >
                    <div className="text-cyan-400 font-bold text-xs flex items-center gap-2">
                      <HardDrive className="w-4 h-4" /> Diagnostyka S.M.A.R.T. NVMe/SSD
                    </div>
                    <p className="text-[11px] text-slate-400">Szybki test kondycji i żywotności dysków twardych.</p>
                  </div>

                </div>
              </div>

              {/* Right Column: Live Console Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between font-mono text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <span>Console Log (Strelec PE)</span>
                    </span>
                    {isExecuting && <span className="text-amber-400 animate-pulse">Wykonywanie...</span>}
                  </div>
                  <div className="h-64 overflow-y-auto space-y-1 text-slate-300">
                    {consoleLog.map((log, index) => (
                      <div key={index} className={log.includes('OK') ? 'text-emerald-400 font-bold' : log.includes('START') ? 'text-cyan-300 font-bold' : ''}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                  Serwis Rafał Jarosz • WinPE Bootable Suite
                </div>
              </div>

            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <span>Iniekcja Sterowników Mass-Storage i LAN w trybie Offline</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Podczas instalacji Windows lub w środowisku WinPE często brakuje sterowników do dysków NVMe (Intel VMD, AMD RAID) lub kart sieciowych Realtek/Intel. Ten moduł integruje paczki sterowników bezpośrednio z obrazem ISO lub partycją systemową.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Wybierz pakiety sterowników do wstrzyknięcia:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-200">
                  <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-500" />
                    <span>Intel Rapid Storage Technology (IRST / VMD NVMe)</span>
                  </label>
                  <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-500" />
                    <span>AMD Ryzen NVMe / RAID Controller</span>
                  </label>
                  <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-500" />
                    <span>Realtek / Intel LAN & Wi-Fi (Win10/11)</span>
                  </label>
                  <label className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-900 text-blue-500" />
                    <span>NVIDIA / AMD Radeon Display Drivers</span>
                  </label>
                </div>

                <button
                  onClick={() => runRescueTask('Iniekcja sterowników offline do C:\\Windows\\System32\\drivers', [
                    '[MOUNT] Montowanie rejestru systemowego i magazynu driverów...',
                    '[COPY] Kopiowanie plików .inf oraz .sys do C:\\Drivers...',
                    '[PnP] Aktualizacja bazy urządzeń Plug and Play...',
                    '[OK] Wszystkie sterowniki zostały wstrzyknięte pomyślnie.'
                  ])}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Rozpocznij Iniekcję Sterowników</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'partition' && (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-emerald-400" />
                    <span>Menedżer Partycji & Klonowanie Dysków (AOMEI / Acronis Style)</span>
                  </h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">GPT / UEFI Active</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Dysk 0: Samsung 980 PRO 1TB NVMe (System)</div>
                      <div className="text-[11px] text-slate-400">EFI (100MB) • C: Windows 11 (950 GB) • Recovery (500MB)</div>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">Zdrowy 100%</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Dysk 1: Crucial MX500 500GB SSD (Magazyn / Kopia)</div>
                      <div className="text-[11px] text-slate-400">D: Backup_Serwis (500 GB NTFS)</div>
                    </div>
                    <span className="text-xs text-emerald-400 font-mono font-bold">Zdrowy 99%</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => runRescueTask('Klonowanie dysku na nowy SSD (Sector-by-Sector)', [
                      '[CLONE] Inicjalizacja sektora startowego GPT...',
                      '[CLONE] Kopiowanie partycji EFI oraz System Windows...',
                      '[OK] Klonowanie zakończone pomyślnie. Dysk gotowy do wymiany.'
                    ])}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Klonuj Dysk na Nowy SSD
                  </button>
                  <button
                    onClick={() => runRescueTask('Tworzenie kopii zapasowej obrazu partycji C:\\', [
                      '[BACKUP] Kompresja partycji systemowej do pliku .tib / .wim...',
                      '[OK] Kopia zapasowa zapisana na dysku D:\\Backup_Serwis.'
                    ])}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition border border-slate-700"
                  >
                    Utwórz Obraz Kopia (Backup)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'antivirus' && (
            <div className="space-y-6 max-w-3xl mx-auto py-4">
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" />
                  <span>Pomocnik Odblokowania Plików .EXE i Ominięcia SmartScreen</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Antywirusy i Windows Defender często blokują pobrane pliki narzędzi serwisowych. Użyj poniższego skryptu PowerShell w trybie Administratora, aby odblokować pliki jednym kliknięciem.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Skrypt odblokowujący PowerShell:</h4>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 select-all">
                  Unblock-File -Path "$HOME\Downloads\TermoFix_AI_Workstation.exe"
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('Unblock-File -Path "$HOME\\Downloads\\TermoFix_AI_Workstation.exe"');
                    alert('Skopiowano polecenie do schowka!');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  Kopiuj do Schowka
                </button>
              </div>
            </div>
          )}

          {activeTab === 'iso_builder' && (
            <div className="space-y-6 max-w-3xl mx-auto py-4 text-center">
              <div className="bg-blue-950/40 border border-blue-500/40 rounded-2xl p-6 space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Disc className="w-7 h-7 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bootowalny Obraz ISO Windows PE (Serwis Strelec / Rafał Jarosz)</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Gotowy obraz ISO zawierający system WinPE, zintegrowane sterowniki NVMe/LAN oraz pełne narzędzia diagnostyczne BGA.
                  </p>
                </div>

                <a
                  href="/api/download-windows-iso?edition=win11_pro"
                  download="TermoFix_AI_Strelec_Rescue.iso"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Pobierz Gotowy Obraz ISO (5.84 GB)</span>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-400">Serwis Rafał Jarosz • WinPE Strelec & SerGEI Rescue Suite</span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
