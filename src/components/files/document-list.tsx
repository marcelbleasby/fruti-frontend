"use client";

import { Box, Flex, List, Text, chakra, type BoxProps } from "@chakra-ui/react";
import { Eye, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { Badge } from "@/components/data-display/badge";
import { ActionMenu, type ActionMenuEntry } from "@/components/navigation/action-menu";
import { formatDate, formatFileSize } from "@/modules/format";
import type { DocumentRef, FileId } from "@/modules/types";
import { DOCUMENT_CATEGORY_LABEL } from "./constants";
import { FileDownloadAction } from "./file-download-action";

export interface DocumentListProps extends Omit<BoxProps, "children"> {
  documents: DocumentRef[];
  /** Abre a pré-visualização (DocumentPreview). */
  onPreview?: (document: DocumentRef) => void;
  /** Mostra "Excluir" no menu. */
  canDelete?: boolean;
  onDelete?: (document: DocumentRef) => void;
  /** URL temporária para download (FileDownloadAction). */
  getUrl: (fileId: FileId, kind: "image" | "document") => Promise<string>;
  /** Permissão de acesso por documento (padrão: todos). */
  isAuthorized?: (document: DocumentRef) => boolean;
  emptyText?: string;
  /** Sem moldura de card. */
  bare?: boolean;
}

function DocIcon({ name }: { name: string }) {
  const Icon = /\.xlsx?$/i.test(name) ? FileSpreadsheet : FileText;
  return <Icon size={20} strokeWidth={1.75} aria-hidden="true" />;
}

/**
 * DocumentList — documentos do registro: nome (abre a pré-visualização), categoria,
 * tamanho, data, download e menu de ações. Chakra v3: List · Badge · FileDownloadAction · Menu.
 */
export function DocumentList({
  documents,
  onPreview,
  canDelete = false,
  onDelete,
  getUrl,
  isAuthorized,
  emptyText = "Nenhum documento anexado.",
  bare = false,
  ...rest
}: DocumentListProps) {
  const frame: BoxProps = bare
    ? {}
    : { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", boxShadow: "xs", px: "4", py: "2" };

  if (documents.length === 0) {
    return (
      <Box {...frame} py="4" {...rest}>
        <Text fontSize="sm" color="fg.muted">
          {emptyText}
        </Text>
      </Box>
    );
  }

  return (
    <Box {...frame} {...rest}>
      <List.Root as="ul" listStyleType="none" m="0" p="0">
        {documents.map((doc, i) => {
          const menu: ActionMenuEntry[] = [];
          if (onPreview) menu.push({ value: "preview", label: "Visualizar", icon: Eye, onSelect: () => onPreview(doc) });
          if (canDelete && onDelete) {
            if (menu.length) menu.push({ type: "separator", id: "sep" });
            menu.push({ value: "delete", label: "Excluir", icon: Trash2, destructive: true, onSelect: () => onDelete(doc) });
          }
          return (
            <List.Item
              key={doc.id}
              display="flex"
              alignItems="center"
              gap="2.5"
              py="2"
              borderBottomWidth={i < documents.length - 1 ? "1px" : "0"}
              borderColor="primary.subtle"
            >
              <Flex boxSize="10" flex="none" borderRadius="l2" bg="bg.muted" color="fg.heading" align="center" justify="center">
                <DocIcon name={doc.name} />
              </Flex>
              <Flex flex="1 1 auto" minW="0" direction="column" gap="0.5">
                {onPreview ? (
                  <chakra.button
                    type="button"
                    onClick={() => onPreview(doc)}
                    textAlign="start"
                    fontSize="sm"
                    fontWeight="600"
                    color="fg.heading"
                    cursor="pointer"
                    truncate
                    focusVisibleRing="outside"
                    _hover={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
                  >
                    {doc.name}
                  </chakra.button>
                ) : (
                  <Text fontSize="sm" fontWeight="600" color="fg.heading" truncate>
                    {doc.name}
                  </Text>
                )}
                <Flex align="center" gap="1.5" fontSize="xs" lineHeight="1rem" color="fg.muted" wrap="wrap">
                  <Badge tone="gray">{DOCUMENT_CATEGORY_LABEL[doc.category]}</Badge>
                  <span>
                    {formatFileSize(doc.size)} · {formatDate(doc.uploadedAt)}
                  </span>
                </Flex>
              </Flex>
              <FileDownloadAction
                fileId={doc.id}
                kind="document"
                fileName={doc.name}
                getUrl={getUrl}
                authorized={isAuthorized ? isAuthorized(doc) : true}
                iconOnly
                size="md"
              />
              {menu.length > 0 && <ActionMenu items={menu} label={`Ações de ${doc.name}`} triggerSize="md" />}
            </List.Item>
          );
        })}
      </List.Root>
    </Box>
  );
}
