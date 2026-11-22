"use client";

import { Button, Stack, Text } from "@chakra-ui/react";
import { useState, type ReactNode } from "react";
import { Textarea } from "@/components/forms/textarea";
import { Dialog } from "@/components/overlays/dialog";
import type { ResultadoDeEscrita } from "@/lib/api/resultado";

/**
 * Cancelamento de um registro (processamento, destinação): alertdialog com
 * motivo obrigatório. A ação devolve o resultado da API; erros aparecem no campo.
 */
export function CancelarRegistroDialog({
  open,
  onOpenChange,
  titulo,
  subtitulo,
  explicacao,
  rotuloConfirmar,
  placeholder,
  onConfirmar,
  onCancelado,
  onSessaoExpirada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  subtitulo?: string;
  explicacao: ReactNode;
  rotuloConfirmar: string;
  placeholder?: string;
  onConfirmar: (motivo: string) => Promise<ResultadoDeEscrita>;
  onCancelado: () => void;
  onSessaoExpirada: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    if (!motivo.trim()) {
      setErro("Informe o motivo do cancelamento.");
      return;
    }
    setEnviando(true);
    const r = await onConfirmar(motivo);
    setEnviando(false);
    if (r.status === "ok") {
      setMotivo("");
      setErro(null);
      onCancelado();
    } else if (r.status === "unauthenticated") onSessaoExpirada();
    else if (r.status === "invalid") setErro(r.fields.motivo ?? r.message ?? "Confira o motivo.");
    else setErro(r.message);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      role="alertdialog"
      title={titulo}
      subtitle={subtitulo}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={enviando}>
            Voltar
          </Button>
          <Button colorPalette="red" onClick={confirmar} loading={enviando} loadingText="Cancelando…">
            {rotuloConfirmar}
          </Button>
        </>
      }
    >
      <Stack gap="4">
        <Text textStyle="body.sm" color="fg">
          {explicacao}
        </Text>
        <Textarea
          label="Motivo"
          required
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            if (erro) setErro(null);
          }}
          placeholder={placeholder}
          errorText={erro ?? undefined}
          invalid={Boolean(erro)}
        />
      </Stack>
    </Dialog>
  );
}
