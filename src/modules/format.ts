/** Formatação pt-BR compartilhada pelos componentes de domínio. Datas: `lib/datas`. */

import { formatarData, formatarHora } from "@/lib/datas";

const nf = new Intl.NumberFormat("pt-BR");
const nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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

/** 12/03/2026 — aceita `YYYY-MM-DD` ou ISO completo (dia no fuso das propriedades). */
export function formatDate(iso: string | undefined | null): string {
  return formatarData(iso);
}

/** 09:14 (fuso das propriedades). */
export function formatTime(iso: string): string {
  return formatarHora(iso);
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

/** "2,5 m". */
export function formatMeters(meters: number): string {
  return `${meters.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m`;
}

/** "18 meses", "1 mês", "2 anos e 6 meses" (a partir de 24 meses, em anos). */
export function formatMonths(months: number): string {
  if (months < 24) return plural(months, "mês", "meses");
  const anos = Math.floor(months / 12);
  const resto = months % 12;
  return resto ? `${plural(anos, "ano")} e ${plural(resto, "mês", "meses")}` : plural(anos, "ano");
}
