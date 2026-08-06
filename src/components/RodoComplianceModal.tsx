import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Lock, Eye, X, Award } from 'lucide-react';

interface RodoComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const RodoComplianceModal: React.FC<RodoComplianceModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [hasAcceptedRodo, setHasAcceptedRodo] = useState(false);
  const [clientName, setClientName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');

  if (!isOpen) return null;

  const handleGenerateAgreement = () => {
    if (!clientName) {
      alert('Wprowadź imię i nazwisko klienta.');
      return;
    }
    setHasAcceptedRodo(true);
    if (onSendToChat) {
      onSendToChat(`Wygenerowano zgodę RODO oraz politykę prywatności dla klienta: ${clientName} (Urządzenie: ${deviceModel || 'Serwis komputerowy'})`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ochrona Danych Osobowych (RODO) & Klauzula Serwisowa
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Zgodność UE 2016/679
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Oficjalny generator zgody na przetwarzanie danych osobowych oraz powierzenia sprzętu do serwisu
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-300 text-xs leading-relaxed">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Klauzula Informacyjna RODO dla Klienta Serwisu PC i Laptopów
            </h3>
            <p>
              Zgodnie z rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) informujemy, że administratorem danych osobowych podanych w procesie przyjęcia sprzętu do naprawy jest Serwis Komputerowy TermoFix AI.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Dane osobowe przetwarzane są wyłącznie w celu realizacji umowy naprawy, diagnostyki sprzętu oraz kontaktu telefonicznego/SMS.</li>
              <li>Klient ma prawo wglądu do swoich danych, ich sprostowania, żądania usunięcia oraz ograniczenia przetwarzania.</li>
              <li>Dane nie są przekazywane podmiotom trzecim ani wykorzystywane w celach marketingowych bez odrębnej zgody.</li>
            </ul>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Dane do protokołu i zgody RODO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Imię i Nazwisko Klienta:</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="np. Jan Kowalski"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 font-semibold">Model Urządzenia w Serwisie:</label>
                <input
                  type="text"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                  placeholder="np. Laptop ASUS ROG / PC i9"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {hasAcceptedRodo && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-xl flex items-start gap-3 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white text-sm">Zgoda RODO została podpisana elektronicznie!</strong>
                Klient <strong>{clientName}</strong> wyraził zgodę na przetwarzanie danych w celu naprawy sprzętu <strong>{deviceModel || 'Serwis'}</strong>. Protokół jest gotowy do wydruku lub zapisu w bazie danych serwisu.
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            System Zgodności Prawnej TermoFix AI & RODO
          </div>
          <div className="flex items-center space-x-3">
            {!hasAcceptedRodo ? (
              <button
                onClick={handleGenerateAgreement}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg text-xs transition shadow-lg"
              >
                Potwierdź i Podpisz Zgodę RODO
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition"
              >
                Zamknij Okno
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
