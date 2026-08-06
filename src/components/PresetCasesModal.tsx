import React from 'react';
import { X, Wrench, Flame, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { PRESET_CASES } from '../data/presets';
import { PresetCase } from '../types';

interface PresetCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase: (preset: PresetCase) => void;
}

export const PresetCasesModal: React.FC<PresetCasesModalProps> = ({
  isOpen,
  onClose,
  onSelectCase,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">
                Wybierz Przypadek Testowy Usterek
              </h2>
              <p className="text-xs text-slate-400">
                Gotowe przykłady zdjęć termowizyjnych i usterek płyt głównych
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {PRESET_CASES.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectCase(preset);
                onClose();
              }}
              className="group bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition cursor-pointer flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {/* Thumbnail Preview */}
              <div className="w-full sm:w-32 h-24 bg-black rounded-xl overflow-hidden shrink-0 relative border border-slate-800 group-hover:border-amber-500/30">
                <img
                  src={preset.imageUrl}
                  alt={preset.titlePl}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 right-1 bg-red-950/80 border border-red-500/60 text-red-300 text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-red-400" />
                  <span>{preset.defaultThermalData.maxTemp}°C</span>
                </div>
              </div>

              {/* Case Info */}
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base group-hover:text-amber-400 transition">
                  {preset.titlePl}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {preset.description}
                </p>

                {/* Symptoms Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {preset.symptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-900 group-hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden sm:flex p-2 bg-slate-900 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 rounded-xl transition">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Anuluj
          </button>
        </div>

      </div>
    </div>
  );
};
