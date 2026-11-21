"use client";

import { Box, type BoxProps, Code, Flex, Heading, IconButton, Text, VisuallyHidden, chakra } from "@chakra-ui/react";
import type { HeadingLevel } from "@/components/data-display/heading-level";
import { Check, Copy, Maximize2 } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { useChartTheme } from "@/components/charts/chart-theme";
import { Skeleton } from "@/components/data-display/skeleton";
import { Collapsible } from "@/components/navigation/collapsible";
import { Dialog } from "@/components/overlays/dialog";
import { Tooltip } from "@/components/overlays/tooltip";

export interface FlowDiagramProps extends Omit<BoxProps, "children" | "title"> {
  title: ReactNode;
  /** Nível do título (o tamanho vem do papel, não do nível). Padrão h3. */
  headingAs?: HeadingLevel;
  /** Definição Mermaid (ex.: "flowchart LR\n L[LM-2026-014] --> P[PL-0042]"). */
  definition: string;
  /** Texto alternativo — sempre visível como legenda; descreve o mesmo fluxo. */
  description: string;
  /** Botão "Ampliar diagrama" (abre em Dialog). Padrão: true. */
  zoomable?: boolean;
  /** Botão "Copiar código Mermaid". Padrão: true. */
  copyable?: boolean;
  /** Collapsible "Ver definição Mermaid". Padrão: true. */
  showDefinition?: boolean;
  /** Altura reservada enquanto o Mermaid carrega (px). */
  minHeight?: number;
}

type RenderState = { status: "idle" | "loading" } | { status: "ready"; svg: string } | { status: "error" };

/**
 * FlowDiagram — diagrama Mermaid renderizado no cliente. O Mermaid só é
 * carregado quando o diagrama entra na tela; a legenda em texto descreve o
 * mesmo fluxo. Card · Mermaid · Collapsible · IconButton.
 */
export function FlowDiagram({
  title,
  headingAs = "h3",
  definition,
  description,
  zoomable = true,
  copyable = true,
  showDefinition = true,
  minHeight = 140,
  ...rest
}: FlowDiagramProps) {
  const theme = useChartTheme();
  const reactId = useId();
  const baseId = `fd${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const descId = `${baseId}-desc`;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState<RenderState>({ status: "idle" });
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Carrega o Mermaid quando o bloco aparece (ou no primeiro momento ocioso).
  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setVisible(true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);
    // Fallback: se o bloco nunca entrar na tela (captura de página inteira,
    // impressão), carrega quando o navegador ficar ocioso.
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => setVisible(true), { timeout: 4000 })
        : window.setTimeout(() => setVisible(true), 2500);
    return () => {
      observer.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [visible]);

  const { resolve, fontFamily } = theme;
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    queueMicrotask(() => !cancelled && setRender({ status: "loading" }));
    import("mermaid")
      .then(async ({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          fontFamily,
          themeVariables: {
            fontFamily,
            fontSize: "sm",
            primaryColor: resolve("primary.subtle"),
            primaryBorderColor: resolve("primary"),
            primaryTextColor: resolve("fg.heading"),
            lineColor: resolve("border.control"),
            secondaryColor: resolve("bg.panel"),
            tertiaryColor: resolve("bg"),
          },
        });
        const { svg } = await mermaid.render(`${baseId}-svg`, definition);
        if (!cancelled) setRender({ status: "ready", svg });
      })
      .catch(() => {
        if (!cancelled) setRender({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [visible, definition, baseId, resolve, fontFamily]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(definition);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const svgBox = (svg: string) => (
    <Box
      w="full"
      overflowX="auto"
      css={{ "& svg": { maxWidth: "100%", height: "auto", margin: "0 auto", display: "block" } }}
      // Mermaid com securityLevel "strict" sanitiza os rótulos (DOMPurify).
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );

  let canvas: ReactNode;
  if (render.status === "ready") canvas = svgBox(render.svg);
  else if (render.status === "error")
    canvas = (
      <Text fontSize="sm" color="fg.muted" textAlign="center">
        Não foi possível desenhar o diagrama. A descrição abaixo mostra o mesmo fluxo.
      </Text>
    );
  else canvas = <Skeleton w="full" h={`${minHeight - 24}px`} borderRadius="l2" aria-label="Carregando diagrama" />;

  return (
    <Box
      as="section"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p={{ base: "4", md: "5" }}
      display="flex"
      flexDirection="column"
      gap="3.5"
      minW="0"
      {...rest}
    >
      <Flex justify="space-between" align="center" gap="2">
        <Heading as={headingAs} textStyle="heading.sm" color="fg.heading">
          {title}
        </Heading>
        <Flex gap="1" flex="none">
          {zoomable && (
            <Tooltip content="Ampliar diagrama">
              <IconButton
                aria-label="Ampliar diagrama"
                variant="ghost"
                size="sm"
                boxSize="9"
                color="fg.muted"
                disabled={render.status !== "ready"}
                onClick={() => setZoomOpen(true)}
              >
                <Maximize2 strokeWidth={1.75} />
              </IconButton>
            </Tooltip>
          )}
          {copyable && (
            <Tooltip content={copied ? "Copiado" : "Copiar código Mermaid"}>
              <IconButton
                aria-label="Copiar código Mermaid"
                variant="ghost"
                size="sm"
                boxSize="9"
                color={copied ? "primary" : "fg.muted"}
                onClick={copy}
              >
                {copied ? <Check strokeWidth={1.75} /> : <Copy strokeWidth={1.75} />}
              </IconButton>
            </Tooltip>
          )}
          <VisuallyHidden aria-live="polite">{copied ? "Código Mermaid copiado" : ""}</VisuallyHidden>
        </Flex>
      </Flex>

      <chakra.figure m="0" display="flex" flexDirection="column" gap="2.5">
        <Flex
          ref={ref}
          role="img"
          aria-labelledby={descId}
          minH={`${minHeight}px`}
          align="center"
          justify="center"
          p="3"
          borderRadius="lg"
          bg="bg"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor="border.control"
        >
          {canvas}
        </Flex>
        <chakra.figcaption id={descId} textStyle="body.sm" color="fg">
          {description}
        </chakra.figcaption>
      </chakra.figure>

      {showDefinition && (
        <Collapsible label="Ver definição Mermaid" openLabel="Ocultar definição Mermaid">
          <Code
            as="pre"
            display="block"
            whiteSpace="pre"
            overflowX="auto"
            p="0"
            bg="transparent"
            fontSize="sm"
            color="fg"
          >
            {definition}
          </Code>
        </Collapsible>
      )}

      {zoomable && (
        <Dialog
          title={title}
          size="lg"
          open={zoomOpen}
          onOpenChange={(d) => setZoomOpen(d.open)}
        >
          {render.status === "ready" ? svgBox(render.svg) : null}
          <Text mt="3" fontSize="sm" color="fg.muted">
            {description}
          </Text>
        </Dialog>
      )}
    </Box>
  );
}
