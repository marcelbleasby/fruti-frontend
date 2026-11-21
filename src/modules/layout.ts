/**
 * Grade de campos dos formulários de domínio: duas (ou mais) colunas iguais
 * quando cabe, uma coluna quando o CONTÊINER fica estreito (não depende do
 * viewport, então funciona em drawers, cards e colunas laterais).
 * `minmax(0, …)` evita que o conteúdo empurre a coluna para fora.
 */
export const FIELD_GRID_COLUMNS = "repeat(auto-fit, minmax(min(100%, 220px), 1fr))";
