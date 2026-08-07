import React, { useState, useEffect } from 'react';
import { Monitor, X, Server, Download, ShieldCheck, Key, Link as LinkIcon, RefreshCw } from 'lucide-react';

interface RemoteDesktopModalProps {
  onClose: () => void;
}

export const RemoteDesktopModal: React.FC<RemoteDesktopModalProps> = ({ onClose }) => {
  const [sessionState, setSessionState] = useState<'idle' | 'generating' | 'ready' | 'connecting' | 'connected'>('idle');
  const [generatedLink, setGeneratedLink] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientPassword, setClientPassword] = useState('');

  const generateLink = () => {
    setSessionState('generating');
    setTimeout(() => {
      const id = Math.floor(100000000 + Math.random() * 900000000).toString();
      const pwd = Math.random().toString(36).slice(-8);
      setClientId(id);
      setClientPassword(pwd);
      setGeneratedLink(`https://rj-serwis.pl/remote?id=${id}&pwd=${pwd}`);
      setSessionState('ready');
    }, 1500);
  };

  const connectToClient = () => {
    setSessionState('connecting');
    setTimeout(() => {
      setSessionState('connected');
    }, 2500);
  };

  const exportAgentExe = () => {
    const pythonAgentCode = `import tkinter as tk
from tkinter import messagebox
import socket
import threading

def start_agent():
    messagebox.showinfo("RJ-SERWIS Remote", "Połączono z serwerem RJ-SERWIS.\\nTwój pulpit jest teraz gotowy do zdalnego zarządzania.")
    
root = tk.Tk()
root.title("RJ-SERWIS - Zdalna Pomoc")
root.geometry("400x200")
root.configure(bg="#1a1a24")

tk.Label(root, text="RJ-SERWIS ZDALNA POMOC", font=("Arial", 14, "bold"), bg="#1a1a24", fg="#3498db").pack(pady=10)
tk.Label(root, text="Podaj ten kod swojemu serwisantowi:", bg="#1a1a24", fg="white").pack()
tk.Label(root, text="${clientId || '123456789'}", font=("Courier", 18, "bold"), bg="#1a1a24", fg="#2ecc71").pack(pady=5)

tk.Button(root, text="POŁĄCZ Z SERWISEM", bg="#e74c3c", fg="white", font=("Arial", 10, "bold"), command=start_agent).pack(pady=10)

root.mainloop()
`;
    const blob = new Blob([pythonAgentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RJ_Serwis_Zdalna_Pomoc.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Monitor className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Zdalny Pulpit - RJ SERWIS [TeamViewer / AnyDesk Clone]</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900 flex flex-col">
          {sessionState === 'connected' ? (
            <div className="flex-1 bg-black rounded-lg border border-slate-700 overflow-hidden relative flex flex-col">
              <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span>Połączono z: Klient_PC_ID_{clientId}</span>
                </div>
                <button onClick={() => setSessionState('ready')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Rozłącz</button>
              </div>
              <div className="flex-1 relative flex items-center justify-center">
                 {/* Fake Remote Desktop Screen */}
                 <div className="absolute inset-0 bg-blue-900 flex flex-col">
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                       <Monitor className="w-32 h-32 text-blue-300 mb-4" />
                       <h1 className="text-4xl font-bold text-blue-200">Windows 11 Pro</h1>
                    </div>
                    <div className="h-12 bg-slate-950 flex items-center px-4 justify-center space-x-4">
                       <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white">W</div>
                       <div className="w-8 h-8 rounded bg-slate-800"></div>
                       <div className="w-8 h-8 rounded bg-slate-800"></div>
                       <div className="w-8 h-8 rounded bg-slate-800"></div>
                    </div>
                 </div>
                 <div className="absolute top-10 left-10 w-64 h-48 bg-white rounded shadow-2xl flex flex-col overflow-hidden text-black">
                     <div className="bg-blue-600 text-white px-2 py-1 text-xs font-bold flex justify-between">
                         <span>Menedżer Urządzeń</span>
                         <span>X</span>
                     </div>
                     <div className="p-2 text-xs">
                         <ul className="pl-4 border-l border-slate-300 ml-2 mt-2 space-y-1">
                            <li>Karty graficzne</li>
                            <li>Karty sieciowe</li>
                            <li>Procesory</li>
                         </ul>
                     </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-2 gap-8">
              
              {/* Left Column - Host / Tech Side */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center"><Server className="w-5 h-5 mr-2"/> Wygeneruj sesję dla klienta</h3>
                <p className="text-sm text-slate-400 mb-6">Utwórz unikalny link oraz aplikację klienta, aby przejąć kontrolę nad jego komputerem przez przeglądarkę.</p>
                
                <button 
                  onClick={generateLink}
                  disabled={sessionState === 'generating'}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center mb-6 disabled:opacity-50"
                >
                  {sessionState === 'generating' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <LinkIcon className="w-5 h-5 mr-2" />}
                  {sessionState === 'generating' ? 'Generowanie...' : 'Generuj Link i Kod Sesji'}
                </button>

                {sessionState === 'ready' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">ID Sesji (Do podania przez klienta)</label>
                      <div className="text-2xl font-mono text-green-400 tracking-wider">{clientId}</div>
                    </div>
                    
                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Hasło</label>
                      <div className="text-lg font-mono text-slate-300">{clientPassword}</div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Link Bezpośredni</label>
                      <div className="text-sm text-blue-400 break-all select-all">{generatedLink}</div>
                    </div>

                    <button onClick={exportAgentExe} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded flex items-center justify-center text-sm font-bold">
                       <Download className="w-4 h-4 mr-2" />
                       Pobierz Aplikację Klienta (.exe)
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Connect */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex flex-col">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center"><ShieldCheck className="w-5 h-5 mr-2"/> Połącz z klientem</h3>
                <p className="text-sm text-slate-400 mb-6">Wpisz kod podany przez klienta, aby przejąć kontrolę nad jego pulpitem.</p>
                
                <div className="space-y-4 flex-1">
                   <div>
                     <label className="text-sm font-bold text-slate-300 block mb-1">ID Klienta</label>
                     <input 
                       type="text" 
                       placeholder="Np. 123456789" 
                       value={clientId}
                       onChange={(e) => setClientId(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                     />
                   </div>
                   
                   <div>
                     <label className="text-sm font-bold text-slate-300 block mb-1">Hasło (Opcjonalne)</label>
                     <input 
                       type="text" 
                       value={clientPassword}
                       onChange={(e) => setClientPassword(e.target.value)}
                       className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                     />
                   </div>
                </div>

                <button 
                  onClick={connectToClient}
                  disabled={!clientId || sessionState === 'connecting'}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-lg flex items-center justify-center transition"
                >
                  {sessionState === 'connecting' ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Key className="w-5 h-5 mr-2" />}
                  {sessionState === 'connecting' ? 'Nawiązywanie połączenia...' : 'POŁĄCZ Z PULPITEM'}
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
