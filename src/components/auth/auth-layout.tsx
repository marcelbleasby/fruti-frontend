"use client";

import { Box, Flex, type FlexProps, Icon, Stack, Text, chakra } from "@chakra-ui/react";
import { BookOpen, MapPin, Workflow } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { FrutiMark } from "./fruti-mark";

export interface AuthLayoutFeature {
  icon: ElementType;
  label: string;
}

export interface AuthLayoutProps {
  /** Formulário (LoginForm, ForgotPasswordForm…). */
  children: ReactNode;
  headline?: string;
  features?: AuthLayoutFeature[];
  /** Esconde o painel de marca mesmo no desktop. */
  hideBrandPanel?: boolean;
  /** Altura mínima (padrão: tela inteira). Use `auto` para embutir em outra página. */
  minH?: FlexProps["minH"];
}

const defaultFeatures: AuthLayoutFeature[] = [
  { icon: BookOpen, label: "Catálogo de espécies e cultivares" },
  { icon: MapPin, label: "Áreas, plantios e plantas" },
  { icon: Workflow, label: "Rastreabilidade do lote à planta" },
];

/**
 * Casca visual das telas de acesso: painel de marca (verde) + área do formulário.
 * No mobile vira uma coluna com o símbolo no topo.
 */
export function AuthLayout({
  children,
  headline = "Gestão agrícola do plantio à planta.",
  features = defaultFeatures,
  hideBrandPanel = false,
  minH = "100dvh",
}: AuthLayoutProps) {
  return (
    <Flex minH={minH} bg="bg.panel" direction={{ base: "column", lg: "row" }}>
      {!hideBrandPanel && (
        <Flex
          as="aside"
          display={{ base: "none", lg: "flex" }}
          flex="1 1 0"
          bg="bg.inverted"
          p="10"
          direction="column"
          justify="space-between"
          gap="6"
        >
          <FrutiMark tone="inverted" />
          <Stack gap="4.5">
            <Text textStyle="heading.xl" color="fg.inverted" maxW="420px">
              {headline}
            </Text>
            <chakra.ul m="0" p="0" listStyleType="none" display="flex" flexDirection="column" gap="3">
              {features.map((f) => (
                <Flex as="li" key={f.label} align="center" gap="3" fontSize="md" color="green.100">
                  <Box
                    as="span"
                    boxSize="9"
                    flex="none"
                    borderRadius="xl"
                    bg="whiteAlpha.200"
                    color="green.200"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={f.icon} boxSize="4.5" strokeWidth={1.75} aria-hidden />
                  </Box>
                  {f.label}
                </Flex>
              ))}
            </chakra.ul>
          </Stack>
        </Flex>
      )}

      <Flex
        as="main"
        flex="1 1 0"
        direction="column"
        align={{ base: "stretch", lg: "center" }}
        justify={{ base: "flex-start", lg: "center" }}
        px={{ base: "4", lg: "10" }}
        py={{ base: "6", lg: "10" }}
      >
        <Stack gap="5" w="full" maxW={{ base: "none", sm: "380px" }} mx={{ sm: "auto", lg: "0" }}>
          <Box display={{ base: "block", lg: hideBrandPanel ? "block" : "none" }}>
            <FrutiMark wordmarkSize="xl" />
          </Box>
          {children}
        </Stack>
      </Flex>
    </Flex>
  );
}
