import React from 'react';
import { Phone, MapPin, Globe, Wrench, ShieldCheck, Award } from 'lucide-react';

interface CompanyLogoBannerProps {
  compact?: boolean;
  className?: string;
  showActions?: boolean;
}

export const CompanyLogoBanner: React.FC<CompanyLogoBannerProps> = ({
  compact = false,
  className = '',
  showActions = true
}) => {
  return (
    <div className={`bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-blue-500/30 rounded-2xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden ${className}`}>
      
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
        
        {/* Logo & Company Title Group */}
        <div className="flex items-center space-x-3.5 sm:space-x-5">
          <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-blue-950/50 border border-blue-200 shrink-0 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Serwis Pogotowie Rafał Jarosz - Naprawa Komputerów i Laptopów"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-blue-400" />
                <span>OFICJALNY SERWIS POGOTOWIE</span>
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
              NAPRAWA KOMPUTERÓW I LAPTOPÓW
            </h2>
            <p className="text-xs sm:text-sm font-bold text-blue-300">
              SERWIS POGOTOWIE RAFAŁ JAROSZ
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-300 font-mono">
              <a
                href="tel:786409187"
                className="flex items-center space-x-1 text-emerald-400 font-bold hover:underline"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>786 409 187</span>
              </a>

              <a
                href="https://naprawapclaptop.pl"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-cyan-300 hover:underline"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>naprawapclaptop.pl</span>
              </a>

              <span className="flex items-center space-x-1 text-slate-400 hidden lg:flex">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Warszawa, ul. Marymoncka 125 m.109 p.6</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Badge / Contact Button */}
        {showActions && (
          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 gap-2 shrink-0">
            <div className="text-left md:text-right space-y-0.5">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Lokalizacja warsztatu:</span>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Warszawa, ul. Marymoncka 125 m.109 p.6</span>
              </span>
            </div>

            <a
              href="tel:786409187"
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition shrink-0"
            >
              <Phone className="w-4 h-4 fill-slate-950" />
              <span>Zadzwoń: 786 409 187</span>
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
