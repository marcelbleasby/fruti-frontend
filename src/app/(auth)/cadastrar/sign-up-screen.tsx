"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignUpForm, type SignUpFormValues } from "@/components/auth";
import { lockoutMessage, useAuth } from "@/lib/auth/auth-context";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/lib/auth/routes";

export function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockedFor]);

  async function handleSubmit(values: SignUpFormValues) {
    setError(null);
    const result = await signUp(values);

    switch (result.status) {
      case "ok":
        router.replace(HOME_ROUTE);
        return;
      case "created":
        // Conta existe; só o login automático falhou.
        router.replace(LOGIN_ROUTE);
        return;
      case "invalid":
        return result.fields;
      case "conflict":
        setError({
          title: "Usuário ou e-mail já cadastrado",
          message: "Escolha outro nome de usuário ou e-mail. Se a conta for sua, entre com ela.",
        });
        return;
      case "locked":
        setLockedFor(result.retryAfterSeconds);
        return;
      default:
        setError({ title: "Serviço indisponível", message: result.message });
    }
  }

  return (
    <SignUpForm
      onSubmit={handleSubmit}
      loginHref={LOGIN_ROUTE}
      linkAs={NextLink}
      error={error?.message}
      errorTitle={error?.title}
      locked={lockedFor > 0 && { description: lockoutMessage(lockedFor) }}
    />
  );
}
