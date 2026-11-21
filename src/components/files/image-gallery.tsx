"use client";

import { Box, Flex, Heading, SimpleGrid, Text, chakra, type BoxProps } from "@chakra-ui/react";
import type { HeadingLevel } from "@/components/data-display/heading-level";
import { Image as ImageIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ImageRef } from "@/modules/types";

export interface ImageGalleryProps extends Omit<BoxProps, "children" | "title"> {
  images: ImageRef[];
  /** Colunas a partir de `md` (no mobile, 2). Padrão 3. */
  columns?: 2 | 3 | 4;
  /** Abre a pré-visualização na imagem `index`. */
  onOpen?: (index: number) => void;
  /** Total de blocos visíveis; o último vira "+N imagens" quando há mais imagens. */
  maxVisible?: number;
  /** Ação do bloco "+N imagens" (padrão: abre a primeira imagem oculta). */
  onShowAll?: () => void;
  /** Título (padrão "Imagens"). `null` esconde o cabeçalho. */
  title?: ReactNode | null;
  /** Nível do título (o tamanho vem do papel, não do nível). Padrão h3. */
  headingAs?: HeadingLevel;
  /** Ação no cabeçalho (ex.: botão Adicionar). */
  action?: ReactNode;
  /** Proporção reservada (padrão 4/3). */
  ratio?: number;
  /** Sem moldura de card (dentro de outra seção). */
  bare?: boolean;
  emptyText?: string;
}

function Thumb({ image, ratio }: { image: ImageRef; ratio: number }) {
  return image.src ? (
    <chakra.img
      src={image.src}
      alt=""
      loading="lazy"
      decoding="async"
      w="full"
      aspectRatio={ratio}
      objectFit="cover"
      display="block"
      borderRadius="l2"
      bg="bg.muted"
    />
  ) : (
    <Flex
      aspectRatio={ratio}
      w="full"
      direction="column"
      align="center"
      justify="center"
      gap="1"
      p="1"
      borderRadius="l2"
      bg="bg.muted"
      borderWidth="1px"
      borderColor="border.muted"
      color="fg.muted"
      fontSize="xs" lineHeight="1rem"
      textAlign="center"
    >
      <ImageIcon size={20} strokeWidth={1.75} aria-hidden="true" />
      <span>{image.caption ?? image.alt}</span>
    </Flex>
  );
}

/**
 * ImageGallery — grade de miniaturas com proporção reservada e carregamento
 * preguiçoso (sem saltos de layout). Cada miniatura é um botão que abre a pré-visualização.
 * Chakra v3: SimpleGrid · Image (aspect-ratio, lazy) · Button.
 */
export function ImageGallery({
  images,
  columns = 3,
  onOpen,
  maxVisible,
  onShowAll,
  title = "Imagens",
  headingAs = "h3",
  action,
  ratio = 4 / 3,
  bare = false,
  emptyText = "Nenhuma imagem enviada.",
  ...rest
}: ImageGalleryProps) {
  const overflow = maxVisible != null && images.length > maxVisible;
  const shown = overflow ? images.slice(0, Math.max(0, maxVisible - 1)) : images;
  const hidden = images.length - shown.length;
  const count = `${images.length} ${images.length === 1 ? "imagem" : "imagens"}`;

  const frame: BoxProps = bare
    ? {}
    : { bg: "bg.panel", borderWidth: "1px", borderColor: "border", borderRadius: "l3", boxShadow: "xs", p: "4" };

  return (
    <Box as="section" display="flex" flexDirection="column" gap="3.5" {...frame} {...rest}>
      {title !== null && (
        <Flex justify="space-between" align="center" gap="3">
          <Heading as={headingAs} textStyle="heading.sm" color="fg.heading" m="0">
            {title}
          </Heading>
          <Flex align="center" gap="3">
            <Text fontSize="sm" color="fg.muted">
              {count}
            </Text>
            {action}
          </Flex>
        </Flex>
      )}
      {images.length === 0 ? (
        <Text fontSize="sm" color="fg.muted">
          {emptyText}
        </Text>
      ) : (
        <SimpleGrid as="ul" columns={{ base: 2, md: columns }} gap="2" m="0" p="0" listStyleType="none">
          {shown.map((image, index) => (
            <chakra.li key={image.id} display="flex" flexDirection="column" gap="1" minW="0">
              {onOpen ? (
                <chakra.button
                  type="button"
                  onClick={() => onOpen(index)}
                  aria-label={`Abrir imagem: ${image.alt}`}
                  p="0"
                  borderRadius="l2"
                  cursor="zoom-in"
                  focusVisibleRing="outside"
                  transition="opacity 150ms"
                  _hover={{ opacity: 0.9 }}
                >
                  <Thumb image={image} ratio={ratio} />
                </chakra.button>
              ) : (
                <Box role="img" aria-label={image.alt}>
                  <Thumb image={image} ratio={ratio} />
                </Box>
              )}
              {image.src && image.caption && (
                <Text fontSize="xs" lineHeight="1rem" color="fg.muted" truncate>
                  {image.caption}
                </Text>
              )}
            </chakra.li>
          ))}
          {overflow && (
            <chakra.li>
              <chakra.button
                type="button"
                onClick={onShowAll ?? (() => onOpen?.(shown.length))}
                w="full"
                aspectRatio={ratio}
                borderRadius="l2"
                borderWidth="1px"
                borderColor="border.control"
                bg="bg.panel"
                color="fg.heading"
                fontSize="sm"
                fontWeight="600"
                cursor="pointer"
                focusVisibleRing="outside"
                _hover={{ bg: "bg.subtle" }}
              >
                +{hidden} {hidden === 1 ? "imagem" : "imagens"}
              </chakra.button>
            </chakra.li>
          )}
        </SimpleGrid>
      )}
    </Box>
  );
}
