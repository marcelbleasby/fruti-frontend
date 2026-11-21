"use client";

import { Button, Flex, IconButton, Spinner, Text, VisuallyHidden, type ButtonProps } from "@chakra-ui/react";
import { Download, ExternalLink, Lock } from "lucide-react";
import { useId, useState } from "react";
import { Tooltip } from "@/components/overlays/tooltip";
import type { FileId } from "@/modules/types";

export interface FileDownloadActionProps extends Omit<ButtonProps, "onClick" | "children"> {
  fileId: FileId;
  kind: "image" | "document";
  /** Pede ao backend uma URL temporária (chamado só no clique; o link expira). */
  getUrl: (fileId: FileId, kind: "image" | "document") => Promise<string>;
  /** Perfil pode acessar o arquivo? Padrão true. */
  authorized?: boolean;
  /** Texto do botão (padrão "Baixar"; "Abrir em nova aba" com `mode="open"`). */
  label?: string;
  /** Nome do arquivo, para o rótulo acessível ("Baixar Nota fiscal.pdf"). */
  fileName?: string;
  /** download (padrão): baixa o arquivo · open: abre em nova aba. */
  mode?: "download" | "open";
  /** Só ícone (listas). O motivo do bloqueio continua disponível em texto para leitores de tela. */
  iconOnly?: boolean;
  /** Motivo exibido quando `authorized` é false. */
  unauthorizedReason?: string;
  onError?: (error: unknown) => void;
}

function triggerDownload(url: string, fileName?: string) {
  const a = document.createElement("a");
  a.href = url;
  if (fileName) a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * FileDownloadAction — pede o link ao backend só no clique ("Gerando link…") e baixa
 * ou abre o arquivo. Sem permissão, fica desabilitado e o motivo aparece em texto.
 * Chakra v3: Button · Tooltip · Spinner.
 */
export function FileDownloadAction({
  fileId,
  kind,
  getUrl,
  authorized = true,
  label,
  fileName,
  mode = "download",
  iconOnly = false,
  unauthorizedReason = "Seu perfil não tem acesso a este documento.",
  onError,
  variant = "outline",
  size = "sm",
  ...rest
}: FileDownloadActionProps) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const reasonId = useId();
  const text = label ?? (mode === "open" ? "Abrir em nova aba" : "Baixar");
  const accessible = fileName ? `${text} ${fileName}` : text;
  const ActionIcon = mode === "open" ? ExternalLink : Download;

  const handleClick = async () => {
    setFailed(false);
    setLoading(true);
    // Em "open", a aba é aberta já no clique para não ser bloqueada como pop-up.
    const win = mode === "open" ? window.open("", "_blank") : null;
    try {
      const url = await getUrl(fileId, kind);
      if (win) {
        win.opener = null;
        win.location.href = url;
      } else {
        triggerDownload(url, fileName);
      }
    } catch (error) {
      win?.close();
      setFailed(true);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) {
    const blocked = iconOnly ? (
      <IconButton aria-label={accessible} aria-describedby={reasonId} disabled variant="ghost" size={size} {...rest}>
        <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
      </IconButton>
    ) : (
      <Button aria-describedby={reasonId} disabled variant={variant} size={size} {...rest}>
        <Lock size={16} strokeWidth={1.75} aria-hidden="true" />
        {text}
      </Button>
    );
    return (
      <Flex direction="column" align="flex-start" gap="1">
        <Tooltip content={unauthorizedReason}>
          <span style={{ display: "inline-flex" }}>{blocked}</span>
        </Tooltip>
        {iconOnly ? (
          <VisuallyHidden id={reasonId}>{unauthorizedReason}</VisuallyHidden>
        ) : (
          <Text id={reasonId} fontSize="xs" lineHeight="1rem" color="fg.muted">
            {unauthorizedReason}
          </Text>
        )}
      </Flex>
    );
  }

  const errorText = failed ? (
    <Text fontSize="xs" lineHeight="1rem" color="fg.error" role="alert">
      Não foi possível gerar o link. Tente de novo.
    </Text>
  ) : null;

  if (iconOnly) {
    return (
      <Flex direction="column" align="flex-end" gap="1">
        <Tooltip content={text}>
          <IconButton
            aria-label={loading ? `Gerando link de ${fileName ?? "arquivo"}` : accessible}
            aria-busy={loading || undefined}
            disabled={loading}
            variant="ghost"
            size={size}
            color="fg.heading"
            onClick={handleClick}
            {...rest}
          >
            {loading ? <Spinner size="sm" color="primary" /> : <ActionIcon size={20} strokeWidth={1.75} aria-hidden="true" />}
          </IconButton>
        </Tooltip>
        {errorText}
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="flex-start" gap="1">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        loading={loading}
        loadingText="Gerando link…"
        spinnerPlacement="start"
        aria-label={fileName && !loading ? accessible : undefined}
        {...rest}
      >
        <ActionIcon size={16} strokeWidth={1.75} aria-hidden="true" />
        {text}
      </Button>
      {errorText}
    </Flex>
  );
}
