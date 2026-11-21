"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";
import { SessionExpiredDialog } from "@/components/auth";
import {
  getSessionAction,
  loginAction,
  logoutAction,
  signUpAction,
  type LoginResult,
  type SessionResult,
  type SignUpResult,
} from "./actions";
import { LOGIN_ROUTE } from "./routes";
import type { SessionUser } from "./session";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Entra e grava os cookies (no servidor). Não navega: quem chama decide para onde ir. */
  login: (input: { usuario: string; senha: string; remember: boolean }) => Promise<LoginResult>;
  /** Cria a conta e já entra (sessão lembrada). Não navega. */
  signUp: (input: Parameters<typeof signUpAction>[0]) => Promise<SignUpResult>;
  /** Revoga a sessão na API, apaga os cookies e volta para o login (/). */
  logout: () => Promise<void>;
  /** Recarrega o usuário da sessão (ex.: depois de editar o perfil). */
  refresh: () => Promise<void>;
  /** Avise quando uma ação receber 401: abre o diálogo de sessão expirada sem perder a página. */
  expireSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function lockoutMessage(seconds: number) {
  if (seconds < 60) return `Muitas tentativas. Tente de novo em ${seconds} segundo${seconds === 1 ? "" : "s"}.`;
  const minutes = Math.ceil(seconds / 60);
  return `Muitas tentativas. Tente de novo em ${minutes} minuto${minutes === 1 ? "" : "s"}.`;
}

/**
 * Estado da sessão no cliente. Os tokens ficam em cookies HttpOnly e nunca
 * passam por aqui: o contexto só conhece o usuário. Renovação de token é
 * feita no `proxy.ts`, a cada requisição ao servidor.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [status, setStatusState] = useState<AuthStatus>("loading");
  const [remember, setRemember] = useState(true);
  const [expired, setExpired] = useState(false);
  const [reauthError, setReauthError] = useState<string | null>(null);
  // Espelho do status para handlers assíncronos (evento de visibilidade, respostas atrasadas).
  const statusRef = useRef<AuthStatus>("loading");
  const setStatus = (next: AuthStatus) => {
    statusRef.current = next;
    setStatusState(next);
  };

  function applySession(result: SessionResult) {
    // API fora do ar: mantém o que já sabíamos em vez de deslogar.
    if (result.status === "unavailable") {
      if (statusRef.current === "loading") setStatus("unauthenticated");
      return;
    }
    setRemember(result.remember);
    if (result.user) {
      setUser(result.user);
      setStatus("authenticated");
      setExpired(false);
    } else if (statusRef.current === "authenticated") {
      // Tinha sessão e perdeu (revogada, expirou em outra aba): pede a senha sem sair da página.
      setExpired(true);
    } else {
      setUser(null);
      setStatus("unauthenticated");
    }
  }

  async function refresh() {
    applySession(await getSessionAction());
  }

  async function login(input: { usuario: string; senha: string; remember: boolean }) {
    const result = await loginAction(input);
    if (result.status === "ok") {
      setRemember(input.remember);
      setExpired(false);
      setReauthError(null);
      if (result.user) {
        setUser(result.user);
        setStatus("authenticated");
      } else {
        await refresh();
      }
    }
    return result;
  }

  async function signUp(input: Parameters<typeof signUpAction>[0]) {
    const result = await signUpAction(input);
    if (result.status === "ok") {
      setRemember(true);
      if (result.user) {
        setUser(result.user);
        setStatus("authenticated");
      } else {
        await refresh();
      }
    }
    return result;
  }

  async function logout() {
    await logoutAction();
    setUser(null);
    setStatus("unauthenticated");
    setExpired(false);
    router.replace(LOGIN_ROUTE);
    router.refresh();
  }

  function expireSession() {
    if (statusRef.current === "authenticated") setExpired(true);
  }

  useEffect(() => {
    void getSessionAction().then(applySession);
    // Voltou para a aba: confere se a sessão continua valendo.
    const onVisible = () => {
      if (document.visibilityState === "visible" && statusRef.current === "authenticated") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na montagem
  }, []);

  async function reauthenticate(password: string) {
    if (!user) return;
    setReauthError(null);
    const result = await login({ usuario: user.usuario, senha: password, remember });
    if (result.status === "invalid") setReauthError("Senha incorreta. Confira e tente de novo.");
    else if (result.status === "locked") setReauthError(lockoutMessage(result.retryAfterSeconds));
    else if (result.status === "unavailable") setReauthError(result.message);
    else router.refresh();
  }

  const value: AuthContextValue = {
    status,
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    signUp,
    logout,
    refresh,
    expireSession,
  };

  return (
    <AuthContext value={value}>
      {children}
      {user && (
        <SessionExpiredDialog
          open={expired}
          email={user.email || user.usuario}
          name={user.nome || user.usuario}
          error={reauthError}
          onReauthenticate={reauthenticate}
          onSignOut={logout}
        />
      )}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
