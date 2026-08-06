import React, { useState, useMemo } from 'react';
import {
  X,
  Cpu,
  Terminal,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Search,
  Layers,
  Wrench,
  Flame,
  Activity
} from 'lucide-react';

interface MatsModsVramDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export interface VramChipStatus {
  id: string; // e.g., 'U1', 'U2'
  channel: string; // e.g., 'A0', 'A1'
  side: 'TOP' | 'BOTTOM';
  bits: string; // e.g., 'DQA0-7'
  readErrors: number;
  writeErrors: number;
  status: 'OK' | 'ERROR' | 'UNKNOWN';
  chipModel: string;
  sizeMb: number;
  addressOffset?: string;
}

export interface MatsParsedReport {
  gpuModel: string;
  modsVersion: string;
  testMb: number;
  totalErrors: number;
  failingChannels: string[];
  chips: VramChipStatus[];
  rawLog: string;
  recommendationPl: string;
}

// SAMPLE MATS REPORT PRESETS FOR TECHNICIAN DEMO
const PRESET_MATS_REPORTS = [
  {
    title: '🔴 RTX 3090 - Uszkodzony Układ VRAM U1 (Kanai A0 - Read Error)',
    gpu: 'NVIDIA GeForce RTX 3090 (GA102-300-A1)',
    log: `mats version 450.09. Testing GA102 with 24576 MB of memory.
Modified MATS code for testing GDDR6X VRAM.
Errors found in memory range:
Bank0:
  FBIOA0 [  0.. 31] : 2415082 errors (read errors)
  FBIOA1 [ 32.. 63] : 0 errors
  FBIOB0 [ 64.. 95] : 0 errors
  FBIOB1 [ 96..127] : 0 errors
  FBIOC0 [128..159] : 0 errors
  FBIOC1 [160..191] : 0 errors
  FBIOD0 [192..223] : 0 errors
  FBIOD1 [224..255] : 0 errors
  FBIOE0 [256..287] : 0 errors
  FBIOE1 [288..319] : 0 errors
  FBIOF0 [320..351] : 0 errors
  FBIOF1 [352..383] : 0 errors

Failing Bits:
  A000000000000000000000000000000000000000000000000000000000000000
  Read Error Count: 2415082
  Write Error Count: 0

Error Summary:
  Channel A0 (Chip U1 - Micron GDDR6X D9WCW) -> FAIL
  All other channels PASS.
Stop on error code 000000000020 (RAM FAIL).`
  },
  {
    title: '🔴 RTX 2080 Ti - Uszkodzone 2 Układy VRAM Micron D9WCW (Kanał A0 + B1)',
    gpu: 'NVIDIA GeForce RTX 2080 Ti (TU102-300-A1)',
    log: `mats version 400.184. Testing TU102 with 11264 MB of memory.
Errors found in memory range:
  FBIOA0 [  0.. 31] : 841920 errors
  FBIOA1 [ 32.. 63] : 0 errors
  FBIOB0 [ 64.. 95] : 0 errors
  FBIOB1 [ 96..127] : 194021 errors
  FBIOC0 [128..159] : 0 errors
  FBIOC1 [160..191] : 0 errors

Failing Bits:
  Channel A0 (Chip U1) Read Errors: 841920
  Channel B1 (Chip U4) Read Errors: 194021

Recommendation: Replace Micron GDDR6 chips U1 and U4 (K4Z80325BC-HC14 / D9WCW).`
  },
  {
    title: '🟢 RTX 4080 - PASS 100% (Wszystkie Banki VRAM Sprawne)',
    gpu: 'NVIDIA GeForce RTX 4080 (AD104-400-A1)',
    log: `mats version 520.12. Testing AD104 with 16384 MB of memory.
Testing memory range 0000000000 to 003fffffff (100% coverage).
FBIOA0: 0 errors
FBIOA1: 0 errors
FBIOB0: 0 errors
FBIOB1: 0 errors
FBIOC0: 0 errors
FBIOC1: 0 errors
FBIOD0: 0 errors
FBIOD1: 0 errors

Pass 1/1 completed without errors.
All 16 GB VRAM chips functioning within specifications.`
  }
];

export const MatsModsVramDiagnosticModal: React.FC<MatsModsVramDiagnosticModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [matsInputLog, setMatsInputLog] = useState<string>(PRESET_MATS_REPORTS[0].log);
  const [testMbSize, setTestMbSize] = useState<number>(20);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [selectedChipId, setSelectedChipId] = useState<string | null>('U1');

  // Parser function for MATS/MODS log text
  const parsedReport: MatsParsedReport = useMemo(() => {
    const text = matsInputLog;
    let gpuModel = 'Karta Graficzna NVIDIA (Wykrywanie z Logu)';
    let modsVersion = 'MODS / MATS v400+';
    let testMb = 20;
    let totalErrors = 0;
    const failingChannels: string[] = [];

    // Extract GPU Architecture
    if (text.includes('GA102')) gpuModel = 'NVIDIA GA102 (RTX 3080 / RTX 3090 / RTX 3090 Ti)';
    else if (text.includes('GA104')) gpuModel = 'NVIDIA GA104 (RTX 3060 Ti / RTX 3070 / RTX 3070 Ti)';
    else if (text.includes('TU102')) gpuModel = 'NVIDIA TU102 (RTX 2080 Ti / Titan RTX)';
    else if (text.includes('TU106') || text.includes('TU104')) gpuModel = 'NVIDIA TU104 / TU106 (RTX 2060 / 2070 / 2080)';
    else if (text.includes('AD102') || text.includes('AD104')) gpuModel = 'NVIDIA Ada Lovelace (RTX 4070 / 4080 / 4090)';
    else if (text.includes('GP104') || text.includes('GP102')) gpuModel = 'NVIDIA Pascal (GTX 1070 / 1080 / 1080 Ti)';

    // Extract Version
    const verMatch = text.match(/mats version ([\d\.]+)/i);
    if (verMatch) modsVersion = `MATS v${verMatch[1]}`;

    // Extract Memory Channels
    const channelRegex = /FBIO([A-F][01])\s*\[[^\]]+\]\s*:\s*(\d+)\s*errors/gi;
    let match;

    const channelMap: Record<string, number> = {
      A0: 0, A1: 0, B0: 0, B1: 0, C0: 0, C1: 0, D0: 0, D1: 0, E0: 0, E1: 0, F0: 0, F1: 0
    };

    while ((match = channelRegex.exec(text)) !== null) {
      const ch = match[1].toUpperCase();
      const errCount = parseInt(match[2], 10);
      channelMap[ch] = errCount;
      if (errCount > 0) {
        totalErrors += errCount;
        if (!failingChannels.includes(ch)) failingChannels.push(ch);
      }
    }

    // Default 12 VRAM chip mappings (A0->U1, A1->U2, B0->U3, B1->U4, C0->U5, C1->U6, D0->U7, D1->U8, E0->U9, E1->U10, F0->U11, F1->U12)
    const chips: VramChipStatus[] = [
      { id: 'U1', channel: 'A0', side: 'TOP', bits: 'DQA0-7', readErrors: channelMap['A0'] || 0, writeErrors: 0, status: channelMap['A0'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U2', channel: 'A1', side: 'TOP', bits: 'DQA8-15', readErrors: channelMap['A1'] || 0, writeErrors: 0, status: channelMap['A1'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U3', channel: 'B0', side: 'TOP', bits: 'DQB0-7', readErrors: channelMap['B0'] || 0, writeErrors: 0, status: channelMap['B0'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U4', channel: 'B1', side: 'TOP', bits: 'DQB8-15', readErrors: channelMap['B1'] || 0, writeErrors: 0, status: channelMap['B1'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U5', channel: 'C0', side: 'TOP', bits: 'DQC0-7', readErrors: channelMap['C0'] || 0, writeErrors: 0, status: channelMap['C0'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U6', channel: 'C1', side: 'TOP', bits: 'DQC8-15', readErrors: channelMap['C1'] || 0, writeErrors: 0, status: channelMap['C1'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U7', channel: 'D0', side: 'TOP', bits: 'DQD0-7', readErrors: channelMap['D0'] || 0, writeErrors: 0, status: channelMap['D0'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 },
      { id: 'U8', channel: 'D1', side: 'TOP', bits: 'DQD8-15', readErrors: channelMap['D1'] || 0, writeErrors: 0, status: channelMap['D1'] > 0 ? 'ERROR' : 'OK', chipModel: 'Micron / Samsung GDDR6(X)', sizeMb: 2048 }
    ];

    let rec = 'Wszystkie banki pamięci VRAM przeszły test MATS bez błędów. Karta jest w pełni sprawna pod względem szyny RAM.';
    if (failingChannels.length > 0) {
      rec = `Wykryto ${totalErrors.toLocaleString()} błędów pamięci VRAM na kanałach [${failingChannels.join(', ')}]. Zalecana wymiana układów BGA: ${chips.filter((c) => c.status === 'ERROR').map((c) => `${c.id} (${c.channel})`).join(', ')}. Wymagane reballing / wlutowanie nowej kości Micron/Samsung GDDR6.`;
    }

    return {
      gpuModel,
      modsVersion,
      testMb,
      totalErrors,
      failingChannels,
      chips,
      rawLog: text,
      recommendationPl: rec
    };
  }, [matsInputLog]);

  const matsCommandStr = `./mats -e ${testMbSize} -b 1 -c 1 | tee mats_result.txt`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(matsCommandStr);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleSendToAi = () => {
    if (!onSendToChat) return;
    const prompt = `Analiza Raportu MATS/MODS VRAM dla Karty Graficznej:
- Karta GPU: ${parsedReport.gpuModel}
- Wersja MATS: ${parsedReport.modsVersion}
- Liczba Błędów: ${parsedReport.totalErrors}
- Uszkodzone Kanały: ${parsedReport.failingChannels.length > 0 ? parsedReport.failingChannels.join(', ') : 'Brak (PASS)'}
- Zalecenie: ${parsedReport.recommendationPl}

Log MATS:
\`\`\`
${parsedReport.rawLog.slice(0, 800)}
\`\`\`

Podaj szczegółową instrukcję lutowniczą:
1. Jaki profil stacji lutowniczej BGA (strefy grzania) zastosować do wymiany uszkodzonych kości VRAM?
2. Jaki topik (np. AMTECH NC-559-ASM) i kulki BGA (0.45mm / 0.50mm) są wymagane?
3. Jak zweryfikować połączenia po wlutowaniu nowej kości?`;
    onSendToChat(prompt);
  };

  if (!isOpen) return null;

  const activeChipDetail = parsedReport.chips.find((c) => c.id === selectedChipId) || parsedReport.chips[0];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
              <Terminal className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  DIAGNOSTYKA VRAM MATS / MODS NVIDIA
                </h2>
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  v400 / v450 / v520
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatyczny parser pliku logu MATS/MODS oraz mapa uszkodzonych kości BGA (Kanały A0, A1, B0, B1, C0, C1)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {/* Preset Buttons & Boot Command Generator */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-slate-300 font-bold flex items-center gap-1.5 text-xs">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Załaduj Przykładowy Log MATS do Analizy:</span>
              </span>

              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {PRESET_MATS_REPORTS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMatsInputLog(preset.log)}
                    className="text-[10px] font-mono font-bold bg-slate-900 hover:bg-purple-900/40 text-purple-200 border border-purple-500/30 px-2.5 py-1 rounded-lg transition truncate max-w-[220px]"
                    title={preset.title}
                  >
                    {preset.title.slice(0, 28)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Boot Command Line Bar */}
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                <Terminal className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-400 text-[10px]">Komenda Bootable Linux:</span>
                <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all font-bold">
                  {matsCommandStr}
                </span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <div className="flex items-center space-x-1 text-[11px] text-slate-300">
                  <span>Rozmiar Testu:</span>
                  <select
                    value={testMbSize}
                    onChange={(e) => setTestMbSize(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-700 text-amber-300 font-mono text-[11px] rounded px-2 py-1 focus:outline-none"
                  >
                    <option value={5}>5 MB (Szybki 5 sek)</option>
                    <option value={20}>20 MB (Standard)</option>
                    <option value={50}>50 MB (Głęboki)</option>
                    <option value={200}>200 MB (Pełny)</option>
                  </select>
                </div>

                <button
                  onClick={handleCopyCommand}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 transition"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Skopiowano!' : 'Kopiuj'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Log Text Input & Real-Time Parser Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Raw MATS Log Input Area */}
            <div className="space-y-1.5 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold text-xs flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  <span>Wklej Log MATS/MODS (`report.txt` / `mats.log`):</span>
                </label>
                <button
                  onClick={() => setMatsInputLog('')}
                  className="text-[10px] text-slate-400 hover:text-white underline"
                >
                  Wyczyść
                </button>
              </div>

              <textarea
                value={matsInputLog}
                onChange={(e) => setMatsInputLog(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-emerald-400 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                placeholder="Wklej zawartość pliku report.txt wygenerowanego przez komendę ./mats..."
              />
            </div>

            {/* Parsed Diagnostic Results Box */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Wyniki Analizy MATS:</span>
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      parsedReport.totalErrors > 0
                        ? 'bg-red-500/20 text-red-300 border-red-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {parsedReport.totalErrors > 0 ? `USZKODZENIE (${parsedReport.totalErrors} Błędów)` : 'SPRAWNA (PASS 100%)'}
                  </span>
                </div>

                <div className="space-y-2 pt-3 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Wykryta Karta GPU:</span>
                    <span className="text-amber-300 font-bold">{parsedReport.gpuModel}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Wersja MATS:</span>
                    <span className="text-purple-300 font-bold">{parsedReport.modsVersion}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Suma Błędów Odczytu/Zapisu:</span>
                    <span className={parsedReport.totalErrors > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {parsedReport.totalErrors.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Uszkodzone Kanały Pamięci:</span>
                    <span className="text-cyan-300 font-bold">
                      {parsedReport.failingChannels.length > 0 ? parsedReport.failingChannels.join(', ') : 'Brak'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zalecenie Diagnostyczne:</span>
                  <p className="text-slate-200 text-xs font-sans leading-normal">
                    {parsedReport.recommendationPl}
                  </p>
                </div>
              </div>

              {onSendToChat && (
                <button
                  onClick={handleSendToAi}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Zapytaj AI o Instrukcję Lutowania BGA &amp; Stencil</span>
                </button>
              )}
            </div>

          </div>

          {/* Interactive Physical PCB VRAM Chip Layout Map */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-sm text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Fizyczny Schemat Rozmieszczenia Kości VRAM na Płytce PCB (BGA Layout):</span>
              </span>
              <span className="text-[11px] text-slate-400">Kliknij kość, aby zobaczyć szczegóły lutowania</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Visual GPU PCB Layout Box */}
              <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 relative flex items-center justify-center min-h-[220px]">
                
                {/* Center GPU Core Block */}
                <div className="w-28 h-28 bg-gradient-to-tr from-slate-800 via-slate-700 to-slate-800 border-2 border-amber-500/50 rounded-2xl flex flex-col items-center justify-center text-center shadow-2xl shadow-amber-500/10 z-10">
                  <Cpu className="w-8 h-8 text-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-amber-300 mt-1">GPU CORE</span>
                  <span className="text-[8px] text-slate-400">GA102 / AD104</span>
                </div>

                {/* VRAM Chips Around GPU Core */}
                {parsedReport.chips.map((chip, idx) => {
                  // Calculate positioning around GPU square
                  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
                  const angle = angles[idx % angles.length];
                  const radius = 105; // px from center
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;

                  const isSelected = selectedChipId === chip.id;
                  const isError = chip.status === 'ERROR';

                  return (
                    <button
                      key={chip.id}
                      onClick={() => setSelectedChipId(chip.id)}
                      style={{ transform: `translate(${x}px, ${y}px)` }}
                      className={`absolute w-12 h-10 rounded-lg border-2 flex flex-col items-center justify-center font-mono text-[9px] font-bold transition-all z-20 shadow-xl ${
                        isError
                          ? 'bg-red-950/90 border-red-500 text-red-200 animate-bounce ring-2 ring-red-500/50'
                          : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-200 hover:scale-110'
                      } ${isSelected ? 'ring-4 ring-amber-400 scale-110 z-30' : ''}`}
                      title={`Układ ${chip.id} (${chip.channel}) - ${chip.readErrors} Błędów`}
                    >
                      <span>{chip.id}</span>
                      <span className="text-[8px] opacity-80">{chip.channel}</span>
                    </button>
                  );
                })}

              </div>

              {/* Selected Chip Detail Card */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-amber-300 text-xs">
                    Szczegóły Kości {activeChipDetail.id} ({activeChipDetail.channel})
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      activeChipDetail.status === 'ERROR'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {activeChipDetail.status}
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model Układu:</span>
                    <span className="text-white font-bold">{activeChipDetail.chipModel}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Pojemność:</span>
                    <span className="text-cyan-300 font-bold">{activeChipDetail.sizeMb} MB (16 Gb)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Błędy Odczytu:</span>
                    <span className={activeChipDetail.readErrors > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {activeChipDetail.readErrors.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Rozmiar Kulek BGA:</span>
                    <span className="text-amber-300 font-bold">0.45 mm SAC300</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Sito BGA Stencil:</span>
                    <span className="text-purple-300 font-bold">D9WCW / GDDR6 Direct-Heat</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 leading-normal">
                  💡 <strong>Porada warsztatowa:</strong> Przed wlutowaniem nowej kości oczyszczaj pad PCB plecionką miedzianą z topnikiem AMTECH w temperaturze 360°C.
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Serwis Pogotowie Rafał Jarosz • Warszawski Moduł Diagnozy VRAM BGA
          </span>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 transition"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
