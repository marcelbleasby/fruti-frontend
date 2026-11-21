import { Badge, type BadgeProps, Icon } from "@chakra-ui/react";
import {
  Calendar,
  CircleCheck,
  CircleDashed,
  History,
  type LucideIcon,
  Sprout,
  TriangleAlert,
  X,
} from "lucide-react";
import { forwardRef } from "react";
import { TONES, type Tone } from "./tones";

/** Status de um plantio (fluxo: planejado → em preparo → ativo → encerrado; cancelado fora do fluxo). */
export type PlantingStatus = "planejado" | "em_preparo" | "ativo" | "encerrado" | "cancelado";
/** Status de um lote de mudas (estoque baixo: abaixo de 10% do recebido). */
export type BatchStatus = "disponivel" | "estoque_baixo" | "esgotado";
/** Situação de uma área agrícola (com ou sem plantio ativo). */
export type AreaStatus = "com_plantio" | "sem_plantio";

export type DomainStatus = PlantingStatus | BatchStatus | AreaStatus;

export interface StatusDefinition {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}

/**
 * Mapa central status → visual. Ícone + texto + cor: o estado nunca depende só da cor.
 * Fonte: board "Componentes compartilhados › StatusBadge".
 */
export const STATUS_DEFINITIONS: Record<DomainStatus, StatusDefinition> = {
  // Plantio
  planejado: { label: "Planejado", tone: "sky", icon: Calendar },
  em_preparo: { label: "Em preparo", tone: "harvest", icon: Sprout },
  ativo: { label: "Ativo", tone: "green", icon: CircleCheck },
  encerrado: { label: "Encerrado", tone: "gray", icon: History },
  cancelado: { label: "Cancelado", tone: "red", icon: X },
  // Lote de mudas
  disponivel: { label: "Disponível", tone: "green", icon: CircleCheck },
  estoque_baixo: { label: "Estoque baixo", tone: "harvest", icon: TriangleAlert },
  esgotado: { label: "Esgotado", tone: "gray", icon: X },
  // Área (não desenhado como badge no board; textos do AreaSelector)
  com_plantio: { label: "Com plantio ativo", tone: "green", icon: Sprout },
  sem_plantio: { label: "Sem plantio ativo", tone: "gray", icon: CircleDashed },
};

export const PLANTING_STATUSES: readonly PlantingStatus[] = [
  "planejado",
  "em_preparo",
  "ativo",
  "encerrado",
  "cancelado",
];
export const BATCH_STATUSES: readonly BatchStatus[] = ["disponivel", "estoque_baixo", "esgotado"];
export const AREA_STATUSES: readonly AreaStatus[] = ["com_plantio", "sem_plantio"];

export function getStatusDefinition(status: DomainStatus): StatusDefinition {
  return STATUS_DEFINITIONS[status];
}

export interface StatusBadgeProps extends Omit<BadgeProps, "size" | "variant" | "colorPalette" | "children"> {
  status: DomainStatus;
  /** sm: 22px (tabelas) · md: 26px (padrão) */
  size?: "sm" | "md";
  /** Sobrescreve o texto do mapa (ex.: contexto específico). */
  label?: string;
}

/** StatusBadge — Badge subtle em pílula com ícone. Chakra v3: Badge · Icon. */
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(function StatusBadge(
  { status, size = "md", label, ...rest },
  ref,
) {
  const def = STATUS_DEFINITIONS[status];
  const t = TONES[def.tone];
  const StatusIcon = def.icon;
  return (
    <Badge
      ref={ref}
      data-status={status}
      h={size === "sm" ? "24px" : "28px"}
      ps="2"
      pe="2.5"
      gap="1"
      borderRadius="full"
      bg={t.subtle}
      color={t.fg}
      fontSize={size === "sm" ? "xs" : "md"}
      lineHeight="1"
      fontWeight="600"
      whiteSpace="nowrap"
      {...rest}
    >
      <Icon boxSize={size === "sm" ? "12px" : "16px"} flexShrink={0}>
        <StatusIcon strokeWidth={2.25} />
      </Icon>
      {label ?? def.label}
    </Badge>
  );
});
