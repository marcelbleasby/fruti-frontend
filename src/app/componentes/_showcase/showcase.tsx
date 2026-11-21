"use client";

import { Box, type BoxProps, Code, Flex, type FlexProps, Heading, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * Blocos de layout da vitrine de componentes (/componentes).
 * Section = um grupo do inventário · Demo = um componente · Variant = um estado/variante.
 */

export interface ShowcaseSectionProps {
  /** Âncora usada no índice (ex.: "formularios"). */
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

export function ShowcaseSection({ id, title, description, children }: ShowcaseSectionProps) {
  return (
    <Box as="section" id={id} aria-labelledby={`${id}-title`} scrollMarginTop="6">
      <Stack gap="1" mb="6" pb="4" borderBottomWidth="1px" borderColor="border">
        <Heading as="h2" id={`${id}-title`} textStyle="heading.xl" color="fg.heading">
          {title}
        </Heading>
        {description && (
          <Text textStyle="body.sm" color="fg.muted" maxW="72ch">
            {description}
          </Text>
        )}
      </Stack>
      <Stack gap="10">{children}</Stack>
    </Box>
  );
}

export interface DemoProps {
  /** Nome do componente (ex.: "SpeciesSelector"). */
  name: string;
  /** Caminho de import (ex.: "@/modules/species"). */
  importPath?: string;
  description?: ReactNode;
  children: ReactNode;
}

/** Um componente: título, import e as variantes logo abaixo. */
export function Demo({ name, importPath, description, children }: DemoProps) {
  return (
    <Stack gap="3">
      <Flex align="baseline" gap="3" wrap="wrap">
        <Heading as="h3" textStyle="heading.md" color="fg.heading">
          {name}
        </Heading>
        {importPath && (
          <Code textStyle="code.sm" bg="bg.muted" color="fg.muted" px="1.5" borderRadius="l1">
            {importPath}
          </Code>
        )}
      </Flex>
      {description && (
        <Text textStyle="body.sm" color="fg.muted" maxW="72ch">
          {description}
        </Text>
      )}
      {children}
    </Stack>
  );
}

export interface VariantProps extends Omit<BoxProps, "title"> {
  /** Rótulo da variante (ex.: "Desabilitado", "size sm"). */
  label: string;
  /** Ocupa a linha inteira da VariantGrid (componentes largos: tabelas, formulários, variantes expandidas). */
  full?: boolean;
  children: ReactNode;
}

/** Moldura de uma variante/estado, com rótulo em legenda. */
export function Variant({ label, full, children, ...rest }: VariantProps) {
  return (
    <Stack gap="2" minW="0" gridColumn={full ? "1 / -1" : undefined}>
      <Text textStyle="overline" color="fg.muted">
        {label}
      </Text>
      <Box p="5" bg="bg.panel" borderWidth="1px" borderColor="border" borderRadius="l3" minW="0" overflowX="auto" {...rest}>
        {children}
      </Box>
    </Stack>
  );
}

/** Grade responsiva de variantes (1 coluna no mobile). */
export function VariantGrid({ children, min = "280px" }: { children: ReactNode; min?: string }) {
  return (
    <Box display="grid" gap="4" gridTemplateColumns={{ base: "1fr", md: `repeat(auto-fill, minmax(${min}, 1fr))` }}>
      {children}
    </Box>
  );
}

/** Linha de controles lado a lado (botões, badges…). */
export function Row({ children, ...rest }: FlexProps) {
  return (
    <Flex wrap="wrap" gap="3" align="center" {...rest}>
      {children}
    </Flex>
  );
}
