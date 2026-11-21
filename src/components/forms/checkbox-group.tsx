"use client";

import { Checkbox as ChakraCheckbox, useControllableState } from "@chakra-ui/react";
import { Checkbox } from "./checkbox";
import { FormFieldset, type FormFieldsetProps } from "./form-fieldset";
import type { FieldOption } from "./types";

export interface CheckboxGroupProps
  extends Omit<FormFieldsetProps, "children" | "defaultValue" | "onChange" | "legend"> {
  /** Legenda do grupo (fieldset + legend). */
  label?: FormFieldsetProps["legend"];
  options: FieldOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  name?: string;
  readOnly?: boolean;
  /** Rótulo do item pai "marcar todos" (mostra estado parcial). Ex.: "Todos". */
  selectAllLabel?: string;
  orientation?: "vertical" | "horizontal";
}

/**
 * CheckboxGroup — fieldset + legend + Checkbox.Group. Com `selectAllLabel`, o item
 * pai mostra o estado parcial e os filhos ficam recuados (30 px).
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
  const {
    label,
    options,
    value,
    defaultValue,
    onValueChange,
    name,
    selectAllLabel,
    orientation = "vertical",
    disabled,
    readOnly,
    ...fieldsetProps
  } = props;

  const [selected, setSelected] = useControllableState<string[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });

  const enabledValues = options.filter((o) => !o.disabled).map((o) => o.value);
  const checkedCount = enabledValues.filter((v) => selected.includes(v)).length;
  const parentState: boolean | "indeterminate" =
    checkedCount === 0 ? false : checkedCount === enabledValues.length ? true : "indeterminate";

  const toggleAll = (checked: boolean) => {
    const locked = selected.filter((v) => !enabledValues.includes(v));
    setSelected(checked ? [...locked, ...enabledValues] : locked);
  };

  return (
    <FormFieldset legend={label} disabled={disabled} {...fieldsetProps}>
      {selectAllLabel && (
        <Checkbox
          label={selectAllLabel}
          checked={parentState}
          onCheckedChange={toggleAll}
          disabled={disabled}
          readOnly={readOnly}
        />
      )}
      <ChakraCheckbox.Group
        value={selected}
        onValueChange={setSelected}
        name={name}
        readOnly={readOnly}
        display="flex"
        flexDirection={orientation === "horizontal" ? "row" : "column"}
        flexWrap="wrap"
        gap={orientation === "horizontal" ? "5" : "2.5"}
        ps={selectAllLabel ? "8" : undefined}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            value={option.value}
            label={option.label}
            description={option.description}
            disabled={option.disabled || undefined}
          />
        ))}
      </ChakraCheckbox.Group>
    </FormFieldset>
  );
}
