"use client";

import { Bean, Sprout } from "lucide-react";
import { RadioCardGroup, type RadioCardGroupProps, type RadioCardOption } from "@/components/forms/radio-card-group";
import type { SeedlingOriginType } from "@/modules/types";

export const SEEDLING_ORIGIN_OPTIONS: RadioCardOption[] = [
  {
    value: "mudas",
    label: "Mudas",
    description: "Desenvolvidas em viveiro",
    icon: <Sprout size={20} strokeWidth={1.75} aria-hidden="true" />,
  },
  {
    value: "sementes",
    label: "Sementes",
    description: "Semeadura direta",
    icon: <Bean size={20} strokeWidth={1.75} aria-hidden="true" />,
  },
];

export interface SeedlingOriginSelectorProps
  extends Omit<RadioCardGroupProps, "options" | "value" | "defaultValue" | "onValueChange"> {
  value?: SeedlingOriginType | null;
  defaultValue?: SeedlingOriginType;
  onChange?: (value: SeedlingOriginType) => void;
}

/**
 * SeedlingOriginSelector — tipo de material vegetal (mudas ou sementes).
 * Chakra v3: RadioCard.Root · RadioCard.Item.
 */
export function SeedlingOriginSelector({
  value,
  defaultValue,
  onChange,
  label = "Tipo de material",
  minCardWidth = "200px",
  ...rest
}: SeedlingOriginSelectorProps) {
  return (
    <RadioCardGroup
      label={label}
      options={SEEDLING_ORIGIN_OPTIONS}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onChange ? (v) => v && onChange(v as SeedlingOriginType) : undefined}
      minCardWidth={minCardWidth}
      {...rest}
    />
  );
}
