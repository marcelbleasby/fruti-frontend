"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { Link } from "@chakra-ui/react";
import { useEffect, useState, type ReactNode } from "react";
import { SignUpForm, type SignUpFormValues } from "@/components/auth";
import { lockoutMessage, useAuth } from "@/lib/auth/auth-context";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/lib/auth/routes";

export function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<ReactNode>(null);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockedFor]);

  async function handleSubmit(values: SignUpFormValues) {
    setError(null);
    setNotice(null);
    const result = await signUp(values);

    switch (result.status) {
      case "ok":
        router.replace(HOME_ROUTE);
        return;
      case "accepted":
        // A API não diz se a conta foi criada ou já existia: mensagem neutra + caminho para o login.
        setNotice(
          <>
            {result.message}{" "}
            <Link asChild fontWeight="600" textDecoration="underline" textUnderlineOffset="4px">
              <NextLink href={LOGIN_ROUTE}>Ir para o login</NextLink>
            </Link>
          </>,
        );
        return;
      case "invalid":
        return result.fields;
      case "locked":
        setLockedFor(result.retryAfterSeconds);
        return;
      default:
        setError(result.message);
    }
  }

  return (
    <SignUpForm
      onSubmit={handleSubmit}
      loginHref={LOGIN_ROUTE}
      linkAs={NextLink}
      error={error}
      errorTitle="Serviço indisponível"
      notice={notice}
      locked={lockedFor > 0 && { description: lockoutMessage(lockedFor) }}
    />
  );
}
