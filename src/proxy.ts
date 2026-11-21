import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REMEMBER_COOKIE,
  clearSessionCookies,
  clientIpFrom,
  refreshTokens,
  writeSessionCookies,
  type TokensSaida,
} from "@/lib/auth/session";
import { HOME_ROUTE, isAuthRoute, isProtectedRoute, loginUrl } from "@/lib/auth/routes";

/**
 * 1. Renova o token de acesso quando ele expirou e ainda há token de atualização.
 *    Os cookies novos vão na resposta (navegador) e na própria requisição
 *    (Server Components e Server Actions já leem o token válido).
 * 2. Navegação sem sessão em rota protegida → /?next=… (login)
 *    Navegação com sessão em tela de acesso (/, /cadastrar) → /painel.
 *    Mapa das rotas: lib/auth/routes.ts.
 *
 * Só otimista: cada Server Action/consulta continua validando o token na API.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value;

  let renewed: TokensSaida | null = null;
  let sessionEnded = false;
  let apiUnavailable = false;

  if (!accessToken && refreshToken) {
    try {
      renewed = await refreshTokens(refreshToken, clientIpFrom(request.headers));
      if (renewed) accessToken = renewed.token_acesso;
      else sessionEnded = true;
    } catch (err) {
      // API fora do ar: não derruba a sessão por isso.
      console.error("[proxy] falha ao renovar sessão", err);
      apiUnavailable = true;
    }
  }

  const authenticated = Boolean(accessToken) || apiUnavailable;
  // Só redireciona navegação. POST (Server Actions) segue e é validado na própria action.
  const isNavigation = request.method === "GET";

  let response: NextResponse;
  if (isNavigation && !authenticated && isProtectedRoute(pathname)) {
    response = NextResponse.redirect(new URL(loginUrl(`${pathname}${search}`), request.url));
  } else if (isNavigation && accessToken && isAuthRoute(pathname)) {
    response = NextResponse.redirect(new URL(HOME_ROUTE, request.url));
  } else {
    if (renewed) {
      request.cookies.set(ACCESS_COOKIE, renewed.token_acesso);
      request.cookies.set(REFRESH_COOKIE, renewed.token_atualizacao);
    } else if (sessionEnded) {
      request.cookies.delete(REFRESH_COOKIE);
    }
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  if (renewed) writeSessionCookies(response.cookies, renewed, request.cookies.has(REMEMBER_COOKIE));
  else if (sessionEnded) clearSessionCookies(response.cookies);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
