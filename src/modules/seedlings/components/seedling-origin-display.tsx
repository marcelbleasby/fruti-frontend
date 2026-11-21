import { Box, HStack, type StackProps } from "@chakra-ui/react";
import { Bean, CircleHelp, Sprout } from "lucide-react";
import { TextLink } from "@/components/navigation/text-link";
import type { BatchId, SeedlingOrigin } from "@/modules/types";
import { ORIGIN_LABEL } from "../utils";

export interface SeedlingOriginDisplayProps extends Omit<StackProps, "children"> {
  origin: SeedlingOrigin | null | undefined;
  /** Liga o código do lote à página do lote (requer `batchHref`). Padrão true. */
  linkToBatch?: boolean;
  /** Monta o link do lote (ex.: (id) => `/mudas/${id}`). */
  batchHref?: (batchId: BatchId) => string;
}

const ICONS = { mudas: Sprout, sementes: Bean } as const;

const codeStyles = {
  fontFamily: "mono",
  fontSize: "sm",
  fontWeight: "500",
  color: "fg.heading",
  fontVariantLigatures: "none",
} as const;

/**
 * SeedlingOriginDisplay — origem do material: "Mudas · LM-2026-014" ou "Origem não informada".
 * Chakra v3: HStack · Icon · Link.
 */
export function SeedlingOriginDisplay({ origin, linkToBatch = true, batchHref, ...rest }: SeedlingOriginDisplayProps) {
  if (!origin) {
    return (
      <HStack as="span" display="inline-flex" gap="1" textStyle="body.sm" color="fg.muted" {...rest}>
        <CircleHelp size={16} strokeWidth={1.75} aria-hidden="true" />
        Origem não informada
      </HStack>
    );
  }

  const OriginIcon = ICONS[origin.type];
  const code = origin.batchCode;
  const href = linkToBatch && batchHref && origin.batchId ? batchHref(origin.batchId) : undefined;

  return (
    <HStack as="span" display="inline-flex" gap="1" textStyle="body.sm" color="fg" {...rest}>
      <Box as="span" color="primary" display="flex" aria-hidden="true">
        <OriginIcon size={16} strokeWidth={1.75} />
      </Box>
      <span>
        {ORIGIN_LABEL[origin.type]}
        {code && " · "}
        {code &&
          (href ? (
            <TextLink href={href} css={codeStyles} aria-label={`Lote ${code}`}>
              {code}
            </TextLink>
          ) : (
            <Box as="span" css={codeStyles}>
              {code}
            </Box>
          ))}
      </span>
    </HStack>
  );
}
