import React from 'react';
import {
  Wand2,
  Key,
  Archive,
  Smartphone,
  Search,
  Cpu,
  Flame,
  Wrench,
  BookOpen,
  Terminal,
  HardDrive,
  Database,
  Notebook,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Clock,
  Gauge,
  Download,
  Cloud,
  KeyRound,
  ShoppingBag,
  Scan,
  RefreshCw,
  Tv,
  Radio,
  Layers,
  Server,
  Globe,
  Disc,
  Monitor,
  Usb,
  Sliders,
  Eye,
  UserCheck,
  Mic
} from 'lucide-react';
import { GlobalSearchBar } from "./GlobalSearchBar";
import { RepairJournalEntry } from "../types";

interface HeaderProps {
  onOpenMultimeterGuide: () => void;
  onOpenPresets: () => void;
  onOpenWindowsRepair: () => void;
  onOpenDiskDiagnostics: () => void;
  onOpenGpuDiagnostics: () => void;
  onOpenMatsModsDiagnostic?: () => void;
  onOpenBgaDiagnostics: () => void;
  onOpenRepairJournal: () => void;
  onOpenErrorCodeDatabase: () => void;
  onOpenDiagnosticWizard: () => void;
  onOpenClientReport: () => void;
  onOpenDeviceHistoryTimeline: () => void;
  onOpenBenchPowerSupply: () => void;
  onOpenInstallerModal: () => void;
  onOpenWorkspaceModal?: () => void;
  onOpenDataRecovery?: () => void;
  onOpenBitLockerBreaker?: () => void;
  onOpenBatchArchiveExtractor?: () => void;
  onOpenDuplicateFileFinder?: () => void;
  onOpenSpellChecker?: () => void;
  onOpenMobileSmsApp?: () => void;
  onOpenAntivirusModal?: () => void;
  onOpenStressTestWorkstation?: () => void;
  onOpenLicenseStore?: () => void;
  onOpenBiosUnlocker?: () => void;
  onOpenCdKeyGenerator?: () => void;
  onOpenSystemScanKeysUpdaterRepair?: () => void;
  onOpenMicroscopeHdmi?: () => void;
  onOpenInstructionVideoTutorials?: () => void;
  onOpenGlobalRadioMp3?: () => void;
  onOpenExeModal?: () => void;
  onOpenBoardSchematic?: () => void;
  onOpenIr6500BgaStation?: () => void;
  onOpenNasServerSync?: () => void;
  onOpenSpeedTest15Gb?: () => void;
  onOpenLiveWebLauncher?: () => void;
  onOpenAntivirusUnblock?: () => void;
  onOpenWindowsIsoBuilder?: () => void;
  onOpenStrelecRescue?: () => void;
  onOpenUsbBurner?: () => void;
  onOpenKbcProgrammer?: () => void;
  onOpenSystemUpdateLog?: () => void;
  onOpenAuthModal?: () => void;
  onOpenVoiceAssistant?: () => void;
  activePresetTitle?: string;
  journalEntries?: RepairJournalEntry[];
  onSendToChat?: (prompt: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMultimeterGuide,
  onOpenPresets,
  onOpenWindowsRepair,
  onOpenDiskDiagnostics,
  onOpenGpuDiagnostics,
  onOpenMatsModsDiagnostic,
  onOpenBgaDiagnostics,
  onOpenRepairJournal,
  onOpenErrorCodeDatabase,
  onOpenDiagnosticWizard,
  onOpenClientReport,
  onOpenDeviceHistoryTimeline,
  onOpenBenchPowerSupply,
  onOpenInstallerModal,
  onOpenDataRecovery,
  onOpenBitLockerBreaker,
  onOpenBatchArchiveExtractor,
  onOpenWorkspaceModal,
  onOpenDuplicateFileFinder,
  onOpenSpellChecker,
  onOpenMobileSmsApp,
  onOpenAntivirusModal,
  onOpenStressTestWorkstation,
  onOpenLicenseStore,
  onOpenBiosUnlocker,
  onOpenCdKeyGenerator,
  onOpenSystemScanKeysUpdaterRepair,
  onOpenMicroscopeHdmi,
  onOpenInstructionVideoTutorials,
  onOpenGlobalRadioMp3,
  onOpenExeModal,
  onOpenBoardSchematic,
  onOpenIr6500BgaStation,
  onOpenNasServerSync,
  onOpenSpeedTest15Gb,
  onOpenLiveWebLauncher,
  onOpenAntivirusUnblock,
  onOpenWindowsIsoBuilder,
  onOpenStrelecRescue,
  onOpenUsbBurner,
  onOpenKbcProgrammer,
  onOpenSystemUpdateLog,
  onOpenAuthModal,
  onOpenVoiceAssistant,
  activePresetTitle,
  journalEntries = [],
  onSendToChat,
}) => {
  const [currentUser, setCurrentUser] = React.useState('Serwis (Gość / Bez hasła)');
  const [passwordFreeMode, setPasswordFreeMode] = React.useState(true);
  const [uiThemeMode, setUiThemeMode] = React.useState<'technician' | 'client'>(() => {
    return (localStorage.getItem('termofix_ui_mode') as 'technician' | 'client') || 'technician';
  });

  React.useEffect(() => {
    const user = localStorage.getItem('termofix_auth_user');
    const pf = localStorage.getItem('termofix_password_free');
    if (user) setCurrentUser(user);
    if (pf !== null) setPasswordFreeMode(pf === 'true');

    document.body.classList.remove('mode-technician', 'mode-client');
    document.body.classList.add(`mode-${uiThemeMode}`);
  }, [uiThemeMode]);

  const toggleUiThemeMode = () => {
    const nextMode = uiThemeMode === 'technician' ? 'client' : 'technician';
    setUiThemeMode(nextMode);
    localStorage.setItem('termofix_ui_mode', nextMode);
    document.body.classList.remove('mode-technician', 'mode-client');
    document.body.classList.add(`mode-${nextMode}`);
    window.dispatchEvent(new CustomEvent('termofix-theme-mode-changed', { detail: { mode: nextMode } }));
  };
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Logo & Company Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-white p-1 rounded-xl border border-blue-300 shadow-md flex items-center justify-center w-10 h-10 shrink-0">
            <img
              src="/logo.svg"
              alt="Serwis Pogotowie Rafał Jarosz"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                <span>SERWIS POGOTOWIE RAFAŁ JAROSZ</span>
              </h1>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold hidden lg:flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                naprawapclaptop.pl • 786 409 187
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden xl:block font-medium">
              Naprawa Komputerów i Laptopów • Warszawa, ul. Marymoncka 125 m.109 p.6
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <GlobalSearchBar
            journalEntries={journalEntries}
            onOpenErrorCodeDatabase={onOpenErrorCodeDatabase}
            onOpenRepairJournal={onOpenRepairJournal}
            onOpenMultimeterGuide={onOpenMultimeterGuide}
            onOpenBgaDiagnostics={onOpenBgaDiagnostics}
            onOpenGpuDiagnostics={onOpenGpuDiagnostics}
            onOpenWindowsRepair={onOpenWindowsRepair}
            onSendToChat={onSendToChat}
          />
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto py-1">
          
          {/* Asystent Głosowy AI */}
          {onOpenVoiceAssistant && (
            <button
              id="btn-voice-assistant-header"
              onClick={onOpenVoiceAssistant}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-extrabold shadow-lg shrink-0 border border-indigo-400/50 animate-pulse"
              title="Asystent Głosowy AI • Steruj komputerem głosem (Mów co ma robić, a system wykona to za Ciebie)"
            >
              <Mic className="w-4 h-4 text-white animate-bounce" />
              <span className="hidden sm:inline">Asystent Głosowy</span>
              <span className="sm:hidden">Głos</span>
            </button>
          )}

          {/* ThemeConfigurator: Tryb Technika vs Tryb Klienta */}
          <button
            id="btn-theme-configurator"
            onClick={toggleUiThemeMode}
            className={`flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-lg font-black border transition shrink-0 shadow-md ${
              uiThemeMode === 'technician'
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 text-amber-300 border-amber-400/60 hover:bg-amber-500/30 ring-1 ring-amber-400/40'
                : 'bg-gradient-to-r from-blue-600/20 via-sky-600/20 to-blue-600/20 text-sky-300 border-sky-400/60 hover:bg-sky-600/30'
            }`}
            title="ThemeConfigurator: Przełącz widok interfejsu pomiędzy wysokokontrastowym 'Trybem Technika' (pełna diagnostyka) a 'Trybem Klienta' (uproszczony układ)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden md:inline font-mono">
              {uiThemeMode === 'technician' ? 'Tryb Technika (Wysoki Kontrast)' : 'Tryb Klienta (Uproszczony)'}
            </span>
            <span className="md:hidden font-mono">
              {uiThemeMode === 'technician' ? 'Technik' : 'Klient'}
            </span>
          </button>
          
          {/* Auth & ISO Password Status Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition font-bold shrink-0 shadow-sm"
              title="Zarządzaj kontem, hasłem i trybem bez hasła do ISO i serwisu"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline font-mono">{currentUser}</span>
              <span className="md:hidden">Konto</span>
            </button>
          )}

          {/* MATS / MODS VRAM Diagnostic Workflow Button */}
          {onOpenMatsModsDiagnostic && (
            <button
              id="btn-mats-mods-vram-diagnostic"
              onClick={onOpenMatsModsDiagnostic}
              className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-purple-400/40"
              title="Dedykowany Moduł Diagnozy VRAM MATS / MODS NVIDIA (Parser report.txt, Błędy Kanałów A0-F1, Mapa Kości BGA)"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span className="hidden sm:inline">MATS/MODS VRAM</span>
              <span className="sm:hidden">MATS</span>
            </button>
          )}

          {/* Microscope HDMI USB Capture Button */}
          {onOpenMicroscopeHdmi && (
            <button
              id="btn-microscope-hdmi"
              onClick={onOpenMicroscopeHdmi}
              className="flex items-center space-x-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-cyan-400/40"
              title="Mikroskop HDMI / Przejściówka USB Video Capture (Odbiór Obrazu PCB BGA na żywo)"
            >
              <Tv className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span className="hidden sm:inline">Mikroskop HDMI USB</span>
              <span className="sm:hidden">Mikroskop HDMI</span>
            </button>
          )}

          {/* Poradniki Wideo HD Button */}
          {onOpenInstructionVideoTutorials && (
            <button
              id="btn-instruction-video-tutorials"
              onClick={onOpenInstructionVideoTutorials}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-amber-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-red-400/40"
              title="Akademia Poradników Wideo HD & Instrukcji Diagnostycznych Krok Po Kroku"
            >
              <Tv className="w-3.5 h-3.5 text-red-200 animate-pulse" />
              <span className="hidden sm:inline">Poradniki Wideo HD</span>
              <span className="sm:hidden">Wideo</span>
            </button>
          )}

          {/* Światowe Radio & MP3 Player Button */}
          {onOpenGlobalRadioMp3 && (
            <button
              id="btn-global-radio-mp3-player"
              onClick={onOpenGlobalRadioMp3}
              className="flex items-center space-x-1 bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:from-amber-500 hover:to-purple-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-amber-400/40"
              title="Radio Światowe Live & Odtwarzacz MP3 z Dysku / Google Drive"
            >
              <Radio className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span className="hidden sm:inline">Radio &amp; MP3</span>
              <span className="sm:hidden">Radio</span>
            </button>
          )}

          {/* BoardSchematicViewer Button */}
          {onOpenBoardSchematic && (
            <button
              id="btn-board-schematic-viewer"
              onClick={onOpenBoardSchematic}
              className="flex items-center space-x-1 bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-teal-400/40 animate-pulse"
              title="BoardSchematicViewer: Nakładki pin-out schematów na obraz termowizyjny do szybkiej diagnozy napięć"
            >
              <Layers className="w-3.5 h-3.5 text-teal-200" />
              <span className="hidden sm:inline">Schemat Pin-Out</span>
              <span className="sm:hidden">Pin-Out</span>
            </button>
          )}

          {/* IR6500 BGA Rework Station Button */}
          {onOpenIr6500BgaStation && (
            <button
              id="btn-ir6500-bga-station"
              onClick={onOpenIr6500BgaStation}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-red-400/40 animate-pulse"
              title="IR6500 BGA Rework Station (www.easy.bga.com) - Sterowanie grzałkami IR i profilami reflow"
            >
              <Flame className="w-3.5 h-3.5 text-red-200" />
              <span className="hidden sm:inline">IR6500 BGA Station</span>
              <span className="sm:hidden">IR6500</span>
            </button>
          )}

          {/* NAS Server Sync Button */}
          {onOpenNasServerSync && (
            <button
              id="btn-nas-server-sync"
              onClick={onOpenNasServerSync}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-blue-400/40 animate-pulse"
              title="Serwer NAS (https://192.168.0.6:8040/portal/) - Synchronizacja plików PC i serwera"
            >
              <Server className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">NAS 192.168.0.6</span>
              <span className="sm:hidden">NAS</span>
            </button>
          )}

          {/* 15 Gbps Speed Test Button */}
          {onOpenSpeedTest15Gb && (
            <button
              id="btn-speed-test-15gb"
              onClick={onOpenSpeedTest15Gb}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-emerald-400/40 animate-pulse"
              title="SpeedTest do 15 Gb/s - Ultraszybki tester łącza światłowodowego i NAS"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">SpeedTest 15 Gb/s</span>
              <span className="sm:hidden">15Gb</span>
            </button>
          )}

          {/* Live Web Launcher Button */}
          {onOpenLiveWebLauncher && (
            <button
              id="btn-live-web-launcher"
              onClick={onOpenLiveWebLauncher}
              className="flex items-center space-x-1 bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-cyan-400/40 animate-pulse"
              title="Uruchom stronę na żywo i serwer WWW w czasie rzeczywistym"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden sm:inline">Live Strona & Serwer</span>
              <span className="sm:hidden">Live</span>
            </button>
          )}

          {/* Antivirus Unblock Helper Button */}
          {onOpenAntivirusUnblock && (
            <button
              id="btn-antivirus-unblock"
              onClick={onOpenAntivirusUnblock}
              className="flex items-center space-x-1 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-amber-400/40"
              title="Pomocnik odblokowania w antywirusie / Windows Defender / SmartScreen"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Antivirus Blokada</span>
              <span className="sm:hidden">Antivirus</span>
            </button>
          )}

          {/* Windows ISO Builder Button */}
          {onOpenWindowsIsoBuilder && (
            <button
              id="btn-windows-iso-builder"
              onClick={onOpenWindowsIsoBuilder}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-blue-400/40"
              title="Pobierz bootowalny obraz ISO Windows z wbudowanymi sterownikami i narzędziami"
            >
              <Disc className="w-3.5 h-3.5 text-blue-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">Windows ISO + Sterowniki</span>
              <span className="sm:hidden">Win ISO</span>
            </button>
          )}

          {/* Windows PE Strelec & SerGEI Rescue Suite Button */}
          {onOpenStrelecRescue && (
            <button
              id="btn-strelec-rescue"
              onClick={onOpenStrelecRescue}
              className="flex items-center space-x-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-violet-400/40 animate-pulse"
              title="Windows PE Strelec / SerGEI Rescue Suite - Środowisko ratunkowe z narzędziami"
            >
              <Monitor className="w-3.5 h-3.5 text-violet-200" />
              <span className="hidden sm:inline">WinPE Strelec / SerGEI</span>
              <span className="sm:hidden">Strelec</span>
            </button>
          )}

          {/* USB Flash Burner (Rufus/Ventoy) Button */}
          {onOpenUsbBurner && (
            <button
              id="btn-usb-burner"
              onClick={onOpenUsbBurner}
              className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-indigo-400/40"
              title="Rufus / Ventoy USB Flash Burner - Wypal obraz ISO lub WinPE na pendrive"
            >
              <Usb className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">Rufus USB Burner</span>
              <span className="sm:hidden">USB</span>
            </button>
          )}

          {/* KBC / EC Programmer Pro Button */}
          {onOpenKbcProgrammer && (
            <button
              id="btn-kbc-programmer"
              onClick={onOpenKbcProgrammer}
              className="flex items-center space-x-1 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-cyan-400/40 animate-pulse"
              title="KBC / EC Programmer Studio Pro - Programator układów ITE, ENE, Nuvoton z auto-instalacją"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-200 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="hidden sm:inline">Programator KBC Pro</span>
              <span className="sm:hidden">KBC</span>
            </button>
          )}

          {/* Master Service Suite .EXE Download Button */}
          <a
            id="btn-download-master-exe"
            href="/api/download-all-service-tools-exe"
            download="Serwis_Rafal_Jarosz_TermoFix_Master_Setup.exe"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-extrabold shadow-lg shrink-0 border border-emerald-400/50 animate-bounce"
            title="Pobierz Kompletny Instalator .EXE Serwisu Rafał Jarosz (Wszystkie schematy, boardview, KBC, narzędzia)"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span className="hidden sm:inline">Pobierz Master .EXE (Serwis Rafał Jarosz)</span>
            <span className="sm:hidden">Master .EXE</span>
          </a>
          
          {/* Live Scanner & CD-Key & Repair Programs Button */}
          {onOpenSystemScanKeysUpdaterRepair && (
            <button
              id="btn-system-scan-keys-repair"
              onClick={onOpenSystemScanKeysUpdaterRepair}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-emerald-400/30"
              title="Skaner Podzespołów Na Żywo (EDID Matryce, CPU, GPU), Ekstraktor Kluczy CD-Key, Aktualizator & Naprawa Programów"
            >
              <Scan className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">Skaner &amp; CD-Key &amp; Naprawa</span>
              <span className="sm:hidden">Skaner All-In-One</span>
            </button>
          )}

          {/* License Store & Configurator Button */}
          {onOpenLicenseStore && (
            <button
              id="btn-license-store"
              onClick={onOpenLicenseStore}
              className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0"
              title="Sklep Licencji TermoFix AI: Kup Licencję, Pobierz Instalator Pulpitowy .EXE/.BAT, Klucz HWID"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Sklep Licencji</span>
              <span className="sm:hidden">Licencje</span>
            </button>
          )}

          {/* System Update Log & Changelog Button */}
          {onOpenSystemUpdateLog && (
            <button
              id="btn-system-update-log"
              onClick={onOpenSystemUpdateLog}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0 border border-cyan-500/30"
              title="Dziennik Zmian Systemu i Wersji (System Update Log & Audit)"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Dziennik Zmian</span>
              <span className="sm:hidden">Log</span>
            </button>
          )}

          {/* EXE Build Export Button */}
          {onOpenExeModal && (
            <button
              id="btn-exe-builder"
              onClick={onOpenExeModal}
              className="flex items-center space-x-1 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-lg shrink-0 border border-teal-400 animate-pulse"
              title="Kompiluj aplikację do samodzielnego pliku .EXE dla systemu Windows (Serwis Pogotowie Rafał Jarosz)"
            >
              <Download className="w-3.5 h-3.5 text-teal-200" />
              <span className="hidden sm:inline">Eksport .EXE</span>
              <span className="sm:hidden">.EXE</span>
            </button>
          )}

          {/* BIOS Password Unlocker Button */}
          {onOpenBiosUnlocker && (
            <button
              id="btn-bios-unlocker"
              onClick={onOpenBiosUnlocker}
              className="flex items-center space-x-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0 border border-cyan-400/30"
              title="Łamacz Haseł BIOS / Master Password Calculator (Dell, HP, ThinkPad, Insyde, SPI CH341A)"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden sm:inline">Łamacz BIOS</span>
              <span className="sm:hidden">BIOS</span>
            </button>
          )}

          {/* CD Key Generator & Activator Button */}
          {onOpenCdKeyGenerator && (
            <button
              id="btn-cd-key-generator"
              onClick={onOpenCdKeyGenerator}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0 border border-emerald-400/30"
              title="Generator Kluczy CD Windows 11/10 & Office & Skrypty Aktywacyjne KMS"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span className="hidden sm:inline">Klucze CD &amp; KMS</span>
              <span className="sm:hidden">CD-Key</span>
            </button>
          )}

          {/* Google Workspace Integration Button */}
          {onOpenWorkspaceModal && (
            <button
              id="btn-workspace-integration"
              onClick={onOpenWorkspaceModal}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0"
              title="Google Workspace: Drive, Gmail, Tasks, Chat, Contacts, Forms"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">Google Workspace</span>
              <span className="sm:hidden">Workspace</span>
            </button>
          )}

          {/* Video Tutorials / Akademia Wideo Button */}
          {onOpenInstructionVideoTutorials && (
            <button
              id="btn-instruction-videos"
              onClick={onOpenInstructionVideoTutorials}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-extrabold shadow-md shrink-0 border border-red-400/40 animate-pulse"
              title="Akademia Poradników Wideo & Warsztatu Serwisowego (BGA, Termowizja, Multimetr, Windows)"
            >
              <Tv className="w-3.5 h-3.5 text-red-200" />
              <span className="hidden sm:inline">Akademia Wideo (Tutoriale)</span>
              <span className="sm:hidden">Wideo</span>
            </button>
          )}

          {/* Stress Test Workstation Button */}
          {onOpenStressTestWorkstation && (
            <button
              id="btn-stress-test-workstation"
              onClick={onOpenStressTestWorkstation}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0 border border-orange-400/30"
              title="Stanowisko Testów Obciążeniowych CPU/GPU (FurMark, Prime95, OCCT, Monitoring Termiczny)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span className="hidden sm:inline">Stanowisko Stress Test</span>
              <span className="sm:hidden">Stress Test</span>
            </button>
          )}

          {/* FurMark & Perf-Checker Button */}
          <button
            id="btn-furmark-bench"
            onClick={onOpenGpuDiagnostics}
            className="flex items-center space-x-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 text-orange-300 text-xs px-2.5 py-1.5 rounded-lg border border-orange-500/40 transition font-bold shrink-0"
            title="Uruchom FurMark, 3DMark, Prime95 i Perf-Checker (Testy Obciążeniowe)"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">FurMark &amp; Testy</span>
            <span className="sm:hidden">FurMark</span>
          </button>

          {/* Antivirus & Auto-Repair Button */}
          {onOpenAntivirusModal && (
            <button
              id="btn-antivirus-repair"
              onClick={onOpenAntivirusModal}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs px-2.5 py-1.5 rounded-lg transition font-bold shadow-md shrink-0 border border-emerald-400/30"
              title="Antywirus, Skaner Wirusów/Błędów, Kwarantanna, Aktualizacja Podzespołów i Programów"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              <span>Antywirus &amp; Skaner</span>
            </button>
          )}

          {/* BitLocker Breaker Button */}
          {onOpenBitLockerBreaker && (
            <button
              onClick={onOpenBitLockerBreaker}
              className="flex items-center space-x-1 bg-red-900/40 hover:bg-red-800/50 text-red-300 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 transition font-medium shrink-0"
              title="Złamanie Hasła BitLocker / Odzyskiwanie z USB"
            >
              <Key className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden lg:inline">BitLocker Cracker</span>
            </button>
          )}
          {/* Data Recovery Button */}
          {onOpenDataRecovery && (
            <button
              onClick={onOpenDataRecovery}
              className="flex items-center space-x-1 bg-amber-900/40 hover:bg-amber-800/50 text-amber-300 text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition font-medium shrink-0"
              title="Odzyskiwanie Danych (Usunięte / Format)"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Odzyskiwanie Danych</span>
            </button>
          )}
          {/* Batch Archive Extractor Button */}
          {onOpenBatchArchiveExtractor && (
            <button
              onClick={onOpenBatchArchiveExtractor}
              className="flex items-center space-x-1 bg-indigo-900/40 hover:bg-indigo-800/50 text-indigo-300 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-500/30 transition font-medium shrink-0"
              title="Rozpakuj wiele archiwów (ZIP/RAR)"
            >
              <Archive className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Multi-Wypakuj</span>
            </button>
          )}
          {/* Duplicate File Finder Button */}
          {onOpenDuplicateFileFinder && (
            <button
              onClick={onOpenDuplicateFileFinder}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
              title="Skaner Zduplikowanych Plików"
            >
              <Search className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Usuń Duplikaty</span>
            </button>
          )}
          {/* Spell Checker Button */}
          {onOpenSpellChecker && (
            <button
              onClick={onOpenSpellChecker}
              className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
              title="Automatyczna Poprawa Pisowni"
            >
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline">Poprawa Pisowni</span>
            </button>
          )}
          {/* Mobile SMS App Button */}
          {onOpenMobileSmsApp && (
            <button
              onClick={onOpenMobileSmsApp}
              className="flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/30 transition font-medium shrink-0"
              title="Bramka SMS na Androida"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Bramka SMS</span>
            </button>
          )}
          {/* Diagnostic Wizard Button */}
          <button
            id="btn-diagnostic-wizard"
            onClick={onOpenDiagnosticWizard}
            className="flex items-center space-x-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs px-2.5 py-1.5 rounded-lg font-bold transition shadow-md shrink-0"
            title="Kreator Diagnozy & Protokół Testowy (Kamera, Termowizja, Multimetr, BIOS, SMART)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
            <span>Kreator Diagnozy</span>
          </button>

          {/* Client Report Export Button */}
          <button
            id="btn-client-report"
            onClick={onOpenClientReport}
            className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition shadow-md shrink-0"
            title="Kompiluj Raport dla Klienta & Drukuj Schematy"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span className="hidden md:inline">Raport &amp; Druk</span>
            <span className="md:hidden">Raport</span>
          </button>

          {/* Bench Power Supply S-LS-58 Button */}
          <button
            id="btn-power-supply"
            onClick={onOpenBenchPowerSupply}
            className="flex items-center space-x-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition font-bold shrink-0"
            title="Sterownik Zasilacza Laboratoryjnego S-LS-58 (USB Serial, Próba Zwarciowa)"
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Zasilacz S-LS-58</span>
            <span className="lg:hidden">Zasilacz</span>
          </button>

          {/* Device History Timeline Button */}
          <button
            id="btn-device-timeline"
            onClick={onOpenDeviceHistoryTimeline}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Interaktywna oś czasu historii napraw S/N"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Oś Czasu S/N</span>
            <span className="lg:hidden">Oś Czasu</span>
          </button>

          {/* Multiplatform App Installer Button */}
          <button
            id="btn-app-installer"
            onClick={onOpenInstallerModal}
            className="flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs px-2.5 py-1.5 rounded-lg border border-emerald-400/40 transition font-bold shadow-md shrink-0"
            title="Instalator na Pulpit Windows (.BAT / .PS1 / PWA), Android APK, Linux, Mac"
          >
            <Download className="w-3.5 h-3.5 text-white animate-bounce" />
            <span>Instalator Pulpit Windows</span>
          </button>

          {/* Preset Cases Selector */}
          <button
            id="btn-presets"
            onClick={onOpenPresets}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Wybierz przypadek usterki"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Przykłady Usterek</span>
            <span className="lg:hidden">Przykłady</span>
          </button>

          {/* Multimeter Reference Guide */}
          <button
            id="btn-multimeter-guide"
            onClick={onOpenMultimeterGuide}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Ściąga napięć i pomiarów multimetru"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Multimetr</span>
          </button>

          {/* BGA Memory Chip Scanner */}
          <button
            id="btn-bga-scan"
            onClick={onOpenBgaDiagnostics}
            className="flex items-center space-x-1 bg-purple-950/60 hover:bg-purple-900 text-purple-200 text-xs px-2.5 py-1.5 rounded-lg border border-purple-500/40 transition font-medium shrink-0"
            title="Detektor uszkodzonej kości BGA VRAM / RAM"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Skaner BGA</span>
            <span className="md:hidden">BGA</span>
          </button>

          {/* Repair Journal */}
          <button
            id="btn-repair-journal"
            onClick={onOpenRepairJournal}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Dziennik napraw i historia raportów"
          >
            <Notebook className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Dziennik Napraw</span>
            <span className="lg:hidden">Dziennik</span>
          </button>

          {/* Error Code Database */}
          <button
            id="btn-error-db"
            onClick={onOpenErrorCodeDatabase}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Baza kodów błędów i specyfikacji układów PWM"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Baza Błędów</span>
            <span className="lg:hidden">Baza</span>
          </button>

          {/* Windows Repair */}
          <button
            id="btn-windows-repair"
            onClick={onOpenWindowsRepair}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Naprawa rozruchu Windows, SFC, DISM i BSOD"
          >
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline">Windows</span>
          </button>

          {/* Disk SMART */}
          <button
            id="btn-disk-smart"
            onClick={onOpenDiskDiagnostics}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Skaner dysków i bad sektorów SMART"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden xl:inline">Dyski</span>
          </button>

          {/* GPU Diagnostics */}
          <button
            id="btn-gpu-diag"
            onClick={onOpenGpuDiagnostics}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 transition font-medium shrink-0"
            title="Diagnoza GPU, VRAM i artefaktów"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">GPU</span>
          </button>

        </div>
      </div>

      {/* Mobile Global Search Row */}
      <div className="px-4 pb-2 sm:hidden">
        <GlobalSearchBar
          journalEntries={journalEntries}
          onOpenErrorCodeDatabase={onOpenErrorCodeDatabase}
          onOpenRepairJournal={onOpenRepairJournal}
          onOpenMultimeterGuide={onOpenMultimeterGuide}
          onOpenBgaDiagnostics={onOpenBgaDiagnostics}
          onOpenGpuDiagnostics={onOpenGpuDiagnostics}
          onOpenWindowsRepair={onOpenWindowsRepair}
          onSendToChat={onSendToChat}
        />
      </div>

      {/* Active Case Banner if selected */}
      {activePresetTitle && (
        <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="text-amber-400 font-medium">Aktywny przypadek:</span>
            <span className="font-semibold text-white truncate">{activePresetTitle}</span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:inline">Kliknij "Przeanalizuj obraz", aby uruchomić diagnostykę AI</span>
        </div>
      )}
    </header>
  );
};


