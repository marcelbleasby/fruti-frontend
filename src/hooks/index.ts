/**
 * Hooks reutilizáveis do Fruti — um por arquivo, nome do arquivo = nome do hook.
 * Hooks presos a um provider (useAuth, usePropriedade) ficam junto do contexto.
 */
export { useDebouncedCallback } from "./useDebouncedCallback";
export { DEBOUNCE_BUSCA_MS, useDebouncedValue } from "./useDebouncedValue";
export { useTodayISO } from "./useTodayISO";
export { useUploadQueue, type UploadContext, type UploadFn, type UseUploadQueueOptions } from "./useUploadQueue";
