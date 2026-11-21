import type { DocumentCategory } from "@/modules/types";

export const MB = 1024 * 1024;

export const IMAGE_ACCEPT = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_MAX_SIZE = 10 * MB;

export const DOCUMENT_ACCEPT = [".pdf", ".docx", ".xlsx"] as const;
export const DOCUMENT_MAX_SIZE = 20 * MB;

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  nota_fiscal: "Nota fiscal",
  laudo: "Laudo",
  croqui: "Croqui",
  contrato: "Contrato",
  outro: "Outro",
};

export const DOCUMENT_CATEGORY_OPTIONS = (Object.keys(DOCUMENT_CATEGORY_LABEL) as DocumentCategory[]).map((value) => ({
  value,
  label: DOCUMENT_CATEGORY_LABEL[value],
}));
