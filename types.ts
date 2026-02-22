
export interface Sector {
  id: string;
  name: string;
}

export interface DikeConfig {
  id: string;
  sectorId: string;
  name: string;
  progInicioRio: string;
  progFinRio: string;
  progInicioDique: string;
  progFinDique: string;
  totalML: number;
  notes?: string;
}

export interface MeasurementEntry {
  id: string;
  dikeId: string;
  pk: string;
  distancia: number;
  tipoTerreno: "B1" | "B2" | string;
  tipoEnrocado: "TIPO 1" | "TIPO 2" | string;
  intervencion: string;

  // 403.A CONFORMACION Y COMPACTACION DE DIQUE
  item403A_Contractual: number;
  item403A_Rep: number;
  item403A_Fund: number;

  // CORTE POST. RECUPERACION DE ROCA
  corteRoca_Recuperacion: number;

  // 402.B EXCAVACION MASIVA
  item402B_Contractual: number;
  item402B_Rep: number;
  item402B_Fund: number;

  // 402.E EXCAVACION UÑA
  item402E_NivelFreatico: number;
  item402E_NivelFreatico_MM: number;

  // 405.A DESCOLMATACION
  item405A_Descolmatacion: number;
  item405A_Descolmatacion_MM: number;

  // 404.A/B ENROCADO TALUD
  item404_Talud_T1: number;
  item404_Talud_T2: number;
  item404_Talud_T1_MM: number; 
  item404_Talud_T2_MM: number;

  // 404.D/E ENROCADO UÑA
  item404_Una_T1: number;
  item404_Una_T2: number;
  item404_Una_T1_MM: number; 
  item404_Una_T2_MM: number;

  // 413.A RELLENO
  item413A_Contractual: number;
  item413A_MM: number;

  // VARIOS
  item412A_Afirmado: number;
  item406A_Perfilado: number;
  item409A_Geotextil: number;
  item416A_Fundacion: number;
  item408A_Zanja: number;
  item414A_Geoceldas?: number;
  gavion: number;

  // 501.A CONTROL (Flag for execution)
  item501A_Carguio?: number;

  // Allow dynamic properties for Custom Columns
  [key: string]: any;
}

export interface ProgressEntry {
  id: string;
  date: string;
  dikeId: string;
  progInicio: string;
  progFin: string;
  longitud: number;
  tipoTerreno: "B1" | "B2";
  tipoEnrocado: "TIPO 1" | "TIPO 2";
  partida: string;
  capa: string;
  observaciones: string;
}

export interface BudgetItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  metrado: number;
  price: number;
  selected?: boolean;
}

export interface BudgetGroup {
  id: string;
  code: string;
  name: string;
  items: BudgetItem[];
}

export interface BudgetSection {
  id: string;
  name: string;
  groups: BudgetGroup[];
}

export interface ProjectBackup {
  sectors?: Sector[];
  dikes: DikeConfig[];
  measurements: MeasurementEntry[];
  progressEntries: ProgressEntry[];
  customColumns: string[];
  budgetBySector?: Record<string, BudgetSection[]>;
  budgetByDike?: Record<string, BudgetSection[]>;
  storagePath?: string;
  timestamp: number;
}

export interface CopySuggestion {
  headline: string;
  cta: string;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5";
export type ImageSize = "1024x1024" | "1200x628" | "1080x1920";
export type BannerStyle = "minimal" | "vibrant" | "professional" | "editorial";

export interface GeneratedImage {
  id: string;
  url: string;
  size: string;
  ratio: string;
  style: string;
}

export interface BackupFile {
  id: string;
  name: string;
  path: string;
  type: 'auto' | 'manual' | 'temp';
  date: string;
  size: string;
  data: ProjectBackup;
}
