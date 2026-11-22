/**
 * Dados de exemplo da vitrine de componentes (mesmos números do canvas do DS).
 * Pasta `_`-prefixada não vira rota; arquivo sem `page` também não.
 */
import type {
  Area,
  Cultivar,
  DocumentRef,
  HistoryEvent,
  ImageRef,
  Plant,
  PlantGroup,
  Planting,
  PlantingRef,
  PlantingSummary,
  SeedlingBatch,
  Species,
} from "@/modules/types";

export const SPECIES: Species[] = [
  { id: "sp-manga", name: "Manga", scientificName: "Mangifera indica", family: "Anacardiaceae", cycle: "perene", cultivarCount: 4, plantingCount: 3 },
  { id: "sp-caju", name: "Caju", scientificName: "Anacardium occidentale", family: "Anacardiaceae", cycle: "perene", cultivarCount: 2, plantingCount: 1 },
  { id: "sp-acerola", name: "Acerola", scientificName: "Malpighia emarginata", family: "Malpighiaceae", cycle: "perene", cultivarCount: 3, plantingCount: 1 },
  { id: "sp-goiaba", name: "Goiaba", scientificName: "Psidium guajava", family: "Myrtaceae", cycle: "perene", cultivarCount: 1, plantingCount: 1 },
  { id: "sp-maracuja", name: "Maracujá", scientificName: "Passiflora edulis", family: "Passifloraceae", cycle: "semiperene", cultivarCount: 1, plantingCount: 0 },
  { id: "sp-mamao", name: "Mamão", scientificName: "Carica papaya", family: "Caricaceae", cycle: "semiperene", cultivarCount: 0, plantingCount: 0 },
];

export const CULTIVARS: Cultivar[] = [
  { id: "cv-tommy", name: "Tommy Atkins", speciesId: "sp-manga", origin: "Flórida, EUA", createdAt: "2026-02-04", plantingCount: 2 },
  { id: "cv-palmer", name: "Palmer", speciesId: "sp-manga", origin: "Flórida, EUA", plantingCount: 1 },
  { id: "cv-kent", name: "Kent", speciesId: "sp-manga", origin: "Flórida, EUA", plantingCount: 0 },
  { id: "cv-keitt", name: "Keitt", speciesId: "sp-manga", origin: "Flórida, EUA", plantingCount: 0 },
  { id: "cv-ccp76", name: "CCP 76", speciesId: "sp-caju", origin: "Embrapa, CE", plantingCount: 1 },
  { id: "cv-brs366", name: "BRS 366 Jaburu", speciesId: "sp-acerola", origin: "Embrapa, CE", plantingCount: 1 },
];

export const AREAS: Area[] = [
  { id: "ar-01", code: "A-01", name: "Talhão Sul", length: 240, width: 200, activePlantings: 2, plants: 1860 },
  { id: "ar-03", code: "A-03", name: "Talhão Norte", length: 300, width: 80, createdAt: "2026-01-02", activePlantings: 1, plants: 480 },
  { id: "ar-05", code: "A-05", name: "Encosta", length: 200, width: 200, activePlantings: 1, plants: 350 },
  { id: "ar-07", code: "A-07", name: "Viveiro", length: 100, width: 60, activePlantings: 0, plants: 0 },
];

const manga = { id: "sp-manga", name: "Manga", scientificName: "Mangifera indica" };

export const PLANTING: Planting = {
  id: "pl-0042",
  code: "PL-0042",
  status: "em_desenvolvimento",
  species: manga,
  cultivar: { id: "cv-tommy", name: "Tommy Atkins" },
  area: { id: "ar-03", code: "A-03", name: "Talhão Norte" },
  plantedAt: "2026-03-12",
  plants: 480,
  origin: { type: "mudas", batchId: "lm-014", batchCode: "LM-2026-014" },
  control: "misto",
};

export const PLANTINGS: PlantingSummary[] = [
  PLANTING,
  {
    id: "pl-0027",
    code: "PL-0027",
    status: "encerrado",
    species: { id: "sp-melancia", name: "Melancia" },
    cultivar: { id: "cv-crimson", name: "Crimson Sweet" },
    area: { id: "ar-03", code: "A-03", name: "Talhão Norte" },
    plantedAt: "2024-09-10",
    endedAt: "2025-02-20",
    plants: 1200,
    origin: { type: "sementes", batchCode: "SM-2024-002" },
  },
];

export const PLANTING_REFS: PlantingRef[] = [
  { id: "pl-0042", code: "PL-0042", areaCode: "A-03", plants: 480, status: "em_desenvolvimento" },
  { id: "pl-0036", code: "PL-0036", areaCode: "A-04", plants: 120, status: "em_desenvolvimento" },
];

export const PLANT_GROUPS: PlantGroup[] = [
  { id: "gr-1", code: "GR-0042-01", name: "Linhas 1 a 4", quantity: 224, description: "Controle agrupado por linha", createdAt: "2026-03-12" },
  { id: "gr-2", code: "GR-0042-02", name: "Linhas 5 a 8", quantity: 224, description: "Controle agrupado por linha", createdAt: "2026-03-12" },
];

export const PLANT: Plant = {
  id: "pt-m07",
  code: "M-07",
  label: "Matriz",
  plantingCode: "PL-0042",
  row: 3,
  position: 14,
  createdAt: "2026-11-20",
};

export const BATCHES: SeedlingBatch[] = [
  { id: "lm-014", code: "LM-2026-014", type: "mudas", description: "Mudas enxertadas", species: manga, cultivar: { id: "cv-tommy", name: "Tommy Atkins" }, total: 500, used: 480, receivedAt: "2026-03-05" },
  { id: "lm-016", code: "LM-2026-016", type: "mudas", description: "Mudas", species: { id: "sp-banana", name: "Banana" }, cultivar: { id: "cv-prata", name: "Prata Anã" }, total: 300, used: 0, receivedAt: "2026-04-02" },
  { id: "lm-009", code: "LM-2026-009", type: "mudas", description: "Mudas", species: { id: "sp-caju", name: "Caju" }, cultivar: { id: "cv-ccp76", name: "CCP 76" }, total: 350, used: 350, receivedAt: "2026-02-01" },
];

/** SVG neutro em data URI para as miniaturas de exemplo (sem rede). */
function placeholder(label: string, hue: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="hsl(${hue},38%,82%)"/><text x="200" y="158" font-family="sans-serif" font-size="22" text-anchor="middle" fill="hsl(${hue},45%,22%)">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const IMAGES: ImageRef[] = [
  { id: "im-1", src: placeholder("Plantio", 130), alt: "Mudas recém-plantadas na linha 1", caption: "Plantio · 12/03" },
  { id: "im-2", src: placeholder("Vistoria", 110), alt: "Vistoria de 30 dias", caption: "Vistoria · 11/04" },
  { id: "im-3", src: placeholder("Linhas 1–4", 95), alt: "Linhas 1 a 4", caption: "Linhas 1–4 · 20/06" },
  { id: "im-4", src: placeholder("Matriz M-07", 80), alt: "Matriz M-07", caption: "Matriz M-07 · 02/09", description: "Matriz M-07 · PL-0042 · enviada por Ana Ribeiro em 02/09/2026" },
  { id: "im-5", src: placeholder("Floração", 45), alt: "Floração da matriz", caption: "Floração · 15/09" },
  { id: "im-6", src: placeholder("Frutos", 35), alt: "Frutos em formação", caption: "Frutos · 10/10" },
  { id: "im-7", src: placeholder("Irrigação", 190), alt: "Linha de irrigação", caption: "Irrigação · 01/11" },
  { id: "im-8", src: placeholder("Colheita", 40), alt: "Primeira colheita", caption: "Colheita · 18/11" },
];

export const DOCUMENTS: DocumentRef[] = [
  { id: "doc-1", name: "Nota fiscal — LM-2026-014.pdf", category: "nota_fiscal", size: 240 * 1024, uploadedAt: "2026-03-05", uploadedBy: "Ana Ribeiro", linkedTo: { type: "batch", id: "lm-014", label: "Lote LM-2026-014" } },
  { id: "doc-2", name: "Análise de solo — A-03.pdf", category: "laudo", size: 1.2 * 1024 * 1024, uploadedAt: "2026-02-20", uploadedBy: "Ana Ribeiro", linkedTo: { type: "area", id: "ar-03", label: "Área A-03" }, pages: 4 },
  { id: "doc-3", name: "Croqui do plantio.pdf", category: "croqui", size: 860 * 1024, uploadedAt: "2026-03-10", uploadedBy: "Carlos Mendes", linkedTo: { type: "planting", id: "pl-0042", label: "Plantio PL-0042" } },
];

/** Referência fixa de "agora" (evita divergência servidor × cliente em "Hoje"/"Ontem"). */
export const NOW = new Date("2026-11-21T15:00:00Z");

export const HISTORY: HistoryEvent[] = [
  { id: "ev-1", at: "2026-11-21T12:14:00Z", actor: { name: "Ana Ribeiro" }, action: "registrou 32 plantas individuais", type: "plantas" },
  {
    id: "ev-2",
    at: "2026-04-11T13:20:00Z",
    actor: { name: "Carlos Mendes" },
    action: "editou o plantio PL-0042",
    type: "status",
    changes: [
      { field: "Status", before: "Em preparo", after: "Ativo" },
      { field: "Plantas", before: "448", after: "480" },
    ],
  },
  { id: "ev-3", at: "2026-04-11T13:05:00Z", actor: { name: "Carlos Mendes" }, action: "adicionou 2 imagens", type: "arquivos" },
  { id: "ev-4", at: "2026-03-12T11:30:00Z", actor: { name: "Ana Ribeiro" }, action: "registrou o plantio", type: "cadastro" },
];

// ── Gráficos (board BentoDados) ────────────────────────────────
export const PLANTS_BY_SPECIES = [
  { label: "Manga", value: 2100 },
  { label: "Caju", value: 1600 },
  { label: "Acerola", value: 1240 },
  { label: "Goiaba", value: 920 },
  { label: "Maracujá", value: 620 },
];

export const MONTHS = ["dez", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov"];
export const NEW_PLANTINGS = { label: "dez/2025 – nov/2026", data: [1, 0, 2, 1, 3, 2, 0, 1, 2, 1, 2, 1] };
export const NEW_PLANTINGS_PREV = { label: "dez/2024 – nov/2025", data: [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1] };

/** 26 semanas de atividade determinística (sem aleatoriedade: mesma saída no servidor e no cliente). */
export const ACTIVITY_DAYS = Array.from({ length: 26 * 7 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 4, 25) + i * 86_400_000);
  const count = (i * 7 + (i % 5) * 3) % 9 === 0 ? 0 : ((i * 13) % 11) % 7;
  return { date: d.toISOString().slice(0, 10), count };
});

export const SPECIES_OPTIONS = SPECIES.map((s) => ({ value: s.id, label: s.name, description: s.scientificName }));
export const AREA_OPTIONS = AREAS.map((a) => ({ value: a.id, label: `${a.code} · ${a.name}` }));

// ── Mocks de rede ──────────────────────────────────────────────
/** Envio simulado: progresso a cada 150 ms, respeita cancelamento. */
export function mockUpload(file: File, ctx: { onProgress: (p: number) => void; signal: AbortSignal }): Promise<{ id: string }> {
  return new Promise((resolve, reject) => {
    let p = 0;
    const timer = setInterval(() => {
      p = Math.min(100, p + 12);
      ctx.onProgress(p);
      if (p >= 100) {
        clearInterval(timer);
        resolve({ id: file.name });
      }
    }, 150);
    ctx.signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(new DOMException("Envio cancelado", "AbortError"));
    });
  });
}

/** URL temporária simulada (800 ms). */
export function mockGetUrl(): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve("#"), 800));
}
