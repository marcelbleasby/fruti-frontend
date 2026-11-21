/**
 * Tons semânticos usados por Badge, StatusBadge e afins.
 * Valores exatos do board "Exibição de dados" (Badge solid | subtle | outline).
 * Nem todo tom coincide com o `colorPalette.*` do tema (ex.: gray.solid é
 * slate.700 no tema, mas o badge usa slate.600), por isso o mapa é explícito.
 */
export type Tone = "green" | "harvest" | "gray" | "red" | "sky";

export interface ToneTokens {
  /** fundo do solid / borda do outline */
  solid: string;
  /** texto do subtle e do outline */
  fg: string;
  /** fundo do subtle */
  subtle: string;
}

export const TONES: Record<Tone, ToneTokens> = {
  green: { solid: "green.700", fg: "green.900", subtle: "green.100" },
  harvest: { solid: "harvest.700", fg: "harvest.900", subtle: "harvest.100" },
  gray: { solid: "slate.600", fg: "slate.700", subtle: "sage.300" },
  red: { solid: "red.700", fg: "red.800", subtle: "red.100" },
  sky: { solid: "sky.800", fg: "sky.800", subtle: "sky.100" },
};
