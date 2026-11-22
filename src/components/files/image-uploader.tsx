"use client";

import { ImagePlus } from "lucide-react";
import { useMemo } from "react";
import { FileUpload, type FileUploadProps } from "@/components/forms/file-upload";
import type { EntityRef } from "@/modules/types";
import { IMAGE_ACCEPT, IMAGE_MAX_SIZE, MB } from "./constants";
import { useUploadQueue, type UploadContext } from "@/hooks/useUploadQueue";
import { createFileValidator } from "./file-validator";

export interface ImageUploaderProps<R = unknown>
  extends Pick<FileUploadProps, "label" | "helperText" | "required" | "disabled" | "optional" | "id" | "fieldProps"> {
  /** Registro ao qual as imagens serão vinculadas. */
  entity: EntityRef;
  /**
   * Envia uma imagem (fluxo de imagens: PUT direto na URL pré-assinada; a miniatura
   * é gerada depois). Informe o progresso por `onProgress`; rejeite para marcar erro.
   */
  upload: (file: File, context: UploadContext & { entity: EntityRef }) => Promise<R>;
  onUploaded?: (result: R, file: File) => void;
  /** Tipos aceitos (padrão JPG, PNG, WEBP). */
  accept?: readonly string[];
  /** Tamanho máximo por arquivo em bytes (padrão 10 MB). */
  maxSize?: number;
  /** Máximo de imagens por seleção (padrão 20). */
  maxFiles?: number;
}

/**
 * ImageUploader — envio de imagens com progresso por arquivo, cancelar/tentar de novo
 * e erro de formato em pt-BR. Chakra v3: FileUpload.Root · Dropzone · ItemGroup · Progress.
 */
export function ImageUploader<R = unknown>({
  entity,
  upload,
  onUploaded,
  accept = IMAGE_ACCEPT,
  maxSize = IMAGE_MAX_SIZE,
  maxFiles = 20,
  ...fieldProps
}: ImageUploaderProps<R>) {
  const validate = useMemo(
    () =>
      createFileValidator({
        accept,
        maxSize,
        typeMessage: "Formato não aceito. Converta para JPG ou PNG.",
        sizeMessage: `Imagem maior que ${Math.round(maxSize / MB)} MB. Reduza o tamanho e envie de novo.`,
      }),
    [accept, maxSize],
  );
  const queue = useUploadQueue<R>({
    kind: "image",
    validate,
    onUploaded,
    upload: (file, ctx) => upload(file, { ...ctx, entity }),
  });

  return (
    <FileUpload
      {...fieldProps}
      maxFiles={maxFiles}
      triggerLabel="Selecione imagens"
      hint={`JPG, PNG ou WEBP · até ${Math.round(maxSize / MB)} MB cada`}
      icon={<ImagePlus size={20} strokeWidth={1.75} />}
      onFileAccept={queue.add}
      items={queue.items}
      onCancel={queue.cancel}
      onRetry={queue.retry}
      onRemove={queue.remove}
    />
  );
}
