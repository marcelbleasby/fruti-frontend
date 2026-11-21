"use client";

import type { ReactNode } from "react";
import { toaster } from "@/components/ui/toaster";
import { TOAST_DEFAULT_DURATION, type FeedbackStatus } from "./status-config";

export interface NotificationToastAction {
  label: string;
  onClick: () => void;
}

export interface NotificationToastOptions {
  title: ReactNode;
  description?: ReactNode;
  action?: NotificationToastAction;
  /** Padrão do DS: 5 s para sucesso/informação; erro e toasts com ação ficam até serem fechados. */
  duration?: number;
  /** Reaproveita/atualiza um toast existente com o mesmo id. */
  id?: string;
  closable?: boolean;
}

export interface NotificationToastPromiseOptions<T> {
  loading: Omit<NotificationToastOptions, "action" | "duration">;
  success: NotificationToastOptions | ((value: T) => NotificationToastOptions);
  error: NotificationToastOptions | ((error: unknown) => NotificationToastOptions);
}

/** Regra de duração do DS. */
function resolveDuration(status: FeedbackStatus, options: NotificationToastOptions) {
  if (options.duration !== undefined) return options.duration;
  if (status === "error" || options.action) return Infinity;
  return TOAST_DEFAULT_DURATION;
}

function show(status: FeedbackStatus, options: NotificationToastOptions): string {
  return toaster.create({
    id: options.id,
    type: status,
    title: options.title,
    description: options.description,
    action: options.action,
    closable: options.closable ?? true,
    duration: resolveDuration(status, options),
  });
}

/**
 * Helpers tipados para disparar o NotificationToast do DS via `toaster`.
 * Requer `<Toaster />` (de `@/components/ui/toaster`) montado uma vez na árvore.
 *
 * @example
 * NotificationToast.success({ title: "Plantio salvo", description: "PL-0044 foi cadastrado.",
 *   action: { label: "Ver plantio", onClick: () => router.push("/plantios/PL-0044") } });
 */
export const NotificationToast = {
  show,
  success: (options: NotificationToastOptions) => show("success", options),
  info: (options: NotificationToastOptions) => show("info", options),
  warning: (options: NotificationToastOptions) => show("warning", options),
  error: (options: NotificationToastOptions) => show("error", options),
  /** O mesmo toast muda de estado (carregando → sucesso/erro); não abre um segundo. */
  promise<T>(promise: Promise<T> | (() => Promise<T>), options: NotificationToastPromiseOptions<T>) {
    const toOptions = (status: FeedbackStatus, o: NotificationToastOptions) => ({
      title: o.title,
      description: o.description,
      action: o.action,
      closable: o.closable ?? true,
      duration: resolveDuration(status, o),
    });
    return toaster.promise(promise, {
      loading: { title: options.loading.title, description: options.loading.description, closable: false },
      success: (value: T) =>
        toOptions("success", typeof options.success === "function" ? options.success(value) : options.success),
      error: (err: unknown) =>
        toOptions("error", typeof options.error === "function" ? options.error(err) : options.error),
    });
  },
  dismiss: (id?: string) => toaster.dismiss(id),
} as const;

export type NotificationToastApi = typeof NotificationToast;
