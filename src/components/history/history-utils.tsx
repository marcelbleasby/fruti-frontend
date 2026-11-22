import { chakra } from "@chakra-ui/react";
import { FilePlus2, ImagePlus, type LucideIcon, Pencil, RefreshCw, Sprout } from "lucide-react";
import type { ReactNode } from "react";
import { formatarData, formatarDataHora, paraDataISO, somarDias } from "@/lib/datas";
import type { HistoryEventType } from "@/modules/types";

/** Ícone e rótulo de cada tipo de evento do histórico. */
export const HISTORY_EVENT_TYPES: Record<HistoryEventType, { label: string; icon: LucideIcon }> = {
  status: { label: "Status", icon: RefreshCw },
  plantas: { label: "Plantas", icon: Sprout },
  arquivos: { label: "Arquivos", icon: ImagePlus },
  cadastro: { label: "Cadastro", icon: FilePlus2 },
  edicao: { label: "Edição", icon: Pencil },
};

/** "11/04/2026 às 10:20" (fuso das propriedades). */
export function formatDateTime(iso: string): string {
  return formatarDataHora(iso, "");
}

/** Chave do dia (YYYY-MM-DD, fuso das propriedades) para agrupar eventos. */
export function localDayKey(date: Date): string {
  return paraDataISO(date) ?? "";
}

/** "21/11/2026". */
export function formatDay(date: Date): string {
  return formatarData(date, "");
}

/** "Hoje" · "Ontem" · "11/04/2026". */
export function dayLabel(date: Date, now: Date): string {
  const key = localDayKey(date);
  const today = localDayKey(now);
  if (key === today) return "Hoje";
  if (today && key === somarDias(today, -1)) return "Ontem";
  return formatDay(date);
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
