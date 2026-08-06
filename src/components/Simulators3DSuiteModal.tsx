import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  X,
  Play,
  RotateCcw,
  Zap,
  Flame,
  Cpu,
  Monitor,
  Wrench,
  Activity,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Thermometer,
  Eye,
  Crosshair,
  Volume2
} from 'lucide-react';

interface Simulators3DSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

type SimulatorType = 'motherboard_bga' | 'ir6500_reflow' | 'pc_assembly' | 'laptop_teardown' | 'oscilloscope_3d' | 'kbc_programmer_3d';

export const Simulators3DSuiteModal: React.FC<Simulators3DSuiteModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [activeSimulator, setActiveSimulator] = useState<SimulatorType>('motherboard_bga');
  
  // 3D Rotation and Canvas State
  const [rotationX, setRotationX] = useState(25);
  const [rotationY, setRotationY] = useState(45);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Simulation Controls
  const [tempProfile, setTempProfile] = useState(180); // °C for BGA
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simStep, setSimStep] = useState(1);
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>('BGA_GPU_N18E');
  const [oscilloscopeFreq, setOscilloscopeFreq] = useState(25); // MHz
  const [multimeterVoltage, setMultimeterVoltage] = useState(19.5); // V
  const [probePos, setProbePos] = useState({ x: 50, y: 50 });

  // Interactive 3D Canvas Rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render3D = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(zoom, zoom);

      // Render Active 3D Simulator scene based on type
      if (activeSimulator === 'motherboard_bga') {
        render3DMotherboard(ctx, rotationX, rotationY, showThermalOverlay, tempProfile, selectedComponent);
      } else if (activeSimulator === 'ir6500_reflow') {
        render3DIR6500(ctx, rotationX, rotationY, tempProfile, isRunningSim);
      } else if (activeSimulator === 'pc_assembly') {
        render3DPcAssembly(ctx, rotationX, rotationY, simStep);
      } else if (activeSimulator === 'laptop_teardown') {
        render3DLaptopTeardown(ctx, rotationX, rotationY, simStep);
      } else if (activeSimulator === 'oscilloscope_3d') {
        render3DOscilloscope(ctx, rotationX, rotationY, oscilloscopeFreq);
      } else if (activeSimulator === 'kbc_programmer_3d') {
        render3DKbcProgrammer(ctx, rotationX, rotationY);
      }

      ctx.restore();

      animId = requestAnimationFrame(render3D);
    };

    render3D();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, activeSimulator, rotationX, rotationY, zoom, showThermalOverlay, tempProfile, selectedComponent, simStep, oscilloscopeFreq, isRunningSim]);

  // ---------------------------------------------------------------------------
  // 3D RENDERERS (HTML5 Canvas 3D Projection)
  // ---------------------------------------------------------------------------

  function render3DMotherboard(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    thermal: boolean,
    temp: number,
    selected: string | null
  ) {
    const radX = (rx * Math.PI) / 180;
    const radY = (ry * Math.PI) / 180;

    // Draw 3D PCB Board Base
    ctx.fillStyle = '#064e3b'; // PCB Green
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;

    const pcbW = 280;
    const pcbH = 180;
    const pcbD = 12;

    // Projected corners
    const isoX = (x: number, y: number, z: number) => x * Math.cos(radY) - z * Math.sin(radY);
    const isoY = (x: number, y: number, z: number) =>
      y * Math.cos(radX) + x * Math.sin(radY) * Math.sin(radX) + z * Math.cos(radY) * Math.sin(radX);

    // Draw main PCB slab
    ctx.beginPath();
    ctx.moveTo(isoX(-pcbW / 2, -pcbD, -pcbH / 2), isoY(-pcbW / 2, -pcbD, -pcbH / 2));
    ctx.lineTo(isoX(pcbW / 2, -pcbD, -pcbH / 2), isoY(pcbW / 2, -pcbD, -pcbH / 2));
    ctx.lineTo(isoX(pcbW / 2, -pcbD, pcbH / 2), isoY(pcbW / 2, -pcbD, pcbH / 2));
    ctx.lineTo(isoX(-pcbW / 2, -pcbD, pcbH / 2), isoY(-pcbW / 2, -pcbD, pcbH / 2));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Copper Traces
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    for (let i = -100; i <= 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(isoX(i, -pcbD - 1, -80), isoY(i, -pcbD - 1, -80));
      ctx.lineTo(isoX(i + 30, -pcbD - 1, 80), isoY(i + 30, -pcbD - 1, 80));
      ctx.stroke();
    }

    // CPU Socket (Intel LGA1700)
    const cpuX = -60;
    const cpuZ = -10;
    const cpuS = 65;
    ctx.fillStyle = selected === 'CPU_SOCKET' ? '#3b82f6' : '#334155';
    ctx.fillRect(isoX(cpuX - cpuS / 2, -pcbD - 4, cpuZ - cpuS / 2), isoY(cpuX - cpuS / 2, -pcbD - 4, cpuZ - cpuS / 2), 70, 50);

    // BGA GPU Chip (NVIDIA RTX)
    const gpuX = 60;
    const gpuZ = -10;
    const gpuS = 55;
    const isHot = temp > 210;
    ctx.fillStyle = thermal
      ? isHot ? '#ef4444' : '#f59e0b'
      : selected === 'BGA_GPU_N18E' ? '#10b981' : '#1e293b';

    ctx.beginPath();
    ctx.arc(isoX(gpuX, -pcbD - 6, gpuZ), isoY(gpuX, -pcbD - 6, gpuZ), 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('NVIDIA BGA', isoX(gpuX - 22, -pcbD - 12, gpuZ), isoY(gpuX - 22, -pcbD - 12, gpuZ));

    // Thermal Hotspot Glow Overlay if active
    if (thermal) {
      const grad = ctx.createRadialGradient(
        isoX(gpuX, -pcbD - 6, gpuZ),
        isoY(gpuX, -pcbD - 6, gpuZ),
        5,
        isoX(gpuX, -pcbD - 6, gpuZ),
        isoY(gpuX, -pcbD - 6, gpuZ),
        60
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
      grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(isoX(gpuX, -pcbD - 6, gpuZ), isoY(gpuX, -pcbD - 6, gpuZ), 65, 0, Math.PI * 2);
      ctx.fill();
    }

    // RAM DDR5 Slots
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(isoX(-120, -pcbD - 8, -60), isoY(-120, -pcbD - 8, -60), 15, 110);
    ctx.fillRect(isoX(-100, -pcbD - 8, -60), isoY(-100, -pcbD - 8, -60), 15, 110);

    // VRM MOSFETs & Chokes
    ctx.fillStyle = '#475569';
    for (let i = -70; i <= 20; i += 18) {
      ctx.fillRect(isoX(i, -pcbD - 6, -75), isoY(i, -pcbD - 6, -75), 12, 12);
    }
  }

  function render3DIR6500(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    temp: number,
    active: boolean
  ) {
    // 3D IR Reflow Station
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-140, -90, 280, 180);

    // Top Heater Arm
    ctx.fillStyle = '#334155';
    ctx.fillRect(-40, -120, 80, 40);

    // Infrared Heating Element Glow
    if (active || temp > 100) {
      const glow = ctx.createRadialGradient(0, -100, 5, 0, -100, 50);
      glow.addColorStop(0, '#f97316');
      glow.addColorStop(0.8, 'rgba(239, 68, 68, 0.5)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, -100, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`IR6500 REFLOW TEMP: ${temp}°C`, -90, 70);
  }

  function render3DPcAssembly(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    step: number
  ) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-120, -140, 240, 280); // ATX Case Frame

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(-110, -130, 220, 260);

    // Step 1: Motherboard
    if (step >= 1) {
      ctx.fillStyle = '#065f46';
      ctx.fillRect(-90, -100, 180, 200);
    }

    // Step 2: CPU & Water Cooler
    if (step >= 2) {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(-20, -30, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Step 3: GPU RTX 4090
    if (step >= 3) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-80, 20, 160, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('RTX 4090 24GB PCIe 4.0', -50, 45);
    }

    // Step 4: Cable Routing & RGB
    if (step >= 4) {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-70, 45);
      ctx.lineTo(-70, 100);
      ctx.stroke();
    }
  }

  function render3DLaptopTeardown(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    step: number
  ) {
    ctx.fillStyle = '#334155';
    ctx.fillRect(-150, -80, 300, 160);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-140, -70, 280, 140);

    // Screws
    ctx.fillStyle = '#94a3b8';
    const screws = [
      [-130, -60], [130, -60],
      [-130, 60], [130, 60],
      [0, -60], [0, 60]
    ];
    screws.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, step > 1 ? 8 : 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`KROK TEARDOWN LAPTOPA: ${step}/4`, -100, 85);
  }

  function render3DOscilloscope(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number,
    freq: number
  ) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-160, -110, 320, 220);

    // Screen
    ctx.fillStyle = '#022c22';
    ctx.fillRect(-140, -90, 200, 140);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1;
    ctx.strokeRect(-140, -90, 200, 140);

    // Grid lines
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
    for (let x = -140; x <= 60; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, -90);
      ctx.lineTo(x, 50);
      ctx.stroke();
    }

    // Sine Wave SPI Clock Signal
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const time = Date.now() / 100;
    for (let x = -140; x <= 60; x += 2) {
      const y = -20 + Math.sin((x + time * 10) * (freq / 100)) * 35;
      if (x === -140) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Oscilloscope Control Knobs
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(100, -50, 20, 0, Math.PI * 2);
    ctx.arc(100, 10, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`SPI CLK: ${freq} MHz`, -135, -75);
  }

  function render3DKbcProgrammer(
    ctx: CanvasRenderingContext2D,
    rx: number,
    ry: number
  ) {
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-130, -90, 260, 180);

    ctx.fillStyle = '#4338ca';
    ctx.fillRect(-110, -70, 220, 100);

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('SVOD4 / RT809F KBC PROGRAMMER 3D', -100, -40);
    ctx.fillText('STATUS: GOTOWY DO FLASHOWANIA ENE/ITE/NUVOTON', -100, -10);
  }

  // ---------------------------------------------------------------------------
  // MOUSE & TOUCH INTERACTION HANDLERS
  // ---------------------------------------------------------------------------

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    setRotationY((prev) => prev + deltaX * 0.5);
    setRotationX((prev) => Math.max(-80, Math.min(80, prev + deltaY * 0.5)));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border border-blue-900/60 rounded-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 px-6 py-4 border-b border-blue-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Box className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
                <span>Centrum Symulatorów 3D & Elektroniki</span>
                <span className="text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">WebGL / Canvas 3D</span>
              </h2>
              <p className="text-slate-400 text-xs">Interaktywne symulatory 3D płyt głównych, BGA IR6500, montażu PC, oscyloskopu i demontażu laptopów</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl transition hover:bg-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Simulator Selector Tabs Bar */}
        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveSimulator('motherboard_bga')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'motherboard_bga' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>1. Płyta Główna & BGA 3D</span>
          </button>

          <button
            onClick={() => setActiveSimulator('ir6500_reflow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'ir6500_reflow' ? 'bg-amber-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>2. Stacja IR6500 BGA</span>
          </button>

          <button
            onClick={() => setActiveSimulator('pc_assembly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'pc_assembly' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>3. Składanie PC & Kabli</span>
          </button>

          <button
            onClick={() => setActiveSimulator('laptop_teardown')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'laptop_teardown' ? 'bg-purple-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>4. Demontaż Laptopa</span>
          </button>

          <button
            onClick={() => setActiveSimulator('oscilloscope_3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'oscilloscope_3d' ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>5. Oscyloskop & SPI</span>
          </button>

          <button
            onClick={() => setActiveSimulator('kbc_programmer_3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeSimulator === 'kbc_programmer_3d' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>6. Programator KBC 3D</span>
          </button>
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950">
          {/* 3D Canvas Viewport */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-950 select-none overflow-hidden border-r border-slate-800">
            <canvas
              ref={canvasRef}
              width={750}
              height={500}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing max-w-full max-h-full object-contain"
            />

            {/* Viewport Floating Controls */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
                title="Przybliż 3D"
              >
                +
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition"
                title="Oddal 3D"
              >
                -
              </button>
              <button
                onClick={() => {
                  setRotationX(25);
                  setRotationY(45);
                  setZoom(1);
                }}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                title="Reset widoku 3D"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
              Obrót 3D: X={Math.round(rotationX)}° Y={Math.round(rotationY)}° | Zoom={(zoom * 100).toFixed(0)}%
            </div>
          </div>

          {/* Interactive Control Panel */}
          <div className="w-full lg:w-96 bg-slate-900 p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
            {activeSimulator === 'motherboard_bga' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span>Inspekcja BGA & Zwarć Płyty Głównych</span>
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>Proces Nagrzewania BGA:</span>
                    <span className="font-mono text-amber-400 font-bold">{tempProfile}°C</span>
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="260"
                    value={tempProfile}
                    onChange={(e) => setTempProfile(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">Kamera Termowizyjna 3D</span>
                  <button
                    onClick={() => setShowThermalOverlay(!showThermalOverlay)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      showThermalOverlay ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {showThermalOverlay ? 'Włączona' : 'Wyłączona'}
                  </button>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Wybór Elementu:</span>
                    <span className="text-blue-400 font-mono font-bold">{selectedComponent}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Stan Cyny BGA:</span>
                    <span className={tempProfile > 217 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      {tempProfile > 217 ? 'Cyna Płynna (Lutowanie Active)' : 'Cyna Stała (Krystaliczna)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeSimulator === 'ir6500_reflow' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Stacja IR6500 BGA Reflow Profiler</span>
                </h3>

                <button
                  onClick={() => setIsRunningSim(!isRunningSim)}
                  className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
                    isRunningSim ? 'bg-red-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isRunningSim ? 'Zatrzymaj Profil Lutowniczy' : 'Uruchom Profil BGA (Lead-Free / SnPb)'}</span>
                </button>
              </div>
            )}

            {activeSimulator === 'pc_assembly' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span>Kroki Montażu Stacji Komputerowej PC</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimStep(s)}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition ${
                        simStep === s
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Krok {s}: {s === 1 ? 'Płyta ATX' : s === 2 ? 'CPU & Chłodzenie' : s === 3 ? 'Karta RTX 4090' : 'Okablowanie RGB'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSimulator === 'laptop_teardown' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-400" />
                  <span>Sekwencja Serwisowa Laptopa</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSimStep(s)}
                      className={`p-3 rounded-xl text-xs font-bold border text-left transition ${
                        simStep === s
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Etap {s}: {s === 1 ? 'Odkręcenie Śrub' : s === 2 ? 'Odpięcie Baterii' : s === 3 ? 'Wymiana Pasty MX-4' : 'Czyszczenie Fan'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeSimulator === 'oscilloscope_3d' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Generator Sygnałów & Oscyloskop</span>
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>Częstotliwość Zegara SPI CLK:</span>
                    <span className="font-mono text-teal-400 font-bold">{oscilloscopeFreq} MHz</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={oscilloscopeFreq}
                    onChange={(e) => setOscilloscopeFreq(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>
            )}

            {activeSimulator === 'kbc_programmer_3d' && (
              <div className="space-y-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Konfiguracja Klipsa KBC FPC 3D</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Symulator podłączania taśmy klawiaturowej FPC (24/30/32 pin) do programatora SVOD4 / RT809F.
                </p>
              </div>
            )}

            {/* Bottom Chat / Report Action */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              {onSendToChat && (
                <button
                  onClick={() => {
                    onSendToChat(`Wykonano symulację 3D w trybie: ${activeSimulator}. Zarejestrowane parametry: temp=${tempProfile}°C, krok=${simStep}, freq=${oscilloscopeFreq}MHz.`);
                    onClose();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Prześlij Wyniki Symulacji 3D do AI Chat</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition"
              >
                Zamknij Symulator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
