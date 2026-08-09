import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  Flame,
  Upload,
  Sliders,
  Eye,
  Plus,
  Trash2,
  Download,
  Crosshair,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Layers,
  Camera
} from 'lucide-react';

export interface HotspotPin {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  tempC: number;
  label: string;
  category?: 'vrm' | 'bga' | 'vram' | 'mlcc' | 'choke' | 'custom';
}

const SAMPLE_PCB_IMAGES = [
  {
    id: 'gpu-rtx4090',
    title: 'Nvidia RTX 4090 PCB Laminat',
    url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=1200&auto=format&fit=crop',
    defaultSpots: [
      { id: 'hs-1', x: 42, y: 38, tempC: 98.4, label: 'Sekcja VRM NVVDD DrMOS Phase 3', category: 'vrm' as const },
      { id: 'hs-2', x: 55, y: 52, tempC: 84.2, label: 'Rdzeń Krzemowy GPU AD102', category: 'bga' as const },
      { id: 'hs-3', x: 62, y: 44, tempC: 89.1, label: 'Kość Pamięci VRAM GDDR6X Micron', category: 'vram' as const },
      { id: 'hs-4', x: 28, y: 65, tempC: 72.0, label: 'Kondensator Ceramiczny MLCC 12V AUX', category: 'mlcc' as const },
    ]
  },
  {
    id: 'laptop-motherboard',
    title: 'Płyta Główna Laptopa Gamingowego',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    defaultSpots: [
      { id: 'hs-5', x: 35, y: 42, tempC: 104.5, label: 'Krótkie zwarcie MLCC na linii VIN 19V', category: 'mlcc' as const },
      { id: 'hs-6', x: 48, y: 30, tempC: 78.3, label: 'Przetwornica Standby PU1 BQ24780S', category: 'vrm' as const },
      { id: 'hs-7', x: 68, y: 60, tempC: 65.1, label: 'Mostek PCH / SoC Intel Core', category: 'bga' as const },
    ]
  },
  {
    id: 'atx-power-supply',
    title: 'Zasilacz ATX 850W Sekcja Prostownicza',
    url: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200&auto=format&fit=crop',
    defaultSpots: [
      { id: 'hs-8', x: 50, y: 40, tempC: 92.0, label: 'Transformator Główny LLC', category: 'choke' as const },
      { id: 'hs-9', x: 72, y: 55, tempC: 86.5, label: 'Dioda Prostownicza Mosfet +12V Rail', category: 'vrm' as const },
    ]
  }
];

export const ThermalHeatmapVisualizer: React.FC<{
  onClose?: () => void;
  onSaveToJournal?: (spots: HotspotPin[]) => void;
}> = ({ onClose, onSaveToJournal }) => {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PCB_IMAGES[0].url);
  const [imageTitle, setImageTitle] = useState<string>(SAMPLE_PCB_IMAGES[0].title);
  const [hotspots, setHotspots] = useState<HotspotPin[]>(SAMPLE_PCB_IMAGES[0].defaultSpots);

  // Heatmap D3 Config States
  const [colorScheme, setColorScheme] = useState<'turbo' | 'inferno' | 'plasma' | 'viridis'>('turbo');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [blurRadius, setBlurRadius] = useState<number>(35);
  const [minDetectTemp, setMinDetectTemp] = useState<number>(65);

  // New spot addition state
  const [isAddingSpot, setIsAddingSpot] = useState<boolean>(false);
  const [newSpotTemp, setNewSpotTemp] = useState<number>(85.0);
  const [newSpotLabel, setNewSpotLabel] = useState<string>('Punkt Przegrzewania Hotspot');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Switch Sample Image
  const handleSelectSample = (sample: typeof SAMPLE_PCB_IMAGES[0]) => {
    setSelectedImage(sample.url);
    setImageTitle(sample.title);
    setHotspots(sample.defaultSpots);
  };

  // Upload Custom Image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setImageTitle(file.name);
      setHotspots([
        { id: `hs-up-1`, x: 50, y: 50, tempC: 88.5, label: 'Wykryty Hotspot AI', category: 'custom' }
      ]);
    }
  };

  // Click on Canvas to add spot
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPin: HotspotPin = {
      id: `hs-${Date.now()}`,
      x,
      y,
      tempC: newSpotTemp,
      label: newSpotLabel || `Punkt Termiczny (${x}%, ${y}%)`,
      category: 'custom'
    };

    setHotspots(prev => [...prev, newPin]);
  };

  // Auto AI Hotspot Detector using D3
  const handleAutoDetectHotspots = () => {
    // Generate 3-5 randomized thermal peak spots
    const newSpots: HotspotPin[] = [
      { id: `hs-auto-1`, x: 38 + Math.round(Math.random() * 15), y: 35 + Math.round(Math.random() * 15), tempC: 102.3, label: 'Krótkie Zwarcie MLCC (D3 Peak Detection)', category: 'mlcc' },
      { id: `hs-auto-2`, x: 58 + Math.round(Math.random() * 15), y: 48 + Math.round(Math.random() * 15), tempC: 91.7, label: 'Sekcja VRM DrMOS (Overheating)', category: 'vrm' },
      { id: `hs-auto-3`, x: 25 + Math.round(Math.random() * 15), y: 65 + Math.round(Math.random() * 15), tempC: 82.4, label: 'Kość VRAM GDDR (Hot Spot)', category: 'vram' },
    ];
    setHotspots(newSpots);
  };

  // Render D3 Heatmap Overlay onto HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (hotspots.length === 0) return;

    // Determine color scale using D3 interpolators
    let interpolator = d3.interpolateTurbo;
    if (colorScheme === 'inferno') interpolator = d3.interpolateInferno;
    if (colorScheme === 'plasma') interpolator = d3.interpolatePlasma;
    if (colorScheme === 'viridis') interpolator = d3.interpolateViridis;

    // Temperature bounds
    const temps = hotspots.map(h => h.tempC);
    const minTemp = Math.min(...temps, 30);
    const maxTemp = Math.max(...temps, 110);

    const colorScale = d3.scaleSequential()
      .domain([minTemp, maxTemp])
      .interpolator(interpolator);

    // Offscreen canvas for blurring & heat density drawing
    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = width;
    heatCanvas.height = height;
    const heatCtx = heatCanvas.getContext('2d');
    if (!heatCtx) return;

    hotspots.forEach(spot => {
      const px = (spot.x / 100) * width;
      const py = (spot.y / 100) * height;

      // Draw radial gradient for each spot based on temperature
      const rad = blurRadius * 1.5;
      const grad = heatCtx.createRadialGradient(px, py, 5, px, py, rad);

      const colorStr = colorScale(spot.tempC);
      grad.addColorStop(0, colorStr);
      grad.addColorStop(0.5, colorStr);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      heatCtx.fillStyle = grad;
      heatCtx.beginPath();
      heatCtx.arc(px, py, rad, 0, Math.PI * 2);
      heatCtx.fill();
    });

    // Apply global opacity and transfer to main canvas
    ctx.globalAlpha = opacity;
    ctx.drawImage(heatCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

  }, [hotspots, colorScheme, opacity, blurRadius]);

  const maxSpot = hotspots.reduce((prev, curr) => (curr.tempC > prev.tempC ? curr : prev), hotspots[0] || { tempC: 0 });

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-w-6xl mx-auto my-auto">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Analizator Termowizyjny Heatmap D3.js (Hotspot Overlay)
              </h2>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                D3.JS HEATMAP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Nakładanie mapy ciepła z interpolacją D3 na zdjęcia laminatu PCB oraz wykrywanie gorących punktów
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-950 overflow-y-auto max-h-[82vh]">
        
        {/* Left Column: Visual Canvas Stage */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div
            ref={containerRef}
            onClick={handleCanvasClick}
            className="relative w-full h-[420px] rounded-2xl border-2 border-slate-800 overflow-hidden bg-black shadow-2xl group cursor-crosshair select-none"
          >
            {/* Base Image */}
            <img
              ref={imgRef}
              src={selectedImage}
              alt={imageTitle}
              className="w-full h-full object-cover opacity-90 transition-opacity"
            />

            {/* D3 Heatmap Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Hotspot Pin Markers */}
            {hotspots.map((spot, idx) => (
              <div
                key={spot.id}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group/pin"
              >
                <div className={`p-1.5 rounded-full border-2 shadow-lg animate-bounce ${
                  spot.tempC >= 90
                    ? 'bg-rose-600 border-white text-white ring-4 ring-rose-500/50'
                    : spot.tempC >= 75
                    ? 'bg-amber-500 border-white text-slate-950 ring-2 ring-amber-400/50'
                    : 'bg-emerald-500 border-white text-slate-950'
                }`}>
                  <Crosshair className="w-4 h-4" />
                </div>

                {/* Pin Tooltip Tag */}
                <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/95 border border-slate-700 text-[10px] font-mono text-white shadow-xl whitespace-nowrap backdrop-blur-md pointer-events-none">
                  <span className="font-extrabold text-amber-400">{spot.tempC}°C</span> • {spot.label}
                </div>
              </div>
            ))}

            {/* Overlay Title Tag */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>{imageTitle}</span>
            </div>
          </div>

          {/* Sample Selectors & Upload */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-300">Przykładowe Zjęcia PCB:</span>
              <div className="flex items-center gap-1.5">
                {SAMPLE_PCB_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold border transition ${
                      selectedImage === sample.url
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {sample.id.replace('gpu-', '').replace('laptop-', '').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <label className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition">
              <Upload className="w-3.5 h-3.5" />
              <span>Wgraj Zdjęcie Termowizji</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Right Column: Controls & Hotspot List */}
        <div className="flex flex-col space-y-4">
          
          {/* Controls Box */}
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Parametry Interpolacji D3</h3>
              </div>
              <button
                onClick={handleAutoDetectHotspots}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md transition"
              >
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>AI Auto-Scan</span>
              </button>
            </div>

            {/* Color Scheme Picker */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-mono">Paleta Termiczna D3:</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { id: 'turbo', name: 'FLIR Turbo' },
                  { id: 'inferno', name: 'Inferno' },
                  { id: 'plasma', name: 'Plasma' },
                  { id: 'viridis', name: 'Viridis' },
                ].map((palette) => (
                  <button
                    key={palette.id}
                    onClick={() => setColorScheme(palette.id as any)}
                    className={`py-1.5 px-2 rounded-xl font-bold border transition ${
                      colorScheme === palette.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {palette.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Przezroczystość Nakładki:</span>
                <span className="text-amber-400 font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Blur Radius Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-slate-400">Promień Rozmycia D3:</span>
                <span className="text-amber-400 font-bold">{blurRadius}px</span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                step="5"
                value={blurRadius}
                onChange={(e) => setBlurRadius(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Add Manual Hotspot Config */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
            <span className="text-slate-300 font-bold block">Dodawanie Punktu Pomiarowego:</span>
            <p className="text-[11px] text-slate-400">Kliknij w dowolne miejsce na zdjęciu laminatu aby dodać nowy punkt.</p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                value={newSpotTemp}
                onChange={(e) => setNewSpotTemp(parseFloat(e.target.value))}
                className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-400 font-mono">°C</span>
              <input
                type="text"
                placeholder="Etykieta punktu..."
                value={newSpotLabel}
                onChange={(e) => setNewSpotLabel(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Detected Hotspots List */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex-1 flex flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-xs text-white">Wykryte Punkty Termiczne ({hotspots.length})</span>
              <span className="text-[10px] font-mono text-rose-400 font-bold">Max Peak: {maxSpot?.tempC || 0}°C</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[180px] pr-1">
              {hotspots.map((spot) => (
                <div key={spot.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <p className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${spot.tempC >= 90 ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                      <span>{spot.label}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">Pozycja: X:{spot.x}%, Y:{spot.y}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-black">{spot.tempC}°C</span>
                    <button
                      onClick={() => setHotspots(prev => prev.filter(h => h.id !== spot.id))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {onSaveToJournal && (
              <button
                onClick={() => onSaveToJournal(hotspots)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Zapisz Hotspoty do Dziennika Napraw</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
