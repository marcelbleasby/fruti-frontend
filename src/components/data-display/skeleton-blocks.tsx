import { Box, type BoxProps, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { Skeleton, SkeletonCircle } from "./skeleton";

/*
 * Blocos de Skeleton com o mesmo formato do conteúdo final.
 * São decorativos (aria-hidden): o anúncio "carregando" fica a cargo do LoadingState
 * ou do contêiner com aria-busy.
 */

const blockFrame = {
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "2xl",
  bg: "bg.panel",
  p: "3.5",
} as const;

/** Formato do MetricCard: rótulo, valor, ajuda e gráfico. */
export function SkeletonMetricCard(props: BoxProps) {
  return (
    <Box aria-hidden="true" display="flex" flexDirection="column" gap="2" {...blockFrame} {...props}>
      <Skeleton w="40%" h="12px" />
      <Skeleton w="70%" h="28px" />
      <Skeleton w="90%" h="12px" />
      <Skeleton w="full" h="40px" borderRadius="md" />
    </Box>
  );
}

export interface SkeletonListProps extends BoxProps {
  /** Número de linhas. Padrão 3. */
  rows?: number;
  /** Mostra o círculo (avatar/ícone) à esquerda. Padrão true. */
  withAvatar?: boolean;
}

/** Formato de lista: círculo de 36px + duas linhas de texto. */
export function SkeletonList({ rows = 3, withAvatar = true, ...props }: SkeletonListProps) {
  return (
    <Box aria-hidden="true" display="flex" flexDirection="column" gap="2.5" {...blockFrame} {...props}>
      {Array.from({ length: rows }, (_, i) => (
        <Flex key={i} align="center" gap="2.5">
          {withAvatar && <SkeletonCircle size="36px" />}
          <Stack flex="1" gap="1.5">
            <Skeleton w="70%" h="12px" />
            <Skeleton w="45%" h="8px" />
          </Stack>
        </Flex>
      ))}
    </Box>
  );
}

export interface SkeletonTableRowsProps extends BoxProps {
  /** Número de linhas. Padrão 3. */
  rows?: number;
}

/** Formato de tabela/lista de registros: código, título + subtítulo, badge de status. */
export function SkeletonTableRows({ rows = 3, ...props }: SkeletonTableRowsProps) {
  return (
    <Box
      aria-hidden="true"
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      px="3.5"
      py="1"
      {...props}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Flex
          key={i}
          align="center"
          gap="3.5"
          py="3"
          borderBottomWidth={i === rows - 1 ? "0" : "1px"}
          borderColor="green.100"
        >
          <Skeleton w="64px" h="12px" />
          <Stack flex="1" gap="1.5">
            <Skeleton w="55%" h="12px" />
            <Skeleton w="30%" h="12px" />
          </Stack>
          <Skeleton w="72px" h="24px" />
        </Flex>
      ))}
    </Box>
  );
}

export interface SkeletonDetailsProps extends BoxProps {
  /** Número de pares rótulo/valor. Padrão 6. */
  rows?: number;
  columns?: 1 | 2 | 3;
}

/** Formato do RecordDetails: pares rótulo/valor em grade. */
export function SkeletonDetails({ rows = 6, columns = 2, ...props }: SkeletonDetailsProps) {
  return (
    <Box aria-hidden="true" {...blockFrame} borderRadius="l3" p="4.5" {...props}>
      <SimpleGrid columns={{ base: 1, md: columns }} columnGap="5" rowGap="3.5">
        {Array.from({ length: rows }, (_, i) => (
          <Stack key={i} gap="1.5">
            <Skeleton w="40%" h="12px" />
            <Skeleton w="70%" h="16px" />
          </Stack>
        ))}
      </SimpleGrid>
    </Box>
  );
}

/** Uma linha de texto em skeleton, para estados "inline" (dentro de frases/células). */
export function SkeletonInline(props: BoxProps) {
  return <Skeleton aria-hidden="true" display="inline-block" verticalAlign="middle" w="80px" h="12px" {...props} />;
}
