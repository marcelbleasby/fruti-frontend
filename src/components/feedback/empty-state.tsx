import {
  Box,
  Flex,
  EmptyState as ChakraEmptyState,
  Icon,
  Stack,
  Text,
  type EmptyStateRootProps,
} from "@chakra-ui/react";
import { Check, CircleCheck, Inbox, SearchX, Sprout } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { ConcentricIndicator, type IndicatorTone } from "./concentric-indicator";

export type EmptyStateVariant = "first-use" | "no-results" | "in-card" | "all-done";
export type EmptyStateSize = "sm" | "md" | "lg" | "inline";

export interface EmptyStateChecklistItem {
  title: string;
  description?: string;
  done?: boolean;
}

export interface EmptyStateProps extends Omit<EmptyStateRootProps, "title" | "size" | "variant"> {
  variant?: EmptyStateVariant;
  size?: EmptyStateSize;
  title: ReactNode;
  description?: ReactNode;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4";
  /** No máximo uma ação primária e uma secundária. */
  actions?: ReactNode;
  icon?: ElementType;
  /** Tom do indicador; por padrão deriva da variante. */
  tone?: IndicatorTone;
  /** Passos de "Para começar" (variante first-use, tamanho lg). */
  checklist?: EmptyStateChecklistItem[];
  checklistTitle?: string;
  /** Moldura tracejada (padrão em no-results). */
  bordered?: boolean;
}

const variantDefaults: Record<EmptyStateVariant, { icon: ElementType; tone: IndicatorTone; size: EmptyStateSize }> = {
  "first-use": { icon: Sprout, tone: "primary", size: "lg" },
  "no-results": { icon: SearchX, tone: "neutral", size: "md" },
  "in-card": { icon: Inbox, tone: "primary", size: "sm" },
  "all-done": { icon: CircleCheck, tone: "primary", size: "sm" },
};

const indicatorSizes: Record<EmptyStateSize, { diameter: number; icon: number }> = {
  lg: { diameter: 148, icon: 28 },
  md: { diameter: 88, icon: 20 },
  sm: { diameter: 72, icon: 16 },
  inline: { diameter: 52, icon: 12 },
};

function Checklist({ title, items }: { title: string; items: EmptyStateChecklistItem[] }) {
  return (
    <Stack gap="2.5" flex="1 1 0" minW="0" w="full">
      <Text fontSize="sm" fontWeight="600" color="fg.muted">
        {title}
      </Text>
      <Stack as="ol" gap="2" m="0" p="0" listStyleType="none">
        {items.map((item, index) => {
          const isCurrent = !item.done && items.slice(0, index).every((i) => i.done);
          return (
            <Flex
              as="li"
              key={item.title}
              gap="3"
              align="flex-start"
              px="3.5"
              py="3"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="border"
              bg={isCurrent ? "primary.subtle" : "bg.panel"}
              aria-current={isCurrent ? "step" : undefined}
            >
              <Box
                as="span"
                boxSize="7"
                flex="none"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="sm"
                fontWeight="600"
                bg={item.done ? "primary" : "bg.panel"}
                color={item.done ? "fg.inverted" : "fg.heading"}
                borderWidth={item.done ? "0" : "2px"}
                borderColor="primary"
              >
                {item.done ? <Icon as={Check} boxSize="3.5" strokeWidth={1.75} aria-label="Concluído" /> : index + 1}
              </Box>
              <Stack as="span" gap="0.5">
                <Text
                  as="span"
                  fontSize="sm"
                  fontWeight="600"
                  color="fg"
                  textDecoration={item.done ? "line-through" : undefined}
                  textDecorationColor="fg.subtle"
                >
                  {item.title}
                </Text>
                {item.description && (
                  <Text as="span" fontSize="sm" color="fg.muted">
                    {item.description}
                  </Text>
                )}
              </Stack>
            </Flex>
          );
        })}
      </Stack>
    </Stack>
  );
}

/**
 * Estado vazio do DS. Diga o porquê (primeiro uso, filtro, ausência num bloco ou
 * tarefa concluída) e ofereça no máximo uma ação primária e uma secundária.
 * Em tabelas use `size="inline"` dentro da célula para manter o cabeçalho visível.
 */
export function EmptyState({
  variant = "in-card",
  size,
  title,
  description,
  headingAs = "h3",
  actions,
  icon,
  tone,
  checklist,
  checklistTitle = "Para começar",
  bordered,
  ...rest
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];
  const resolvedSize = size ?? defaults.size;
  const resolvedTone = tone ?? defaults.tone;
  const indicator = indicatorSizes[resolvedSize];
  const isBordered = bordered ?? variant === "no-results";
  const hasChecklist = Boolean(checklist?.length) && resolvedSize === "lg";

  const indicatorNode = (
    <ChakraEmptyState.Indicator>
      <ConcentricIndicator icon={icon ?? defaults.icon} tone={resolvedTone} diameter={indicator.diameter} iconSize={indicator.icon} />
    </ChakraEmptyState.Indicator>
  );

  if (resolvedSize === "inline") {
    return (
      <ChakraEmptyState.Root px="3.5" py="5" {...rest}>
        {/* Linha alinhada à esquerda; em largura estreita as ações descem para a linha de baixo. */}
        <ChakraEmptyState.Content flexDirection="row" flexWrap="wrap" gap="3.5" justifyContent="flex-start" alignItems="center">
          {indicatorNode}
          <Stack gap="0.5" textAlign="start" flex="1 1 200px" minW="0">
            <ChakraEmptyState.Title as="p" m="0" fontSize="md" fontWeight="600" color="fg">
              {title}
            </ChakraEmptyState.Title>
            {description && (
              <ChakraEmptyState.Description textStyle="body.sm" color="fg.muted">
                {description}
              </ChakraEmptyState.Description>
            )}
          </Stack>
          {actions}
        </ChakraEmptyState.Content>
      </ChakraEmptyState.Root>
    );
  }

  const alignStart = hasChecklist;

  const main = (
    <ChakraEmptyState.Content
      gap="3"
      alignItems={alignStart ? { base: "center", md: "flex-start" } : "center"}
      textAlign={alignStart ? { base: "center", md: "start" } : "center"}
      flex="1 1 0"
    >
      {indicatorNode}
      <ChakraEmptyState.Title as={headingAs} m="0" textStyle="heading.md" color="fg.heading">
        {title}
      </ChakraEmptyState.Title>
      {description && (
        <ChakraEmptyState.Description textStyle="body.sm" color="fg.muted" maxW="sm">
          {description}
        </ChakraEmptyState.Description>
      )}
      {actions && (
        <Flex
          wrap="wrap"
          gap="2"
          justify={alignStart ? { base: "center", md: "flex-start" } : "center"}
          w={{ base: "full", md: "auto" }}
          css={{ "& > *": { width: { base: "full", md: "auto" }, minHeight: { base: "44px", md: "unset" } } }}
        >
          {actions}
        </Flex>
      )}
    </ChakraEmptyState.Content>
  );

  return (
    <ChakraEmptyState.Root
      px={resolvedSize === "lg" ? { base: "4", md: "5" } : "6"}
      py={resolvedSize === "lg" ? "3" : "6"}
      {...(isBordered ? { borderWidth: "1px", borderStyle: "dashed", borderColor: "border.control", borderRadius: "2xl" } : {})}
      {...rest}
    >
      {hasChecklist ? (
        <Flex direction={{ base: "column", md: "row" }} gap={{ base: "6", md: "10" }} align="center">
          {main}
          <Checklist title={checklistTitle} items={checklist!} />
        </Flex>
      ) : (
        main
      )}
    </ChakraEmptyState.Root>
  );
}
