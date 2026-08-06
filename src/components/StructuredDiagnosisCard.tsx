import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  CheckSquare,
  Square,
  ShieldAlert,
  Activity,
  Cpu,
  Layers,
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DiagnosticCardData } from '../types';

interface StructuredDiagnosisCardProps {
  data: DiagnosticCardData;
}

export const StructuredDiagnosisCard: React.FC<StructuredDiagnosisCardProps> = ({ data }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(true);

  if (!data) return null;

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const severity = data.thermalAnalysis?.severity || 'HIGH';

  const getSeverityBadge = () => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            KRYTYCZNY (GŁÓWNE ZWARCIE)
          </span>
        );
      case 'HIGH':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            WYSOKI (GORACO/HOTSPOT)
          </span>
        );
      default:
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/40 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            UMIARKOWANY
          </span>
        );
    }
  };

  return (
    <div id="diagnostic-card" className="my-4 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Card Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Karta Diagnostyczna Serwisu
              </h3>
              {getSeverityBadge()}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {data.detectedDevice || 'Rozpoznano podzespół płyty głównej'}
            </p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-200">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 text-slate-200 text-xs sm:text-sm">
          
          {/* Summary / Analysis Banner */}
          {data.diagnosisSummary && (
            <div className="bg-slate-950/70 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Podsumowanie Diagnozy
              </h4>
              <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
                {data.diagnosisSummary}
              </p>
            </div>
          )}

          {/* Thermal Metrics Grid */}
          {data.thermalAnalysis && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">Temp. Maksymalna (Peak)</span>
                  <span className="text-base font-bold text-red-400 font-mono">
                    {data.thermalAnalysis.estimatedPeakTemp || '88°C'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-mono">Podejrzana Strefa</span>
                  <span className="text-xs font-bold text-slate-200">
                    {data.thermalAnalysis.suspectZone || 'Sekcja Zasilania / Przetwornica PWM'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Suspect Components List */}
          {data.suspectComponents && data.suspectComponents.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-red-400" />
                Podejrzane Elementy do Weryfikacji (MOSFET / IC / Kondensatory)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.suspectComponents.map((comp, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-3 rounded-xl border border-red-900/40 hover:border-red-500/50 transition"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded text-xs">
                        {comp.designator}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{comp.type}</span>
                    </div>
                    <p className="text-slate-300 text-xs">{comp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voltage Test Points Table */}
          {data.voltageTestPoints && data.voltageTestPoints.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Tabela Pomiarów Multimetrem (Pomiary na cewkach i liniach zasilania)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Linia Zasilania</th>
                      <th className="p-2.5">Napięcie</th>
                      <th className="p-2.5">Tryb Multimetru</th>
                      <th className="p-2.5">Wartość Prawidłowa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {data.voltageTestPoints.map((tp, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-2.5 font-bold text-amber-400">{tp.rail}</td>
                        <td className="p-2.5">{tp.expected}</td>
                        <td className="p-2.5 text-slate-400">{tp.multimeterMode}</td>
                        <td className="p-2.5 text-emerald-400">{tp.normalReading}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Step-by-Step Repair Checklist */}
          {data.repairSteps && data.repairSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Plan Procedury Naprawczej (Lista Kontrolna Serwisanta)
              </h4>
              <div className="space-y-2">
                {data.repairSteps.map((step, idx) => {
                  const isDone = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <button className="mt-0.5 text-emerald-400 shrink-0">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <span className="text-xs sm:text-sm leading-relaxed">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
