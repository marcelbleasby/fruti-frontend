"use client";

import {
  Box,
  Button,
  EmptyState as ChakraEmptyState,
  Collapsible,
  Flex,
  Icon,
  IconButton,
  Stack,
  Text,
  chakra,
  type EmptyStateRootProps,
} from "@chakra-ui/react";
import { Check, ChevronDown, Copy, FileQuestionMark, LockKeyhole, RefreshCw, ServerCrash, TriangleExclamationPoint, WifiOff } from "lucide-react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { ConcentricIndicator, type IndicatorTone } from "./concentric-indicator";

export type ErrorStateVariant = "not-found" | "server" | "forbidden" | "offline" | "partial";

export interface ErrorStateProps extends Omit<EmptyStateRootProps, "title" | "size" | "variant"> {
  variant?: ErrorStateVariant;
  /** `compact` é o formato de bloco (BentoTile); usado por padrão em `partial`. */
  size?: "md" | "sm" | "compact";
  title?: ReactNode;
  description?: ReactNode;
  /** Nível semântico do título (o tamanho segue o papel, não o nível). */
  headingAs?: "h2" | "h3" | "h4";
  /** Mostra "Tentar novamente" (ou "Tentar agora" em offline). Se retornar Promise, o botão entra em carregamento. */
  onRetry?: () => void | Promise<unknown>;
  retryLabel?: string;
  /** Força o estado de carregamento do botão de nova tentativa. */
  retrying?: boolean;
  /** Tentativas que já falharam; a partir de 2 mostra o aviso, a partir de 3 sugere o suporte. */
  failedAttempts?: number;
  /** Segundos até a próxima tentativa automática (offline). */
  nextRetryIn?: number;
  /** Detalhes técnicos (Collapsible + "Copiar detalhes"). */
  errorCode?: string | number;
  requestId?: string;
  occurredAt?: string;
  /** Ações adicionais/alternativas (ex.: "Voltar para plantios", "Buscar plantio"). */
  actions?: ReactNode;
  icon?: ElementType;
  /** Ao aparecer, o título recebe foco. Padrão: true (exceto `partial`). */
  focusOnMount?: boolean;
}

const variantConfig: Record<
  ErrorStateVariant,
  { icon: ElementType; tone: IndicatorTone; size: "md" | "sm" | "compact"; title: string; description: string; retryLabel: string }
> = {
  "not-found": {
    icon: FileQuestionMark,
    tone: "neutral",
    size: "md",
    title: "Página não encontrada",
    description: "O conteúdo que você procura não existe ou foi removido.",
    retryLabel: "Tentar novamente",
  },
  server: {
    icon: ServerCrash,
    tone: "danger",
    size: "md",
    title: "Algo deu errado do nosso lado",
    description: "Nenhum dado foi perdido. Tente de novo em instantes; se continuar, envie o código abaixo ao suporte.",
    retryLabel: "Tentar novamente",
  },
  forbidden: {
    icon: LockKeyhole,
    tone: "warning",
    size: "sm",
    title: "Sem acesso",
    description: "Seu perfil não inclui este módulo. Fale com o administrador da conta.",
    retryLabel: "Tentar novamente",
  },
  offline: {
    icon: WifiOff,
    tone: "info",
    size: "sm",
    title: "Sem conexão",
    description: "Verifique sua internet. Tentaremos de novo automaticamente.",
    retryLabel: "Tentar agora",
  },
  partial: {
    icon: TriangleExclamationPoint,
    tone: "danger",
    size: "compact",
    title: "Bloco indisponível",
    description: "Os outros blocos carregaram normalmente.",
    retryLabel: "Tentar carregar de novo",
  },
};

const indicatorSizes = { md: { diameter: 104, icon: 24 }, sm: { diameter: 72, icon: 16 } } as const;

function useRetry(onRetry: ErrorStateProps["onRetry"], forced?: boolean) {
  const [pending, setPending] = useState(false);
  const run = async () => {
    if (!onRetry) return;
    const result = onRetry();
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setPending(true);
      try {
        await result;
      } catch {
        // o chamador decide o que mostrar (failedAttempts)
      } finally {
        setPending(false);
      }
    }
  };
  return { loading: forced ?? pending, run };
}

function TechnicalDetails({ errorCode, requestId, occurredAt }: Pick<ErrorStateProps, "errorCode" | "requestId" | "occurredAt">) {
  const rows = [
    errorCode !== undefined ? ["código", String(errorCode)] : null,
    requestId ? ["requisição", requestId] : null,
    occurredAt ? ["quando", occurredAt] : null,
  ].filter(Boolean) as [string, string][];
  if (rows.length === 0) return null;

  return (
    <Collapsible.Root w="full" maxW="420px" alignSelf="center">
      <Collapsible.Trigger
        display="inline-flex"
        alignItems="center"
        gap="1"
        minH="8"
        mx="auto"
        fontSize="sm"
        fontWeight="600"
        color="primary"
        cursor="pointer"
        borderRadius="l1"
        focusVisibleRing="outside"
        css={{ "&[data-state=open] svg": { transform: "rotate(180deg)" } }}
      >
        Detalhes técnicos
        <Icon as={ChevronDown} boxSize="4" strokeWidth={1.75} aria-hidden transition="transform 150ms" />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <chakra.dl
          mt="2"
          px="3"
          py="2.5"
          borderRadius="lg"
          bg="bg"
          display="grid"
          gridTemplateColumns="auto 1fr"
          columnGap="3"
          rowGap="1"
          textStyle="code.sm"
          textAlign="start"
          color="fg"
        >
          {rows.map(([k, v]) => (
            <Box key={k} display="contents">
              <chakra.dt color="fg.muted">{k}</chakra.dt>
              <chakra.dd m="0">{v}</chakra.dd>
            </Box>
          ))}
        </chakra.dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function CopyDetailsButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      <Icon as={copied ? Check : Copy} boxSize="4" strokeWidth={1.75} aria-hidden />
      {copied ? "Copiado" : "Copiar detalhes"}
    </Button>
  );
}

function AttemptsNotice({ failedAttempts, requestId }: { failedAttempts?: number; requestId?: string }) {
  if (!failedAttempts || failedAttempts < 2) return null;
  return (
    <Stack gap="1" align="center">
      <Text role="alert" fontSize="sm" fontWeight="600" color="fg.error">
        {failedAttempts}ª tentativa sem sucesso
      </Text>
      {failedAttempts >= 3 && (
        <Text fontSize="sm" color="fg.muted">
          Se continuar, fale com o suporte{requestId ? ` informando o código ${requestId}` : ""}.
        </Text>
      )}
    </Stack>
  );
}

/**
 * Estado de erro do DS: diz o que aconteceu e sempre oferece um próximo passo.
 * Variantes: não encontrado (404), falha do servidor (500), sem permissão (403),
 * sem conexão e falha parcial de um bloco.
 */
export function ErrorState({
  variant = "server",
  size,
  title,
  description,
  headingAs = "h2",
  onRetry,
  retryLabel,
  retrying,
  failedAttempts,
  nextRetryIn,
  errorCode,
  requestId,
  occurredAt,
  actions,
  icon,
  focusOnMount,
  ...rest
}: ErrorStateProps) {
  const config = variantConfig[variant];
  const resolvedSize = size ?? config.size;
  const label = retryLabel ?? config.retryLabel;
  const { loading, run } = useRetry(onRetry, retrying);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const shouldFocus = focusOnMount ?? resolvedSize !== "compact";

  useEffect(() => {
    if (shouldFocus) titleRef.current?.focus();
  }, [shouldFocus]);

  if (resolvedSize === "compact") {
    return (
      <Flex
        role="alert"
        align="center"
        gap="2.5"
        p="3"
        bg="bg.panel"
        borderWidth="1px"
        borderStyle="dashed"
        borderColor="border.error"
        borderRadius="xl"
        {...(rest as object)}
      >
        <Box
          as="span"
          boxSize="8"
          flex="none"
          borderRadius="lg"
          bg="red.100"
          color="red.700"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon ?? config.icon} boxSize="4" strokeWidth={1.75} aria-hidden />
        </Box>
        <Stack gap="0" flex="1" minW="0">
          <Text ref={titleRef} tabIndex={-1} textStyle="label" fontWeight="600" color="fg" outline="none">
            {title ?? config.title}
          </Text>
          <Text textStyle="caption" fontWeight="400" color="fg.muted">
            {description ?? config.description}
          </Text>
        </Stack>
        {actions}
        {onRetry && (
          <IconButton
            aria-label={label}
            variant="outline"
            size="sm"
            boxSize="9"
            loading={loading}
            aria-busy={loading || undefined}
            onClick={run}
          >
            <Icon as={RefreshCw} boxSize="4" strokeWidth={1.75} aria-hidden />
          </IconButton>
        )}
      </Flex>
    );
  }

  const indicator = indicatorSizes[resolvedSize];
  const isOffline = variant === "offline";
  const hasDetails = errorCode !== undefined || Boolean(requestId) || Boolean(occurredAt);
  const detailsText = [
    errorCode !== undefined ? `código: ${errorCode}` : null,
    requestId ? `requisição: ${requestId}` : null,
    occurredAt ? `quando: ${occurredAt}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <ChakraEmptyState.Root px="6" py="6" {...rest}>
      <ChakraEmptyState.Content gap="3" textAlign="center">
        <ChakraEmptyState.Indicator>
          <ConcentricIndicator icon={icon ?? config.icon} tone={config.tone} diameter={indicator.diameter} iconSize={indicator.icon} />
        </ChakraEmptyState.Indicator>
        <ChakraEmptyState.Title
          ref={titleRef}
          tabIndex={-1}
          as={headingAs}
          m="0"
          textStyle="heading.md"
          color="fg.heading"
          borderRadius="l1"
          focusVisibleRing="outside"
          _focus={{ outline: "none" }}
        >
          {title ?? config.title}
        </ChakraEmptyState.Title>
        <ChakraEmptyState.Description textStyle="body.sm" color="fg.muted" maxW="sm">
          {description ?? config.description}
        </ChakraEmptyState.Description>

        {(onRetry || actions || hasDetails || nextRetryIn !== undefined) && (
          <Flex
            wrap="wrap"
            gap="2"
            justify="center"
            align="center"
            w={{ base: "full", md: "auto" }}
            css={{ "& > button, & > a": { width: { base: "full", md: "auto" }, minHeight: { base: "44px", md: "unset" } } }}
          >
            {isOffline && nextRetryIn !== undefined && (
              <Text role="status" fontSize="sm" color="fg">
                Nova tentativa em <strong>{nextRetryIn} s</strong>
              </Text>
            )}
            {onRetry && (
              <Button
                variant={isOffline ? "outline" : "solid"}
                size={resolvedSize === "sm" ? "sm" : "md"}
                minH={resolvedSize === "sm" ? "9" : undefined}
                loading={loading}
                loadingText="Tentando…"
                aria-busy={loading || undefined}
                onClick={run}
              >
                <Icon as={RefreshCw} boxSize="4" strokeWidth={1.75} aria-hidden />
                {label}
              </Button>
            )}
            {variant === "server" && hasDetails && <CopyDetailsButton text={detailsText} />}
            {actions}
          </Flex>
        )}

        <AttemptsNotice failedAttempts={failedAttempts} requestId={requestId} />
        {hasDetails && <TechnicalDetails errorCode={errorCode} requestId={requestId} occurredAt={occurredAt} />}
      </ChakraEmptyState.Content>
    </ChakraEmptyState.Root>
  );
}
