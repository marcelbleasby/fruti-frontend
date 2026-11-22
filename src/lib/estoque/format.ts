import { UNIDADE_LABEL, type Unidade } from "./types";

/** Fuso das propriedades (o mesmo da API: TIME_ZONE = America/Sao_Paulo). */
const TZ = "America/Sao_Paulo";

const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moedaCompacta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const toNumber = (v: string | number | null | undefined) => (v === null || v === undefined ? 0 : Number(v));

/** "1.250 un", "12,5 kg". */
export function formatQuantidade(valor: string | number, unidade: Unidade) {
  return `${numero.format(toNumber(valor))} ${UNIDADE_LABEL[unidade].curta}`;
}

/** Versão por extenso para leitores de tela: "1.250 unidades". */
export function quantidadePorExtenso(valor: string | number, unidade: Unidade) {
  const n = toNumber(valor);
  const u = UNIDADE_LABEL[unidade];
  return `${numero.format(n)} ${Math.abs(n) === 1 ? u.singular : u.plural}`;
}

export function formatMoeda(valor: string | number | null | undefined, { compacta = false } = {}) {
  if (valor === null || valor === undefined) return "—";
  return (compacta ? moedaCompacta : moeda).format(toNumber(valor));
}

/** "AAAA-MM-DD" → "05/03/2026" (sem passar por fuso: é uma data de calendário). */
export function formatData(iso: string | null | undefined) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

/** Hoje como "AAAA-MM-DD" no fuso das propriedades. */
export function hojeISO(agora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(agora);
}

/** Dias de `deISO` até `ateISO` (datas de calendário). */
export function diasEntre(deISO: string, ateISO: string) {
  const ms = Date.parse(`${ateISO.slice(0, 10)}T00:00:00Z`) - Date.parse(`${deISO.slice(0, 10)}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

export type SituacaoDeValidade =
  | { tipo: "sem-validade" }
  | { tipo: "vencido"; dias: number }
  | { tipo: "vence-logo"; dias: number }
  | { tipo: "ok"; dias: number };

/** Janela de alerta de vencimento. */
export const DIAS_ALERTA_VALIDADE = 30;

export function situacaoDeValidade(validade: string | null, hoje = hojeISO()): SituacaoDeValidade {
  if (!validade) return { tipo: "sem-validade" };
  const dias = diasEntre(hoje, validade);
  if (dias < 0) return { tipo: "vencido", dias: -dias };
  if (dias <= DIAS_ALERTA_VALIDADE) return { tipo: "vence-logo", dias };
  return { tipo: "ok", dias };
}

/** Fração restante do lote (0–1), para a barra de saldo. */
export function fracaoDoSaldo(saldo: string | number, inicial: string | number) {
  const i = toNumber(inicial);
  if (i <= 0) return 0;
  return Math.max(0, Math.min(1, toNumber(saldo) / i));
}

/** Leitura de número digitado em pt-BR — fica no DS, junto do DecimalInput. */
export { parseDecimalPtBR as parseDecimalBR } from "@/components/forms/decimal-input";
