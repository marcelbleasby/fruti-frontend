"use client";

import type { ReactNode } from "react";
import { Alert, type AlertAction, type AlertProps } from "./alert";
import type { FeedbackStatus } from "./status-config";

export interface SystemBannerProps extends Omit<AlertProps, "status" | "title" | "description" | "action"> {
  status: FeedbackStatus;
  title: ReactNode;
  description?: ReactNode;
  action?: AlertAction;
  /** Fixa a faixa no topo do conteúdo (abaixo do AppHeader). Padrão: true. */
  sticky?: boolean;
  /** Deslocamento do topo quando sticky (ex.: altura do AppHeader). */
  stickyTop?: AlertProps["top"];
}

/**
 * Faixa fixa no topo do conteúdo para estados do sistema inteiro
 * (sem conexão, conexão restabelecida, manutenção programada).
 * O resto usa Toast ou Alert.
 */
export function SystemBanner({ sticky = true, stickyTop = "0", ...rest }: SystemBannerProps) {
  return (
    <Alert
      alignItems="center"
      px="4"
      py="3"
      borderRadius="xl"
      {...(sticky ? { position: "sticky", top: stickyTop, zIndex: "banner" } : {})}
      {...rest}
    />
  );
}
