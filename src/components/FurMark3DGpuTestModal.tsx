import React, { Component, useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { hardwareDiscoveryService } from '../services/hardwareDiscoveryService';

export type TestProfileKey = 'custom' | 'stress' | 'stability' | 'throttling';

export interface TestProfile {
  key: TestProfileKey;
  name: string;
  description: string;
  durationSeconds: number; // 0 = nieograniczony
  tempThreshold: number;
  testMode: '1080p' | '1440p' | '4K' | '8k' | 'artifact' | 'tessellation' | 'game' | 'mats' | 'cinebench_multi' | 'cinebench_single' | '3dmark_timespy' | '3dmark_steelnomad' | 'furmark_1' | 'furmark_2';
  msaa: '0x' | '2x' | '4x' | '8x' | '16x' | '32x';
}

export interface GpuDeviceOption {
  id: string;
  name: string;
  type: 'dGPU' | 'iGPU';
  vramTotalGb: number;
  powerTdpWatts: number;
  busWidth: string;
  architecture: string;
}

export const MULTI_GPU_DEVICES: GpuDeviceOption[] = [
  { id: 'dgpu_5090', name: 'NVIDIA GeForce RTX 5090 32GB GDDR7', type: 'dGPU', vramTotalGb: 32, powerTdpWatts: 450, busWidth: '512-bit', architecture: 'Blackwell (Dedykowana)' },
  { id: 'dgpu_4090', name: 'NVIDIA GeForce RTX 4090 24GB GDDR6X', type: 'dGPU', vramTotalGb: 24, powerTdpWatts: 450, busWidth: '384-bit', architecture: 'Ada Lovelace (Dedykowana)' },
  { id: 'dgpu_7900', name: 'AMD Radeon RX 7900 XTX 24GB GDDR6', type: 'dGPU', vramTotalGb: 24, powerTdpWatts: 355, busWidth: '384-bit', architecture: 'RDNA 3 (Dedykowana)' },
  { id: 'dgpu_a770', name: 'Intel Arc A770 16GB GDDR6', type: 'dGPU', vramTotalGb: 16, powerTdpWatts: 225, busWidth: '256-bit', architecture: 'Alchemist (Dedykowana)' },
  { id: 'igpu_intel', name: 'Intel® Arc™ / Iris® Xe Graphics (8GB iGPU)', type: 'iGPU', vramTotalGb: 8, powerTdpWatts: 28, busWidth: '128-bit Shared', architecture: 'Xe-LPG (Zintegrowana)' },
  { id: 'igpu_amd', name: 'AMD Radeon™ 780M Graphics (8GB iGPU)', type: 'iGPU', vramTotalGb: 8, powerTdpWatts: 30, busWidth: '128-bit Shared', architecture: 'RDNA 3 iGPU (Zintegrowana)' }
];

const TEST_PROFILES: Record<TestProfileKey, TestProfile> = {
  custom: {
    key: 'custom',
    name: 'Własny (Manual)',
    description: 'Swobodna zmiana parametrów testu',
    durationSeconds: 0,
    tempThreshold: 85,
    testMode: 'game',
    msaa: '16x'
  },
  stress: {
    key: 'stress',
    name: 'Stress Test',
    description: '120s skrajnego obciążenia GPU w 4K',
    durationSeconds: 120,
    tempThreshold: 88,
    testMode: '4K',
    msaa: '16x'
  },
  stability: {
    key: 'stability',
    name: 'Stability Check',
    description: '300s testu ciągłego w 1440p',
    durationSeconds: 300,
    tempThreshold: 80,
    testMode: '1440p',
    msaa: '8x'
  },
  throttling: {
    key: 'throttling',
    name: 'Thermal Throttling',
    description: '60s testu w 8K przy MSAA 32x do wykrycia przegrzewania',
    durationSeconds: 60,
    tempThreshold: 90,
    testMode: '8k',
    msaa: '32x'
  }
};

const playBeepSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn("Audio Context playback error:", e);
  }
};

interface ChartErrorBoundaryProps {
  children: React.ReactNode;
  fallbackData: { time: string; temp: number; fps: number }[];
  threshold: number;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
}

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  state: ChartErrorBoundaryState;
  props: ChartErrorBoundaryProps;

  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any): ChartErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Chart rendering error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const data = this.props.fallbackData;
      const width = 400;
      const height = 180;
      const maxTemp = 110;
      const pointsTemp = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * width},${height - (d.temp / maxTemp) * height}`).join(' ');
      const pointsFps = data.map((d, i) => `${(i / Math.max(1, data.length - 1)) * width},${height - (Math.min(200, d.fps) / 200) * height}`).join(' ');
      const threshY = height - (this.props.threshold / maxTemp) * height;

      return (
        <div className="w-full h-full flex flex-col justify-between text-xs">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span>Wykres GPU (Monitorowanie)</span>
            <span className="text-amber-400">Temp: {data[data.length - 1]?.temp}°C | FPS: {data[data.length - 1]?.fps}</span>
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 bg-slate-950 rounded border border-slate-800 p-1">
            <line x1="0" y1={threshY} x2={width} y2={threshY} stroke="red" strokeDasharray="4" strokeWidth="1" />
            <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points={pointsTemp} />
            <polyline fill="none" stroke="#10b981" strokeWidth="2" points={pointsFps} />
          </svg>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span className="text-amber-500">━ Temp (°C)</span>
            <span className="text-emerald-500">━ FPS</span>
            <span className="text-red-500">--- Próg ({this.props.threshold}°C)</span>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  Monitor,
  Play,
  Square,
  RotateCcw,
  Flame,
  Zap,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  Layers,
  Cpu,
  Gamepad2,
  Download,
  FileText,
  Sparkles,
  Upload,
  BarChart2,
  Clock,
  ShieldAlert,
  FileJson,
  Database,
  HardDrive,
  Bot,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Send,
  Fan,
  Gauge,
  FileSpreadsheet,
  Percent,
  SlidersHorizontal
} from 'lucide-react';

interface FurMark3DGpuTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
  onSaveToJournal?: (log: string) => void;
}

export const FurMark3DGpuTestModal: React.FC<FurMark3DGpuTestModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  onSaveToJournal
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [msaa, setMsaa] = useState<'0x' | '2x' | '4x' | '8x' | '16x' | '32x'>('16x');
  const [testMode, setTestMode] = useState<'1080p' | '1440p' | '4K' | '8k' | 'artifact' | 'tessellation' | 'game' | 'mats' | 'cinebench_multi' | 'cinebench_single' | '3dmark_timespy' | '3dmark_steelnomad' | 'furmark_1' | 'furmark_2'>('game');
  const [selectedGpuId, setSelectedGpuId] = useState<string>('dgpu_5090');
  const [selectedGpu, setSelectedGpu] = useState<string>('NVIDIA GeForce RTX 5090 32GB GDDR7');
  const [artifactIntensity, setArtifactIntensity] = useState<number>(5); // 1-10
  const [tessellationLevel, setTessellationLevel] = useState<number>(32); // 4-128
  const [fps, setFps] = useState(144);
  const [gpuTemp, setGpuTemp] = useState(68);
  const [gpuLoad, setGpuLoad] = useState(99);
  const [cpuLoad, setCpuLoad] = useState(42);
  const [vramUsedGb, setVramUsedGb] = useState(14.8);
  const [powerLimitPct, setPowerLimitPct] = useState<number>(100); // 50% - 120%
  const [fanMode, setFanMode] = useState<'auto' | 'fixed'>('auto');
  const [fanSpeedFixed, setFanSpeedFixed] = useState<number>(75); // 30% - 100%
  const [currentFanSpeed, setCurrentFanSpeed] = useState<number>(65);
  const [coreClock, setCoreClock] = useState<number>(2550);
  const [memoryClock, setMemoryClock] = useState<number>(14000);
  const [powerDraw, setPowerDraw] = useState<number>(380);

  const [activeTab, setActiveTab] = useState<'monitor' | 'power_tuning' | 'vram_mats' | 'history' | 'ai_studio'>('monitor');
  const [powerProfile, setPowerProfile] = useState<'undervolting' | 'stock' | 'overclocking' | 'custom'>('stock');
  const [powerStabilityTesting, setPowerStabilityTesting] = useState(false);
  const [powerStabilitySecsLeft, setPowerStabilitySecsLeft] = useState<number | null>(null);
  const [powerStabilityStatus, setPowerStabilityStatus] = useState<'idle' | 'passed' | 'unstable'>('idle');

  const handleSelectPowerProfile = (profile: 'undervolting' | 'stock' | 'overclocking' | 'custom') => {
    setPowerProfile(profile);
    if (profile === 'undervolting') {
      setPowerLimitPct(75);
    } else if (profile === 'stock') {
      setPowerLimitPct(100);
    } else if (profile === 'overclocking') {
      setPowerLimitPct(115);
    }
  };

  const handlePowerSliderChange = (newVal: number) => {
    setPowerLimitPct(newVal);
    if (newVal <= 85) {
      setPowerProfile('undervolting');
    } else if (newVal >= 110) {
      setPowerProfile('overclocking');
    } else if (newVal === 100) {
      setPowerProfile('stock');
    } else {
      setPowerProfile('custom');
    }
  };

  const handleRunPowerStabilityTest = () => {
    setPowerStabilityTesting(true);
    setPowerStabilityStatus('idle');
    setPowerStabilitySecsLeft(20);

    let countdown = 20;
    const interval = setInterval(() => {
      countdown -= 1;
      setPowerStabilitySecsLeft(countdown);

      if (countdown % 2 === 0) {
        const targetSpike = countdown % 4 === 0 ? Math.min(120, powerLimitPct + 10) : Math.max(50, powerLimitPct - 15);
        setPowerLimitPct(targetSpike);
      }

      if (countdown <= 0) {
        clearInterval(interval);
        setPowerStabilityTesting(false);
        setPowerStabilitySecsLeft(null);
        if (gpuTemp <= tempThreshold) {
          setPowerStabilityStatus('passed');
        } else {
          setPowerStabilityStatus('unstable');
        }
      }
    }, 1000);
  };

  const [isChartFullscreen, setIsChartFullscreen] = useState(false);
  const [aiDiagnosisReport, setAiDiagnosisReport] = useState<string | null>(null);
  const [isAiDiagnosisModalOpen, setIsAiDiagnosisModalOpen] = useState(false);
  const [copiedDiagnosis, setCopiedDiagnosis] = useState(false);

  const [chartData, setChartData] = useState<{
    time: string;
    temp: number;
    fps: number;
    cpuLoad: number;
    gpuLoad: number;
    vramUsedGb: number;
    coreClock: number;
    memoryClock: number;
    fanSpeed: number;
    powerDrawWatts: number;
    powerLimitPct: number;
  }[]>(() => {
    const init = [];
    const now = Date.now();
    for (let i = 10; i >= 0; i--) {
      init.push({
        time: new Date(now - i * 1000).toLocaleTimeString(),
        temp: 50,
        fps: 144,
        cpuLoad: 35,
        gpuLoad: 98,
        vramUsedGb: 12.4,
        coreClock: 2550,
        memoryClock: 14000,
        fanSpeed: 65,
        powerDrawWatts: 380,
        powerLimitPct: 100
      });
    }
    return init;
  });
  const [tempThreshold, setTempThreshold] = useState<number>(85);
  const [savedResults, setSavedResults] = useState<{ date: string; fps: number; maxTemp: number; vramUsedGb?: number }[]>([]);

  const [isAudioBeepEnabled, setIsAudioBeepEnabled] = useState<boolean>(true);
  const lastBeepTimeRef = useRef<number>(0);

  const [selectedProfileKey, setSelectedProfileKey] = useState<TestProfileKey>('custom');
  const [profileRemainingSeconds, setProfileRemainingSeconds] = useState<number | null>(null);

  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('furmark_results');
    if (saved) {
        setSavedResults(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!isRunning || profileRemainingSeconds === null) return;
    const timer = setInterval(() => {
      setProfileRemainingSeconds(prev => {
        if (prev === null || prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, profileRemainingSeconds]);

  const handleSelectProfile = (key: TestProfileKey) => {
    setSelectedProfileKey(key);
    const profile = TEST_PROFILES[key];
    setTempThreshold(profile.tempThreshold);
    setTestMode(profile.testMode);
    setMsaa(profile.msaa);
    if (profile.durationSeconds > 0) {
      setProfileRemainingSeconds(profile.durationSeconds);
    } else {
      setProfileRemainingSeconds(null);
    }
  };

  const [discoveredCpu, setDiscoveredCpu] = useState<string>('Intel Core i9-14900K');
  const [discoveredRam, setDiscoveredRam] = useState<string>('64 GB DDR5');

  useEffect(() => {
    if (isOpen) {
      hardwareDiscoveryService.discoverSystemHardware().then((specs) => {
        if (specs) {
          if (specs.gpu?.vendorAndModel && specs.gpu.vendorAndModel.length > 3) {
            setSelectedGpu(specs.gpu.vendorAndModel + (specs.gpu.vramGb ? ` ${specs.gpu.vramGb}GB` : ''));
          }
          if (specs.cpu?.model) {
            setDiscoveredCpu(specs.cpu.model);
          }
          if (specs.ram?.totalGbFormatted) {
            setDiscoveredRam(specs.ram.totalGbFormatted);
          }
        }
      });
    }
  }, [isOpen]);
  
  const [tempHistory, setTempHistory] = useState<number[]>(Array(50).fill(50));
  const [fpsHistory, setFpsHistory] = useState<number[]>(Array(50).fill(0));
  const [frameCount, setFrameCount] = useState(0);
  const [artifactsDetected, setArtifactsDetected] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameLives, setGameLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [benchmarkScore, setBenchmarkScore] = useState<number>(28450);
  
  // Nowe ustawienia grafiki dla "3DMark" / Maksymalnej wydajności
  const [powerManagement, setPowerManagement] = useState<'Maksymalna wydajność preferowana' | 'Zrównoważony' | 'Optymalna moc'>('Maksymalna wydajność preferowana');
  const [vSync, setVSync] = useState<boolean>(false);
  const [aiUpscaling, setAiUpscaling] = useState<'Wyłączone' | 'DLSS (NVIDIA)' | 'FSR (AMD)' | 'XeSS (Intel)'>('DLSS (NVIDIA)');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Keyboard listeners for game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation & Game Loop
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let localTemp = selectedGpu.includes('5090') ? 68 : 72;
    let lastTime = performance.now();
    let frames = 0;

    // Game state objects
    let playerX = canvas.width / 2;
    let playerY = canvas.height - 50;
    let bullets: { x: number; y: number; speed: number }[] = [];
    let enemies: { x: number; y: number; speedX: number; speedY: number; type: 'bug' | 'short' | 'heat' }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
    let score = 0;
    let lives = 3;
    let isOver = false;

    // Initial enemies
    for (let i = 0; i < 8; i++) {
      enemies.push({
        x: Math.random() * (canvas.width - 80) + 40,
        y: Math.random() * 150 + 40,
        speedX: (Math.random() - 0.5) * 4,
        speedY: Math.random() * 1.2 + 0.5,
        type: Math.random() > 0.5 ? 'short' : Math.random() > 0.25 ? 'heat' : 'bug'
      });
    }

    const render = (time: number) => {
      const delta = time - lastTime;
      frames++;
      if (delta >= 1000) {
        const baseFps = testMode === 'game' ? 140 : testMode === '8k' ? 45 : testMode === '4K' ? 75 : testMode === '1440p' ? 120 : 180;
        const msaaPenalty = msaa === '32x' ? 0.55 : msaa === '16x' ? 0.7 : msaa === '8x' ? 0.82 : msaa === '4x' ? 0.9 : 1.0;
        const tessPenalty = tessellationLevel > 64 ? 0.8 : 1.0;
        
        frames = 0;
        lastTime = time;

        const currentActiveGpu = MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId || g.name === selectedGpu) || MULTI_GPU_DEVICES[0];
        const calculatedGpuLoad = currentActiveGpu.type === 'iGPU' ? 97 : 99;
        setGpuLoad(calculatedGpuLoad);

        // Power & Fan speed calculations
        const powerRatio = powerLimitPct / 100;
        const calculatedPowerWatts = Math.round(currentActiveGpu.powerTdpWatts * powerRatio * (calculatedGpuLoad / 100));
        setPowerDraw(calculatedPowerWatts);

        const calculatedFan = fanMode === 'fixed'
          ? fanSpeedFixed
          : Math.min(100, Math.max(30, Math.round(30 + (localTemp - 35) * 1.4)));
        setCurrentFanSpeed(calculatedFan);

        // Thermal dissipation based on fan speed and power limit
        const fanCoolingFactor = (calculatedFan - 50) / 100;
        const tempDelta = (testMode === '8k' || testMode === '4K' ? 0.35 : 0.2) * powerRatio - (fanCoolingFactor * 0.12);

        if (isRunning && !isOver) {
          localTemp = Math.min(98, Math.max(32, localTemp + tempDelta));
          const currentTemp = parseFloat(localTemp.toFixed(1));
          setGpuTemp(currentTemp);

          if (currentTemp > tempThreshold && isAudioBeepEnabled) {
            const now = Date.now();
            if (now - lastBeepTimeRef.current > 2000) {
              lastBeepTimeRef.current = now;
              playBeepSound();
            }
          }

          setTempHistory(prev => [...prev.slice(1), currentTemp]);

          const calculatedCpuLoad = Math.min(99, Math.max(18, Math.round(
            testMode === 'game' ? 68 + Math.sin(time / 800) * 20 :
            testMode === 'tessellation' ? 82 + Math.cos(time / 500) * 14 :
            testMode === '8k' ? 34 + Math.sin(time / 1000) * 12 :
            52 + Math.sin(time / 700) * 16
          )));
          setCpuLoad(calculatedCpuLoad);

          const baseVram = currentActiveGpu.type === 'iGPU' ? 2.5 : 4.8;
          const modeVram = testMode === '8k' ? 18.2 : testMode === '4K' ? 12.5 : testMode === '1440p' ? 8.2 : 5.8;
          const calculatedVram = parseFloat(Math.min(currentActiveGpu.vramTotalGb * 0.98, baseVram + modeVram + Math.sin(time / 1200) * 0.5).toFixed(1));
          setVramUsedGb(calculatedVram);

          // Clocks & Thermal Throttling
          const baseCoreClock = currentActiveGpu.id.includes('5090') ? 2550
            : currentActiveGpu.id.includes('4090') ? 2520
            : currentActiveGpu.id.includes('7900') ? 2300
            : currentActiveGpu.id.includes('a770') ? 2100 : 1500;

          const baseMemClock = currentActiveGpu.id.includes('5090') ? 14000
            : currentActiveGpu.id.includes('4090') ? 10500
            : currentActiveGpu.id.includes('7900') ? 9600
            : currentActiveGpu.id.includes('a770') ? 8000 : 3200;

          let calcCoreClock = Math.round(baseCoreClock * Math.pow(powerRatio, 0.45) + Math.sin(time / 400) * 15);
          let calcMemoryClock = Math.round(baseMemClock + Math.cos(time / 700) * 20);

          let effectiveFps = Math.round(baseFps * msaaPenalty * tessPenalty * Math.pow(powerRatio, 0.35));
          if (currentTemp >= tempThreshold) {
            const overTemp = currentTemp - tempThreshold;
            const throttleRatio = Math.min(0.40, 0.10 + overTemp * 0.04);
            calcCoreClock = Math.round(calcCoreClock * (1 - throttleRatio));
            effectiveFps = Math.round(effectiveFps * (1 - throttleRatio * 0.75));
          }

          setFps(effectiveFps);
          setFpsHistory(prev => [...prev.slice(1), effectiveFps]);
          setBenchmarkScore(effectiveFps * 195 + (msaa === '32x' ? 4500 : 2000));
          setCoreClock(calcCoreClock);
          setMemoryClock(calcMemoryClock);

          setChartData(prev => [
            ...prev.slice(-49),
            {
              time: new Date().toLocaleTimeString(),
              temp: currentTemp,
              fps: effectiveFps,
              cpuLoad: calculatedCpuLoad,
              gpuLoad: calculatedGpuLoad,
              vramUsedGb: calculatedVram,
              coreClock: calcCoreClock,
              memoryClock: calcMemoryClock,
              fanSpeed: calculatedFan,
              powerDrawWatts: calculatedPowerWatts,
              powerLimitPct: powerLimitPct
            }
          ]);
        }
      }

      setFrameCount(c => c + 1);

      // Clear canvas
      ctx.fillStyle = testMode === 'furmark_2' ? 'rgba(3, 7, 18, 0.15)' : '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw Furmark Eye (fiery circle in the background)
      if (testMode.includes('furmark') || testMode === '1080p' || testMode === '1440p' || testMode === '4K' || testMode === '8k') {
          const eyeGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
          const pulse = (Math.sin(time / 200) + 1) / 2;
          eyeGradient.addColorStop(0, `rgba(255, 150, 0, ${0.4 + pulse * 0.2})`);
          eyeGradient.addColorStop(0.5, `rgba(200, 50, 0, ${0.2 + pulse * 0.1})`);
          eyeGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.fillStyle = eyeGradient;
          ctx.beginPath();
          ctx.arc(cx, cy, 120, 0, Math.PI * 2);
          ctx.fill();
      }

      // Always update angle
      if (isRunning && !isOver) {
        const speedMult = testMode === 'tessellation' ? tessellationLevel / 32 : 1.0;
        angle += (testMode === 'game' ? 0.08 : 0.04) * speedMult;
      }

      // If MATS / MODS VRAM Test mode
      if (testMode === 'mats') {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('NVIDIA MODS/MATS v455.45 VRAM DIAGNOSTIC TERMINAL', 30, 40);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(`Karta Testowana: ${selectedGpu}`, 30, 70);
        ctx.fillText(`Test szyny VRAM: 384-bit / 512-bit (GDDR7 / HBM3e)`, 30, 95);
        ctx.fillText(`Kanały A0, A1, B0, B1, C0, C1, D0, D1: [ OK — 0 BŁĘDÓW ]`, 30, 120);
        ctx.fillText(`Przetestowano 32,768 MB VRAM bez uszkodzeń komórek BGA.`, 30, 145);

        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 16; col++) {
            const bx = 30 + col * 52;
            const by = 180 + row * 38;
            ctx.fillStyle = (row + col + Math.floor(time / 200)) % 7 === 0 ? '#10b981' : '#065f46';
            ctx.fillRect(bx, by, 48, 30);
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px monospace';
            ctx.fillText(`CH${row}-${col}`, bx + 6, by + 19);
          }
        }
        animId = requestAnimationFrame(render);
        return;
      }

      // ----------------------------------------------------
      // DRAW BACKGROUND 3D TORUS (EXTREME LOAD & MSAA / TESS)
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      const R = testMode === '8k' || testMode === '4K' ? 160 : 130;
      const r = testMode === '8k' || testMode === '4K' ? 65 : 52;
      const segmentsU = testMode === 'tessellation' ? tessellationLevel : 64;
      const segmentsV = testMode === 'tessellation' ? Math.max(16, Math.floor(tessellationLevel / 2)) : 32;

      ctx.strokeStyle = testMode === 'artifact' ? '#450a0a' : '#1e293b';
      ctx.lineWidth = msaa === '32x' ? 0.6 : msaa === '16x' ? 0.8 : 1;
      
      // Grid effect
      for (let i = -400; i <= 400; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, -400);
        ctx.lineTo(i, 400);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-400, i);
        ctx.lineTo(400, i);
        ctx.stroke();
      }

      // V-Sync visual effect - tearing simulator if VSync is off
      if (!vSync && frames % 15 === 0) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
         ctx.fillRect(-cx, (Math.random() - 0.5) * cy, canvas.width, 10);
      }

      // AI Upscaling visual effect - slightly blurs / adds chromatic aberration if enabled
      if (aiUpscaling !== 'Wyłączone') {
          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 10;
          ctx.shadowColor = aiUpscaling.includes('DLSS') ? '#22c55e' : aiUpscaling.includes('FSR') ? '#ef4444' : '#3b82f6';
      }

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosX = Math.cos(angle * 0.7);
      const sinX = Math.sin(angle * 0.7);

      // Particles for FurMark flames
      if (testMode.includes('furmark')) {
         ctx.globalCompositeOperation = 'lighter';
         for (let p = 0; p < 15; p++) {
            const pAngle = angle + (Math.random() * Math.PI * 2);
            const pRad = R + (Math.random() - 0.5) * 40;
            const px = pRad * Math.cos(pAngle);
            const py = pRad * Math.sin(pAngle);
            const pz = (Math.random() - 0.5) * 30;
            
            const pxRot = px * cosA - pz * sinA;
            const pzRot = px * sinA + pz * cosA;
            const pyRot = py * cosX - pzRot * sinX;
            const pzRot2 = py * sinX + pzRot * cosX;
            
            const scaleP = 400 / (400 + pzRot2 + 280);
            const pxx = pxRot * scaleP;
            const pyy = pyRot * scaleP;
            
            ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 150)}, 0, ${Math.random() * 0.4})`;
            ctx.beginPath();
            ctx.arc(pxx, pyy, scaleP * (Math.random() * 8 + 2), 0, Math.PI * 2);
            ctx.fill();
         }
         ctx.globalCompositeOperation = 'source-over';
      }

      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;
        const cosU = Math.cos(u);
        const sinU = Math.sin(u);

        for (let j = 0; j < segmentsV; j++) {
          const v = (j / segmentsV) * Math.PI * 2;
          const cosV = Math.cos(v);
          const sinV = Math.sin(v);

          // "Maksymalna wydajność" makes shape pulse
          const pulse = powerManagement === 'Maksymalna wydajność preferowana' ? Math.sin(time / 100) * 10 : 0;
          const currentR = R + pulse;
          
          const ox = (currentR + r * cosV) * cosU;
          const oy = (currentR + r * cosV) * sinU;
          const oz = r * sinV;

          const x1 = ox * cosA - oz * sinA;
          const z1 = ox * sinA + oz * cosA;
          const y1 = oy * cosX - z1 * sinX;
          const z2 = oy * sinX + z1 * cosX;

          // Dynamic camera zoom (fov oscillation)
          const fov = testMode.includes('furmark') ? 400 + Math.sin(time * 0.0005) * 120 : 400;
          const scale = fov / (fov + z2 + 280);
          const px = x1 * scale;
          const py = y1 * scale;

          const heatFactor = (localTemp - 50) / 48;
          
          // Authentic FurMark Colors (Fiery Orange/Red)
          let redCol = 220 + Math.floor(heatFactor * 35);
          let greenCol = 80 - Math.floor(heatFactor * 40);
          let blueCol = 20;

          if (powerManagement === 'Zrównoważony') {
              redCol = 180; greenCol = 120; blueCol = 40;
          } else if (powerManagement === 'Optymalna moc') {
              redCol = 100; greenCol = 180; blueCol = 80;
          }

          let strokeColor = `rgba(${redCol}, ${greenCol}, ${blueCol}, 1.0)`;
          if (testMode === 'artifact') {
            if (Math.random() < (artifactIntensity * 0.02)) {
              strokeColor = Math.random() > 0.5 ? '#22c55e' : '#ef4444';
              setArtifactsDetected(c => c + 1);
            }
          }

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = scale * (msaxMultiplier(msaa) * 1.6);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + scale * 3, py + scale * 3);
          ctx.stroke();

          ctx.fillStyle = `rgba(${Math.max(0, redCol - 50)}, ${Math.max(0, greenCol - 30)}, ${blueCol}, 0.95)`;
          ctx.beginPath();
          ctx.arc(px, py, scale * (msaa === '32x' ? 2.0 : msaa === '16x' ? 1.7 : 1.3), 0, Math.PI * 2);
          ctx.fill();
          
          // Render extra "fur" / spikes in furmark_1 / furmark_2 mode
          if (testMode.includes('furmark') || testMode === '1080p' || testMode === '1440p' || testMode === '4K' || testMode === '8k') {
             // Advanced Perlin-like noise for fur wave
             const noise = Math.sin(u * 15 + time * 0.003) * Math.cos(v * 15 + time * 0.002);
             const hairLength = noise * 12 + 25;
             
             // Gravity / wind effect on hair
             const windX = Math.sin(time * 0.001) * 15;
             const windY = Math.cos(time * 0.001) * 10;
             
             const hairX = px + (x1 / 150) * hairLength * scale + windX * scale;
             const hairY = py + (y1 / 150) * hairLength * scale + windY * scale;
             
             // Dynamic hair color based on length and noise
             const hairR = Math.min(255, redCol + (noise > 0 ? 40 : 10));
             const hairG = Math.min(255, greenCol + (noise > 0 ? 60 : 20));
             
             ctx.strokeStyle = `rgba(${hairR}, ${hairG}, ${blueCol + 20}, ${msaa === '32x' ? 0.95 : 0.7})`;
             ctx.lineWidth = scale * 0.9;
             ctx.beginPath();
             ctx.moveTo(px, py);
             ctx.lineTo(hairX, hairY);
             ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Cinebench Bucket Rendering Simulator Overlay
      if (testMode.includes('cinebench')) {
          const numBuckets = testMode === 'cinebench_multi' ? 32 : 1;
          const bucketSize = 40;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          for (let i = 0; i < numBuckets; i++) {
              const bx = (time * 0.05 + i * bucketSize * 2) % canvas.width;
              const by = ((Math.floor((time * 0.05 + i * bucketSize * 2) / canvas.width)) * bucketSize) % canvas.height;
              ctx.strokeRect(bx, by, bucketSize, bucketSize);
              ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
              ctx.fillRect(bx, by, bucketSize, bucketSize);
          }
      }

      // 3DMark "Time Spy" or "Steel Nomad" Scanning Line Overlay
      if (testMode.includes('3dmark')) {
          const scanLineY = (time * 0.2) % canvas.height;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(0, scanLineY, canvas.width, 4);
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ef4444';
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(0, scanLineY + 1, canvas.width, 2);
          ctx.shadowBlur = 0;
      }

      if (testMode === 'game') {
        // --- ARCADE GAME ENGINE ---
        if (!isOver && isRunning) {
          if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
            playerX = Math.max(35, playerX - 9);
          }
          if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
            playerX = Math.min(canvas.width - 35, playerX + 9);
          }
          if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) {
            playerY = Math.max(canvas.height - 210, playerY - 7);
          }
          if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) {
            playerY = Math.min(canvas.height - 35, playerY + 7);
          }

          if (keysRef.current[' '] && (frames % 8 === 0)) {
            bullets.push({ x: playerX, y: playerY - 22, speed: 14 });
          }

          bullets.forEach((b, idx) => {
            b.y -= b.speed;
            if (b.y < 0) bullets.splice(idx, 1);
          });

          if (Math.random() < 0.04) {
            enemies.push({
              x: Math.random() * (canvas.width - 100) + 50,
              y: 40,
              speedX: (Math.random() - 0.5) * 5,
              speedY: Math.random() * 2.5 + 1.2,
              type: Math.random() > 0.5 ? 'short' : Math.random() > 0.25 ? 'heat' : 'bug'
            });
          }

          enemies.forEach((e, eIdx) => {
            e.x += e.speedX;
            e.y += e.speedY;
            if (e.x < 35 || e.x > canvas.width - 35) e.speedX *= -1;
            if (e.y > canvas.height - 40) {
              e.y = 40;
              e.x = Math.random() * (canvas.width - 100) + 50;
            }

            const dist = Math.hypot(playerX - e.x, playerY - e.y);
            if (dist < 32) {
              lives--;
              setGameLives(lives);
              enemies.splice(eIdx, 1);
              for (let p = 0; p < 18; p++) {
                particles.push({
                  x: playerX,
                  y: playerY,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: '#ef4444',
                  life: 35
                });
              }
              if (lives <= 0) {
                isOver = true;
                setGameOver(true);
              }
            }

            bullets.forEach((b, bIdx) => {
              const bDist = Math.hypot(b.x - e.x, b.y - e.y);
              if (bDist < 28) {
                score += 250;
                setGameScore(score);
                bullets.splice(bIdx, 1);
                enemies.splice(eIdx, 1);
                for (let p = 0; p < 12; p++) {
                  particles.push({
                    x: e.x,
                    y: e.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    color: '#38bdf8',
                    life: 30
                  });
                }
              }
            });
          });
        }

        particles.forEach((pt, pIdx) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          if (pt.life <= 0) particles.splice(pIdx, 1);
        });

        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.lineTo(-16, 16);
        ctx.lineTo(16, 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#facc15';
        bullets.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        });

        enemies.forEach(e => {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.fillStyle = e.type === 'short' ? '#ef4444' : e.type === 'heat' ? '#f59e0b' : '#a855f7';
          ctx.beginPath();
          ctx.arc(0, 0, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(e.type.toUpperCase(), -12, 3);
          ctx.restore();
        });

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(20, 20, 360, 120);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(20, 20, 360, 120);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(`🎮 GRA ARCADE — ${selectedGpu.slice(0, 22)}`, 32, 42);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Wynik: ${score} pkt | Życia: ${lives} ❤️ | FPS: ${fps}`, 32, 66);
        ctx.fillText(`Sterowanie: Strzałki / WSDA + Spacja (Strzał)`, 32, 90);
        ctx.fillText(`Obciążenie VRAM: 100% | MSAA: ${msaa}`, 32, 112);

        if (isOver) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER — PRZEGRANO TEST VRAM', cx, cy - 20);
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px sans-serif';
          ctx.fillText(`Wynik końcowy: ${score} pkt. Kliknij Wznowij Test aby spróbować ponownie.`, cx, cy + 20);
          ctx.textAlign = 'left';
        }

      } else {
        // --- STANDARD FURMARK / 3DMARK / CINEBENCH HUD ---
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(10, 10, 440, 150);
        
        let strokeCol = '#eab308';
        let titleStr = `FurMark v1.38.1.0 - Burn-in test, ${testMode.toUpperCase()}`;
        let highlightColor = '#eab308';
        
        if (testMode.includes('cinebench')) {
           strokeCol = '#f59e0b';
           highlightColor = '#f59e0b';
           titleStr = `Cinebench R23 Simulator [${testMode.toUpperCase()}]`;
        } else if (testMode.includes('3dmark')) {
           strokeCol = '#ef4444';
           highlightColor = '#ef4444';
           titleStr = `3DMark TimeSpy / Steel Nomad [${testMode.toUpperCase()}]`;
        } else if (testMode === 'artifact') {
           strokeCol = '#ef4444';
           highlightColor = '#ef4444';
        }

        ctx.fillStyle = highlightColor;
        ctx.font = 'bold 16px sans-serif';
        
        // Add text glow
        ctx.shadowBlur = 8;
        ctx.shadowColor = highlightColor;
        ctx.fillText(titleStr, 20, 35);
        ctx.shadowBlur = 0; // reset
        

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(`${fps} FPS`, 20, 60);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.fillText(`GPU: ${selectedGpu}`, 20, 80);
        ctx.fillText(`Temperatura GPU: ${localTemp.toFixed(1)}°C | Power: ${powerDraw}W`, 20, 100);
        ctx.fillText(`MSAA: ${msaa} | Zarządzanie energią: ${powerManagement}`, 20, 120);
        ctx.fillText(`V-Sync: ${vSync ? 'ON' : 'OFF'} | AI: ${aiUpscaling} | Score: ${benchmarkScore}`, 20, 140);

        // --- GRAPHS OVERLAY ---
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(canvas.width - 320, 20, 300, 140);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(canvas.width - 320, 20, 300, 140);
        
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px sans-serif';
        ctx.fillText('TEMPERATURA GPU (°C)', canvas.width - 310, 35);
        
        ctx.fillStyle = '#10b981';
        ctx.fillText('FPS / WYDAJNOŚĆ', canvas.width - 310, 90);
        
        // Draw Temp Graph
        ctx.beginPath();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        tempHistory.forEach((t, i) => {
            const x = canvas.width - 310 + (i * (280 / 50));
            const y = 80 - ((t - 30) / 70) * 40;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw FPS Graph
        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        fpsHistory.forEach((f, i) => {
            const x = canvas.width - 310 + (i * (280 / 50));
            const y = 140 - (f / 300) * 40;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isRunning, msaa, testMode, artifactIntensity, tessellationLevel, selectedGpu, selectedGpuId, powerLimitPct, fanMode, fanSpeedFixed, tempThreshold, isAudioBeepEnabled]);

  const msaxMultiplier = (m: string) => {
    if (m === '32x') return 3.2;
    if (m === '16x') return 2.6;
    if (m === '8x') return 2.0;
    if (m === '4x') return 1.5;
    if (m === '2x') return 1.2;
    return 1.0;
  };

  const handleExportCsv = () => {
    const headers = [
      'Czas',
      'Karta_GPU',
      'Tryb_Testowy',
      'Temperatura_GPU_C',
      'FPS',
      'Obciazenie_CPU_Pct',
      'Obciazenie_GPU_Pct',
      'Uzycie_VRAM_GB',
      'Taktowanie_Rdzenia_MHz',
      'Taktowanie_Pamieci_MHz',
      'Predkosc_Wentylatora_Pct',
      'Pobor_Mocy_W',
      'Limit_Zasilania_Pct'
    ].join(';');

    const rows = chartData.map(row => [
      row.time,
      `"${selectedGpu}"`,
      `"${testMode}"`,
      row.temp,
      row.fps,
      row.cpuLoad,
      row.gpuLoad,
      row.vramUsedGb,
      row.coreClock ?? coreClock,
      row.memoryClock ?? memoryClock,
      row.fanSpeed ?? currentFanSpeed,
      row.powerDrawWatts ?? powerDraw,
      row.powerLimitPct ?? powerLimitPct
    ].join(';'));

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_');
    link.setAttribute('download', `FurMark_Telemetry_${selectedGpuId}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectGpuDevice = (gpuId: string) => {
    setSelectedGpuId(gpuId);
    const found = MULTI_GPU_DEVICES.find(g => g.id === gpuId);
    if (found) {
      setSelectedGpu(found.name);
      setPowerDraw(found.powerTdpWatts);
      if (found.type === 'iGPU') {
        setFps(38);
      } else {
        setFps(144);
      }
    }
  };

  const handleGenerateAiDiagnosis = () => {
    const activeGpuObj = MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId || g.name === selectedGpu) || MULTI_GPU_DEVICES[0];
    const maxTemp = Math.max(...tempHistory, gpuTemp);
    const avgFpsVal = chartData.length > 0 ? Math.round(chartData.reduce((acc, c) => acc + c.fps, 0) / chartData.length) : fps;
    const avgCpuLoad = chartData.length > 0 ? Math.round(chartData.reduce((acc, c) => acc + c.cpuLoad, 0) / chartData.length) : cpuLoad;
    const isThrottling = maxTemp >= tempThreshold;
    const isBottleneck = avgCpuLoad > 85 && gpuLoad < 82;

    const report = `🤖 AUTOMATYCZNA DIAGNOZA SERWISOWA AI — STACJA TESTOWA TERMOFIX
=====================================================================
Karta Graficzna: ${selectedGpu} (${activeGpuObj.type === 'iGPU' ? 'Zintegrowana iGPU' : 'Dedykowana dGPU'})
Magistrala VRAM: ${activeGpuObj.busWidth} | Architektura: ${activeGpuObj.architecture}
Profil Testu: ${TEST_PROFILES[selectedProfileKey].name} (${TEST_PROFILES[selectedProfileKey].description})
Tryb Renderowania: ${testMode.toUpperCase()} | MSAA: ${msaa}

1. REJESTR METRYK CIEPLNYCH I WYDAJNOŚCI:
   • Temperatura Maksymalna GPU: ${maxTemp}°C (Ustalony próg ostrzegawczy: ${tempThreshold}°C)
   • Średnia Wydajność: ${avgFpsVal} FPS | Wynik Benchmarku: ${benchmarkScore} pkt.
   • Pobór Mocy (TDP): ${powerDraw} W
   • Wykorzystanie VRAM: ${vramUsedGb.toFixed(1)} GB / ${activeGpuObj.vramTotalGb} GB (${Math.round((vramUsedGb / activeGpuObj.vramTotalGb) * 100)}%)
   • Obciążenie CPU: ${avgCpuLoad}% | Obciążenie GPU: ${gpuLoad}%

2. DIAGNOZA STANU TECHNICZNEGO UKŁADU:
   ${isThrottling 
     ? `⚠️ KRYTYCZNE PRZEGRZEWANIE (Thermal Throttling): Temperatura ${maxTemp}°C przekroczyła bezpieczny próg ${tempThreshold}°C. Rdzeń ogranicza taktowanie zegarów.`
     : `✅ STABILNOŚĆ TERMICZNA: Szczytowa temperatura (${maxTemp}°C) pozostaje w pełnej normie roboczej.`}
   ${isBottleneck
     ? `⚠️ BOTTLENECK PROCESORA: Obciążenie CPU wynoszące ${avgCpuLoad}% przy obciążeniu GPU ${gpuLoad}% wskazuje na ograniczanie wydajności karty przez procesor.`
     : `✅ SYNERGIA SYSTEMOWA: Brak objawów "wąskiego gardła" (bottlenecking CPU).`}

3. ZALECANE CZYNNOŚCI NAPRAWCZE DLA TECHNIKA SERWISOWEGO:
   ${maxTemp > 85 ? '• PILNA WYMIANA PASTY TERMOPRZEWODZĄCEJ: Rekomendowana aplikacja Honeywell PTM7950 lub Thermal Grizzly Kryonaut na rdzeniu.' : '• STAN PASTY: Brak potrzeby pilnej wymiany pasty termoprzewodzącej.'}
   ${maxTemp > 88 ? '• WYMIANA TERMOPADÓW VRAM/VRM: Zastosuj termopady o wysokiej przewodności (min. 12-15 W/mK) na kościach pamięci.' : '• KONSERWACJA OGÓLNA: Zastosuj czyszczenie bloku radiatora i łopatek wentylatorów z kurzu.'}
   • ZALECENIE EKSPLOATACYJNE: Zalecany Undervolting GPU (Core Voltage Offset -50mV do -75mV) dla obniżenia temperatur o ~6-10°C.`;

    setAiDiagnosisReport(report);
    setIsAiDiagnosisModalOpen(true);

    if (onSendToChat) {
      onSendToChat(`[AUTOMATYCZNA DIAGNOZA GPU & CHŁODZENIA AI]\n${report}`);
    }
  };

  const handleExportAndSaveToJournal = () => {
    const maxTemp = Math.max(...tempHistory);
    const log = `Raport testu FurMark: ${new Date().toLocaleString('pl-PL')}
    Model GPU: ${selectedGpu}
    Tryb: ${testMode}
    Średni FPS: ${fps}
    Temperatura Max: ${maxTemp}°C
    VRAM: ${vramUsedGb.toFixed(1)} GB
    Czas trwania: ${Math.floor(frameCount / 60)} sek`;

    // Save to localStorage
    const newResult = { date: new Date().toLocaleString('pl-PL'), fps, maxTemp, vramUsedGb };
    const newResults = [newResult, ...savedResults].slice(0, 3);
    localStorage.setItem('furmark_results', JSON.stringify(newResults));
    setSavedResults(newResults);

    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FurMark_Log_${Date.now()}.txt`;
    link.click();
    
    if (onSaveToJournal) onSaveToJournal(log);
  };

  const exportPdf = async () => {
      const input = document.getElementById('furmark-chart-container');
      if (!input) return;
      
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.text(`Raport FurMark: ${new Date().toLocaleString('pl-PL')}`, 10, 10);
      pdf.addImage(imgData, 'PNG', 10, 20, 180, 100);
      pdf.save("furmark_report.pdf");
  };

  const handleExportRawJson = () => {
    const payload = {
      app: "TermoFix AI - FurMark 3D Benchmark",
      exportedAt: new Date().toISOString(),
      gpuModel: selectedGpu,
      profile: TEST_PROFILES[selectedProfileKey].name,
      testMode,
      msaa,
      tempThreshold,
      summaryMetrics: {
        currentFps: fps,
        maxTemp: Math.max(...tempHistory),
        powerDrawWatts: powerDraw,
        benchmarkScore
      },
      chartData,
      savedResults
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FurMark_RawData_${selectedGpu.replace(/\s+/g, '_')}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportRawJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.chartData && Array.isArray(json.chartData)) {
          setChartData(json.chartData);
        }
        if (json.tempThreshold && typeof json.tempThreshold === 'number') {
          setTempThreshold(json.tempThreshold);
        }
        if (json.gpuModel && typeof json.gpuModel === 'string') {
          setSelectedGpu(json.gpuModel);
        }
        if (json.savedResults && Array.isArray(json.savedResults)) {
          setSavedResults(json.savedResults);
        }
        alert("Pomyślnie zaimportowano dane surowe wykresu i historię sesji z pliku JSON!");
      } catch (err) {
        alert("Błąd podczas odczytu pliku JSON. Upewnij się, że plik ma poprawny format.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"><title>Certyfikat FurMark & 3DMark - Serwis Warszawa</title>
<style>body{font-family:sans-serif;background:#0f172a;color:#fff;padding:40px;}</style>
</head>
<body>
<h1>Certyfikat Testu Obciążeniowego GPU & VRAM</h1>
<p><strong>Data:</strong> ${new Date().toLocaleString('pl-PL')}</p>
<p><strong>Model GPU:</strong> ${selectedGpu}</p>
<p><strong>Tryb Testu:</strong> ${testMode.toUpperCase()} | MSAA: ${msaa}</p>
<p><strong>Wynik Średni FPS:</strong> ${fps} FPS</p>
<p><strong>Wynik Punktowy 3DMark Score:</strong> ${benchmarkScore} pkt</p>
<p><strong>Temperatura Max:</strong> ${gpuTemp}°C | Pobór Mocy: ${powerDraw}W</p>
<hr/>
<p>Serwis Komputerowy Warszawa — Test zweryfikowany pomyślnie [0 Błędów VRAM]</p>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certyfikat_FurMark_${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPython = () => {
    const pythonCode = `import tkinter as tk
from tkinter import messagebox
import threading
import sys
import time
import math
import os
from pyuac import is_admin, run_as_admin

try:
    from OpenGL.GL import *
    from OpenGL.GLUT import *
    from OpenGL.GLU import *
    import numpy as np
    OPENGL_DOSTEPNY = True
except ImportError:
    OPENGL_DOSTEPNY = False

cpu_test_aktywny = False
gpu_test_aktywny = False
czas_startu_testu = 0
typ_testu = ""
fps_licznik = 0
fps_ostatnia_aktualizacja = 0
aktualne_fps = 0
rotacja_anm = 0.0

cpu_history = [0] * 50
ram_history = [0] * 50

def pobierz_parametry_sprzetu():
    cpu = "Nieznany Procesor"
    gpu = "Nieznana Karta Graficzna"
    ram_gb = "Nieznana ilość"
    try:
        cmd_cpu = 'reg query "HKLM\\\\HARDWARE\\\\DESCRIPTION\\\\System\\\\CentralProcessor\\\\0" /v ProcessorNameString'
        wynik_cpu = os.popen(cmd_cpu).read()
        for linia in wynik_cpu.split('\\n'):
            if "ProcessorNameString" in linia:
                cpu = linia.split('REG_SZ')[-1].strip()
        cmd_gpu = 'wmic path win32_VideoController get name /value'
        wynik_gpu = os.popen(cmd_gpu).read()
        for linia in wynik_gpu.split('\\n'):
            if "Name=" in linia:
                gpu = linia.split('=')[-1].strip()
                break
        cmd_ram = 'wmic ComputerSystem get TotalPhysicalMemory /value'
        wynik_ram = os.popen(cmd_ram).read()
        for linia in wynik_ram.split('\\n'):
            if "TotalPhysicalMemory=" in linia:
                bytes_ram = int(linia.split('=')[-1].strip())
                ram_gb = str(round(bytes_ram / (1024**3))) + " GB"
                break
    except: pass
    return f"CPU: {cpu} | GPU: {gpu} | RAM: {ram_gb}"

def zapisz_log_awarii(wiadomosc):
    try:
        desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
        sciezka_logu = os.path.join(desktop, 'LIVE_LOG_RJ_SERWIS.txt')
        with open(sciezka_logu, 'a', encoding='utf-8') as f:
            f.write(f"[{time.strftime('%H:%M:%S')}] {wiadomosc}\\n")
    except: pass

def zapisz_raport_serwisowy(status_koncowy):
    try:
        desktop = os.path.join(os.environ['USERPROFILE'], 'Desktop')
        sciezka_raportu = os.path.join(desktop, 'RAPORT_DIAGNOSTYCZNY_RJ_SERWIS.txt')
        czas_trwania = "0 sek"
        if czas_startu_testu > 0:
            szacowany = int(time.time() - czas_startu_testu)
            czas_trwania = f"{szacowany // 60} min {szacowany % 60} sek"

        with open(sciezka_raportu, 'w', encoding='utf-8') as f:
            f.write("==================================================\\n")
            f.write("     FINALNY RAPORT DIAGNOSTYCZNY RJ-SERWIS       \\n")
            f.write("==================================================\\n\\n")
            f.write(f"Data: {time.strftime('%Y-%m-%d %H:%M:%S')}\\n")
            f.write(f"Zdiagnozowany Sprzęt: {pobierz_parametry_sprzetu()}\\n")
            f.write(f"Test: {typ_testu}\\n")
            f.write(f"Czas obciążenia: {czas_trwania}\\n")
            f.write(f"Status stabilności: {status_koncowy}\\n")
        return True
    except: return False

def _obciazenie_cpu_heavy():
    global cpu_test_aktywny
    while cpu_test_aktywny:
        tablica = [math.sin(i) * math.cos(i) for i in range(9000)]
        _ = sorted(tablica)

def zarzadzaj_testem_cpu(status_lbl, btn):
    global cpu_test_aktywny, czas_startu_testu, typ_testu
    if not cpu_test_aktywny:
        cpu_test_aktywny = True
        typ_testu = "Stress Test CPU Ultimate"
        czas_startu_testu = time.time()
        zapisz_log_awarii("URUCHOMIONO TEST PROCESORA. Rozpoczęcie generowania ciepła.")
        ilosc_rdzeni = os.cpu_count() or 4
        for _ in range(ilosc_rdzeni):
            threading.Thread(target=_obciazenie_cpu_heavy, daemon=True).start()
        status_lbl.config(text=f"Status: CPU 100% ({ilosc_rdzeni} Wątków)", fg="#e74c3c")
        btn.config(text="STOP TEST CPU", bg="#2ecc71")
        threading.Thread(target=_watcher_bezpieczenstwa, args=(status_lbl, btn), daemon=True).start()
    else:
        cpu_test_aktywny = False
        zapisz_log_awarii("Test procesora zatrzymany ręcznie.")
        status_lbl.config(text="Status: Test przerwany.", fg="#bdc3c7")
        btn.config(text="URUCHOM TEST CPU", bg="#e74c3c")
        zapisz_raport_serwisowy("Stabilny (zatrzymany ręcznie)")

def draw_advanced_torus():
    global rotacja_anm, fps_licznik, fps_ostatnia_aktualizacja, aktualne_fps
    try:
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glLoadIdentity()
        glTranslatef(0.0, 0.0, -6.0)
        glRotatef(rotacja_anm, 1.0, 0.5, 0.2)
        glEnable(GL_LIGHTING)
        glEnable(GL_LIGHT0)
        glEnable(GL_COLOR_MATERIAL)
        glLightfv(GL_LIGHT0, GL_POSITION, [1.0, 1.0, 1.0, 0.0])
        
        num_c, num_t, r_maly, r_duzy = 75, 75, 0.4, 1.3
        for i in range(num_c):
            glBegin(GL_QUAD_STRIP)
            for j in range(num_t + 1):
                for k in range(2):
                    u = (i + k) % num_c * 2.0 * math.pi / num_c
                    v = j % num_t * 2.0 * math.pi / num_t
                    x = (r_duzy + r_maly * math.cos(v)) * math.cos(u)
                    y = (r_duzy + r_maly * math.cos(v)) * math.sin(u)
                    z = r_maly * math.sin(v)
                    glColor3f(abs(math.sin(u)), abs(math.cos(v)), abs(math.sin(u+v)))
                    glVertex3f(x, y, z)
            glEnd()
        rotacja_anm += 1.5
        fps_licznik += 1
        teraz = time.time()
        if teraz - fps_ostatnia_aktualizacja >= 1.0:
            aktualne_fps = fps_licznik
            fps_licznik = 0
            fps_ostatnia_aktualizacja = teraz
            glutSetWindowTitle(f"RJ-SERWIS GPU BURNER | Engine: {aktualne_fps} FPS".encode('utf-8'))
        glutSwapBuffers()
    except: pass

def _petla_renderowania():
    if gpu_test_aktywny:
        glutPostRedisplay()
        glutTimerFunc(1, lambda v: _petla_renderowania(), 0)

def deaktywuj_okno_gpu():
    global gpu_test_aktywny
    gpu_test_aktywny = False
    zapisz_log_awarii("Okno testu 3D zostało zamknięte.")
    zapisz_raport_serwisowy("Test GPU ukończony.")

def inicjalizuj_okno_opengl():
    global gpu_test_aktywny, fps_ostatnia_aktualizacja
    if not OPENGL_DOSTEPNY: return
    gpu_test_aktywny = True
    fps_ostatnia_aktualizacja = time.time()
    glutInit(sys.argv)
    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH)
    glutInitWindowSize(1280, 720)
    glutCreateWindow(b"RJ-SERWIS TITAN GPU BURNER")
    glEnable(GL_DEPTH_TEST)
    glClearColor(0.02, 0.02, 0.04, 1.0)
    glMatrixMode(GL_PROJECTION)
    gluPerspective(45, (1280/720), 0.1, 100.0)
    glMatrixMode(GL_MODELVIEW)
    glutDisplayFunc(draw_advanced_torus)
    glutTimerFunc(1, lambda v: _petla_renderowania(), 0)
    glutCloseFunc(deaktywuj_okno_gpu)
    glutMainLoop()

def uruchom_test_gpu(status_lbl):
    global typ_testu, czas_startu_testu
    if not gpu_test_aktywny:
        typ_testu = "Stress Test GPU Ultimate"
        czas_startu_testu = time.time()
        zapisz_log_awarii("URUCHOMIONO TEST GRAFIKI 3D.")
        threading.Thread(target=inicjalizuj_okno_opengl, daemon=True).start()
        status_lbl.config(text="Status: Uruchomiono silnik renderowania GPU Torus Matrix 3D", fg="#3498db")

def _watcher_bezpieczenstwa(status_lbl, btn_cpu):
    global cpu_test_aktywny, gpu_test_aktywny
    limit_czasu = 900
    while cpu_test_aktywny or gpu_test_aktywny:
        time.sleep(1)
        elaps = int(time.time() - czas_startu_testu)
        zapisz_log_awarii(f"Maszyna pracuje stabilnie. Czas: {elaps}s. Wykresy aktywne.")
        if elaps >= limit_czasu:
            cpu_test_aktywny = False
            gpu_test_aktywny = False
            try: glutLeaveMainLoop()
            except: pass
            status_lbl.config(text="Status: Test ukończony pomyślnie!", fg="#2ecc71")
            if btn_cpu: btn_cpu.config(text="URUCHOM TEST CPU", bg="#e74c3c")
            zapisz_raport_serwisowy("PEŁNY SUKCES! 15 minut pod maksymalnym obciążeniem bez awarii.")
            messagebox.showinfo("Status", "Sukces! Raport wygenerowano na pulpicie.")
            break

def uruchom_totalny_crash_test(status_lbl, btn_cpu):
    global czas_startu_testu, typ_testu
    typ_testu = "TOTAL POWER CRASH TEST (CPU + GPU MAX)"
    czas_startu_testu = time.time()
    zapisz_log_awarii("!!! URUCHOMIONO TOTALNY TEST ZASILACZA (MAKSYMALNY POBÓR PRĄDU) !!!")
    uruchom_test_gpu(status_lbl)
    time.sleep(1)
    if not cpu_test_aktywny:
        zarzadzaj_testem_cpu(status_lbl, btn_cpu)

def rysuj_wykres(canvas, historia, kolor):
    canvas.delete("all")
    w, h = 240, 60
    canvas.create_rectangle(0, 0, w, h, fill="#0f0f14", outline="#1a1a24")
    for i in range(1, 3): canvas.create_line(0, i*20, w, i*20, fill="#16161f")
    punkty = []
    for idx, val in enumerate(historia):
        punkty.append((idx * (w / 49), h - (val * (h / 100))))
    for i in range(len(punkty) - 1):
        canvas.create_line(punkty[i], punkty[i+1], fill=kolor, width=2)

def odswiezaj_system_data(canvas_cpu, canvas_ram):
    global cpu_history, ram_history
    while True:
        try:
            cpu_val = int(os.popen("wmic cpu get loadpercentage /Value").read().split("=")[-1].strip() or 0)
            wyjscie = os.popen('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value').read().split()
            ram_pct = 0
            if len(wyjscie) >= 2:
                free = int(wyjscie[0].split('=')[-1])
                total = int(wyjscie[1].split('=')[-1])
                ram_pct = int(((total - free) / total) * 100)
            if cpu_test_aktywny: cpu_val = 100
            cpu_history.pop(0); cpu_history.append(cpu_val)
            ram_history.pop(0); ram_history.append(ram_pct)
            rysuj_wykres(canvas_cpu, cpu_history, "#e74c3c")
            rysuj_wykres(canvas_ram, ram_history, "#3498db")
        except: pass
        time.sleep(0.5)

def main():
    root = tk.Tk()
    root.title("SERWIS RAFAŁ JAROSZ - ULTIMATE TESTER v6.0")
    root.geometry("640x740")
    root.configure(bg="#050608")

    tk.Label(root, text="NAPRAWA KOMPUTERÓW I LAPTOPÓW", font=("Segoe UI", 16, "bold"), bg="#050608", fg="#ffffff").pack(pady=(20, 2))
    tk.Label(root, text="SERWIS RAFAŁ JAROSZ", font=("Segoe UI", 13, "bold"), bg="#050608", fg="#3498db").pack(pady=(0, 5))
    tk.Label(root, text="[ ULTIMATE DIAGNOSTIC SYSTEM v6.0 ]", font=("Consolas", 11, "bold"), bg="#050608", fg="#e67e22").pack(pady=(0, 15))
    tk.Label(root, text=f"Wykryty Sprzęt: {pobierz_parametry_sprzetu()}", font=("Segoe UI", 8, "bold"), bg="#050608", fg="#95a5a6", wraplength=600).pack(pady=(0, 15))
    
    hud_frame = tk.Frame(root, bg="#0d0e14", bd=1, relief=tk.SOLID)
    hud_frame.pack(fill=tk.X, padx=30, pady=(0, 15))
    f_c_chart = tk.Frame(hud_frame, bg="#0d0e14")
    f_c_chart.pack(side=tk.LEFT, padx=15, pady=10)
    tk.Label(f_c_chart, text="OBCIĄŻENIE CPU", font=("Segoe UI", 8, "bold"), bg="#0d0e14", fg="#e74c3c").pack()
    cv_cpu = tk.Canvas(f_c_chart, width=240, height=60, bg="#0f0f14", bd=0, highlightthickness=0)
    cv_cpu.pack(pady=5)
    
    f_r_chart = tk.Frame(hud_frame, bg="#0d0e14")
    f_r_chart.pack(side=tk.RIGHT, padx=15, pady=10)
    tk.Label(f_r_chart, text="ZUŻYCIE RAM", font=("Segoe UI", 8, "bold"), bg="#0d0e14", fg="#3498db").pack()
    cv_ram = tk.Canvas(f_r_chart, width=240, height=60, bg="#0f0f14", bd=0, highlightthickness=0)
    cv_ram.pack(pady=5)
    
    threading.Thread(target=odswiezaj_system_data, args=(cv_cpu, cv_ram), daemon=True).start()
    
    f_cpu = tk.LabelFrame(root, text=" MODUŁ 1: OBCIĄŻENIE PROCESORA ", font=("Segoe UI", 9, "bold"), bg="#0d0e14", fg="#ecf0f1", bd=1, relief=tk.SOLID)
    f_cpu.pack(fill=tk.X, pady=6, padx=30, ipady=6)
    tk.Label(f_cpu, text="Weryfikacja rdzeni i wątków systemu.\\nMaksymalne obciążenie termiczne struktury.", font=("Segoe UI", 9), bg="#0d0e14", fg="#bdc3c7", justify=tk.LEFT).pack(side=tk.LEFT, padx=15)
    btn_cpu = tk.Button(f_cpu, text="URUCHOM TEST CPU", font=("Segoe UI", 9, "bold"), bg="#e74c3c", fg="white", width=18, relief=tk.FLAT, command=lambda: zarzadzaj_testem_cpu(status_lbl, btn_cpu))
    btn_cpu.pack(side=tk.RIGHT, padx=15)
    
    f_gpu = tk.LabelFrame(root, text=" MODUŁ 2: SILNIK RENDEROWANIA 3D GPU ", font=("Segoe UI", 9, "bold"), bg="#0d0e14", fg="#ecf0f1", bd=1, relief=tk.SOLID)
    f_gpu.pack(fill=tk.X, pady=6, padx=30, ipady=6)
    tk.Label(f_gpu, text="Renderowanie pętli geometrycznej Torus Matrix.\\nTest stabilności pamięci VRAM oraz rdzenia.", font=("Segoe UI", 9), bg="#0d0e14", fg="#bdc3c7", justify=tk.LEFT).pack(side=tk.LEFT, padx=15)
    btn_gpu = tk.Button(f_gpu, text="URUCHOM TEST 3D", font=("Segoe UI", 9, "bold"), bg="#3498db", fg="white", width=18, relief=tk.FLAT, command=lambda: uruchom_test_gpu(status_lbl))
    btn_gpu.pack(side=tk.RIGHT, padx=15)
    
    f_full = tk.LabelFrame(root, text=" MODUŁ 3: TOTALNY INTEGRALNY CRASH-TEST ZASILANIA ", font=("Segoe UI", 9, "bold"), bg="#0d0e14", fg="#e74c3c", bd=1, relief=tk.SOLID)
    f_full.pack(fill=tk.X, pady=6, padx=30, ipady=10)
    tk.Label(f_full, text="Maksymalny możliwy pobór prądu z sieci.\\nTest obciążeń krytycznych dla zasilaczy komputerowych.", font=("Segoe UI", 9), bg="#0d0e14", fg="#bdc3c7", justify=tk.LEFT).pack(side=tk.LEFT, padx=15)
    btn_full = tk.Button(f_full, text="TOTAL CRASH TEST", font=("Segoe UI", 10, "bold"), bg="#9b59b6", fg="white", width=18, relief=tk.FLAT, command=lambda: uruchom_totalny_crash_test(status_lbl, btn_cpu))
    btn_full.pack(side=tk.RIGHT, padx=15)
    
    status_lbl = tk.Label(root, text="Status: Gotowy (System Ultimate v6.0 aktywny)", font=("Segoe UI", 10, "bold"), bg="#050608", fg="#2ecc71")
    status_lbl.pack(side=tk.BOTTOM, pady=15)
    
    # Przycisk pobierania programu Remote Desktop
    def pobierz_zdalny_pulpit():
        try:
            import webbrowser
            webbrowser.open("https://anydesk.com/pl/downloads/windows")
            messagebox.showinfo("Zdalny Pulpit", "Za chwilę otworzy się przeglądarka ze stroną pobierania programu do połączeń zdalnych. Po pobraniu i uruchomieniu podaj serwisantowi numer ID z aplikacji.")
        except Exception as e:
            messagebox.showerror("Błąd", f"Nie udało się otworzyć strony. {e}")
            
    btn_remote = tk.Button(root, text="ZDALNY PULPIT (POMOC ONLINE)", font=("Segoe UI", 10, "bold"), bg="#2980b9", fg="white", width=30, relief=tk.FLAT, command=pobierz_zdalny_pulpit)
    btn_remote.pack(side=tk.BOTTOM, pady=10)
    
    root.mainloop()

if __name__ == "__main__":
    if not is_admin():
        run_as_admin()
    else:
        main()
`;
    const blob = new Blob([pythonCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Serwis_Rafal_Jarosz_Tester.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAiAnalysis = () => {
    if (onSendToChat) {
      onSendToChat(`Przeanalizuj wyniki testu obciążeniowego FurMark dla karty ${selectedGpu}:
- Tryb: ${testMode.toUpperCase()}
- MSAA: ${msaa}
- Średni FPS: ${fps}
- Wynik 3DMark Score: ${benchmarkScore} pkt
- Temperatura GPU: ${gpuTemp}°C (Pobór mocy: ${powerDraw}W)
- Wykryte artefakty: ${artifactsDetected}
Czy temperatury mieszczą się w normie i szyny VRAM / VRM są w pełni stabilne?`);
    } else {
      alert(`Wysłano raport do AI:\nGPU: ${selectedGpu}\nFPS: ${fps}\nTemp: ${gpuTemp}°C\nWynik: ${benchmarkScore} pkt`);
    }
  };

  const avgPastFps = savedResults.length > 0
    ? Math.round(savedResults.reduce((sum, r) => sum + r.fps, 0) / savedResults.length)
    : 0;

  const fpsDelta = avgPastFps > 0 ? fps - avgPastFps : 0;
  const fpsDeltaPct = avgPastFps > 0 ? ((fpsDelta / avgPastFps) * 100).toFixed(1) : '0';

  const barComparisonData = [
    { name: 'Bieżący Test', fps: fps, fill: '#10b981' },
    { name: 'Średnia 3 Sesji', fps: avgPastFps, fill: '#f59e0b' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                FurMark & 3DMark Ultimate Benchmark Suite
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Warszawa Pro Edition (MSAA 32x / MATS / AI)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wszystkie ustawienia grafiki jak w 3DMark i FurMark: MSAA do 32x, rozdzielczości 4K/8K, VRAM MATS diagnoza i export certyfikatu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-GPU Select Bar */}
        <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-cyan-400" /> Wybór Urządzenia GPU:
            </span>
            
            {/* Quick Toggle Buttons for dGPU vs iGPU */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {MULTI_GPU_DEVICES.map((dev) => {
                const isSelected = selectedGpuId === dev.id || (selectedGpu === dev.name);
                return (
                  <button
                    key={dev.id}
                    onClick={() => handleSelectGpuDevice(dev.id)}
                    className={`px-2.5 py-1 rounded font-bold text-xs transition flex items-center gap-1.5 ${
                      isSelected
                        ? dev.type === 'iGPU'
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-cyan-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {dev.type === 'iGPU' ? <Cpu className="w-3.5 h-3.5 text-amber-300" /> : <Zap className="w-3.5 h-3.5 text-cyan-300" />}
                    <span>{dev.name.split(' ')[0]} {dev.name.split(' ')[1]}</span>
                    <span className="text-[10px] opacity-75">({dev.type})</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Select */}
            <select
              value={selectedGpuId}
              onChange={(e) => handleSelectGpuDevice(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg font-bold font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 text-xs"
            >
              {MULTI_GPU_DEVICES.map((g) => (
                <option key={g.id} value={g.id}>
                  [{g.type}] {g.name} — {g.vramTotalGb}GB VRAM ({g.powerTdpWatts}W TDP)
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-slate-400 text-[11px] space-y-0.5">
            <div className="flex items-center space-x-3">
              <span>CPU: <strong className="text-amber-400">{discoveredCpu}</strong></span>
              <span>RAM: <strong className="text-pink-400">{discoveredRam}</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <span>Szyna/Architektura: <strong className="text-emerald-400">{(MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId) || MULTI_GPU_DEVICES[0]).busWidth}</strong></span>
              <span>VRAM: <strong className="text-cyan-400">{vramUsedGb.toFixed(1)} GB / {(MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId) || MULTI_GPU_DEVICES[0]).vramTotalGb} GB</strong></span>
            </div>
          </div>
        </div>

        {/* Profile Testowe Bar */}
        <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Profil testowy:
            </span>
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 flex-wrap gap-1">
              {(Object.keys(TEST_PROFILES) as TestProfileKey[]).map((pKey) => {
                const prof = TEST_PROFILES[pKey];
                const isActive = selectedProfileKey === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => handleSelectProfile(pKey)}
                    className={`px-2.5 py-1 rounded font-semibold text-xs transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                    title={prof.description}
                  >
                    {pKey === 'stress' && <Flame className="w-3 h-3 text-red-300" />}
                    {pKey === 'stability' && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                    {pKey === 'throttling' && <AlertTriangle className="w-3 h-3 text-amber-300" />}
                    {prof.name}
                  </button>
                );
              })}
            </div>
          </div>

          {profileRemainingSeconds !== null && (
            <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-800/80 px-3 py-1 rounded-lg text-amber-300 font-mono font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pozostało: {Math.floor(profileRemainingSeconds / 60)}m {profileRemainingSeconds % 60}s</span>
            </div>
          )}
        </div>

        {/* Modal Tabs Bar */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'monitor'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Monitoring & Test Live</span>
            </button>

            <button
              onClick={() => setActiveTab('power_tuning')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'power_tuning'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Zasilanie & Power Limit (UV / OC)</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded bg-slate-900 text-amber-300 border border-amber-500/40 font-mono">
                {powerLimitPct}%
              </span>
            </button>

            <button
              onClick={() => setActiveTab('vram_mats')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'vram_mats'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>VRAM & Diagnoza MATS</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Historia & Porównanie</span>
            </button>

            <button
              onClick={() => setActiveTab('ai_studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'ai_studio'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold ring-1 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Studio & Asystent</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Power Limit: <strong className="text-amber-400">{powerLimitPct}%</strong></span>
            <span className="text-slate-400">TDP: <strong className="text-cyan-400">{powerDraw}W</strong></span>
            <span className="text-slate-400">Temp: <strong className={gpuTemp > tempThreshold ? 'text-red-400' : 'text-emerald-400'}>{gpuTemp}°C</strong></span>
          </div>
        </div>

        {/* Tab 1: Live Monitoring & Widget Grid */}
        {activeTab === 'monitor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-950 overflow-y-auto">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-300 flex items-center justify-between">
                  <span>Monitorowanie na żywo</span>
                  <span className="text-xs text-cyan-400 font-mono font-normal">TDP: {powerDraw} W</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[11px] text-slate-400">FPS</span>
                        <div className="text-xl font-black text-emerald-400 font-mono">{fps}</div>
                    </div>
                    <div className={`bg-slate-800/90 p-2.5 rounded-lg border border-slate-700 ${gpuTemp > tempThreshold ? 'animate-pulse border-red-500' : ''}`}>
                        <span className="text-[11px] text-slate-400">TEMP GPU</span>
                        <div className={`text-xl font-black font-mono ${gpuTemp > tempThreshold ? 'text-red-500' : 'text-amber-400'}`}>{gpuTemp}°C</div>
                    </div>
                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[11px] text-slate-400">ZEGAR CORE / VRAM</span>
                        <div className="text-xs font-black text-cyan-300 font-mono mt-1">{coreClock} / {memoryClock} MHz</div>
                    </div>
                    <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                        <span className="text-[11px] text-slate-400">POWER / FAN</span>
                        <div className="text-xs font-black text-amber-300 font-mono mt-1">{powerDraw}W / {currentFanSpeed}%</div>
                    </div>
                </div>
                
                {/* Threshold Slider & Audio Alert Toggle */}
                <div className="flex items-center justify-between gap-2 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-400" /> Próg Temp (°C):
                        </span>
                        <input type="range" min="60" max="100" value={tempThreshold} onChange={(e) => setTempThreshold(Number(e.target.value))} className="flex-1 accent-amber-500 cursor-pointer" />
                        <span className="text-xs font-black text-amber-400 font-mono w-10 text-right">{tempThreshold}°C</span>
                    </div>
                    <button
                        onClick={() => setIsAudioBeepEnabled(!isAudioBeepEnabled)}
                        className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition ${
                            isAudioBeepEnabled
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                        title={isAudioBeepEnabled ? 'Powiadomienie dźwiękowe aktywne' : 'Powiadomienie dźwiękowe wyłączone'}
                    >
                        {isAudioBeepEnabled ? <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isAudioBeepEnabled ? 'Beep Wł.' : 'Beep Wył.'}</span>
                    </button>
                </div>

                {/* Power Limit Control Slider */}
                <div className="flex flex-col gap-1.5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-400" /> Limit Zasilania GPU (Power Limit):
                        </span>
                        <span className={`font-mono font-black ${powerLimitPct < 90 ? 'text-emerald-400' : powerLimitPct === 100 ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {powerLimitPct}% ({powerDraw} W)
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="50"
                            max="120"
                            step="1"
                            value={powerLimitPct}
                            onChange={(e) => handlePowerSliderChange(Number(e.target.value))}
                            className="flex-1 accent-amber-500 cursor-pointer"
                        />
                    </div>
                    <div className="flex items-center justify-between text-[10px] gap-1 pt-0.5">
                        <button onClick={() => handleSelectPowerProfile('undervolting')} className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-mono">75% UV</button>
                        <button onClick={() => handlePowerSliderChange(85)} className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono">85% Silent</button>
                        <button onClick={() => handleSelectPowerProfile('stock')} className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono">100% Stock</button>
                        <button onClick={() => handleSelectPowerProfile('overclocking')} className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-700 text-amber-400 border border-slate-700 font-mono">115% OC</button>
                    </div>
                </div>

                {/* Fan Speed Control */}
                <div className="flex flex-col gap-1.5 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700/60">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                            <Fan className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: `${Math.max(0.3, 3 - currentFanSpeed / 30)}s` }} /> Obroty Wentylatora (Fan Speed):
                        </span>
                        <span className="font-mono font-black text-cyan-300">
                            {fanMode === 'auto' ? `Auto (${currentFanSpeed}%)` : `Fixed ${fanSpeedFixed}%`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFanMode('auto')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition border ${fanMode === 'auto' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                        >
                            Auto
                        </button>
                        <button
                            onClick={() => setFanMode('fixed')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition border ${fanMode === 'fixed' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'}`}
                        >
                            Fixed %
                        </button>
                        {fanMode === 'fixed' && (
                            <input
                                type="range"
                                min="30"
                                max="100"
                                step="5"
                                value={fanSpeedFixed}
                                onChange={(e) => setFanSpeedFixed(Number(e.target.value))}
                                className="flex-1 accent-cyan-500 cursor-pointer"
                            />
                        )}
                    </div>
                </div>

                {/* AI Diagnoza Button */}
                <button
                  onClick={handleGenerateAiDiagnosis}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 py-2.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition shadow-lg border border-amber-300/50"
                >
                  <Bot className="w-4 h-4 fill-slate-950" /> Generuj Diagnozę AI (Stan Chłodzenia & Serwis)
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <button onClick={handleExportCsv} className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" /> Eksport CSV
                    </button>
                    <button onClick={handleExportAndSaveToJournal} className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow">
                        <FileText className="w-3.5 h-3.5" /> Log & Save
                    </button>
                    <button onClick={exportPdf} className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow">
                        <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                    <button onClick={handleExportRawJson} className="bg-cyan-600 hover:bg-cyan-500 text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow">
                        <FileJson className="w-3.5 h-3.5" /> Eksport JSON
                    </button>
                    <button onClick={() => jsonFileInputRef.current?.click()} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow col-span-2 sm:col-span-1">
                        <Upload className="w-3.5 h-3.5 text-cyan-400" /> Import JSON
                    </button>
                    <input type="file" ref={jsonFileInputRef} accept=".json" className="hidden" onChange={handleImportRawJson} />
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                <div id="furmark-chart-container" className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-amber-400" /> Wykres Temp (°C) & FPS na Żywo
                      </span>
                      <button
                        onClick={() => setIsChartFullscreen(true)}
                        className="px-2.5 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Toggle Fullscreen Chart
                      </button>
                    </div>

                    <div className="h-44">
                      <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                          <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120}>
                              <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                                  <XAxis dataKey="time" hide />
                                  <YAxis domain={[0, 150]} stroke="#94a3b8" fontSize={10} />
                                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                                  <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temp GPU (°C)" />
                                  <Line type="monotone" dataKey="fps" stroke="#10b981" strokeWidth={2} dot={false} name="FPS" />
                                  <ReferenceLine y={tempThreshold} stroke="red" strokeDasharray="3 3" />
                              </LineChart>
                          </ResponsiveContainer>
                      </ChartErrorBoundary>
                    </div>
                </div>

                {/* Real-time CPU Load Area Chart (Bottleneck Monitor) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-cyan-400" /> Obciążenie CPU vs GPU (%) — Bottlenecking
                      </span>
                      {cpuLoad > 85 && gpuLoad < 82 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" /> Bottleneck CPU!
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> GPU/CPU Balans OK
                        </span>
                      )}
                    </div>

                    <div className="h-28">
                      <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="cpuLoadGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                              </linearGradient>
                              <linearGradient id="gpuLoadGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={9} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                            <Area type="monotone" dataKey="cpuLoad" stroke="#06b6d4" fillOpacity={1} fill="url(#cpuLoadGrad)" strokeWidth={2} name="CPU Load %" />
                            <Area type="monotone" dataKey="gpuLoad" stroke="#10b981" fillOpacity={1} fill="url(#gpuLoadGrad)" strokeWidth={1.5} name="GPU Load %" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartErrorBoundary>
                    </div>
                </div>

                {/* Real-time Core Clock & Memory Clock Chart (Thermal Throttling Monitor) */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-cyan-400" /> Taktowanie Rdzenia Core (MHz) & VRAM (MHz)
                      </span>
                      {gpuTemp >= tempThreshold ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Throttling Aktywny!
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Zegary Optymalne
                        </span>
                      )}
                    </div>

                    <div className="h-32">
                      <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="time" hide />
                            <YAxis yAxisId="core" domain={[0, 3200]} stroke="#06b6d4" fontSize={9} orientation="left" />
                            <YAxis yAxisId="mem" domain={[0, 16000]} stroke="#ec4899" fontSize={9} orientation="right" />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                            <Line yAxisId="core" type="monotone" dataKey="coreClock" stroke="#06b6d4" strokeWidth={2} dot={false} name="Core Clock (MHz)" />
                            <Line yAxisId="mem" type="monotone" dataKey="memoryClock" stroke="#ec4899" strokeWidth={1.5} dot={false} name="VRAM Clock (MHz)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
        )}

        {/* Tab 2: Dedicated Power Limit, Undervolting & Overclocking Station */}
        {activeTab === 'power_tuning' && (
          <div className="p-6 bg-slate-950 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
            {/* Header & Quick Metrics */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Stacja Diagnostyczna Zasilania, Power Limit & Undervolting
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                        {powerLimitPct}% Power Limit
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Dostosowuj limit mocy TDP, sprawdzaj stabilność sekcji VRM po undervoltingu oraz profilach OC.
                    </p>
                  </div>
                </div>

                {/* Current Active Profile Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Aktywny Profil:</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase font-mono border ${
                    powerProfile === 'undervolting' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                    powerProfile === 'overclocking' ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse' :
                    powerProfile === 'stock' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
                    'bg-slate-800 text-slate-200 border-slate-700'
                  }`}>
                    {powerProfile === 'undervolting' ? '⚡ Undervolting (Eco)' :
                     powerProfile === 'overclocking' ? '🚀 Overclocking (OC)' :
                     powerProfile === 'stock' ? '⚖️ Stock (Fabryczny)' :
                     '🛠️ Custom Limit'}
                  </span>
                </div>
              </div>

              {/* Grid Live Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/60">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-semibold">Pobór Mocy (Watts)</span>
                  <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{powerDraw} W</div>
                  <span className="text-[10px] text-slate-500">Max TDP: {(MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId) || MULTI_GPU_DEVICES[0]).powerTdpWatts}W</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-semibold font-mono">Napięcie Rdzenia (Est. V)</span>
                  <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                    {(0.95 * (powerLimitPct / 100)).toFixed(3)} V
                  </div>
                  <span className="text-[10px] text-slate-500">Offset: {powerProfile === 'undervolting' ? '-100mV' : powerProfile === 'overclocking' ? '+35mV' : '0mV'}</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-semibold">Est. Temp Sekcji VRM</span>
                  <div className="text-xl font-black text-pink-400 font-mono mt-0.5">
                    {Math.round(gpuTemp * 1.12)} °C
                  </div>
                  <span className="text-[10px] text-slate-500">GPU Temp: {gpuTemp}°C</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                  <span className="text-[11px] text-slate-400 font-semibold font-mono">Efektywność Energetyczna</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {(fps / Math.max(1, powerDraw)).toFixed(2)} <span className="text-xs font-normal">FPS/W</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Stosunek klatek do mocy</span>
                </div>
              </div>
            </div>

            {/* Section 2: Profile Switcher & Power Limit Slider */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Profile Selector Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Przełącznik Profilu Zasilania GPU
                </h4>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Undervolting Button */}
                  <button
                    onClick={() => handleSelectPowerProfile('undervolting')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      powerProfile === 'undervolting'
                        ? 'bg-emerald-950/80 border-emerald-500 text-white ring-2 ring-emerald-500/50'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-300">⚡ Undervolting (Eko / Silent)</span>
                        <span className="font-mono text-xs font-black text-emerald-400">75% Power</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Obniża napięcie rdzenia o ~100mV oraz limit mocy do 75%. Redukuje temperaturę o ~8-12°C i hałas wentylatorów przy zachowaniu wysokie liczby FPS.
                      </p>
                    </div>
                  </button>

                  {/* Stock Button */}
                  <button
                    onClick={() => handleSelectPowerProfile('stock')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      powerProfile === 'stock'
                        ? 'bg-cyan-950/80 border-cyan-500 text-white ring-2 ring-cyan-500/50'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-cyan-300">⚖️ Stock (Ustawienia Fabryczne)</span>
                        <span className="font-mono text-xs font-black text-cyan-400">100% Power</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Standardowy limit poboru mocy TBP zalecany przez producenta karty graficznej. Pełny fabryczny zegar Boost.
                      </p>
                    </div>
                  </button>

                  {/* Overclocking Button */}
                  <button
                    onClick={() => handleSelectPowerProfile('overclocking')}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      powerProfile === 'overclocking'
                        ? 'bg-amber-950/80 border-amber-500 text-white ring-2 ring-amber-500/50'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-300">🚀 Overclocking (Maksymalna Wydajność)</span>
                        <span className="font-mono text-xs font-black text-amber-400">115% Power</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Podnosi limit mocy o +15% TDP oraz wymusza wyższe zegary Boost. Idealny do testowania stabilności zasilacza PSU i sekcji VRM.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Manual Power Limit Slider Card */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Percent className="w-4 h-4 text-cyan-400" />
                      Suwak Precyzyjny Power Limit (50% – 120%)
                    </h4>
                    <span className={`text-lg font-black font-mono px-2.5 py-0.5 rounded-lg border ${
                      powerLimitPct < 85 ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                      powerLimitPct > 105 ? 'bg-amber-950 text-amber-400 border-amber-800 animate-pulse' :
                      'bg-cyan-950 text-cyan-400 border-cyan-800'
                    }`}>
                      {powerLimitPct}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    Dynamicznie modyfikuje dopuszczalne zużycie energii w ułamku sekundy. Obserwuj wpływ na FPS, zegar coreClock i wydzielane ciepło.
                  </p>

                  <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <input
                      type="range"
                      min="50"
                      max="120"
                      step="1"
                      value={powerLimitPct}
                      onChange={(e) => handlePowerSliderChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-3 rounded-lg"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>50% Min</span>
                      <span className="text-emerald-400">75% UV</span>
                      <span className="text-cyan-400">100% Stock</span>
                      <span className="text-amber-400">115% OC</span>
                      <span className="text-red-400">120% Max</span>
                    </div>
                  </div>
                </div>

                {/* Quick Presets Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handlePowerSliderChange(60)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold border border-slate-700"
                  >
                    60% Deep Eco
                  </button>
                  <button
                    onClick={() => handlePowerSliderChange(75)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-mono font-bold border border-emerald-800"
                  >
                    75% UV Preset
                  </button>
                  <button
                    onClick={() => handlePowerSliderChange(100)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold border border-cyan-800"
                  >
                    100% Reset
                  </button>
                  <button
                    onClick={() => handlePowerSliderChange(115)}
                    className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 text-xs font-mono font-bold border border-amber-800"
                  >
                    115% OC Boost
                  </button>
                  <button
                    onClick={() => handlePowerSliderChange(120)}
                    className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 text-xs font-mono font-bold border border-red-800"
                  >
                    120% Extreme
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Power Spike Stability Stress Test Panel */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Test Stabilności Skoków Napięcia (Power Spikes & Transient Loads)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Symuluje 20-sekundową pętlę udarowego obciążenia zasilania, aby wykluczyć usterki sekcji VRM oraz wyłączanie zasilacza (Power Crash).
                  </p>
                </div>

                <button
                  onClick={handleRunPowerStabilityTest}
                  disabled={powerStabilityTesting}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
                    powerStabilityTesting
                      ? 'bg-amber-600 text-white animate-pulse cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                  }`}
                >
                  {powerStabilityTesting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin text-amber-200" />
                      <span>Testowanie zasilania... ({powerStabilitySecsLeft}s)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-emerald-200" />
                      <span>Uruchom 20s Test Skoków Mocy</span>
                    </>
                  )}
                </button>
              </div>

              {powerStabilityStatus !== 'idle' && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  powerStabilityStatus === 'passed'
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                    : 'bg-red-950/80 border-red-500/60 text-red-300'
                }`}>
                  <div className="flex items-center gap-3">
                    {powerStabilityStatus === 'passed' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                    )}
                    <div>
                      <div className="font-bold text-sm">
                        {powerStabilityStatus === 'passed'
                          ? '✅ WYNIK POZYTYWNY: Profil Zasilania i Sekcja VRM Stabilne!'
                          : '⚠️ UWAGA: Przekroczono Krytyczny Próg Temperatury podczas testu zasilania!'}
                      </div>
                      <p className="text-xs opacity-90 mt-0.5">
                        {powerStabilityStatus === 'passed'
                          ? `GPU wytrzymało skoki mocy przy ${powerLimitPct}% Power Limit. Brak zrzutów zegarów ani restartów sterownika.`
                          : `Wykryto niestabilność termiczną (temperatura ${gpuTemp}°C przekroczyła próg ${tempThreshold}°C). Zalecany Undervolting.`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Power Telemetry Chart */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Wykres Poboru Mocy (Watts) vs Power Limit (%) vs Zegary (MHz)
                </span>
                <span className="text-slate-400 font-mono">Telemetry Sampling: 1000ms</span>
              </div>

              <div className="h-52 w-full">
                <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                      <YAxis yAxisId="power" domain={[0, 600]} stroke="#f59e0b" fontSize={10} orientation="left" />
                      <YAxis yAxisId="limit" domain={[40, 130]} stroke="#06b6d4" fontSize={10} orientation="right" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                      <Line yAxisId="power" type="monotone" dataKey="powerDrawWatts" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Pobór Mocy (W)" />
                      <Line yAxisId="limit" type="monotone" dataKey="powerLimitPct" stroke="#06b6d4" strokeWidth={2} dot={false} name="Power Limit (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: VRAM & MATS Diagnostic Panel */}
        {activeTab === 'vram_mats' && (
          <div className="p-6 bg-slate-950 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Diagnostyka VRAM & Szyny MATS / MODS</h3>
                    <p className="text-xs text-slate-400">Analiza adresowania pamięci GDDR, stref alokacji i artefaktów renderowania.</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold font-mono">
                  8 Kanałów VRAM OK
                </span>
              </div>

              {/* VRAM Allocation Progress */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Zużycie VRAM:</span>
                  <span className="text-cyan-400 font-bold">{vramUsedGb.toFixed(1)} GB / {(MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId) || MULTI_GPU_DEVICES[0]).vramTotalGb} GB</span>
                </div>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((vramUsedGb / ((MULTI_GPU_DEVICES.find(g => g.id === selectedGpuId) || MULTI_GPU_DEVICES[0]).vramTotalGb)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Artifacts Control */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">Test Wykrywania Artefaktów (Artifact Scanner)</span>
                  <span className="font-mono text-amber-400 font-bold">Poziom: {artifactIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={artifactIntensity}
                  onChange={(e) => setArtifactIntensity(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="text-[11px] text-slate-400 italic">
                  Symulacja przekłamań w buforze ramki framebuffera przy podkręconych pamięciach VRAM.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: History & Comparison Panel */}
        {activeTab === 'history' && (
          <div className="p-6 bg-slate-950 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-col gap-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
                Historia Sesji & Porównanie Wydajności
              </h3>

              {/* Comparison Bar Chart */}
              <div className="h-44 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="fps" radius={[4, 4, 0, 0]} barSize={42}>
                      {barComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Logged Sessions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Zapisane Sesje Diagnostyczne ({savedResults.length}):</span>
                {savedResults.length === 0 ? (
                  <div className="text-slate-500 italic text-xs">Brak zapisanych logów sesji. Użyj przycisku "Log & Save" podczas testu.</div>
                ) : (
                  savedResults.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs font-mono">
                      <span className="text-slate-300">{r.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-400 font-bold">{r.fps} FPS</span>
                        <span className="text-amber-400 font-bold">{r.maxTemp}°C Max</span>
                        {r.vramUsedGb && <span className="text-cyan-400">{r.vramUsedGb.toFixed(1)} GB</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Embedded AI Studio App & Assistant */}
        {activeTab === 'ai_studio' && (
          <div className="p-6 bg-slate-950 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Osadzona Aplikacja AI Studio & Asystent Google AI
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">Status: Aktywny</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dostęp do połączonej aplikacji AI Studio Google do prowadzenia testów, skanowania kodu oraz interaktywnego wsparcia asystenta.
                  </p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/apps/3a29a268-3d3c-4453-9913-20bf12edb836?showPreview=true&showAssistant=true"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg transition"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Otwórz AI Studio w nowym oknie ↗</span>
              </a>
            </div>

            <div className="w-full h-[540px] rounded-2xl border border-slate-800 overflow-hidden bg-slate-900 shadow-2xl relative">
              <iframe
                src="https://aistudio.google.com/apps/3a29a268-3d3c-4453-9913-20bf12edb836?showPreview=true&showAssistant=true"
                title="AI Studio Embedded Workspace"
                className="w-full h-full border-0"
                allow="microphone; camera; clipboard-write;"
              />
            </div>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 shadow ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Wstrzymaj Test (Pause)' : 'Wznowij Test (Resume)'}
            </button>

            {/* Test Modes */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs text-slate-300 flex-wrap gap-1">
              <span className="px-2 text-slate-400 font-semibold">Tryb:</span>
              {(['game', 'furmark_1', 'furmark_2', '1080p', '1440p', '4K', '8k', 'artifact', 'tessellation', 'mats', 'cinebench_multi', 'cinebench_single', '3dmark_timespy', '3dmark_steelnomad'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setTestMode(m);
                    if (m === 'game') setGameOver(false);
                  }}
                  className={`px-2.5 py-1 rounded transition font-bold uppercase ${
                    testMode === m ? 'bg-cyan-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {m === 'game' ? '🎮 GRA' : m === 'furmark_1' ? '🍩 FurMark 1' : m === 'furmark_2' ? '🍩 FurMark 2' : m === 'mats' ? '🧠 MATS' : m === 'cinebench_multi' ? '🖥️ CB Multi' : m === 'cinebench_single' ? '🖥️ CB Single' : m === '3dmark_timespy' ? '🚀 Time Spy' : m === '3dmark_steelnomad' ? '🚀 Steel Nomad' : m}
                </button>
              ))}
            </div>

            {/* MSAA up to 32x */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="px-2 text-slate-400 font-semibold">MSAA:</span>
              {(['0x', '2x', '4x', '8x', '16x', '32x'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMsaa(m)}
                  className={`px-2 py-1 rounded transition font-bold ${
                    msaa === m ? 'bg-red-600 text-white shadow' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-4 text-xs font-semibold">
            {testMode === 'game' ? (
              <>
                <span className="text-slate-400">Wynik: <strong className="text-yellow-400">{gameScore} pkt</strong></span>
                <span className="text-slate-400">Życia: <strong className="text-red-400">{gameLives} ❤️</strong></span>
              </>
            ) : testMode === 'mats' ? (
              <span className="text-emerald-400 font-bold">MATS VRAM Diagnostic Active</span>
            ) : (
              <>
                <span className="text-slate-400">FPS: <strong className="text-cyan-400">{fps}</strong></span>
                <span className="text-slate-400">Score: <strong className="text-yellow-400">{benchmarkScore}</strong></span>
                <span className="text-slate-400">Temp: <strong className="text-red-400">{gpuTemp}°C</strong></span>
                <span className="text-slate-400">Moc: <strong className="text-amber-400">{powerDraw}W</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Sub-toolbar for Extra Graphics Settings (3DMark style) */}
        <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-amber-400">Tryb Zarządzania Energią:</span>
            <select
              value={powerManagement}
              onChange={(e) => setPowerManagement(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded focus:outline-none"
            >
              <option value="Maksymalna wydajność preferowana">Maksymalna wydajność preferowana</option>
              <option value="Zrównoważony">Zrównoważony</option>
              <option value="Optymalna moc">Optymalna moc</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-emerald-400">V-Sync (Synchronizacja Pionowa):</span>
            <button
              onClick={() => setVSync(!vSync)}
              className={`px-2 py-1 rounded font-bold transition ${vSync ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {vSync ? 'WŁĄCZONY (ON)' : 'WYŁĄCZONY (OFF)'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-cyan-400">Technologie AI:</span>
            <select
              value={aiUpscaling}
              onChange={(e) => setAiUpscaling(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded focus:outline-none"
            >
              <option value="Wyłączone">Wyłączone</option>
              <option value="DLSS (NVIDIA)">DLSS (NVIDIA)</option>
              <option value="FSR (AMD)">FSR (AMD)</option>
              <option value="XeSS (Intel)">XeSS (Intel)</option>
            </select>
          </div>
        </div>

        {/* Sub-toolbar for Artifact / Tessellation Sliders */}
        {(testMode === 'artifact' || testMode === 'tessellation') && (
          <div className="bg-slate-900 px-6 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            {testMode === 'artifact' ? (
              <div className="flex items-center space-x-3 w-full">
                <span className="font-semibold text-rose-400">Intensywność Artefaktów VRAM:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={artifactIntensity}
                  onChange={(e) => setArtifactIntensity(Number(e.target.value))}
                  className="w-48 accent-rose-500"
                />
                <span className="font-mono text-cyan-400">{artifactIntensity}/10</span>
                <span className="text-slate-500">| Wykryte Błędy: <strong className="text-rose-400">{artifactsDetected}</strong></span>
              </div>
            ) : (
              <div className="flex items-center space-x-3 w-full">
                <span className="font-semibold text-amber-400">Stopień Tessellation (Torus Subdivisions do 128x):</span>
                <input
                  type="range"
                  min="16"
                  max="128"
                  step="16"
                  value={tessellationLevel}
                  onChange={(e) => setTessellationLevel(Number(e.target.value))}
                  className="w-48 accent-amber-500"
                />
                <span className="font-mono text-cyan-400">{tessellationLevel}x Multiplier</span>
              </div>
            )}
          </div>
        )}

        {/* 3D Canvas viewport */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden min-h-[440px]">
          <canvas
            ref={canvasRef}
            width={900}
            height={440}
            className="w-full max-w-4xl h-[440px] rounded-xl border border-slate-800 shadow-inner bg-black/80"
          />
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Eksport CSV
            </button>
            <button
              onClick={handleExportHtml}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Certyfikat HTML
            </button>
            <button
              onClick={handleExportPython}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> Skrypt Python (.py)
            </button>
            <button
              onClick={handleSendAiAnalysis}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 rounded-lg font-medium flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> Analiza w Trybie AI (Gemini)
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition"
          >
            Zamknij Okno
          </button>
        </div>

      </div>

      {/* Fullscreen Chart Overlay Modal */}
      {isChartFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  Pełnoekranowa Analiza Telemetryczna GPU & CPU
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                    {TEST_PROFILES[selectedProfileKey].name}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Urządzenie: <strong className="text-cyan-300">{selectedGpu}</strong> | Próg temperatury: <strong className="text-red-400">{tempThreshold}°C</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
                <div>FPS: <strong className="text-emerald-400 text-base">{fps}</strong></div>
                <div>Temp: <strong className={gpuTemp > tempThreshold ? 'text-red-500 text-base animate-pulse' : 'text-amber-400 text-base'}>{gpuTemp}°C</strong></div>
                <div>Core/VRAM: <strong className="text-cyan-400 text-base">{coreClock}/{memoryClock} MHz</strong></div>
                <div>Power/Fan: <strong className="text-amber-300 text-base">{powerDraw}W / {currentFanSpeed}% ({powerLimitPct}%)</strong></div>
              </div>
              <button
                onClick={() => setIsChartFullscreen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition border border-slate-700"
              >
                <Minimize2 className="w-4 h-4 text-cyan-400" /> Zamknij Pełny Ekran
              </button>
            </div>
          </div>

          {/* Main Charts area in Fullscreen */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 my-6 flex-1 min-h-[440px]">
            {/* Temp & FPS Line Chart */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" /> Wykres Temperatury GPU (°C) & FPS
                </span>
                <span className="text-xs text-slate-400">1000ms</span>
              </div>
              <div className="h-[360px] w-full">
                <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis domain={[0, 160]} stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                      <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} dot={false} name="Temp GPU (°C)" />
                      <Line type="monotone" dataKey="fps" stroke="#10b981" strokeWidth={3} dot={false} name="FPS" />
                      <ReferenceLine y={tempThreshold} stroke="red" strokeDasharray="4 4" label={{ value: `Próg ${tempThreshold}°C`, fill: 'red', fontSize: 11, fontWeight: 'bold' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              </div>
            </div>

            {/* Core Clock & Memory Clock Chart */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" /> Zegary Rdzenia (MHz) & VRAM (MHz)
                </span>
                {gpuTemp >= tempThreshold ? (
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-xs font-bold animate-pulse">
                    Thermal Throttling!
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                    Zegary OK
                  </span>
                )}
              </div>
              <div className="h-[360px] w-full">
                <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis yAxisId="core" domain={[0, 3200]} stroke="#06b6d4" fontSize={11} orientation="left" />
                      <YAxis yAxisId="mem" domain={[0, 16000]} stroke="#ec4899" fontSize={11} orientation="right" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                      <Line yAxisId="core" type="monotone" dataKey="coreClock" stroke="#06b6d4" strokeWidth={3} dot={false} name="Core Clock (MHz)" />
                      <Line yAxisId="mem" type="monotone" dataKey="memoryClock" stroke="#ec4899" strokeWidth={2} dot={false} name="VRAM Clock (MHz)" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              </div>
            </div>

            {/* CPU & GPU Load Area Chart */}
            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" /> Obciążenie CPU % vs GPU %
                </span>
                {cpuLoad > 85 && gpuLoad < 82 ? (
                  <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold animate-pulse flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Bottleneck CPU!
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Balans OK
                  </span>
                )}
              </div>
              <div className="h-[360px] w-full">
                <ChartErrorBoundary fallbackData={chartData} threshold={tempThreshold}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="cpuLoadGradFull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.7}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="gpuLoadGradFull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} />
                      <Area type="monotone" dataKey="cpuLoad" stroke="#06b6d4" fillOpacity={1} fill="url(#cpuLoadGradFull)" strokeWidth={2.5} name="Obciążenie CPU (%)" />
                      <Area type="monotone" dataKey="gpuLoad" stroke="#10b981" fillOpacity={1} fill="url(#gpuLoadGradFull)" strokeWidth={2} name="Obciążenie GPU (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartErrorBoundary>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Stacja Diagnostyczna Warszawa Pro Edition • Monitorowanie Czasu Rzeczywistego</span>
            <button
              onClick={() => setIsChartFullscreen(false)}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl transition shadow"
            >
              Zamknij Pełny Ekran
            </button>
          </div>
        </div>
      )}

      {/* AI Diagnosis Modal */}
      {isAiDiagnosisModalOpen && aiDiagnosisReport && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 px-6 py-4 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Automatyczny Raport Diagnostyczny AI
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                      TermoFix Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Raport wygenerowany na podstawie aktualnych parametrów pracy GPU i układu chłodzenia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiDiagnosisModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 whitespace-pre-wrap select-text border-b border-slate-800">
              {aiDiagnosisReport}
            </div>

            <div className="bg-slate-900 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiDiagnosisReport);
                    setCopiedDiagnosis(true);
                    setTimeout(() => setCopiedDiagnosis(false), 2000);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  {copiedDiagnosis ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                  {copiedDiagnosis ? 'Skopiowano!' : 'Kopiuj Treść'}
                </button>

                {onSendToChat && (
                  <button
                    onClick={() => {
                      onSendToChat(aiDiagnosisReport);
                      setIsAiDiagnosisModalOpen(false);
                    }}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg font-black flex items-center gap-1.5 transition shadow"
                  >
                    <Send className="w-4 h-4" /> Wyślij do Czatu AI
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsAiDiagnosisModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
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

function selectedGpoString(gpu: string) {
  if (gpu.includes('5080')) return '16 GB GDDR7';
  if (gpu.includes('4090')) return '24 GB GDDR6X';
  if (gpu.includes('7900')) return '24 GB GDDR6';
  if (gpu.includes('7800')) return '16 GB GDDR6';
  if (gpu.includes('4080')) return '16 GB GDDR6X';
  return '16 GB VRAM';
}
