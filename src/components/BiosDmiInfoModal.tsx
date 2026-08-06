import React, { useState } from 'react';
import { Cpu, Copy, Check, Shield, Server, RefreshCw, Layers } from 'lucide-react';

interface BiosDmiInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  highContrast?: boolean;
}

export const BiosDmiInfoModal: React.FC<BiosDmiInfoModalProps> = ({ isOpen, onClose, highContrast }) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dmiData, setDmiData] = useState({
    manufacturer: 'ASUSTeK COMPUTER INC.',
    productName: 'ROG STRIX G513RM_G513RM',
    version: 'G513RM.316',
    serialNumber: 'N5NRKD00L1234567',
    biosVendor: 'American Megatrends International, LLC.',
    biosVersion: '316',
    releaseDate: '10/14/2023',
    uuid: '4c4c4554-0044-3010-8041-c2c04f525354',
    cpuModel: 'AMD Ryzen 7 6800H with Radeon Graphics',
    baseboardSerial: 'MB-9988219-X7',
    tpmVersion: '2.0 (Firmware 3.65)'
  });

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleCopyAll = () => {
    const text = `=== TERMOFIX SMBIOS / DMI AUDIT REPORT ===\n` +
      `Manufacturer: ${dmiData.manufacturer}\n` +
      `Product: ${dmiData.productName}\n` +
      `BIOS Version: ${dmiData.biosVersion} (${dmiData.releaseDate})\n` +
      `Serial Number: ${dmiData.serialNumber}\n` +
      `Baseboard Serial: ${dmiData.baseboardSerial}\n` +
      `UUID: ${dmiData.uuid}\n` +
      `CPU: ${dmiData.cpuModel}\n` +
      `TPM: ${dmiData.tpmVersion}\n`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        highContrast ? 'bg-black border-yellow-400 text-yellow-300' : 'bg-slate-950 border-slate-800 text-slate-100'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          highContrast ? 'bg-yellow-950 border-yellow-500' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${highContrast ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-extrabold text-base ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
                SMBIOS / DMI Hardware Info (Host System)
              </h2>
              <p className={`text-xs ${highContrast ? 'text-yellow-500/80' : 'text-slate-400'}`}>
                Technician Motherboard, BIOS &amp; Serial Number Audit Module
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                highContrast ? 'bg-yellow-900 border-yellow-500 text-yellow-200' : 'bg-slate-800 border-slate-700 text-cyan-300 hover:bg-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Odśwież</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4 ${
            highContrast ? 'bg-yellow-950/40 border-yellow-500/50' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div>
              <span className="text-slate-500 block mb-1">PRODUCENT PŁYTY / SYSTEMU:</span>
              <span className={`font-bold text-sm ${highContrast ? 'text-yellow-200' : 'text-cyan-300'}`}>{dmiData.manufacturer}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">MODEL / SYSTEM PRODUCT:</span>
              <span className={`font-bold text-sm ${highContrast ? 'text-yellow-200' : 'text-emerald-300'}`}>{dmiData.productName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">WERSJA BIOS / AGESA:</span>
              <span className={`font-bold ${highContrast ? 'text-yellow-200' : 'text-white'}`}>{dmiData.version} ({dmiData.releaseDate})</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">NUMER SERYJNY (SERIAL NUMBER):</span>
              <span className={`font-bold ${highContrast ? 'text-yellow-200' : 'text-amber-300'}`}>{dmiData.serialNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">VENDOR BIOS:</span>
              <span className="text-slate-300">{dmiData.biosVendor}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">SERIAL PŁYTY GŁÓWNEJ:</span>
              <span className="text-slate-300">{dmiData.baseboardSerial}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">SYSTEM UUID:</span>
              <span className="text-slate-300">{dmiData.uuid}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">MODUŁ TPM:</span>
              <span className="text-emerald-400 font-bold">{dmiData.tpmVersion}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCopyAll}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition flex items-center gap-2 shadow-lg ${
                highContrast
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Skopiowano do Schowka!' : 'Kopiuj Dane SMBIOS do Schowka'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
