"use server";

import { cookies } from "next/headers";
import { ApiError } from "@/lib/api/fruti-api";
import {
  REMEMBER_COOKIE,
  clearSessionCookies,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  type SessionUser,
} from "./session";

export type SessionResult =
  | { status: "ok"; user: SessionUser | null; remember: boolean }
  | { status: "unavailable" };

/** Usuário da sessão para o AuthContext. `unavailable` = não deu para saber (API fora). */
export async function getSessionAction(): Promise<SessionResult> {
  try {
    const jar = await cookies();
    const remember = jar.has(REMEMBER_COOKIE);
    const user = await getCurrentUser();
    // A API recusou a sessão (revogada, forjada): apaga os cookies, senão o proxy
    // continua tratando o navegador como logado e o login devolve para o painel.
    if (!user) clearSessionCookies(jar);
    return { status: "ok", user, remember };
  } catch (err) {
    console.error("[auth] falha ao carregar sessão", err);
    return { status: "unavailable" };
  }
}

export type LoginResult =
  | { status: "ok"; user: SessionUser | null }
  | { status: "invalid"; message: string }
  | { status: "locked"; retryAfterSeconds: number }
  | { status: "unavailable"; message: string };

export async function loginAction(input: { usuario: string; senha: string; remember: boolean }): Promise<LoginResult> {
  const usuario = typeof input.usuario === "string" ? input.usuario.trim() : "";
  const senha = typeof input.senha === "string" ? input.senha : "";
  if (!usuario || !senha) return { status: "invalid", message: "Informe usuário e senha." };

  try {
    return { status: "ok", user: await signIn({ usuario, senha, remember: Boolean(input.remember) }) };
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401 || err.status === 422) {
        return { status: "invalid", message: "Usuário ou senha incorretos. Confira e tente de novo." };
      }
      if (err.status === 429) return { status: "locked", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
    }
    console.error("[auth] falha ao autenticar", err);
    return { status: "unavailable", message: "Não foi possível entrar agora. Tente novamente em instantes." };
  }
}

export type SignUpField = "usuario" | "email" | "senha" | "nome" | "sobrenome";

export type SignUpResult =
  | { status: "ok"; user: SessionUser | null }
  /** Conta criada, mas o login automático falhou: mande para o login. */
  | { status: "created" }
  | { status: "invalid"; fields: Partial<Record<SignUpField, string>> }
  /** Usuário ou e-mail já usados — a API não diz qual, de propósito. */
  | { status: "conflict"; message: string }
  | { status: "locked"; retryAfterSeconds: number }
  | { status: "unavailable"; message: string };

const SIGN_UP_FIELDS: SignUpField[] = ["usuario", "email", "senha", "nome", "sobrenome"];

export async function signUpAction(input: {
  usuario: string;
  email: string;
  senha: string;
  nome?: string;
  sobrenome?: string;
}): Promise<SignUpResult> {
  const str = (v: unknown) => (typeof v === "string" ? v : "");
  const dados = {
    usuario: str(input.usuario).trim(),
    email: str(input.email).trim(),
    senha: str(input.senha),
    nome: str(input.nome).trim(),
    sobrenome: str(input.sobrenome).trim(),
  };

  try {
    await signUp(dados);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 422) {
        // Um campo pode ter várias mensagens (ex.: senha curta e comum): junta numa frase só.
        const fields: Partial<Record<SignUpField, string>> = {};
        for (const { campo, mensagem } of err.campos) {
          const key = SIGN_UP_FIELDS.find((f) => f === campo);
          if (key) fields[key] = fields[key] ? `${fields[key]} ${mensagem}` : mensagem;
        }
        if (Object.keys(fields).length > 0) return { status: "invalid", fields };
        return { status: "unavailable", message: err.message };
      }
      if (err.status === 409) return { status: "conflict", message: err.message };
      if (err.status === 429) return { status: "locked", retryAfterSeconds: err.retryAfterSeconds ?? 60 };
    }
    console.error("[auth] falha no cadastro", err);
    return { status: "unavailable", message: "Não foi possível criar a conta agora. Tente novamente em instantes." };
  }

  try {
    return { status: "ok", user: await signIn({ usuario: dados.usuario, senha: dados.senha, remember: true }) };
  } catch (err) {
    console.error("[auth] conta criada, mas o login automático falhou", err);
    return { status: "created" };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut();
}
