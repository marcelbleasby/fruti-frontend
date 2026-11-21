import { formatNumber } from "@/modules/format";
import type { BatchStatus, SeedlingBatch, SeedlingOriginType } from "@/modules/types";

/** Limite padrão de estoque baixo: abaixo de 10% do recebido. */
export const DEFAULT_LOW_THRESHOLD = 0.1;

export const ORIGIN_LABEL: Record<SeedlingOriginType, string> = {
  mudas: "Mudas",
  sementes: "Sementes",
};

/** Quantidade ainda livre para novos plantios. */
export function batchAvailable(batch: Pick<SeedlingBatch, "total" | "used">): number {
  return Math.max(0, batch.total - batch.used);
}

/** Unidade da quantidade do lote ("mudas" / "sementes" ou a unidade informada). */
export function batchUnit(batch: Pick<SeedlingBatch, "type" | "unit">): string {
  return batch.unit ?? (batch.type === "mudas" ? "mudas" : "sementes");
}

/** Status derivado: esgotado (0 livre) · estoque baixo (< limite do recebido) · disponível. */
export function availabilityStatus(total: number, used: number, lowThreshold = DEFAULT_LOW_THRESHOLD): BatchStatus {
  const available = Math.max(0, total - used);
  if (available <= 0) return "esgotado";
  if (total > 0 && available < total * lowThreshold) return "estoque_baixo";
  return "disponivel";
}

export function getBatchStatus(
  batch: Pick<SeedlingBatch, "total" | "used">,
  lowThreshold = DEFAULT_LOW_THRESHOLD,
): BatchStatus {
  return availabilityStatus(batch.total, batch.used, lowThreshold);
}

/** "Mudas enxertadas · Manga Tommy Atkins" */
export function batchMaterialLabel(batch: SeedlingBatch, withCultivar = true): string {
  const material = batch.description ?? ORIGIN_LABEL[batch.type];
  const species = withCultivar && batch.cultivar ? `${batch.species.name} ${batch.cultivar.name}` : batch.species.name;
  return `${material} · ${species}`;
}

/** Unidades de massa: entram como sufixo ("900 g") e são masculinas ("utilizados"). */
const MASS_UNITS = new Set(["g", "kg"]);

export function isMassUnit(unit: string): boolean {
  return MASS_UNITS.has(unit);
}

/**
 * Concordância dos textos de quantidade conforme a unidade e o número.
 * Unidades contáveis (mudas, sementes) são femininas e vão no plural/singular;
 * massa (g, kg) é masculina e fica como sufixo.
 */
export function quantityWords(n: number, unit: string) {
  const mass = isMassUnit(unit);
  const one = n === 1;
  const noun = mass ? unit : one ? unit.replace(/s$/, "") : unit;
  return {
    /** "20 mudas" · "1 muda" · "900 g" */
    amount: `${formatNumber(n)} ${noun}`,
    /** Número com unidade só quando ela é de massa ("900 g"); contáveis ficam só no número. */
    value: mass ? `${formatNumber(n)} ${unit}` : formatNumber(n),
    available: one ? "disponível" : "disponíveis",
    free: one ? "livre" : "livres",
    used: mass ? (one ? "utilizado" : "utilizados") : one ? "utilizada" : "utilizadas",
  };
}
