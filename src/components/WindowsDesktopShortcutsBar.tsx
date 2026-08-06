import React, { useState, useEffect } from 'react';
import {
  Radio,
  FileCode,
  Monitor,
  Disc,
  Usb,
  Terminal,
  Globe,
  ShieldAlert,
  Music,
  Sliders,
  Cpu,
  HardDrive,
  Tv,
  Mic,
  Layers,
  Shield,
  BatteryCharging,
  Zap,
  Activity
} from 'lucide-react';

interface WindowsDesktopShortcutsBarProps {
  onOpenGlobalRadioMp3: () => void;
  onOpenExeModal: () => void;
  onOpenStrelecRescue: () => void;
  onOpenWindowsIsoBuilder: () => void;
  onOpenUsbBurner: () => void;
  onOpenMatsMods: () => void;
  onOpenLiveWebLauncher: () => void;
  onOpenAntivirusUnblock: () => void;
  onOpenVideoTutorials: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenBoardSchematic: () => void;
  onOpenPcBuilder: () => void;
  onOpenVpnClientSuite?: () => void;
  onOpenBatteryAndMatrix?: () => void;
  onOpenAutoBiosAndRam?: () => void;
  onOpenIsoStrelecDrive?: () => void;
  onOpen3DSimulatorsSuite?: () => void;
  onOpenGoogleDriveBrowser?: () => void;
}

export const WindowsDesktopShortcutsBar: React.FC<WindowsDesktopShortcutsBarProps> = ({
  onOpenGlobalRadioMp3,
  onOpenExeModal,
  onOpenStrelecRescue,
  onOpenWindowsIsoBuilder,
  onOpenUsbBurner,
  onOpenMatsMods,
  onOpenLiveWebLauncher,
  onOpenAntivirusUnblock,
  onOpenVideoTutorials,
  onOpenVoiceAssistant,
  onOpenBoardSchematic,
  onOpenPcBuilder,
  onOpenVpnClientSuite,
  onOpenBatteryAndMatrix,
  onOpenAutoBiosAndRam,
  onOpenIsoStrelecDrive,
  onOpen3DSimulatorsSuite,
  onOpenGoogleDriveBrowser,
}) => {
  const [telemetry, setTelemetry] = useState({ cpuUtil: 26, gpuUtil: 18, cpuTemp: 44, gpuTemp: 40 });

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/sensors');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTelemetry({
              cpuUtil: data.cpu?.utilizationPercent || 25,
              gpuUtil: data.gpu?.utilizationPercent || 18,
              cpuTemp: data.cpu?.packageTempC || 44,
              gpuTemp: data.gpu?.coreTempC || 40,
            });
          }
        }
      } catch (e) {
        // Fallback ignore
      }
    };
    poll();
    const timer = setInterval(poll, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
            <span>Pulpit Serwisowy Windows &amp; Skróty Narzędzi (Serwis Rafał Jarosz)</span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-mono border border-indigo-400/40">Głos • Schematy • Radio • WinPE</span>
          </h3>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-slate-400">CPU:</span>
            <span className="font-bold text-cyan-300 text-[11px]">{telemetry.cpuUtil}%</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-amber-500/30 px-2 py-0.5 rounded-lg">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] text-slate-400">GPU:</span>
            <span className="font-bold text-emerald-300 text-[11px]">{telemetry.gpuUtil}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-11 gap-3">
        
        {/* 0. Voice Assistant */}
        <button
          onClick={onOpenVoiceAssistant}
          className="bg-slate-950/80 hover:bg-slate-850 border border-indigo-500/60 hover:border-indigo-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105 animate-pulse"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-indigo-500 transition">
            <Mic className="w-5 h-5 animate-bounce" />
          </div>
          <span className="text-xs font-extrabold text-indigo-300 group-hover:text-white">Steruj Mową</span>
          <span className="text-[10px] text-slate-400">Asystent Głosowy</span>
        </button>

        {/* 0.1. Schematy Płyt & RAM */}
        <button
          onClick={onOpenBoardSchematic}
          className="bg-slate-950/80 hover:bg-slate-850 border border-teal-500/50 hover:border-teal-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-1.5 group-hover:bg-teal-500 group-hover:text-slate-950 transition">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-teal-300">Schematy Płyt</span>
          <span className="text-[10px] text-slate-400">Laptop / GPU / RAM</span>
        </button>

        {/* 0.2. Centrum Symulatorów 3D */}
        <button
          onClick={onOpen3DSimulatorsSuite}
          className="bg-slate-950/80 hover:bg-slate-850 border border-cyan-500/60 hover:border-cyan-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-600/30 text-cyan-300 flex items-center justify-center mb-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-cyan-300 group-hover:text-white">Symulatory 3D</span>
          <span className="text-[10px] text-slate-400">BGA • PC • Oscyloskop</span>
        </button>
        
        {/* 1. Radio & MP3 Player */}
        <button
          onClick={onOpenGlobalRadioMp3}
          className="bg-slate-950/80 hover:bg-slate-850 border border-amber-500/40 hover:border-amber-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-amber-300">Radio &amp; MP3</span>
          <span className="text-[10px] text-slate-400">Dysk / Drive</span>
        </button>

        {/* 2. Akademia Wideo */}
        <button
          onClick={onOpenVideoTutorials}
          className="bg-slate-950/80 hover:bg-slate-850 border border-red-500/40 hover:border-red-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-1.5 group-hover:bg-red-500 group-hover:text-white transition">
            <Tv className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-red-300">Akademia Wideo</span>
          <span className="text-[10px] text-slate-400">Tutoriale HD</span>
        </button>

        {/* 3. Exe Builder */}
        <button
          onClick={onOpenExeModal}
          className="bg-slate-950/80 hover:bg-slate-850 border border-purple-500/40 hover:border-purple-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1.5 group-hover:bg-purple-500 group-hover:text-white transition">
            <FileCode className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-purple-300">Kreator EXE</span>
          <span className="text-[10px] text-slate-400">Skompiluj .exe</span>
        </button>

        {/* 4. Strelec WinPE */}
        <button
          onClick={onOpenStrelecRescue}
          className="bg-slate-950/80 hover:bg-slate-850 border border-violet-500/40 hover:border-violet-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-1.5 group-hover:bg-violet-500 group-hover:text-white transition">
            <Monitor className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-violet-300">WinPE Strelec</span>
          <span className="text-[10px] text-slate-400">Ratunek USB</span>
        </button>

        {/* 5. Windows ISO + Sterowniki */}
        <button
          onClick={onOpenWindowsIsoBuilder}
          className="bg-slate-950/80 hover:bg-slate-850 border border-blue-500/40 hover:border-blue-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 group-hover:bg-blue-500 group-hover:text-white transition">
            <Disc className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-blue-300">Windows ISO</span>
          <span className="text-[10px] text-slate-400">Sterowniki NVMe</span>
        </button>

        {/* 6. Rufus USB Burner */}
        <button
          onClick={onOpenUsbBurner}
          className="bg-slate-950/80 hover:bg-slate-850 border border-indigo-500/40 hover:border-indigo-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1.5 group-hover:bg-indigo-500 group-hover:text-white transition">
            <Usb className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-indigo-300">Rufus USB</span>
          <span className="text-[10px] text-slate-400">Wypal pendrive</span>
        </button>

        {/* 7. MATS/MODS VRAM */}
        <button
          onClick={onOpenMatsMods}
          className="bg-slate-950/80 hover:bg-slate-850 border border-emerald-500/40 hover:border-emerald-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-emerald-300">MATS/MODS</span>
          <span className="text-[10px] text-slate-400">Test VRAM GPU</span>
        </button>

        {/* 8. Live Web Launcher */}
        <button
          onClick={onOpenLiveWebLauncher}
          className="bg-slate-950/80 hover:bg-slate-850 border border-cyan-500/40 hover:border-cyan-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1.5 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-cyan-300">Live WWW</span>
          <span className="text-[10px] text-slate-400">Serwer / Strona</span>
        </button>

        {/* 9. Antivirus Unblock */}
        <button
          onClick={onOpenAntivirusUnblock}
          className="bg-slate-950/80 hover:bg-slate-850 border border-rose-500/40 hover:border-rose-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1.5 group-hover:bg-rose-500 group-hover:text-white transition">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold text-white group-hover:text-rose-300">Antivirus Fix</span>
          <span className="text-[10px] text-slate-400">Odblokuj EXE</span>
        </button>

        {/* 10. PC Builder & 2D Visual Canvas */}
        <button
          onClick={onOpenPcBuilder}
          className="bg-slate-950/80 hover:bg-slate-850 border border-blue-500/50 hover:border-blue-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-blue-500 transition shadow-lg">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-extrabold text-blue-300 group-hover:text-white">Konfigurator PC</span>
          <span className="text-[10px] text-slate-400">Składaj &amp; 2D Wizualny</span>
        </button>

        {/* 11. 3 Aplikacje VPN Suite */}
        {onOpenVpnClientSuite && (
          <button
            onClick={onOpenVpnClientSuite}
            className="bg-slate-950/80 hover:bg-slate-850 border border-emerald-500/50 hover:border-emerald-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-emerald-500 transition shadow-lg">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold text-emerald-300 group-hover:text-white">3 Aplikacje VPN</span>
            <span className="text-[10px] text-slate-400">WireGuard/Cisco/SOCKS</span>
          </button>
        )}

        {/* 14. Google Drive TermoFixData Browser */}
        {onOpenGoogleDriveBrowser && (
          <button
            onClick={onOpenGoogleDriveBrowser}
            className="bg-slate-950/80 hover:bg-slate-850 border border-blue-400/60 hover:border-blue-300 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-blue-500 transition shadow-lg">
              <Globe className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <span className="text-xs font-extrabold text-blue-300 group-hover:text-white">Google Drive</span>
            <span className="text-[10px] text-slate-400">TermoFixData ISO</span>
          </button>
        )}
        {onOpenBatteryAndMatrix && (
          <button
            onClick={onOpenBatteryAndMatrix}
            className="bg-slate-950/80 hover:bg-slate-850 border border-amber-500/50 hover:border-amber-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-amber-500 transition shadow-lg">
              <BatteryCharging className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold text-amber-300 group-hover:text-white">Test Baterii i Matryc</span>
            <span className="text-[10px] text-slate-400">Wear Level / Martwe Piksele</span>
          </button>
        )}

        {/* 13. Auto BIOS & RAM Patcher */}
        {onOpenAutoBiosAndRam && (
          <button
            onClick={onOpenAutoBiosAndRam}
            className="bg-slate-950/80 hover:bg-slate-850 border border-purple-500/50 hover:border-purple-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-purple-500 transition shadow-lg">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-extrabold text-purple-300 group-hover:text-white">Auto BIOS &amp; RAM</span>
            <span className="text-[10px] text-slate-400">Patcher &amp; MemTest</span>
          </button>
        )}

        {/* 14. ISO & Strelec Google Drive Scanner */}
        {onOpenIsoStrelecDrive && (
          <button
            onClick={onOpenIsoStrelecDrive}
            className="bg-slate-950/80 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-400 p-3 rounded-xl flex flex-col items-center justify-center text-center transition group shadow-md hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-1.5 group-hover:bg-cyan-500 transition shadow-lg">
              <Disc className="w-5 h-5 animate-spin" />
            </div>
            <span className="text-xs font-extrabold text-cyan-300 group-hover:text-white">Strelec &amp; ISO Drive</span>
            <span className="text-[10px] text-slate-400">Boot USB &amp; Instalka EXE</span>
          </button>
        )}

      </div>
    </div>
  );
};
