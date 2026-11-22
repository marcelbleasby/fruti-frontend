"use client";

import { Button, Flex, Skeleton, Stack } from "@chakra-ui/react";
import { Building2 } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MetricGroup } from "@/components/charts/metric-group";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";

/** Fallback do Suspense: mesmas proporções da tela pronta (evita salto de layout). */
export function EstoqueCarregando() {
  return (
    <Stack gap="4" aria-busy="true" aria-label="Carregando estoque">
      <MetricGroup loading loadingCount={4} minChildWidth="150px" metrics={[]} />
      <Flex gap="3" wrap="wrap">
        <Skeleton h="10" flex="1" minW="240px" />
        <Skeleton h="10" w="220px" />
        <Skeleton h="10" w="160px" />
      </Flex>
      <Skeleton h="420px" borderRadius="xl" />
    </Stack>
  );
}

export function EstoqueErro({
  titulo = "Não foi possível carregar o estoque",
}: {
  titulo?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <ErrorState
      title={titulo}
      description="Seus dados não foram alterados."
      onRetry={() => start(() => router.refresh())}
      retrying={pending}
    />
  );
}

export function EstoqueSemPropriedade({
  descricao = "Cadastre uma propriedade para registrar o estoque.",
}: {
  descricao?: string;
}) {
  return (
    <EmptyState
      variant="first-use"
      icon={Building2}
      title="Cadastre sua propriedade"
      description={descricao}
      actions={
        <Button asChild>
          <NextLink href="/bem-vindo">Cadastrar propriedade</NextLink>
        </Button>
      }
    />
  );
}
