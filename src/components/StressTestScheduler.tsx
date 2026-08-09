import React, { useState, useEffect } from 'react';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  Gauge,
  Zap,
  Maximize2,
  Download,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface QueuedTest {
  id: string;
  name: string;
  type: 'furmark' | 'cinebench' | 'prime95' | 'mats_vram' | 'memtest';
  durationSecs: number;
  intensity: 'heavy' | 'extreme' | 'standard';
  targetComponent: 'GPU' | 'CPU' | 'VRAM' | 'RAM';
  status: 'queued' | 'running' | 'cooldown' | 'passed' | 'failed' | 'aborted';
  maxTempC?: number;
  cooldownTempC?: number;
  recoveryRate?: number; // °C per second drop
}

const AVAILABLE_TEST_PRESETS: Omit<QueuedTest, 'id' | 'status'>[] = [
  {
    name: 'FurMark 3D GPU Heavy Stress (Kombustor 4K)',
    type: 'furmark',
    durationSecs: 60,
    intensity: 'extreme',
    targetComponent: 'GPU',
  },
  {
    name: 'Prime95 Small FFTs CPU Power Burn',
    type: 'prime95',
    durationSecs: 60,
    intensity: 'heavy',
    targetComponent: 'CPU',
  },
  {
    name: 'Cinebench R23 All-Core Render Loop',
    type: 'cinebench',
    durationSecs: 45,
    intensity: 'standard',
    targetComponent: 'CPU',
  },
  {
    name: 'MATS / MODS VRAM Bank Memory Test',
    type: 'mats_vram',
    durationSecs: 30,
    intensity: 'heavy',
    targetComponent: 'VRAM',
  },
  {
    name: 'MemTest86 DDR4/DDR5 Row-Hammer Test',
    type: 'memtest',
    durationSecs: 30,
    intensity: 'standard',
    targetComponent: 'RAM',
  },
];

export const StressTestScheduler: React.FC<{
  onClose?: () => void;
  onFinishSequence?: (queue: QueuedTest[]) => void;
}> = ({ onClose, onFinishSequence }) => {
  const [queue, setQueue] = useState<QueuedTest[]>([
    { ...AVAILABLE_TEST_PRESETS[0], id: 'qt-1', status: 'queued' },
    { ...AVAILABLE_TEST_PRESETS[1], id: 'qt-2', status: 'queued' },
    { ...AVAILABLE_TEST_PRESETS[3], id: 'qt-3', status: 'queued' },
  ]);

  const [cooldownSecs, setCooldownSecs] = useState<number>(30); // 30s cooldown default
  const [isSequenceRunning, setIsSequenceRunning] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [phase, setPhase] = useState<'idle' | 'testing' | 'cooldown' | 'done'>('idle');

  // Real-time timer state
  const [secsLeft, setSecsLeft] = useState<number>(0);
  const [currentTemp, setCurrentTemp] = useState<number>(45);
  const [peakTempInTest, setPeakTempInTest] = useState<number>(45);
  const [startCooldownTemp, setStartCooldownTemp] = useState<number>(45);

  // Safety Cutoff Threshold
  const [safetyTempLimit, setSafetyTempLimit] = useState<number>(95);
  const [isSafetyCutoffTriggered, setIsSafetyCutoffTriggered] = useState<boolean>(false);

  // Custom add test state
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);

  // Add Preset to Queue
  const handleAddPreset = () => {
    const preset = AVAILABLE_TEST_PRESETS[selectedPresetIndex];
    if (!preset) return;
    const newTest: QueuedTest = {
      ...preset,
      id: `qt-${Date.now()}`,
      status: 'queued'
    };
    setQueue(prev => [...prev, newTest]);
  };

  // Remove test from Queue
  const handleRemoveTest = (id: string) => {
    if (isSequenceRunning) return;
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  // Start Sequence Execution
  const handleStartSequence = () => {
    if (queue.length === 0) return;
    setIsSequenceRunning(true);
    setIsSafetyCutoffTriggered(false);
    setCurrentIndex(0);
    startTestStep(0);
  };

  // Helper to begin test step
  const startTestStep = (idx: number) => {
    setPhase('testing');
    setSecsLeft(queue[idx].durationSecs);
    setPeakTempInTest(48);

    setQueue(prev => prev.map((q, i) => i === idx ? { ...q, status: 'running' } : q));
  };

  // Helper to begin cooldown step
  const startCooldownStep = (idx: number, finalPeakTemp: number) => {
    setPhase('cooldown');
    setSecsLeft(cooldownSecs);
    setStartCooldownTemp(finalPeakTemp);
  };

  // Main Timer Tick Engine
  useEffect(() => {
    if (!isSequenceRunning || currentIndex < 0 || currentIndex >= queue.length) return;

    const interval = setInterval(() => {
      setSecsLeft(prev => {
        if (prev <= 1) {
          // Timer finished for current phase
          if (phase === 'testing') {
            const finalPeak = peakTempInTest;
            // Record peak temp for test
            setQueue(qPrev => qPrev.map((item, i) => i === currentIndex ? { ...item, maxTempC: finalPeak, status: 'cooldown' } : item));

            // Start Cooldown if there are more tests or cooldown requested
            if (cooldownSecs > 0) {
              startCooldownStep(currentIndex, finalPeak);
            } else {
              // Skip cooldown, move to next
              advanceToNextTest(currentIndex, finalPeak, finalPeak);
            }
            return 0;
          } else if (phase === 'cooldown') {
            const endCoolTemp = currentTemp;
            advanceToNextTest(currentIndex, peakTempInTest, endCoolTemp);
            return 0;
          }
        }

        // Active simulation tick
        if (phase === 'testing') {
          // Heat up temperature based on test target and intensity
          setCurrentTemp(cTemp => {
            const nextT = Math.min(99, cTemp + (Math.random() * 2.8 + 0.5));
            setPeakTempInTest(pk => Math.max(pk, Math.round(nextT)));

            // Emergency thermal cutoff check
            if (nextT >= safetyTempLimit) {
              setIsSafetyCutoffTriggered(true);
              setIsSequenceRunning(false);
              setPhase('done');
              setQueue(qPrev => qPrev.map((item, i) => i === currentIndex ? { ...item, status: 'aborted', maxTempC: Math.round(nextT) } : item));
            }
            return Math.round(nextT);
          });
        } else if (phase === 'cooldown') {
          // Thermal recovery drop during cooldown
          setCurrentTemp(cTemp => {
            const nextT = Math.max(40, cTemp - (Math.random() * 1.8 + 0.8));
            return Math.round(nextT);
          });
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSequenceRunning, currentIndex, phase, peakTempInTest, currentTemp, cooldownSecs, queue.length, safetyTempLimit]);

  // Advance to next test in queue
  const advanceToNextTest = (completedIdx: number, peakT: number, endCoolT: number) => {
    const recovery = Number(((peakT - endCoolT) / Math.max(1, cooldownSecs)).toFixed(2));

    setQueue(prev => prev.map((item, i) => {
      if (i === completedIdx) {
        return {
          ...item,
          status: 'passed',
          maxTempC: peakT,
          cooldownTempC: endCoolT,
          recoveryRate: recovery
        };
      }
      return item;
    }));

    const nextIdx = completedIdx + 1;
    if (nextIdx < queue.length) {
      setCurrentIndex(nextIdx);
      startTestStep(nextIdx);
    } else {
      // Sequence completed!
      setIsSequenceRunning(false);
      setPhase('done');
      if (onFinishSequence) onFinishSequence(queue);
    }
  };

  // Abort Sequence
  const handleAbortSequence = () => {
    setIsSequenceRunning(false);
    setPhase('idle');
    setQueue(prev => prev.map(q => q.status === 'running' || q.status === 'cooldown' ? { ...q, status: 'aborted' } : q));
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 max-w-5xl mx-auto my-auto select-none">
      {/* Header */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Harmonogram Sekwencji Stress-Testów & Cooldown
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                isSequenceRunning
                  ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isSequenceRunning ? `SEKWENCJA W TOKU (${phase.toUpperCase()})` : 'BEZCZYNNOŚĆ'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Kolejkowanie testów obciążeniowych FurMark, Prime95, Cinebench i VRAM z monitorowaniem chłodzenia
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

      {/* Main Container */}
      <div className="p-6 bg-slate-950 flex flex-col space-y-6 max-h-[82vh] overflow-y-auto">
        
        {/* Active Test Live Monitor Gauge Banner (Visible when sequence is running) */}
        {isSequenceRunning && (
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl text-white font-bold ${
                  phase === 'testing' ? 'bg-rose-600 animate-pulse' : 'bg-cyan-600'
                }`}>
                  {phase === 'testing' ? <Flame className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    {phase === 'testing' ? queue[currentIndex]?.name : `Cooldown / Chłodzenie po testach`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Test {currentIndex + 1} z {queue.length} • Pozostało czasu: <span className="text-amber-400 font-black">{secsLeft}s</span>
                  </p>
                </div>
              </div>

              <button
                onClick={handleAbortSequence}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>AWARYJNE PRZERWANIE</span>
              </button>
            </div>

            {/* Gauge Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">AKTUALNA TEMP</span>
                <p className={`text-xl font-black mt-0.5 ${currentTemp >= 88 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  {currentTemp}°C
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Peak Max: {peakTempInTest}°C</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">FAZA TESTU</span>
                <p className="text-xl font-black text-cyan-400 mt-0.5 uppercase">{phase}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cel: {queue[currentIndex]?.targetComponent}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">OBRÓT CHŁODZENIA</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">2850 RPM</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Tryb Fan: 100% Full Speed</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px]">LIMIT BEZPIECZEŃSTWA</span>
                <p className="text-xl font-black text-rose-500 mt-0.5">{safetyTempLimit}°C</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Auto-Cutoff Enabled</p>
              </div>
            </div>
          </div>
        )}

        {/* Safety Alert Cutoff Banner if Triggered */}
        {isSafetyCutoffTriggered && (
          <div className="bg-rose-950/90 border-2 border-rose-500 p-4 rounded-2xl flex items-center gap-3 text-rose-200 text-xs font-mono">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <p className="font-extrabold text-sm text-white">PRZEKROCZONO PROG BEZPIECZEŃSTWA TEMPERATURY ({safetyTempLimit}°C)!</p>
              <p>Sekwencja została natychmiast przerwana ze względu na ryzyko uszkodzenia krzemu lub sekcji zasilania VRM.</p>
            </div>
          </div>
        )}

        {/* Add Test to Queue Bar */}
        {!isSequenceRunning && (
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Plus className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Dodaj Test do Kolejki:</span>
              <select
                value={selectedPresetIndex}
                onChange={(e) => setSelectedPresetIndex(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              >
                {AVAILABLE_TEST_PRESETS.map((p, idx) => (
                  <option key={p.type} value={idx}>
                    {p.name} ({p.durationSecs}s)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddPreset}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg transition"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj do Kolejki</span>
            </button>
          </div>
        )}

        {/* Test Queue List Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col space-y-2 p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-bold text-white">
            <span>Kolejka Testów Obciążeniowych ({queue.length})</span>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Czas Chłodzenia (Cooldown):</span>
              <select
                value={cooldownSecs}
                onChange={(e) => setCooldownSecs(parseInt(e.target.value))}
                disabled={isSequenceRunning}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-0.5 text-amber-400 font-bold focus:outline-none"
              >
                <option value={15}>15s</option>
                <option value={30}>30s</option>
                <option value={60}>60s</option>
                <option value={120}>120s</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {queue.map((test, idx) => (
              <div
                key={test.id}
                className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition ${
                  test.status === 'running'
                    ? 'bg-rose-950/40 border-rose-500/80 text-white'
                    : test.status === 'cooldown'
                    ? 'bg-cyan-950/40 border-cyan-500/80 text-white'
                    : test.status === 'passed'
                    ? 'bg-slate-950/80 border-emerald-500/50 text-slate-200'
                    : test.status === 'aborted'
                    ? 'bg-rose-950/20 border-rose-900 text-slate-400'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-[11px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-bold text-white flex items-center gap-2">
                      <span>{test.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                        {test.targetComponent}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Czas trwania: {test.durationSecs}s | Intensywność: {test.intensity.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  {test.maxTempC && (
                    <div className="text-right">
                      <span className="text-rose-400 font-extrabold block">Max: {test.maxTempC}°C</span>
                      {test.cooldownTempC && (
                        <span className="text-cyan-400 text-[10px] block">Post-Cool: {test.cooldownTempC}°C (-{test.recoveryRate}°C/s)</span>
                      )}
                    </div>
                  )}

                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                    test.status === 'passed'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : test.status === 'running'
                      ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse'
                      : test.status === 'cooldown'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-500 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {test.status.toUpperCase()}
                  </span>

                  {!isSequenceRunning && (
                    <button
                      onClick={() => handleRemoveTest(test.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <span>Próg odcięcia:</span>
            <input
              type="number"
              value={safetyTempLimit}
              onChange={e => setSafetyTempLimit(parseInt(e.target.value))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-rose-400 font-bold"
            />
            <span>°C</span>
          </div>

          <div className="flex items-center gap-2">
            {!isSequenceRunning && (
              <button
                onClick={handleStartSequence}
                disabled={queue.length === 0}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs flex items-center gap-2 shadow-xl transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>URUCHOM SEKWENCJĘ STRESS-TESTÓW</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
