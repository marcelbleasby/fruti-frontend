/**
 * Datas e horas do Fruti — funções puras, servem no servidor e no cliente.
 *
 * Dois tipos de valor, como na API:
 * - **Data de calendário** (`DataISO`, "2026-11-21"): campos `date` da API
 *   (data de plantio, validade…). Não tem fuso: nunca passa por `new Date()`
 *   local, senão "21/11" vira "20/11" às 21h em São Paulo.
 * - **Instante** (`DataHoraISO`, "2026-11-21T09:14:00-03:00"): campos
 *   `datetime` (criado_em, realizado_em…). Exibido sempre no fuso das
 *   propriedades (`FUSO`, o mesmo `TIME_ZONE` da API), não no do navegador —
 *   assim servidor e cliente formatam igual e a hidratação não diverge.
 *
 * Hora do dia (`Hora`) é "HH:mm", 24 h.
 *
 * Atenção com Cache Components: `hojeISO()`/`agora` dependem do relógio. Em
 * componentes, use `useTodayISO()` (@/hooks) em vez de chamar direto no render.
 */

/** Fuso das propriedades (= `TIME_ZONE` do fruti-api). */
export const FUSO = "America/Sao_Paulo";
const LOCALE = "pt-BR";

/** "AAAA-MM-DD" — data de calendário, sem fuso. */
export type DataISO = string;
/** ISO 8601 com fuso ("2026-11-21T09:14:00-03:00" ou "…Z"). */
export type DataHoraISO = string;
/** "HH:mm", 00:00–23:59. */
export type Hora = string;

type Entrada = DataISO | DataHoraISO | Date | null | undefined;

const MS_DIA = 86_400_000;
const RE_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const RE_HORA = /^([01]\d|2[0-3]):([0-5]\d)$/;
const pad = (n: number) => String(n).padStart(2, "0");

// ---------------------------------------------------------------------------
// Validação

/** `true` para "AAAA-MM-DD" que existe no calendário (rejeita 2026-02-30). */
export function ehDataISO(valor: unknown): valor is DataISO {
  if (typeof valor !== "string") return false;
  const m = RE_DATA.exec(valor);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/** `true` para "HH:mm" válida (24 h). */
export function ehHora(valor: unknown): valor is Hora {
  return typeof valor === "string" && RE_HORA.test(valor);
}

// ---------------------------------------------------------------------------
// Internos: data de calendário ↔ número, instante ↔ partes no fuso

/** Meio-dia UTC do dia: formata com timeZone UTC sem risco de virar o dia. */
function utcDoDia(iso: DataISO): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d, 12));
}

function deUtc(d: Date): DataISO {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const partesFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: FUSO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** Ano, mês, dia, hora… do instante no `FUSO`. */
function partesNoFuso(instante: Date) {
  const p = Object.fromEntries(partesFmt.formatToParts(instante).map((x) => [x.type, x.value]));
  return { ano: +p.year, mes: +p.month, dia: +p.day, hora: +p.hour, minuto: +p.minute, segundo: +p.second };
}

/** Diferença (min) entre o relógio do `FUSO` e UTC naquele instante (São Paulo: -180). */
function offsetMinutos(instante: Date): number {
  const p = partesNoFuso(instante);
  const comoUtc = Date.UTC(p.ano, p.mes - 1, p.dia, p.hora, p.minuto, p.segundo);
  return Math.round((comoUtc - Math.floor(instante.getTime() / 1000) * 1000) / 60_000);
}

function formatarOffset(minutos: number): string {
  const abs = Math.abs(minutos);
  return `${minutos < 0 ? "-" : "+"}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Instante válido a partir de ISO com hora ou `Date`; data pura ("AAAA-MM-DD") → `null`. */
function paraInstante(valor: Entrada): Date | null {
  if (valor == null || valor === "") return null;
  if (valor instanceof Date) return Number.isNaN(valor.getTime()) ? null : valor;
  if (RE_DATA.test(valor)) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Conversão

/**
 * Data de calendário de qualquer entrada: "AAAA-MM-DD" passa direto; instante
 * (ISO com hora ou `Date`) vira o dia no `FUSO`. Inválido → `null`.
 */
export function paraDataISO(valor: Entrada): DataISO | null {
  if (typeof valor === "string" && RE_DATA.test(valor)) return ehDataISO(valor) ? valor : null;
  const instante = paraInstante(valor);
  if (!instante) return null;
  const p = partesNoFuso(instante);
  return `${p.ano}-${pad(p.mes)}-${pad(p.dia)}`;
}

/** Hora do dia ("HH:mm") de um instante, no `FUSO`. */
export function paraHora(valor: DataHoraISO | Date | null | undefined): Hora | null {
  const instante = paraInstante(valor);
  if (!instante) return null;
  const p = partesNoFuso(instante);
  return `${pad(p.hora)}:${pad(p.minuto)}`;
}

/** Hoje ("AAAA-MM-DD") no `FUSO`. */
export function hojeISO(agora: Date = new Date()): DataISO {
  return paraDataISO(agora)!;
}

/** Hora atual ("HH:mm") no `FUSO`. */
export function horaAtual(agora: Date = new Date()): Hora {
  return paraHora(agora)!;
}

/**
 * Junta data e hora digitadas (no `FUSO`) num instante ISO com o offset certo,
 * pronto para campos `datetime` da API: ("2026-11-21", "09:14") →
 * "2026-11-21T09:14:00-03:00". Entrada inválida → `null`.
 */
export function combinarDataHora(data: DataISO, hora: Hora): DataHoraISO | null {
  if (!ehDataISO(data) || !ehHora(hora)) return null;
  const [a, m, d] = data.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  const relogio = Date.UTC(a, m - 1, d, h, mi);
  // Duas passadas: acerta o offset mesmo perto de mudança de horário de verão.
  let offset = offsetMinutos(new Date(relogio));
  offset = offsetMinutos(new Date(relogio - offset * 60_000));
  return `${data}T${hora}:00${formatarOffset(offset)}`;
}

/** Separa um instante em data e hora no `FUSO` (para preencher formulários de edição). */
export function separarDataHora(valor: DataHoraISO | Date | null | undefined): { data: DataISO; hora: Hora } | null {
  const data = paraDataISO(paraInstante(valor));
  const hora = paraHora(valor);
  return data && hora ? { data, hora } : null;
}

/**
 * Lê data digitada em pt-BR: "21/11/2026", "1/2/2026", "21-11-2026",
 * "21112026" ou ano com 2 dígitos ("21/11/26" → 2026). Inválida → `null`.
 */
export function parseDataBR(texto: string | null | undefined): DataISO | null {
  const t = (texto ?? "").trim();
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(t) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(t);
  if (!m) return null;
  const ano = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const iso = `${ano}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return ehDataISO(iso) ? iso : null;
}

/**
 * Lê hora digitada: "9:05", "09:05", "9h05", "9h", "905", "0905", "9".
 * Inválida (25:00, 9:60) → `null`.
 */
export function parseHora(texto: string | null | undefined): Hora | null {
  const t = (texto ?? "").trim().toLowerCase().replace(/\s+/g, "");
  const m = /^(\d{1,2})(?:[:h](\d{2})?)?$/.exec(t) ?? /^(\d{1,2})(\d{2})$/.exec(t);
  if (!m) return null;
  const hora = `${pad(Number(m[1]))}:${pad(Number(m[2] ?? 0))}`;
  return ehHora(hora) ? hora : null;
}

// ---------------------------------------------------------------------------
// Formatação (pt-BR)

const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(opcoes: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const chave = JSON.stringify(opcoes);
  let f = cache.get(chave);
  if (!f) {
    f = new Intl.DateTimeFormat(LOCALE, opcoes);
    cache.set(chave, f);
  }
  return f;
}

/**
 * Formata a parte "data" de qualquer entrada. Data de calendário é formatada
 * como está; instante, no dia do `FUSO`.
 */
function formatarDia(valor: Entrada, opcoes: Intl.DateTimeFormatOptions, vazio: string): string {
  const iso = paraDataISO(valor);
  return iso ? fmt({ ...opcoes, timeZone: "UTC" }).format(utcDoDia(iso)) : vazio;
}

/** "21/11/2026". Vazio/inválido → `vazio` (padrão "—"). */
export function formatarData(valor: Entrada, vazio = "—"): string {
  return formatarDia(valor, { day: "2-digit", month: "2-digit", year: "numeric" }, vazio);
}

/** "21 de novembro de 2026". */
export function formatarDataExtensa(valor: Entrada, vazio = "—"): string {
  return formatarDia(valor, { day: "numeric", month: "long", year: "numeric" }, vazio);
}

/** "21 de nov." — para listas e eixos de gráfico. Com `ano: true`, "21 de nov. de 2026". */
export function formatarDataCurta(valor: Entrada, { ano = false } = {}, vazio = "—"): string {
  return formatarDia(valor, { day: "numeric", month: "short", ...(ano && { year: "numeric" }) }, vazio);
}

/** "novembro de 2026". */
export function formatarMesAno(valor: Entrada, vazio = "—"): string {
  return formatarDia(valor, { month: "long", year: "numeric" }, vazio);
}

/** "sábado". */
export function formatarDiaDaSemana(valor: Entrada, vazio = ""): string {
  return formatarDia(valor, { weekday: "long" }, vazio);
}

/** "09:14" no `FUSO`. Também aceita uma `Hora` já pronta. */
export function formatarHora(valor: DataHoraISO | Date | Hora | null | undefined, vazio = ""): string {
  if (typeof valor === "string" && ehHora(valor)) return valor;
  return paraHora(valor) ?? vazio;
}

/** "21/11/2026 às 09:14" no `FUSO`. */
export function formatarDataHora(valor: DataHoraISO | Date | null | undefined, vazio = "—"): string {
  const partes = separarDataHora(valor);
  return partes ? `${formatarData(partes.data)} às ${partes.hora}` : vazio;
}

/** "de 01/11/2026 a 21/11/2026", "a partir de 01/11/2026", "até 21/11/2026". */
export function formatarPeriodo(inicio: Entrada, fim: Entrada, vazio = "—"): string {
  const i = paraDataISO(inicio);
  const f = paraDataISO(fim);
  if (i && f) return i === f ? formatarData(i) : `de ${formatarData(i)} a ${formatarData(f)}`;
  if (i) return `a partir de ${formatarData(i)}`;
  if (f) return `até ${formatarData(f)}`;
  return vazio;
}

const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/**
 * Tempo relativo, para "atualizado …" e históricos.
 * - Data de calendário: "hoje", "ontem", "amanhã", "há 3 dias", "em 2 semanas"…
 *   (até 30 dias; depois, a data).
 * - Instante: "agora", "há 5 minutos", "há 2 horas"; de ontem para trás,
 *   igual à data de calendário.
 */
export function formatarRelativo(valor: Entrada, agora: Date = new Date(), vazio = "—"): string {
  const hoje = hojeISO(agora);
  const instante = paraInstante(valor);
  if (instante) {
    const seg = Math.round((instante.getTime() - agora.getTime()) / 1000);
    const abs = Math.abs(seg);
    if (abs < 45) return "agora";
    if (abs < 3600) return rtf.format(Math.round(seg / 60), "minute");
    if (paraDataISO(instante) === hoje) return rtf.format(Math.round(seg / 3600), "hour");
  }
  const iso = paraDataISO(valor);
  if (!iso) return vazio;
  const dias = diasEntre(hoje, iso);
  if (Math.abs(dias) < 7) return rtf.format(dias, "day");
  if (Math.abs(dias) <= 30) return rtf.format(Math.trunc(dias / 7), "week");
  return formatarData(iso);
}

// ---------------------------------------------------------------------------
// Aritmética de datas de calendário (sem fuso)

/** Soma (ou subtrai) dias. */
export function somarDias(iso: DataISO, dias: number): DataISO {
  return deUtc(new Date(utcDoDia(iso).getTime() + dias * MS_DIA));
}

/** Soma meses; o dia é limitado ao fim do mês (31/01 + 1 mês = 28/02 ou 29/02). */
export function somarMeses(iso: DataISO, meses: number): DataISO {
  const [a, m, d] = iso.split("-").map(Number);
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1, 12));
  const ultimo = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0, 12)).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimo));
  return deUtc(alvo);
}

/** Dias de `de` até `ate` (negativo se `ate` vem antes). Aceita instantes (usa o dia no `FUSO`). */
export function diasEntre(de: Entrada, ate: Entrada): number {
  const a = paraDataISO(de);
  const b = paraDataISO(ate);
  if (!a || !b) return Number.NaN;
  return Math.round((utcDoDia(b).getTime() - utcDoDia(a).getTime()) / MS_DIA);
}

/** -1, 0 ou 1 — serve direto em `.sort()`. */
export function compararDatas(a: DataISO, b: DataISO): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** `iso` dentro de [inicio, fim], inclusive. Limite ausente = aberto. */
export function estaNoPeriodo(iso: DataISO, inicio?: DataISO | null, fim?: DataISO | null): boolean {
  return (!inicio || iso >= inicio) && (!fim || iso <= fim);
}

export function inicioDoMes(iso: DataISO): DataISO {
  return `${iso.slice(0, 7)}-01`;
}

export function fimDoMes(iso: DataISO): DataISO {
  return somarDias(somarMeses(inicioDoMes(iso), 1), -1);
}

/** Segunda-feira da semana de `iso` (semana começa na segunda, como no Brasil). */
export function inicioDaSemana(iso: DataISO): DataISO {
  return somarDias(iso, -((utcDoDia(iso).getUTCDay() + 6) % 7));
}

// ---------------------------------------------------------------------------
// Horas e durações

/** "09:30" → 570. Inválida → `NaN`. */
export function horaParaMinutos(hora: Hora): number {
  if (!ehHora(hora)) return Number.NaN;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** 570 → "09:30". Passa de 24 h dando a volta (1500 → "01:00"). */
export function minutosParaHora(minutos: number): Hora {
  const m = ((Math.round(minutos) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

/** Minutos entre dois instantes (ou duas `Hora`s do mesmo dia; fim antes do início = virou a noite). */
export function duracaoEmMinutos(inicio: DataHoraISO | Date | Hora, fim: DataHoraISO | Date | Hora): number {
  if (typeof inicio === "string" && typeof fim === "string" && ehHora(inicio) && ehHora(fim)) {
    const d = horaParaMinutos(fim) - horaParaMinutos(inicio);
    return d < 0 ? d + 1440 : d;
  }
  const a = paraInstante(inicio as DataHoraISO | Date);
  const b = paraInstante(fim as DataHoraISO | Date);
  return a && b ? Math.round((b.getTime() - a.getTime()) / 60_000) : Number.NaN;
}

/** 45 → "45 min" · 120 → "2 h" · 90 → "1 h 30 min" · 1500 → "1 d 1 h". */
export function formatarDuracao(minutos: number, vazio = "—"): string {
  if (!Number.isFinite(minutos)) return vazio;
  const total = Math.round(Math.abs(minutos));
  const sinal = minutos < 0 ? "-" : "";
  const d = Math.floor(total / 1440);
  const h = Math.floor((total % 1440) / 60);
  const m = total % 60;
  if (total === 0) return "0 min";
  const partes = d > 0 ? [d && `${d} d`, h && `${h} h`] : [h && `${h} h`, m && `${m} min`];
  return sinal + partes.filter(Boolean).join(" ");
}
