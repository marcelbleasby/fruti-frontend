"use client";

import {
  Box,
  Toaster as ChakraToaster,
  Icon,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";
import { X } from "lucide-react";
import {
  TOAST_DEFAULT_DURATION,
  feedbackStatusStyles,
  type FeedbackStatus,
} from "@/components/feedback/status-config";

/**
 * Toaster global do Fruti.
 * Pilha no canto inferior direito, no máximo 3 visíveis, a mais nova embaixo.
 * Para disparar com as regras do DS (duração, role), prefira `NotificationToast`
 * de `@/components/feedback`.
 */
export const toaster = createToaster({
  placement: "bottom-end",
  max: 3,
  gap: 12,
  overlap: false,
  duration: TOAST_DEFAULT_DURATION,
  pauseOnPageIdle: true,
});

const isFeedbackStatus = (type: unknown): type is FeedbackStatus =>
  type === "success" || type === "error" || type === "warning" || type === "info";

/** Renderiza os toasts do `toaster`. Monte uma vez, dentro do Provider. */
export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster} insetInline={{ mdDown: "4" }} label="Notificações">
        {(toast) => {
          const status = isFeedbackStatus(toast.type) ? toast.type : "info";
          const style = feedbackStatusStyles[status];
          const isLoading = toast.type === "loading";
          const duration = toast.duration ?? TOAST_DEFAULT_DURATION;
          const showProgress = !isLoading && Number.isFinite(duration);

          return (
            <Toast.Root
              role={isLoading || style.role === "status" ? "status" : "alert"}
              width={{ md: "sm" }}
              overflow="hidden"
              alignItems="flex-start"
              gap="3"
              py="3.5"
              ps="3.5"
              pe="2.5"
              bg="bg.panel"
              color="fg"
              borderWidth="1px"
              borderColor="border"
              borderRadius="2xl"
              boxShadow="lg"
              focusVisibleRing="outside"
              style={{ ["--toast-total" as string]: `${duration}ms` }}
            >
              {isLoading ? (
                <Box boxSize="8" flex="none" display="flex" alignItems="center" justifyContent="center">
                  <Spinner size="sm" color="primary" borderWidth="2px" css={{ "--spinner-track-color": "colors.green.200" }} />
                </Box>
              ) : (
                <Box
                  as="span"
                  boxSize="8"
                  flex="none"
                  borderRadius="lg"
                  bg={style.iconBg}
                  color={style.iconColor}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={style.icon} boxSize="4" strokeWidth={1.75} aria-hidden />
                </Box>
              )}

              <Stack gap="0.5" flex="1" minW="0" alignSelf="center">
                {toast.title && (
                  <Toast.Title fontSize="sm" fontWeight="600" color="fg" marginEnd="0">
                    {toast.title}
                  </Toast.Title>
                )}
                {toast.description && (
                  <Toast.Description display="block" textStyle="body.sm" color="fg.muted" opacity="1">
                    {toast.description}
                  </Toast.Description>
                )}
              </Stack>

              {toast.action && (
                <Toast.ActionTrigger
                  flex="none"
                  alignSelf="center"
                  minH="8"
                  height="auto"
                  px="3"
                  borderRadius="l2"
                  borderWidth="1px"
                  borderColor="border.control"
                  bg="bg.panel"
                  color="fg.heading"
                  fontSize="sm"
                  fontWeight="600"
                  cursor="pointer"
                  _hover={{ bg: "bg.hover" }}
                  focusVisibleRing="outside"
                >
                  {toast.action.label}
                </Toast.ActionTrigger>
              )}

              {toast.closable !== false && !isLoading && (
                <Toast.CloseTrigger
                  aria-label="Fechar notificação"
                  position="static"
                  flex="none"
                  alignSelf="center"
                  boxSize="8"
                  padding="0"
                  borderRadius="l2"
                  color="fg.muted"
                  cursor="pointer"
                  _hover={{ bg: "bg.hover", color: "fg" }}
                  focusVisibleRing="outside"
                >
                  <Icon as={X} boxSize="4" strokeWidth={1.75} aria-hidden />
                </Toast.CloseTrigger>
              )}

              {showProgress && (
                <Box aria-hidden position="absolute" insetX="0" bottom="0" height="1" bg="bg.muted">
                  <Box
                    height="full"
                    bg={style.progress}
                    css={{
                      "--width": "100%",
                      "--collapsed-width": "0%",
                      animationName: "collapse-width",
                      animationDuration: "var(--toast-total)",
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                      "[data-paused] &": { animationPlayState: "paused" },
                    }}
                  />
                </Box>
              )}
            </Toast.Root>
          );
        }}
      </ChakraToaster>
    </Portal>
  );
}
