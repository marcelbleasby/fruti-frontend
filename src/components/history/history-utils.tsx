import { chakra } from "@chakra-ui/react";
import { FilePlus2, ImagePlus, type LucideIcon, Pencil, RefreshCw, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import type { HistoryEventType } from "@/modules/types";

/** Ícone e rótulo de cada tipo de evento do histórico. */
export const HISTORY_EVENT_TYPES: Record<HistoryEventType, { label: string; icon: LucideIcon }> = {
  status: { label: "Status", icon: RefreshCw },
  plantas: { label: "Plantas", icon: Sprout },
  arquivos: { label: "Arquivos", icon: ImagePlus },
  cadastro: { label: "Cadastro", icon: FilePlus2 },
  edicao: { label: "Edição", icon: Pencil },
};

const localDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const localTime = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

/** "11/04/2026 às 10:20" (horário local). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${localDate.format(d)} às ${localTime.format(d)}`;
}

/** Chave do dia local (YYYY-MM-DD) para agrupar eventos. */
export function localDayKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

/** "Hoje" · "Ontem" · "11/04/2026". */
/** "21/11/2026" (data local). */
export function formatDay(date: Date): string {
  return localDate.format(date);
}

export function dayLabel(date: Date, now: Date): string {
  const key = localDayKey(date);
  if (key === localDayKey(now)) return "Hoje";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (key === localDayKey(yesterday)) return "Ontem";
  return localDate.format(date);
}

const CODE = /([A-Z]{1,3}-\d{2,4}(?:-\d{2,4})?)/g;

/** Destaca códigos de registro (PL-0042, LM-2026-014, A-03) em fonte mono. */
export function highlightCodes(text: string): ReactNode {
  const parts = text.split(CODE);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <chakra.span
        key={i}
        textStyle="code"
        color="primary"
      >
        {part}
      </chakra.span>
    ) : (
      part
    ),
  );
}
