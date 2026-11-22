/** Valida tipo (MIME ou extensão) e tamanho. */
export function createFileValidator(opts: {
  accept: readonly string[];
  maxSize: number;
  typeMessage: string;
  sizeMessage: string;
}) {
  return (file: File): string | null => {
    const name = file.name.toLowerCase();
    const okType = opts.accept.some((a) => (a.startsWith(".") ? name.endsWith(a) : file.type === a));
    if (!okType) return opts.typeMessage;
    if (file.size > opts.maxSize) return opts.sizeMessage;
    return null;
  };
}
