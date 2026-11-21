import {
  CircleCheck,
  CircleExclamationPoint,
  Info,
  TriangleExclamationPoint,
  type LucideIcon,
} from "lucide-react";

/** Status compartilhado por Toast, Alert e SystemBanner. */
export type FeedbackStatus = "success" | "error" | "warning" | "info";

export interface FeedbackStatusStyle {
  icon: LucideIcon;
  /** colorPalette do tema que corresponde ao status. */
  colorPalette: "green" | "red" | "harvest" | "sky";
  /** Quadrado do ícone (toast / central de notificações). */
  iconBg: string;
  iconColor: string;
  /** Barra de tempo do toast. */
  progress: string;
  /** Superfície de Alert / SystemBanner. */
  surfaceBg: string;
  surfaceBorder: string;
  surfaceFg: string;
  /** role ARIA: status para sucesso/informação, alert para aviso/erro. */
  role: "status" | "alert";
}

export const feedbackStatusStyles: Record<FeedbackStatus, FeedbackStatusStyle> = {
  success: {
    icon: CircleCheck,
    colorPalette: "green",
    iconBg: "green.100",
    iconColor: "green.700",
    progress: "green.700",
    surfaceBg: "green.100",
    surfaceBorder: "green.300",
    surfaceFg: "green.900",
    role: "status",
  },
  info: {
    icon: Info,
    colorPalette: "sky",
    iconBg: "sky.100",
    iconColor: "sky.800",
    progress: "sky.800",
    surfaceBg: "sky.100",
    surfaceBorder: "sky.300",
    surfaceFg: "sky.800",
    role: "status",
  },
  warning: {
    icon: TriangleExclamationPoint,
    colorPalette: "harvest",
    iconBg: "harvest.100",
    iconColor: "harvest.700",
    progress: "harvest.700",
    surfaceBg: "harvest.100",
    surfaceBorder: "harvest.300",
    surfaceFg: "harvest.900",
    role: "alert",
  },
  error: {
    icon: CircleExclamationPoint,
    colorPalette: "red",
    iconBg: "red.100",
    iconColor: "red.700",
    progress: "red.700",
    surfaceBg: "red.100",
    surfaceBorder: "red.300",
    surfaceFg: "red.800",
    role: "alert",
  },
};

/** Duração padrão do DS: sucesso/informação somem em 5 s. */
export const TOAST_DEFAULT_DURATION = 5000;
