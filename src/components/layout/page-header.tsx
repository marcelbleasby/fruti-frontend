import { Box, Flex, Heading, HStack, Stack, Text, type StackProps } from "@chakra-ui/react";
import { isValidElement, type ReactNode } from "react";
import { Breadcrumb, type BreadcrumbLinkItem } from "./breadcrumb";

export interface PageHeaderProps extends Omit<StackProps, "title" | "children"> {
  title: ReactNode;
  description?: ReactNode;
  /** Botões da página. Uma ação primária; as demais em outline ou no menu de mais ações. */
  actions?: ReactNode;
  /** Selo ao lado do título (ex.: `<StatusBadge status="active" />`). */
  status?: ReactNode;
  /** Itens do caminho ou um nó pronto. Some abaixo de 768 px. */
  breadcrumb?: BreadcrumbLinkItem[] | ReactNode;
  /** Nível do título (padrão `h1`). */
  headingAs?: "h1" | "h2";
}

/** Cabeçalho da página: breadcrumb, título + status, descrição e ações. */
export function PageHeader({
  title,
  description,
  actions,
  status,
  breadcrumb,
  headingAs = "h1",
  ...rest
}: PageHeaderProps) {
  const isItemList =
    Array.isArray(breadcrumb) &&
    breadcrumb.every(
      (entry: unknown) =>
        typeof entry === "object" && entry !== null && !isValidElement(entry) && "label" in entry,
    );
  const crumbs =
    isItemList ? (
      <Breadcrumb items={breadcrumb as BreadcrumbLinkItem[]} />
    ) : (
      (breadcrumb as ReactNode)
    );

  return (
    <Stack gap="12px" {...rest}>
      {crumbs ? <Box>{crumbs}</Box> : null}
      <Flex wrap="wrap" align="flex-end" justify="space-between" gap="12px">
        <Stack gap="4px" minW="0" flex="1 1 280px">
          <HStack gap="12px" wrap="wrap">
            <Heading
              as={headingAs}
              m="0"
              textStyle="heading.xl"
              fontSize={{ base: "2xl", md: "3xl" }}
              color="fg.heading"
            >
              {title}
            </Heading>
            {status}
          </HStack>
          {description ? (
            <Text m="0" textStyle="body.sm" color="fg.muted">
              {description}
            </Text>
          ) : null}
        </Stack>
        {actions ? (
          <HStack gap="8px" wrap="wrap" flexShrink={0}>
            {actions}
          </HStack>
        ) : null}
      </Flex>
    </Stack>
  );
}
