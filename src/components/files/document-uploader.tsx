"use client";

import { Stack } from "@chakra-ui/react";
import { FileUp } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { FileUpload } from "@/components/forms/file-upload";
import { NativeSelectField } from "@/components/forms/native-select-field";
import type { FieldOption } from "@/components/forms/types";
import type { DocumentCategory, EntityRef } from "@/modules/types";
import { DOCUMENT_ACCEPT, DOCUMENT_CATEGORY_OPTIONS, DOCUMENT_MAX_SIZE, MB } from "./constants";
import { createFileValidator, useUploadQueue, type UploadContext } from "./use-upload-queue";

export interface DocumentUploaderProps<R = unknown> {
  /** Registro ao qual os documentos serão vinculados. */
  entity: EntityRef;
  /**
   * Envia um documento (fluxo de documentos: arquivo privado; só o backend gera o acesso).
   * Informe o progresso por `onProgress`; rejeite para marcar erro.
   */
  upload: (file: File, context: UploadContext & { entity: EntityRef; category: DocumentCategory }) => Promise<R>;
  onUploaded?: (result: R, file: File, category: DocumentCategory) => void;
  /** Categorias disponíveis (padrão: nota fiscal, laudo, croqui, contrato, outro). */
  categories?: FieldOption[];
  /** Categoria inicial (padrão: nenhuma — o envio fica bloqueado até escolher). */
  defaultCategory?: DocumentCategory;
  accept?: readonly string[];
  /** Tamanho máximo em bytes (padrão 20 MB). */
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * DocumentUploader — categoria obrigatória + envio de PDF, DOCX ou XLSX.
 * Chakra v3: FileUpload.Root · NativeSelect (categoria).
 */
export function DocumentUploader<R = unknown>({
  entity,
  upload,
  onUploaded,
  categories = DOCUMENT_CATEGORY_OPTIONS,
  defaultCategory,
  accept = DOCUMENT_ACCEPT,
  maxSize = DOCUMENT_MAX_SIZE,
  maxFiles = 10,
  disabled,
}: DocumentUploaderProps<R>) {
  const uid = useId();
  const [category, setCategory] = useState<DocumentCategory | "">(defaultCategory ?? "");
  const validate = useMemo(
    () =>
      createFileValidator({
        accept,
        maxSize,
        typeMessage: "Formato não aceito. Envie PDF, DOCX ou XLSX.",
        sizeMessage: `Documento maior que ${Math.round(maxSize / MB)} MB.`,
      }),
    [accept, maxSize],
  );
  const queue = useUploadQueue<{ result: R; category: DocumentCategory }>({
    kind: "document",
    validate,
    onUploaded: onUploaded ? ({ result, category: c }, file) => onUploaded(result, file, c) : undefined,
    upload: async (file, ctx) => {
      // A categoria vigente no momento da seleção acompanha o arquivo.
      const c = (category || "outro") as DocumentCategory;
      const result = await upload(file, { ...ctx, entity, category: c });
      return { result, category: c };
    },
  });

  const noCategory = category === "";

  return (
    <Stack gap="3">
      <NativeSelectField
        id={`${uid}-category`}
        label="Categoria"
        required
        placeholder="Selecione a categoria"
        options={categories}
        value={category}
        onChange={(e) => setCategory(e.currentTarget.value as DocumentCategory | "")}
        disabled={disabled}
        helperText={noCategory ? "Escolha a categoria antes de anexar o documento." : undefined}
      />
      <FileUpload
        id={`${uid}-file`}
        disabled={disabled || noCategory}
        maxFiles={maxFiles}
        triggerLabel="Selecione um documento"
        hint={`PDF, DOCX ou XLSX · até ${Math.round(maxSize / MB)} MB`}
        icon={<FileUp size={20} strokeWidth={1.75} />}
        onFileAccept={queue.add}
        items={queue.items}
        onCancel={queue.cancel}
        onRetry={queue.retry}
        onRemove={queue.remove}
      />
    </Stack>
  );
}
