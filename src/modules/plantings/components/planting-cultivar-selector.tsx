"use client";

import { Flex } from "@chakra-ui/react";
import { useState } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import type { FieldBaseProps } from "@/components/forms/types";
import { CultivarSelector } from "@/modules/cultivars";
import type { Cultivar, CultivarId, SpeciesId } from "../../types";

export interface PlantingCultivarSelectorProps<T extends FieldValues>
  extends Omit<FieldBaseProps, "errorText" | "invalid"> {
  /** Campo do formulário (padrão no PlantingForm: "cultivarId"). */
  name: FieldPath<T>;
  control: Control<T>;
  /** Espécie escolhida no formulário. */
  speciesId: SpeciesId | null | undefined;
  /** Nome da espécie atual, para o aviso de cultivar removida. */
  speciesName?: string;
  cultivars: Cultivar[];
  allowNone?: boolean;
}

/**
 * PlantingCultivarSelector — CultivarSelector ligado ao formulário. Quando a espécie muda e
 * a cultivar escolhida deixa de valer, ela é limpa e o usuário é avisado em um Alert inline.
 * Chakra v3: CultivarSelector + Field · Alert (inline).
 */
export function PlantingCultivarSelector<T extends FieldValues>({
  name,
  control,
  speciesId,
  speciesName,
  cultivars,
  allowNone = true,
  label = "Cultivar",
  ...rest
}: PlantingCultivarSelectorProps<T>) {
  const [removedNotice, setRemovedNotice] = useState(false);
  const placeholder = speciesName ? `Selecione a cultivar de ${speciesName}` : undefined;

  return (
    <Flex direction="column" gap="2">
      {removedNotice && speciesId && (
        <Alert
          status="info"
          title={
            speciesName ? (
              <>
                A cultivar foi removida porque a espécie mudou para <strong>{speciesName}</strong>.
              </>
            ) : (
              "A cultivar foi removida porque a espécie mudou."
            )
          }
          onClose={() => setRemovedNotice(false)}
          closeLabel="Fechar aviso"
        />
      )}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <CultivarSelector
            {...rest}
            label={label}
            speciesId={speciesId}
            cultivars={cultivars}
            allowNone={allowNone}
            placeholder={placeholder}
            name={field.name}
            value={(field.value as CultivarId | null | undefined) ?? null}
            onChange={(value, _cultivar, reason) => {
              field.onChange(value);
              setRemovedNotice(reason === "species-change");
            }}
            errorText={fieldState.error?.message}
          />
        )}
      />
    </Flex>
  );
}
