import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Terminal,
  Cpu,
  Flame,
  HardDrive,
  Activity,
  Maximize2,
  Tv,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Download,
  Power,
  Sliders,
  Sparkles,
  ExternalLink,
  Disc,
  Laptop,
  Layers,
  Settings
} from 'lucide-react';
import { generate2000FurmarkSimulators, FurmarkSimulatorPreset } from '../data/furmarkSimulators';

interface WindowsIsoBootSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const WindowsIsoBootSimulatorModal: React.FC<WindowsIsoBootSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  // Boot sequence state
  const [bootStep, setBootStep] = useState<'BIOS_F12' | 'BOOTING_USB' | 'LIVE_PE_DESKTOP' | 'NO_VIDEO_USB_DIAG'>('BIOS_F12');
  const [f12SelectedOption, setF12SelectedOption] = useState<number>(0);
  const [bootProgress, setBootProgress] = useState<number>(0);

  // Active App Window inside Windows Live PE Desktop
  const [activeWindow, setActiveWindow] = useState<'FURMARK' | 'CRYSTAL_DISK' | 'MEMTEST' | 'TERMINAL' | 'HW_MONITOR' | 'MICROSCOPE' | 'MODS_60GB' | null>('MODS_60GB');

  // No-Video USB Diagnostics State
  const [noVideoScanning, setNoVideoScanning] = useState(false);
  const [postCode, setPostCode] = useState('0x4F');
  const [detectedFault, setDetectedFault] = useState('Brak uszkodzeń - system gotowy');

  // FurMark Live Runner state inside Windows PE
  const [allFurmarkPresets] = useState<FurmarkSimulatorPreset[]>(() => generate2000FurmarkSimulators());
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [isFurmarkRunning, setIsFurmarkRunning] = useState<boolean>(false);
  const [furmarkFps, setFurmarkFps] = useState<number>(185);
  const [furmarkTemp, setFurmarkTemp] = useState<number>(68);
  const [furmarkHotspot, setFurmarkHotspot] = useState<number>(82);
  const [furmarkVramTemp, setFurmarkVramTemp] = useState<number>(75);
  const [furmarkPower, setFurmarkPower] = useState<number>(320);

  // Drive & RAM Test Live State
  const [diskHealthScore, setDiskHealthScore] = useState<number>(98);
  const [ramErrorCount, setRamErrorCount] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Microsoft Windows PE [Version 10.0.22631.3007]',
    '(c) Microsoft Corporation. TermoFix AI Diagnostic Edition.',
    'Załadowano ze sterowników USB 3.2 Gen2 (NVMe Live ISO).',
    'Wykryto 32GB RAM DDR5 6000MHz, GPU RTX 4090, NVMe Samsung 990 PRO.'
  ]);
  const [cmdInput, setCmdInput] = useState<string>('');

  // Handle boot timer
  useEffect(() => {
    if (bootStep === 'BOOTING_USB') {
      setBootProgress(10);
      const interval = setInterval(() => {
        setBootProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            setBootStep('LIVE_PE_DESKTOP');
            return 100;
          }
          return p + 18;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [bootStep]);

  // Handle FurMark Live Physics simulation
  useEffect(() => {
    if (!isFurmarkRunning) return;

    const preset = allFurmarkPresets[selectedPresetIndex] || allFurmarkPresets[0];
    const interval = setInterval(() => {
      // Dynamic noise
      const fpsNoise = Math.floor(Math.random() * 10 - 5);
      const tempNoise = Math.floor(Math.random() * 3 - 1);
      const powerNoise = Math.floor(Math.random() * 8 - 4);

      setFurmarkFps(Math.max(30, preset.peakFps + fpsNoise));
      setFurmarkTemp(Math.min(105, Math.max(40, preset.peakCoreTemp + tempNoise)));
      setFurmarkHotspot(Math.min(115, Math.max(45, preset.peakHotspot + tempNoise * 1.5)));
      setFurmarkVramTemp(Math.min(110, Math.max(42, preset.peakVram + tempNoise)));
      setFurmarkPower(Math.max(20, preset.peakPower + powerNoise));
    }, 500);

    return () => clearInterval(interval);
  }, [isFurmarkRunning, selectedPresetIndex, allFurmarkPresets]);

  if (!isOpen) return null;

  const handleStartBoot = () => {
    if (f12SelectedOption === 3) {
      setBootStep('NO_VIDEO_USB_DIAG');
    } else {
      setBootStep('BOOTING_USB');
    }
  };

  const handleRunCommand = () => {
    if (!cmdInput.trim()) return;
    const input = cmdInput.trim();
    let response = `> ${input}\n`;

    if (input.toLowerCase().startsWith('sfc /scannow')) {
      response += '[SFC] Skanowanie obrazu Windows... Odnaleziono i pomyślnie naprawiono uszkodzone pliki DLL rozruchu.';
    } else if (input.toLowerCase().startsWith('dism')) {
      response += '[DISM] Obraz Windows PE w stanie prawidłowym (Component Store Health: 100%).';
    } else if (input.toLowerCase().startsWith('chkdsk')) {
      response += '[CHKDSK] Skanowanie NTFS C:... Sektory prawidłowe. 0 Błędów alokacji.';
    } else if (input.toLowerCase().startsWith('furmark')) {
      setActiveWindow('FURMARK');
      setIsFurmarkRunning(true);
      response += '[FURMARK] Uruchomiono pętlę testową FurMark 3D Donut!';
    } else {
      response += `Polecenie '${input}' wykonane pomyślnie w środowisku Windows Live PE.`;
    }

    setTerminalLogs((prev) => [...prev, response]);
    setCmdInput('');
  };

  const handleExportToChat = () => {
    if (!onSendToChat) return;
    const preset = allFurmarkPresets[selectedPresetIndex] || allFurmarkPresets[0];

    const prompt = `Raport z Testów Środowiska Windows ISO Live PE (Boot F12):\n- Wybrany Test Obciążeniowy: ${preset.name}\n- FPS Średnie: ${furmarkFps} FPS\n- Temp Rdzenia GPU: ${furmarkTemp}°C (Hotspot: ${furmarkHotspot}°C)\n- Temp Pamięci VRAM: ${furmarkVramTemp}°C\n- Pobór Mocy GPU: ${furmarkPower}W\n- Stan Dysku SSD (CrystalDiskInfo): ${diskHealthScore}% Dobry\n- Błędy Pamięci RAM (MemTest86): ${ramErrorCount} błędów\n- Baza FurMark Google Drive: https://drive.google.com/file/d/1zRvQ2s_afQYAa8BuOEjSU7tx1Je0lB57/view?usp=sharing\n\nPrzeanalizuj czy te parametry wskazują na sprawną grafikę i pamięci VRAM BGA, czy wymagają wymiany pasty/termo-padów?`;

    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-2 rounded-xl shadow-md">
              <Disc className="w-5 h-5 text-white animate-spin" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Symulator Pendrive Windows ISO Live PE &amp; Menu F12 Boot
                </h2>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE ISO / FURMARK 2 / DIAGNOSTYKA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Uruchom awaryjny Windows 11 Live z pendrive'a F12, testuj FurMark, RAM, SSD i naprawiaj błędy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY DEPENDING ON BOOT STEP */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: F12 BOOT MENU SIMULATOR */}
          {bootStep === 'BIOS_F12' && (
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-slate-800 font-mono space-y-6 max-w-3xl mx-auto my-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <Laptop className="w-5 h-5" />
                  <span>PHOENIX UEFI / AMI BIOS - F12 BOOT MENU DEVICE SELECTION</span>
                </div>
                <span className="text-xs text-slate-500">Press F12 / ESC to enter</span>
              </div>

              <p className="text-xs text-slate-300">
                Wykryto podłączony nośnik USB z instalatorem Windows 11 ISO Live PE TermoFix Diagnostic Edition. Wybierz urządzenie rozruchowe:
              </p>

              <div className="space-y-2 text-xs">
                {[
                  {
                    id: 0,
                    name: '💾 USB Ventoy 3.0 (64GB) - MODS From 60GB & Mats/Mods VRAM BGA Tester',
                    desc: 'Profesjonalny zestaw diagnostyczny VRAM i GPU (NVIDIA MATS/MODS) odpalany z pendrive 60GB',
                    recommended: true
                  },
                  {
                    id: 1,
                    name: '💾 USB Ventoy 3.0 (64GB) - Strelec Rescue WinPE 2026 (Full Suite)',
                    desc: 'Pełny pakiet ratunkowy Windows PE z narzędziami klonowania, partycji i odzyskiwania',
                    recommended: false
                  },
                  {
                    id: 2,
                    name: '💾 USB Ventoy 3.0 (64GB) - Windows 11 Live PE TermoFix + FurMark 2 Pack',
                    desc: 'Awaryjne środowisko Live z bazą testów obciążeniowych FurMark & MemTest',
                    recommended: false
                  },
                  {
                    id: 3,
                    name: '🔌 No-Video / No-Display USB POST & KBC Diagnostic Mode (Brak Obrazu)',
                    desc: 'Szczytowanie uszkodzeń przez USB / KBC / UART gdy laptop/PC nie daje obrazu i nie ma POST',
                    recommended: false
                  },
                  {
                    id: 4,
                    name: '💽 NVMe SSD C: Samsung 990 PRO 2TB (Windows 11 Home)',
                    desc: 'Wewnętrzny dysk komputera (Błędy rozruchu BSOD / Brak reakcji)'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setF12SelectedOption(item.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                      f12SelectedOption === item.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-100">{item.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    {item.recommended && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2.5 py-1 rounded-full shrink-0">
                        MODS ISO 60GB
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <a
                  href="https://drive.google.com/file/d/1zRvQ2s_afQYAa8BuOEjSU7tx1Je0lB57/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Pobierz paczkę FurMark ISO z Google Drive</span>
                </a>

                <button
                  onClick={handleStartBoot}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-blue-950/50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Uruchom Windows Live PE z Pendrive'a (ENTER)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: NO-VIDEO USB POST & KBC DIAGNOSTIC MODE */}
          {bootStep === 'NO_VIDEO_USB_DIAG' && (
            <div className="bg-slate-950 p-6 rounded-2xl border-2 border-red-500/40 font-mono space-y-5 max-w-4xl mx-auto my-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  <span>DIAGNOSTYKA BRAKU OBRAZU (NO-VIDEO USB POST &amp; KBC READER)</span>
                </div>
                <button
                  onClick={() => setBootStep('BIOS_F12')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs"
                >
                  Powrót do Boot Menu
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Kod Kody POST (LPC/SPI)</span>
                  <p className="text-xl font-black text-amber-400 font-mono">{postCode}</p>
                  <p className="text-[11px] text-slate-300">Inicjalizacja magistrali PCIe oraz detekcja vBIOS GPU</p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Zasilanie VCore / VGPU</span>
                  <p className="text-xl font-black text-emerald-400 font-mono">1.05V / 0.85V</p>
                  <p className="text-[11px] text-slate-300">Przetwornice CPU i GPU włączone poprawnie</p>
                </div>

                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase">Sygnał Backlight (BL_ON)</span>
                  <p className="text-xl font-black text-cyan-400 font-mono">+3.3V (OK)</p>
                  <p className="text-[11px] text-slate-300">Matryca i inwerter otrzymują zasilanie z PCH</p>
                </div>
              </div>

              <div className="bg-black p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2 text-slate-300 min-h-[160px]">
                <p className="text-emerald-400 font-bold">[Skaner USB POST Connected] Odczytywanie rejestrów SuperIO ITE8587 / ENE...</p>
                <p>• [OK] Brak zwarcia na liniach danych eDP / LVDS oraz HDMI/DP.</p>
                <p className="text-amber-400 font-bold">• [DIAGNOZA] Zidentyfikowano problem: Uszkodzony vBIOS w kości SPI 25Q128 lub brak styków na złączu matrycy (taśma FPC poluzowana po zalaniu).</p>
                <p>• [ZALECENIE] Przeprogramuj kość BIOS programatorem KBC/SPI lub wyczyść złącze taśmy alkoholem izopropylowym.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (onSendToChat) {
                      onSendToChat('Raport diagnostyczny braku obrazu (No-Video USB POST): Kod POST 0x4F, zasilania VCore/VGPU poprawne, diagnoza wskazuje na vBIOS lub taśmę matrycy. Proszę o instrukcję naprawy.');
                      onClose();
                    }
                  }}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Wyślij Raport Brak Obrazu do Chat AI</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BOOTING ANIMATION */}
          {bootStep === 'BOOTING_USB' && (
            <div className="bg-slate-950 p-12 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-6 my-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-mono">
                  Ładowanie Środowiska Windows Live PE ISO...
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Inicjalizacja sterowników USB 3.2, RAMDisk, Vulkan API &amp; FurMark 2 Stress Suite
                </p>
              </div>

              <div className="w-full max-w-md bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${bootProgress}%` }}
                ></div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold">{bootProgress}%</span>
            </div>
          )}

          {/* STEP 3: LIVE WINDOWS PE DESKTOP WITH DIAGNOSTIC TOOLS */}
          {bootStep === 'LIVE_PE_DESKTOP' && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col min-h-[580px] relative overflow-hidden shadow-2xl">
              
              {/* DESKTOP BACKGROUND & SHORTCUTS */}
              <div className="flex-1 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-6 relative overflow-hidden flex flex-col justify-between">
                
                {/* DESKTOP SHORTCUTS GRID */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 z-10">
                  <button
                    onClick={() => {
                      setActiveWindow('FURMARK');
                      setIsFurmarkRunning(true);
                    }}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'FURMARK'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-md">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold font-mono">FurMark 2 Donut</span>
                  </button>

                  <button
                    onClick={() => setActiveWindow('CRYSTAL_DISK')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'CRYSTAL_DISK'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 rounded-xl shadow-md">
                      <HardDrive className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold font-mono">CrystalDisk SMART</span>
                  </button>

                  <button
                    onClick={() => setActiveWindow('MEMTEST')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'MEMTEST'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-md">
                      <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold font-mono">MemTest86 VRAM</span>
                  </button>

                  <button
                    onClick={() => setActiveWindow('MODS_60GB')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'MODS_60GB'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-md">
                      <Disc className="w-6 h-6 text-white animate-spin" />
                    </div>
                    <span className="text-xs font-bold font-mono">MODS 60GB ISO</span>
                  </button>

                  <button
                    onClick={() => setActiveWindow('TERMINAL')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'TERMINAL'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-2.5 rounded-xl shadow-md">
                      <Terminal className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold font-mono">Konsola SFC / DISM</span>
                  </button>

                  <button
                    onClick={() => setActiveWindow('HW_MONITOR')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 transition ${
                      activeWindow === 'HW_MONITOR'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-950/50'
                        : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-2.5 rounded-xl shadow-md">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold font-mono">HWMonitor VRAM</span>
                  </button>

                  <a
                    href="https://drive.google.com/file/d/1zRvQ2s_afQYAa8BuOEjSU7tx1Je0lB57/view?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 text-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition"
                  >
                    <div className="bg-gradient-to-br from-amber-500 to-yellow-600 p-2.5 rounded-xl shadow-md">
                      <ExternalLink className="w-6 h-6 text-slate-950" />
                    </div>
                    <span className="text-xs font-bold font-mono">FurMark Pack Drive</span>
                  </a>
                </div>

                {/* ACTIVE SIMULATED WINDOW VIEWPORT */}
                <div className="my-4 z-10 flex-1 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden min-h-[320px]">
                  
                  {/* WINDOW TITLE BAR */}
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200">
                      {activeWindow === 'FURMARK' && <Flame className="w-4 h-4 text-orange-400" />}
                      {activeWindow === 'CRYSTAL_DISK' && <HardDrive className="w-4 h-4 text-blue-400" />}
                      {activeWindow === 'MEMTEST' && <Cpu className="w-4 h-4 text-purple-400" />}
                      {activeWindow === 'TERMINAL' && <Terminal className="w-4 h-4 text-emerald-400" />}
                      {activeWindow === 'HW_MONITOR' && <Activity className="w-4 h-4 text-cyan-400" />}
                      <span>
                        {activeWindow === 'FURMARK' && 'FurMark 2.1 Vulkan 3D Stress Test (Donut Loop)'}
                        {activeWindow === 'CRYSTAL_DISK' && 'CrystalDiskInfo 9.2 - Diagnostyka Dyskowa SSD/NVMe SMART'}
                        {activeWindow === 'MEMTEST' && 'MemTest86 - Skaner Pamięci RAM i VRAM BGA'}
                        {activeWindow === 'TERMINAL' && 'Wiersz Poleceń Windows Live PE (Administrator)'}
                        {activeWindow === 'HW_MONITOR' && 'AIDA64 / HWMonitor - Czujniki Temperatur i Napięć'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setActiveWindow(null)}
                        className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-400"
                        title="Minimalizuj"
                      ></button>
                      <button
                        onClick={() => setActiveWindow(null)}
                        className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400"
                        title="Zamknij"
                      ></button>
                    </div>
                  </div>

                  {/* WINDOW CONTENT BODY */}
                  <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-4">
                    
                    {/* 1. FURMARK 2 STRESS WINDOW */}
                    {activeWindow === 'FURMARK' && (
                      <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                          
                          <div className="space-y-1 flex-1">
                            <label className="text-[11px] text-slate-400 block font-bold">
                              Wybierz Profil Testowy FurMark (z Bazy 2000 Testów):
                            </label>
                            <select
                              value={selectedPresetIndex}
                              onChange={(e) => setSelectedPresetIndex(Number(e.target.value))}
                              className="w-full bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold rounded-xl p-2 outline-none"
                            >
                              {allFurmarkPresets.slice(0, 40).map((preset, idx) => (
                                <option key={preset.id} value={idx}>
                                  {preset.name} ({preset.gpuName})
                                </option>
                              ))}
                            </select>
                          </div>

                          <button
                            onClick={() => setIsFurmarkRunning(!isFurmarkRunning)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition shrink-0 ${
                              isFurmarkRunning
                                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                            }`}
                          >
                            <Flame className="w-4 h-4" />
                            <span>{isFurmarkRunning ? 'ZATRZYMAJ FURMARK' : 'URUCHOM FURMARK 3D'}</span>
                          </button>
                        </div>

                        {/* LIVE TELEMETRY CARDS */}
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">SZYBKOŚĆ (FPS)</span>
                            <span className="text-xl font-black text-amber-400">{furmarkFps} FPS</span>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">RDZEŃ GPU</span>
                            <span className={`text-xl font-black ${furmarkTemp > 85 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {furmarkTemp}°C
                            </span>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">HOTSPOT GPU</span>
                            <span className={`text-xl font-black ${furmarkHotspot > 95 ? 'text-red-500' : 'text-amber-400'}`}>
                              {furmarkHotspot}°C
                            </span>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">PAMIĘĆ VRAM</span>
                            <span className="text-xl font-black text-purple-400">{furmarkVramTemp}°C</span>
                          </div>

                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-slate-400 block">MOC (WATTY)</span>
                            <span className="text-xl font-black text-cyan-400">{furmarkPower}W</span>
                          </div>
                        </div>

                        {/* CANVA SIMULATION DONUT RING */}
                        <div className="bg-black rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                          <div className={`w-28 h-28 rounded-full border-8 border-dashed border-orange-500 ${isFurmarkRunning ? 'animate-spin' : ''} flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)]`}>
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-400 animate-pulse"></div>
                          </div>
                          <p className="text-[11px] text-amber-400 font-bold mt-3">
                            {isFurmarkRunning ? 'PĘTLA OBCIĄŻENIOWA FURMARK 2 VULKAN W TOKU...' : 'GOTOWY DO TESTU'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2. CRYSTALDISK SMART WINDOW */}
                    {activeWindow === 'CRYSTAL_DISK' && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <HardDrive className="w-5 h-5 text-blue-400" />
                            <div>
                              <span className="font-bold text-slate-100">Dysk 0: Samsung NVMe SSD 990 PRO 2TB</span>
                              <span className="text-[10px] text-slate-400 block">Firmware: 5B2QGXA7 | Odczytano: 14,200 GB | Temp: 38°C</span>
                            </div>
                          </div>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-3 py-1 rounded-xl font-bold">
                            STAN: {diskHealthScore}% DOBRY
                          </span>
                        </div>

                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                          <span className="text-slate-300 font-bold block">Parametry S.M.A.R.T. NVMe:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                            <p>• Critical Warning: 0x00 (Prawidłowy)</p>
                            <p>• Temperature Sensor 1: 38°C</p>
                            <p>• Available Spare: 100%</p>
                            <p>• Percentage Used: 2%</p>
                            <p>• Data Units Read: 28,452,100 [14.5 TB]</p>
                            <p>• Unsafe Shutdowns: 4</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. MEMTEST VRAM WINDOW */}
                    {activeWindow === 'MEMTEST' && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="font-bold text-purple-300">MemTest86 VRAM &amp; DDR5 Stress Scan</span>
                          <span className="text-xs text-emerald-400 font-bold">Błędy: {ramErrorCount}</span>
                        </div>

                        <div className="bg-black p-4 rounded-xl border border-slate-800 text-[11px] space-y-1 text-emerald-400">
                          <p>[Pass 1/4] Skanowanie adresu 0x00000000 - 0x7FFFFFFF (32GB)...</p>
                          <p>[Pattern Test] Moving inversions 64-bit: Brak przekłamań bitowych.</p>
                          <p>[VRAM BGA] Test adresowania kostek Micron GDDR6X 12-24GB: OK.</p>
                        </div>
                      </div>
                    )}

                    {/* 3B. MODS 60GB VRAM & MATS TESTER WINDOW */}
                    {activeWindow === 'MODS_60GB' && (
                      <div className="space-y-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/40 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                            <div>
                              <span className="font-bold text-indigo-200">MODS From 60GB &amp; NVIDIA MATS VRAM BGA Tester</span>
                              <span className="text-[10px] text-slate-400 block">Testowanie układów pamięci VRAM GPU po adresach fizycznych (Subtest 0-15)</span>
                            </div>
                          </div>
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs px-3 py-1 rounded-xl font-bold">
                            STAN: WSZYSTKIE 24GB VRAM SPRAWNE (0 BŁĘDÓW)
                          </span>
                        </div>

                        <div className="bg-black p-4 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1.5 text-emerald-400">
                          <p>[MODS 60GB ISO] Inicjalizacja środowiska testowego GPU (NVIDIA GP102 / AD102 / RTX 4090)...</p>
                          <p>[MATS] Testowanie banku VRAM 0 (CH0 - CH7): 0 błędów bitowych.</p>
                          <p>[MATS] Testowanie banku VRAM 1 (CH8 - CH15): 0 błędów bitowych.</p>
                          <p>[WYNIK] Układ BGA grafiki i kości VRAM nie wykazują zimnych lutów ani uszkodzeń rdzenia.</p>
                        </div>
                      </div>
                    )}

                    {/* 4. TERMINAL REPAIR WINDOW */}
                    {activeWindow === 'TERMINAL' && (
                      <div className="space-y-3">
                        <div className="bg-black p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 min-h-[160px] max-h-[220px] overflow-y-auto">
                          {terminalLogs.map((log, idx) => (
                            <p key={idx} className="whitespace-pre-wrap">{log}</p>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-emerald-400 font-bold">X:\Windows\System32&gt;</span>
                          <input
                            type="text"
                            value={cmdInput}
                            onChange={(e) => setCmdInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
                            placeholder="Wpisz polecenie (np. sfc /scannow, dism, chkdsk C:, furmark)..."
                            className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={handleRunCommand}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                          >
                            Wykonaj
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* TASKBAR AT BOTTOM OF LIVE DESKTOP */}
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between z-10 text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBootStep('BIOS_F12')}
                      className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-blue-500"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>Start PE</span>
                    </button>
                    <span className="text-slate-400 font-mono">Windows 11 Live ISO (TermoFix PE v2026)</span>
                  </div>

                  <div className="flex items-center space-x-3 text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">● ONLINE</span>
                    <span>14:59 PM</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Paczka FurMark Google Drive zintegrowana ze środowiskiem testowym Live PE.</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {onSendToChat && bootStep === 'LIVE_PE_DESKTOP' && (
              <button
                onClick={handleExportToChat}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition"
              >
                <Send className="w-4 h-4" />
                <span>Wyślij Wynik Testów PE do Chat AI</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2 rounded-xl transition"
            >
              Zamknij
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
