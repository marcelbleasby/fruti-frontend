import { parseDate, type DatePickerRootProps, type DateValue } from "@chakra-ui/react";
import { formatarData, hojeISO, type DataISO } from "@/lib/datas";

/** Datas trafegam como ISO `YYYY-MM-DD` na API dos componentes. Mesmo tipo de `lib/datas`. */
export type ISODate = DataISO;

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

/** Hoje em ISO, no fuso das propriedades (`hojeISO` de `lib/datas`). */
export const todayISO = (): ISODate => hojeISO();

/** ISO → `dd/mm/aaaa` (vazio quando ausente/inválida). */
export const formatISODate = (iso?: ISODate | null): string => formatarData(iso, "");

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
