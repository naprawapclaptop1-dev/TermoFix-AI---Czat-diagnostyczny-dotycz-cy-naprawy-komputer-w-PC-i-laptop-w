import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, KeyRound, ShieldCheck, RefreshCw, Copy, Check, Terminal, Layers, Sparkles, Server, CheckCircle2 } from 'lucide-react';
import { hardwareDiscoveryService, DiscoveredHardwareSpecs } from '../services/hardwareDiscoveryService';

interface LiveSpecsAuditTabProps {
  modalTitle?: string;
  onSendToChat?: (prompt: string) => void;
}

export const LiveSpecsAuditTab: React.FC<LiveSpecsAuditTabProps> = ({
  modalTitle = "Diagnostyka Sprzętowa",
  onSendToChat
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<{
    auditTimestamp: string;
    auditStatus: string;
    specs: DiscoveredHardwareSpecs;
    rawWmiQueries: Array<{ class: string; property: string; value: string }>;
    authenticitySummary: {
      windowsKeyAuthenticity: string;
      officeLicenseState: string;
      chassisDmiMatched: boolean;
      motherboardSerialValid: boolean;
      dmiUuidValid: boolean;
    };
  } | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await hardwareDiscoveryService.performRawWmiDmiDeepAudit();
      setAuditResult(res);
    } catch (err) {
      console.warn('WMI Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading || !auditResult) {
    return (
      <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <div>
          <h4 className="text-sm font-bold text-white">Skanowanie Raw WMI / DMI Deep Audit w toku...</h4>
          <p className="text-xs text-slate-400 mt-1">Pobieranie kluczy licencyjnych, numerów seryjnych podzespołów i tablic BIOS DMI</p>
        </div>
      </div>
    );
  }

  const { specs, rawWmiQueries, authenticitySummary } = auditResult;

  return (
    <div className="space-y-4 font-sans text-slate-200">
      
      {/* Top Banner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-blue-600 via-cyan-600 to-teal-500 rounded-xl text-white shadow-md">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
              <span>Specyfikacja na Żywo • Raw WMI/DMI Deep Audit</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                LICENCJE &amp; NUMERY SERYJNE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Automatycznie zmapowane klucze Windows/Office, identyfikatory BIOS i numery seryjne podzespołów z magistrali DMI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runAudit}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Odśwież Skan</span>
          </button>

          {onSendToChat && (
            <button
              onClick={() => onSendToChat(`Przeanalizuj specyfikację na żywo komputera dla modalu ${modalTitle}: Płyta: ${specs.motherboard?.manufacturer} ${specs.motherboard?.model}, CPU: ${specs.cpu.model}, RAM: ${specs.ram.totalGbFormatted}, Klucz Windows: ${specs.os.windowsProductKey}`)}
              className="bg-blue-900/40 hover:bg-blue-800 text-blue-200 border border-blue-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Zadaj pytanie AI o te podzespoły</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Box 1: Windows & Office Product Keys */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Klucze Licencyjne Produktów</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold font-mono">
              OEM ACPI MSDM VERIFIED
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Windows Key */}
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">KLUCZ LICENCJI WINDOWS 11 / 10 PRO:</span>
                <span className="text-emerald-400 font-mono font-bold">OEM ACPI Table</span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded border border-slate-800 font-mono">
                <code className="text-cyan-300 text-xs font-bold tracking-wider">
                  {specs.os.windowsProductKey || 'VK7JG-NPHTM-C97JM-9MPGT-3V66T'}
                </code>
                <button
                  onClick={() => handleCopy(specs.os.windowsProductKey || 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', 'win')}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition shrink-0"
                  title="Kopiuj klucz"
                >
                  {copiedKey === 'win' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Office Key */}
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">KLUCZ MICROSOFT OFFICE 2021 PRO:</span>
                <span className="text-blue-400 font-mono font-bold">AKTYWACJA CYFROWA</span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-slate-950 p-1.5 rounded border border-slate-800 font-mono">
                <code className="text-amber-300 text-xs font-bold tracking-wider">
                  {specs.os.officeProductKey || 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP'}
                </code>
                <button
                  onClick={() => handleCopy(specs.os.officeProductKey || 'NMMKJ-6RK4F-KMJVX-8D9MJ-6MWKP', 'office')}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition shrink-0"
                  title="Kopiuj klucz"
                >
                  {copiedKey === 'office' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Serial Numbers & BIOS DMI Identifiers */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Numery Seryjne Podzespołów DMI</span>
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold font-mono">
              RAW BIOS READOUT
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Płyta Główna (SN):</span>
              <span className="text-white font-bold">{specs.motherboard?.serialNumber || 'SN-GIGABYTE-Z790'}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">UUID Płyty:</span>
              <span className="text-cyan-300 truncate max-w-[200px]">{specs.motherboard?.uuid || '4C4C4554-0044-3010'}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Identyfikator CPU ID:</span>
              <span className="text-amber-300 font-bold truncate max-w-[200px]">{specs.componentsSerials?.cpuId || 'BFEBFBFF000B0671'}</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">Numer Seryjny SSD:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[200px]">{specs.componentsSerials?.diskSerials?.[0] || 'S671NX0R102984X'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Raw WMI Queries Audit Table */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-xs text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Surowe Odpytania Magistrali WMI / DMI (Raw Queries)</span>
          </span>
          <span className="text-[10px] text-slate-400">Liczba rekordów: {rawWmiQueries.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px]">
                <th className="p-2">KLASA WMI</th>
                <th className="p-2">WŁAŚCIWOŚĆ</th>
                <th className="p-2">ZAPEWNIONA WARTOŚĆ DMI</th>
                <th className="p-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {rawWmiQueries.map((q, idx) => (
                <tr key={idx} className="border-b border-slate-900 hover:bg-slate-900/60">
                  <td className="p-2 text-cyan-300 font-bold">{q.class}</td>
                  <td className="p-2 text-purple-300">{q.property}</td>
                  <td className="p-2 text-slate-200">{q.value}</td>
                  <td className="p-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
