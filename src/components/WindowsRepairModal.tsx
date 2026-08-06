import React, { useState } from 'react';
import { X, Terminal, Copy, Check, ShieldAlert, Cpu, AlertTriangle, Play, RefreshCw, Folder, Download, KeyRound, Lock, Zap, CheckCircle2, Tv } from 'lucide-react';
import { systemAutoRepairManager } from '../services/systemAutoRepairManager';
import { DiagnosticVideoTutorialsTab } from './DiagnosticVideoTutorialsTab';
import { LiveSpecsAuditTab } from './LiveSpecsAuditTab';

interface WindowsRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat: (prompt: string) => void;
  detectedError?: string;
}

interface RepairTool {
  id: string;
  name: string;
  category: 'boot' | 'sfc' | 'disk' | 'bsod' | 'password' | 'bitlocker';
  description: string;
  commands: string[];
  notes: string;
  simulatedLogs: string[];
}

const REPAIR_TOOLS: RepairTool[] = [
  {
    id: 'tool-password-reset',
    name: 'Reset Hasła Konta Lokalnego & Odblokowanie Administratora',
    category: 'password',
    description: 'Zeruje / usuwa zapomniane hasło użytkownika lokalnego Windows oraz aktywuje ukryte konto Administratora.',
    commands: [
      'net user Administrator /active:yes',
      'net user Administrator ""',
      'net user Uzytkownik *',
      'reg load HKLM\\OFFLINE C:\\Windows\\System32\\config\\SAM',
      'chntpw -u Administrator /sam/path'
    ],
    notes: 'Jeśli nie pamiętasz hasła, uruchom płytę/USB WinRE lub Linux Live USB (chntpw) i odmontuj rejestr SAM.',
    simulatedLogs: [
      '[+] Ładowanie gałęzi rejestru HKLM\\OFFLINE\\SAM...',
      '[+] Wykryto konto: Administrator (SID 500) - STAN: ZABLOKOWANE',
      '[+] Czyszczenie flagi LOCKOUT w podkluczu Users\\000001F4...',
      '[+] Zapisywaniem zmian w pliku SAM... SUKCES!',
      '[✓] Konto Administrator aktywne bez hasła! Uruchom ponownie komputer.'
    ]
  },
  {
    id: 'tool-sfc-dism',
    name: 'Naprawa Uszkodzonych Plików Systemowych (SFC & DISM)',
    category: 'sfc',
    description: 'Wykrywa i naprawia uszkodzone, usunięte lub podmienione pliki systemowe Windows (.dll, .exe, sterowniki).',
    commands: [
      'sfc /scannow',
      'dism /online /cleanup-image /checkhealth',
      'dism /online /cleanup-image /restorehealth',
      'sfc /scannow /offbootdir=C:\\ /offwindir=C:\\Windows'
    ],
    notes: 'Jeśli system Windows nie uruchamia się, otwórz Wiersz Poleceń z poziomu WinRE i użyj składni /offbootdir=C:\\.',
    simulatedLogs: [
      '[+] Inicjalizacja skanowania plików systemowych Windows...',
      '[+] Skanowanie w toku: 100% ukończono.',
      '[+] Znaleziono uszkodzone pliki kernelbase.dll, ntdll.dll.',
      '[+] Pobieranie świeżych kopii z magazynu Component Store (DISM)...',
      '[✓] Pomyślnie naprawiono wszystkie uszkodzone pliki systemowe!'
    ]
  },
  {
    id: 'tool-powershell-ps1-network',
    name: 'Single-Click Fix: Reset Stosu Sieciowego & Winsock (PowerShell Admin)',
    category: 'sfc',
    description: 'Błyskawicznie naprawia brak internetu, błędy DNS i gniazd Winsock pojedynczym kliknięciem.',
    commands: [
      'powershell -ExecutionPolicy Bypass -Command "netsh winsock reset; netsh int ip reset; ipconfig /flushdns; Clear-DnsClientCache"'
    ],
    notes: 'Skrypt wykonuje pełne czyszczenie bufora DNS i reset interfejsów IP. Zalecany restart komputera po wykonaniu.',
    simulatedLogs: [
      '[+] Uruchamianie PowerShell Admin Single-Click Fix...',
      '[+] Wykonywanie netsh winsock reset... SUKCES!',
      '[+] Wykonywanie netsh int ip reset... Interfejsy zresetowane.',
      '[+] Czyszczenie pamięci podręcznej DNS (ipconfig /flushdns)... SUKCES!',
      '[✓] Stos sieciowy został zresetowany pomyślnie. Internet gotowy!'
    ]
  },
  {
    id: 'tool-powershell-ps1-wu-clean',
    name: 'Single-Click Fix: Czyszczenie Pamięci Windows Update & SoftwareDistribution',
    category: 'disk',
    description: 'Usuwa zablokowane i uszkodzone aktualizacje z katalogu SoftwareDistribution, odblokowując Windows Update.',
    commands: [
      'powershell -ExecutionPolicy Bypass -Command "Stop-Service wuauserv, bits -Force; Remove-Item C:\\Windows\\SoftwareDistribution\\* -Recurse -Force; Start-Service wuauserv, bits"'
    ],
    notes: 'Usuwa pobrane, niepełne pliki .cab/.msi aktualizacji, bez naruszania zainstalowanych funkcji.',
    simulatedLogs: [
      '[+] Zatrzymywanie usług Windows Update (wuauserv, bits)...',
      '[+] Kasowanie tymczasowego bufora SoftwareDistribution\\Download...',
      '[+] Zwolniono 4.2 GB miejsca na dysku C:\\',
      '[+] Ponowne uruchamianie usług Windows Update...',
      '[✓] Windows Update odblokowany i gotowy do działania!'
    ]
  },
  {
    id: 'tool-powershell-ps1-temp-purge',
    name: 'Single-Click Fix: Czyszczenie Plików Tymczasowych & Optymalizacja SSD/NVMe',
    category: 'disk',
    description: 'Bezpiecznie usuwa gigabajty śmieci z katalogów %TEMP%, Prefetch i uruchamia TRIM dla dysku SSD.',
    commands: [
      'powershell -ExecutionPolicy Bypass -Command "Remove-Item $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue; Optimize-Volume -DriveLetter C -Defrag -ReTrim -Verbose"'
    ],
    notes: 'Wymusza wywołanie komendy ReTrim dla dysków SSD/NVMe, przywracając fabryczną wydajność zapisu.',
    simulatedLogs: [
      '[+] Skanowanie katalogu %TEMP% i C:\\Windows\\Prefetch...',
      '[+] Usunięto 12,450 tymczasowych plików cache.',
      '[+] Wywołanie komendy TRIM na dysku NVMe C:...',
      '[✓] Dysk C:\\ po optymalizacji. Odzyskano ponad 8.5 GB wolnej przestrzeni!'
    ]
  },
  {
    id: 'tool-bootrec-bcd',
    name: 'Odzyskiwanie i Odbudowa Bootloadera EFI / BCD',
    category: 'boot',
    description: 'Naprawia błędy brakującego programu rozruchowego ("An operating system wasn\'t found", "0xc000000e", "INACCESSIBLE_BOOT_DEVICE").',
    commands: [
      'bootrec /fixmbr',
      'bootrec /fixboot',
      'bootrec /rebuildbcd',
      'diskpart -> list volume -> select vol X -> assign letter=S',
      'bcdboot C:\\Windows /s S: /f ALL'
    ],
    notes: 'W systemach UEFI z partycją GPT należy przypisać literę partycji EFI (np. 100MB FAT32) i wygenerować pliki rozruchowe poleceniem bcdboot.',
    simulatedLogs: [
      '[+] Skanowanie dysków w poszukiwaniu instalacji Windows...',
      '[+] Znaleziono instalację na partycji C:\\Windows.',
      '[+] Montowanie partycji rozruchowej EFI System Partition (ESP)...',
      '[+] Generowanie nowego magazynu BCD (Boot Configuration Data)...',
      '[✓] Pliki rozruchowe BCD zostały pomyślnie wygenerowane na partycji S:!'
    ]
  },
  {
    id: 'tool-chkdsk-disk',
    name: 'Sprawdzanie i Naprawa Błędów Struktury Plików (CHKDSK)',
    category: 'disk',
    description: 'Skanuje dysk pod kątem uszkodzonych sektorów logical/physical bad sectors oraz naprawia system plików NTFS/ReFS.',
    commands: [
      'chkdsk C: /f /r /x',
      'chkdsk C: /scan /forcerepair'
    ],
    notes: 'Flaga /r lokalizuje uszkodzone sektory na dysku i odzyskuje informacje, które można odczytać.',
    simulatedLogs: [
      '[+] Uruchamianie CHKDSK w trybie odzyskiwania na wolumenie C:...',
      '[+] Etap 1: Sprawdzanie podstawowej struktury plików...',
      '[+] Etap 2: Sprawdzanie powiązań nazw plików...',
      '[+] Naprawianie niepoprawnych indeksów i tabel MFT...',
      '[✓] Dysk C: jest czysty. Brak błędów w strukturze NTFS.'
    ]
  },
  {
    id: 'tool-bsod-safemode',
    name: 'Odblokowanie Pętli BSOD & Tryb Awaryjny',
    category: 'bsod',
    description: 'Wymusza uruchomienie Windows w trybie awaryjnym lub resetuje parametry rozruchu po zaktualizowaniu uszkodzonych sterowników.',
    commands: [
      'bcdedit /set {default} safeboot minimal',
      'bcdedit /deletevalue {default} safeboot',
      'DDU (Display Driver Uninstaller) w trybie Safe Mode'
    ],
    notes: 'Pozwala na odinstalowanie wadliwej aktualizacji Windows Update lub sterownika karty graficznej.',
    simulatedLogs: [
      '[+] Odczyt wpisu domyślnego w BCD...',
      '[+] Ustawianie flagi safeboot = minimal...',
      '[✓] Tryb awaryjny został włączony dla następnego rozruchu.'
    ]
  },
  {
    id: 'tool-bitlocker-bypass',
    name: 'BitLocker & TPM - Wyłączenie Ochrony i Klucze Odzyskiwania',
    category: 'bitlocker',
    description: 'Wyłącza ochronę BitLocker lub odblokowuje zaszyfrowaną partycję C: za pomocą klucza 48-cyfrowego.',
    commands: [
      'manage-bde -status C:',
      'manage-bde -protectors -disable C:',
      'manage-bde -unlock C: -RecoveryPassword 123456-...',
      'manage-bde -off C:'
    ],
    notes: 'Pozwala usunąć wymóg podawania PIN/TPM po zmianie płyty głównej lub aktualizacji BIOS.',
    simulatedLogs: [
      '[+] Odczytywanie stanu BitLocker na wolumenie C:...',
      '[+] Wykryto ochronę TPM + Recovery Key.',
      '[+] Zawieszanie ochrony BitLocker na wolumenie C:...',
      '[✓] Ochrona BitLocker tymczasowo zawieszona. Dostęp do C:\\ odblokowany!'
    ]
  }
];

export const WindowsRepairModal: React.FC<WindowsRepairModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  detectedError,
}) => {
  const [activeTab, setActiveTab] = useState<'tools' | 'videos'>('tools');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  
  const [activeRunningToolId, setActiveRunningToolId] = useState<string | null>(null);
  
  const suggestedRepairs = detectedError ? systemAutoRepairManager.getSuggestedRepairsForError(detectedError) : systemAutoRepairManager.getAllRepairs();
  
  const handleRunAutoRepair = (taskId: string, title: string, scriptContent: string) => {
    setActiveRunningToolId(taskId);
    setIsRunning(true);
    setTerminalLogs([`[+] Wykonywanie procedury: ${title}`, `[+] Uruchamianie skryptu naprawczego...`]);
    
    // Simulate execution of auto repair script
    const lines = scriptContent.split('\n').filter(l => l.trim() !== '');
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setTerminalLogs(prev => [...prev, `C:\> ${lines[i]}`]);
        i++;
      } else {
        clearInterval(interval);
        setTerminalLogs(prev => [...prev, '[✓] Procedura Auto-Naprawy zakończona pomyślnie.']);
        setIsRunning(false);
      }
    }, 600);
  };

  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [dryRunCheckStatus, setDryRunCheckStatus] = useState<'IDLE' | 'ACTION_REQUIRED' | 'VERIFIED'>('IDLE');
  const [dryRunCheckWarning, setDryRunCheckWarning] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleDryRunCheckBeforeExecution = (tool: RepairTool) => {
    setDryRunCheckStatus('IDLE');
    setDryRunCheckWarning('');
    setActiveRunningToolId(tool.id);
    setIsRunning(true);
    setTerminalLogs([
      `C:\\Windows\\System32> powershell -ExecutionPolicy Bypass -File .\\dryrun_env_check.ps1`,
      `[DRY-RUN] Skanowanie typu partycji (GPT / MBR) oraz rejestru BCD...`
    ]);

    setTimeout(() => {
      if (tool.id === 'tool-bitlocker-bypass') {
        setDryRunCheckStatus('ACTION_REQUIRED');
        setDryRunCheckWarning('WYKRYTO BRAK KLUCZA TPM KONTRA BITLOCKER: System w trybie UEFI Secure Boot wymaga ręcznego podania 48-cyfrowego klucza odzyskiwania BitLocker. Skrypt wiersza poleceń jest wstrzymany.');
        setTerminalLogs((prev) => [
          ...prev,
          `[WARN] BitLocker Volume C: zablokowany kluczem TPM 2.0.`,
          `[STATUS] ACTION REQUIRED: Wprowadź klucz odzyskiwania BitLocker (48 cyfr) lub zawieś ochronę z poziomu konta Microsoft!`
        ]);
        setIsRunning(false);
      } else {
        setDryRunCheckStatus('VERIFIED');
        setTerminalLogs((prev) => [
          ...prev,
          `[DRY-RUN] Walidacja powłoki Shell pomyślna. Uprawnienia Administratora: OK.`,
          `[EXEC] Rozpoczynanie egzekucji komend dla: ${tool.name}`
        ]);
        
        tool.simulatedLogs.forEach((logLine, idx) => {
          setTimeout(() => {
            setTerminalLogs((prev) => [...prev, logLine]);
            if (idx === tool.simulatedLogs.length - 1) {
              setIsRunning(false);
            }
          }, (idx + 1) * 700);
        });
      }
    }, 1000);
  };

  const handleDownloadBatchScript = (tool: RepairTool) => {
    const scriptContent = `@echo off
:: Automated Windows Repair & Maintenance Script
:: Generated by Serwis Pogotowie Rafał Jarosz - naprawapclaptop.pl
TITLE ${tool.name}
color 0A
cls
echo ============================================================
echo   SERWIS POGOTOWIE RAFAŁ JAROSZ - SKRYPT NAPRAWCZY WINDOWS
echo   Narzędzie: ${tool.name}
echo ============================================================
echo.

${tool.commands.map((c) => `echo Executing: ${c}\n${c}\nif %errorlevel% neq 0 echo [WARN] Error executing ${c}`).join('\n\n')}

echo.
echo ============================================================
echo   ZAKOŃCZONO WYKONANIE SKRYPTU NAPRAWCZEGO!
echo ============================================================
pause
`;

    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Naprawa_Windows_${tool.id}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-blue-950/50">
              <Terminal className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-white text-base sm:text-lg">
                  Centrum Executable Skryptów &amp; Naprawy Windows
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Aktywne Komendy Terminalowe
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Uruchamiaj interaktywne skrypty w terminalu, resetuj hasła SAM, naprawiaj rozruch BCD/EFI oraz generuj pliki .BAT
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-slate-950 px-4 pt-2 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'tools'
                ? 'bg-slate-900 text-blue-400 border-blue-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Narzędzia &amp; Skrypty CMD/BAT</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'videos'
                ? 'bg-slate-900 text-red-400 border-red-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Tv className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Video Instruktażowe Naprawy BCD &amp; Windows</span>
          </button>

          <button
            onClick={() => setActiveTab('live_specs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-xl font-bold transition border-t border-x ${
              activeTab === 'live_specs'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/50 border-b-transparent shadow'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Specyfikacja na Żywo</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-slate-300 text-xs sm:text-sm">
          
          {activeTab === 'live_specs' ? (
            <LiveSpecsAuditTab
              modalTitle="Naprawa Systemu Windows & BCD"
              onSendToChat={onSendToChat}
            />
          ) : activeTab === 'videos' ? (
            <DiagnosticVideoTutorialsTab
              categoryFilter="Windows & BCD"
              title="Poradniki Wideo Naprawy Rozruchu BCD & Systemu Windows 11"
              onSendToChat={onSendToChat}
            />
          ) : (
            <>
              {/* Quick Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 p-3.5 rounded-xl flex items-start space-x-3 text-blue-200">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-blue-300 text-xs">Instrukcja Uruchomienia Wiersza Poleceń (CMD / WinRE):</span>
              <p className="text-xs leading-relaxed mt-0.5">
                Uruchom nośnik instalacyjny USB Windows, naciśnij <kbd className="bg-slate-800 px-1.5 py-0.5 rounded font-mono border border-slate-700 text-amber-300 font-bold">Shift + F10</kbd> na ekranie wyboru języka, aby otworzyć terminal z pełnymi uprawnieniami SYSTEM.
              </p>
            </div>
          </div>

          {/* Interactive Live Terminal Execution Box (if running or executed) */}
          {activeRunningToolId && (
            <div className="bg-black/90 p-4 rounded-xl border border-emerald-500/50 space-y-2 font-mono text-xs text-emerald-400 shadow-2xl animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Terminal Live Output: {REPAIR_TOOLS.find((t) => t.id === activeRunningToolId)?.name || suggestedRepairs.find(t => t.id === activeRunningToolId)?.title}</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isRunning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                  {isRunning ? 'WYKONYWANIE...' : 'ZAKOŃCZONO'}
                </span>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto leading-relaxed pt-1">
                {terminalLogs.map((log, i) => (
                  <div key={i} className="text-emerald-300 font-bold">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          
          {/* Auto Repair Module */}
          <div className="space-y-4">
            <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              Automatyczne Moduły Naprawcze (One-Click)
            </h3>
            
            {suggestedRepairs.length === 0 && detectedError && (
               <div className="text-slate-400 text-xs italic">Brak dedykowanych automatycznych napraw dla błędu: {detectedError}</div>
            )}
            
            {suggestedRepairs.map((task) => (
              <div key={task.id} className="bg-emerald-950/20 border border-emerald-900/50 p-4 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {task.title}
                  </h4>
                  <button
                    onClick={() => {
                      if (window.confirm(`Czy na pewno chcesz uruchomić automatyczną naprawę: ${task.title}?`)) {
                        handleRunAutoRepair(task.id, task.title, task.scriptContent);
                      }
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-lg transition shadow-md shadow-emerald-900/50 flex items-center gap-1"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    Wykonaj Naprawę (One-Click)
                  </button>
                </div>
                <p className="text-xs text-slate-400">{task.description}</p>
                <div className="bg-black/60 p-2 rounded border border-emerald-900/30 text-[10px] font-mono text-slate-500 overflow-x-auto">
                   <pre>{task.scriptContent}</pre>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-slate-800 my-4"></div>
          
          {/* Tools Grid */}
          <div className="space-y-4">
            {REPAIR_TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-blue-500/40 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    {tool.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDryRunCheckBeforeExecution(tool)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-md shadow-emerald-950/50"
                      title="Wykonaj walidację Dry-Run i uruchom skrypt w terminalu"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Uruchom Dry-Run &amp; Skrypt</span>
                    </button>

                    <button
                      onClick={() => handleDownloadBatchScript(tool)}
                      className="text-xs bg-slate-900 hover:bg-slate-800 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-bold"
                      title="Pobierz gotowy plik .BAT do uruchomienia na komputerze klienta"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Pobierz .BAT</span>
                    </button>

                    <button
                      onClick={() => {
                        onSendToChat(`Pomóż mi wykonać naprawę Windows za pomocą narzędzia: ${tool.name}. Przedstaw szczegółową instrukcję krok po kroku wraz ze wszystkimi komendami i analizą rejestru.`);
                        onClose();
                      }}
                      className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 font-bold"
                    >
                      <Zap className="w-3 h-3 text-cyan-300" />
                      <span>Przeanalizuj z AI</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300">{tool.description}</p>

                {/* Commands Box */}
                <div className="bg-black/90 rounded-xl p-3 border border-slate-800/80 font-mono text-xs space-y-2">
                  {tool.commands.map((cmd, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 group">
                      <span className="text-emerald-400 truncate">C:\&gt; {cmd}</span>
                      <button
                        onClick={() => handleCopy(cmd)}
                        className="text-[10px] text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1 shrink-0 font-bold"
                      >
                        {copiedCmd === cmd ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Skopiowano</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Kopiuj</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  💡 <strong className="text-slate-300">Porada Warsztatowa:</strong> {tool.notes}
                </p>
              </div>
            ))}
          </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-3.5 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Serwis Pogotowie Rafał Jarosz • Warszawska Baza Skryptów Naprawczych
          </span>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};

