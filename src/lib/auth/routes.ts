/**
 * Mapa de acesso das rotas — fonte única para o proxy e o guard do cliente.
 *
 * - Telas de acesso (`app/(auth)`: `/` e `/cadastrar`): abertas; quem já tem sessão vai para o painel.
 * - Públicas: abertas para todos.
 * - Todo o resto (`app/(protected)`) exige sessão.
 */
/** A raiz do projeto é o login. */
export const LOGIN_ROUTE = "/";
export const SIGN_UP_ROUTE = "/cadastrar";
/** Destino depois de entrar. */
export const HOME_ROUTE = "/painel";

/** Só para quem não está logado. */
export const AUTH_ROUTES = [LOGIN_ROUTE, SIGN_UP_ROUTE];

/** Abertas a qualquer um, logado ou não (ex.: vitrine do design system). */
export const PUBLIC_ROUTES = ["/componentes"];

const matches = (routes: string[], pathname: string) =>
  routes.some((r) => pathname === r || pathname.startsWith(`${r}/`));

export const isAuthRoute = (pathname: string) => matches(AUTH_ROUTES, pathname);

export const isProtectedRoute = (pathname: string) =>
  !matches(AUTH_ROUTES, pathname) && !matches(PUBLIC_ROUTES, pathname);

/** `/?next=…` guardando a página de origem (sem `next` quando a origem é o próprio painel). */
export function loginUrl(next?: string) {
  return next && next !== HOME_ROUTE && next !== LOGIN_ROUTE
    ? `${LOGIN_ROUTE}?next=${encodeURIComponent(next)}`
    : LOGIN_ROUTE;
}
