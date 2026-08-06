import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Flame,
  Cpu,
  Monitor,
  Zap,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Play,
  Square,
  RefreshCw,
  FileText,
  FileSpreadsheet,
  Download,
  Sliders,
  Thermometer,
  Wind,
  Gauge,
  CheckCircle2,
  Search,
  Clock,
  Info,
  X,
  HelpCircle,
  Laptop,
  Filter
} from 'lucide-react';
import { FURMARK_SIMULATORS, FurmarkSimulatorPreset } from '../data/furmarkSimulators';

interface StressTestWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const STRESS_TEST_PRESETS = FURMARK_SIMULATORS;

export const StressTestWorkstationModal: React.FC<StressTestWorkstationModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  // 2000 FurMark Simulators Search & Filter States
  const [selectedPresetId, setSelectedPresetId] = useState<string>('furmark-sim-1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredPresets = useMemo(() => {
    return FURMARK_SIMULATORS.filter((preset) => {
      const matchesSearch =
        preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.gpuName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.loadType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.targetComponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        preset.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || preset.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testDurationSec, setTestDurationSec] = useState<number>(0);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState<number>(5);
  const [loadPercentage, setLoadPercentage] = useState<number>(100);
  const [cpuThreads, setCpuThreads] = useState<number>(16);
  const [resolutionMode, setResolutionMode] = useState<'1080p' | '2K' | '4K' | '8K'>('4K');
  const [fanSpeedMode, setFanSpeedMode] = useState<'AUTO' | 'QUIET' | 'PERFORMANCE' | 'TURBO_100'>('PERFORMANCE');

  // Live Telemetry Simulation States
  const [cpuTemp, setCpuTemp] = useState<number>(38);
  const [gpuCoreTemp, setGpuCoreTemp] = useState<number>(42);
  const [gpuHotspotTemp, setGpuHotspotTemp] = useState<number>(48);
  const [vramTemp, setVramTemp] = useState<number>(45);
  const [vrmTemp, setVrmTemp] = useState<number>(44);
  const [ramTemp, setRamTemp] = useState<number>(36);
  const [ssdTemp, setSsdTemp] = useState<number>(38);
  const [liquidWaterTemp, setLiquidWaterTemp] = useState<number>(32);
  const [powerWatts, setPowerWatts] = useState<number>(45);
  const [fanRpm, setFanRpm] = useState<number>(1200);
  const [fps, setFps] = useState<number>(185);
  const [isThrottling, setIsThrottling] = useState<boolean>(false);
  const [activeStepTab, setActiveStepTab] = useState<'WORKSTATION' | 'GUIDE_STEPS' | 'DIAGNOSIS_TIPS' | 'REPORT_EXPORT'>('WORKSTATION');

  // History log for chart
  const [telemetryHistory, setTelemetryHistory] = useState<{
    time: number;
    cpu: number;
    gpuCore: number;
    gpuHotspot: number;
    vram: number;
    power: number;
  }[]>([]);

  const selectedPreset = STRESS_TEST_PRESETS.find((p) => p.id === selectedPresetId) || STRESS_TEST_PRESETS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Canvas Ref for Rendering 3D Thermal Stress Sphere / Particle Mesh
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    // Reset or Initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const render = () => {
      angle += isRunning ? 0.04 : 0.01;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Animated Heat Donut / Stress Object
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 65 + (isRunning ? Math.sin(angle * 3) * 6 : 0);

      const heatRatio = Math.min(1, Math.max(0, (gpuHotspotTemp - 40) / 60));
      const r = Math.round(255 * heatRatio);
      const g = Math.round(180 * (1 - heatRatio));
      const b = Math.round(255 * (1 - heatRatio));

      // Glow effect
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${isRunning ? 0.9 : 0.4})`);
      gradient.addColorStop(0.5, `rgba(${r}, ${Math.max(0, g - 50)}, 0, ${isRunning ? 0.6 : 0.2})`);
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Furry / Spiky FurMark Ring
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.lineWidth = isRunning ? 2.5 : 1.5;

      const numSpikes = 90;
      ctx.beginPath();
      for (let i = 0; i < numSpikes; i++) {
        const spikeAngle = (i / numSpikes) * Math.PI * 2 + angle;
        const spikeLength = isRunning ? 15 + Math.sin(angle * 5 + i) * 12 : 5;
        const x1 = centerX + Math.cos(spikeAngle) * radius;
        const y1 = centerY + Math.sin(spikeAngle) * radius;
        const x2 = centerX + Math.cos(spikeAngle) * (radius + spikeLength);
        const y2 = centerY + Math.sin(spikeAngle) * (radius + spikeLength);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      // HUD Overlay
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`TEST: ${selectedPreset.name.slice(0, 32)}`, 12, 20);
      ctx.fillText(`TRYB: ${selectedPreset.type} | RES: ${resolutionMode} | THREADS: ${cpuThreads}`, 12, 36);

      ctx.fillStyle = isThrottling ? '#ef4444' : isRunning ? '#f97316' : '#38bdf8';
      ctx.fillText(
        `STATUS: ${isRunning ? (isThrottling ? '🔥 THERMAL THROTTLING DETECTED' : '⚡ EXTREME STRESS RUNNING') : '⏸️ IDLE (OCZEKIWANIE)'}`,
        12,
        52
      );

      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`POBÓR MOCY: ${powerWatts}W | WENTYLATORY: ${fanRpm} RPM (${fanSpeedMode})`, 12, 68);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    isOpen,
    isRunning,
    gpuHotspotTemp,
    selectedPreset,
    resolutionMode,
    cpuThreads,
    isThrottling,
    powerWatts,
    fanRpm,
    fanSpeedMode
  ]);

  // Handle Live Telemetry Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTestDurationSec((prevSec) => {
        const nextSec = prevSec + 1;

        // Calculate load multiplier based on slider
        const mult = loadPercentage / 100;

        // Target temps based on preset
        const targetCpu = selectedPreset.baseCoreTemp + (selectedPreset.peakCoreTemp - selectedPreset.baseCoreTemp) * mult;
        const targetGpuCore = selectedPreset.baseCoreTemp + (selectedPreset.peakCoreTemp - selectedPreset.baseCoreTemp) * mult * 0.9;
        const targetHotspot = selectedPreset.baseHotspot + (selectedPreset.peakHotspot - selectedPreset.baseHotspot) * mult;
        const targetVram = selectedPreset.baseVram + (selectedPreset.peakVram - selectedPreset.baseVram) * mult;
        const targetPower = selectedPreset.basePower + (selectedPreset.peakPower - selectedPreset.basePower) * mult;

        // Fan speed multiplier
        let fanRpmTarget = 1500;
        if (fanSpeedMode === 'QUIET') fanRpmTarget = 1100;
        if (fanSpeedMode === 'PERFORMANCE') fanRpmTarget = 2400;
        if (fanSpeedMode === 'TURBO_100') fanRpmTarget = 3400;

        // Smooth gradual ramp up
        setCpuTemp((curr) => Math.min(105, curr + (targetCpu - curr) * 0.15 + (Math.random() * 1.2 - 0.6)));
        setGpuCoreTemp((curr) => Math.min(100, curr + (targetGpuCore - curr) * 0.15 + (Math.random() * 1.0 - 0.5)));
        setGpuHotspotTemp((curr) => Math.min(115, curr + (targetHotspot - curr) * 0.15 + (Math.random() * 1.5 - 0.7)));
        setVramTemp((curr) => Math.min(110, curr + (targetVram - curr) * 0.12 + (Math.random() * 1.0 - 0.5)));
        setVrmTemp((curr) => Math.min(115, curr + (targetVram * 1.05 - curr) * 0.1));
        setRamTemp((curr) => Math.min(85, curr + (48 - curr) * 0.05));
        setSsdTemp((curr) => Math.min(80, curr + (54 - curr) * 0.05));
        setLiquidWaterTemp((curr) => Math.min(60, curr + (42 - curr) * 0.03));
        setPowerWatts((curr) => Math.max(10, Math.round(curr + (targetPower - curr) * 0.2)));
        setFanRpm((curr) => Math.round(curr + (fanRpmTarget - curr) * 0.2));

        // FPS calculation if GPU test
        if (selectedPreset.peakFps > 0) {
          setFps(Math.round(selectedPreset.peakFps + (Math.random() * 8 - 4)));
        } else {
          setFps(0);
        }

        // Throttling check
        if (targetCpu > 92 || targetHotspot > 95 || targetVram > 98) {
          setIsThrottling(true);
        } else {
          setIsThrottling(false);
        }

        // Record history
        setTelemetryHistory((prev) => [
          ...prev.slice(-30),
          {
            time: nextSec,
            cpu: Math.round(cpuTemp),
            gpuCore: Math.round(gpuCoreTemp),
            gpuHotspot: Math.round(gpuHotspotTemp),
            vram: Math.round(vramTemp),
            power: Math.round(powerWatts)
          }
        ]);

        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, loadPercentage, selectedPreset, fanSpeedMode, cpuTemp, gpuCoreTemp, gpuHotspotTemp, vramTemp, powerWatts]);

  if (!isOpen) return null;

  const handleStartTest = () => {
    setIsRunning(true);
    setTestDurationSec(0);
  };

  const handleStopTest = () => {
    setIsRunning(false);
  };

  const handleResetTest = () => {
    setIsRunning(false);
    setTestDurationSec(0);
    setCpuTemp(38);
    setGpuCoreTemp(42);
    setGpuHotspotTemp(48);
    setVramTemp(45);
    setVrmTemp(44);
    setPowerWatts(45);
    setFanRpm(1200);
    setIsThrottling(false);
    setTelemetryHistory([]);
  };

  const handleExportWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Protokol_Stress_Test_TermoFix_AI</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 25px; color: #0f172a; }
          h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 6px; }
          h2 { color: #2563eb; margin-top: 18px; font-size: 16px; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; }
          .alert { color: #dc2626; font-weight: bold; }
          .ok { color: #16a34a; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>🔥 TERMOFIX AI - PROTOKÓŁ TESTU OBCIĄŻENIOWEGO (STRESS TEST)</h1>
        <p><strong>Data Badania:</strong> ${new Date().toLocaleString('pl-PL')} | <strong>Czas Czas Trwania Testu:</strong> ${testDurationSec} sek.</p>
        <p><strong>Wybrany Test Obciążeniowy:</strong> ${selectedPreset.name}</p>
        <p><strong>Obciążenie TDP:</strong> ${loadPercentage}% | <strong>Rozdzielczość / Alokacja:</strong> ${resolutionMode}</p>

        <h2>1. POMIARY TELEMETRII I CZUJNIKI TERMICZNE</h2>
        <table>
          <tr><th>Czujnik Podzespołu</th><th>Maksymalna Temperatura (Peak)</th><th>Ocena Normy / Status</th></tr>
          <tr><td>CPU Core Temp</td><td>${cpuTemp.toFixed(1)} °C</td><td>${cpuTemp > 90 ? '<span class="alert">PRZEKROCZENIE NORMY (THROTTLING)</span>' : '<span class="ok">OPTYMALNA</span>'}</td></tr>
          <tr><td>GPU Core Temp</td><td>${gpuCoreTemp.toFixed(1)} °C</td><td>${gpuCoreTemp > 84 ? '<span class="alert">WYSOKA</span>' : '<span class="ok">NORMA</span>'}</td></tr>
          <tr><td>GPU HotSpot Temp</td><td>${gpuHotspotTemp.toFixed(1)} °C</td><td>${gpuHotspotTemp > 95 ? '<span class="alert">CRITICAL HOTSPOT! (RÓŻNICA > 20°C)</span>' : '<span class="ok">NORMA</span>'}</td></tr>
          <tr><td>VRAM Memory Temp</td><td>${vramTemp.toFixed(1)} °C</td><td>${vramTemp > 95 ? '<span class="alert">GORĄCA VRAM</span>' : '<span class="ok">NORMA</span>'}</td></tr>
          <tr><td>VRM MOSFETs Power Stage</td><td>${vrmTemp.toFixed(1)} °C</td><td>${vrmTemp > 100 ? '<span class="alert">WYSOKA VRM</span>' : '<span class="ok">NORMA</span>'}</td></tr>
          <tr><td>Pobór Mocy TGP/TDP</td><td>${powerWatts} W</td><td>STABILNY</td></tr>
          <tr><td>Obroty Wentylatorów</td><td>${fanRpm} RPM</td><td>Tryb: ${fanSpeedMode}</td></tr>
        </table>

        <h2>2. WNIOSKI SERWISOWE I ZALECENIA</h2>
        <p>${
          isThrottling
            ? '🔥 Wykryto Thermal Throttling! Zalecana natychmiastowa wymiana pasty termoprzewodzącej (np. Honeywell PTM7950) lub termopadów VRAM (np. 12.8 W/mK) oraz wyczyszczenie układow chłodzenia.'
            : '✅ Układ chłodzenia działa prawidłowo. Komputer przechodzi test stabilności bez objawów przegrzewania.'
        }</p>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Protokol_StressTest_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    let csv = `\ufeff"Parametr Testu";"Wartość";"Jednostka"\n`;
    csv += `"Test Obciążeniowy";"${selectedPreset.name.replace(/"/g, '""')}";""\n`;
    csv += `"Czas Trwania";"${testDurationSec}";"sekundy"\n`;
    csv += `"CPU Temp";"${cpuTemp.toFixed(1)}";"°C"\n`;
    csv += `"GPU Core Temp";"${gpuCoreTemp.toFixed(1)}";"°C"\n`;
    csv += `"GPU HotSpot Temp";"${gpuHotspotTemp.toFixed(1)}";"°C"\n`;
    csv += `"GPU VRAM Temp";"${vramTemp.toFixed(1)}";"°C"\n`;
    csv += `"Pobór Mocy";"${powerWatts}";"W"\n`;
    csv += `"Obroty Wentylatorów";"${fanRpm}";"RPM"\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Log_Telemetrii_StressTest_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToAiAssistant = () => {
    if (!onSendToChat) return;
    const prompt = `Proszę o przeprowadzenie analizy wyników testu obciążeniowego (Stress Test):
- Wybrany test: ${selectedPreset.name}
- Czas trwania: ${testDurationSec} sek. przy obciążeniu ${loadPercentage}%
- Temperatura CPU Core: ${cpuTemp.toFixed(1)}°C
- Temperatura GPU Core: ${gpuCoreTemp.toFixed(1)}°C
- Temperatura GPU HotSpot: ${gpuHotspotTemp.toFixed(1)}°C (Różnica GPU Core - HotSpot: ${(gpuHotspotTemp - gpuCoreTemp).toFixed(1)}°C)
- Temperatura Pamięci VRAM: ${vramTemp.toFixed(1)}°C
- Temperatura Sekcji VRM: ${vrmTemp.toFixed(1)}°C
- Pobór Mocy: ${powerWatts} W przy ${fanRpm} RPM wentylatorów
- Status Throttlingu: ${isThrottling ? 'WYKRYTO THERMAL THROTTLING!' : 'BRAK THROTTLINGU (NORMA)'}

Czy temperatura HotSpot lub VRAM wskazuje na konieczność wymiany pasty Honeywell PTM7950 lub termopadów? Jakie kroki naprawcze zalecasz?`;

    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 via-orange-600 to-amber-500 rounded-xl text-white shadow-lg shadow-orange-950/50">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Stanowisko Testów Obciążeniowych CPU/GPU &amp; Monitoringu Termicznego
                </h2>
                <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  Procedura Bench-Test
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Symulacja i przewodnik krok po kroku przez testy obciążeniowe Prime95, FurMark, OCCT i AIDA64
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="px-4 bg-slate-950 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs py-2">
          <button
            onClick={() => setActiveStepTab('WORKSTATION')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeStepTab === 'WORKSTATION'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Stanowisko Testowe (Live Bench)</span>
          </button>

          <button
            onClick={() => setActiveStepTab('GUIDE_STEPS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeStepTab === 'GUIDE_STEPS'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Procedura Krok po Kroku</span>
          </button>

          <button
            onClick={() => setActiveStepTab('DIAGNOSIS_TIPS')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeStepTab === 'DIAGNOSIS_TIPS'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Wskazówki Diagnostyczne HotSpot</span>
          </button>

          <button
            onClick={() => setActiveStepTab('REPORT_EXPORT')}
            className={`px-3.5 py-2 rounded-lg font-bold flex items-center space-x-2 transition shrink-0 ${
              activeStepTab === 'REPORT_EXPORT'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Eksport Protokołu &amp; AI</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-900/60">
          
          {/* TAB 1: WORKSTATION LIVE BENCH */}
          {activeStepTab === 'WORKSTATION' && (
            <div className="space-y-5">
              
              {/* Preset Selector Bar (2000 Symulatorów FurMark & Benchmarks) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      KATALOG 2000 SYMULATORÓW OBCIĄŻENIOWYCH FURMARK &amp; BENCHMARKS
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-extrabold">
                      2000 Dostępnych Symulatorów
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold">
                      Wyników: {filteredPresets.length}
                    </span>
                  </div>
                </div>

                {/* Search & Category Filter Pills */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-6 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Szukaj po nazwie, GPU (np. RTX 5090), silniku (Vulkan, DX12), ID (#0250)..."
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-slate-100 rounded-xl pl-9 pr-3 py-2 outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-6 flex items-center space-x-2 overflow-x-auto pb-1 text-[11px]">
                    {['ALL', 'FurMark GPU', 'MSI Kombustor', 'Prime95 CPU', 'OCCT Power', 'VRAM & BGA', 'VRM & Power'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition ${
                          selectedCategory === cat
                            ? 'bg-orange-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {cat === 'ALL' ? 'Wszystkie (2000)' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
                  <div className="flex-1 space-y-1">
                    <select
                      value={selectedPresetId}
                      onChange={(e) => {
                        setSelectedPresetId(e.target.value);
                        handleResetTest();
                      }}
                      className="w-full bg-slate-900 border border-orange-500/40 text-orange-300 font-bold text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 font-mono shadow-inner"
                    >
                      {filteredPresets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.category} | {p.resolution} | {p.api}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                    {!isRunning ? (
                      <button
                        onClick={handleStartTest}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-orange-950/40 flex items-center space-x-2 transition"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>URUCHOM TEST</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStopTest}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/50 flex items-center space-x-2 transition animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-white" />
                        <span>ZATRZYMAJ TEST</span>
                      </button>
                    )}

                    <button
                      onClick={handleResetTest}
                      className="p-2.5 text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
                      title="Resetuj Wyniki"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Selected Preset Info Bar */}
                <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>
                      <strong className="text-orange-300">GPU/Hardware:</strong> {selectedPreset.gpuName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong className="text-amber-300">Cel:</strong> {selectedPreset.targetComponent}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>
                      <strong className="text-cyan-300">Silnik &amp; Res:</strong> {selectedPreset.api} ({selectedPreset.resolution})
                    </span>
                  </div>
                </div>
              </div>

              {/* Workstation Simulation Area */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                
                {/* Visual Canvas Box */}
                <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col items-center justify-between relative min-h-[300px]">
                  <canvas ref={canvasRef} width={480} height={260} className="w-full rounded-lg border border-slate-800/80" />

                  {/* Throttling Alert Overlay */}
                  {isThrottling && (
                    <div className="mt-2 w-full bg-red-950/90 border border-red-500/50 text-red-200 text-xs p-2.5 rounded-lg flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="font-bold">WYKRYTO THERMAL THROTTLING! Temp &gt; 92°C</span>
                      </div>
                      <span className="text-[10px] bg-red-900 px-2 py-0.5 rounded font-mono font-bold">PROCHOT</span>
                    </div>
                  )}

                  {/* Timer & FPS Footer */}
                  <div className="w-full mt-2 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Czas: <strong className="text-white">{testDurationSec}s</strong>
                      </span>
                    </div>
                    {fps > 0 && (
                      <div className="flex items-center space-x-2">
                        <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          FPS: <strong className="text-emerald-400">{fps}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sensor Metrics Panel */}
                <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Czujniki Termiczne &amp; Telemetria na Żywo</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">1000ms Refresh Rate</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* CPU Core Temp */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        cpuTemp > 90
                          ? 'bg-red-950/40 border-red-500/50 text-red-300'
                          : cpuTemp > 75
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center space-x-1">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          <span>CPU Core</span>
                        </span>
                        <span className="font-mono text-[10px]">Max 100°C</span>
                      </div>
                      <div className="text-lg font-bold font-mono">{cpuTemp.toFixed(1)} °C</div>
                    </div>

                    {/* GPU Core Temp */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        gpuCoreTemp > 83
                          ? 'bg-red-950/40 border-red-500/50 text-red-300'
                          : gpuCoreTemp > 72
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center space-x-1">
                          <Flame className="w-3.5 h-3.5 text-orange-400" />
                          <span>GPU Core</span>
                        </span>
                        <span className="font-mono text-[10px]">Max 85°C</span>
                      </div>
                      <div className="text-lg font-bold font-mono">{gpuCoreTemp.toFixed(1)} °C</div>
                    </div>

                    {/* GPU HotSpot Temp */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        gpuHotspotTemp > 95
                          ? 'bg-red-950/60 border-red-500 text-red-200 animate-pulse'
                          : gpuHotspotTemp > 85
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center space-x-1">
                          <Thermometer className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-bold text-red-300">GPU HotSpot</span>
                        </span>
                        <span className="font-mono text-[10px]">Δ {(gpuHotspotTemp - gpuCoreTemp).toFixed(1)}°C</span>
                      </div>
                      <div className="text-lg font-bold font-mono">{gpuHotspotTemp.toFixed(1)} °C</div>
                    </div>

                    {/* GPU VRAM Temp */}
                    <div
                      className={`p-2.5 rounded-xl border transition ${
                        vramTemp > 95
                          ? 'bg-red-950/40 border-red-500/50 text-red-300'
                          : vramTemp > 85
                          ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 text-purple-400" />
                          <span>VRAM Memory</span>
                        </span>
                        <span className="font-mono text-[10px]">GDDR6X</span>
                      </div>
                      <div className="text-lg font-bold font-mono">{vramTemp.toFixed(1)} °C</div>
                    </div>

                    {/* VRM MOSFETs */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>VRM MOSFETs</span>
                        <span className="font-mono text-[10px]">PowerStage</span>
                      </div>
                      <div className="text-base font-bold font-mono">{vrmTemp.toFixed(1)} °C</div>
                    </div>

                    {/* Power Draw */}
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200">
                      <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                        <span>Pobór Mocy TGP</span>
                        <Zap className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="text-base font-bold font-mono text-amber-300">{powerWatts} W</div>
                    </div>
                  </div>

                  {/* Fan Speed Controls */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Obroty Wentylatorów (RPM):</span>
                      </span>
                      <strong className="text-cyan-300 font-mono">{fanRpm} RPM</strong>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                      {(['AUTO', 'QUIET', 'PERFORMANCE', 'TURBO_100'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setFanSpeedMode(mode)}
                          className={`py-1 rounded font-bold transition ${
                            fanSpeedMode === mode
                              ? 'bg-cyan-600 text-white shadow'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {mode === 'AUTO'
                            ? 'Auto'
                            : mode === 'QUIET'
                            ? 'Cichy'
                            : mode === 'PERFORMANCE'
                            ? 'Wydajność'
                            : '100% Turbo'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Workload Control Sliders */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <span>Dostosowanie Poziomu Obciążenia i Parametrów Renderowania</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Load Percentage */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Intensywność Obciążenia TDP:</span>
                      <strong className="text-orange-400 font-mono">{loadPercentage}%</strong>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={loadPercentage}
                      onChange={(e) => setLoadPercentage(Number(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  {/* CPU Threads */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Wątki Obliczeniowe CPU:</span>
                      <strong className="text-cyan-400 font-mono">{cpuThreads} Wątków</strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={64}
                      step={1}
                      value={cpuThreads}
                      onChange={(e) => setCpuThreads(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Resolution */}
                  <div className="space-y-1">
                    <span className="block text-xs text-slate-300 mb-1">Rozdzielczość GPU/VRAM:</span>
                    <div className="grid grid-cols-4 gap-1 text-[11px]">
                      {(['1080p', '2K', '4K', '8K'] as const).map((res) => (
                        <button
                          key={res}
                          onClick={() => setResolutionMode(res)}
                          className={`py-1 rounded font-bold transition ${
                            resolutionMode === res
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP GUIDED PROCEDURE */}
          {activeStepTab === 'GUIDE_STEPS' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-orange-400 mb-1 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-orange-400" />
                  <span>Procedura Krok po Kroku: Jak Prawidłowo Przeprowadzić Stress Test</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Wytyczne dla serwisantów i diagnostów komputerowych przed oddaniem komputera lub laptopa klientowi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
                    <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-mono">
                      1
                    </span>
                    <span>Weryfikacja Wstępna i Przygotowanie Stanowiska</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-8 list-disc">
                    <li>Sprawdź, czy chłodzenie CPU (AIO lub wieżowe) jest dokładnie dokręcone.</li>
                    <li>Upewnij się, że wentylatory obudowy kręcą się bez oporów i w dobrą stronę.</li>
                    <li>
                      Użyj markowej pasty termoprzewodzącej (np. Honeywell PTM7950 dla laptopów/GPU lub Thermal Grizzly
                      Kryonaut).
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-300 font-mono">
                      2
                    </span>
                    <span>Uruchomienie Testu Obciążeniowego (CPU/GPU)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-8 list-disc">
                    <li>Dla karty GPU: Wybierz FurMark 2K/4K lub Unigine Superposition.</li>
                    <li>Dla procesora CPU: Wybierz Prime95 Small FFTs lub AIDA64 FPU.</li>
                    <li>Ustaw czas trwania testu na minimum 15 minut do pełnej stabilizacji temperatur.</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs">
                    <span className="w-6 h-6 rounded-full bg-rose-950 border border-rose-500/40 flex items-center justify-center text-rose-300 font-mono">
                      3
                    </span>
                    <span>Analiza Różnicy Temperatur HotSpot vs GPU Core</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-8 list-disc">
                    <li>
                      Prawidłowa delta dla GPU wynosi <strong>10°C - 18°C</strong>.
                    </li>
                    <li>
                      Jeśli różnica wynosi <strong>&gt; 22°C - 30°C</strong>, występuje efekt wyciskania pasty (&quot;pump-out&quot;)
                      lub uszkodzenie komory parowej Vapor Chamber.
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-mono">
                      4
                    </span>
                    <span>Generowanie Raportu i Certyfikatu Dla Klienta</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 pl-8 list-disc">
                    <li>Pobierz raport Word (.doc) lub arkusz Excel z przebiegiem temperatur.</li>
                    <li>Skonsultuj przypadek z Asystentem AI TermoFix w celu zapisania diagnozy w Dzienniku Napraw.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSIS TIPS & HOTSPOT DELTA */}
          {activeStepTab === 'DIAGNOSIS_TIPS' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span>Diagnostyka Różnicy Temperatur: Hotspot Delta &amp; VRAM Throttling</span>
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Podczas testów obciążeniowych same wskazania głównego czujnika GPU Core nie wystarczą. Współczesne karty
                  NVIDIA RTX i AMD Radeon posiadają setki wbudowanych diod termicznych.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-emerald-400">Delta GPU Hotspot 10°C - 15°C</div>
                  <p className="text-slate-400">Idealny stan pasty i chłodzenia. Prawidłowy docisk bloku termicznego.</p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-amber-400">Delta GPU Hotspot 18°C - 24°C</div>
                  <p className="text-slate-400">Początek degradacji pasty silikonowej. Zalecana wymiana na termopad zmiennofazowy PTM7950.</p>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                  <div className="font-bold text-red-400">Delta GPU Hotspot &gt; 25°C - 35°C</div>
                  <p className="text-slate-400">Krytyczny stan! Brak styków na rdzeniu, wyschnięta pasta lub rozszczelnienie heatpipe.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REPORT EXPORT & AI CONSULT */}
          {activeStepTab === 'REPORT_EXPORT' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Eksport Protokołu Testu i Konsultacja z Asystentem AI</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Wygeneruj oficjalne dokumenty serwisowe dla Klienta lub prześlij aktualne parametry termiczne z testu
                  obciążeniowego bezpośrednio do Asystenta AI TermoFix.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportWord}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition"
                  >
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span>Pobierz Protokół Word (.doc)</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-200" />
                    <span>Pobierz Log Excel (.csv)</span>
                  </button>

                  {onSendToChat && (
                    <button
                      onClick={handleSendToAiAssistant}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg transition"
                    >
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>Wyślij Dane do Asystenta AI TermoFix</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Stanowisko Testów Obciążeniowych CPU/GPU TermoFix AI • Gotowe do pracy</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Zamknij Stanowisko
          </button>
        </div>

      </div>
    </div>
  );
};
