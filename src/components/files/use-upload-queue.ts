"use client";

import { useCallback, useRef, useState } from "react";
import type { FileUploadItem } from "@/components/forms/file-upload";

export interface UploadContext {
  /** Informe o progresso (0–100). */
  onProgress: (percent: number) => void;
  /** Cancelado pelo usuário. */
  signal: AbortSignal;
}

/** Envio de um arquivo (ex.: PUT na URL pré-assinada). Rejeite para marcar erro. */
export type UploadFn<R = unknown> = (file: File, context: UploadContext) => Promise<R>;

export interface UseUploadQueueOptions<R> {
  upload: UploadFn<R>;
  /** Mensagem de erro em pt-BR, ou null quando o arquivo é válido. */
  validate?: (file: File) => string | null;
  kind: "image" | "document";
  onUploaded?: (result: R, file: File) => void;
  /** Mensagem genérica quando `upload` falha. */
  failureMessage?: string;
}

/**
 * Fila de envios com progresso, cancelar, tentar de novo e validação própria.
 * O FileUpload do Chakra entrega a lista acumulada de aceitos; a fila ignora
 * arquivos já vistos (WeakSet), então cada arquivo entra uma única vez.
 */
export function useUploadQueue<R>({ upload, validate, kind, onUploaded, failureMessage = "Falha no envio. Tente de novo." }: UseUploadQueueOptions<R>) {
  const [items, setItems] = useState<FileUploadItem[]>([]);
  const files = useRef(new Map<string, File>());
  const controllers = useRef(new Map<string, AbortController>());
  const seen = useRef(new WeakSet<File>());
  const counter = useRef(0);

  const patch = useCallback((id: string, next: Partial<FileUploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...next } : item)));
  }, []);

  const start = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      if (!file) return;
      const controller = new AbortController();
      controllers.current.set(id, controller);
      patch(id, { status: "uploading", progress: 0, error: undefined });
      upload(file, {
        signal: controller.signal,
        onProgress: (p) => patch(id, { progress: Math.max(0, Math.min(100, p)) }),
      })
        .then((result) => {
          controllers.current.delete(id);
          patch(id, { status: "done", progress: 100 });
          onUploaded?.(result, file);
        })
        .catch(() => {
          controllers.current.delete(id);
          if (controller.signal.aborted) return;
          patch(id, { status: "error", error: failureMessage });
        });
    },
    [upload, onUploaded, patch, failureMessage],
  );

  const add = useCallback(
    (incoming: File[]) => {
      const fresh = incoming.filter((f) => !seen.current.has(f));
      if (fresh.length === 0) return;
      const created: FileUploadItem[] = [];
      const toStart: string[] = [];
      for (const file of fresh) {
        seen.current.add(file);
        counter.current += 1;
        const id = `up-${counter.current}`;
        files.current.set(id, file);
        const error = validate?.(file) ?? null;
        created.push(error ? { id, name: file.name, kind, status: "error", error } : { id, name: file.name, kind, status: "uploading", progress: 0 });
        if (!error) toStart.push(id);
      }
      setItems((prev) => [...prev, ...created]);
      toStart.forEach(start);
    },
    [validate, kind, start],
  );

  const remove = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    files.current.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const retry = useCallback(
    (id: string) => {
      const file = files.current.get(id);
      if (!file) return;
      const error = validate?.(file) ?? null;
      if (error) patch(id, { status: "error", error });
      else start(id);
    },
    [validate, start, patch],
  );

  return { items, add, cancel: remove, remove, retry };
}

/** Valida tipo (MIME ou extensão) e tamanho. */
export function createFileValidator(opts: {
  accept: readonly string[];
  maxSize: number;
  typeMessage: string;
  sizeMessage: string;
}) {
  return (file: File): string | null => {
    const name = file.name.toLowerCase();
    const okType = opts.accept.some((a) => (a.startsWith(".") ? name.endsWith(a) : file.type === a));
    if (!okType) return opts.typeMessage;
    if (file.size > opts.maxSize) return opts.sizeMessage;
    return null;
  };
}
