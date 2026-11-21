"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginForm, type LoginFormValues } from "@/components/auth";
import { Alert } from "@/components/feedback/alert";
import { lockoutMessage, useAuth } from "@/lib/auth/auth-context";
import { safeNext } from "@/lib/auth/redirect";
import { SIGN_UP_ROUTE } from "@/lib/auth/routes";

export function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [lockedFor, setLockedFor] = useState(0);

  useEffect(() => {
    if (lockedFor <= 0) return;
    const t = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockedFor]);

  async function handleSubmit({ login: usuario, password, remember }: LoginFormValues) {
    setError(null);
    setUnavailable(null);
    const result = await login({ usuario, senha: password, remember });

    if (result.status === "ok") {
      // Lido aqui (e não via useSearchParams) para a página continuar 100% estática.
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    } else if (result.status === "invalid") setError(result.message);
    else if (result.status === "locked") setLockedFor(result.retryAfterSeconds);
    else setUnavailable(result.message);
  }

  return (
    <>
      {unavailable && <Alert status="error" title="Serviço indisponível" description={unavailable} />}
      <LoginForm
        identifier="username"
        signUpHref={SIGN_UP_ROUTE}
        linkAs={NextLink}
        onSubmit={handleSubmit}
        error={error}
        locked={lockedFor > 0 && { description: lockoutMessage(lockedFor) }}
      />
    </>
  );
}
