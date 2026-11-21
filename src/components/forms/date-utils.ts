import { parseDate, type DatePickerRootProps, type DateValue } from "@chakra-ui/react";

/** Datas trafegam como ISO `YYYY-MM-DD` na API dos componentes. */
export type ISODate = string;

/** ISO → DateValue (undefined se vazio ou inválido). */
export function toDateValue(iso?: ISODate | null): DateValue | undefined {
  if (!iso) return undefined;
  try {
    return parseDate(iso);
  } catch {
    return undefined;
  }
}

/** DateValue → ISO `YYYY-MM-DD`. */
export function toISODate(value?: DateValue | null): ISODate | null {
  return value ? value.toString().slice(0, 10) : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Hoje (fuso local) em ISO. */
export function todayISO(): ISODate {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO → `dd/mm/aaaa`. */
export function formatISODate(iso?: ISODate | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Rótulos acessíveis do calendário em pt-BR. */
export const datePickerTranslations: NonNullable<DatePickerRootProps["translations"]> = {
  trigger: (open) => (open ? "Fechar calendário" : "Abrir calendário"),
  prevTrigger: (view) => (view === "year" ? "Década anterior" : view === "month" ? "Ano anterior" : "Mês anterior"),
  nextTrigger: (view) => (view === "year" ? "Próxima década" : view === "month" ? "Próximo ano" : "Próximo mês"),
  viewTrigger: (view) => (view === "day" ? "Escolher mês" : view === "month" ? "Escolher ano" : "Escolher década"),
  clearTrigger: "Limpar data",
  content: "Calendário",
  monthSelect: "Mês",
  yearSelect: "Ano",
  placeholder: () => ({ day: "dd", month: "mm", year: "aaaa" }),
};
