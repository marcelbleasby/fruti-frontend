import { Badge, type BadgeProps, Icon } from "@chakra-ui/react";
import {
  Calendar,
  CircleCheck,
  CircleDashed,
  History,
  type LucideIcon,
  Sprout,
  Wheat,
  TriangleAlert,
  X,
} from "lucide-react";
import { forwardRef } from "react";
import { TONES, type Tone } from "./tones";

/**
 * Situação de um plantio, como no glossário (fluxo: planejado → implantado → em desenvolvimento →
 * colhido → encerrado; cancelado fora do fluxo). Implantado, em desenvolvimento e colhido = "em campo".
 */
export type PlantingStatus = "planejado" | "implantado" | "em_desenvolvimento" | "colhido" | "encerrado" | "cancelado";
/** Status de um lote de mudas (estoque baixo: abaixo de 10% do recebido). */
export type BatchStatus = "disponivel" | "estoque_baixo" | "esgotado";
/** Situação de uma área agrícola (com ou sem plantio em campo). */
export type AreaStatus = "com_plantio" | "sem_plantio";
/** Registro cancelável (processamento, destinação, colheita): vale até ser cancelado. */
export type RecordStatus = "registrado" | "cancelado";

export type DomainStatus = PlantingStatus | BatchStatus | AreaStatus | RecordStatus;

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
  implantado: { label: "Implantado", tone: "harvest", icon: Sprout },
  em_desenvolvimento: { label: "Em desenvolvimento", tone: "green", icon: CircleCheck },
  colhido: { label: "Colhido", tone: "green", icon: Wheat },
  encerrado: { label: "Encerrado", tone: "gray", icon: History },
  cancelado: { label: "Cancelado", tone: "red", icon: X },
  // Lote de mudas
  disponivel: { label: "Disponível", tone: "green", icon: CircleCheck },
  estoque_baixo: { label: "Estoque baixo", tone: "harvest", icon: TriangleAlert },
  esgotado: { label: "Esgotado", tone: "gray", icon: X },
  // Área (não desenhado como badge no board; textos do AreaSelector)
  com_plantio: { label: "Com plantio em campo", tone: "green", icon: Sprout },
  sem_plantio: { label: "Sem plantio em campo", tone: "gray", icon: CircleDashed },
  // Registro cancelável ("cancelado" é compartilhado com o plantio)
  registrado: { label: "Registrado", tone: "green", icon: CircleCheck },
};

export const PLANTING_STATUSES: readonly PlantingStatus[] = [
  "planejado",
  "implantado",
  "em_desenvolvimento",
  "colhido",
  "encerrado",
  "cancelado",
];
export const BATCH_STATUSES: readonly BatchStatus[] = ["disponivel", "estoque_baixo", "esgotado"];
export const AREA_STATUSES: readonly AreaStatus[] = ["com_plantio", "sem_plantio"];
export const RECORD_STATUSES: readonly RecordStatus[] = ["registrado", "cancelado"];

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
