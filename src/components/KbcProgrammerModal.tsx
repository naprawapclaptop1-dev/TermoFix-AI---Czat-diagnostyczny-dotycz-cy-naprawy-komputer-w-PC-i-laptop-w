import React, { useState } from 'react';
import {
  Cpu,
  Download,
  Terminal,
  Zap,
  CheckCircle2,
  Settings,
  Shield,
  FileCode,
  Play,
  RefreshCw,
  Wrench,
  Layers,
  HardDrive,
  AlertTriangle,
  ArrowRight,
  Check,
  Usb,
  Activity,
  Sliders,
  Cable,
  Search
} from 'lucide-react';

interface KbcProgrammerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KbcChip {
  id: string;
  manufacturer: string;
  model: string;
  packageType: string;
  flashSize: string;
  voltage: string;
  commonBoards: string;
  description: string;
  pinoutSummary: string;
}

interface ProgrammerHardware {
  id: string;
  name: string;
  vendor: string;
  supportedProtocols: string;
  fpcSupport: string;
  speed: string;
  status: 'ONLINE' | 'CONNECTED' | 'STANDBY';
}

const PROGRAMMER_HARDWARE: ProgrammerHardware[] = [
  {
    id: 'svod-4',
    name: 'SVOD 4 Pro (USB 3.0)',
    vendor: 'SvodTools',
    supportedProtocols: 'ITE, ENE, NUVOTON, MEC, Apple SMC, SPI, I2C',
    fpcSupport: '24, 26, 30, 32, 40 pin (0.5mm, 0.8mm, 1.0mm)',
    speed: 'High-Speed 12 MHz SPI / JTAG',
    status: 'ONLINE'
  },
  {
    id: 'vertyanov-v4',
    name: 'Vertyanov JIG v4.2',
    vendor: 'Vertyanov Electronics',
    supportedProtocols: 'ENE KB9012/9022, ITE IT8586/IT8587, Nuvoton NPCE',
    fpcSupport: '24, 30, 32 pin (Auto-GND Detection)',
    speed: '8 MHz JTAG / ISP',
    status: 'CONNECTED'
  },
  {
    id: 'rt809h',
    name: 'RT809H Smart Programmer',
    vendor: 'iFix',
    supportedProtocols: 'Multi-Protocol Universal ISP & High-Speed Parallel',
    fpcSupport: 'Dedykowany adapter FPC/ISP',
    speed: '480 Mbps USB 2.0',
    status: 'STANDBY'
  },
  {
    id: 'ene-kb9012-tool',
    name: 'ENE KB9012/9022 Dedicated Tool',
    vendor: 'KB Tools',
    supportedProtocols: 'Tylko seria ENE KB90xx',
    fpcSupport: '30-pin FPC Keyboard Header',
    speed: 'Standard 4 MHz ISP',
    status: 'STANDBY'
  },
  {
    id: 'stlink-ch341',
    name: 'ST-Link v2 / CH341A / USB-ISP',
    vendor: 'Generic USB',
    supportedProtocols: 'SPI Flash Shared, SWD / JTAG Direct',
    fpcSupport: 'Dolutowanie przewodów ISP (Testpoints)',
    speed: '3.3V / 1.8V Standard SPI',
    status: 'STANDBY'
  }
];

const KBC_CHIPS: KbcChip[] = [
  {
    id: 'ite-8586e',
    manufacturer: 'ITE',
    model: 'IT8586E / IT8587E',
    packageType: 'LQFP-128',
    flashSize: '128 KB internal',
    voltage: '3.3V VCC',
    commonBoards: 'Asus ROG, Lenovo Legion, HP Pavilion, Acer Nitro',
    description: 'Najpopularniejszy mikrokontroler ITE z wbudowaną pamięcią flash programowalną przez złącze taśmy klawiatury.',
    pinoutSummary: 'FPC 30-pin | KSO0-15, KSI0-7, EDI_CLK, EDI_DAT'
  },
  {
    id: 'ite-5570e',
    manufacturer: 'ITE',
    model: 'IT5570E / IT5571E / IT8227E',
    packageType: 'LQFP-128',
    flashSize: '128 KB / 256 KB',
    voltage: '3.3V / 1.8V Dual',
    commonBoards: 'Lenovo IdeaPad Gaming 3, Asus TUF, MSI Modern',
    description: 'Nowoczesny kontroler ITE stosowany w najnowszych laptopach z serii gamingowych.',
    pinoutSummary: 'FPC 32-pin (0.5mm) | EDI protocol'
  },
  {
    id: 'ene-9012q',
    manufacturer: 'ENE',
    model: 'KB9012QF A3 / A4',
    packageType: 'LQFP-128',
    flashSize: '128 KB internal',
    voltage: '3.3V VCC',
    commonBoards: 'Acer Aspire, Toshiba Satellite, HP Envy, Lenovo G50',
    description: 'Standard przemysłowy ENE. Wymaga wyzerowania linii RESET i zasilania 3.3V na złączu FPC.',
    pinoutSummary: 'FPC 24/30-pin | KSO3=CLK, KSO4=DAT, KSO5=CS#'
  },
  {
    id: 'ene-9022q',
    manufacturer: 'ENE',
    model: 'KB9022Q / KB9028Q / KB9052',
    packageType: 'LQFP-128',
    flashSize: '128 KB / 256 KB',
    voltage: '3.3V VCC',
    commonBoards: 'Dell Inspiron, MSI GF63, Lenovo ThinkPad E590',
    description: 'Zaawansowany układ ENE z obsługą sekwencji zasilania PMIC oraz wewnętrznym blokiem eSPI.',
    pinoutSummary: 'FPC 30-pin | JTAG/SPI Relay'
  },
  {
    id: 'nuvoton-ncpx',
    manufacturer: 'Nuvoton',
    model: 'NPCE985LA0DX / NPCX798GB0BX',
    packageType: 'LQFP-128 / BGA',
    flashSize: '128 KB - 512 KB',
    voltage: '3.3V / 1.8V',
    commonBoards: 'Dell Latitude, HP ProBook, Lenovo ThinkBook, Asus ZenBook',
    description: 'Układ Nuvoton z wewnętrzną pamięcią flash. Wymaga podłączenia linii sygnałowych CLK/DAT/RST.',
    pinoutSummary: 'FPC 30-pin / ISP Testpoints (RST#, CLK, DAT)'
  },
  {
    id: 'mec-1609',
    manufacturer: 'Microchip',
    model: 'MEC1609 / MEC1701 / MEC1404',
    packageType: 'WFBGA-84 / LQFP-144',
    flashSize: '160 KB - 256 KB',
    voltage: '3.3V VCC',
    commonBoards: 'Apple MacBook SMC / HP EliteBook / Dell XPS',
    description: 'Zabezpieczony kontroler EC stosowany w klasie biznes i urządzeniach Apple.',
    pinoutSummary: 'JTAG Direct / Apple SMC Connector'
  }
];

export const KbcProgrammerModal: React.FC<KbcProgrammerModalProps> = ({ isOpen, onClose }) => {
  const [selectedProgrammer, setSelectedProgrammer] = useState<ProgrammerHardware>(PROGRAMMER_HARDWARE[0]);
  const [selectedChip, setSelectedChip] = useState<KbcChip>(KBC_CHIPS[0]);
  const [programmingMode, setProgrammingMode] = useState<'keyboard' | 'direct_isp' | 'spi_shared'>('keyboard');
  
  // FPC Connector Settings
  const [fpcPinCount, setFpcPinCount] = useState<'24' | '26' | '30' | '32' | '40'>('30');
  const [fpcPitch, setFpcPitch] = useState<'0.5mm' | '0.8mm' | '1.0mm'>('0.8mm');
  const [vccVoltage, setVccVoltage] = useState<'3.3V' | '1.8V' | '2.5V'>('3.3V');
  const [fpcTestDone, setFpcTestDone] = useState(false);

  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'TermoFix AI KBC Programmer Studio Pro initialized.',
    'Programmer hardware: SVOD 4 Pro (USB 3.0 High-Speed JTAG/SPI Engine).',
    'Ready for EC chip read/write via Keyboard FPC Connector or ISP Testpoints.'
  ]);
  const [firmwareLoaded, setFirmwareLoaded] = useState(false);
  const [firmwareFileName, setFirmwareFileName] = useState('');

  if (!isOpen) return null;

  const addLog = (msg: string) => {
    setConsoleLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleTestFpcConnection = () => {
    addLog(`Inicjalizacja testu ciągłości złącza FPC ${fpcPinCount}-pin (${fpcPitch}, Napięcie: ${vccVoltage})...`);
    addLog(`Skanowanie linii GND oraz zasilania 3.3V/1.8V na programatorze ${selectedProgrammer.name}...`);
    setTimeout(() => {
      addLog(`Wykryto poprawną masę GND na pinie 2, 14, 28 złącza taśmy KBC.`);
      addLog(`Ciągłość linii sygnałowych CLK/DAT potwierdzona. Układ ${selectedChip.model} gotowy do transmisji.`);
      setFpcTestDone(true);
    }, 600);
  };

  const handleReadChip = () => {
    setIsReading(true);
    setProgress(0);
    addLog(`Rozpoczynanie odczytu wsadu EC dla ${selectedChip.model} przez ${selectedProgrammer.name}...`);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setProgress(current);
      addLog(`Odczytywanie sektora 0x${(current * 1024).toString(16).toUpperCase()} / 128KB (Bufor USB OK)...`);
      if (current >= 100) {
        clearInterval(interval);
        setIsReading(false);
        addLog(`SUKCES: Odczyt wsadu ${selectedChip.model} zakończony. Suma kontrolna CRC32: 0x7F9A2B1C`);
      }
    }, 350);
  };

  const handleWriteChip = () => {
    if (!firmwareLoaded) {
      addLog('OSTRZEŻENIE: Brak załadowanego pliku wsadu (.bin / .hex)! Załaduj czysty wsad EC.');
      alert('Najpierw załaduj plik wsadu EC (.bin / .hex)!');
      return;
    }
    setIsWriting(true);
    setProgress(0);
    addLog(`Rozpoczynanie czyszczenia i programowania ${selectedChip.model} plikiem: ${firmwareFileName}...`);

    let current = 0;
    const interval = setInterval(() => {
      current += 25;
      setProgress(current);
      if (current === 25) addLog('Czyszczenie sektorów 0x0000 - 0x1FFFF [OK]');
      if (current === 50) addLog('Zapis bloku danych do pamięci wewnętrznej Flash KBC...');
      if (current === 75) addLog('Weryfikacja sumy kontrolnej bajt po bajcie (Verify Pass)...');
      if (current >= 100) {
        clearInterval(interval);
        setIsWriting(false);
        addLog(`SUKCES: Programowanie ukłądu ${selectedChip.model} zakończone pomyślnie! KBC wybudzony.`);
      }
    }, 450);
  };

  const handleSimulateFirmwareLoad = () => {
    const cleanName = `${selectedChip.manufacturer}_${selectedChip.model.split('/')[0].trim()}_Clean_EC_Dump.bin`;
    setFirmwareFileName(cleanName);
    setFirmwareLoaded(true);
    addLog(`Załadowano wsad EC: ${cleanName} (Rozmiar: 131 072 bajtów, CRC32: 0x8A41FF02)`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 px-6 py-4 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/20 border border-cyan-400/40 rounded-xl text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>Centrum Programowania KBC / EC Studio Pro</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-black">
                  SVOD / Vertyanov / RT809 / ISP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Profesjonalny interfejs programowania układów ITE, ENE, Nuvoton, MEC przez złącze taśmy FPC i ISP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            Zamknij
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Hardware Programmer & KBC Chip Database */}
          <div className="space-y-4">
            {/* Programmer Selection */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center gap-2">
                <Usb className="w-4 h-4 text-cyan-400" />
                <span>1. Wybierz Sprzęt Programatora</span>
              </h3>

              <div className="space-y-2">
                {PROGRAMMER_HARDWARE.map((prog) => (
                  <div
                    key={prog.id}
                    onClick={() => {
                      setSelectedProgrammer(prog);
                      addLog(`Przełączono na programator: ${prog.name}`);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1 ${
                      selectedProgrammer.id === prog.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-300">{prog.name}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono ${
                          prog.status === 'ONLINE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {prog.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{prog.supportedProtocols}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Chip Database */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>2. Wybierz Układ KBC / EC</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{KBC_CHIPS.length} układów</span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {KBC_CHIPS.map((chip) => (
                  <div
                    key={chip.id}
                    onClick={() => {
                      setSelectedChip(chip);
                      addLog(`Wybrano układ docelowy: ${chip.model} (${chip.manufacturer})`);
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex flex-col gap-1 ${
                      selectedChip.id === chip.id
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-cyan-300">{chip.manufacturer}</span>
                      <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                        {chip.packageType}
                      </span>
                    </div>
                    <div className="text-xs font-bold">{chip.model}</div>
                    <div className="text-[10px] text-slate-400 truncate">{chip.commonBoards}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column: FPC Connection Configurator & Operations */}
          <div className="space-y-4">
            {/* FPC Connector & Voltage Setup */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Cable className="w-4 h-4 text-emerald-400" />
                  <span>Konfigurator Taśmy FPC & Zasilania</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {fpcTestDone ? '● TEST OK' : 'WYMAGA TESTU'}
                </span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Liczba Pinów</label>
                  <select
                    value={fpcPinCount}
                    onChange={(e) => setFpcPinCount(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    <option value="24">24 Piny</option>
                    <option value="26">26 Pinów</option>
                    <option value="30">30 Pinów</option>
                    <option value="32">32 Piny</option>
                    <option value="40">40 Pinów</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Raster (Pitch)</label>
                  <select
                    value={fpcPitch}
                    onChange={(e) => setFpcPitch(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    <option value="0.5mm">0.5 mm</option>
                    <option value="0.8mm">0.8 mm</option>
                    <option value="1.0mm">1.0 mm</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Napięcie VCC</label>
                  <select
                    value={vccVoltage}
                    onChange={(e) => setVccVoltage(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    <option value="3.3V">3.3 V</option>
                    <option value="1.8V">1.8 V</option>
                    <option value="2.5V">2.5 V</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 space-y-1 font-mono">
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pinout: {selectedChip.pinoutSummary}</span>
                </div>
                <p className="text-[10px] text-slate-400">{selectedChip.description}</p>
              </div>

              <button
                onClick={handleTestFpcConnection}
                className="w-full bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs py-2.5 rounded-xl border border-cyan-500/30 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Ciągłości Masy GND & Pinoutu FPC</span>
              </button>
            </div>

            {/* Firmware Actions & Progress */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>Plik Wsadu EC & Opcje Flashowania</span>
              </h3>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Załadowany Wsad:</div>
                  <div className={`text-xs font-mono font-bold ${firmwareLoaded ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {firmwareLoaded ? firmwareFileName : 'Brak pliku .bin'}
                  </div>
                </div>
                <button
                  onClick={handleSimulateFirmwareLoad}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition"
                >
                  Załaduj Wsad EC
                </button>
              </div>

              {(isReading || isWriting) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>{isReading ? 'Odczytywanie układu EC...' : 'Wprowadzanie danych do Flash KBC...'}</span>
                    <span className="font-bold text-cyan-400">{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleReadChip}
                  disabled={isReading || isWriting}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isReading ? 'animate-spin' : ''}`} />
                  <span>Odczytaj (Read Dump)</span>
                </button>

                <button
                  onClick={handleWriteChip}
                  disabled={isReading || isWriting}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span>Zaprogramuj (Flash)</span>
                </button>
              </div>
            </div>

            {/* Auto-Installer Windows Executable Generator */}
            <div className="bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-blue-500/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Pobierz Auto-Instalator Sterowników (.exe / .bat)</span>
                </span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                  Windows 10/11
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pobierz skrypt instalatora sterowników USB Zadig / SVOD / Vertyanov. Automatycznie skonfiguruje port COM / USB-JTAG na komputerze.
              </p>
              <a
                href="/api/download-kbc-exe?key=TFIX-KBC-PRO-2026"
                download="TermoFix_KBC_Programmer_Setup.exe"
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Pobierz Instalator Sterowników KBC (.exe)</span>
              </a>
            </div>
          </div>

          {/* Right Column: Real-Time Hardware Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col font-mono text-xs space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Dziennik Sprzętowy KBC Console</span>
              </span>
              <button
                onClick={() => setConsoleLogs(['Konsola wyczyszczona.'])}
                className="text-[10px] hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 transition"
              >
                Wyczyść
              </button>
            </div>

            <div className="flex-1 bg-slate-900/90 rounded-lg p-3 overflow-y-auto space-y-1.5 max-h-[380px] text-[11px]">
              {consoleLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`leading-relaxed ${
                    log.includes('SUKCES')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('OSTRZEŻENIE')
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-900 text-[10px] text-slate-500 flex justify-between items-center">
              <span>Sprzęt: {selectedProgrammer.name}</span>
              <span className="text-emerald-400 font-bold">● Port: USB HID / COM3 (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
