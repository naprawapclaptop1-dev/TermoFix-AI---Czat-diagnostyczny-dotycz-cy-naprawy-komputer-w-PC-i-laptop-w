import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Flame,
  Activity,
  Zap,
  RefreshCw,
  Gauge,
  Sliders,
  ShieldAlert,
  Info,
  CheckCircle2,
  HardDrive,
  Layers,
  Terminal,
  X
} from 'lucide-react';
import { hardwareDiscoveryService } from '../services/hardwareDiscoveryService';

interface LauncherApp {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface TelemetryData {
  cpuUtil: number;
  cpuTemp: number;
  gpuUtil: number;
  gpuTemp: number;
  ramUtil: number;
  vrmTemp: number;
  fanRpm: number;
  chassis: string;
  isLive: boolean;
  lastUpdated: string;
}

export const DesktopLauncher: React.FC<{ apps: LauncherApp[] }> = ({ apps }) => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cpuUtil: 24,
    cpuTemp: 44,
    gpuUtil: 18,
    gpuTemp: 40,
    ramUtil: 48,
    vrmTemp: 49,
    fanRpm: 1450,
    chassis: 'DESKTOP PC',
    isLive: true,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  const [isPollingPaused, setIsPollingPaused] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [specsSnapshot, setSpecsSnapshot] = useState<any>(null);

  const fetchTelemetry = async () => {
    try {
      const fastMetrics = await hardwareDiscoveryService.getFastMetrics();
      const sensorsRes = await fetch('/api/sensors'); // Fetch temps directly from sensors API
      let cpuT = 45;
      let gpuT = 40;
      let vrmT = 50;
      let fanSpeed = 1500;

      if (sensorsRes.ok) {
        const sData = await sensorsRes.json();
        if (sData.success) {
          cpuT = sData.cpu?.packageTempC || 45;
          gpuT = sData.gpu?.coreTempC || 40;
          vrmT = sData.vrm?.mosfetTempC || 50;
          fanSpeed = sData.cpu?.fanRpm || 1500;
        }
      }

      // Also get hardware discovery chassis if available
      const specs = await hardwareDiscoveryService.discoverSystemHardware();
      setSpecsSnapshot(specs);

      setTelemetry({
        cpuUtil: Math.max(5, Math.min(100, fastMetrics.cpuU)),
        cpuTemp: cpuT,
        gpuUtil: Math.max(2, Math.min(100, fastMetrics.gpuU)),
        gpuTemp: gpuT,
        ramUtil: specs?.ram?.usedPercent || fastMetrics.ramU || 48,
        vrmTemp: vrmT,
        fanRpm: fanSpeed,
        chassis: specs?.formFactor === 'LAPTOP' ? 'LAPTOP' : 'DESKTOP PC',
        isLive: true,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });
    } catch (e) {
      console.warn('[DesktopLauncher] Telemetry poll fallback:', e);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (isPollingPaused) return;

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 1000);

    return () => clearInterval(interval);
  }, [isPollingPaused]);

  // Color helper based on load %
  const getBadgeColor = (val: number) => {
    if (val >= 80) return 'bg-rose-950/90 text-rose-300 border-rose-500/80 animate-pulse';
    if (val >= 55) return 'bg-amber-950/90 text-amber-300 border-amber-500/80';
    return 'bg-slate-900/95 text-emerald-300 border-emerald-500/60';
  };

  const getDotColor = (val: number) => {
    if (val >= 80) return 'bg-rose-500';
    if (val >= 55) return 'bg-amber-500';
    return 'bg-emerald-400';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative select-none">
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[3px]"></div>

      {/* Main Desktop Grid Container */}
      <div className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6 auto-rows-max">
          {apps.map((app) => {
            // Determine specialized telemetry badge for the icon
            const isGpuApp = ['gpu-diag', 'mats-mods', 'mats-mods-vram', 'ir6500', 'simulators-3d', 'bga-diag', 'multimeter'].includes(app.id);
            const isCpuApp = ['stress-test', 'windows-repair', 'sys-scan', 'exe-builder', 'bios', 'kbc', 'autobios'].includes(app.id);

            const displayUtil = isGpuApp ? telemetry.gpuUtil : telemetry.cpuUtil;
            const badgeClass = getBadgeColor(displayUtil);
            const dotClass = getDotColor(displayUtil);

            return (
              <button
                key={app.id}
                onClick={app.onClick}
                className="flex flex-col items-center justify-start gap-2 group hover:scale-105 transition-transform relative"
                title={`${app.name} • Live Hardware Utilization: CPU ${telemetry.cpuUtil}% | GPU ${telemetry.gpuUtil}%`}
              >
                {/* Icon Container with Persistent Telemetry Badge Overlay */}
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${app.color} shadow-lg shadow-black/50 border border-white/10 group-hover:border-white/30 transition-colors`}>
                    {app.icon}
                  </div>

                  {/* Persistent Telemetry Badge Overlay on Icon */}
                  <div
                    className={`absolute -top-2 -right-3 border shadow-lg rounded-md px-1 py-0.5 text-[9px] font-mono font-black tracking-tighter flex items-center gap-1 z-30 ${badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                    {isGpuApp ? (
                      <span>GPU {telemetry.gpuUtil}%</span>
                    ) : isCpuApp ? (
                      <span>CPU {telemetry.cpuUtil}%</span>
                    ) : (
                      <span>C:{telemetry.cpuUtil}%</span>
                    )}
                  </div>
                </div>

                {/* App Name */}
                <span className="text-white text-xs font-medium text-center drop-shadow-md line-clamp-2 px-1">
                  {app.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Discovery Details Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-2xl w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-lg text-white">Live Hardware Discovery & Telemetry</h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">OBCIĄŻENIE CPU</span>
                <p className="text-xl font-black text-cyan-400 mt-1">{telemetry.cpuUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">Temp: {telemetry.cpuTemp}°C</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">OBCIĄŻENIE GPU</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{telemetry.gpuUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">Temp: {telemetry.gpuTemp}°C</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">ZANIMALIZACJA RAM</span>
                <p className="text-xl font-black text-purple-400 mt-1">{telemetry.ramUtil}%</p>
                <p className="text-[10px] text-slate-500 mt-1">{specsSnapshot?.ram?.totalCapacityGB || '16'} GB RAM DDR4/DDR5</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">WENTYLATOR CPU</span>
                <p className="text-xl font-black text-amber-400 mt-1">{telemetry.fanRpm} RPM</p>
                <p className="text-[10px] text-slate-500 mt-1">VRM: {telemetry.vrmTemp}°C</p>
              </div>
            </div>

            {specsSnapshot && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-indigo-300 font-bold border-b border-slate-800 pb-1">
                  <span>WMI Hardware Discovery Snapshot</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {specsSnapshot.formFactor}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono">
                  <div>Procesor: <span className="text-white font-semibold">{specsSnapshot.cpu?.model}</span></div>
                  <div>Rdzenie: <span className="text-white font-semibold">{specsSnapshot.cpu?.cores} C / {specsSnapshot.cpu?.threads} T</span></div>
                  <div>Karta Graficzna: <span className="text-white font-semibold">{specsSnapshot.gpu?.vendorAndModel}</span></div>
                  <div>Płyta Główna: <span className="text-white font-semibold">{specsSnapshot.motherboard?.model}</span></div>
                  <div>Typ Obudowy: <span className="text-white font-semibold">{specsSnapshot.chassisDescription}</span></div>
                  <div>Metoda Detekcji: <span className="text-white font-semibold">{specsSnapshot.detectionMethod} ({specsSnapshot.confidencePercent}%)</span></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono">Ostatnie skanowanie: {telemetry.lastUpdated}</span>
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
