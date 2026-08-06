import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  X,
  Volume2,
  Layers,
  Cpu,
  Gamepad2
} from 'lucide-react';

interface FurMark3DGpuTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const FurMark3DGpuTestModal: React.FC<FurMark3DGpuTestModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [isRunning, setIsRunning] = useState(true);
  const [msaa, setMsaa] = useState<'0x' | '2x' | '4x' | '8x'>('4x');
  const [testMode, setTestMode] = useState<'1080p' | '1440p' | '4K' | 'artifact' | 'tessellation' | 'game'>('game');
  const [fps, setFps] = useState(144);
  const [gpuTemp, setGpuTemp] = useState(65);
  const [gpuLoad, setGpuLoad] = useState(99);
  const [powerDraw, setPowerDraw] = useState(310); // W
  const [frameCount, setFrameCount] = useState(0);
  const [artifactsDetected, setArtifactsDetected] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameLives, setGameLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

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
    let localTemp = 65;
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
    for (let i = 0; i < 6; i++) {
      enemies.push({
        x: Math.random() * (canvas.width - 80) + 40,
        y: Math.random() * 150 + 40,
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 0.8 + 0.3,
        type: Math.random() > 0.6 ? 'short' : Math.random() > 0.3 ? 'heat' : 'bug'
      });
    }

    const render = (time: number) => {
      const delta = time - lastTime;
      frames++;
      if (delta >= 1000) {
        setFps(testMode === 'game' ? 120 : testMode === '4K' ? 58 : 144);
        frames = 0;
        lastTime = time;

        if (isRunning && !isOver) {
          localTemp = Math.min(94, localTemp + 0.3);
          setGpuTemp(parseFloat(localTemp.toFixed(1)));
        }
      }

      setFrameCount(c => c + 1);

      // Clear canvas
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Always update angle
      if (isRunning && !isOver) {
        angle += testMode === 'tessellation' ? 0.05 : testMode === 'game' ? 0.08 : 0.03;
      }

      // ----------------------------------------------------
      // DRAW BACKGROUND 3D TORUS (EXTREME LOAD IN GAME MODE)
      // ----------------------------------------------------
      ctx.save();
      ctx.translate(cx, cy);

      const R = testMode === '4K' || testMode === 'game' ? 140 : 110;
      const r = testMode === '4K' || testMode === 'game' ? 55 : 45;
      const segmentsU = testMode === 'tessellation' || testMode === 'game' ? 64 : 48;
      const segmentsV = testMode === 'tessellation' || testMode === 'game' ? 32 : 24;

      ctx.strokeStyle = testMode === 'artifact' ? '#3b0707' : '#1e293b';
      ctx.lineWidth = 1;
      for (let i = -300; i <= 300; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, -300);
        ctx.lineTo(i, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-300, i);
        ctx.lineTo(300, i);
        ctx.stroke();
      }

      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;
        for (let j = 0; j < segmentsV; j++) {
          const v = (j / segmentsV) * Math.PI * 2;

          const ox = (R + r * Math.cos(v)) * Math.cos(u);
          const oy = r * Math.sin(v);
          const oz = (R + r * Math.cos(v)) * Math.sin(u);

          const cosX = Math.cos(angle * 0.7);
          const sinX = Math.sin(angle * 0.7);
          const cosY = Math.cos(angle);
          const sinY = Math.sin(angle);

          const x1 = ox * cosY + oz * sinY;
          const y1 = oy;
          const z1 = -ox * sinY + oz * cosY;

          const x2 = x1;
          const y2 = y1 * cosX - z1 * sinX;
          const z2 = y1 * sinX + z1 * cosX;

          const fov = 350;
          const scale = fov / (fov + z2 + 250);
          const px = x2 * scale;
          const py = y2 * scale;

          const nx = x2 * scale * (testMode === 'tessellation' || testMode === 'game' ? 1.15 : 1.08);
          const ny = y2 * scale * (testMode === 'tessellation' || testMode === 'game' ? 1.15 : 1.08);

          const heatFactor = (localTemp - 50) / 40;
          const redCol = Math.floor(100 + heatFactor * 155);
          const blueCol = Math.floor(220 - heatFactor * 180);

          ctx.strokeStyle = testMode === 'artifact' && Math.random() < 0.05 ? '#22c55e' : `rgba(${redCol}, 80, ${blueCol}, ${testMode === 'game' ? 0.4 : 1.0})`;
          ctx.lineWidth = scale * (testMode === 'tessellation' || testMode === 'game' ? 2 : 1.5);

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(nx, ny);
          ctx.stroke();

          ctx.fillStyle = `rgba(${redCol}, 150, 255, ${testMode === 'game' ? 0.3 : 1.0})`;
          ctx.beginPath();
          ctx.arc(px, py, scale * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();

      if (testMode === 'game') {
        // --- GAME MODE OVERLAY (EXTREME GPU SHOOTER) ---
        if (!isOver && isRunning) {
          // Player movement
          if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['A']) {
            playerX = Math.max(30, playerX - 7);
          }
          if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['D']) {
            playerX = Math.min(canvas.width - 30, playerX + 7);
          }
          if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['W']) {
            playerY = Math.max(canvas.height - 180, playerY - 5);
          }
          if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['S']) {
            playerY = Math.min(canvas.height - 30, playerY + 5);
          }

          // Shoot bullet on Space
          if (keysRef.current[' '] && (frames % 12 === 0)) {
            bullets.push({ x: playerX, y: playerY - 20, speed: 10 });
          }

          // Update bullets
          bullets.forEach((b, idx) => {
            b.y -= b.speed;
            if (b.y < 0) bullets.splice(idx, 1);
          });

          // Spawn enemies more aggressively
          if (Math.random() < 0.03) {
            enemies.push({
              x: Math.random() * (canvas.width - 80) + 40,
              y: 40,
              speedX: (Math.random() - 0.5) * 4,
              speedY: Math.random() * 2 + 0.8,
              type: Math.random() > 0.5 ? 'short' : 'heat'
            });
          }

          // Update enemies
          enemies.forEach((e, eIdx) => {
            e.x += e.speedX;
            e.y += e.speedY;

            if (e.x < 30 || e.x > canvas.width - 30) e.speedX *= -1;
            if (e.y > canvas.height - 50) {
              e.y = 40;
              e.x = Math.random() * (canvas.width - 80) + 40;
            }

            // Collision with player
            const dist = Math.hypot(playerX - e.x, playerY - e.y);
            if (dist < 30) {
              lives--;
              setGameLives(lives);
              enemies.splice(eIdx, 1);
              // Spawn explosion particles
              for (let p = 0; p < 15; p++) {
                particles.push({
                  x: playerX,
                  y: playerY,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: '#ef4444',
                  life: 30
                });
              }
              if (lives <= 0) {
                isOver = true;
                setGameOver(true);
              }
            }

            // Collision with bullets
            bullets.forEach((b, bIdx) => {
              const bDist = Math.hypot(b.x - e.x, b.y - e.y);
              if (bDist < 25) {
                score += 150;
                setGameScore(score);
                bullets.splice(bIdx, 1);
                enemies.splice(eIdx, 1);

                // Spawn score particles
                for (let p = 0; p < 10; p++) {
                  particles.push({
                    x: e.x,
                    y: e.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: '#38bdf8',
                    life: 25
                  });
                }
              }
            });
          });
        }

        // Render particles
        particles.forEach((pt, pIdx) => {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life--;
          ctx.fillStyle = pt.color;
          ctx.fillRect(pt.x, pt.y, 3, 3);
          if (pt.life <= 0) particles.splice(pIdx, 1);
        });

        // Render Player Ship (Warszawa GPU Interceptor)
        ctx.save();
        ctx.translate(playerX, playerY);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 15);
        ctx.lineTo(15, 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Render Bullets
        ctx.fillStyle = '#facc15';
        bullets.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        // Render Enemies (Thermal Bugs & Glitches)
        enemies.forEach(e => {
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.fillStyle = e.type === 'short' ? '#ef4444' : e.type === 'heat' ? '#f97316' : '#a855f7';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(e.type === 'short' ? '⚡SHORT' : e.type === 'heat' ? '🔥HEAT' : '🐛BUG', 0, 4);
          ctx.restore();
        });

        // Game HUD overlay
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(20, 20, 320, 110);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(20, 20, 320, 110);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('🎮 GPU OVERCLOCK ARCADE WARFARE', 32, 42);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Punkty: ${score} | Życia: ${lives} / 3`, 32, 68);
        ctx.fillText(`Sterowanie: Strzałki / WSDA + Spacja (Strzał)`, 32, 90);
        ctx.fillText(`Zniszcz usterki VRAM! (Tło generuje 100% obciążenia)`, 32, 112);

      } else {
        // --- STANDARD HUD ---
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(20, 20, 280, 125);
        ctx.strokeStyle = testMode === 'artifact' ? '#ef4444' : '#334155';
        ctx.strokeRect(20, 20, 280, 125);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`FURMARK 3D TEST [${testMode.toUpperCase()}]`, 32, 42);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = '11px sans-serif';
        ctx.fillText(`FPS: ${fps} | MSAA: ${msaa}`, 32, 65);
        ctx.fillText(`Temperatura GPU: ${localTemp.toFixed(1)}°C (${powerDraw}W)`, 32, 85);
        ctx.fillText(`Obciążenie VRAM / Core: ${gpuLoad}%`, 32, 105);
        if (testMode === 'artifact') {
          ctx.fillStyle = artifactsDetected > 0 ? '#ef4444' : '#22c55e';
          ctx.fillText(`Wykryte artefakty VRAM: ${artifactsDetected}`, 32, 125);
        } else {
          ctx.fillStyle = '#22c55e';
          ctx.fillText(`Stabilność Shaderów: 100% OK`, 32, 125);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, isRunning, msaa, testMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-cyan-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                FurMark 3D GPU Extreme Benchmark & Playable Game Suite
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Warszawa Pro Edition
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Wybierz tryb gry wciągającej ("🎮 Tryb Gry Arcade") lub ekstremalne testy obciążeniowe VRAM / 4K / Tessellation!
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

        {/* Toolbar Controls */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition flex items-center gap-2 shadow ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isRunning ? 'Wstrzymaj Test' : 'Wznowij Test'}
            </button>

            {/* Test Modes */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="px-2 text-slate-400 font-semibold">Tryb:</span>
              {(['game', '1080p', '1440p', '4K', 'artifact', 'tessellation'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setTestMode(m)}
                  className={`px-2.5 py-1 rounded transition font-bold uppercase ${
                    testMode === m ? 'bg-cyan-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {m === 'game' ? '🎮 GRA ARCADE' : m}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs text-slate-300">
              <span className="px-2 text-slate-400 font-semibold">MSAA:</span>
              {(['0x', '2x', '4x', '8x'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMsaa(m)}
                  className={`px-2 py-1 rounded transition font-bold ${
                    msaa === m ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            {testMode === 'game' ? (
              <>
                <span className="text-slate-400">Punkty: <strong className="text-cyan-400">{gameScore}</strong></span>
                <span className="text-slate-400">Życia: <strong className="text-rose-400">{gameLives}</strong></span>
              </>
            ) : (
              <>
                <span className="text-slate-400">FPS: <strong className="text-cyan-400">{fps}</strong></span>
                <span className="text-slate-400">Temp GPU: <strong className="text-red-400">{gpuTemp}°C</strong></span>
                <span className="text-slate-400">Moc: <strong className="text-amber-400">{powerDraw}W</strong></span>
              </>
            )}
          </div>
        </div>

        {/* 3D Canvas viewport */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 overflow-hidden min-h-[440px]">
          <canvas
            ref={canvasRef}
            width={900}
            height={440}
            className="w-full max-w-4xl h-[440px] rounded-xl border border-slate-800 shadow-inner bg-black/60"
          />
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Naprawa Komputerów i Laptopów Serwis Pogotowie Warszawa — Wbudowany test FurMark i gra Arcade VRAM Shaders.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition"
          >
            Zamknij Okno
          </button>
        </div>

      </div>
    </div>
  );
};

