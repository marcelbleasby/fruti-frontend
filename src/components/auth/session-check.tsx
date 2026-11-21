import { Flex, Spinner, Text } from "@chakra-ui/react";
import { FrutiMark } from "./fruti-mark";

export interface SessionCheckProps {
  label?: string;
  /** Ocupa a tela inteira (padrão) ou só o espaço do container. */
  fullScreen?: boolean;
}

/** Tela de verificação de sessão (usada pelo AuthGuard enquanto carrega). */
export function SessionCheck({ label = "Verificando sua sessão…", fullScreen = true }: SessionCheckProps) {
  return (
    <Flex
      role="status"
      aria-live="polite"
      direction="column"
      align="center"
      justify="center"
      gap="3.5"
      textAlign="center"
      py="3"
      minH={fullScreen ? "100dvh" : undefined}
      bg={fullScreen ? "bg" : undefined}
    >
      <FrutiMark wordmarkSize="lg" />
      <Spinner
        aria-hidden
        boxSize="7"
        borderWidth="4px"
        color="primary"
        css={{ "--spinner-track-color": "colors.green.200" }}
      />
      <Text fontSize="sm" color="fg">
        {label}
      </Text>
    </Flex>
  );
}
