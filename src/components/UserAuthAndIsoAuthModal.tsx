import React, { useState, useEffect } from 'react';
import {
  User,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  LogIn,
  LogOut,
  Disc,
  Shield
} from 'lucide-react';

interface UserAuthAndIsoAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

export const UserAuthAndIsoAuthModal: React.FC<UserAuthAndIsoAuthModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [username, setUsername] = useState('SerwisRafałJarosz');
  const [password, setPassword] = useState('');
  const [isPasswordFree, setIsPasswordFree] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [role, setRole] = useState<'admin' | 'technician' | 'guest'>('admin');

  // ISO Download Security Settings
  const [isoPasswordProtected, setIsoPasswordProtected] = useState(false);
  const [isoPin, setIsoPin] = useState('786409');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('termofix_auth_user');
    const savedPasswordFree = localStorage.getItem('termofix_password_free');
    const savedIsoProt = localStorage.getItem('termofix_iso_protected');
    const savedIsoPin = localStorage.getItem('termofix_iso_pin');

    if (savedUser) setUsername(savedUser);
    if (savedPasswordFree !== null) setIsPasswordFree(savedPasswordFree === 'true');
    if (savedIsoProt !== null) setIsoPasswordProtected(savedIsoProt === 'true');
    if (savedIsoPin) setIsoPin(savedIsoPin);
  }, []);

  if (!isOpen) return null;

  const handleSaveAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    localStorage.setItem('termofix_auth_user', username);
    localStorage.setItem('termofix_password_free', String(isPasswordFree));
    localStorage.setItem('termofix_iso_protected', String(isoPasswordProtected));
    localStorage.setItem('termofix_iso_pin', isoPin);

    setSuccessMessage('Zapisano ustawienia autoryzacji i zabezpieczeń ISO pomyślnie!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleQuickNoPasswordLogin = () => {
    setIsPasswordFree(true);
    setIsLoggedIn(true);
    setUsername('GośćSerwisu (Bez Hasła)');
    setRole('guest');
    localStorage.setItem('termofix_auth_user', 'GośćSerwisu (Bez Hasła)');
    localStorage.setItem('termofix_password_free', 'true');
    setSuccessMessage('Zalogowano pomyślnie w trybie bez hasła (Szybki Dostęp / Gość)!');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('termofix_auth_user');
    setSuccessMessage('Wylogowano pomyślnie.');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500/20 border border-blue-500/30 p-2.5 rounded-xl text-blue-400">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Panel Logowania, Hasła i Zabezpieczeń ISO</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  {isPasswordFree ? 'Tryb Bez Hasła / Gość' : 'Zabezpieczone'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Zarządzaj dostępem do aplikacji, uprawnieniami oraz hasłem/pinem do pobierania i nagrywania obrazów ISO oraz WinPE.
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
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-950 flex-1">
          
          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick No-Password Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Unlock className="w-4 h-4 text-emerald-400" /> Szybkie Wejście / Logowanie bez hasła (ISO & App)
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Możesz korzystać z całego serwisu, pobierać pliki ISO i uruchamiać narzędzia bez wpisywania haseł, lub aktywować ochronę PIN.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleQuickNoPasswordLogin}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> Wejdź Bez Hasła
              </button>
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Wyloguj
                </button>
              ) : null}
            </div>
          </div>

          {/* Administrator Email Instant Full Access */}
          <div className="p-4 bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/80 border border-cyan-500/50 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Logowanie Administratora Serwisu (Wystarczy Podać E-mail!)</h3>
            </div>
            <p className="text-xs text-slate-300">
              Podaj swój adres e-mail (np. <span className="text-cyan-300 font-mono">naprawapclaptop1@gmail.com</span>), aby natychmiast uzyskać pełny dostęp administracyjny do wszystkich schematów, boardview, programatora KBC oraz narzędzi serwisowych.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Wpisz swój email (np. naprawapclaptop1@gmail.com)"
                defaultValue="naprawapclaptop1@gmail.com"
                id="admin-email-input"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={() => {
                  const inputEl = document.getElementById('admin-email-input') as HTMLInputElement;
                  const email = inputEl ? inputEl.value : 'naprawapclaptop1@gmail.com';
                  setUsername(email);
                  setIsLoggedIn(true);
                  setRole('admin');
                  localStorage.setItem('termofix_auth_user', email);
                  localStorage.setItem('termofix_admin_email', email);
                  setSuccessMessage(`Zalogowano pomyślnie jako Administrator (${email})! Pełny dostęp aktywny.`);
                  setTimeout(() => setSuccessMessage(null), 4000);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition shrink-0"
              >
                Zaloguj jako Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveAuth} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Nazwa Użytkownika / Serwisu
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="np. Serwis PC Warszawa"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Hasło Konta (Opcjonalne)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPasswordFree}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono disabled:opacity-50"
                  placeholder={isPasswordFree ? 'Tryb bez hasła aktywny' : 'Wprowadź hasło...'}
                />
              </div>
            </div>

            {/* Toggle Password Free Mode */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">Tryb bez hasła dla całej aplikacji</h4>
                <p className="text-[11px] text-slate-400">Pozwala na natychmiastowe uruchamianie wszystkich funkcji bez uwierzytelniania.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPasswordFree}
                  onChange={(e) => setIsPasswordFree(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* ISO Download Security */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <Disc className="w-4 h-4 text-blue-400" /> Ochrona PIN / Hasłem dla Pobierania i Nagrywania Obrazów ISO
                  </h4>
                  <p className="text-[11px] text-slate-400">Wymagaj kodu PIN lub pozostaw pobieranie ISO całkowicie otwarte (bez hasła na ISO).</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isoPasswordProtected}
                    onChange={(e) => setIsoPasswordProtected(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isoPasswordProtected && (
                <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                  <span className="text-xs text-slate-300">Kod PIN do ISO:</span>
                  <input
                    type="text"
                    value={isoPin}
                    onChange={(e) => setIsoPin(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-32"
                    placeholder="np. 786409"
                  />
                  <span className="text-[11px] text-slate-400">(Domyślny PIN: 786409)</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Zapisz Ustawienia i Sesję
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
