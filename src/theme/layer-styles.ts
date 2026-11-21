import { defineLayerStyles } from "@chakra-ui/react";

export const layerStyles = defineLayerStyles({
  // Superfícies de card / tile
  "surface.card": {
    value: {
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border",
      borderRadius: "l3",
      boxShadow: "sm",
    },
  },
  "bento.default": {
    value: {
      bg: "bg.panel",
      borderWidth: "1px",
      borderColor: "border",
      borderRadius: "l4",
      boxShadow: "sm",
    },
  },
  "bento.subtle": {
    value: {
      bg: "green.100",
      borderWidth: "1px",
      borderColor: "green.100",
      borderRadius: "l4",
    },
  },
  "bento.inverse": {
    value: {
      bg: "green.900",
      color: "white",
      borderWidth: "1px",
      borderColor: "green.900",
      borderRadius: "l4",
    },
  },
  // Material Liquid Glass (navegação mobile flutuante)
  glass: {
    value: {
      bg: "bg.glass",
      backdropFilter: "blur(24px) saturate(180%)",
      borderWidth: "1px",
      borderColor: "border.glass",
      boxShadow: "glass",
    },
  },
  "glass.primary": {
    value: {
      bg: "rgba(21,128,61,0.88)",
      color: "white",
      backdropFilter: "blur(24px) saturate(180%)",
      borderWidth: "1px",
      borderColor: "rgba(255,255,255,0.35)",
      boxShadow: "glassPrimary",
    },
  },
  disabled: {
    value: {
      bg: "bg.muted",
      color: "fg.disabled",
      borderColor: "border.disabled",
      cursor: "not-allowed",
    },
  },
});
