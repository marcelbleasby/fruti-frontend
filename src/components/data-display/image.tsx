"use client";

import { Box, type BoxProps, Flex, Icon, Image as ChakraImage, Text } from "@chakra-ui/react";
import { ImageOff, Image as ImageIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface ImageProps extends Omit<BoxProps, "children"> {
  src?: string | null;
  /** Texto alternativo. Use "" apenas para imagens decorativas. */
  alt: string;
  /** Proporção reservada (largura / altura). Padrão 4/3. Evita salto de layout. */
  ratio?: number;
  fit?: "cover" | "contain";
  /** Texto do espaço reservado quando não há `src`. Padrão: o `alt`. */
  placeholder?: string;
  /** Texto quando a imagem falha ao carregar. */
  fallbackText?: string;
  /** Legenda (renderiza figure/figcaption). */
  caption?: ReactNode;
  /** Carregamento preguiçoso (padrão true). */
  lazy?: boolean;
}

/**
 * Image — proporção reservada (aspect-ratio) e carregamento preguiçoso; raio 8px.
 * Sem `src`: espaço reservado neutro. Erro: fallback tracejado "Imagem indisponível".
 * Chakra v3: Image · aspectRatio · fallback.
 */
export function Image({
  src,
  alt,
  ratio = 4 / 3,
  fit = "cover",
  placeholder,
  fallbackText = "Imagem indisponível",
  caption,
  lazy = true,
  ...rest
}: ImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !!src && failedSrc === src;

  let media: ReactNode;
  if (src && !failed) {
    media = (
      <ChakraImage
        src={src}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        onError={() => setFailedSrc(src)}
        w="full"
        h="full"
        objectFit={fit}
        display="block"
      />
    );
  } else {
    const isError = failed;
    const text = isError ? fallbackText : (placeholder ?? alt);
    media = (
      <Flex
        role="img"
        aria-label={isError ? fallbackText : `Espaço para imagem: ${text}`}
        direction="column"
        align="center"
        justify="center"
        gap="1"
        w="full"
        h="full"
        p="1"
        textAlign="center"
        color="fg.muted"
        fontSize="xs" lineHeight="1rem"
        bg={isError ? "bg" : "bg.muted"}
        borderWidth="1px"
        borderStyle={isError ? "dashed" : "solid"}
        borderColor={isError ? "border.control" : "sage.500"}
        borderRadius="md"
      >
        <Icon boxSize="5">{isError ? <ImageOff strokeWidth={1.75} /> : <ImageIcon strokeWidth={1.75} />}</Icon>
        <Text as="span" aria-hidden="true">
          {text}
        </Text>
      </Flex>
    );
  }

  const frame = (
    <Box aspectRatio={ratio} borderRadius="md" overflow="hidden" {...(caption ? {} : rest)}>
      {media}
    </Box>
  );

  if (!caption) return frame;
  return (
    <Box as="figure" m="0" display="flex" flexDirection="column" gap="1.5" {...rest}>
      {frame}
      <Text as="figcaption" fontSize="xs" lineHeight="1rem" color="fg.muted">
        {caption}
      </Text>
    </Box>
  );
}
