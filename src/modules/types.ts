/**
 * Tipos de domínio do Fruti — contrato único compartilhado pelos componentes
 * de `src/modules/*` e `src/components/{files,history,charts,diagrams}`.
 * Datas em ISO (`YYYY-MM-DD` ou ISO completo); a formatação é da interface.
 */
import type { AreaStatus, BatchStatus, PlantingStatus } from "@/components/data-display/status-badge";

export type { AreaStatus, BatchStatus, PlantingStatus };

export type SpeciesId = string;
export type CultivarId = string;
export type AreaId = string;
export type PlantingId = string;
export type BatchId = string;
export type FileId = string;

// ── Catálogo ───────────────────────────────────────────────────
export type SpeciesCycle = "perene" | "anual" | "semiperene";

export interface Species {
  id: SpeciesId;
  /** Nome popular (ex.: "Manga"). */
  name: string;
  /** Nome científico (ex.: "Mangifera indica"). */
  scientificName: string;
  family?: string;
  cycle?: SpeciesCycle;
  imageUrl?: string;
  /** Descrição livre (catálogo). */
  description?: string;
  /** `false` = retirada do catálogo (não aparece para novos plantios). Padrão: ativa. */
  active?: boolean;
  cultivarCount?: number;
  /** Ausente = desconhecido (não exibe contagem). */
  plantingCount?: number;
}

export interface SpeciesRef {
  id: SpeciesId;
  name: string;
  scientificName?: string;
}

export interface Cultivar {
  id: CultivarId;
  name: string;
  speciesId: SpeciesId;
  /** Origem/procedência (ex.: "Flórida, EUA"). */
  origin?: string;
  characteristics?: string;
  /** Espaçamento recomendado entre linhas, em metros. */
  rowSpacingM?: number;
  /** Espaçamento recomendado entre plantas, em metros. */
  plantSpacingM?: number;
  /** Idade em que começa a produzir, em meses. */
  productionStartMonths?: number;
  notes?: string;
  createdAt?: string;
  /** Ausente = desconhecido (não exibe contagem). */
  plantingCount?: number;
}

// ── Áreas ──────────────────────────────────────────────────────
export interface Area {
  id: AreaId;
  /** Código (ex.: "A-03"). */
  code: string;
  name: string;
  /** Comprimento em metros (modelo inicial: área retangular). */
  length: number;
  /** Largura em metros. */
  width: number;
  description?: string;
  createdAt?: string;
  activePlantings?: number;
  plants?: number;
  /** Área já ocupada por unidades de cultivo, em m². */
  unitsAreaM2?: number;
  /** Área ainda sem unidade de cultivo, em m². */
  freeAreaM2?: number;
}

/** Tipo da unidade de cultivo (glossário: Canteiro, Talhão ou Outro). */
export type CultivationUnitType = "canteiro" | "talhao" | "outro";

/**
 * Unidade de cultivo: divisão retangular de uma área que recebe plantios. A posição
 * (canto, em metros a partir do canto da área) é opcional; sem ela, a unidade não
 * aparece no desenho, só na lista.
 */
export interface CultivationUnit {
  id: string;
  areaId: AreaId;
  type: CultivationUnitType;
  name: string;
  code: string;
  description?: string;
  /** Comprimento (eixo x), em metros. */
  length: number;
  /** Largura (eixo y), em metros. */
  width: number;
  x?: number | null;
  y?: number | null;
}

export interface AreaRef {
  id: AreaId;
  code: string;
  name: string;
}

// ── Sementes e mudas ───────────────────────────────────────────
export type SeedlingOriginType = "mudas" | "sementes";

export interface SeedlingOrigin {
  type: SeedlingOriginType;
  batchId?: BatchId;
  /** Código do lote (ex.: "LM-2026-014"). */
  batchCode?: string;
}

export interface SeedlingBatch {
  id: BatchId;
  code: string;
  type: SeedlingOriginType;
  /** Descrição do material (ex.: "Mudas enxertadas"). */
  description?: string;
  species: SpeciesRef;
  cultivar?: { id: CultivarId; name: string } | null;
  /** Quantidade recebida. */
  total: number;
  /** Quantidade já utilizada em plantios. */
  used: number;
  /** Unidade da quantidade (padrão: "mudas" ou "sementes"). */
  unit?: string;
  receivedAt: string;
  supplier?: string;
}

// ── Plantios e plantas ─────────────────────────────────────────
export type PlantControlMode = "individual" | "agrupado" | "misto";

export interface PlantingSummary {
  id: PlantingId;
  /** Código (ex.: "PL-0042"). */
  code: string;
  status: PlantingStatus;
  species: SpeciesRef;
  cultivar?: { id: CultivarId; name: string } | null;
  area: AreaRef;
  plantedAt?: string;
  /** Data de encerramento (para exibir intervalo "2024–2025"). */
  endedAt?: string;
  plants: number;
  origin?: SeedlingOrigin | null;
}

export interface Planting extends PlantingSummary {
  control: PlantControlMode;
  notes?: string;
}

export interface PlantingRef {
  id: PlantingId;
  code: string;
  areaCode: string;
  plants: number;
  status: PlantingStatus;
}

export interface PlantGroup {
  id: string;
  code: string;
  name: string;
  quantity: number;
  description?: string;
  createdAt: string;
}

export interface Plant {
  id: string;
  /** Identificação (ex.: "M-07"). */
  code: string;
  /** Papel/rótulo (ex.: "Matriz"). */
  label?: string;
  plantingCode: string;
  row?: number;
  position?: number;
  createdAt: string;
  thumbnailUrl?: string;
}

// ── Arquivos ───────────────────────────────────────────────────
export interface EntityRef {
  type: "species" | "cultivar" | "area" | "planting" | "plant" | "batch";
  id: string;
  /** Rótulo legível (ex.: "Área A-03"). */
  label?: string;
}

export interface ImageRef {
  id: FileId;
  /** URL da miniatura/imagem (já autorizada). */
  src: string;
  alt: string;
  caption?: string;
  /** Legenda longa (quem enviou, quando). */
  description?: string;
  takenAt?: string;
}

export type DocumentCategory = "nota_fiscal" | "laudo" | "croqui" | "contrato" | "outro";

export interface DocumentRef {
  id: FileId;
  name: string;
  category: DocumentCategory;
  /** Tamanho em bytes. */
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
  linkedTo?: EntityRef;
  pages?: number;
}

// ── Histórico ──────────────────────────────────────────────────
export interface Actor {
  name: string;
  avatarUrl?: string;
}

export interface FieldChange {
  field: string;
  before: string;
  after: string;
}

export type HistoryEventType = "status" | "plantas" | "arquivos" | "cadastro" | "edicao";

export interface HistoryEvent {
  id: string;
  /** ISO completo. */
  at: string;
  actor: Actor;
  /** Verbo + objeto (ex.: "editou o plantio PL-0042"). */
  action: string;
  type: HistoryEventType;
  changes?: FieldChange[];
}
