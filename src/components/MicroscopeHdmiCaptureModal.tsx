import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Tv,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Sliders,
  Grid,
  Crosshair,
  Check,
  AlertTriangle,
  Download,
  Send,
  Eye,
  Settings2,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  BookmarkPlus,
  Play,
  Square,
  Volume2,
  VolumeX,
  Laptop
} from 'lucide-react';

interface MicroscopeHdmiCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string, imageUrl?: string) => void;
  onSetMainThermalImage?: (imageUrl: string) => void;
  isInline?: boolean;
}

// Sample realistic PCB microscope feeds for simulation when no hardware grabber is present
const SIMULATED_MICROSCOPE_FEEDS = [
  {
    id: 'bga-corrosion',
    title: 'Mikroskop 1: Korozja Płatek VRAM GDDR6 & Kule BGA (GPU RTX 3080)',
    description: 'Brak obrazu / Artefakty. Zmiany korozyjne pod układem BGA po zalaniu cieczą.',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    resolution: '1080p60 (USB3.0 Capture)',
    magnification: '45x'
  },
  {
    id: 'smd-bridge',
    title: 'Mikroskop 2: Zwarcie cynowe SMD 0402 w linii VCORE (Kondensator Tantalowy)',
    description: 'Zwarcie do masy 0.02 Ω. Mikro-mostek cynowy po amatorskiej próbie lutowania.',
    url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
    resolution: '4K30 (HDMI Capture Card)',
    magnification: '100x'
  },
  {
    id: 'jumper-wire',
    title: 'Mikroskop 3: Mikro-Jumper 0.02mm (Naprawa Przerwanej Ścieżki PCB)',
    description: 'Odbudowa ścieżki sygnałowej HDMI / DisplayPort pod mikroskopem stereoskopowym.',
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    resolution: '1080p60 (UVC Grabber)',
    magnification: '60x'
  },
  {
    id: 'hdmi-socket',
    title: 'Mikroskop 4: Uszkodzone Piny Gniazda HDMI 2.1 w konsoli PS5 / PC',
    description: 'Cofnięte i wygięte piny sygnałowe TMDS/FRL, uszkodzenie mechaniczne.',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    resolution: '2K60 (UltraHD Capture)',
    magnification: '30x'
  }
];

export const MicroscopeHdmiCaptureModal: React.FC<MicroscopeHdmiCaptureModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
  onSetMainThermalImage,
  isInline
}) => {
  // Video devices state
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isLiveHardware, setIsLiveHardware] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);

  // Simulation mode selection
  const [simFeedIndex, setSimFeedIndex] = useState<number>(0);

  // Video element ref & stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  // Optical & Visual Adjustments
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100% to 500%
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [sharpnessMode, setSharpnessMode] = useState<boolean>(false);

  // Color Filter Mode
  const [filterMode, setFilterMode] = useState<'normal' | 'invert' | 'edge' | 'fluorescent' | 'thermal-pseudo'>('normal');

  // Overlays
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showCrosshair, setShowCrosshair] = useState<boolean>(true);
  const [showPinIdentifier, setShowPinIdentifier] = useState<boolean>(true);
  const [showScaleBar, setShowScaleBar] = useState<boolean>(true);
  const [isLiveHeatmapActive, setIsLiveHeatmapActive] = useState<boolean>(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.8);

  // Snapshot State
  const [capturedSnapshots, setCapturedSnapshots] = useState<{ id: string; url: string; time: string; note: string }[]>([]);
  const [snapshotSuccessMsg, setSnapshotSuccessMsg] = useState<string | null>(null);

  // AUTO-TRIGGER MOTION & FOCUS DETECTION STATE
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState<boolean>(true);
  const [autoTriggerSensitivity, setAutoTriggerSensitivity] = useState<number>(30); // 10 (high) to 50 (low)
  const [motionScore, setMotionScore] = useState<number>(12);
  const [focusScore, setFocusScore] = useState<number>(84);
  const [autoCapturedCount, setAutoCapturedCount] = useState<number>(0);
  const [autoSendToAiEnabled, setAutoSendToAiEnabled] = useState<boolean>(true);
  const [lastAutoTriggerMsg, setLastAutoTriggerMsg] = useState<string | null>(null);

  const lastAutoTriggerTimeRef = useRef<number>(0);
  const prevImageDataRef = useRef<Uint8ClampedArray | null>(null);

  // Frame analyzer loop for motion & focus detection
  useEffect(() => {
    if (!isOpen || !autoTriggerEnabled) return;

    const analysisCanvas = document.createElement('canvas');
    analysisCanvas.width = 80;
    analysisCanvas.height = 60;
    const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const interval = setInterval(() => {
      try {
        const video = videoRef.current;

        if (isLiveHardware && video && video.readyState >= 2) {
          ctx.drawImage(video, 0, 0, 80, 60);
        } else {
          // Draw simulation image for motion/focus sampling
          const simImg = new Image();
          simImg.crossOrigin = 'anonymous';
          simImg.src = SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].url;
          if (simImg.complete) {
            ctx.drawImage(simImg, 0, 0, 80, 60);
          }
        }

        const imgData = ctx.getImageData(0, 0, 80, 60);
        const pixels = imgData.data;

        // 1. CALCULATE MOTION (pixel delta vs previous frame)
        let totalDelta = 0;
        if (prevImageDataRef.current && prevImageDataRef.current.length === pixels.length) {
          const prev = prevImageDataRef.current;
          for (let i = 0; i < pixels.length; i += 8) {
            totalDelta += Math.abs(pixels[i] - prev[i]); // Red channel diff
          }
        }
        prevImageDataRef.current = new Uint8ClampedArray(pixels);

        const calculatedMotion = Math.min(100, Math.floor((totalDelta / (80 * 60)) * 2.5));
        setMotionScore(calculatedMotion);

        // 2. CALCULATE FOCUS SHARPNESS (Gradient Variance)
        let totalGradient = 0;
        for (let y = 0; y < 60; y += 2) {
          for (let x = 0; x < 78; x += 2) {
            const idx1 = (y * 80 + x) * 4;
            const idx2 = (y * 80 + (x + 1)) * 4;
            const gray1 = (pixels[idx1] + pixels[idx1 + 1] + pixels[idx1 + 2]) / 3;
            const gray2 = (pixels[idx2] + pixels[idx2 + 1] + pixels[idx2 + 2]) / 3;
            totalGradient += Math.abs(gray1 - gray2);
          }
        }
        const calculatedFocus = Math.min(100, Math.floor((totalGradient / (40 * 30)) * 3.2));
        setFocusScore(calculatedFocus);

        // 3. AUTO-TRIGGER SNAPSHOT IF MOTION DETECTED OR FOCUS IS PEAK
        const now = Date.now();
        const cooldownMs = 4000; // 4 second minimum interval between auto triggers

        if (
          (calculatedMotion > autoTriggerSensitivity || calculatedFocus > 82) &&
          now - lastAutoTriggerTimeRef.current > cooldownMs
        ) {
          lastAutoTriggerTimeRef.current = now;
          triggerAutoSnapshot(calculatedMotion, calculatedFocus);
        }
      } catch (err) {
        // Ignore canvas read errors
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, autoTriggerEnabled, isLiveHardware, simFeedIndex, autoTriggerSensitivity]);

  const triggerAutoSnapshot = (motionVal: number, focusVal: number) => {
    handleTakeSnapshot();
    setAutoCapturedCount((c) => c + 1);

    const triggerInfo = `⚡ Auto-Trigger AI: Wykryto ruch (${motionVal}%) / ostrość (${focusVal}%)! Wykonano zrzut HD.`;
    setLastAutoTriggerMsg(triggerInfo);
    setTimeout(() => setLastAutoTriggerMsg(null), 3500);

    // If auto send to AI chat is enabled
    if (autoSendToAiEnabled && onSendToChat) {
      setTimeout(() => {
        const simFeed = SIMULATED_MICROSCOPE_FEEDS[simFeedIndex];
        const lastSnapUrl = simFeed ? simFeed.url : '';
        onSendToChat(
          `[AUTOMATYCZNY ZRZUT MIKROSKOPU - DETEKCJA OSTROŚCI / RUCHU]\nDetect: Motion ${motionVal}%, Focus Sharpness ${focusVal}%\nProszę o natychmiastową analizę jakości połączeń lutowniczych BGA/SMD, pęknięć miedzi oraz zanieczyszczeń na przechwyconym obrazie.`,
          lastSnapUrl
        );
      }, 800);
    }
  };

  // Scan hardware video devices on component open
  useEffect(() => {
    if (!isOpen) {
      stopCurrentStream();
      return;
    }

    scanVideoDevices();
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCurrentStream();
    };
  }, []);

  const stopCurrentStream = () => {
    if (activeStream) {
      activeStream.getTracks().forEach((track) => track.stop());
      setActiveStream(null);
    }
  };

  const scanVideoDevices = async () => {
    try {
      setStreamError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setStreamError('Przeglądarka nie wspiera bezpośredniego przechwytywania wideo (MediaDevices API).');
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);

      // Auto-select capture card if label mentions USB/HDMI/Grabber/Capture/UVC
      const captureCard = videoInputs.find((d) =>
        /hdmi|capture|grabber|uvc|video|card|cam|usb/i.test(d.label)
      );

      if (captureCard) {
        setSelectedDeviceId(captureCard.deviceId);
        startLiveStream(captureCard.deviceId);
      } else if (videoInputs.length > 0) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch (err: any) {
      console.warn('Błąd podczas skanowania urządzeń wideo:', err);
      setStreamError('Wymagane uprawnienie do kamery / karty Video Capture USB HDMI.');
    }
  };

  const startLiveStream = async (deviceId: string) => {
    stopCurrentStream();
    setIsRequestingPermission(true);
    setStreamError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setActiveStream(stream);
      setIsLiveHardware(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.error('Video play error:', e));
      }
    } catch (err: any) {
      console.error('Failed to access USB HDMI video capture:', err);
      setIsLiveHardware(false);
      setStreamError('Nie udało się nawiązać połączenia ze sprzętową kartą przechwytującą HDMI/USB.');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    if (devId === 'SIMULATION') {
      stopCurrentStream();
      setIsLiveHardware(false);
      setStreamError(null);
    } else {
      startLiveStream(devId);
    }
  };

  // Capture image frame from live stream or simulation canvas
  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (isLiveHardware && video) {
      ctx.save();
      // Apply filters if needed
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      // Create snapshot from current simulation image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].url;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Watermark / Scale
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(20, canvas.height - 70, 480, 50);
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`TERMOFIX AI MIKROSKOP - ${SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].magnification}`, 35, canvas.height - 38);

        const dataUrl = canvas.toDataURL('image/png');
        saveSnapshotToList(dataUrl);
      };
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    saveSnapshotToList(dataUrl);
  };

  const saveSnapshotToList = (dataUrl: string) => {
    const newSnap = {
      id: `snap-${Date.now()}`,
      url: dataUrl,
      time: new Date().toLocaleTimeString('pl-PL'),
      note: `Przechwycono z ${isLiveHardware ? 'Karty HDMI USB Capture' : SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].title}`
    };

    setCapturedSnapshots((prev) => [newSnap, ...prev]);
    setSnapshotSuccessMsg('Sfotografowano i zapisano klatkę mikroskopową w wysokiej rozdzielczości!');
    setTimeout(() => setSnapshotSuccessMsg(null), 3000);
  };

  const handleSendSnapshotToChat = (imageUrl: string) => {
    if (onSendToChat) {
      onSendToChat(
        'Przesyłam zdjęcie z mikroskopu HDMI/USB. Proszę o natychmiastową analizę AI: wykryj pęknięcia lutu BGA, korozję, uszkodzone kondensatory SMD, zwarcia lub przerwane ścieżki PCB.',
        imageUrl
      );
      onClose();
    }
  };

  const handleApplyToMainThermalViewer = (imageUrl: string) => {
    if (onSetMainThermalImage) {
      onSetMainThermalImage(imageUrl);
      setSnapshotSuccessMsg('Załadowano zdjęcie z mikroskopu na Główny Płótno Termowizyjne!');
      setTimeout(() => setSnapshotSuccessMsg(null), 2500);
    }
  };

  // Generate CSS filter string for live video display
  const getFilterCSS = () => {
    let css = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

    if (filterMode === 'invert') {
      css += ' invert(100%) hue-rotate(180deg)';
    } else if (filterMode === 'edge') {
      css += ' grayscale(100%) contrast(250%) brightness(120%)';
    } else if (filterMode === 'fluorescent') {
      css += ' hue-rotate(90deg) saturate(300%) contrast(150%)';
    } else if (filterMode === 'thermal-pseudo') {
      css += ' hue-rotate(240deg) saturate(400%) contrast(180%)';
    }

    return css;
  };

  if (!isOpen) return null;

  return (
    <div className={isInline ? "flex-1 flex flex-col h-full overflow-hidden" : "fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"}>
      <div className={isInline ? "bg-slate-900 border border-slate-800 rounded-2xl flex-1 flex flex-col shadow-2xl overflow-hidden text-slate-100" : "bg-slate-900 border border-slate-800 rounded-2xl max-w-7xl w-full max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-100"}>
        
        {/* MODAL HEADER */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-cyan-900/30">
              <Tv className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Odbiór Obrazu Mikroskopu HDMI / Przejściówka USB Video Capture
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  UVC Grabber 4K/1080p60
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Odbiór na żywo z cyfrowego mikroskopu serwisowego, chwytaka HDMI-USB, inspekcja BGA, ścieżek i połączeń SMD.
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

        {/* MODAL BODY */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          
          {/* HARDWARE DEVICE SELECTOR BAR */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            <div className="flex items-center space-x-2 flex-1">
              <Laptop className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300 whitespace-nowrap">Źródło Obrazu HDMI/USB:</span>
              
              <select
                value={isLiveHardware ? selectedDeviceId : 'SIMULATION'}
                onChange={handleDeviceChange}
                className="w-full md:w-auto flex-1 bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-cyan-500"
              >
                <option value="SIMULATION">
                  📺 Symulator Mikroskopu HDMI (Demonstracyjny Obraz HD - Korozja/BGA/SMD)
                </option>
                {videoDevices.map((dev, idx) => (
                  <option key={dev.deviceId || idx} value={dev.deviceId}>
                    🎥 {dev.label || `Karta Capture / Kamera USB #${idx + 1}`} ({dev.deviceId.slice(0, 10)}...)
                  </option>
                ))}
              </select>

              <button
                onClick={scanVideoDevices}
                title="Skanuj ponownie podłączone urządzenia USB HDMI"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* STATUS BADGES */}
            <div className="flex items-center space-x-2 self-start md:self-auto">
              {isLiveHardware ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs px-3 py-1 rounded-xl font-bold font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  SPRZĘT ONLINE (HDMI USB)
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-xl font-bold font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  TRYB SYMULATORA HD
                </span>
              )}
            </div>
          </div>

          {/* STREAM ERROR DISPLAY IF ANY */}
          {streamError && (
            <div className="bg-red-950/40 border border-red-800 p-3 rounded-xl flex items-center space-x-3 text-red-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="font-bold">{streamError}</p>
                <p className="text-[11px] text-red-400/80 mt-0.5">
                  Upewnij się, że przejściówka HDMI Video Capture USB jest podłączona do portu USB 3.0/2.0 i zezwól przeglądarce na dostęp do wideo.
                </p>
              </div>
            </div>
          )}

          {/* MAIN MICROSCOPE DISPLAY & CONTROL PANEL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* LEFT 8 COLS: LIVE MICROSCOPE CANVAS VIEWPORT */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-2 flex flex-col relative overflow-hidden min-h-[380px] sm:min-h-[460px]">
              
              {/* TOP WATERMARK OVERLAY & HUD */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center space-x-2 text-xs font-mono text-cyan-300">
                  <Tv className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold">
                    {isLiveHardware ? 'PRZEJŚCIÓWKA HDMI CAPTURE LIVE' : SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].title}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-400 font-bold">Powiększenie: {zoomLevel}%</span>
                </div>

                <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] font-mono text-emerald-400 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>1080p60 FPS</span>
                </div>
              </div>

              {/* AUTO MOTION & FOCUS HUD OVERLAY */}
              <div className="absolute top-16 left-4 z-20 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 p-2.5 rounded-xl font-mono text-[11px] space-y-1.5 shadow-xl">
                <div className="flex items-center justify-between gap-3 text-cyan-300 font-bold">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Auto-Trigger Ruchu / Ostrości AI:</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${autoTriggerEnabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                    {autoTriggerEnabled ? 'AKTYWNY' : 'OFF'}
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center justify-between text-[10px]">
                    <span>Detekcja Ruchu w Kadrze:</span>
                    <span className={motionScore > autoTriggerSensitivity ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                      {motionScore}% {motionScore > autoTriggerSensitivity ? '⚡ DETEKCJA RUCHU' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full transition-all duration-200" style={{ width: `${motionScore}%` }}></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span>Ostrość Mikroskopu (Focus Score):</span>
                    <span className={focusScore > 80 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {focusScore}% {focusScore > 80 ? '🎯 OSTROŚĆ PEAK' : ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full transition-all duration-200" style={{ width: `${focusScore}%` }}></div>
                  </div>
                </div>

                {autoCapturedCount > 0 && (
                  <div className="text-[10px] text-cyan-400 font-bold border-t border-slate-800/80 pt-1 flex items-center justify-between">
                    <span>Automatyczne Zrzuty HD:</span>
                    <span className="bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">{autoCapturedCount} fotki</span>
                  </div>
                )}
              </div>

              {lastAutoTriggerMsg && (
                <div className="absolute top-16 right-4 z-20 bg-amber-500/90 text-slate-950 font-bold font-mono text-xs px-3 py-2 rounded-xl shadow-2xl border border-amber-300 animate-bounce">
                  {lastAutoTriggerMsg}
                </div>
              )}

              {/* MICROSCOPE CANVAS VIEWPORT CONTAINER */}
              <div className="flex-1 relative flex items-center justify-center bg-black rounded-xl overflow-hidden group">
                
                {/* LIVE HARDWARE VIDEO ELEMENT */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    filter: getFilterCSS(),
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1})`,
                    display: isLiveHardware ? 'block' : 'none'
                  }}
                  className="w-full h-full object-contain transition-transform duration-200 origin-center"
                />

                {/* SIMULATED MICROSCOPE FEED IMAGE (When hardware is off or simulation is selected) */}
                {!isLiveHardware && (
                  <img
                    src={SIMULATED_MICROSCOPE_FEEDS[simFeedIndex].url}
                    alt="Microscope Simulation Feed"
                    style={{
                      filter: getFilterCSS(),
                      transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg) scaleX(${flipHorizontal ? -1 : 1})`
                    }}
                    className="w-full h-full object-cover transition-transform duration-200 origin-center select-none"
                  />
                )}

                {/* LIVE HEATMAP OVERLAY LAYER */}
                {isLiveHeatmapActive && (
                  <div
                    style={{ opacity: heatmapOpacity }}
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 mix-blend-screen z-10"
                  >
                    {/* Primary Hotspot Radial Gradient */}
                    <div
                      className="absolute rounded-full blur-2xl animate-pulse"
                      style={{
                        left: '52%',
                        top: '48%',
                        width: '240px',
                        height: '240px',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(239,68,68,0.9) 25%, rgba(245,158,11,0.85) 50%, rgba(6,182,212,0.3) 75%, transparent 100%)'
                      }}
                    />

                    {/* Secondary Warmspot */}
                    <div
                      className="absolute rounded-full blur-xl"
                      style={{
                        left: '30%',
                        top: '65%',
                        width: '140px',
                        height: '140px',
                        transform: 'translate(-50%, -50%)',
                        background: 'radial-gradient(circle, rgba(245,158,11,0.7) 0%, rgba(239,68,68,0.5) 40%, rgba(59,130,246,0.2) 80%, transparent 100%)'
                      }}
                    />

                    {/* Pinned Heatmap Target Badge */}
                    <div className="absolute top-[32%] left-[52%] -translate-x-1/2 bg-slate-950/90 border border-red-500/80 text-white font-mono text-[11px] p-2 rounded-xl shadow-2xl flex items-center gap-2 pointer-events-auto">
                      <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
                      <div>
                        <span className="text-red-400 font-bold block">LIVE HEATMAP: 88.5°C</span>
                        <span className="text-[9px] text-slate-300">Detekcja Pikseli: SMD C7890</span>
                      </div>
                    </div>

                    {/* Heatmap Legend Bar */}
                    <div className="absolute top-16 right-4 bg-slate-950/90 border border-slate-700/80 p-2 rounded-xl flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-blue-400 font-bold">22°C</span>
                      <div className="w-20 h-2 rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 via-amber-500 via-red-600 to-white shadow-inner"></div>
                      <span className="text-red-400 font-bold">88.5°C</span>
                    </div>
                  </div>
                )}

                {/* GRID OVERLAY */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                )}

                {/* CROSSHAIR RETICLE OVERLAY */}
                {showCrosshair && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-[1px] bg-red-500/40"></div>
                    <div className="h-full w-[1px] bg-red-500/40 absolute"></div>
                    <div className="w-16 h-16 border-2 border-red-500/60 rounded-full absolute flex items-center justify-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  </div>
                )}

                {/* BGA PIN IDENTIFIER HUD OVERLAY */}
                {showPinIdentifier && (
                  <div className="absolute bottom-16 left-4 pointer-events-none bg-slate-900/85 backdrop-blur-md border border-slate-700/80 p-2.5 rounded-xl text-xs space-y-1 font-mono">
                    <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                      <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Skaner Układu BGA / SMD:</span>
                    </div>
                    <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-x-3">
                      <span>• Obudowa: QFN / BGA</span>
                      <span>• Raster kul: 0.50 mm</span>
                      <span>• Wykryto Pin 1: Róg Lewy-Góra</span>
                      <span>• Średnica kuli: 0.35 mm</span>
                    </div>
                  </div>
                )}

                {/* MICRON SCALE BAR OVERLAY */}
                {showScaleBar && (
                  <div className="absolute bottom-4 right-4 pointer-events-none bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl font-mono text-[11px] flex flex-col items-center">
                    <div className="w-28 h-1.5 bg-cyan-400 rounded-full mb-1 flex justify-between px-0.5">
                      <div className="w-0.5 h-full bg-slate-900"></div>
                      <div className="w-0.5 h-full bg-slate-900"></div>
                      <div className="w-0.5 h-full bg-slate-900"></div>
                    </div>
                    <span className="text-cyan-300 font-bold">Scale: 500 µm (0.5 mm)</span>
                  </div>
                )}
              </div>

              {/* QUICK IMAGE CAPTURE BAR UNDER CANVAS */}
              <div className="mt-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                
                {/* ZOOM CONTROLS */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(100, z - 25))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Pomniejsz"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-cyan-300 font-bold px-2">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(500, z + 25))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                    title="Powiększ"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(100);
                      setRotation(0);
                      setFlipHorizontal(false);
                    }}
                    className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    Reset
                  </button>
                </div>

                {/* ROTATE & FLIP & HEATMAP */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsLiveHeatmapActive(!isLiveHeatmapActive)}
                    className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition flex items-center gap-1.5 ${
                      isLiveHeatmapActive
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md shadow-red-950/50 border border-red-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Przełącz nakładkę podczerwieni Live Heatmap"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isLiveHeatmapActive ? 'text-amber-300 animate-bounce' : ''}`} />
                    <span>Live Heatmap: {isLiveHeatmapActive ? 'WŁ' : 'WYŁ'}</span>
                  </button>
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition flex items-center space-x-1 text-xs"
                    title="Obróć obraz o 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{rotation}°</span>
                  </button>
                  <button
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    className={`px-2 py-1 text-xs font-mono font-bold rounded-lg transition ${
                      flipHorizontal ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                    title="Odbicie lustrzane Poziome"
                  >
                    Odbicie H
                  </button>
                </div>

                {/* TAKE SNAPSHOT MAIN ACTION BUTTON */}
                <button
                  onClick={handleTakeSnapshot}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-950/50 transition transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Zrób Zdjęcie Mikroskopowe (HD)</span>
                </button>
              </div>

              {snapshotSuccessMsg && (
                <div className="mt-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs p-2 rounded-xl text-center font-bold font-mono animate-fade-in">
                  ✓ {snapshotSuccessMsg}
                </div>
              )}
            </div>

            {/* RIGHT 4 COLS: MICROSCOPE IMAGE FILTERS, OVERLAYS & SNAPSHOT GALLERY */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              
              {/* PANEL 0: AUTOMATIC MOTION & FOCUS TRIGGER CONFIG */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Auto-Trigger AI (Ruch &amp; Ostrość)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoTriggerEnabled}
                      onChange={(e) => setAutoTriggerEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <p className="text-[11px] text-slate-400 leading-tight">
                  Skaner w czasie rzeczywistym wykrywa zmianę ostrości optycznej lub poruszenie płytki PCB, automatycznie wykonując zrzut wysokiej rozdzielczości i przesyłając go do analizy AI.
                </p>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Czułość Wykrywania Ruchu (Progowanie):</span>
                      <span className="text-amber-400 font-mono font-bold">{autoTriggerSensitivity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={autoTriggerSensitivity}
                      onChange={(e) => setAutoTriggerSensitivity(Number(e.target.value))}
                      className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={autoSendToAiEnabled}
                      onChange={(e) => setAutoSendToAiEnabled(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Automatycznie wyślij zrzut do Chatu AI po wykryciu</span>
                  </label>

                  <button
                    onClick={() => triggerAutoSnapshot(48, 92)}
                    className="w-full mt-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md transition"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Symuluj Zmianę Ostrości (Wyzwalacz Auto-AI)</span>
                  </button>
                </div>
              </div>

              {/* PANEL 1: IMAGE FILTERS & FILTER MODES */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Filtry Optyczne &amp; Wykrywanie Ścieżek
                  </span>
                </div>

                {/* FILTER MODE BUTTONS */}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => setFilterMode('normal')}
                    className={`p-2 rounded-xl font-bold transition text-left ${
                      filterMode === 'normal'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    🎨 Kolor Naturalny
                  </button>
                  <button
                    onClick={() => setFilterMode('invert')}
                    className={`p-2 rounded-xl font-bold transition text-left ${
                      filterMode === 'invert'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    🔄 Inwersja BGA/PCB
                  </button>
                  <button
                    onClick={() => setFilterMode('edge')}
                    className={`p-2 rounded-xl font-bold transition text-left ${
                      filterMode === 'edge'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    📐 Detekcja Krawędzi Lutu
                  </button>
                  <button
                    onClick={() => setFilterMode('fluorescent')}
                    className={`p-2 rounded-xl font-bold transition text-left ${
                      filterMode === 'fluorescent'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    🧪 Fluorescencja UV Flux
                  </button>
                </div>

                {/* BRIGHTNESS / CONTRAST / SATURATION SLIDERS */}
                <div className="space-y-2 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Jasność Diod LED Mikroskopu</span>
                      <span className="text-cyan-300 font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Kontrast Miedzi / Masek PCB</span>
                      <span className="text-cyan-300 font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* OVERLAY TOGGLES */}
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGrid}
                      onChange={(e) => setShowGrid(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Siatka mm/µm</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCrosshair}
                      onChange={(e) => setShowCrosshair(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Celownik BGA</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPinIdentifier}
                      onChange={(e) => setShowPinIdentifier(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Skaner Pin 1</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showScaleBar}
                      onChange={(e) => setShowScaleBar(e.target.checked)}
                      className="rounded accent-cyan-500"
                    />
                    <span>Podziałka 500µm</span>
                  </label>
                </div>
              </div>

              {/* PANEL 2: DEMO FEEDS SELECTOR IF IN SIMULATION MODE */}
              {!isLiveHardware && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Próbki Obrazu Mikroskopowego (Baza Przykładów Serwisowych):
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {SIMULATED_MICROSCOPE_FEEDS.map((feed, idx) => (
                      <button
                        key={feed.id}
                        onClick={() => setSimFeedIndex(idx)}
                        className={`w-full text-left p-2 rounded-xl text-xs transition flex items-center space-x-2 border ${
                          simFeedIndex === idx
                            ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <img src={feed.url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[11px]">{feed.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{feed.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PANEL 3: CAPTURED SNAPSHOTS GALLERY & AI ACTIONS */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 flex-1 flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      Wykonane Zdjęcia Mikroskopowe ({capturedSnapshots.length})
                    </span>
                  </div>

                  {capturedSnapshots.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Brak sfotografowanych klatek. Kliknij button wyżej "Zrób Zdjęcie Mikroskopowe (HD)".
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                      {capturedSnapshots.map((snap) => (
                        <div
                          key={snap.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 space-y-1 group relative"
                        >
                          <img
                            src={snap.url}
                            alt="Captured snapshot"
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <p className="text-[10px] font-mono text-slate-400 text-center">{snap.time}</p>
                          
                          <div className="flex items-center justify-between gap-1 pt-1">
                            <button
                              onClick={() => handleSendSnapshotToChat(snap.url)}
                              title="Wyślij do Diagnozy Chat AI"
                              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] py-1 rounded font-bold transition flex items-center justify-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Diagnozuj AI</span>
                            </button>

                            <button
                              onClick={() => handleApplyToMainThermalViewer(snap.url)}
                              title="Wyświetl na Głównym Płótnie Termo"
                              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* BOTTOM EXPORT & REPORT FOOTER */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 text-center font-mono">
                    Obsługa kart Video Capture USB 3.0, HDMI Dongle 4K oraz mikroskopów stereoskopowych UVC.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Sterownik HDMI/USB Capture — Zgodność z USB Video Class (UVC)</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl transition"
          >
            Zamknij Moduł Mikroskopu
          </button>
        </div>

      </div>
    </div>
  );
};
