const fs = require('fs');
const file = 'src/components/BitLockerBreakerModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const newCode = `import React, { useState, useEffect } from 'react';
import {  Key,  Unlock,  ShieldAlert,  Cpu,  Terminal,  Play,  X,  CheckCircle2,  RefreshCw,  HardDrive, Smartphone, MapPin, Check, Mail} from 'lucide-react';

export interface BitLockerBreakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const BitLockerBreakerModal: React.FC<BitLockerBreakerModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [drives, setDrives] = useState<any[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [bitlockerStatus, setBitlockerStatus] = useState<'idle' | 'enabled' | 'disabled'>('idle');

  // Client Consent Flow
  const [clientPhone, setClientPhone] = useState('786409187');
  const [clientEmail, setClientEmail] = useState('');
  const [flowState, setFlowState] = useState<'idle' | 'sending' | 'waiting' | 'client_view' | 'completed'>('idle');
  const [clientSignature, setClientSignature] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [clientLocation, setClientLocation] = useState('Warszawa, Polska (52.2297° N, 21.0122° E)');
  const [clientAgreed, setClientAgreed] = useState(false);
  const [isClientSubmitting, setIsClientSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/disks')
        .then(res => res.json())
        .then(data => {
          setDrives(data);
          if(data.length > 0) setSelectedDrive(data[0].driveLetter);
        })
        .catch(err => console.error(err));
    } else {
      setFlowState('idle');
      setBitlockerStatus('idle');
      setClientSignature('');
      setClientKey('');
      setClientAgreed(false);
    }
  }, [isOpen]);

  const checkDrive = () => {
    setIsChecking(true);
    setBitlockerStatus('idle');
    setTimeout(() => {
      setIsChecking(false);
      setBitlockerStatus('enabled');
    }, 1200);
  };

  const sendRequestToClient = () => {
    setFlowState('sending');
    setTimeout(() => {
      setFlowState('waiting');
      
      // Simulate client clicking the link after 3 seconds
      setTimeout(() => {
         setFlowState('client_view');
      }, 3000);

    }, 1500);
  };

  const submitClientForm = () => {
    setIsClientSubmitting(true);
    setTimeout(() => {
      setIsClientSubmitting(false);
      setFlowState('completed');
      if (onSendToChat) {
         onSendToChat(\`BitLocker Recovery: Klient \${clientSignature} udzielił zgody na odzyskanie danych i podał klucz: \${clientKey}. Lokalizacja: \${clientLocation}\`);
      }
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-slate-900 border-b border-red-700/50 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500/20 p-2 rounded-lg text-red-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI BitLocker / LUKS Recovery</h2>
              <p className="text-xs text-red-300">Automatyczne wykrywanie szyfrowania i zdalny formularz zgody klienta</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 relative">
          
          {/* Main Console */}
          <div className="md:w-1/2 space-y-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-slate-400" /> Wybierz Dysk do Skonowania
              </h3>
              <div className="flex gap-2 mb-4">
                <select 
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2.5"
                  value={selectedDrive}
                  onChange={(e) => setSelectedDrive(e.target.value)}
                >
                  {drives.map((d, i) => (
                    <option key={i} value={d.driveLetter}>{d.driveLetter} ({d.name}) - {d.sizeGb} GB {d.isUsb ? '[USB]' : ''}</option>
                  ))}
                </select>
                <button 
                  onClick={checkDrive}
                  disabled={isChecking}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg font-bold text-sm flex items-center gap-2 disabled:bg-slate-700"
                >
                  {isChecking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Skanuj
                </button>
              </div>

              {bitlockerStatus === 'enabled' && (
                <div className="mt-4 p-4 bg-red-950/40 border border-red-500/50 rounded-xl">
                  <div className="flex items-start gap-3 mb-3">
                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-400 text-sm">Wykryto Szyfrowanie BitLocker</h4>
                      <p className="text-xs text-red-200/70 mt-1">Wolumen na dysku {selectedDrive} jest zablokowany. Wymagany klucz odzyskiwania (48 cyfr) lub hasło użytkownika.</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 space-y-3">
                    <h5 className="text-xs font-bold text-slate-300">Automatyczny Wniosek do Klienta (SMS / Email)</h5>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-slate-500" />
                        <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Numer telefonu klienta" className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="Email klienta (opcjonalnie)" className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white" />
                      </div>
                    </div>
                    <button 
                      onClick={sendRequestToClient}
                      disabled={flowState !== 'idle' && flowState !== 'completed'}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-slate-700"
                    >
                      <Play className="w-4 h-4" /> Wyślij Link do Odblokowania
                    </button>
                  </div>
                </div>
              )}
            </div>

            {flowState === 'sending' && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-300 text-sm flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" /> Wysyłanie bezpiecznego linku do klienta...
              </div>
            )}
            {flowState === 'waiting' && (
              <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl text-amber-300 text-sm flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin" /> Oczekiwanie na interakcję klienta z linkiem...
              </div>
            )}
            {flowState === 'completed' && (
              <div className="p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="w-5 h-5" /> Klient zautoryzował dostęp!</div>
                <div className="bg-slate-950 p-3 rounded border border-emerald-900 font-mono text-xs text-emerald-400 break-all">
                  KLUCZ: {clientKey}<br/>
                  LOKALIZACJA: {clientLocation}<br/>
                  PODPIS: {clientSignature}
                </div>
                <button className="bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-500 transition mt-2">
                  Zastosuj Klucz i Odblokuj Dysk
                </button>
              </div>
            )}
          </div>

          {/* Simulated Client Phone View */}
          {(flowState === 'client_view' || flowState === 'completed') && (
            <div className="md:w-1/2 flex items-center justify-center">
               <div className="w-[320px] bg-white rounded-3xl p-2 border-[6px] border-slate-800 shadow-2xl relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl"></div>
                  
                  <div className="bg-slate-50 w-full h-[580px] rounded-2xl overflow-y-auto overflow-x-hidden p-4 pt-8 text-slate-900 font-sans">
                     <div className="text-center mb-4">
                       <ShieldAlert className="w-10 h-10 text-red-600 mx-auto mb-2" />
                       <h3 className="font-bold text-lg leading-tight">Wymagana Zgoda i Klucz BitLocker</h3>
                       <p className="text-[10px] text-slate-500 mt-1">Serwis Rafał Jarosz prosi o dostęp do zaszyfrowanego dysku w celu diagnozy/odzyskania danych.</p>
                     </div>

                     <div className="space-y-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                           <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Podaj klucz odzyskiwania (48 cyfr)</label>
                           <textarea 
                             className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs h-16 font-mono" 
                             placeholder="Np. 123456-123456-..."
                             value={clientKey}
                             onChange={e => setClientKey(e.target.value)}
                             disabled={flowState === 'completed'}
                           ></textarea>
                           <a href="https://account.microsoft.com/devices/recoverykey" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1">
                             Jak znaleźć mój klucz na koncie Microsoft?
                           </a>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
                           <label className="flex items-start gap-2 cursor-pointer">
                             <input type="checkbox" className="mt-1 accent-emerald-600" checked={clientAgreed} onChange={e => setClientAgreed(e.target.checked)} disabled={flowState === 'completed'} />
                             <span className="text-[10px] text-slate-700 leading-tight">Zgadzam się na odblokowanie mojego dysku przez Serwis Rafał Jarosz i potwierdzam, że to mój sprzęt.</span>
                           </label>
                           
                           <div className="pt-2 border-t border-slate-100">
                             <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Złóż Podpis Klawiaturą (Twoje Imię i Nazwisko)</label>
                             <input 
                               type="text" 
                               value={clientSignature} 
                               onChange={e => setClientSignature(e.target.value)}
                               className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-xs" 
                               placeholder="Jan Kowalski"
                               disabled={flowState === 'completed'}
                             />
                           </div>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-100 p-2 rounded">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Lokalizacja GPS zostanie udostępniona w celach bezpieczeństwa i weryfikacji.</span>
                        </div>

                        {flowState === 'client_view' && (
                          <button 
                            onClick={submitClientForm}
                            disabled={!clientAgreed || clientKey.length < 10 || clientSignature.length < 3 || isClientSubmitting}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                          >
                            {isClientSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Wyślij Klucz i Zgodę
                          </button>
                        )}
                        {flowState === 'completed' && (
                          <div className="w-full bg-emerald-100 text-emerald-800 font-bold py-3 rounded-xl text-center flex items-center justify-center gap-2 text-sm">
                             <CheckCircle2 className="w-5 h-5" /> Wysłano pomyślnie
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
`
fs.writeFileSync(file, newCode);
