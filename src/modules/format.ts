/** Formatação pt-BR compartilhada pelos componentes de domínio. */

const nf = new Intl.NumberFormat("pt-BR");
const nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const df = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
const tf = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** 1.400 */
export function formatNumber(value: number): string {
  return nf.format(value);
}

/** Área em m² a partir de comprimento × largura (m). */
export function areaSquareMeters(length: number, width: number): number {
  return length > 0 && width > 0 ? length * width : 0;
}

/** 2,4 ha (1 casa decimal; inteiro quando exato, ex.: "4 ha" com `trimZero`). */
export function formatHectares(squareMeters: number, opts: { trimZero?: boolean } = {}): string {
  const ha = squareMeters / 10_000;
  if (opts.trimZero && Number.isInteger(ha)) return `${nf.format(ha)} ha`;
  return `${nf1.format(ha)} ha`;
}

/** 24.000 m² */
export function formatSquareMeters(squareMeters: number): string {
  return `${nf.format(squareMeters)} m²`;
}

/** 12/03/2026 — aceita `YYYY-MM-DD` ou ISO completo (data tratada em UTC). */
export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return Number.isNaN(d.getTime()) ? "—" : df.format(d);
}

/** 09:14 (hora local). */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : tf.format(d);
}

/** 240 KB · 1,2 MB */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${nf1.format(bytes / (1024 * 1024))} MB`;
}

/** "1 plantio" / "2 plantios" */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
}

/** Iniciais para Avatar ("Ana Ribeiro" → "AR"). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}
