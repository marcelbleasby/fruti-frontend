"use client";

import { Box, Button, Flex, Stack, Text, chakra } from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/feedback/alert";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { DecimalInput, parseDecimalPtBR } from "@/components/forms/decimal-input";
import { FormFieldset } from "@/components/forms/form-fieldset";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Switch } from "@/components/forms/switch";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Drawer } from "@/components/overlays/drawer";
import { salvarUnidadeAction } from "@/lib/areas/actions";
import { useAuth } from "@/lib/auth/auth-context";
import { useListaUrl } from "@/lib/use-lista-url";
import {
  AreaMeasurementFields,
  AreaUnitMap,
  CULTIVATION_UNIT_TYPE_LABEL,
  checkUnitPlacement,
  type AreaMeasurementValue,
} from "@/modules/areas";
import type { Area, CultivationUnit, CultivationUnitType } from "@/modules/types";
import { paraCampo } from "./area-formulario";

/** Drawer de unidade de cultivo pela URL: `?form=unidade` (nova) ou `?form=unidade&alvo=<id>`. */
export function UnidadeFormDrawer({ area, unidades }: { area: Area; unidades: CultivationUnit[] }) {
  const url = useListaUrl();
  const alvo = url.aberto("alvo");
  const aberto = url.aberto("form") === "unidade";
  const unidade = alvo ? unidades.find((u) => u.id === alvo) : undefined;
  const fechar = () => url.setFiltros({ form: null, alvo: null, aba: "unidades" });

  return (
    <Drawer
      open={aberto}
      onOpenChange={(d) => !d.open && fechar()}
      title={unidade ? `Editar ${unidade.name}` : `Nova unidade em ${area.name}`}
      size="md"
      bottomSheetOnMobile
    >
      {aberto ? (
        <UnidadeForm
          key={unidade?.id ?? "nova"}
          area={area}
          unidades={unidades}
          unidade={unidade}
          onCancelar={fechar}
          onSalva={() => {
            NotificationToast.success({ title: unidade ? "Unidade atualizada" : "Unidade cadastrada" });
            fechar();
          }}
        />
      ) : null}
    </Drawer>
  );
}

type Campo = "tipo" | "nome" | "codigo" | "descricao" | "comprimento" | "largura" | "x" | "y";
const CAMPO_DA_API: Record<string, Campo> = {
  tipo: "tipo",
  nome: "nome",
  codigo: "codigo",
  descricao: "descricao",
  comprimento_m: "comprimento",
  largura_m: "largura",
  posicao_x_m: "x",
  posicao_y_m: "y",
};

const TIPOS = (Object.keys(CULTIVATION_UNIT_TYPE_LABEL) as CultivationUnitType[]).map((value) => ({
  value,
  label: CULTIVATION_UNIT_TYPE_LABEL[value],
}));

/** Número do campo, ou null se vazio/ inválido. */
const numero = (v: string) => {
  const n = parseDecimalPtBR(v);
  return Number.isFinite(n) ? n : null;
};

function UnidadeForm({
  area,
  unidades,
  unidade,
  onCancelar,
  onSalva,
}: {
  area: Area;
  unidades: CultivationUnit[];
  unidade?: CultivationUnit;
  onCancelar: () => void;
  onSalva: () => void;
}) {
  const { expireSession } = useAuth();
  const [tipo, setTipo] = useState<CultivationUnitType>(unidade?.type ?? "canteiro");
  const [nome, setNome] = useState(unidade?.name ?? "");
  const [codigo, setCodigo] = useState(unidade?.code ?? "");
  const [descricao, setDescricao] = useState(unidade?.description ?? "");
  const [medidas, setMedidas] = useState<AreaMeasurementValue>({
    length: paraCampo(unidade?.length),
    width: paraCampo(unidade?.width),
  });
  const [posicionar, setPosicionar] = useState(unidade ? unidade.x != null : true);
  const [x, setX] = useState(paraCampo(unidade?.x ?? (unidade ? null : 0)));
  const [y, setY] = useState(paraCampo(unidade?.y ?? (unidade ? null : 0)));
  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({});
  const [falha, setFalha] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const c = numero(medidas.length) ?? 0;
  const l = numero(medidas.width) ?? 0;
  const px = posicionar ? numero(x) : null;
  const py = posicionar ? numero(y) : null;
  const posicaoCompleta = px !== null && py !== null && px >= 0 && py >= 0;
  const encaixe = checkUnitPlacement(
    area,
    unidades,
    { length: c, width: l, x: posicaoCompleta ? px : null, y: posicaoCompleta ? py : null },
    unidade?.id,
  );

  function validar() {
    const e: Partial<Record<Campo, string>> = {};
    if (!nome.trim()) e.nome = "Informe o nome da unidade.";
    if (!(c > 0)) e.comprimento = "Informe um comprimento maior que 0.";
    if (!(l > 0)) e.largura = "Informe uma largura maior que 0.";
    if (posicionar) {
      if (px === null || px < 0) e.x = "Informe a distância (0 ou mais).";
      if (py === null || py < 0) e.y = "Informe a distância (0 ou mais).";
    }
    if (!Object.keys(e).length) {
      if (encaixe.fields.length) e.comprimento = encaixe.fields.length;
      if (encaixe.fields.width) e.largura = encaixe.fields.width;
      if (encaixe.fields.x) e.x = encaixe.fields.x;
      if (encaixe.fields.y) e.y = encaixe.fields.y;
    }
    return e;
  }

  async function enviar(ev: FormEvent) {
    ev.preventDefault();
    setFalha(null);
    const e = validar();
    setErros(e);
    if (Object.keys(e).length) return;
    if (encaixe.problem) return setFalha(encaixe.problem);
    setEnviando(true);
    const r = await salvarUnidadeAction(area.id, unidade?.id ?? null, {
      tipo,
      nome,
      codigo,
      descricao,
      comprimento: c,
      largura: l,
      x: posicionar ? px : null,
      y: posicionar ? py : null,
    });
    setEnviando(false);
    if (r.status === "ok") return onSalva();
    if (r.status === "unauthenticated") return expireSession();
    if (r.status === "invalid") {
      const porCampo: Partial<Record<Campo, string>> = {};
      for (const [k, msg] of Object.entries(r.fields)) if (CAMPO_DA_API[k]) porCampo[CAMPO_DA_API[k]] = msg;
      setErros(porCampo);
      setFalha(r.message ?? (Object.keys(porCampo).length ? null : "Revise os campos."));
      return;
    }
    if (r.status === "rejected" && /código/i.test(r.message)) return setErros({ codigo: r.message });
    setFalha(r.message);
  }

  return (
    <chakra.form onSubmit={enviar} noValidate display="flex" flexDirection="column" gap="5">
      {falha ? <Alert status="error" title="Não foi possível salvar" description={falha} /> : null}
      <Stack gap="4">
        <Box>
          <Text as="span" display="block" textStyle="label" fontWeight="500" color="fg" mb="1.5">
            Tipo
          </Text>
          <SegmentedControl
            label="Tipo"
            items={TIPOS}
            value={tipo}
            onValueChange={(v) => v && setTipo(v as CultivationUnitType)}
          />
        </Box>
        <Flex gap="3" wrap="wrap">
          <Box flex="2 1 200px" minW="0">
            <TextInput
              label="Nome"
              required
              autoComplete="off"
              placeholder={
                tipo === "talhao" ? "Ex.: Talhão 1" : tipo === "canteiro" ? "Ex.: Canteiro 1" : "Ex.: Viveiro"
              }
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              errorText={erros.nome}
              invalid={Boolean(erros.nome)}
              maxLength={255}
            />
          </Box>
          <Box flex="1 1 120px" minW="0">
            <TextInput
              label="Código"
              optional
              fontFamily="mono"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="Ex.: C1"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              errorText={erros.codigo}
              invalid={Boolean(erros.codigo)}
              maxLength={32}
            />
          </Box>
        </Flex>
        <AreaMeasurementFields
          legend="Medidas"
          idPrefix="unidade"
          value={medidas}
          onChange={(v) => setMedidas(v)}
          errors={{ length: erros.comprimento, width: erros.largura }}
        />

        <FormFieldset
          legend="Posição na área"
          helperText="Distância do canto de referência (no alto, à esquerda do desenho)."
        >
          <Switch label="Posicionar no desenho" checked={posicionar} onCheckedChange={setPosicionar} />
          {posicionar ? (
            <Flex gap="3" wrap="wrap">
              <Box flex="1 1 110px" minW="0">
                <DecimalInput
                  id="unidade-x"
                  label="Distância X"
                  unit="m"
                  casas={2}
                  required
                  value={x}
                  onChange={setX}
                  errorText={erros.x}
                  invalid={Boolean(erros.x)}
                  helperText="Ao longo do comprimento"
                />
              </Box>
              <Box flex="1 1 110px" minW="0">
                <DecimalInput
                  id="unidade-y"
                  label="Distância Y"
                  unit="m"
                  casas={2}
                  required
                  value={y}
                  onChange={setY}
                  errorText={erros.y}
                  invalid={Boolean(erros.y)}
                  helperText="Ao longo da largura"
                />
              </Box>
            </Flex>
          ) : null}
          <AreaUnitMap
            length={area.length}
            width={area.width}
            units={unidades}
            hiddenUnitId={unidade?.id}
            maxWidth={520}
            draft={
              posicaoCompleta && c > 0 && l > 0
                ? {
                    length: c,
                    width: l,
                    x: px,
                    y: py,
                    label: codigo || nome || "Nova unidade",
                    problem: encaixe.problem,
                  }
                : null
            }
          />
          {!posicaoCompleta && encaixe.problem ? (
            <Text role="status" fontSize="sm" color="fg.error">
              {encaixe.problem}
            </Text>
          ) : null}
        </FormFieldset>

        <Textarea
          label="Descrição"
          optional
          rows={2}
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
          {unidade ? "Salvar" : "Cadastrar unidade"}
        </Button>
      </Flex>
    </chakra.form>
  );
}
