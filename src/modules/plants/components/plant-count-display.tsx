import { Box, Flex, chakra, type FlexProps } from "@chakra-ui/react";
import { formatNumber } from "../../format";

export interface PlantCountDisplayProps extends Omit<FlexProps, "children"> {
  /** Total de plantas do plantio. */
  total: number;
  /** Plantas registradas em grupos. */
  grouped: number;
  /** Plantas registradas individualmente. */
  individual: number;
  /** Quantidade de grupos. */
  groups: number;
  /** card (padrão) · none: sem moldura (dentro de outra seção). */
  surface?: "card" | "none";
}

interface Segment {
  key: string;
  value: number;
  color: string;
  label: string;
}

/**
 * PlantCountDisplay — total de plantas e divisão agrupado × individual (× sem registro).
 * Legenda com números escritos: a divisão não depende só das cores verde e ouro.
 * Chakra v3: Stat · Progress (segmentado) · Legend.
 */
export function PlantCountDisplay({ total, grouped, individual, groups, surface = "card", ...rest }: PlantCountDisplayProps) {
  const unregistered = Math.max(0, total - grouped - individual);
  const segments: Segment[] = [
    {
      key: "grouped",
      value: grouped,
      color: "primary",
      label: `em ${formatNumber(groups)} ${groups === 1 ? "grupo" : "grupos"}`,
    },
    { key: "individual", value: individual, color: "accent", label: individual === 1 ? "individual" : "individuais" },
    { key: "unregistered", value: unregistered, color: "border.control", label: "sem registro" },
  ].filter((s) => s.value > 0);

  const description = segments.map((s) => `${formatNumber(s.value)} ${s.label}`).join(", ");

  const frame: FlexProps =
    surface === "card"
      ? { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", boxShadow: "xs", p: "5" }
      : {};

  return (
    <Flex direction="column" gap="3" {...frame} {...rest}>
      <chakra.p
        m="0"
        textStyle="display"
        color="fg.heading"
        css={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatNumber(total)}{" "}
        <chakra.span textStyle="body" fontWeight="500" color="fg.muted">
          {total === 1 ? "planta" : "plantas"}
        </chakra.span>
      </chakra.p>
      {segments.length > 0 ? (
        <>
          <Flex role="img" aria-label={description} gap="1" h="3" borderRadius="full" overflow="hidden">
            {segments.map((s) => (
              <Box key={s.key} flex={`${s.value} 1 0`} bg={s.color} />
            ))}
          </Flex>
          <chakra.ul m="0" p="0" listStyleType="none" display="flex" flexWrap="wrap" rowGap="2" columnGap="4" textStyle="body.sm" color="fg">
            {segments.map((s) => (
              <chakra.li key={s.key} display="flex" alignItems="center" gap="2">
                <Box boxSize="3" borderRadius="xs" bg={s.color} flex="none" aria-hidden="true" />
                <strong>{formatNumber(s.value)}</strong> {s.label}
              </chakra.li>
            ))}
          </chakra.ul>
        </>
      ) : (
        <chakra.p m="0" textStyle="body.sm" color="fg.muted">
          Nenhuma planta registrada ainda.
        </chakra.p>
      )}
    </Flex>
  );
}
