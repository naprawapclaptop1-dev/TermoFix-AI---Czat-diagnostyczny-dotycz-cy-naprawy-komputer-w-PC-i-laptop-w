export type ThermalPalette = 'ironbow' | 'rainbow' | 'hotred' | 'lava' | 'grayscale';

export interface SpotPoint {
  id: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  tempC: number;
  label?: string;
}

export interface ThermalData {
  palette: ThermalPalette;
  maxTemp: number;
  minTemp: number;
  hotspotLocation?: string;
  spotPoints: SpotPoint[];
}

export interface SuspectComponent {
  designator: string; // e.g., PQ202, PU1, PC43
  type: string; // e.g., N-Channel MOSFET, PWM Buck Controller
  description: string;
}

export interface VoltageTestPoint {
  rail: string; // e.g., 19V VIN, 3.3V ALW, VCCCORE
  expected: string;
  multimeterMode: string; // Diode, Resistance, DC Voltage
  normalReading: string;
}

export interface DiagnosticCardData {
  detectedDevice?: string;
  thermalAnalysis?: {
    hasHotspot: boolean;
    estimatedPeakTemp: string;
    suspectZone: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';
  };
  suspectComponents?: SuspectComponent[];
  voltageTestPoints?: VoltageTestPoint[];
  diagnosisSummary?: string;
  repairSteps?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  thermalData?: ThermalData;
  structuredDiagnosis?: DiagnosticCardData;
  isLoading?: boolean;
}

export type DiagnosticCategory = 'thermal' | 'disk' | 'windows' | 'gpu';

export interface JournalEntry {
  id: string;
  customerName: string;
  deviceModel: string;
  serialNumber: string;
  date: string;
  status: 'Naprawiono' | 'W trakcie' | 'Oczekuje na części' | 'Nieoplacalna' | 'Wyceniono' | 'Odrzucono' | string;
  faultSummary: string;
  peakTemp: string;
  suspectComponent: string;
  repairCostEstimated: string;
  technicianNotes: string;
  clientName?: string;
  faultCategory?: string;
  diagnosisSummary?: string;
}

export type RepairJournalEntry = JournalEntry;

export interface PresetCase {
  id: string;
  title: string;
  titlePl: string;
  category: 'laptop' | 'gpu' | 'desktop' | 'power' | 'disk' | 'windows';
  description: string;
  imageUrl: string;
  isThermal: boolean;
  defaultThermalData: ThermalData;
  symptoms: string[];
  suggestedPrompt: string;
}

export interface LiveSessionBackupData {
  timestamp: string;
  readableTime: string;
  messages: ChatMessage[];
  thermalData: ThermalData;
  imageUrl: string;
  presetId?: string;
  presetTitle?: string;
}
