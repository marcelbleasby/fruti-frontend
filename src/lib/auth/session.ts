import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiFetch, type ApiRequestInit } from "@/lib/api/fruti-api";
import { LOGIN_ROUTE } from "./routes";

/**
 * Tokens da sessão — só no servidor. O navegador recebe os tokens em cookies
 * HttpOnly e nunca os lê (ADR 0002 do fruti-api). A renovação acontece no
 * `proxy.ts`, antes de cada requisição; aqui o token de acesso já está válido.
 */

export const ACCESS_COOKIE = "fruti_acesso";
export const REFRESH_COOKIE = "fruti_atualizacao";
/** Lembra se o login pediu "Manter conectado", para a renovação manter o mesmo tipo de cookie. */
export const REMEMBER_COOKIE = "fruti_lembrar";

/** Renova um pouco antes de a API recusar o token, para cobrir latência e relógio. */
const ACCESS_EXPIRY_MARGIN_MS = 30_000;

export interface TokensSaida {
  token_acesso: string;
  acesso_expira_em: string;
  token_atualizacao: string;
  atualizacao_expira_em: string;
}

interface UsuarioSaida {
  id: string;
  usuario: string;
  nome: string;
  email: string;
  administrador_global: boolean;
}

export interface SessionUser {
  id: string;
  usuario: string;
  nome: string;
  email: string;
  administradorGlobal: boolean;
}

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  expires?: Date;
}

/** Interface comum a `cookies()` (Server Action) e `NextResponse.cookies` (proxy). */
export interface CookieJar {
  set(name: string, value: string, options: CookieOptions): unknown;
  delete(name: string): unknown;
}

const baseCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export function writeSessionCookies(jar: CookieJar, tokens: TokensSaida, remember: boolean) {
  const base = baseCookie();
  const accessExpires = new Date(new Date(tokens.acesso_expira_em).getTime() - ACCESS_EXPIRY_MARGIN_MS);
  const refreshExpires = remember ? new Date(tokens.atualizacao_expira_em) : undefined;

  jar.set(ACCESS_COOKIE, tokens.token_acesso, { ...base, expires: accessExpires });
  jar.set(REFRESH_COOKIE, tokens.token_atualizacao, { ...base, expires: refreshExpires });
  if (remember) jar.set(REMEMBER_COOKIE, "1", { ...base, expires: refreshExpires });
  else jar.delete(REMEMBER_COOKIE);
}

export function clearSessionCookies(jar: CookieJar) {
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(REMEMBER_COOKIE);
}

/** IP do usuário final, para o rate limit da API contar por pessoa e não pelo BFF. */
export function clientIpFrom(h: Headers): string | null {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
}

/* ------------------------------------------------------------------ */
/* Renovação                                                           */
/* ------------------------------------------------------------------ */

/**
 * A API troca o token de atualização a cada uso e recusa o mesmo token duas
 * vezes. Requisições paralelas (prefetch, várias abas) com o mesmo token
 * dividem uma única renovação: o resultado fica guardado por alguns segundos.
 * O cache é por processo — com várias instâncias, a janela de tolerância de
 * reuso da API (10 s) evita que a sessão seja revogada.
 */
const REFRESH_SHARE_MS = 10_000;
const refreshes = new Map<string, { promise: Promise<TokensSaida | null>; at: number }>();

/** `null` = token recusado (sessão acabou). Erros de rede/API são lançados. */
export function refreshTokens(refreshToken: string, clientIp: string | null): Promise<TokensSaida | null> {
  const now = Date.now();
  for (const [key, entry] of refreshes) if (now - entry.at > REFRESH_SHARE_MS) refreshes.delete(key);

  const shared = refreshes.get(refreshToken);
  if (shared) return shared.promise;

  const promise = apiFetch<TokensSaida>("/autenticacao/renovar", {
    method: "POST",
    body: { token_atualizacao: refreshToken },
    clientIp,
  }).then(
    (tokens) => tokens,
    (err) => {
      if (err instanceof ApiError && err.status === 401) return null;
      refreshes.delete(refreshToken); // falha transitória: deixa a próxima requisição tentar de novo
      throw err;
    },
  );
  refreshes.set(refreshToken, { promise, at: now });
  return promise;
}

/* ------------------------------------------------------------------ */
/* Uso em Server Actions e Server Components                           */
/* ------------------------------------------------------------------ */

/**
 * Troca usuário e senha pelos tokens e grava os cookies (só em Server Action).
 * Devolve o usuário (ou `null` se o /eu falhar — o login vale mesmo assim).
 */
export async function signIn({
  usuario,
  senha,
  remember,
}: {
  usuario: string;
  senha: string;
  remember: boolean;
}): Promise<SessionUser | null> {
  const tokens = await apiFetch<TokensSaida>("/autenticacao/entrar", {
    method: "POST",
    body: { usuario, senha },
    clientIp: clientIpFrom(await headers()),
  });
  writeSessionCookies(await cookies(), tokens, remember);
  return fetchUser(tokens.token_acesso).catch(() => null);
}

export interface SignUpInput {
  usuario: string;
  email: string;
  senha: string;
  nome?: string;
  sobrenome?: string;
}

/**
 * Cadastro público. A API responde sempre 202 com a mesma mensagem, tenha
 * criado a conta ou não (usuário/e-mail já existente), para não revelar contas.
 * Não inicia sessão: quem chama tenta o `signIn` em seguida.
 */
export async function signUp(input: SignUpInput): Promise<{ mensagem: string }> {
  return apiFetch<{ mensagem: string }>("/autenticacao/cadastrar", {
    method: "POST",
    body: input,
    clientIp: clientIpFrom(await headers()),
  });
}

/** Revoga a sessão na API (melhor esforço) e apaga os cookies (só em Server Action). */
export async function signOut() {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_COOKIE)?.value;
  if (accessToken) {
    await apiFetch("/autenticacao/sair", { method: "POST", accessToken }).catch((err) => {
      console.error("[auth] falha ao revogar sessão na API", err);
    });
  }
  clearSessionCookies(jar);
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/** Chamada autenticada à API. Lança `ApiError` 401 quando não há sessão. */
export async function authedApiFetch<T>(path: string, init: Omit<ApiRequestInit, "accessToken"> = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new ApiError(401, "nao_autenticado", "Sessão ausente.");
  return apiFetch<T>(path, { ...init, accessToken });
}

async function fetchUser(accessToken: string): Promise<SessionUser> {
  const u = await apiFetch<UsuarioSaida>("/autenticacao/eu", { accessToken });
  return { id: u.id, usuario: u.usuario, nome: u.nome, email: u.email, administradorGlobal: u.administrador_global };
}

/** Usuário da sessão atual, ou `null` sem sessão válida. Outros erros da API são lançados. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;
  try {
    return await fetchUser(accessToken);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/**
 * Para Server Components/Actions de rotas protegidas que precisam do usuário:
 * devolve o usuário ou redireciona para o login. (Com Cache Components, use
 * dentro de um <Suspense>: lê cookies da requisição.)
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_ROUTE);
  return user;
}
