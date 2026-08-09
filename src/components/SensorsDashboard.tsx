import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Fan,
  Cpu,
  Flame,
  ShieldAlert,
  Zap,
  RefreshCw,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Volume2,
  VolumeX
} from 'lucide-react';
import { LiveTelemetryCharts } from './LiveTelemetryCharts';

export interface VoltageRailInfo {
  current: number;
  nominal: number;
  minAllowed: number;
  maxAllowed: number;
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
}

export interface HardwareSensorsData {
  querySource: string;
  cpu: {
    packageTempC: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    fanRpm: number;
    fanPercentage: number;
  };
  gpu: {
    coreTempC: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
    fanRpm: number;
    fanPercentage: number;
  };
  vrm: {
    mosfetTempC: number;
    phasesCount: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  };
  motherboard: {
    chipsetTempC: number;
    sysFanRpm: number;
    status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  };
  voltages?: {
    v33: VoltageRailInfo;
    v5: VoltageRailInfo;
    v12: VoltageRailInfo;
  };
  timestamp: string;
}

interface VoltageHistoryEntry {
  timestamp: string;
  v33: number;
  v5: number;
  v12: number;
}

interface SensorsDashboardProps {
  onSendToChat?: (prompt: string) => void;
}

export const SensorsDashboard: React.FC<SensorsDashboardProps> = ({ onSendToChat }) => {
  const [sensors, setSensors] = useState<HardwareSensorsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [voltageHistory, setVoltageHistory] = useState<VoltageHistoryEntry[]>([]);

  const fetchSensorsData = async () => {
    try {
      const res = await fetch('/api/sensors');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSensors(data);
          setLastUpdated(new Date().toLocaleTimeString());

          // Track historical voltage samples for sparklines
          if (data.voltages) {
            const newEntry: VoltageHistoryEntry = {
              timestamp: new Date().toLocaleTimeString(),
              v33: data.voltages.v33.current,
              v5: data.voltages.v5.current,
              v12: data.voltages.v12.current
            };
            setVoltageHistory((prev) => {
              const updated = [...prev, newEntry];
              return updated.length > 20 ? updated.slice(-20) : updated;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching sensors data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorsData();
    if (!isAutoRefresh) return;

    const interval = setInterval(() => {
      fetchSensorsData();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoRefresh]);

  const getTempColorClass = (temp: number) => {
    if (temp >= 85) return 'text-red-400 bg-red-500/10 border-red-500/40';
    if (temp >= 72) return 'text-amber-400 bg-amber-500/10 border-amber-500/40';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40';
  };

  const getTempProgressBg = (temp: number) => {
    if (temp >= 85) return 'bg-gradient-to-r from-amber-500 to-red-500';
    if (temp >= 72) return 'bg-gradient-to-r from-emerald-500 to-amber-500';
    return 'bg-gradient-to-r from-cyan-500 to-emerald-400';
  };

  const renderSparkline = (values: number[], nominal: number, strokeColor: string) => {
    if (!values || values.length === 0) {
      return (
        <div className="h-10 flex items-center justify-center text-[10px] text-slate-500 font-mono">
          Oczekiwanie na próbki...
        </div>
      );
    }

    const min = Math.min(...values, nominal * 0.95);
    const max = Math.max(...values, nominal * 1.05);
    const range = max - min || 1;

    const width = 160;
    const height = 36;
    const padding = 4;

    const points = values.map((val, idx) => {
      const x = padding + (idx / Math.max(1, values.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const lastVal = values[values.length - 1];
    const lastX = width - padding;
    const lastY = height - padding - ((lastVal - min) / range) * (height - padding * 2);

    const nominalY = height - padding - ((nominal - min) / range) * (height - padding * 2);

    return (
      <div className="relative w-full h-10">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 overflow-visible">
          <line
            x1="0"
            y1={nominalY}
            x2={width}
            y2={nominalY}
            stroke="#475569"
            strokeDasharray="2 2"
            strokeWidth="1"
            opacity="0.5"
          />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          <circle
            cx={lastX}
            cy={lastY}
            r="3"
            fill={strokeColor}
            className="animate-ping"
            opacity="0.75"
          />
          <circle
            cx={lastX}
            cy={lastY}
            r="2.5"
            fill={strokeColor}
          />
        </svg>
      </div>
    );
  };

  const handleAnalyzeSensorsWithAI = () => {
    if (!onSendToChat || !sensors) return;
    const prompt = `Przeanalizuj odczyty czujników temperatury, prędkości wentylatorów oraz stabilności napięć mojej płyty głównej:
- CPU Package Temp: ${sensors.cpu.packageTempC}°C | Wentylator CPU: ${sensors.cpu.fanRpm} RPM (${sensors.cpu.fanPercentage}%)
- GPU Core Temp: ${sensors.gpu.coreTempC}°C | Wentylator GPU: ${sensors.gpu.fanRpm} RPM (${sensors.gpu.fanPercentage}%)
- Sekcja VRM Mosfet: ${sensors.vrm.mosfetTempC}°C (${sensors.vrm.phasesCount} Fazy)
- Chipset Płyty Głównym: ${sensors.motherboard.chipsetTempC}°C | Wentylator Obudowy: ${sensors.motherboard.sysFanRpm} RPM
- Napięcia Zasilacza: +3.3V (${sensors.voltages?.v33.current}V), +5V (${sensors.voltages?.v5.current}V), +12V (${sensors.voltages?.v12.current}V)
- Źródło odczytu: ${sensors.querySource}

Podaj rekomendacje dotyczące stabilności zasilacza ATX, throttlingu termicznego, wymiany pasty termoprzewodzącej oraz dostosowania krzywej wentylatorów.`;
    onSendToChat(prompt);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl text-white shadow-lg shadow-cyan-950/50">
            <Thermometer className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-white text-base sm:text-lg">
                Pomiary Czujników Temperatury &amp; Wentylatorów (Live Sensors)
              </h2>
              {sensors?.querySource && (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] px-2 py-0.5 rounded-full font-bold font-mono">
                  {sensors.querySource}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Odczyt w czasie rzeczywistym z kontrolera płyty głównej (CPU, GPU, VRM, Chipset, Wentylatory)
            </p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
            className={`text-xs px-3 py-1.5 rounded-xl border font-bold flex items-center space-x-1.5 transition ${
              isAutoRefresh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAutoRefresh ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{isAutoRefresh ? 'Odświeżanie: 2s (AKTYWNE)' : 'Auto-odświeżanie PAUZA'}</span>
          </button>

          <button
            onClick={fetchSensorsData}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-xl border border-slate-800 transition"
            title="Odśwież pomiary teraz"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Sensors Grid */}
      {sensors ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* CPU Package Sensor Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>CPU Package</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTempColorClass(sensors.cpu.packageTempC)}`}>
                {sensors.cpu.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {sensors.cpu.packageTempC}°C
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Temperatura Rdzeni</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-cyan-300 font-mono flex items-center gap-1 justify-end">
                  <Fan className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {sensors.cpu.fanRpm} RPM
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{sensors.cpu.fanPercentage}% Wentylowania</span>
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getTempProgressBg(sensors.cpu.packageTempC)}`}
                  style={{ width: `${Math.min(100, Math.max(5, (sensors.cpu.packageTempC / 100) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* GPU Core Sensor Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>GPU Core</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTempColorClass(sensors.gpu.coreTempC)}`}>
                {sensors.gpu.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-white font-mono tracking-tight">
                  {sensors.gpu.coreTempC}°C
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Procesor Graficzny</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-orange-300 font-mono flex items-center gap-1 justify-end">
                  <Fan className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  {sensors.gpu.fanRpm} RPM
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">{sensors.gpu.fanPercentage}% Wentylowania</span>
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getTempProgressBg(sensors.gpu.coreTempC)}`}
                  style={{ width: `${Math.min(100, Math.max(5, (sensors.gpu.coreTempC / 100) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* VRM Mosfet Sensor Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Sekcja VRM</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTempColorClass(sensors.vrm.mosfetTempC)}`}>
                {sensors.vrm.status}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                  {sensors.vrm.mosfetTempC}°C
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Tranzystory Mosfet</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {sensors.vrm.phasesCount} Faz Zasilania
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">DrMOS Power Stage</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${getTempProgressBg(sensors.vrm.mosfetTempC)}`}
                  style={{ width: `${Math.min(100, Math.max(5, (sensors.vrm.mosfetTempC / 100) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Chipset & System Fan Card */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800/90 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>Chipset &amp; Obudowa</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/40">
                STABILNY
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
                  {sensors.motherboard.chipsetTempC}°C
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Mostek Południowy PCH</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-300 font-mono flex items-center gap-1 justify-end">
                  <Fan className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  {sensors.motherboard.sysFanRpm} RPM
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">Wentylator SYS_FAN1</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, (sensors.motherboard.chipsetTempC / 100) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* Voltage Stability Section with Mini Sparklines */}
        {sensors?.voltages && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
                  Stabilność Napięć Zasilacza ATX (3.3V, 5V, 12V Rails &amp; Transient Droop)
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Detekcja Chwilowych Spadków Napięcia (Ripple &amp; V-Droop)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* +3.3V Rail Card */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Linia +3.3V (Pamięć RAM / Logic)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${
                    sensors.voltages.v33.status === 'STABLE'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {sensors.voltages.v33.status === 'STABLE' ? 'STABILNE' : 'SPADEK (DROOP)'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
                    {sensors.voltages.v33.current.toFixed(2)} V
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Norma: 3.30V (3.14 - 3.47V)
                  </span>
                </div>

                {/* Sparkline */}
                {renderSparkline(
                  voltageHistory.map((h) => h.v33),
                  3.30,
                  '#10b981'
                )}

                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Min: {Math.min(...(voltageHistory.map(h => h.v33).length ? voltageHistory.map(h => h.v33) : [3.30])).toFixed(2)}V</span>
                  <span>Max: {Math.max(...(voltageHistory.map(h => h.v33).length ? voltageHistory.map(h => h.v33) : [3.30])).toFixed(2)}V</span>
                </div>
              </div>

              {/* +5V Rail Card */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>Linia +5V (SSD / USB / Peryferia)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${
                    sensors.voltages.v5.status === 'STABLE'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {sensors.voltages.v5.status === 'STABLE' ? 'STABILNE' : 'SPADEK (DROOP)'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
                    {sensors.voltages.v5.current.toFixed(2)} V
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Norma: 5.00V (4.75 - 5.25V)
                  </span>
                </div>

                {/* Sparkline */}
                {renderSparkline(
                  voltageHistory.map((h) => h.v5),
                  5.00,
                  '#06b6d4'
                )}

                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Min: {Math.min(...(voltageHistory.map(h => h.v5).length ? voltageHistory.map(h => h.v5) : [5.00])).toFixed(2)}V</span>
                  <span>Max: {Math.max(...(voltageHistory.map(h => h.v5).length ? voltageHistory.map(h => h.v5) : [5.00])).toFixed(2)}V</span>
                </div>
              </div>

              {/* +12V Rail Card */}
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span>Linia +12V (CPU &amp; GPU Power)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono ${
                    sensors.voltages.v12.status === 'STABLE'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/10 text-red-300 border-red-500/30'
                  }`}>
                    {sensors.voltages.v12.status === 'STABLE' ? 'STABILNE' : 'SPADEK POD OBCIĄŻENIEM'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black text-amber-300 font-mono tracking-tight">
                    {sensors.voltages.v12.current.toFixed(2)} V
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Norma: 12.00V (11.40 - 12.60V)
                  </span>
                </div>

                {/* Sparkline */}
                {renderSparkline(
                  voltageHistory.map((h) => h.v12),
                  12.00,
                  '#f59e0b'
                )}

                <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Min: {Math.min(...(voltageHistory.map(h => h.v12).length ? voltageHistory.map(h => h.v12) : [12.00])).toFixed(2)}V</span>
                  <span>Max: {Math.max(...(voltageHistory.map(h => h.v12).length ? voltageHistory.map(h => h.v12) : [12.00])).toFixed(2)}V</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Real-time Recharts Telemetry Section */}
        <div className="pt-2">
          <LiveTelemetryCharts />
        </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 text-xs">
          Trwa odczytywanie czujników płyty głównej...
        </div>
      )}

      {/* Footer / AI Diagnostics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/80 pt-3 text-xs text-slate-400">
        <span className="font-mono text-[11px]">
          Ostatni pomiar: <strong className="text-slate-200">{lastUpdated || 'Przed chwilą'}</strong>
        </span>

        {onSendToChat && (
          <button
            onClick={handleAnalyzeSensorsWithAI}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-950/50"
          >
            <Zap className="w-4 h-4 text-cyan-200" />
            <span>Przeanalizuj Pomiary Termiczne z AI</span>
          </button>
        )}
      </div>

    </div>
  );
};
