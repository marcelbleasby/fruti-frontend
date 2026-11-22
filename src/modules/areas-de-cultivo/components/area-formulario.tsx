"use client";

import { Button, Flex, Stack, chakra } from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/feedback/alert";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Drawer } from "@/components/overlays/drawer";
import { salvarAreaAction } from "@/lib/areas/actions";
import { useAuth } from "@/lib/auth/auth-context";
import { useListaUrl } from "@/lib/use-lista-url";
import { AreaMeasurementFields, type AreaMeasurementValue } from "@/modules/areas";
import { parseDecimalPtBR } from "@/components/forms/decimal-input";
import type { Area } from "@/modules/types";

/** Medida em metros como o campo mostra (pt-BR, sem zeros à toa). */
export const paraCampo = (v: number | null | undefined) =>
  v == null ? "" : v.toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });

/**
 * Drawer de área de cultivo pela URL: `?form=area` (nova) ou `?form=area&alvo=<id>`
 * (editar a área passada em `area`). Ao salvar uma nova, abre a página dela.
 */
export function AreaFormDrawer({ area, aoCriar }: { area?: Area; aoCriar?: (id: string) => void }) {
  const url = useListaUrl();
  const editando = url.aberto("form") === "area" && Boolean(area) && url.aberto("alvo") === area?.id;
  const criando = url.aberto("form") === "area" && !url.aberto("alvo") && !area;
  const aberto = editando || criando;

  const fechar = () => url.setFiltros({ form: null, alvo: null });

  return (
    <Drawer
      open={aberto}
      onOpenChange={(d) => !d.open && fechar()}
      title={editando ? "Editar área de cultivo" : "Nova área de cultivo"}
      size="md"
      bottomSheetOnMobile
    >
      {aberto ? (
        <AreaForm
          key={area?.id ?? "nova"}
          area={editando ? area : undefined}
          onCancelar={fechar}
          onSalva={(id) => {
            NotificationToast.success({ title: editando ? "Área atualizada" : "Área cadastrada" });
            if (!editando && aoCriar) aoCriar(id);
            else fechar();
          }}
        />
      ) : null}
    </Drawer>
  );
}

type Campo = "nome" | "codigo" | "descricao" | "comprimento" | "largura";
const CAMPO_DA_API: Record<string, Campo> = {
  nome: "nome",
  codigo: "codigo",
  descricao: "descricao",
  comprimento_m: "comprimento",
  largura_m: "largura",
};

function AreaForm({
  area,
  onCancelar,
  onSalva,
}: {
  area?: Area;
  onCancelar: () => void;
  onSalva: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [nome, setNome] = useState(area?.name ?? "");
  const [codigo, setCodigo] = useState(area?.code ?? "");
  const [descricao, setDescricao] = useState(area?.description ?? "");
  const [medidas, setMedidas] = useState<AreaMeasurementValue>({
    length: paraCampo(area?.length),
    width: paraCampo(area?.width),
  });
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [falha, setFalha] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function validar() {
    const e: Partial<Record<Campo, string>> = {};
    if (!nome.trim()) e.nome = "Informe o nome da área.";
    const c = parseDecimalPtBR(medidas.length);
    const l = parseDecimalPtBR(medidas.width);
    if (!(c > 0)) e.comprimento = "Informe um comprimento maior que 0.";
    if (!(l > 0)) e.largura = "Informe uma largura maior que 0.";
    return { e, c, l };
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    setFalha(null);
    const { e, c, l } = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    setEnviando(true);
    const r = await salvarAreaAction(area?.id ?? null, { nome, codigo, descricao, comprimento: c, largura: l });
    setEnviando(false);
    if (r.status === "ok") return onSalva(r.data.id);
    if (r.status === "unauthenticated") return expireSession();
    if (r.status === "invalid") {
      const porCampo: Partial<Record<Campo, string>> = {};
      for (const [k, msg] of Object.entries(r.fields)) if (CAMPO_DA_API[k]) porCampo[CAMPO_DA_API[k]] = msg;
      setErros(porCampo);
      if (!Object.keys(porCampo).length) setFalha(r.message ?? "Revise os campos.");
      return;
    }
    // Código repetido chega como conflito (409) sem campo: mostra no campo de código.
    if (r.status === "rejected" && /código/i.test(r.message)) return setErros({ codigo: r.message });
    setFalha(r.message);
  }

  return (
    <chakra.form onSubmit={enviar} noValidate display="flex" flexDirection="column" gap="5">
      {falha ? (
        <Alert
          status="error"
          title={area ? "Não foi possível salvar" : "Não foi possível cadastrar"}
          description={falha}
        />
      ) : null}
      <Stack gap="4">
        <TextInput
          label="Nome"
          required
          autoComplete="off"
          placeholder="Ex.: Estufa 1, Setor Norte"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          errorText={erros.nome}
          invalid={Boolean(erros.nome)}
          maxLength={255}
        />
        <TextInput
          label="Código"
          optional
          fontFamily="mono"
          autoCapitalize="characters"
          autoComplete="off"
          placeholder="Ex.: A-01"
          helperText="Curto e único na propriedade."
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          errorText={erros.codigo}
          invalid={Boolean(erros.codigo)}
          maxLength={32}
        />
        <AreaMeasurementFields
          legend="Medidas"
          idPrefix="area"
          value={medidas}
          onChange={(v) => setMedidas(v)}
          errors={{ length: erros.comprimento, width: erros.largura }}
        />
        <Textarea
          label="Descrição"
          optional
          rows={3}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          errorText={erros.descricao}
          invalid={Boolean(erros.descricao)}
          maxLength={5000}
        />
      </Stack>
      <Flex
        gap="3"
        justify="flex-end"
        position="sticky"
        bottom="0"
        bg="bg.panel"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Button variant="ghost" onClick={onCancelar} disabled={enviando}>
          Cancelar
        </Button>
        <Button type="submit" loading={enviando} loadingText="Salvando…">
          {area ? "Salvar" : "Cadastrar área"}
        </Button>
      </Flex>
    </chakra.form>
  );
}
