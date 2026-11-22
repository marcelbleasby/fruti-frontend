import { Box, type BoxProps, Flex, Text, chakra } from "@chakra-ui/react";
import { CircleAlert } from "lucide-react";
import { formatNumber } from "@/modules/format";
import type { CultivationUnit, CultivationUnitType } from "@/modules/types";

export const CULTIVATION_UNIT_TYPE_LABEL: Record<CultivationUnitType, string> = {
  canteiro: "Canteiro",
  talhao: "Talhão",
  outro: "Outro",
};

/** Unidade em edição, desenhada por cima (tracejada). `problem` descreve por que não cabe. */
export interface AreaUnitMapDraft {
  length: number;
  width: number;
  x: number;
  y: number;
  label?: string;
  problem?: string | null;
}

export interface AreaUnitMapProps extends Omit<BoxProps, "children"> {
  /** Medidas da área de cultivo, em metros. */
  length: number;
  width: number;
  units: CultivationUnit[];
  /** Unidade realçada (ex.: a que está sendo editada, que some do desenho e vira o rascunho). */
  hiddenUnitId?: string | null;
  draft?: AreaUnitMapDraft | null;
  /** Largura máxima do desenho em px (a altura sai da proporção). */
  maxWidth?: number;
}

const pct = (v: number, total: number) => `${Math.max(0, Math.min(100, (v / total) * 100))}%`;
const m = (v: number) => `${formatNumber(v)} m`;

/**
 * AreaUnitMap — a área de cultivo em escala, com as unidades posicionadas e
 * rotuladas no próprio desenho (borda + texto, nunca só cor). Unidades sem
 * posição não entram no desenho e são contadas abaixo. O desenho é `role="img"`;
 * a lista de unidades ao lado é a alternativa navegável.
 */
export function AreaUnitMap({ length, width, units, hiddenUnitId, draft, maxWidth = 640, ...rest }: AreaUnitMapProps) {
  const valid = length > 0 && width > 0;
  const visible = units.filter((u) => u.id !== hiddenUnitId);
  const placed = visible.filter((u) => u.x != null && u.y != null);
  const unplaced = visible.length - placed.length;

  const description = valid
    ? `Área de ${m(length)} por ${m(width)}. ${
        placed.length
          ? placed
              .map(
                (u) =>
                  `${u.code || u.name}: ${m(u.length)} por ${m(u.width)}, a ${m(u.x ?? 0)} e ${m(u.y ?? 0)} do canto`,
              )
              .join("; ")
          : "Nenhuma unidade posicionada"
      }.`
    : "Informe as medidas da área.";

  return (
    <Box display="flex" flexDirection="column" gap="2" minW="0" {...rest}>
      <Box
        role="img"
        aria-label={description}
        position="relative"
        w="full"
        maxW={`${maxWidth}px`}
        aspectRatio={valid ? `${length} / ${width}` : "2 / 1"}
        minH="72px"
        boxSizing="border-box"
        borderWidth="2px"
        borderStyle={valid ? "solid" : "dashed"}
        borderColor={valid ? "primary" : "border.control"}
        borderRadius="sm"
        bg="bg.subtle"
        overflow="hidden"
        // Grade de 1/4 para dar escala sem poluir.
        backgroundImage="linear-gradient(to right, {colors.border} 1px, transparent 1px), linear-gradient(to bottom, {colors.border} 1px, transparent 1px)"
        backgroundSize="25% 25%"
      >
        {valid
          ? placed.map((u) => (
              <Flex
                key={u.id}
                aria-hidden="true"
                position="absolute"
                left={pct(u.x ?? 0, length)}
                top={pct(u.y ?? 0, width)}
                w={pct(u.length, length)}
                h={pct(u.width, width)}
                boxSizing="border-box"
                borderWidth="1.5px"
                borderColor="primary"
                bg="primary.subtle"
                borderRadius="xs"
                align="center"
                justify="center"
                overflow="hidden"
                title={`${u.code ? `${u.code} · ` : ""}${u.name} (${CULTIVATION_UNIT_TYPE_LABEL[u.type]})`}
              >
                <Text as="span" textStyle="caption" fontWeight="600" color="fg.heading" truncate px="1">
                  {u.code || u.name}
                </Text>
              </Flex>
            ))
          : null}
        {valid && draft && draft.length > 0 && draft.width > 0 ? (
          <Flex
            aria-hidden="true"
            position="absolute"
            left={pct(draft.x, length)}
            top={pct(draft.y, width)}
            w={pct(draft.length, length)}
            h={pct(draft.width, width)}
            boxSizing="border-box"
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={draft.problem ? "border.error" : "primary"}
            bg={draft.problem ? "bg.error" : "bg.panel"}
            borderRadius="xs"
            align="center"
            justify="center"
            gap="1"
            overflow="hidden"
          >
            {draft.problem ? (
              <chakra.span color="fg.error" display="flex" flexShrink={0}>
                <CircleAlert size={14} strokeWidth={2} />
              </chakra.span>
            ) : null}
            <Text
              as="span"
              textStyle="caption"
              fontWeight="600"
              color={draft.problem ? "fg.error" : "fg.heading"}
              truncate
              px="1"
            >
              {draft.label || "Nova unidade"}
            </Text>
          </Flex>
        ) : null}
      </Box>
      <Flex justify="space-between" gap="3" wrap="wrap" textStyle="caption" color="fg.muted" maxW={`${maxWidth}px`}>
        <span>{valid ? `${m(length)} × ${m(width)}` : "— m × — m"} · canto de referência no alto, à esquerda</span>
        {unplaced > 0 ? (
          <span>{unplaced === 1 ? "1 unidade sem posição" : `${unplaced} unidades sem posição`}</span>
        ) : null}
      </Flex>
      {draft?.problem ? (
        <Text role="status" display="flex" alignItems="center" gap="1.5" fontSize="sm" color="fg.error">
          <CircleAlert size={14} strokeWidth={2} aria-hidden="true" />
          {draft.problem}
        </Text>
      ) : null}
    </Box>
  );
}

export interface UnitPlacementInput {
  length: number;
  width: number;
  x: number | null;
  y: number | null;
}

export interface UnitPlacementCheck {
  /** Erros por campo (length, width, x, y), no mesmo texto curto da API. */
  fields: Partial<Record<"length" | "width" | "x" | "y", string>>;
  /** Motivo geral para mostrar no desenho (primeiro problema encontrado). */
  problem: string | null;
}

const fmt = (v: number) => formatNumber(v);

/**
 * Mesmas regras da API para uma unidade dentro da área: cabe nas medidas (com ou
 * sem posição), não sobrepõe outra unidade posicionada (bordas encostadas podem)
 * e a soma das unidades não passa da área. Serve para avisar antes de enviar; a
 * API continua sendo quem decide.
 */
export function checkUnitPlacement(
  area: { length: number; width: number },
  units: CultivationUnit[],
  unit: UnitPlacementInput,
  exceptId?: string | null,
): UnitPlacementCheck {
  const fields: UnitPlacementCheck["fields"] = {};
  const { length, width, x, y } = unit;
  if (!(length > 0) || !(width > 0) || !(area.length > 0) || !(area.width > 0)) return { fields, problem: null };

  if (x === null || y === null) {
    if (length > area.length) fields.length = `Maior que o comprimento da área (${fmt(area.length)} m).`;
    if (width > area.width) fields.width = `Maior que a largura da área (${fmt(area.width)} m).`;
  } else {
    if (x + length > area.length)
      fields.x = `Posição X + comprimento (${fmt(x + length)} m) passa do comprimento da área (${fmt(area.length)} m).`;
    if (y + width > area.width)
      fields.y = `Posição Y + largura (${fmt(y + width)} m) passa da largura da área (${fmt(area.width)} m).`;
  }
  if (Object.keys(fields).length) return { fields, problem: "A unidade não cabe na área de cultivo." };

  const others = units.filter((u) => u.id !== exceptId);
  if (x !== null && y !== null) {
    const hit = others.find(
      (o) =>
        o.x != null &&
        o.y != null &&
        o.x < x + length &&
        x < o.x + o.length &&
        o.y < y + width &&
        y < o.y + o.width,
    );
    if (hit) {
      const msg = `Sobrepõe '${hit.name}'.`;
      return { fields: { x: msg, y: msg }, problem: `A unidade se sobrepõe a '${hit.name}'.` };
    }
  }

  const total = others.reduce((s, o) => s + o.length * o.width, 0) + length * width;
  if (total > area.length * area.width + 1e-9)
    return {
      fields,
      problem: `A soma das unidades (${fmt(total)} m²) passaria da área de cultivo (${fmt(area.length * area.width)} m²).`,
    };
  return { fields, problem: null };
}
