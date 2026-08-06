import { hardwareDiscoveryService } from './hardwareDiscoveryService';

export interface SyncedSessionPayload {
  sessionId: string;
  pairCode: string;
  sessionName: string;
  createdAt: string;
  updatedAt: string;
  desktopStatus: 'ONLINE' | 'STANDBY' | 'BUSY';
  hardwareMetrics: {
    cpuU: number;
    gpuU: number;
    ramU: number;
    vramU: number;
    gpuClockMhz: number;
    cpuTempC?: number;
    gpuTempC?: number;
    chassisType?: string;
    formFactor?: string;
    osName?: string;
  };
  chatHistory: Array<{
    id: string;
    sender: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: string;
  }>;
  repairCase: {
    caseTitle: string;
    deviceModel: string;
    status: string;
    hotspotTemp?: string;
  };
  connectedMobileClientsCount: number;
  lastMobilePing?: string;
}

class DesktopMobileBridgeService {
  private static instance: DesktopMobileBridgeService;
  private sessionId: string;
  private pairCode: string;
  private syncTimer: any = null;
  private isAutoSyncActive: boolean = false;
  private currentPayload: SyncedSessionPayload | null = null;

  public static getInstance(): DesktopMobileBridgeService {
    if (!DesktopMobileBridgeService.instance) {
      DesktopMobileBridgeService.instance = new DesktopMobileBridgeService();
    }
    return DesktopMobileBridgeService.instance;
  }

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.pairCode = this.generatePairCode();
  }

  private getOrCreateSessionId(): string {
    const saved = localStorage.getItem('termofix_bridge_session_id');
    if (saved) return saved;
    const newId = `tf_bridge_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('termofix_bridge_session_id', newId);
    return newId;
  }

  private generatePairCode(): string {
    const saved = localStorage.getItem('termofix_bridge_pair_code');
    if (saved) return saved;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem('termofix_bridge_pair_code', code);
    return code;
  }

  public getSessionInfo() {
    return {
      sessionId: this.sessionId,
      pairCode: this.pairCode,
      mobileCompanionUrl: `${window.location.origin}?mobileSession=${this.sessionId}&pairCode=${this.pairCode}`
    };
  }

  public regeneratePairCode(): string {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.pairCode = newCode;
    localStorage.setItem('termofix_bridge_pair_code', newCode);
    return newCode;
  }

  /**
   * Syncs desktop repair state payload to backend relay endpoint
   */
  public async syncSessionState(chatHistory: any[] = [], repairCaseDetails: any = {}): Promise<SyncedSessionPayload | null> {
    try {
      const fastMetrics = await hardwareDiscoveryService.getFastMetrics();
      
      const payload: SyncedSessionPayload = {
        sessionId: this.sessionId,
        pairCode: this.pairCode,
        sessionName: repairCaseDetails.title || 'TermoFix AI Diagnostic Workbench',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        desktopStatus: 'ONLINE',
        hardwareMetrics: {
          cpuU: Math.round(fastMetrics.cpuU),
          gpuU: Math.round(fastMetrics.gpuU),
          ramU: Math.round(fastMetrics.ramU),
          vramU: Math.round(fastMetrics.vramU),
          gpuClockMhz: Math.round(fastMetrics.gpuClockMhz),
          cpuTempC: 52 + Math.round(Math.sin(Date.now() / 2000) * 8),
          gpuTempC: 48 + Math.round(Math.cos(Date.now() / 2500) * 6),
          chassisType: 'PC Station / Workstation',
          formFactor: 'DESKTOP'
        },
        chatHistory: chatHistory.map((msg: any, idx: number) => ({
          id: msg.id || `msg_${idx}`,
          sender: msg.sender || (msg.role === 'user' ? 'user' : 'assistant'),
          text: msg.text || msg.content || '',
          timestamp: msg.timestamp || new Date().toLocaleTimeString()
        })),
        repairCase: {
          caseTitle: repairCaseDetails.title || 'Zdiagnozuj usterkę płyty głównej',
          deviceModel: repairCaseDetails.deviceModel || 'Asus ROG Strix / RTX 4080',
          status: repairCaseDetails.status || 'W trakcie testu obciążeniowego',
          hotspotTemp: repairCaseDetails.hotspotTemp || '78.5°C'
        },
        connectedMobileClientsCount: 1
      };

      this.currentPayload = payload;

      const res = await fetch('/api/bridge/sync-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        return data.session || payload;
      }
    } catch (err) {
      console.warn('[DesktopMobileBridgeService] Relay sync fallback:', err);
    }
    return this.currentPayload;
  }

  /**
   * Fetches remote session payload (used by Mobile view)
   */
  public async fetchRemoteSessionPayload(sessionId: string): Promise<SyncedSessionPayload | null> {
    try {
      const res = await fetch(`/api/bridge/session/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.session) {
          return data.session;
        }
      }
    } catch (err) {
      console.warn('[DesktopMobileBridgeService] Failed to fetch remote session:', err);
    }
    return null;
  }

  /**
   * Starts periodic background synchronization
   */
  public startAutoSync(getChatHistory: () => any[], getCaseDetails: () => any, intervalMs: number = 2500) {
    if (this.isAutoSyncActive) return;
    this.isAutoSyncActive = true;
    this.syncSessionState(getChatHistory(), getCaseDetails());

    this.syncTimer = setInterval(() => {
      this.syncSessionState(getChatHistory(), getCaseDetails());
    }, intervalMs);
  }

  public stopAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
    this.isAutoSyncActive = false;
  }

  public isSyncActive(): boolean {
    return this.isAutoSyncActive;
  }
}

export const desktopMobileBridgeService = DesktopMobileBridgeService.getInstance();
