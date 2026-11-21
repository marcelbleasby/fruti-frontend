import "server-only";

/**
 * Cliente da Fruti API (Django). Só roda no servidor: o navegador fala com o
 * Next.js (BFF) e nunca com a API — ver ADR 0002 no fruti-api.
 */

export interface ApiErrorBody {
  erro: {
    codigo: string;
    mensagem: string;
    campos?: ApiFieldError[];
  };
}

/** Envelope das listagens: `?limit=` (padrão 50, máx. 200) e `?offset=`. */
export interface Pagina<T> {
  itens: T[];
  total: number;
}

export interface ApiFieldError {
  campo: string;
  mensagem: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly codigo: string,
    message: string,
    readonly retryAfterSeconds?: number,
    /** Erros por campo (só em validação, 422). Um campo pode aparecer mais de uma vez. */
    readonly campos: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function baseUrl(): string {
  const url = process.env.FRUTI_API_URL;
  if (!url) throw new Error("FRUTI_API_URL não definida (ex.: http://localhost:8000/api/v1).");
  return url.replace(/\/+$/, "");
}

export interface ApiRequestInit extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** IP do usuário final, repassado em X-Forwarded-For para o rate limit da API. */
  clientIp?: string | null;
  accessToken?: string;
}

export async function apiFetch<T>(path: string, { body, clientIp, accessToken, headers, ...init }: ApiRequestInit = {}) {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...(clientIp && { "X-Forwarded-For": clientIp }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.ok) {
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  const data = (await res.json().catch(() => null)) as ApiErrorBody | null;
  const retryAfter = Number(res.headers.get("Retry-After"));
  throw new ApiError(
    res.status,
    data?.erro?.codigo ?? "erro_interno",
    data?.erro?.mensagem ?? `Erro ${res.status} na API.`,
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : undefined,
    data?.erro?.campos ?? [],
  );
}
