"use client";

import { Box, Button, Steps as ChakraSteps, Text, VisuallyHidden } from "@chakra-ui/react";
import { Check, ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export interface StepsItem {
  title: string;
  /** Linha de apoio (ex.: "Concluído", "Lote LM-2026-014", "Em andamento"). */
  description?: ReactNode;
  /** Conteúdo do passo, exibido quando ele é o atual. */
  content?: ReactNode;
}

export interface StepsProps extends Omit<ChakraSteps.RootProps, "children" | "count" | "variant" | "size" | "orientation"> {
  items: StepsItem[];
  /** Mostra os botões Voltar / Continuar. */
  showNavigation?: boolean;
  prevLabel?: string;
  nextLabel?: string;
  /** Rótulo do botão no último passo (padrão "Concluir"). */
  finishLabel?: string;
  /** Conteúdo exibido depois do último passo. */
  completedContent?: ReactNode;
  /** Rótulos lidos por leitores de tela para o estado de cada passo. */
  statusLabels?: { complete: string; current: string; incomplete: string };
  /**
   * Largura do contêiner (px) abaixo da qual a lista vira compacta: só indicadores
   * e linhas, com "Etapa N de T · título" do passo atual logo abaixo. Padrão 480.
   */
  compactBelow?: number;
}

/**
 * Passos para cadastros longos (Steps.Root). Passo concluído tem ícone, não só cor;
 * o passo atual recebe aria-current="step".
 *
 * Layout do board "Navegação": os passos dividem a largura (sem rolagem) e a linha
 * liga o texto de um passo ao indicador do próximo. Em contêineres estreitos
 * (container query, não viewport) os títulos saem da linha e o passo atual aparece
 * num resumo abaixo — o passo atual nunca fica escondido fora da tela.
 */
export function Steps(props: StepsProps) {
  const {
    items,
    showNavigation = true,
    prevLabel = "Voltar",
    nextLabel = "Continuar",
    finishLabel = "Concluir",
    completedContent,
    statusLabels = {
      complete: "concluído",
      current: "atual",
      incomplete: "pendente",
    },
    compactBelow = 480,
    css,
    ...rootProps
  } = props;

  const compact = `@container (max-width: ${compactBelow - 1}px)`;

  return (
    <ChakraSteps.Root
      count={items.length}
      gap="3"
      css={{
        containerType: "inline-size",
        [compact]: {
          // Títulos e descrições continuam no DOM para leitores de tela.
          "& [data-steps-text]": {
            position: "absolute",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          },
          "& [data-steps-summary]": { display: "flex" },
          "& [data-steps-line]": { marginInline: "8px" },
        },
        ...css,
      }}
      {...rootProps}
    >
      <ChakraSteps.Context>
        {(api) => {
          const current = items[api.value];
          const isLast = api.value === items.length - 1;
          return (
            <>
              {/* Lista simples (ol/li): sem Steps.Trigger, os papéis tablist/tabpanel do Ark ficariam órfãos. */}
              <Box
                as="ol"
                role="list"
                m="0"
                p="0"
                listStyleType="none"
                display="flex"
                minW="0"
                css={{
                  "--steps-size": "32px",
                  "--steps-icon-size": "16px",
                  "--steps-thickness": "2px",
                }}
              >
                {items.map((item, index) => {
                  const state = api.getItemState({ index });
                  const status = state.completed ? "complete" : state.current ? "current" : "incomplete";
                  const last = index === items.length - 1;
                  return (
                    <ChakraSteps.Item
                      key={index}
                      index={index}
                      asChild
                      alignItems="flex-start"
                      gap="0"
                      flex={last ? "none" : "1 1 0"}
                      minW="0"
                      aria-current={state.current ? "step" : undefined}
                    >
                      <li>
                        <Box display="flex" flexDirection="column" gap="1.5" minW="0" maxW="140px">
                          <ChakraSteps.Indicator
                            fontSize="sm"
                            fontWeight="600"
                            borderWidth="0"
                            flexShrink={0}
                            _complete={{ bg: "primary", color: "fg.inverted" }}
                            _current={{
                              bg: "bg.panel",
                              color: "fg.heading",
                              borderWidth: "2px",
                              borderColor: "primary",
                            }}
                            _incomplete={{
                              bg: "bg.muted",
                              color: "fg.muted",
                              borderWidth: "0",
                            }}
                          >
                            <ChakraSteps.Status
                              complete={<Check strokeWidth={3} aria-hidden />}
                              incomplete={<ChakraSteps.Number />}
                            />
                          </ChakraSteps.Indicator>
                          <Box data-steps-text="" display="flex" flexDirection="column" gap="1" minW="0">
                            <ChakraSteps.Title
                              textStyle="body.sm"
                              fontWeight={status === "current" ? "600" : "500"}
                              color={status === "incomplete" ? "fg.muted" : "fg.heading"}
                              overflowWrap="break-word"
                            >
                              {item.title}
                              <VisuallyHidden>{` (${statusLabels[status]})`}</VisuallyHidden>
                            </ChakraSteps.Title>
                            {item.description && (
                              <ChakraSteps.Description
                                textStyle="caption"
                                fontWeight="400"
                                color="fg.muted"
                                overflowWrap="break-word"
                              >
                                {item.description}
                              </ChakraSteps.Description>
                            )}
                          </Box>
                        </Box>
                        {!last && (
                          // Faixa de 32 px (= indicador) centraliza a linha de 2 px sem margem fora da grade.
                          <Box data-steps-line="" display="flex" alignItems="center" h="8" flex="1 1 0" minW="3" mx="2">
                            <ChakraSteps.Separator h="2px" w="full" flex="1" bg="border" _complete={{ bg: "primary" }} />
                          </Box>
                        )}
                      </li>
                    </ChakraSteps.Item>
                  );
                })}
              </Box>

              {/* Resumo do modo compacto (visível só abaixo de `compactBelow`). Oculto para
                  leitores de tela: a lista acima já anuncia título e estado de cada passo. */}
              {!api.isCompleted && current && (
                <Box data-steps-summary="" display="none" flexDirection="column" gap="0.5" aria-hidden="true">
                  <Text textStyle="overline" color="fg.muted">
                    Etapa {api.value + 1} de {items.length}
                  </Text>
                  <Text textStyle="body.sm" fontWeight="600" color="fg.heading">
                    {current.title}
                  </Text>
                  {current.description && (
                    <Text textStyle="caption" fontWeight="400" color="fg.muted">
                      {current.description}
                    </Text>
                  )}
                </Box>
              )}

              {api.isCompleted ? completedContent : current?.content}

              {showNavigation && (
                <Box display="flex" justifyContent="space-between" gap="2">
                  <ChakraSteps.PrevTrigger asChild>
                    <Button variant="outline" size="sm" h={{ base: "11", md: "9" }} px="3.5">
                      <ChevronLeft strokeWidth={1.75} aria-hidden />
                      {prevLabel}
                    </Button>
                  </ChakraSteps.PrevTrigger>
                  {!api.isCompleted && (
                    <ChakraSteps.NextTrigger asChild>
                      <Button variant="solid" size="sm" h={{ base: "11", md: "9" }} px="3.5">
                        {isLast ? finishLabel : nextLabel}
                      </Button>
                    </ChakraSteps.NextTrigger>
                  )}
                </Box>
              )}
            </>
          );
        }}
      </ChakraSteps.Context>
    </ChakraSteps.Root>
  );
}
