import React, { useState } from 'react';
import {
  Shield,
  Globe,
  Server,
  Lock,
  Terminal,
  Wifi,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Square,
  Sliders,
  Key,
  FileText,
  Activity,
  ShieldCheck,
  Cpu,
  Download
} from 'lucide-react';

interface VpnClientSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (prompt: string) => void;
}

interface VpnProfile {
  id: string;
  name: string;
  protocol: 'WireGuard' | 'OpenVPN' | 'Cisco AnyConnect' | 'IPSec IKEv2' | 'SOCKS5 / SSH';
  serverHost: string;
  location: string;
  latencyMs: number;
  status: 'connected' | 'disconnected' | 'connecting';
  ipAssigned?: string;
  txBytes?: string;
  rxBytes?: string;
}

export const VpnClientSuiteModal: React.FC<VpnClientSuiteModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'wireguard' | 'cisco' | 'socks' | 'audit'>('wireguard');
  
  // VPN Profiles state
  const [profiles, setProfiles] = useState<VpnProfile[]>([
    {
      id: 'vpn-1',
      name: 'Warszawa Serwis Główny (WireGuard UDP 51820)',
      protocol: 'WireGuard',
      serverHost: 'vpn.naprawapclaptop.pl:51820',
      location: 'Warszawa, PL (DataCenter 1)',
      latencyMs: 14,
      status: 'connected',
      ipAssigned: '10.8.0.42',
      txBytes: '142.8 MB',
      rxBytes: '1.24 GB',
    },
    {
      id: 'vpn-2',
      name: 'Frankfurt Enterprise Gateway (Cisco AnyConnect)',
      protocol: 'Cisco AnyConnect',
      serverHost: 'cisco-gw.enterprise-secure.de:443',
      location: 'Frankfurt, DE',
      latencyMs: 28,
      status: 'disconnected',
    },
    {
      id: 'vpn-3',
      name: 'Amsterdam SOCKS5 Tunnel & SSH Proxy',
      protocol: 'SOCKS5 / SSH',
      serverHost: 'proxy.termofix.net:1080',
      location: 'Amsterdam, NL',
      latencyMs: 31,
      status: 'disconnected',
    },
    {
      id: 'vpn-4',
      name: 'Warszawa IPSec IKEv2 (Backup)',
      protocol: 'IPSec IKEv2',
      serverHost: 'backup-vpn.naprawapclaptop.pl',
      location: 'Warszawa, PL',
      latencyMs: 16,
      status: 'disconnected',
    },
  ]);

  const [activeConnectionId, setActiveConnectionId] = useState<string | null>('vpn-1');
  const [isConnecting, setIsConnecting] = useState(false);
  const [killSwitchEnabled, setKillSwitchEnabled] = useState(true);
  const [dnsLeakProtection, setDnsLeakProtection] = useState(true);
  const [newConfigInput, setNewConfigInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[INIT] VPN Client Suite v4.5.2 (Serwis Rafał Jarosz)',
    '[WIREGUARD] Interface wg0 up with public key qX89+kLm...',
    '[CONNECT] Handshake established with 185.204.0.12:51820',
    '[OK] Tunnel active. IP 10.8.0.42 assigned successfully.'
  ]);

  if (!isOpen) return null;

  const handleToggleConnect = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    if (profile.status === 'connected') {
      // Disconnect
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'disconnected', ipAssigned: undefined } : p))
      );
      if (activeConnectionId === id) setActiveConnectionId(null);
      setTerminalLogs((prev) => [`[DISCONNECT] Tunnel ${profile.name} closed.`, ...prev]);
    } else {
      // Connect
      setIsConnecting(true);
      setTerminalLogs((prev) => [`[CONNECTING] Initializing secure handshake for ${profile.name}...`, ...prev]);
      setTimeout(() => {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  id: p.id,
                  name: p.name,
                  protocol: p.protocol,
                  serverHost: p.serverHost,
                  location: p.location,
                  latencyMs: p.latencyMs,
                  status: 'connected',
                  ipAssigned: `10.${Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
                  txBytes: '2.4 MB',
                  rxBytes: '14.8 MB',
                }
              : { ...p, status: 'disconnected', ipAssigned: undefined } // Disconnect others if exclusive
          )
        );
        setActiveConnectionId(id);
        setIsConnecting(false);
        setTerminalLogs((prev) => [`[SUCCESS] Secure tunnel established with ${profile.name}!`, ...prev]);
      }, 900);
    }
  };

  const handleAddCustomProfile = () => {
    if (!newConfigInput.trim()) return;
    const newId = `vpn-${Date.now()}`;
    const newProf: VpnProfile = {
      id: newId,
      name: `Imported Config (${newConfigInput.slice(0, 24)}...)`,
      protocol: 'OpenVPN',
      serverHost: 'custom-vpn.remote-node.net:1194',
      location: 'Global Custom Endpoint',
      latencyMs: 45,
      status: 'disconnected',
    };
    setProfiles((prev) => [...prev, newProf]);
    setNewConfigInput('');
    setTerminalLogs((prev) => [`[IMPORT] Successfully imported OpenVPN / WireGuard config profile.`, ...prev]);
  };

  const handleTestLatency = () => {
    setTerminalLogs((prev) => [`[PING] Testing latencies for all VPN gateway nodes...`, ...prev]);
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        latencyMs: Math.max(8, p.latencyMs + Math.floor(Math.random() * 12) - 6),
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <span>3 Aplikacje VPN • Serwis Tunnel Suite &amp; Gateway Manager</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                  {profiles.filter(p => p.status === 'connected').length > 0 ? 'TUNEL AKTYWNY' : 'ROZŁĄCZONY'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Zarządzaj 3 protokołami VPN: WireGuard (Aplikacja 1), Cisco AnyConnect (Aplikacja 2), SOCKS5/SSH Proxy (Aplikacja 3)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-lg flex items-center justify-center transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs for the 3 Apps */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wireguard')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'wireguard'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>App 1: WireGuard &amp; OpenVPN</span>
          </button>

          <button
            onClick={() => setActiveTab('cisco')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'cisco'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-300" />
            <span>App 2: Cisco AnyConnect / IPSec</span>
          </button>

          <button
            onClick={() => setActiveTab('socks')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'socks'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-300" />
            <span>App 3: SOCKS5 &amp; SSH Tunnel</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-purple-300" />
            <span>Diagnostyka i Logi Tunelu</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="killswitch"
                  checked={killSwitchEnabled}
                  onChange={(e) => setKillSwitchEnabled(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="killswitch" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Kill-Switch (Blokuj bez VPN)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dnsleak"
                  checked={dnsLeakProtection}
                  onChange={(e) => setDnsLeakProtection(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="dnsleak" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  DNS Leak Protection
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestLatency}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Ping / Latency</span>
              </button>

              {onSendToChat && (
                <button
                  onClick={() => onSendToChat("Sprawdźmy konfigurację tunelu VPN i status połączenia sieciowego dla serwisu.")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Zapytaj AI o Sieć</span>
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: WireGuard & OpenVPN App */}
          {activeTab === 'wireguard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Aplikacja 1: WireGuard &amp; OpenVPN Client Suite</span>
                  </h3>
                  <p className="text-xs text-slate-400">Ultraszybkie tunele kryptograficzne ChaCha20 / AES-256 dla serwisantów</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Wklej zawartość pliku .ovpn lub .conf"
                    value={newConfigInput}
                    onChange={(e) => setNewConfigInput(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white w-64 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddCustomProfile}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Importuj Config</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.filter(p => p.protocol === 'WireGuard' || p.protocol === 'OpenVPN').map((p) => (
                  <div
                    key={p.id}
                    className={`bg-slate-950 border rounded-xl p-4 transition space-y-3 ${
                      p.status === 'connected' ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10 bg-slate-900/50' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">{p.protocol}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            p.status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                            {p.status === 'connected' ? 'Połączono' : 'Rozłączony'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{p.name}</h4>
                        <p className="text-[11px] text-slate-400">{p.location} • {p.serverHost}</p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {p.latencyMs} ms
                      </span>
                    </div>

                    {p.status === 'connected' && (
                      <div className="bg-slate-900/90 rounded-lg p-2.5 text-[11px] font-mono grid grid-cols-3 gap-2 border border-slate-800 text-slate-300">
                        <div>
                          <span className="text-slate-500 block">Adres IP:</span>
                          <span className="text-emerald-400 font-bold">{p.ipAssigned}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Wysłano:</span>
                          <span className="text-white">{p.txBytes}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Odebrano:</span>
                          <span className="text-white">{p.rxBytes}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-500">Szyfrowanie: ChaCha20-Poly1305</span>
                      <button
                        onClick={() => handleToggleConnect(p.id)}
                        disabled={isConnecting}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          p.status === 'connected'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {p.status === 'connected' ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Rozłącz</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Połącz</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Cisco AnyConnect / IPSec App */}
          {activeTab === 'cisco' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Aplikacja 2: Cisco AnyConnect &amp; IPSec Gateway Manager</span>
                </h3>
                <p className="text-xs text-slate-400">Korporacyjny dostęp do sieci VLAN i zasobów serwerowych przez bramę SSL/IPSec</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.filter(p => p.protocol === 'Cisco AnyConnect' || p.protocol === 'IPSec IKEv2').map((p) => (
                  <div
                    key={p.id}
                    className={`bg-slate-950 border rounded-xl p-4 transition space-y-3 ${
                      p.status === 'connected' ? 'border-amber-500/60 shadow-lg shadow-amber-500/10 bg-slate-900/50' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">{p.protocol}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            p.status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                            {p.status === 'connected' ? 'Połączono' : 'Rozłączony'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{p.name}</h4>
                        <p className="text-[11px] text-slate-400">{p.location} • {p.serverHost}</p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {p.latencyMs} ms
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg text-xs space-y-2 border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Realm / Grupa:</span>
                        <span className="font-mono text-white">IT-Admin-Access</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Certyfikat TLS:</span>
                        <span className="font-mono text-emerald-400">Zweryfikowany (SHA-256)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-500">Port 443 / DTLS Active</span>
                      <button
                        onClick={() => handleToggleConnect(p.id)}
                        disabled={isConnecting}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          p.status === 'connected'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 text-white'
                        }`}
                      >
                        {p.status === 'connected' ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Rozłącz</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Połącz z Gateway</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SOCKS5 & SSH Tunnel App */}
          {activeTab === 'socks' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Aplikacja 3: SOCKS5 &amp; SSH Dynamic Port Forwarding Proxy</span>
                </h3>
                <p className="text-xs text-slate-400">Bezpośrednie tunele SOCKS5 na porcie 1080 do bezpiecznego routingu ruchu przeglądarki</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.filter(p => p.protocol === 'SOCKS5 / SSH').map((p) => (
                  <div
                    key={p.id}
                    className={`bg-slate-950 border rounded-xl p-4 transition space-y-3 ${
                      p.status === 'connected' ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10 bg-slate-900/50' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">{p.protocol}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                            p.status === 'connected' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                            {p.status === 'connected' ? 'Aktywny SOCKS5' : 'Zatrzymany'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5">{p.name}</h4>
                        <p className="text-[11px] text-slate-400">{p.location} • {p.serverHost}</p>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {p.latencyMs} ms
                      </span>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg text-xs space-y-1.5 border border-slate-800 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lokalny Port Proxy:</span>
                        <span className="text-cyan-300 font-bold">127.0.0.1:1080</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Szyfrowanie SSH:</span>
                        <span className="text-white">AES-256-GCM / RSA 4096</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] text-slate-500">Dynamic Port Forwarding</span>
                      <button
                        onClick={() => handleToggleConnect(p.id)}
                        disabled={isConnecting}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                          p.status === 'connected'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold'
                        }`}
                      >
                        {p.status === 'connected' ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Zatrzymaj Proxy</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Uruchom SOCKS5</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Logs & Terminal */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  <span>Dziennik Konsoli Tunelów VPN (Live Logs)</span>
                </h3>
                <p className="text-xs text-slate-400">Szczegółowy podgląd zdarzeń demona VPN, handshake i rutingu pakietów</p>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-slate-800 h-64 overflow-y-auto space-y-1.5 shadow-inner">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-slate-600 select-none">[{index + 1}]</span>
                    <span className={log.includes('SUCCESS') || log.includes('OK') ? 'text-emerald-300 font-bold' : log.includes('CONNECT') ? 'text-cyan-300' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Wszystkie 3 aplikacje działają w sandboksowanym środowisku serwisowym.
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
