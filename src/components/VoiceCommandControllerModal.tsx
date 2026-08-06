import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Terminal,
  CheckCircle2,
  Sparkles,
  X,
  Radio,
  Tv,
  FileCode,
  Layers,
  Cpu,
  Usb,
  Disc,
  Send,
  Zap
} from 'lucide-react';

interface VoiceCommandControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (actionKey: string, transcript: string) => void;
  onSendToChat: (prompt: string) => void;
}

export const VoiceCommandControllerModal: React.FC<VoiceCommandControllerModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
  onSendToChat,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedCommand, setTypedCommand] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('Powiedz komendę głosową (np. "Odpal radio", "Pokaż schematy płyt", "Wypal pendrive", "Uruchom wideo") lub wpisz ją poniżej...');
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechSupported(false);
      setFeedbackMessage('Twoja przeglądarka nie obsługuje automatycznego Web Speech API. Użyj pola tekstowego lub przycisków poniżej.');
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Twoja przeglądarka nie obsługuje syntezy mowy. Wpisz polecenie w polu poniżej.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'pl-PL';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedbackMessage('Nasłuchuję w języku polskim... Mów teraz!');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        if (event.results[event.results.length - 1].isFinal) {
          processCommand(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setFeedbackMessage(`Błąd rozpoznawania mowy: ${event.error}. Użyj pola tekstowego poniżej.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setFeedbackMessage('Błąd mikrofonu. Wpisz polecenie ręcznie w polu poniżej.');
    }
  };

  const processCommand = (text: string) => {
    const lower = text.toLowerCase().trim();
    if (!lower) return;
    setTranscript(text);
    
    let responseText = `Wykonuję polecenie: ${text}`;

    // Macro Commands
    if (lower.includes('zdiagnozuj zwarcie') || lower.includes('makro zwarcie') || (lower.includes('zwarcie') && lower.includes('zdiagnozuj'))) {
      onExecuteCommand('macro_short', text);
      responseText = 'Uruchamiam makro: Automatyczna diagnostyka zwarcia. Otwieram multimetr na linii VCORE oraz schemat płyty głównej.';
    } else if (lower.includes('napraw psu') || lower.includes('naprawa zasilacza') || lower.includes('zasilacz atx')) {
      onExecuteCommand('macro_psu', text);
      responseText = 'Uruchamiam makro: Naprawa zasilacza ATX. Otwieram stanowisko naprawy zasilaczy oraz multimetr cyfrowy.';
    } else if (lower.includes('wygeneruj raport') || lower.includes('protokół') || lower.includes('raport dla klienta')) {
      onExecuteCommand('macro_report', text);
      responseText = 'Uruchamiam makro: Generator protokołu PDF z termowizją, wykresami i historią napraw.';
    } else if (lower.includes('mikroskop heatmap') || lower.includes('kamera mikroskop')) {
      onExecuteCommand('macro_microscope', text);
      responseText = 'Uruchamiam makro: Mikroskop HDMI z nakładką Live Heatmap w czasie rzeczywistym.';
    } else if (lower.includes('radio') || lower.includes('mp3') || lower.includes('muzyk')) {
      onExecuteCommand('radio', text);
      responseText = 'Otwieram Radio i odtwarzacz MP3.';
    } else if (lower.includes('wideo') || lower.includes('film') || lower.includes('akademia') || lower.includes('tutorial')) {
      onExecuteCommand('video', text);
      responseText = 'Otwieram Akademię Wideo i tutoriale serwisowe.';
    } else if (lower.includes('schemat') || lower.includes('płyta') || lower.includes('plyt')) {
      onExecuteCommand('schematic', text);
      responseText = 'Otwieram schematy płyt głównych.';
    } else if (lower.includes('rufus') || lower.includes('usb') || lower.includes('pendrive') || lower.includes('wypal') || lower.includes('ventoy')) {
      onExecuteCommand('usb', text);
      responseText = 'Otwieram nagrywarkę pendrive Rufus i Ventoy.';
    } else if (lower.includes('exe') || lower.includes('kreator') || lower.includes('program') || lower.includes('instalator')) {
      onExecuteCommand('exe', text);
      responseText = 'Otwieram kreator instalatorów EXE.';
    } else if (lower.includes('strelec') || lower.includes('winpe') || lower.includes('ratunek')) {
      onExecuteCommand('strelec', text);
      responseText = 'Otwieram pakiet ratunkowy Strelec WinPE.';
    } else if (lower.includes('stress') || lower.includes('obciążeniowy') || lower.includes('furmark') || lower.includes('gpu test')) {
      onExecuteCommand('stress', text);
      responseText = 'Uruchamiam test obciążeniowy stacji roboczej.';
    } else if (lower.includes('skan') || lower.includes('diagnostyk') || lower.includes('bios') || lower.includes('ram')) {
      onExecuteCommand('scan', text);
      responseText = 'Uruchamiam master skan diagnostyczny.';
    } else if (lower.includes('multimetr') || lower.includes('napie') || lower.includes('vrm')) {
      onExecuteCommand('multimeter', text);
      responseText = 'Otwieram multimetr serwisowy z wykresami na żywo.';
    } else if (lower.includes('wszystko') || lower.includes('odpal wszystko')) {
      onExecuteCommand('all', text);
      responseText = 'Uruchamiam pełen zestaw narzędzi diagnostycznych.';
    } else {
      onSendToChat(`Wykonaj polecenie użytkownika: ${text}`);
      responseText = `Przekazałem do asystenta AI: ${text}`;
    }

    setFeedbackMessage(responseText);
    speakText(responseText);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedCommand.trim()) {
      processCommand(typedCommand);
      setTypedCommand('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/40 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-500/20 border border-indigo-500/40 p-2.5 rounded-xl text-indigo-400">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Asystent Głosowy i AI • Mikrokontroler Komend</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono border border-indigo-500/30">Voice & Text Engine</span>
              </h2>
              <p className="text-xs text-slate-400">
                Powiedz lub wpisz polecenie – system natychmiast wykona odpowiednią akcję i odczyta odpowiedź!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-slate-950 text-center">
          
          <div className="py-4 space-y-3">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isListening ? 'bg-red-500/20 border-4 border-red-500 text-red-400 animate-bounce shadow-lg shadow-red-500/20' : 'bg-indigo-500/20 border-2 border-indigo-500/40 text-indigo-400'}`}>
              {isListening ? <Mic className="w-10 h-10 animate-pulse" /> : <MicOff className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-indigo-300">Stan Asystenta Głosowego</p>
              <h3 className="text-base font-bold text-white">{isListening ? 'Nasłuchiwanie komendy...' : 'Gotowy do komend głosowych'}</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">{feedbackMessage}</p>
            </div>

            {transcript && (
              <div className="bg-slate-900 border border-indigo-500/40 p-3 rounded-xl max-w-md mx-auto text-left shadow-inner">
                <span className="text-[10px] text-indigo-400 block font-mono uppercase">Rozpoznany głos / Komenda:</span>
                <p className="text-sm font-semibold text-white italic">"{transcript}"</p>
              </div>
            )}
          </div>

          {/* Manual Prompt Input for 100% Reliability */}
          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder="Wpisz komendę (np. odpal radio, pokaż schematy)..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Wykonaj</span>
            </button>
          </form>

          {/* Complex Macro Voice Commands */}
          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-3.5 text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Złożone Makra Diagnostyczne (Automat):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => processCommand('zdiagnozuj zwarcie')}
                className="bg-indigo-950/60 hover:bg-indigo-900/80 p-2.5 rounded-lg text-indigo-100 border border-indigo-500/40 text-left transition flex items-center gap-2 group"
              >
                <Cpu className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition" />
                <div>
                  <div className="font-bold">"Zdiagnozuj zwarcie"</div>
                  <div className="text-[10px] text-indigo-300">Multimetr + Schemat VCORE</div>
                </div>
              </button>
              <button
                onClick={() => processCommand('napraw zasilacz')}
                className="bg-indigo-950/60 hover:bg-indigo-900/80 p-2.5 rounded-lg text-indigo-100 border border-indigo-500/40 text-left transition flex items-center gap-2 group"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                <div>
                  <div className="font-bold">"Napraw zasilacz ATX"</div>
                  <div className="text-[10px] text-indigo-300">Stanowisko PSU + Pomiary</div>
                </div>
              </button>
              <button
                onClick={() => processCommand('wygeneruj raport')}
                className="bg-indigo-950/60 hover:bg-indigo-900/80 p-2.5 rounded-lg text-indigo-100 border border-indigo-500/40 text-left transition flex items-center gap-2 group"
              >
                <FileCode className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition" />
                <div>
                  <div className="font-bold">"Wygeneruj protokół"</div>
                  <div className="text-[10px] text-indigo-300">PDF Termowizja & Wykresy</div>
                </div>
              </button>
              <button
                onClick={() => processCommand('mikroskop heatmap')}
                className="bg-indigo-950/60 hover:bg-indigo-900/80 p-2.5 rounded-lg text-indigo-100 border border-indigo-500/40 text-left transition flex items-center gap-2 group"
              >
                <Tv className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition" />
                <div>
                  <div className="font-bold">"Mikroskop Heatmap"</div>
                  <div className="text-[10px] text-indigo-300">Live Heatmap Gradient</div>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Voice Command Samples */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Szybkie Komendy Głosowe w Języku Polskim:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => processCommand('odpal radio')}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded-lg text-slate-200 border border-slate-800 text-left transition flex items-center gap-2 group"
              >
                <Radio className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition" />
                <span>"Odpal radio i MP3"</span>
              </button>
              <button
                onClick={() => processCommand('pokaż schematy płyt')}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded-lg text-slate-200 border border-slate-800 text-left transition flex items-center gap-2 group"
              >
                <Layers className="w-4 h-4 text-teal-400 shrink-0 group-hover:scale-110 transition" />
                <span>"Pokaż schematy płyt i RAM"</span>
              </button>
              <button
                onClick={() => processCommand('wypal pendrive rufus')}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded-lg text-slate-200 border border-slate-800 text-left transition flex items-center gap-2 group"
              >
                <Usb className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition" />
                <span>"Wypal pendrive / Rufus"</span>
              </button>
              <button
                onClick={() => processCommand('akademia wideo')}
                className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded-lg text-slate-200 border border-slate-800 text-left transition flex items-center gap-2 group"
              >
                <Tv className="w-4 h-4 text-red-400 shrink-0 group-hover:scale-110 transition" />
                <span>"Akademia wideo tutoriale"</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">Serwis Rafał Jarosz • AI Voice Engine v3.5</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={startListening}
              className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center gap-2"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>{isListening ? 'Nasłuchuję...' : 'Mów Teraz (Mikrofon)'}</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-xs transition"
            >
              Zamknij
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

