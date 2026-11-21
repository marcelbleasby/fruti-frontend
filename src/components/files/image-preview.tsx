"use client";

import { Dialog, Flex, IconButton, Portal, Text, chakra } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import type { KeyboardEvent } from "react";
import type { ImageRef } from "@/modules/types";

export interface ImagePreviewProps {
  images: ImageRef[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onClose: () => void;
  /** Mostra o botão "Baixar imagem". */
  onDownload?: (image: ImageRef) => void;
  /** Elemento que recebe o foco ao fechar (padrão: o que abriu — a miniatura). */
  finalFocusEl?: () => HTMLElement | null;
}

const glassButton = {
  bg: "whiteAlpha.100",
  color: "white",
  _hover: { bg: "whiteAlpha.200" },
  focusVisibleRing: "outside",
  focusRingColor: "green.200",
} as const;

/**
 * ImagePreview — visualização em tela cheia com anterior/próxima. Setas do teclado
 * navegam; Esc fecha e devolve o foco à miniatura de origem.
 * Chakra v3: Dialog (size cover) · IconButton · Image.
 */
export function ImagePreview({ images, index, onIndexChange, open, onClose, onDownload, finalFocusEl }: ImagePreviewProps) {
  const total = images.length;
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  const go = (next: number) => {
    if (next >= 0 && next < total) onIndexChange(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  };

  return (
    <Dialog.Root
      open={open && Boolean(image)}
      onOpenChange={(d) => !d.open && onClose()}
      size="cover"
      placement="center"
      finalFocusEl={finalFocusEl}
    >
      <Portal>
        <Dialog.Backdrop bg="green.950/80" />
        <Dialog.Positioner p={{ base: "0", md: "6" }}>
          <Dialog.Content
            bg="green.950"
            color="green.100"
            borderRadius={{ base: "0", md: "l3" }}
            p="3"
            gap="2.5"
            display="flex"
            flexDirection="column"
            onKeyDown={handleKeyDown}
          >
            {image && (
              <>
                <Flex justify="space-between" align="center" gap="2">
                  <Text fontSize="sm" aria-live="polite">
                    {index + 1} de {total}
                  </Text>
                  <Dialog.Title srOnly>{image.alt}</Dialog.Title>
                  <Flex gap="1">
                    {onDownload && (
                      <IconButton aria-label="Baixar imagem" size="md" css={glassButton} onClick={() => onDownload(image)}>
                        <Download size={20} strokeWidth={1.75} aria-hidden="true" />
                      </IconButton>
                    )}
                    <Dialog.CloseTrigger asChild position="static">
                      <IconButton aria-label="Fechar visualização" size="md" css={glassButton}>
                        <X size={20} strokeWidth={1.75} aria-hidden="true" />
                      </IconButton>
                    </Dialog.CloseTrigger>
                  </Flex>
                </Flex>
                <Flex flex="1" minH="0" align="center" gap="2">
                  <IconButton
                    aria-label="Imagem anterior"
                    borderRadius="full"
                    boxSize="11"
                    flex="none"
                    css={glassButton}
                    disabled={!hasPrev}
                    onClick={() => go(index - 1)}
                  >
                    <ChevronLeft size={24} strokeWidth={1.75} aria-hidden="true" />
                  </IconButton>
                  <Flex flex="1" minW="0" h="full" align="center" justify="center">
                    {image.src ? (
                      <chakra.img
                        key={image.id}
                        src={image.src}
                        alt={image.alt}
                        maxW="full"
                        maxH={{ base: "calc(100dvh - 160px)", md: "calc(100dvh - 200px)" }}
                        objectFit="contain"
                        borderRadius="l2"
                      />
                    ) : (
                      <Flex
                        role="img"
                        aria-label={image.alt}
                        w="full"
                        aspectRatio={4 / 3}
                        maxH="full"
                        align="center"
                        justify="center"
                        borderRadius="l2"
                        bg="#1F3B2B"
                        color="green.200"
                        fontSize="sm"
                      >
                        {image.caption ?? image.alt}
                      </Flex>
                    )}
                  </Flex>
                  <IconButton
                    aria-label="Próxima imagem"
                    borderRadius="full"
                    boxSize="11"
                    flex="none"
                    css={glassButton}
                    disabled={!hasNext}
                    onClick={() => go(index + 1)}
                  >
                    <ChevronRight size={24} strokeWidth={1.75} aria-hidden="true" />
                  </IconButton>
                </Flex>
                {(image.description ?? image.caption) && (
                  <Dialog.Description fontSize="sm" color="green.100">
                    {image.description ?? image.caption}
                  </Dialog.Description>
                )}
              </>
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
