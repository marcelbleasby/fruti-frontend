import { Breadcrumb as ChakraBreadcrumb, Text, type BreadcrumbRootProps } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import NextLink from "next/link";
import { Fragment } from "react";

export interface BreadcrumbLinkItem {
  label: string;
  /** Sem `href`, o item é a página atual (normalmente o último). */
  href?: string;
  /** Exibe em Fira Code (identificadores como "PL-0042"). */
  mono?: boolean;
}

export interface BreadcrumbProps extends Omit<BreadcrumbRootProps, "children"> {
  items: BreadcrumbLinkItem[];
  /** Esconde abaixo de 768 px: no mobile o botão voltar cumpre o papel (padrão: true). */
  hideOnMobile?: boolean;
  "aria-label"?: string;
}

/** Caminho de navegação. O último item (ou o sem `href`) é a página atual. */
export function Breadcrumb({
  items,
  hideOnMobile = true,
  "aria-label": ariaLabel = "Caminho de navegação",
  ...rest
}: BreadcrumbProps) {
  if (items.length === 0) return null;
  return (
    <ChakraBreadcrumb.Root
      aria-label={ariaLabel}
      hideBelow={hideOnMobile ? "md" : undefined}
      {...rest}
    >
      <ChakraBreadcrumb.List gap="8px" flexWrap="wrap" textStyle="body.sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = isLast || !item.href;
          const label = item.mono ? (
            <Text as="span" textStyle="code" color={isCurrent ? "fg.heading" : undefined}>
              {item.label}
            </Text>
          ) : (
            item.label
          );
          return (
            <Fragment key={`${item.label}-${index}`}>
              <ChakraBreadcrumb.Item>
                {isCurrent ? (
                  <ChakraBreadcrumb.CurrentLink color="fg.heading" fontWeight="600">
                    {label}
                  </ChakraBreadcrumb.CurrentLink>
                ) : (
                  <ChakraBreadcrumb.Link
                    asChild
                    color="fg.muted"
                    textDecoration="none"
                    borderRadius="l1"
                    _hover={{ color: "fg.heading", textDecoration: "underline" }}
                    focusVisibleRing="outside"
                  >
                    <NextLink href={item.href!}>{label}</NextLink>
                  </ChakraBreadcrumb.Link>
                )}
              </ChakraBreadcrumb.Item>
              {!isLast ? (
                <ChakraBreadcrumb.Separator color="fg.muted">
                  <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" />
                </ChakraBreadcrumb.Separator>
              ) : null}
            </Fragment>
          );
        })}
      </ChakraBreadcrumb.List>
    </ChakraBreadcrumb.Root>
  );
}
