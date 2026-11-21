import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { layerStyles } from "./layer-styles";
import { buttonRecipe, inputRecipe, textareaRecipe } from "./recipes";
import { semanticTokens } from "./semantic-tokens";
import { textStyles } from "./text-styles";
import { tokens } from "./tokens";

const config = defineConfig({
  globalCss: {
    html: {
      colorPalette: "green",
      bg: "bg",
      color: "fg",
      fontFamily: "body",
    },
    body: {
      bg: "bg",
      color: "fg",
      textStyle: "body",
    },
    "h1, h2, h3, h4": { color: "fg.heading" },
    "code, kbd, samp": { fontFamily: "mono" },
    "*::selection": { bg: "green.200" },
  },
  theme: {
    tokens,
    semanticTokens,
    textStyles,
    layerStyles,
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      textarea: textareaRecipe,
    },
  },
});

/** Sistema do Fruti — tema claro único. */
export const system = createSystem(defaultConfig, config);
