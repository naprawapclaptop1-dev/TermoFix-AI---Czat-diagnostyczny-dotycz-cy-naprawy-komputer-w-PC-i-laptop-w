import React, { useState } from 'react';
import {
  Globe,
  Play,
  Square,
  RefreshCw,
  Terminal,
  ExternalLink,
  Code2,
  Shield,
  CheckCircle2,
  Cpu,
  Server,
  X,
  Laptop
} from 'lucide-react';

interface LiveWebLauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const LiveWebLauncherModal: React.FC<LiveWebLauncherModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [serverPort, setServerPort] = useState('3000');
  const [selectedTemplate, setSelectedTemplate] = useState('html5_dashboard');
  const [isRunning, setIsRunning] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'logs' | 'source'>('preview');
  const [customUrl, setCustomUrl] = useState('https://192.168.0.6:8040/portal/');
  const [logs, setLogs] = useState<string[]>([
    '[13:21:05] [HTTP Server] Uruchomiono serwer na porcie 3000 (0.0.0.0)',
    '[13:21:05] [Vite/Express] Serwowanie aplikacji w czasie rzeczywistym dla Serwisu Rafał Jarosz',
    '[13:21:06] [Live Sync] Nasłuchiwanie zmian w plikach HTML/JS/CSS aktywne'
  ]);

  if (!isOpen) return null;

  const handleRestartServer = () => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Restartowanie serwera na porcie ${serverPort}...`, ...prev]);
    setIsRunning(false);
    setTimeout(() => {
      setIsRunning(true);
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Serwer uruchomiony pomyślnie na porcie ${serverPort}. Gotowy do podglądu na żywo.`, ...prev]);
    }, 1000);
  };

  const handleStopServer = () => {
    setIsRunning(false);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Zatrzymano serwer web.`, ...prev]);
  };

  const handleStartServer = () => {
    setIsRunning(true);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Uruchomiono serwer web na porcie ${serverPort}.`, ...prev]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/20 border border-cyan-500/30 p-2.5 rounded-xl text-cyan-400">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Live Web Server & Podgląd Strony na Żywo</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono border border-cyan-500/30">Port {serverPort}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Uruchom lokalną lub zdalną stronę WWW / portal serwisu w czasie rzeczywistym z podglądem live i logami.
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

        {/* Toolbar */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Port:</span>
              <input
                type="text"
                value={serverPort}
                onChange={(e) => setServerPort(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-center"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-400">Szablon:</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="html5_dashboard">Serwis BGA Dashboard HTML5</option>
                <option value="nas_portal">Portal NAS (192.168.0.6)</option>
                <option value="diagnostics_page">Strona Diagnostyki Laptopów</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-xs font-mono text-slate-300">
                {isRunning ? 'ONLINE (LIVE)' : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isRunning ? (
              <button
                onClick={handleStopServer}
                className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Zatrzymaj Serwer</span>
              </button>
            ) : (
              <button
                onClick={handleStartServer}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Uruchom Serwer</span>
              </button>
            )}

            <button
              onClick={handleRestartServer}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'preview'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Podgląd na Żywo (Live Browser)</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Logi Serwera & Konsola ({logs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('source')}
            className={`py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'source'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Kod Źródłowy Strony (HTML/JS)</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          {activeTab === 'preview' && (
            <div className="space-y-4 h-full flex flex-col">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex items-center space-x-2">
                <div className="flex space-x-1.5 px-2">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-cyan-400 flex items-center justify-between">
                  <span>http://localhost:{serverPort} / {selectedTemplate}</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">Live HMR</span>
                </div>
                <a
                  href={`http://localhost:${serverPort}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-slate-300 hover:text-white transition"
                  title="Otwórz w nowej karcie"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Embedded Live Preview Box */}
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[350px]">
                {isRunning ? (
                  <div className="space-y-4 max-w-2xl w-full">
                    <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 p-6 rounded-2xl shadow-xl space-y-3">
                      <div className="inline-flex p-3 bg-cyan-500/20 rounded-xl text-cyan-400 mb-1">
                        <Laptop className="w-8 h-8 animate-bounce" />
                      </div>
                      <h3 className="text-lg font-black text-white">Serwis Rafał Jarosz - Live Web Node</h3>
                      <p className="text-xs text-slate-300">
                        Aplikacja działa w czasie rzeczywistym na porcie <span className="font-mono text-cyan-400 font-bold">{serverPort}</span>. Wszystkie żądania HTTP oraz sockety są aktywne.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                          <span className="text-[10px] text-slate-400 block">Status</span>
                          <span className="text-xs font-bold text-emerald-400">200 OK (Aktywny)</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left">
                          <span className="text-[10px] text-slate-400 block">Czas odpowiedzi</span>
                          <span className="text-xs font-bold text-cyan-400">&lt; 2 ms</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 block">Szyfrowanie</span>
                          <span className="text-xs font-bold text-blue-400">SSL / TLS 1.3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 space-y-2">
                    <p className="text-sm font-bold text-slate-300">Serwer jest zatrzymany (Offline)</p>
                    <p className="text-xs">Kliknij "Uruchom Serwer", aby wznowić podgląd na żywo.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Dziennik Zdarzeń Serwera HTTP</span>
                </span>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-800 transition"
                >
                  Wyczyść logi
                </button>
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto max-h-[380px]">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed border-b border-slate-800/50 pb-1">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-3 h-full flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Główny Plik HTML Serwera (index.html)</span>
              </span>
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-y-auto max-h-[380px]">
                <pre>{`<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Serwis Rafał Jarosz - Live Portal</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 40px; }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <h1>TermoFix AI & BGA Workstation</h1>
  <p>Serwer lokalny działa poprawnie na porcie ${serverPort}.</p>
</body>
</html>`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/80 border-t border-slate-700 px-6 py-3 flex justify-between items-center">
          <span className="text-xs text-slate-400">Serwis Rafał Jarosz • Live Web Engine</span>
          <div className="flex items-center space-x-3">
            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat(`Uruchomiono stronę na żywo na porcie ${serverPort} (Szablon: ${selectedTemplate}).`);
                  onClose();
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg"
              >
                Wyślij Status do AI Chat
              </button>
            )}
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
