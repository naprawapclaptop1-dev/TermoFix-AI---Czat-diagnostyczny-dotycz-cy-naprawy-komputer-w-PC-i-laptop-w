import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from 'recharts';
import { useHardwareTelemetry } from '../hooks/useHardwareTelemetry';
import { hardwareDiscoveryService } from '../services/hardwareDiscoveryService';
import { Cpu, Zap, HardDrive, Activity, Usb, Database, Layers, AlertTriangle, ShieldAlert, Sparkles, Download, Sliders, Camera, History, CheckCircle2, Calculator, Search, HelpCircle, Fan, Radio } from 'lucide-react';

export const LiveHardwareDashboard: React.FC = () => {
  const [disks, setDisks] = useState<any[]>([]);
  const data = useHardwareTelemetry(200, 40); // 200ms updates, 40 points history
  const [forceDip, setForceDip] = useState(false);
  const [vcoreThreshold, setVcoreThreshold] = useState<number>(1.05);
  const [showSettings, setShowSettings] = useState(false);
  const [showTrendHistory, setShowTrendHistory] = useState(false);
  const [autoSnapshots, setAutoSnapshots] = useState<Array<{ id: string; time: string; vcore: number; temp: number }>>([]);
  const lastSnapTimeRef = useRef<number>(0);

  // SMD Calculator State
  const [smdCode, setSmdCode] = useState<string>('104');
  const [showSmdCalc, setShowSmdCalc] = useState<boolean>(false);

  // PWM Signal Analyzer State
  const [showPwmAnalyzer, setShowPwmAnalyzer] = useState<boolean>(false);
  const [pwmChannel, setPwmChannel] = useState<'FAN' | 'VRM_PHASE'>('FAN');
  const [pwmManualDuty, setPwmManualDuty] = useState<number>(0); // 0 = Auto

  // Advanced VCORE Probe Features (Threshold Alert Logs, Batch Export, Compare Sessions)
  const [thresholdAlertLogs, setThresholdAlertLogs] = useState<Array<{ id: string; timestamp: string; vcore: number; threshold: number }>>([
    { id: 'al-1', timestamp: '06:11:32', vcore: 1.02, threshold: 1.05 },
    { id: 'al-2', timestamp: '06:17:04', vcore: 1.01, threshold: 1.05 }
  ]);
  const [showThresholdModal, setShowThresholdModal] = useState<boolean>(false);
  const [showBatchExportModal, setShowBatchExportModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [savedSessions, setSavedSessions] = useState<Array<{ id: string; name: string; date: string; data: any[] }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('termofix_vcore_sessions') || '[]');
    } catch {
      return [
        { id: 'sess-1', name: 'Sesjon #1 - Test FurMark 15m', date: '2026-08-06 05:40', data: [] },
        { id: 'sess-2', name: 'Sesjon #2 - Spadek pod obciążeniem', date: '2026-08-06 06:02', data: [] }
      ];
    }
  });
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [compareFileA, setCompareFileA] = useState<any[] | null>(null);
  const [compareFileB, setCompareFileB] = useState<any[] | null>(null);
  const [alertSoundEnabled, setAlertSoundEnabled] = useState<boolean>(true);

  // Decode SMD Code helper
  const smdResult = useMemo(() => {
    const code = smdCode.trim().toUpperCase();
    if (!code) return null;

    if (code === '0' || code === '000' || code === '0000') {
      return {
        type: 'Zworka / Rezystor 0-Ohm (Zero Ohm Link)',
        value: '0.00 Ω (Zero Ohm Link / Bezpiecznik)',
        tolerance: '±0%',
        package: 'SMD 0402 / 0603',
        maxCurrent: '1.5A - 2.0A max',
        replacements: ['SMD 0402 0R0', 'SMD 0603 0R0', 'Mostek Miedziany 0.1mm'],
        note: 'Używany jako bezpiecznik zerowy na liniach zasilania VIN/3V/5V.'
      };
    }

    if (code.includes('R')) {
      const valStr = code.replace('R', '.');
      const num = parseFloat(valStr);
      if (!isNaN(num)) {
        return {
          type: 'Rezystor Pomiarowy Niskooporowy (Shunt)',
          value: `${num} Ω`,
          tolerance: '±1% (Precyzyjny)',
          package: 'SMD 0805 / 1206 / 2512',
          maxCurrent: num < 0.5 ? 'Czujnik Prądu Charger / ISL' : '0.25W',
          replacements: [`Rezystor Shunt ${num}Ω 1%`, `Vishay WSL0805 R${Math.round(num * 100)}`],
          note: 'Mierzy spadek napięcia dla układu ładowarki baterii ISL/BQ.'
        };
      }
    }

    if (/^\d{3}$/.test(code)) {
      const base = parseInt(code.substring(0, 2), 10);
      const exp = parseInt(code.substring(2, 3), 10);
      const numVal = base * Math.pow(10, exp);

      let resStr = '';
      if (numVal < 1000) resStr = `${numVal} Ω`;
      else if (numVal < 1000000) resStr = `${(numVal / 1000).toFixed(numVal % 1000 === 0 ? 0 : 1)} kΩ`;
      else resStr = `${(numVal / 1000000).toFixed(numVal % 1000000 === 0 ? 0 : 2)} MΩ`;

      let capStr = '';
      if (numVal < 1000) capStr = `${numVal} pF`;
      else if (numVal < 1000000) capStr = `${(numVal / 1000).toFixed(numVal % 1000 === 0 ? 0 : 1)} nF`;
      else capStr = `${(numVal / 1000000).toFixed(numVal % 1000000 === 0 ? 0 : 2)} µF`;

      return {
        type: `Kod 3-cyfrowy SMD (${code})`,
        valueResistor: resStr,
        valueCapacitor: capStr,
        tolerance: 'Rezystor ±5% / Kondensator MLCC ±10% X7R',
        package: 'SMD 0402 / 0603 / 0805',
        replacements: [
          `Rezystor: ${resStr} 0402/0603 5%`,
          `Kondensator MLCC: ${capStr} 16V/25V X7R`,
          `Yageo / Samsung CL05B${code}KB5NNNC`
        ],
        note: 'Najczęstsza wartość w przetwornicach zasilacza płyt głównych laptopów.'
      };
    }

    if (/^\d{4}$/.test(code)) {
      const base = parseInt(code.substring(0, 3), 10);
      const exp = parseInt(code.substring(3, 4), 10);
      const numVal = base * Math.pow(10, exp);
      let resStr = '';
      if (numVal < 1000) resStr = `${numVal} Ω`;
      else if (numVal < 1000000) resStr = `${(numVal / 1000).toFixed(1)} kΩ`;
      else resStr = `${(numVal / 1000000).toFixed(2)} MΩ`;

      return {
        type: 'Rezystor Precyzyjny 4-cyfrowy (1%)',
        value: resStr,
        tolerance: '±1% (Tolerancja Wysoka)',
        package: 'SMD 0402 / 0603',
        replacements: [`Rezystor ${resStr} 1% 0402`, `Yageo RC0402FR-07${code}L`],
        note: 'Wykorzystywany w pętli feedback (FB) kontrolerów PWM zasilania.'
      };
    }

    return {
      type: 'Niestandardowy Kod SMD',
      value: `${code}`,
      tolerance: 'N/A',
      package: 'SMD Universal',
      replacements: ['Skonsultuj się ze schematem ideowym (Boardview)'],
      note: 'Wpisz np. 103 (10k), 104 (100nF), R10 (0.1Ω) lub 0 dla zworki.'
    };
  }, [smdCode]);

  useEffect(() => {
    fetch('/api/disks').then(res => res.json()).then(data => setDisks(data)).catch(() => {});
  }, []);

  // Compute VCORE voltage history with simulated dips
  const vcoreData = useMemo(() => {
    return data.map((pt, idx) => {
      let vcore = 1.22 - (pt.cpu * 0.0018) + (Math.sin(idx * 0.5) * 0.02);
      // Trigger drop under certain conditions or forced dip
      if (forceDip && idx >= data.length - 8) {
        vcore = 1.01 + (Math.random() * 0.03); // Drops to 1.01V - 1.04V
      } else if (idx % 17 === 0) {
        vcore = 1.03; // Occasional drop below 1.05V
      }
      return {
        ...pt,
        vcore: Number(vcore.toFixed(3)),
      };
    });
  }, [data, forceDip]);

  const currentPoint = vcoreData.length > 0 ? vcoreData[vcoreData.length - 1] : { vcore: 1.20, cpu: 0, gpu: 0, ram: 0, vram: 0, cpuTemp: 45, gpuTemp: 40, gpuClockMhz: 1400 };
  const currentVcore = currentPoint.vcore;
  const isVcoreAlert = currentVcore < vcoreThreshold;

  // Auto-Snapshot & Threshold Alert Log effect on voltage drop detection
  useEffect(() => {
    if (isVcoreAlert) {
      const now = Date.now();
      if (now - lastSnapTimeRef.current > 4000) { // Cooldown of 4 seconds between auto-snapshots
        lastSnapTimeRef.current = now;
        const newSnap = {
          id: `snap-${now}`,
          time: new Date().toLocaleTimeString(),
          vcore: currentVcore,
          temp: currentPoint.cpuTemp || 65,
        };
        setAutoSnapshots((prev) => [newSnap, ...prev].slice(0, 5));

        // Also record Threshold Alert Log
        setThresholdAlertLogs((prev) => [
          { id: `al-${now}`, timestamp: new Date().toLocaleTimeString(), vcore: currentVcore, threshold: vcoreThreshold },
          ...prev
        ].slice(0, 20));
      }
    }
  }, [isVcoreAlert, currentVcore, currentPoint.cpuTemp, vcoreThreshold]);

  // Last 10 points trend history
  const last10Points = useMemo(() => {
    return vcoreData.slice(-10);
  }, [vcoreData]);

  // Compute Min, Max, Avg for last 10 points
  const stats10 = useMemo(() => {
    if (last10Points.length === 0) return { min: 0, max: 0, avg: 0 };
    const vals = last10Points.map(p => p.vcore);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { min, max, avg };
  }, [last10Points]);

  // Voltage Instability Index (Standard Deviation / Jitter over recent samples)
  const voltageInstabilityIndex = useMemo(() => {
    if (vcoreData.length < 5) return 0;
    const recent = vcoreData.slice(-20).map(p => p.vcore);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);
    return Number((stdDev * 1000).toFixed(1)); // mV jitter
  }, [vcoreData]);

  // Export telemetry data to CSV
  const exportToCSV = () => {
    if (vcoreData.length === 0) return;
    const headers = ['Czas', 'VCORE (V)', 'CPU (%)', 'Temp CPU (°C)', 'GPU (%)', 'RAM (%)'];
    const rows = vcoreData.map(pt => [
      pt.time || 'N/A',
      pt.vcore,
      pt.cpu,
      pt.cpuTemp || 45,
      pt.gpu,
      pt.ram
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vcore_telemetry_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 p-3 shrink-0 flex flex-col lg:flex-row gap-3 min-h-[220px] backdrop-blur-md font-sans">
      
      {/* 1. Main Hardware Telemetry Area Chart */}
      <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-3 flex flex-col min-w-0">
        <div className="flex items-center justify-between mb-1.5 text-emerald-400 text-xs font-bold font-mono">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Telemetria Sprzętowa Live</span>
          </div>
          <span className="text-[10px] text-slate-500 font-normal">Odświeżanie 200ms</span>
        </div>
        <div className="flex-1 w-full min-h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={vcoreData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" fontSize={9} tickMargin={5} />
              <YAxis stroke="#475569" fontSize={9} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.15} />
              <Area type="monotone" dataKey="gpu" name="GPU (%)" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Area type="monotone" dataKey="ram" name="RAM (%)" stroke="#c084fc" fill="#c084fc" fillOpacity={0.15} />
              <Area type="monotone" dataKey="vram" name="VRAM (%)" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. SMART SONDA VCORE COMPONENT (Napięcie Linii VCORE, Auto-Snapshot, CSV & Trend) */}
      <div className={`w-full lg:w-80 rounded-2xl border p-3 flex flex-col justify-between transition-all duration-300 ${
        isVcoreAlert
          ? 'bg-red-950/80 border-red-500 shadow-lg shadow-red-950/80 ring-2 ring-red-500/50'
          : 'bg-slate-950 border-cyan-500/30'
      }`}>
        <div>
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
              <Zap className={`w-4 h-4 ${isVcoreAlert ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
              SMART SONDA VCORE
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 rounded-lg text-xs font-mono transition ${
                  showSettings ? 'bg-cyan-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-cyan-300'
                }`}
                title="Edytuj próg alertu napięcia"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={exportToCSV}
                className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg transition"
                title="Eksportuj telemetrię VCORE do pliku CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setForceDip(!forceDip)}
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border transition ${
                  forceDip ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-cyan-300'
                }`}
              >
                {forceDip ? 'TEST ON' : 'Test Spadku'}
              </button>
            </div>
          </div>

          {/* Threshold Settings Bar */}
          {showSettings && (
            <div className="mt-2 p-2 bg-slate-900 border border-slate-800 rounded-xl space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300">
                <span>Próg alertu VCORE:</span>
                <span className="font-bold text-amber-400">{vcoreThreshold.toFixed(2)} V</span>
              </div>
              <input
                type="range"
                min="0.85"
                max="1.30"
                step="0.01"
                value={vcoreThreshold}
                onChange={(e) => setVcoreThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 leading-tight">
                Ustaw wrażliwość dla danej architektury CPU (Intel/AMD).
              </p>
            </div>
          )}

          <div className="flex items-center justify-between my-2 font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Napięcie Procesora:</span>
              <span className={`text-2xl font-black ${
                isVcoreAlert ? 'text-red-400 animate-pulse' : currentVcore < vcoreThreshold + 0.03 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {currentVcore.toFixed(3)} V
              </span>
            </div>

            {isVcoreAlert ? (
              <div className="bg-red-500/20 border border-red-500/80 text-red-200 px-2 py-1 rounded-xl text-[10px] font-bold animate-bounce flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>ALERT &lt;{vcoreThreshold.toFixed(2)}V</span>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-xl text-[10px] font-bold">
                STABILNE VCORE
              </div>
            )}
          </div>

          {/* VCORE Real-time Sparkline Graph */}
          <div className="h-12 w-full bg-slate-900/80 rounded-xl p-1 border border-slate-800 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vcoreData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                <YAxis domain={[0.85, 1.35]} hide />
                <ReferenceLine y={vcoreThreshold} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `${vcoreThreshold}V`, fill: '#ef4444', fontSize: 8 }} />
                <Line type="monotone" dataKey="vcore" stroke={isVcoreAlert ? '#ef4444' : '#10b981'} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Voltage Instability Index & Alert Sound Toggle */}
          <div className="mt-1.5 bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
            <div>
              <span className="text-slate-400 block">Jitter / Wskaźnik Niestabilności:</span>
              <span className={`font-bold ${voltageInstabilityIndex > 15 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {voltageInstabilityIndex} mV (StdDev)
              </span>
            </div>
            <button
              onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
              className={`px-2 py-1 rounded-lg border font-bold transition flex items-center gap-1 ${
                alertSoundEnabled ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50' : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Przełącznik dźwięku alertu przy spadku VCORE"
            >
              <Radio className="w-3 h-3" />
              <span>Dźwięk: {alertSoundEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Auto-Snapshot Indicator Badge */}
          {autoSnapshots.length > 0 && (
            <div className="mt-1.5 p-1.5 bg-slate-900/90 border border-amber-500/30 rounded-lg flex items-center justify-between text-[10px] font-mono">
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-400 animate-pulse" /> Auto-Snapshot IR/Mikroskop ({autoSnapshots.length})
              </span>
              <span className="text-slate-400">Ostatni: {autoSnapshots[0].vcore}V ({autoSnapshots[0].time})</span>
            </div>
          )}

          {/* 10-Point Trend History & Stats Bar */}
          <div className="mt-2 pt-1.5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1 text-cyan-400 font-bold">
                <History className="w-3 h-3" /> Trend 10 Ostatnich Pomiarów
              </span>
              <button
                onClick={() => setShowTrendHistory(!showTrendHistory)}
                className="text-slate-400 hover:text-white underline text-[9px]"
              >
                {showTrendHistory ? 'Ukryj' : 'Pokaż Listę'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center font-mono text-[9px]">
              <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                <span className="text-slate-500 block">MIN</span>
                <span className={`font-bold ${stats10.min < vcoreThreshold ? 'text-red-400' : 'text-emerald-400'}`}>
                  {stats10.min.toFixed(3)} V
                </span>
              </div>
              <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                <span className="text-slate-500 block">ŚREDNIA</span>
                <span className="font-bold text-slate-200">{stats10.avg.toFixed(3)} V</span>
              </div>
              <div className="bg-slate-900/80 p-1 rounded border border-slate-800">
                <span className="text-slate-500 block">MAX</span>
                <span className="font-bold text-cyan-400">{stats10.max.toFixed(3)} V</span>
              </div>
            </div>

            {/* Scrollable 10-Point Pills List */}
            {showTrendHistory && (
              <div className="mt-1.5 flex gap-1 overflow-x-auto pb-1 max-w-full">
                {last10Points.map((pt, idx) => (
                  <div
                    key={idx}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 border ${
                      pt.vcore < vcoreThreshold
                        ? 'bg-red-950 text-red-300 border-red-500 animate-pulse'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    #{idx + 1}: {pt.vcore}V
                  </div>
                ))}
              </div>
            )}

            {/* Advanced Action Buttons (Threshold Logs, Batch Export, Compare Sessions) */}
            <div className="grid grid-cols-3 gap-1 mt-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => setShowThresholdModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 py-1 px-1 rounded-lg text-[9px] font-bold transition flex items-center justify-center gap-1"
                title="Zobacz dziennik zdarzeń spadków poniżej progu"
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Alert Logs ({thresholdAlertLogs.length})</span>
              </button>

              <button
                onClick={() => setShowBatchExportModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 py-1 px-1 rounded-lg text-[9px] font-bold transition flex items-center justify-center gap-1"
                title="Eksport wsadowy wielu sesji z synchronizacją czasową"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>Batch CSV</span>
              </button>

              <button
                onClick={() => setShowCompareModal(true)}
                className="bg-slate-900 hover:bg-slate-850 text-purple-300 border border-purple-500/30 py-1 px-1 rounded-lg text-[9px] font-bold transition flex items-center justify-center gap-1"
                title="Porównaj dwie sesje pomiarowe na jednym wykresie"
              >
                <Activity className="w-3 h-3 text-purple-400" />
                <span>Porównaj</span>
              </button>
            </div>
          </div>
        </div>

        {isVcoreAlert && (
          <p className="text-[10px] font-mono text-red-300 bg-red-950/90 p-1.5 rounded-lg border border-red-500/50 mt-1 animate-pulse text-center">
            ⚠️ OSTRZEŻENIE: Spadek VCORE do {currentVcore}V (&lt;{vcoreThreshold.toFixed(2)}V)! Auto-Snapshot zarejestrowany.
          </p>
        )}
      </div>

      {/* 3. Compact Metrics Column */}
      <div className="w-full lg:w-60 flex flex-col justify-between gap-1.5 shrink-0 font-mono">
        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Cpu className="w-3.5 h-3.5 text-sky-400" /> CPU</div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sky-400 text-xs">{currentPoint.cpu.toFixed(0)}%</span>
            <span className="text-[9px] text-orange-400 bg-orange-950/80 px-1 py-0.2 rounded border border-orange-500/30">
              {currentPoint.cpuTemp}°C
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Zap className="w-3.5 h-3.5 text-emerald-400" /> GPU</div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-emerald-400 text-xs">{currentPoint.gpu.toFixed(0)}%</span>
            <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-500/30">
              {currentPoint.gpuTemp}°C
            </span>
          </div>
        </div>

        <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Activity className="w-3.5 h-3.5 text-rose-400" /> GPU CLK</div>
          <div className="font-bold text-rose-400 text-xs">{currentPoint.gpuClockMhz.toFixed(0)} MHz</div>
        </div>

        <div className="flex gap-1.5">
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between flex-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs"><HardDrive className="w-3.5 h-3.5 text-purple-400" /> RAM</div>
            <div className="font-bold text-purple-400 text-xs">{currentPoint.ram.toFixed(0)}%</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between flex-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Layers className="w-3.5 h-3.5 text-amber-500" /> VRAM</div>
            <div className="font-bold text-amber-500 text-xs">{currentPoint.vram.toFixed(0)}%</div>
          </div>
        </div>

        {/* Mini-Narzędzie: SMD Calculator & PWM Analyzer */}
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setShowSmdCalc(!showSmdCalc);
              if (showPwmAnalyzer) setShowPwmAnalyzer(false);
            }}
            className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 p-2 rounded-xl flex items-center justify-between transition text-xs font-bold font-mono flex-1"
          >
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-amber-400" /> SMD
            </span>
            <span className="text-[10px] bg-amber-500/20 border border-amber-500/30 px-1 py-0.5 rounded truncate max-w-[60px]">
              {smdCode}
            </span>
          </button>

          <button
            onClick={() => {
              setShowPwmAnalyzer(!showPwmAnalyzer);
              if (showSmdCalc) setShowSmdCalc(false);
            }}
            className="bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-300 p-2 rounded-xl flex items-center justify-between transition text-xs font-bold font-mono flex-1"
          >
            <span className="flex items-center gap-1.5">
              <Fan className="w-3.5 h-3.5 text-sky-400" /> PWM Analyzer
            </span>
            <span className="text-[10px] bg-sky-500/20 border border-sky-500/30 px-1 py-0.5 rounded">
              25 kHz
            </span>
          </button>
        </div>
      </div>

      {/* 4. SMD Calculator Mini Panel Drawer/Card */}
      {showSmdCalc && (
        <div className="w-full lg:w-72 bg-slate-950 border border-amber-500/40 rounded-2xl p-3 flex flex-col justify-between shrink-0 font-mono shadow-2xl animate-in zoom-in-95 duration-200">
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" /> Kalkulator Kodów SMD
              </span>
              <button
                onClick={() => setShowSmdCalc(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Input & Quick Presets */}
            <div className="mt-2 space-y-1.5">
              <div className="relative">
                <input
                  type="text"
                  value={smdCode}
                  onChange={(e) => setSmdCode(e.target.value.toUpperCase())}
                  placeholder="Wpisz kod (np. 104, 473, R10, 0)..."
                  className="w-full bg-slate-900 border border-amber-500/50 text-white placeholder-slate-500 px-3 py-1.5 rounded-xl text-xs font-bold tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <Search className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1">
                {['104', '103', '473', 'R10', '4R7', '0'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSmdCode(preset)}
                    className={`px-1.5 py-0.5 rounded text-[9px] border transition ${
                      smdCode === preset
                        ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Results Card */}
            {smdResult && (
              <div className="mt-2.5 p-2.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="text-slate-400 text-[10px]">Typ Komponentu:</span>
                  <span className="text-amber-300 font-bold text-[10px]">{smdResult.type}</span>
                </div>

                {smdResult.valueResistor ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jako Rezystor:</span>
                      <strong className="text-emerald-400">{smdResult.valueResistor}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jako Kondensator:</span>
                      <strong className="text-cyan-400">{smdResult.valueCapacitor}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wartość Parametru:</span>
                    <strong className="text-emerald-400">{smdResult.value}</strong>
                  </div>
                )}

                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Tolerancja / Obudowa:</span>
                  <span className="text-slate-300">{smdResult.tolerance} | {smdResult.package}</span>
                </div>

                <div className="pt-1 border-t border-slate-800 text-[10px]">
                  <span className="text-slate-400 block mb-0.5">Standardowe Zamienniki:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {smdResult.replacements.map((rep, idx) => (
                      <li key={idx} className="truncate">{rep}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <p className="text-[9px] text-slate-500 mt-2 text-center">
            Przelicznik wspiera kody 3/4-cyfrowe, system R (R10/4R7) oraz zworki 0-Ohm.
          </p>
        </div>
      )}

      {/* 5. PWM Signal Analyzer Drawer Card */}
      {showPwmAnalyzer && (
        <div className="w-full lg:w-80 bg-slate-950 border border-sky-500/40 rounded-2xl p-3 flex flex-col justify-between shrink-0 font-mono shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Fan className="w-4 h-4 text-sky-400" /> PWM Signal Analyzer (Oscyloskop)
              </span>
              <button
                onClick={() => setShowPwmAnalyzer(false)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Channel selector */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setPwmChannel('FAN')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  pwmChannel === 'FAN'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Wentylator 4-PIN (25 kHz)
              </button>
              <button
                onClick={() => setPwmChannel('VRM_PHASE')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition ${
                  pwmChannel === 'VRM_PHASE'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                VRM Phase Gate (300 kHz)
              </button>
            </div>

            {/* Simulated PWM Square Wave Vector Visualizer */}
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                <span>Wypełnienie Duty Cycle:</span>
                <strong className="text-sky-300 font-bold">
                  {pwmManualDuty > 0 ? `${pwmManualDuty}% (Manual)` : `${Math.round(currentPoint.cpuTemp > 65 ? (currentPoint.cpuTemp - 30) * 1.5 : 35)}% (Auto Telemetry)`}
                </strong>
              </div>

              {/* Square Wave SVG */}
              <div className="w-full h-16 bg-slate-950 rounded-lg border border-slate-800 p-1 relative flex items-center">
                <svg className="w-full h-12" viewBox="0 0 100 40" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="25" y1="0" x2="25" y2="40" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="50" y1="0" x2="50" y2="40" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="75" y1="0" x2="75" y2="40" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2" />

                  {/* Generated Square Wave */}
                  {(() => {
                    const duty = pwmManualDuty > 0 ? pwmManualDuty : Math.min(95, Math.max(15, Math.round((currentPoint.cpuTemp - 30) * 1.5)));
                    const highWidth = (duty / 100) * 25; // 25 unit period
                    let pathD = 'M 0 32 ';
                    for (let i = 0; i < 4; i++) {
                      const startX = i * 25;
                      pathD += `L ${startX} 8 L ${startX + highWidth} 8 L ${startX + highWidth} 32 L ${startX + 25} 32 `;
                    }
                    return (
                      <path
                        d={pathD}
                        stroke={pwmChannel === 'FAN' ? '#38bdf8' : '#f59e0b'}
                        strokeWidth="2"
                        fill="none"
                        className="animate-pulse"
                      />
                    );
                  })()}
                </svg>
              </div>

              {/* Manual Duty Override Slider */}
              <div className="mt-2 flex items-center gap-2 text-[10px]">
                <span className="text-slate-400">Sterowanie RPM:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={pwmManualDuty}
                  onChange={(e) => setPwmManualDuty(parseInt(e.target.value))}
                  className="w-full accent-sky-400 bg-slate-900 h-1.5 rounded cursor-pointer"
                />
                <button
                  onClick={() => setPwmManualDuty(0)}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                >
                  Auto
                </button>
              </div>
            </div>

            {/* Calculated Fan Speed & Voltage metrics */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">RPM Wentylatora:</span>
                <strong className="text-sky-300 font-bold text-xs">
                  {Math.round(((pwmManualDuty > 0 ? pwmManualDuty : Math.min(95, Math.max(15, (currentPoint.cpuTemp - 30) * 1.5))) / 100) * 4500)} RPM
                </strong>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block">Napięcie Skuteczne:</span>
                <strong className="text-emerald-400 font-bold text-xs">
                  {(((pwmManualDuty > 0 ? pwmManualDuty : Math.min(95, Math.max(15, (currentPoint.cpuTemp - 30) * 1.5))) / 100) * 12.0).toFixed(2)} V
                </strong>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-500 mt-2 text-center">
            Analizator próbuje sygnał PWM w strefie 4-pinowego gniazda wentylatora lub bramki MOSFET VRM.
          </p>
        </div>
      )}

      {/* MODAL 1: Threshold Alert Logs Table */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-cyan-500/50 rounded-2xl w-full max-w-xl p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Threshold Alert Log — Dziennik Spadków VCORE (&lt;{vcoreThreshold.toFixed(2)}V)</span>
              </h3>
              <button onClick={() => setShowThresholdModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {thresholdAlertLogs.length === 0 ? (
                <p className="text-slate-500 text-center py-6">Brak zarejestrowanych zdarzeń spadków napięcia.</p>
              ) : (
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Czas Zdarzenia</th>
                      <th className="pb-2">VCORE Zmierzony</th>
                      <th className="pb-2">Próg Graniczny</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 text-slate-200">
                    {thresholdAlertLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/50">
                        <td className="py-2 text-slate-400">{log.id}</td>
                        <td className="py-2 text-amber-300">{log.timestamp}</td>
                        <td className="py-2 font-bold text-red-400">{log.vcore} V</td>
                        <td className="py-2 text-slate-400">{log.threshold} V</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl transition"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Batch Export Multiple Sessions CSV */}
      {showBatchExportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Batch Export — Eksport Wsadowy Sesji CSV</span>
              </h3>
              <button onClick={() => setShowBatchExportModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <p className="text-slate-300">
              Zaznacz zapisane sesje telemetrii VCORE, które chcesz połączyć i pobrać w jednym wsadowym pliku CSV z synchronizacją czasową:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedSessions.map((sess) => (
                <label
                  key={sess.id}
                  className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-2.5 rounded-xl cursor-pointer transition"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedBatchIds.includes(sess.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedBatchIds(prev => [...prev, sess.id]);
                        else setSelectedBatchIds(prev => prev.filter(id => id !== sess.id));
                      }}
                      className="accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-white block">{sess.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{sess.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    Aktywna Sesja
                  </span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 text-[11px] font-mono">Zaznaczono: {selectedBatchIds.length} sesji</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowBatchExportModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-xl transition"
                >
                  Anuluj
                </button>
                <button
                  disabled={selectedBatchIds.length === 0}
                  onClick={() => {
                    const sessionsToExport = savedSessions.filter(s => selectedBatchIds.includes(s.id));
                    let csvRows = ['SessionID,Timestamp,VCORE_V,CPU_Pct,Temp_C'];
                    sessionsToExport.forEach(sess => {
                      (sess.data && sess.data.length > 0 ? sess.data : vcoreData).forEach(pt => {
                        csvRows.push(`${sess.name},${pt.time || '00:00'},${pt.vcore},${pt.cpu},${pt.cpuTemp || 45}`);
                      });
                    });
                    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', `vcore_batch_export_${Date.now()}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setShowBatchExportModal(false);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold px-4 py-2 rounded-xl transition shadow-lg"
                >
                  Pobierz Wsadowy CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Compare Sessions Side-by-Side Analysis */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/50 rounded-2xl w-full max-w-2xl p-5 space-y-4 shadow-2xl font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Compare Sessions — Analiza Porównawcza VCORE na Wykresie</span>
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <p className="text-slate-300">
              Wybierz dwie sesje pomiarowe lub załaduj pliki CSV w celu nałożenia ich wykresów napięcia na siebie dla analizy behawioralnej:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="font-bold text-cyan-300 block">Sesja A (Bazowa):</span>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  onChange={(e) => {
                    const found = savedSessions.find(s => s.id === e.target.value);
                    setCompareFileA(found ? (found.data.length ? found.data : vcoreData) : vcoreData);
                  }}
                >
                  <option value="">Wybierz sesję A...</option>
                  {savedSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                <span className="font-bold text-purple-300 block">Sesja B (Porównawcza):</span>
                <select
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  onChange={(e) => {
                    const found = savedSessions.find(s => s.id === e.target.value);
                    setCompareFileB(found ? (found.data.length ? found.data : vcoreData) : vcoreData);
                  }}
                >
                  <option value="">Wybierz sesję B...</option>
                  {savedSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Side by side comparison chart preview */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl h-48">
              <div className="text-[10px] text-slate-400 font-mono mb-1 flex justify-between">
                <span>Nakładka Wykresów Napięcowych (Sesja A vs Sesja B)</span>
                <div className="flex gap-3">
                  <span className="text-cyan-400">■ Sesja A</span>
                  <span className="text-purple-400">■ Sesja B</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={compareFileA || vcoreData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                  <YAxis domain={[0.85, 1.35]} stroke="#475569" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="vcore" name="Sesja A VCORE" stroke="#22d3ee" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="vcore" name="Sesja B VCORE" stroke="#c084fc" strokeWidth={2} strokeDasharray="4 4" dot={false} data={compareFileB || vcoreData} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCompareModal(false)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl transition"
              >
                Zamknij Porównanie
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
