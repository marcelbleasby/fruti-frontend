"use client";

import { FileUpload as ChakraFileUpload, IconButton, Progress, chakra, type FileUploadRootProps } from "@chakra-ui/react";
import { FileText, Image as ImageIcon, RotateCcw, Upload, X } from "lucide-react";
import type { ReactNode } from "react";
import { FormField } from "./form-field";
import type { FieldBaseProps } from "./types";

/** Arquivo em envio/enviado, controlado por quem faz o upload (ex.: URL pré-assinada). */
export interface FileUploadItem {
  id: string;
  name: string;
  /** 0–100 enquanto envia. */
  progress?: number;
  status?: "uploading" | "done" | "error";
  /** Mensagem quando `status = "error"`. */
  error?: string;
  kind?: "image" | "document";
}

export interface FileRejectionInfo {
  file: File;
  errors: string[];
  /** Mensagem em pt-BR pronta para exibir. */
  message: string;
}

export interface FileUploadProps
  extends Pick<
    FieldBaseProps,
    "label" | "helperText" | "errorText" | "required" | "invalid" | "disabled" | "optional" | "id" | "fieldProps"
  > {
  /** Tipos aceitos (ex.: ["image/jpeg", "image/png", "image/webp"]). */
  accept?: FileUploadRootProps["accept"];
  /** Tamanho máximo por arquivo, em bytes. */
  maxFileSize?: number;
  /** Quantidade máxima (padrão 1). */
  maxFiles?: number;
  /** Texto do link (padrão "Selecione arquivos"). */
  triggerLabel?: string;
  /** Texto após o link (padrão "ou arraste para cá"). */
  dropLabel?: string;
  /** Linha de formatos/limite (ex.: "JPG, PNG ou WEBP · até 10 MB cada"). */
  hint?: ReactNode;
  /** Ícone do círculo (padrão: Upload). */
  icon?: ReactNode;
  name?: string;
  onFileAccept?: (files: File[]) => void;
  onFileReject?: (rejections: FileRejectionInfo[]) => void;
  /** Arquivos aceitos atuais (mudança de seleção). */
  onFilesChange?: (files: File[]) => void;
  /** Lista de envios controlada externamente (progresso / erro por arquivo). */
  items?: FileUploadItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Mostra a lista nativa dos arquivos aceitos (padrão: quando `items` não é informado). */
  showAcceptedFiles?: boolean;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function rejectionMessage(errors: string[], maxFileSize?: number, maxFiles?: number) {
  const code = errors[0];
  switch (code) {
    case "FILE_INVALID_TYPE":
      return "Formato não aceito.";
    case "FILE_TOO_LARGE":
      return maxFileSize ? `Arquivo maior que ${formatBytes(maxFileSize)}.` : "Arquivo grande demais.";
    case "FILE_TOO_SMALL":
      return "Arquivo vazio ou pequeno demais.";
    case "TOO_MANY_FILES":
      return maxFiles ? `Envie no máximo ${maxFiles} ${maxFiles === 1 ? "arquivo" : "arquivos"}.` : "Arquivos demais.";
    case "FILE_EXISTS":
      return "Este arquivo já foi adicionado.";
    default:
      return "Arquivo inválido.";
  }
}

interface FileRowProps {
  name: string;
  kind?: "image" | "document";
  progress?: number;
  meta?: ReactNode;
  error?: string;
  action?: ReactNode;
}

function FileRow({ name, kind, progress, meta, error, action }: FileRowProps) {
  const isError = Boolean(error);
  return (
    <chakra.li display="flex" alignItems="center" gap="2.5" py="2" listStyleType="none">
      <chakra.span
        boxSize="10"
        flex="none"
        borderRadius="l2"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={isError ? "danger.subtle" : "bg.muted"}
        color={isError ? "danger" : "fg.muted"}
        aria-hidden="true"
      >
        {kind === "image" ? <ImageIcon size={20} strokeWidth={1.75} /> : <FileText size={20} strokeWidth={1.75} />}
      </chakra.span>
      <chakra.span flex="1" minW="0" display="flex" flexDirection="column" gap="1">
        <chakra.span display="flex" justifyContent="space-between" gap="2" fontSize="sm">
          <chakra.span fontWeight="medium" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
            {name}
          </chakra.span>
          {meta != null && (
            <chakra.span color="fg.muted" flex="none">
              {meta}
            </chakra.span>
          )}
        </chakra.span>
        {progress != null && !isError && (
          <Progress.Root value={progress} size="xs" aria-label={`Envio de ${name}`}>
            <Progress.Track h="1" bg="bg.muted" borderRadius="full">
              <Progress.Range bg="primary" borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
        )}
        {isError && (
          <chakra.span textStyle="caption" fontWeight="normal" color="fg.error">
            {error}
          </chakra.span>
        )}
      </chakra.span>
      {action}
    </chakra.li>
  );
}

function RowAction({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <IconButton type="button" variant="ghost" size="sm" boxSize="9" color="fg.muted" aria-label={label} onClick={onClick}>
      {icon}
    </IconButton>
  );
}

/**
 * FileUpload — FileUpload.Root · Dropzone · ItemGroup + Progress. Área tracejada com
 * link "Selecione…" (ou arrastar), validação de tipo/tamanho em pt-BR e lista com
 * progresso, cancelar e tentar de novo.
 */
export function FileUpload(props: FileUploadProps) {
  const {
    accept,
    maxFileSize,
    maxFiles = 1,
    triggerLabel = "Selecione arquivos",
    dropLabel = "ou arraste para cá",
    hint,
    icon,
    name,
    onFileAccept,
    onFileReject,
    onFilesChange,
    items,
    onCancel,
    onRetry,
    onRemove,
    showAcceptedFiles = items === undefined,
    ...fieldProps
  } = props;

  return (
    <FormField {...fieldProps}>
      <ChakraFileUpload.Root
        accept={accept}
        maxFileSize={maxFileSize}
        maxFiles={maxFiles}
        name={name}
        gap="1"
        alignItems="stretch"
        onFileAccept={onFileAccept ? (d) => onFileAccept(d.files) : undefined}
        onFileReject={
          onFileReject
            ? (d) =>
                onFileReject(
                  d.files.map((r) => ({
                    file: r.file,
                    errors: r.errors,
                    message: rejectionMessage(r.errors, maxFileSize, maxFiles),
                  })),
                )
            : undefined
        }
        onFileChange={onFilesChange ? (d) => onFilesChange(d.acceptedFiles) : undefined}
      >
        <ChakraFileUpload.HiddenInput />
        <ChakraFileUpload.Dropzone
          w="full"
          minH="auto"
          p="5"
          gap="2"
          bg="bg.panel"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border.control"
          borderRadius="xl"
          textAlign="center"
          cursor="pointer"
          focusVisibleRing="outside"
          _dragging={{ borderColor: "primary", bg: "primary.subtle" }}
          _invalid={{ borderColor: "border.error" }}
          _disabled={{ layerStyle: "disabled", opacity: 1 }}
        >
          <chakra.span
            boxSize="11"
            borderRadius="full"
            bg="primary.subtle"
            color="primary"
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-hidden="true"
          >
            {icon ?? <Upload size={20} strokeWidth={1.75} />}
          </chakra.span>
          <ChakraFileUpload.DropzoneContent gap="1">
            <chakra.p textStyle="body.sm" color="fg">
              <ChakraFileUpload.Trigger asChild>
                <chakra.button
                  type="button"
                  color="primary"
                  fontWeight="600"
                  textDecoration="underline"
                  textUnderlineOffset="4px"
                  cursor="pointer"
                  focusVisibleRing="outside"
                >
                  {triggerLabel}
                </chakra.button>
              </ChakraFileUpload.Trigger>{" "}
              {dropLabel}
            </chakra.p>
            {hint != null && (
              <chakra.p fontSize="sm" color="fg.muted">
                {hint}
              </chakra.p>
            )}
          </ChakraFileUpload.DropzoneContent>
        </ChakraFileUpload.Dropzone>

        {items && items.length > 0 && (
          <ChakraFileUpload.ItemGroup gap="0" m="0" p="0">
            {items.map((item) => {
              const isError = item.status === "error";
              const uploading = item.status === "uploading" || (item.status == null && item.progress != null && item.progress < 100);
              return (
                <FileRow
                  key={item.id}
                  name={item.name}
                  kind={item.kind}
                  error={isError ? (item.error ?? "Falha no envio.") : undefined}
                  progress={uploading ? (item.progress ?? 0) : undefined}
                  meta={uploading ? `${Math.round(item.progress ?? 0)}%` : undefined}
                  action={
                    uploading && onCancel ? (
                      <RowAction label={`Cancelar envio de ${item.name}`} icon={<X size={16} strokeWidth={1.75} />} onClick={() => onCancel(item.id)} />
                    ) : isError && onRetry ? (
                      <RowAction label={`Tentar enviar ${item.name} de novo`} icon={<RotateCcw size={16} strokeWidth={1.75} />} onClick={() => onRetry(item.id)} />
                    ) : onRemove ? (
                      <RowAction label={`Remover ${item.name}`} icon={<X size={16} strokeWidth={1.75} />} onClick={() => onRemove(item.id)} />
                    ) : undefined
                  }
                />
              );
            })}
          </ChakraFileUpload.ItemGroup>
        )}

        <ChakraFileUpload.Context>
          {(api) => {
            const rejected = api.rejectedFiles;
            const accepted = showAcceptedFiles ? api.acceptedFiles : [];
            if (rejected.length === 0 && accepted.length === 0) return null;
            return (
              <chakra.ul m="0" p="0">
                {accepted.map((file) => (
                  <FileRow
                    key={`a-${file.name}-${file.size}`}
                    name={file.name}
                    kind={file.type.startsWith("image/") ? "image" : "document"}
                    meta={formatBytes(file.size)}
                    action={
                      <RowAction label={`Remover ${file.name}`} icon={<X size={16} strokeWidth={1.75} />} onClick={() => api.deleteFile(file)} />
                    }
                  />
                ))}
                {rejected.map((r) => (
                  <FileRow
                    key={`r-${r.file.name}-${r.file.size}`}
                    name={r.file.name}
                    kind={r.file.type.startsWith("image/") ? "image" : "document"}
                    error={rejectionMessage(r.errors, maxFileSize, maxFiles)}
                    action={
                      <RowAction
                        label={`Dispensar ${r.file.name}`}
                        icon={<X size={16} strokeWidth={1.75} />}
                        onClick={() => api.deleteFile(r.file, "rejected")}
                      />
                    }
                  />
                ))}
              </chakra.ul>
            );
          }}
        </ChakraFileUpload.Context>
      </ChakraFileUpload.Root>
    </FormField>
  );
}
