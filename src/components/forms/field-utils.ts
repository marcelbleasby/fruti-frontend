import type { FieldBaseProps } from "./types";

const FIELD_KEYS = [
  "label",
  "helperText",
  "errorText",
  "required",
  "invalid",
  "disabled",
  "readOnly",
  "optional",
  "hideLabel",
  "orientation",
  "id",
  "fieldProps",
] as const satisfies readonly (keyof FieldBaseProps)[];

/** Separa as props do campo (FormField) das props do controle. */
export function splitFieldProps<T extends FieldBaseProps>(
  props: T,
): [FieldBaseProps, Omit<T, keyof FieldBaseProps>] {
  const field: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if ((FIELD_KEYS as readonly string[]).includes(key)) field[key] = value;
    else rest[key] = value;
  }
  return [field as FieldBaseProps, rest as Omit<T, keyof FieldBaseProps>];
}
