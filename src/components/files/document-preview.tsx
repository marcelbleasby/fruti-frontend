"use client";

import { Flex, Stack, chakra } from "@chakra-ui/react";
import { FileText } from "lucide-react";
import type { ReactNode } from "react";
import { DataList } from "@/components/data-display/data-list";
import { Drawer } from "@/components/overlays/drawer";
import { formatDate, formatFileSize } from "@/modules/format";
import type { DocumentRef, FileId } from "@/modules/types";
import { DOCUMENT_CATEGORY_LABEL } from "./constants";
import { FileDownloadAction } from "./file-download-action";

export interface DocumentPreviewProps {
  document: DocumentRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getUrl: (fileId: FileId, kind: "image" | "document") => Promise<string>;
  authorized?: boolean;
  /** Miniatura da primeira página (URL já autorizada). Sem ela, mostra um espaço reservado. */
  thumbnailSrc?: string;
  /** Página exibida (padrão 1). */
  page?: number;
  /** Conteúdo extra abaixo dos metadados. */
  children?: ReactNode;
}

/**
 * DocumentPreview — painel lateral com primeira página, metadados e ações de abrir/baixar.
 * Chakra v3: Drawer.Root (placement end) · DataList · FileDownloadAction.
 */
export function DocumentPreview({
  document: doc,
  open,
  onOpenChange,
  getUrl,
  authorized = true,
  thumbnailSrc,
  page = 1,
  children,
}: DocumentPreviewProps) {
  if (!doc) return null;
  const pageLabel = doc.pages ? `Página ${page} de ${doc.pages}` : "Pré-visualização";

  return (
    <Drawer
      title={doc.name}
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      placement="end"
      size="md"
      footer={
        <Flex gap="2" justify="flex-end" wrap="wrap" w="full">
          <FileDownloadAction fileId={doc.id} kind="document" getUrl={getUrl} authorized={authorized} mode="open" size="md" />
          <FileDownloadAction
            fileId={doc.id}
            kind="document"
            fileName={doc.name}
            getUrl={getUrl}
            authorized={authorized}
            variant="solid"
            size="md"
          />
        </Flex>
      }
    >
      <Stack gap="3" py="3.5">
        {thumbnailSrc ? (
          <chakra.figure m="0" display="flex" flexDirection="column" gap="1">
            <chakra.img src={thumbnailSrc} alt={`Primeira página de ${doc.name}`} w="full" borderRadius="l2" bg="bg.muted" />
            <chakra.figcaption fontSize="xs" lineHeight="1rem" color="fg.muted">
              {pageLabel}
            </chakra.figcaption>
          </chakra.figure>
        ) : (
          <Flex
            role="img"
            aria-label="Pré-visualização da primeira página"
            h="160px"
            borderRadius="l2"
            bg="bg.muted"
            direction="column"
            align="center"
            justify="center"
            gap="1.5"
            color="fg.muted"
            fontSize="sm"
          >
            <FileText size={24} strokeWidth={1.75} aria-hidden="true" />
            {pageLabel}
          </Flex>
        )}
        <DataList
          minItemWidth="120px"
          items={[
            { key: "cat", label: "Categoria", value: DOCUMENT_CATEGORY_LABEL[doc.category] },
            { key: "size", label: "Tamanho", value: formatFileSize(doc.size) },
            { key: "link", label: "Vinculado a", value: doc.linkedTo?.label ?? null },
            {
              key: "by",
              label: "Enviado por",
              value: doc.uploadedBy ? `${doc.uploadedBy}, ${formatDate(doc.uploadedAt)}` : formatDate(doc.uploadedAt),
            },
          ]}
        />
        {children}
      </Stack>
    </Drawer>
  );
}
