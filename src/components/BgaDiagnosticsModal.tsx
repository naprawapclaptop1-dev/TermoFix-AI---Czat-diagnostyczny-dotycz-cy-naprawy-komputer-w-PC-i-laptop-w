import React, { useState } from 'react';
import { Cpu, AlertTriangle, CheckCircle2, Search, ArrowRight, Zap, Wrench, ShieldAlert } from 'lucide-react';

interface BgaPadInfo {
  coord: string; // e.g. A1
  signal: string;
  expectedDiodeV: string;
  expectedResistance: string;
  failureRisk: string;
  type: 'gnd' | 'power' | 'data' | 'clock' | 'nc';
}

function BgaFootprintGridVisualizer({ chipDesignator }: { chipDesignator: string }) {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const getPadData = (r: string, c: number): BgaPadInfo => {
    const coord = `${r}${c}`;
    
    // Corner pads (A1, A8, H1, H8) - high mechanical stress
    if ((r === 'A' || r === 'H') && (c === 1 || c === 8)) {
      return {
        coord,
        signal: 'GND_CORNER (Masa Narożna PCB)',
        expectedDiodeV: '0.000 V',
        expectedResistance: '0.1 Ω (Zwarcie do Masy)',
        failureRisk: 'NAJWYŻSZE RYZYKO: Pęknięcie kulki BGA przy upadku lub wygięciu laminatu -> Oderwanie pada lutowniczego z mikropromieniem.',
        type: 'gnd'
      };
    }

    // Power pads
    if (r === 'A' || r === 'H') {
      return {
        coord,
        signal: 'FBVDD / VDDQ (1.35V Power Rail)',
        expectedDiodeV: '0.345 V',
        expectedResistance: '120 Ω do Masy',
        failureRisk: 'Ryzyko zwarcia kondensatora MLCC w linii zasilania zasilaczem FBVDD -> Przebicie tranzystorów.',
        type: 'power'
      };
    }

    // Data pads
    if (r === 'B' || r === 'G' || r === 'C' || r === 'F') {
      const bitIndex = (c % 4) * 8 + (r.charCodeAt(0) % 8);
      return {
        coord,
        signal: `DQ${bitIndex} (Linia Danych VRAM-GPU)`,
        expectedDiodeV: '0.420 V',
        expectedResistance: '450 Ω do Masy',
        failureRisk: 'Uszkodzona linia danych w teście MATS (Błędy bitów MATS) -> Reballing lub wymiana kości.',
        type: 'data'
      };
    }

    // Clock / Control pads
    if (r === 'D' || r === 'E') {
      if (c === 4 || c === 5) {
        return {
          coord,
          signal: 'WCK_CLK# (Taktowanie Zegara 1.75GHz)',
          expectedDiodeV: '0.480 V',
          expectedResistance: '680 Ω do Masy',
          failureRisk: 'Utleniona kulka BGA pod wpływem temperatury -> Artefakty 3D i reset sterownika ekranu.',
          type: 'clock'
        };
      }
    }

    return {
      coord,
      signal: 'VREF / ZQ (Linia Kalibracji Oporności)',
      expectedDiodeV: '0.510 V',
      expectedResistance: '240 Ω do Masy',
      failureRisk: 'Niestabilność szyny pod obciążeniem - zimny lut.',
      type: 'nc'
    };
  };

  const [hoveredPad, setHoveredPad] = useState<BgaPadInfo | null>(getPadData('A', 1));

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
            Interaktywny Wizualizator Siatki BGA Footprint ({chipDesignator})
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">
          Najedź kursor na kulkę BGA (A1-H8), aby odczytać spadek V diodowy, oporność i punkty awarii
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* 8x8 Grid */}
        <div className="md:col-span-6 bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
          <div className="text-[10px] text-purple-400 font-mono font-bold mb-2 uppercase">
            Siatka Lutownicza BGA 64-BALL Footprint (Widok Od Spodu IC)
          </div>
          <div className="grid grid-cols-8 gap-1.5">
            {rows.map((r) =>
              cols.map((c) => {
                const pad = getPadData(r, c);
                const isSelected = hoveredPad?.coord === pad.coord;

                let bgClass = 'bg-slate-800 text-slate-400 hover:bg-purple-600 hover:text-white';
                if (pad.type === 'gnd') bgClass = 'bg-red-950/80 border-red-500/50 text-red-300 hover:bg-red-600 hover:text-white';
                if (pad.type === 'power') bgClass = 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950';
                if (pad.type === 'data') bgClass = 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950';
                if (pad.type === 'clock') bgClass = 'bg-purple-950/80 border-purple-500/50 text-purple-300 hover:bg-purple-500 hover:text-white';

                return (
                  <button
                    key={pad.coord}
                    onMouseEnter={() => setHoveredPad(pad)}
                    onClick={() => setHoveredPad(pad)}
                    type="button"
                    className={`w-7 h-7 rounded-full text-[9px] font-mono font-bold border transition flex items-center justify-center ${bgClass} ${
                      isSelected ? 'ring-2 ring-white scale-110 z-10 shadow-lg' : ''
                    }`}
                  >
                    {pad.coord}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex flex-wrap gap-2 text-[9px] mt-3 pt-2 border-t border-slate-800/80 text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Masa (GND)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Zasilanie (FBVDD)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Dane (DQ)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Zegar (CLK)</span>
          </div>
        </div>

        {/* Hovered Pad Telemetry Details */}
        <div className="md:col-span-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
          {hoveredPad ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 font-mono text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Współrzędna Pada BGA: {hoveredPad.coord}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {hoveredPad.type.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Sygnał Szyny:</span>
                  <span className="font-mono font-bold text-cyan-300">{hoveredPad.signal}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Pomiary Trybu Diodowego:</span>
                  <span className="font-mono font-bold text-emerald-400">{hoveredPad.expectedDiodeV}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Projektowana Oporność do Masy:</span>
                  <span className="font-mono text-slate-200">{hoveredPad.expectedResistance}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1 mt-2">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Typowe Usterki Dla Pada {hoveredPad.coord}:
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {hoveredPad.failureRisk}
                </p>
              </div>
            </>
          ) : (
            <div className="text-slate-500 text-center py-8 text-xs">
              Najedź na dowolną kulkę BGA na siatce po lewej stronie.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BgaChip {
  id: string; // e.g., 'A0_0', 'A0_1', 'B0_0', 'B0_1', etc.
  bank: string;
  designator: string; // U501, U502, etc.
  status: 'healthy' | 'damaged' | 'warning';
  channel: string;
  bitErrorCount: number;
  temperature: number;
  manufacturer: string;
}

interface BgaDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

const DEFAULT_CHIPS: BgaChip[] = [
  { id: 'A0_0', bank: 'BANK A0', designator: 'U501', status: 'healthy', channel: 'Channel A (Low)', bitErrorCount: 0, temperature: 42, manufacturer: 'Samsung GDDR6' },
  { id: 'A0_1', bank: 'BANK A0', designator: 'U502', status: 'healthy', channel: 'Channel A (High)', bitErrorCount: 0, temperature: 44, manufacturer: 'Samsung GDDR6' },
  { id: 'A1_0', bank: 'BANK A1', designator: 'U503', status: 'healthy', channel: 'Channel A1 (Low)', bitErrorCount: 0, temperature: 43, manufacturer: 'Samsung GDDR6' },
  { id: 'A1_1', bank: 'BANK A1', designator: 'U504', status: 'healthy', channel: 'Channel A1 (High)', bitErrorCount: 0, temperature: 41, manufacturer: 'Samsung GDDR6' },
  { id: 'B0_0', bank: 'BANK B0', designator: 'U601', status: 'damaged', channel: 'Channel B (Low)', bitErrorCount: 14208, temperature: 78, manufacturer: 'Samsung GDDR6' },
  { id: 'B0_1', bank: 'BANK B0', designator: 'U602', status: 'warning', channel: 'Channel B (High)', bitErrorCount: 32, temperature: 62, manufacturer: 'Samsung GDDR6' },
  { id: 'B1_0', bank: 'BANK B1', designator: 'U603', status: 'healthy', channel: 'Channel B1 (Low)', bitErrorCount: 0, temperature: 45, manufacturer: 'Samsung GDDR6' },
  { id: 'B1_1', bank: 'BANK B1', designator: 'U604', status: 'healthy', channel: 'Channel B1 (High)', bitErrorCount: 0, temperature: 43, manufacturer: 'Samsung GDDR6' },
];

export function BgaDiagnosticsModal({ isOpen, onClose, onSendToChat }: BgaDiagnosticsModalProps) {
  const [gpuModel, setGpuModel] = useState<string>('NVIDIA RTX 3060 12GB (GA106)');
  const [testTool, setTestTool] = useState<'mats' | 'mods' | 'memtest'>('mats');
  const [chips, setChips] = useState<BgaChip[]>(DEFAULT_CHIPS);
  const [selectedChip, setSelectedChip] = useState<BgaChip | null>(DEFAULT_CHIPS.find(c => c.status === 'damaged') || DEFAULT_CHIPS[0]);
  const [rawLogText, setRawLogText] = useState<string>(`mats v367.38.01 report:
====================================================
Subtest: 20
Error Code: 000000000000 (VRAM Error)
Failing Bits:
Bank B0 (U601): READ ERROR at bit 0x00000010 (14,208 errors)
Bank B0 (U602): READ ERROR at bit 0x00000002 (32 errors - crosstalk)
All other channels (A0, A1, B1): PASS (0 errors)
====================================================
RECOMMENDED ACTION: Replace VRAM IC at U601 or reball BGA.`);

  if (!isOpen) return null;

  const damagedChip = chips.find(c => c.status === 'damaged');

  const handleParseLog = () => {
    // Parse simulated MATS log
    if (rawLogText.toLowerCase().includes('bank a0') || rawLogText.toLowerCase().includes('u501')) {
      setChips(prev => prev.map(c => c.id === 'A0_0' ? { ...c, status: 'damaged', bitErrorCount: 8912 } : { ...c, status: 'healthy', bitErrorCount: 0 }));
    } else {
      setChips(DEFAULT_CHIPS);
    }
  };

  const handleConsultAI = () => {
    if (!onSendToChat) return;
    const prompt = `Przeanalizuj błąd kości BGA VRAM/RAM dla ${gpuModel}.
Wykryta uszkodzona kość: ${damagedChip ? `${damagedChip.bank} (${damagedChip.designator}) - Channel: ${damagedChip.channel}` : 'Nieokreślono'}.
Błędy bitów: ${damagedChip?.bitErrorCount || 0} błędów z odczytu MATS/MODS.
Podaj instrukcję krok po kroku:
1. Temperatura profilu lutowania BGA (Reballing Sn63/Pb37 lub SAC305).
2. Jak zmienić rezystory Straps/Board ID, aby wyłączyć uszkodzony kanał pamięci (Disable Channel B / RAM Strapping).
3. Zamienniki układów VRAM dla ${damagedChip?.manufacturer || 'GDDR6'}.`;
    onSendToChat(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8 text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                Skaner &amp; Detektor Uszkodzonych Kości BGA VRAM / RAM
                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono">
                  BGA MATS/MODS
                </span>
              </h2>
              <p className="text-xs text-slate-4-0 font-normal">
                Wykrywa dokładną uszkodzoną kość pamięci na płycie głównej / karcie graficznej i lokalizuje układ na schemacie PCB.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Model Karty / Płyty BGA:</label>
            <select
              value={gpuModel}
              onChange={(e) => setGpuModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs py-2 px-3 text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="NVIDIA RTX 3060 12GB (GA106)">NVIDIA RTX 3060 12GB (GA106 - GDDR6)</option>
              <option value="NVIDIA RTX 2060 6GB (TU106)">NVIDIA RTX 2060 6GB (TU106 - GDDR6)</option>
              <option value="NVIDIA GTX 1060 6GB (GP106)">NVIDIA GTX 1060 6GB (GP106 - GDDR5)</option>
              <option value="AMD Radeon RX 6700 XT 12GB">AMD Radeon RX 6700 XT 12GB (GDDR6)</option>
              <option value="Laptop Soldered LPDDR4X (Board RAM)">Płyta Główna Laptopa (LPDDR4X Soldered RAM)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Narzędzie Diagnostyczne:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTestTool('mats')}
                className={`flex-1 text-xs py-2 px-3 rounded-lg border font-medium transition ${
                  testTool === 'mats' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Nvidia MATS
              </button>
              <button
                onClick={() => setTestTool('mods')}
                className={`flex-1 text-xs py-2 px-3 rounded-lg border font-medium transition ${
                  testTool === 'mods' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                Nvidia MODS
              </button>
              <button
                onClick={() => setTestTool('memtest')}
                className={`flex-1 text-xs py-2 px-3 rounded-lg border font-medium transition ${
                  testTool === 'memtest' ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                AMD MemTest
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleParseLog}
              className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Search className="w-4 h-4 text-purple-400" />
              Skanuj Raport Logów
            </button>
          </div>
        </div>

        {/* Visual PCB Layout Grid of BGA Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Wirtualna Mapa Układu Pamięci PCB BGA
            </h3>
            <span className="text-xs text-slate-400">
              Kliknij kość, aby wyświetlić szczegóły szyny adresowej i parametry wymiany
            </span>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative min-h-[280px] flex items-center justify-center">
            
            {/* GPU / CPU Die in Center */}
            <div className="w-36 h-36 bg-slate-900 border-2 border-amber-500/40 rounded-2xl flex flex-col items-center justify-center shadow-lg shadow-amber-500/10 z-10 text-center p-2">
              <Cpu className="w-8 h-8 text-amber-400 mb-1" />
              <div className="font-bold text-xs text-slate-200">{gpuModel.split(' ')[1] || 'GPU DIE'}</div>
              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">CORE GA106</div>
              <div className="text-[9px] text-slate-500 mt-1">256-bit Bus</div>
            </div>

            {/* Surrounding BGA Chips */}
            {/* Top Bank A */}
            <div className="absolute top-4 flex gap-4">
              {chips.filter(c => c.bank.includes('A0')).map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip)}
                  className={`p-3 rounded-xl border text-center transition min-w-[95px] ${
                    selectedChip?.id === chip.id ? 'ring-2 ring-purple-400' : ''
                  } ${
                    chip.status === 'damaged'
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                      : chip.status === 'warning'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{chip.designator}</div>
                  <div className="text-[10px] opacity-80">{chip.bank}</div>
                  <div className="text-[9px] font-mono mt-1">
                    {chip.status === 'damaged' ? `❌ ${chip.bitErrorCount} ERR` : '✓ OK'}
                  </div>
                </button>
              ))}
            </div>

            {/* Right Bank B */}
            <div className="absolute right-6 flex flex-col gap-4">
              {chips.filter(c => c.bank.includes('B0')).map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip)}
                  className={`p-3 rounded-xl border text-center transition min-w-[95px] ${
                    selectedChip?.id === chip.id ? 'ring-2 ring-purple-400' : ''
                  } ${
                    chip.status === 'damaged'
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse shadow-lg shadow-red-500/20'
                      : chip.status === 'warning'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{chip.designator}</div>
                  <div className="text-[10px] opacity-80">{chip.bank}</div>
                  <div className="text-[9px] font-mono mt-1">
                    {chip.status === 'damaged' ? `❌ ${chip.bitErrorCount} ERR` : chip.status === 'warning' ? `⚠️ ${chip.bitErrorCount} ERR` : '✓ OK'}
                  </div>
                </button>
              ))}
            </div>

            {/* Bottom Bank A1 / B1 */}
            <div className="absolute bottom-4 flex gap-4">
              {chips.filter(c => c.bank.includes('A1')).map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip)}
                  className={`p-3 rounded-xl border text-center transition min-w-[95px] ${
                    selectedChip?.id === chip.id ? 'ring-2 ring-purple-400' : ''
                  } ${
                    chip.status === 'damaged'
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                      : chip.status === 'warning'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{chip.designator}</div>
                  <div className="text-[10px] opacity-80">{chip.bank}</div>
                  <div className="text-[9px] font-mono mt-1">
                    {chip.status === 'damaged' ? `❌ ${chip.bitErrorCount} ERR` : '✓ OK'}
                  </div>
                </button>
              ))}
            </div>

            {/* Left Bank B1 */}
            <div className="absolute left-6 flex flex-col gap-4">
              {chips.filter(c => c.bank.includes('B1')).map(chip => (
                <button
                  key={chip.id}
                  onClick={() => setSelectedChip(chip)}
                  className={`p-3 rounded-xl border text-center transition min-w-[95px] ${
                    selectedChip?.id === chip.id ? 'ring-2 ring-purple-400' : ''
                  } ${
                    chip.status === 'damaged'
                      ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse'
                      : chip.status === 'warning'
                      ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-800 text-emerald-300 hover:border-emerald-500'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{chip.designator}</div>
                  <div className="text-[10px] opacity-80">{chip.bank}</div>
                  <div className="text-[9px] font-mono mt-1">
                    {chip.status === 'damaged' ? `❌ ${chip.bitErrorCount} ERR` : '✓ OK'}
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Selected Chip Diagnostic Details */}
        {selectedChip && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Wybrany Układ:</span>
                <span className="text-xs font-bold font-mono text-purple-300">{selectedChip.designator} ({selectedChip.bank})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Kanał Pamięci:</span>
                <span className="text-xs text-slate-200 font-mono">{selectedChip.channel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Typ Kości BGA:</span>
                <span className="text-xs text-slate-200">{selectedChip.manufacturer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Status Testu MATS:</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedChip.status === 'damaged' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {selectedChip.status === 'damaged' ? `USZKODZONA (${selectedChip.bitErrorCount} błędów)` : 'PRAWIDŁOWA'}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Sugerowana Naprawa dla {selectedChip.designator}:
              </div>
              {selectedChip.status === 'damaged' ? (
                <ul className="list-disc list-inside text-[11px] space-y-1 text-slate-300">
                  <li><strong>Metoda A (Wymiana IC):</strong> Wylutuj układ BGA przy 220°C i wlutuj nową kość {selectedChip.manufacturer}.</li>
                  <li><strong>Metoda B (Reballing):</strong> Wykonaj reballing kulkami 0.45mm Sn63/Pb37.</li>
                  <li><strong>Metoda C (Wyłączenie Kanału):</strong> Zmień rezystor Strap z 10k na 45k, aby przestawić kartę w tryb wyłączonego kanału B.</li>
                </ul>
              ) : (
                <p className="text-[11px] text-emerald-400">
                  Układ przechodzi pomyślnie testy bezbłędnej transmisji bitowej. Nie wymaga ingerencji.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Interactive BGA Footprint Matrix & Pin Resistance Visualizer */}
        <BgaFootprintGridVisualizer chipDesignator={selectedChip?.designator || 'U601'} />

        {/* Raw MATS/MODS Log Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400">
            Wklej surowe logi z programu MATS / MODS lub MemTest:
          </label>
          <textarea
            value={rawLogText}
            onChange={(e) => setRawLogText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono p-3 text-slate-300 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Obsługuje karty Nvidia RTX/GTX oraz pamięci LPDDR4X wlutowane w płyty główne.
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition"
            >
              Zamknij
            </button>
            <button
              onClick={handleConsultAI}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition"
            >
              Poproś Asystenta AI o Instrukcję Wymiany / Reballingu
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
