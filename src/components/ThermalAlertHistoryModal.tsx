import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Clock, RefreshCw, Download, Trash2, CheckCircle2, X } from 'lucide-react';

export interface ThermalAlertRecord {
  id: string;
  timestamp: string;
  componentName: string;
  componentRef: string;
  measuredTempC: number;
  thresholdC: number;
  severity: 'CRITICAL' | 'WARNING';
  actionTaken: string;
}

interface ThermalAlertHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast?: boolean;
}

export const ThermalAlertHistoryModal: React.FC<ThermalAlertHistoryModalProps> = ({
  isOpen,
  onClose,
  highContrast
}) => {
  const [alerts, setAlerts] = useState<ThermalAlertRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('termofix_thermal_alert_history');
      if (saved) {
        setAlerts(JSON.parse(saved));
      } else {
        // Sample default history records if empty
        const sample: ThermalAlertRecord[] = [
          {
            id: 'alt-1',
            timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleString(),
            componentName: 'Tranzystor MOSFET 19V High-Side',
            componentRef: 'PQ202 (AON6504)',
            measuredTempC: 91.4,
            thresholdC: 85,
            severity: 'CRITICAL',
            actionTaken: 'PROCHOT Thermal Throttling triggered, fan forced to 100% (4800 RPM)'
          },
          {
            id: 'alt-2',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleString(),
            componentName: 'Kości Pamięci VRAM / GPU BGA',
            componentRef: 'GDDR6 Samsung',
            measuredTempC: 88.2,
            thresholdC: 85,
            severity: 'CRITICAL',
            actionTaken: 'Clock reduced by 250 MHz to prevent Code 43 crash'
          },
          {
            id: 'alt-3',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleString(),
            componentName: 'Sekcja Zasilania CPU VCORE',
            componentRef: 'FDMF6808N',
            measuredTempC: 79.5,
            thresholdC: 75,
            severity: 'WARNING',
            actionTaken: 'Thermal warning logged, monitoring ripple voltage'
          }
        ];
        setAlerts(sample);
        localStorage.setItem('termofix_thermal_alert_history', JSON.stringify(sample));
      }
    } catch {
      setAlerts([]);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('termofix_thermal_alert_history');
    setAlerts([]);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(alerts, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `termofix_thermal_alert_history_${Date.now()}.json`);
    dlAnchorElem.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-slate-950 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          highContrast ? 'bg-yellow-950 border-yellow-500' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${highContrast ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-red-500/20 border-red-500/30 text-red-400'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-extrabold text-base ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
                Rejestr Incydentów Termicznych (Thermal Breaches History)
              </h2>
              <p className={`text-xs ${highContrast ? 'text-yellow-500/80' : 'text-slate-400'}`}>
                Długoterminowa historia przekroczeń progów alarmowych (&gt;85°C) zapisana w IndexedDB / localStorage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                highContrast ? 'bg-yellow-900 border-yellow-500 text-yellow-200' : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Eksport JSON</span>
            </button>
            <button
              onClick={handleClearHistory}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                highContrast ? 'bg-red-950 border-red-500 text-red-300' : 'bg-red-950/80 border-red-800/80 text-red-300 hover:bg-red-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wyczyść</span>
            </button>
            <button
              onClick={onClose}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                highContrast ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ✕ Zamknij
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-y-auto space-y-3 font-mono text-xs">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Brak zarejestrowanych incydentów termicznych w bazie. System działa w bezpiecznym zakresie temperatur.
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alt) => (
                <div key={alt.id} className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  alt.severity === 'CRITICAL'
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alt.severity === 'CRITICAL' ? 'bg-red-900 text-white' : 'bg-amber-900 text-white'
                      }`}>
                        {alt.severity}
                      </span>
                      <span className="font-bold text-white text-sm">{alt.componentName}</span>
                      <span className="text-slate-400 text-[11px]">({alt.componentRef})</span>
                    </div>

                    <div className="text-[11px] text-slate-300 flex items-center gap-3">
                      <span>Temperatura: <strong className="text-red-400">{alt.measuredTempC}°C</strong> (Próg: {alt.thresholdC}°C)</span>
                      <span>Czas: <span className="text-slate-400">{alt.timestamp}</span></span>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      Działanie automatyczne: {alt.actionTaken}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="text-[10px] font-bold bg-slate-900 px-2 py-1 rounded border border-slate-700 text-slate-300">
                      ID: {alt.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
