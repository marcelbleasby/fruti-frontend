"use client";

import { Skeleton, Stack } from "@chakra-ui/react";
import dynamic from "next/dynamic";

/**
 * A vitrine é 100% cliente: a seção ativa vem do hash, que o servidor não
 * conhece. Sem SSR não há hidratação a conciliar (evita mismatch em loop);
 * o HTML estático entrega só o esqueleto.
 */
export const ShowcaseClient = dynamic(() => import("./showcase-page").then((m) => m.ShowcasePage), {
  ssr: false,
  loading: () => (
    <Stack gap="4" maxW="1440px" mx="auto" px={{ base: "4", md: "8" }} py="8" aria-busy="true" aria-label="Carregando componentes">
      <Skeleton h="9" w="320px" />
      <Skeleton h="5" w="50%" />
      <Skeleton h="320px" />
    </Stack>
  ),
});
