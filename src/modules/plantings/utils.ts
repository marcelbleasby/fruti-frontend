import type { ActivityItem } from "@/components/data-display/activity-timeline";
import type { HistoryEvent, PlantControlMode, PlantingStatus } from "../types";

/** Fluxo do plantio (cancelado fica fora do fluxo e aparece só como badge). */
export const PLANTING_FLOW: readonly Exclude<PlantingStatus, "cancelado">[] = [
  "planejado",
  "implantado",
  "em_desenvolvimento",
  "colhido",
  "encerrado",
];

/** Situações em que o plantio ocupa a unidade de cultivo ("em campo", no glossário). */
export const EM_CAMPO: readonly PlantingStatus[] = ["implantado", "em_desenvolvimento", "colhido"];

export const PLANT_CONTROL_LABEL: Record<PlantControlMode, string> = {
  individual: "Individual",
  agrupado: "Agrupado",
  misto: "Misto",
};

export const PLANT_CONTROL_DESCRIPTION: Record<PlantControlMode, string> = {
  individual: "Cada planta tem identificação própria",
  agrupado: "Plantas registradas em grupos (ex.: por linha)",
  misto: "Grupos e plantas individuais no mesmo plantio",
};

/** "Manga · Tommy Atkins" (ou só a espécie). */
export function plantingTitle(p: { species: { name: string }; cultivar?: { name: string } | null }): string {
  return p.cultivar ? `${p.species.name} · ${p.cultivar.name}` : p.species.name;
}

function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text;
}

/**
 * Converte eventos do histórico em itens do ActivityTimeline:
 * título = ação, descrição = mudanças ("Status: Em preparo → Ativo"), autor separado.
 */
export function historyToActivity(events: HistoryEvent[]): ActivityItem[] {
  return events.map((event) => ({
    id: event.id,
    at: new Date(event.at),
    title: capitalize(event.action),
    description: event.changes?.length
      ? event.changes.map((c) => `${c.field}: ${c.before} → ${c.after}`).join(" · ")
      : undefined,
    actor: event.actor.name,
  }));
}

/** Chave de idempotência (crypto.randomUUID com alternativa para ambientes antigos). */
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
