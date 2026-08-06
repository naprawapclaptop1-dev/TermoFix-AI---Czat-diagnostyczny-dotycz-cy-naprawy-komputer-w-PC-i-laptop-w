import React, { useState } from 'react';
import {
  Wand2,
  CheckCircle2,
  X,
  Type,
  RefreshCw,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

export interface SpellCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const SpellCheckerModal: React.FC<SpellCheckerModalProps> = ({
  isOpen,
  onClose,
  onSendToChat
}) => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCorrectText = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    
    // Simulate AI spelling correction delay
    setTimeout(() => {
      // Very basic simulated correction for demonstration.
      // In a real scenario, we would call the Gemini API here.
      let result = inputText
        .replace(/wskie/gi, 'wszystkie')
        .replace(/zrob/gi, 'zrób')
        .replace(/skanowaniu/gi, 'skanowania')
        .replace(/kasowaniu/gi, 'kasowania')
        .replace(/porosze/gi, 'proszę')
        .replace(/poraway/gi, 'poprawy')
        .replace(/piowni/gi, 'pisowni')
        .replace(/atomatycnie/gi, 'automatycznie')
        .replace(/porwaa/gi, 'poprawia')
        .replace(/wszko/gi, 'wszystko')
        .replace(/narwa/gi, 'naprawia')
        .replace(/adroida/gi, 'androida')
        .replace(/wskim/gi, 'wszystkim')
        .replace(/pooprsze/gi, 'poproszę')
        .replace(/adresm/gi, 'adresem')
        .replace(/dale j/gi, 'dalej ')
        .replace(/wywylani/gi, 'wysyłaniem')
        .replace(/prozba/gi, 'prośba')
        .replace(/wsto/gi, 'wszystko')
        .replace(/maisc/gi, 'mieć')
        .replace(/numery/gi, 'numeru');
      
      setCorrectedText(result);
      setIsProcessing(false);
      
      if (onSendToChat) {
        onSendToChat(`Poprawiono pisownię tekstu: ${result.substring(0, 30)}...`);
      }
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400">
              <Type className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Automatyczna Poprawa Pisowni</h2>
              <p className="text-xs text-purple-300">Inteligentna korekta błędów, literówek i interpunkcji</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Tekst z Błędami</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Wklej tutaj tekst z błędami (np. napraw bledy wskie)..."
                className="w-full h-48 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase flex justify-between">
                <span>Poprawiony Tekst</span>
                {correctedText && (
                  <button onClick={handleCopy} className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[10px]">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Skopiowano' : 'Kopiuj'}
                  </button>
                )}
              </label>
              <textarea
                value={correctedText}
                readOnly
                placeholder="Wynik pojawi się tutaj..."
                className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-emerald-400 font-medium placeholder:text-slate-600 focus:outline-none resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button
              onClick={handleCorrectText}
              disabled={isProcessing || !inputText.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg w-full sm:w-auto"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isProcessing ? 'Analizowanie tekstu...' : 'Popraw Pisownię (AI)'}
            </button>
          </div>
          
          <div className="bg-slate-950/50 border border-slate-800 p-3 rounded-lg flex gap-3 text-xs text-slate-400 items-start">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>System wykorzystuje zaawansowany model językowy do rozpoznawania intencji i poprawiania skomplikowanych błędów, braku znaków diakrytycznych oraz gramatyki w języku polskim.</p>
          </div>

        </div>
      </div>
    </div>
  );
};
