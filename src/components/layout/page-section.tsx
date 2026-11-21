import { Box, Card, Flex, HStack, Stack, type CardRootProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface PageSectionProps extends Omit<CardRootProps, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  /** Ações no canto superior direito (ex.: IconButton "Editar"). */
  actions?: ReactNode;
  /** Nível do título (padrão `h2`). */
  headingAs?: "h2" | "h3" | "h4";
  children?: ReactNode;
}

/** Bloco de conteúdo da página: card com título, descrição opcional e ações. */
export function PageSection({
  title,
  description,
  actions,
  headingAs = "h2",
  children,
  ...rest
}: PageSectionProps) {
  const hasHeader = Boolean(title || description || actions);
  return (
    <Card.Root
      as="section"
      variant="outline"
      layerStyle="surface.card"
      boxShadow="xs"
      p="20px"
      gap="16px"
      {...rest}
    >
      {hasHeader ? (
        <Card.Header p="0">
          <Flex justify="space-between" align="flex-start" gap="8px">
            <Stack gap="4px" minW="0">
              {title ? (
                <Card.Title
                  as={headingAs}
                  m="0"
                  textStyle="heading.md"
                  color="fg.heading"
                >
                  {title}
                </Card.Title>
              ) : null}
              {description ? (
                <Card.Description m="0" textStyle="body.sm" color="fg.muted">
                  {description}
                </Card.Description>
              ) : null}
            </Stack>
            {actions ? (
              <HStack gap="4px" flexShrink={0}>
                {actions}
              </HStack>
            ) : null}
          </Flex>
        </Card.Header>
      ) : null}
      <Card.Body p="0">
        <Box minW="0">{children}</Box>
      </Card.Body>
    </Card.Root>
  );
}
