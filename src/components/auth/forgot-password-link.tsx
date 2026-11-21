"use client";

import { Link } from "@chakra-ui/react";
import type { ElementType } from "react";

/** Link "Esqueci minha senha" — `href` (com `linkAs`, ex.: next/link) ou `onClick`. */
export function ForgotPasswordLink({
  href,
  onClick,
  linkAs,
}: {
  href?: string;
  onClick?: () => void;
  linkAs?: ElementType;
}) {
  if (!href && !onClick) return null;
  return (
    <Link
      as={href ? linkAs ?? "a" : "button"}
      {...(href ? { href } : { type: "button" })}
      onClick={onClick}
      fontSize="sm"
      fontWeight="600"
      color="primary"
      textDecoration="underline"
      textUnderlineOffset="4px"
      focusVisibleRing="outside"
    >
      Esqueci minha senha
    </Link>
  );
}
