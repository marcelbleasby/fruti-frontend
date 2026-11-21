/**
 * Nível semântico de um título de componente. O tamanho vem do papel
 * (`textStyle`), não do nível: a página escolhe o nível para manter a
 * ordem h1 → h2 → h3 sem saltos.
 */
export type HeadingLevel = "h2" | "h3" | "h4" | "h5" | "h6";

/** Nível logo abaixo (para subtítulos internos do componente). */
export function nextHeadingLevel(level: HeadingLevel): HeadingLevel {
  const n = Math.min(6, Number(level.slice(1)) + 1);
  return `h${n}` as HeadingLevel;
}
