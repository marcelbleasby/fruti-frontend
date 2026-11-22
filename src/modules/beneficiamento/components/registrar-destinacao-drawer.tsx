"use client";

import { Box, Button, Flex, Grid, Icon, IconButton, Skeleton, Stack, Text, chakra } from "@chakra-ui/react";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch, type FieldErrors, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { DatePicker } from "@/components/forms/date-picker";
import { FormErrorSummary, type FormErrorItem } from "@/components/forms/form-error-summary";
import { FormFieldset } from "@/components/forms/form-fieldset";
import { RadioCardGroup } from "@/components/forms/radio-card-group";
import { Select } from "@/components/forms/select";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  opcoesDeDestinacaoAction,
  registrarDestinacaoAction,
  type OpcoesDeDestinacao,
} from "@/lib/beneficiamento/actions";
import {
  TIPO_DE_DESTINACAO_CURTO,
  TIPO_DE_DESTINACAO_DESCRICAO,
  TIPO_DE_DESTINACAO_LABEL,
  type TipoDeDestinacao,
} from "@/lib/beneficiamento/types";
import { formatMoeda, formatQuantidade, hojeISO, parseDecimalBR, toNumber } from "@/lib/estoque/format";
import { UNIDADE_LABEL } from "@/lib/estoque/types";
import { CampoNumero } from "@/modules/estoque/components/campo-numero";
import { TIPO_DE_DESTINACAO_VISUAL } from "./tipo-de-destinacao";

interface Valores {
  tipo: TipoDeDestinacao;
  data: string;
  itens: { lote_id: string; quantidade: string }[];
  comprador: string;
  valor_total: string;
  composto_insumo_id: string;
  composto_quantidade: string;
  observacoes: string;
}

const TIPOS: TipoDeDestinacao[] = ["VENDA", "DOACAO", "CONSUMO_PROPRIO", "PERDA", "COMPOSTAGEM"];
const CAMPOS_DA_API: Record<string, FieldPath<Valores>> = {
  data: "data",
  comprador: "comprador",
  valor_total: "valor_total",
  "composto.insumo_id": "composto_insumo_id",
  "composto.quantidade": "composto_quantidade",
  observacoes: "observacoes",
};

const decimal = (v: string) => {
  const n = parseDecimalBR(v);
  return Number.isFinite(n) ? String(n) : "";
};

function itensDoResumo(errors: FieldErrors<Valores>, erroDosItens?: string): FormErrorItem[] {
  const itens: FormErrorItem[] = [];
  if (errors.data?.message) itens.push({ fieldId: "dest-data", message: errors.data.message });
  const raiz = errors.itens?.root?.message ?? erroDosItens;
  if (raiz) itens.push({ fieldId: "dest-itens-0-lote_id", message: raiz });
  if (Array.isArray(errors.itens))
    errors.itens.forEach((l, i) => {
      if (l?.lote_id?.message) itens.push({ fieldId: `dest-itens-${i}-lote_id`, message: `Lote ${i + 1}: ${l.lote_id.message}` });
      if (l?.quantidade?.message)
        itens.push({ fieldId: `dest-itens-${i}-quantidade`, message: `Quantidade do lote ${i + 1}: ${l.quantidade.message}` });
    });
  if (errors.valor_total?.message) itens.push({ fieldId: "dest-valor", message: errors.valor_total.message });
  if (errors.composto_insumo_id?.message) itens.push({ fieldId: "dest-composto-insumo", message: errors.composto_insumo_id.message });
  if (errors.composto_quantidade?.message) itens.push({ fieldId: "dest-composto-qtd", message: errors.composto_quantidade.message });
  return itens;
}

export function RegistrarDestinacaoDrawer({
  open,
  onOpenChange,
  onRegistrada,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrada: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [opcoes, setOpcoes] = useState<OpcoesDeDestinacao | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!open) return;
    let vivo = true;
    void opcoesDeDestinacaoAction().then((r) => {
      if (!vivo) return;
      if (r.status === "ok") {
        setOpcoes(r.opcoes);
        setFalhou(false);
      } else setFalhou(true);
    });
    return () => {
      vivo = false;
    };
  }, [open, tentativa]);

  return (
    <Drawer open={open} onOpenChange={(d) => onOpenChange(d.open)} title="Registrar destinação" size="lg" bottomSheetOnMobile>
      {falhou && !opcoes ? (
        <ErrorState size="sm" onRetry={() => setTentativa((t) => t + 1)} />
      ) : !opcoes ? (
        <Stack gap="4" aria-busy="true" aria-label="Carregando formulário">
          <Skeleton h="24" />
          <Skeleton h="10" />
          <Skeleton h="16" />
        </Stack>
      ) : opcoes.lotes.length === 0 ? (
        <Alert
          status="info"
          title="Nada no estoque de produção"
          description="Registre uma colheita ou um processamento primeiro."
        />
      ) : (
        <DestinacaoForm
          opcoes={opcoes}
          onCancelar={() => onOpenChange(false)}
          onSessaoExpirada={expireSession}
          onRegistrada={(id, tipo) => {
            NotificationToast.success({ title: `${TIPO_DE_DESTINACAO_LABEL[tipo]} registrada`, description: "O estoque de produção já foi baixado." });
            onOpenChange(false);
            onRegistrada(id);
          }}
        />
      )}
    </Drawer>
  );
}

function DestinacaoForm({
  opcoes,
  onCancelar,
  onRegistrada,
  onSessaoExpirada,
}: {
  opcoes: OpcoesDeDestinacao;
  onCancelar: () => void;
  onRegistrada: (id: string, tipo: TipoDeDestinacao) => void;
  onSessaoExpirada: () => void;
}) {
  const chave = useRef(crypto.randomUUID());
  const hoje = hojeISO();
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [erroDosItens, setErroDosItens] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    defaultValues: {
      tipo: "VENDA",
      data: hoje,
      itens: [{ lote_id: "", quantidade: "" }],
      comprador: "",
      valor_total: "",
      composto_insumo_id: "",
      composto_quantidade: "",
      observacoes: "",
    },
    mode: "onTouched",
  });

  const itens = useFieldArray({
    control,
    name: "itens",
    rules: {
      minLength: { value: 1, message: "Informe ao menos um lote." },
      validate: (linhas) => {
        const ids = linhas.map((l) => l.lote_id).filter(Boolean);
        return new Set(ids).size === ids.length || "O mesmo lote aparece mais de uma vez.";
      },
    },
  });

  const [tipo, vItens, valorTotal, compostoInsumo] = useWatch({
    control,
    name: ["tipo", "itens", "valor_total", "composto_insumo_id"],
  });
  const lote = (id: string) => opcoes.lotes.find((l) => l.value === id);
  const adubo = opcoes.adubos.find((a) => a.value === compostoInsumo);
  const kg = vItens.reduce((s, i) => {
    const n = parseDecimalBR(i.quantidade);
    return lote(i.lote_id)?.unidade === "QUILOGRAMA" && Number.isFinite(n) ? s + n : s;
  }, 0);
  const valor = parseDecimalBR(valorTotal);
  const dataMinima = vItens
    .map((i) => lote(i.lote_id)?.dataDeEntrada)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const resumo = mostrarResumo ? itensDoResumo(errors, erroDosItens) : [];

  async function registrar(v: Valores) {
    setErroGeral(null);
    setErroDosItens(undefined);
    const r = await registrarDestinacaoAction(
      {
        tipo: v.tipo,
        data: v.data,
        itens: v.itens.map((i) => ({ lote_id: i.lote_id, quantidade: decimal(i.quantidade) })),
        comprador: v.comprador.trim(),
        valor_total: v.valor_total ? decimal(v.valor_total) : undefined,
        composto:
          v.tipo === "COMPOSTAGEM" && v.composto_insumo_id
            ? { insumo_id: v.composto_insumo_id, quantidade: decimal(v.composto_quantidade) }
            : null,
        observacoes: v.observacoes.trim(),
      },
      chave.current,
    );
    if (r.status === "ok") {
      chave.current = crypto.randomUUID();
      onRegistrada(r.data.id, v.tipo);
      return;
    }
    if (r.status === "unauthenticated") return onSessaoExpirada();
    if (r.status === "invalid") {
      for (const [campo, msg] of Object.entries(r.fields)) {
        if (campo === "itens" || campo.startsWith("itens.")) setErroDosItens(msg);
        else if (CAMPOS_DA_API[campo]) setError(CAMPOS_DA_API[campo], { type: "server", message: msg });
        else setErroGeral(msg);
      }
      setMostrarResumo(true);
      return;
    }
    setErroGeral(r.message);
  }

  return (
    <chakra.form
      noValidate
      display="flex"
      flexDirection="column"
      gap="6"
      onSubmit={(e) => void handleSubmit(registrar, () => setMostrarResumo(true))(e)}
    >
      {erroGeral ? <Alert status="error" title="Não foi possível registrar" description={erroGeral} /> : null}
      {resumo.length > 0 ? <FormErrorSummary errors={resumo} title="Corrija para registrar" /> : null}

      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <RadioCardGroup
            label="Para onde foi"
            required
            columns={{ base: 1, sm: 2, md: 3 }}
            options={TIPOS.map((t) => {
              const V = TIPO_DE_DESTINACAO_VISUAL[t].icon;
              return {
                value: t,
                label: TIPO_DE_DESTINACAO_CURTO[t],
                description: TIPO_DE_DESTINACAO_DESCRICAO[t],
                icon: <Icon as={V} boxSize="5" strokeWidth={1.75} aria-hidden />,
              };
            })}
            value={field.value}
            onValueChange={(v) => v && field.onChange(v)}
          />
        )}
      />

      <Box maxW={{ sm: "260px" }}>
        <Controller
          control={control}
          name="data"
          rules={{
            required: "Informe a data.",
            validate: (val) => {
              if (val > hoje) return "Não pode ser uma data futura.";
              if (dataMinima && val < dataMinima) return "Antes da entrada de um dos lotes no estoque.";
              return true;
            },
          }}
          render={({ field }) => (
            <DatePicker
              id="dest-data"
              label="Data"
              required
              value={field.value || null}
              onValueChange={(val) => field.onChange(val ?? "")}
              max={hoje}
              min={dataMinima}
              errorText={errors.data?.message}
              invalid={Boolean(errors.data)}
            />
          )}
        />
      </Box>

      <FormFieldset
        legend="O que saiu do estoque"
        helperText="Fruta colhida ou produtos do estoque de produção."
        errorText={errors.itens?.root?.message ?? erroDosItens}
      >
        <Stack gap="3">
          {itens.fields.map((f, i) => {
            const sel = lote(vItens[i]?.lote_id ?? "");
            return (
              <Grid key={f.id} templateColumns={{ base: "1fr", sm: "1fr 200px auto" }} gap="3" alignItems="start">
                <Controller
                  control={control}
                  name={`itens.${i}.lote_id`}
                  rules={{ required: "Escolha o lote." }}
                  render={({ field }) => (
                    <Select
                      id={`dest-itens-${i}-lote_id`}
                      label={`Lote ${i + 1}`}
                      hideLabel={i > 0}
                      required
                      placeholder="Escolha o lote"
                      options={opcoes.lotes.map((l) => ({
                        value: l.value,
                        label: `${l.label} — ${formatQuantidade(l.saldo, l.unidade)}`,
                      }))}
                      value={field.value || null}
                      onValueChange={(val) => field.onChange(val ?? "")}
                      errorText={errors.itens?.[i]?.lote_id?.message}
                      invalid={Boolean(errors.itens?.[i]?.lote_id)}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`itens.${i}.quantidade`}
                  rules={{
                    validate: (val) => {
                      if (!val.trim()) return "Informe a quantidade.";
                      const n = parseDecimalBR(val);
                      if (!Number.isFinite(n) || n <= 0) return "Use um número maior que zero.";
                      if (sel?.unidade === "UNIDADE" && !Number.isInteger(n)) return "Em unidades, use um número inteiro.";
                      if (sel && n > toNumber(sel.saldo)) return `Maior que o saldo (${formatQuantidade(sel.saldo, sel.unidade)}).`;
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <CampoNumero
                      id={`dest-itens-${i}-quantidade`}
                      label={i > 0 ? `Quantidade do lote ${i + 1}` : "Quantidade"}
                      required
                      inteiro={sel?.unidade === "UNIDADE"}
                      unit={sel ? UNIDADE_LABEL[sel.unidade].curta : undefined}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errorText={errors.itens?.[i]?.quantidade?.message}
                      invalid={Boolean(errors.itens?.[i]?.quantidade)}
                    />
                  )}
                />
                <IconButton
                  aria-label={`Remover lote ${i + 1}`}
                  variant="ghost"
                  color="fg.muted"
                  mt={{ base: "0", sm: i === 0 ? "7" : "0" }}
                  justifySelf={{ base: "end", sm: "auto" }}
                  disabled={itens.fields.length === 1}
                  onClick={() => itens.remove(i)}
                >
                  <Trash2 aria-hidden />
                </IconButton>
              </Grid>
            );
          })}
          <Box>
            <Button variant="outline" size="sm" onClick={() => itens.append({ lote_id: "", quantidade: "" })}>
              <Plus aria-hidden /> Adicionar lote
            </Button>
          </Box>
        </Stack>
      </FormFieldset>

      {tipo === "VENDA" ? (
        <FormFieldset legend="Venda">
          <Grid templateColumns={{ base: "1fr", sm: "1fr 220px" }} gap="3.5">
            <TextInput
              label="Comprador"
              optional
              autoComplete="organization"
              placeholder="Ex.: Mercado do Zé"
              errorText={errors.comprador?.message}
              invalid={Boolean(errors.comprador)}
              {...register("comprador", { maxLength: { value: 255, message: "Use até 255 caracteres." } })}
            />
            <Controller
              control={control}
              name="valor_total"
              rules={{
                validate: (val) => {
                  if (!val.trim()) return true;
                  const n = parseDecimalBR(val);
                  return (Number.isFinite(n) && n >= 0) || "Use um valor, como 450,00.";
                },
              }}
              render={({ field }) => (
                <CampoNumero
                  id="dest-valor"
                  label="Valor total"
                  optional
                  unit="R$"
                  casas={2}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  helperText={
                    Number.isFinite(valor) && valor > 0 && kg > 0 ? `${formatMoeda(valor / kg)} por kg` : "Valor recebido pela venda."
                  }
                  errorText={errors.valor_total?.message}
                  invalid={Boolean(errors.valor_total)}
                />
              )}
            />
          </Grid>
        </FormFieldset>
      ) : null}

      {tipo === "COMPOSTAGEM" ? (
        <FormFieldset
          legend="Adubo gerado"
          helperText="Cria um lote de adubo no estoque de insumos."
        >
          {opcoes.adubos.length === 0 ? (
            <Text fontSize="sm" color="fg.muted">
              Sem adubo orgânico no catálogo, a compostagem só baixa o estoque.
            </Text>
          ) : (
            <Grid templateColumns={{ base: "1fr", sm: "1fr 200px" }} gap="3.5">
              <Controller
                control={control}
                name="composto_insumo_id"
                render={({ field }) => (
                  <Select
                    id="dest-composto-insumo"
                    label="Adubo"
                    optional
                    clearable
                    placeholder="Não gerar adubo"
                    options={opcoes.adubos.map((a) => ({ value: a.value, label: a.label }))}
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? "")}
                    errorText={errors.composto_insumo_id?.message}
                    invalid={Boolean(errors.composto_insumo_id)}
                  />
                )}
              />
              <Controller
                control={control}
                name="composto_quantidade"
                rules={{
                  validate: (val) => {
                    if (!compostoInsumo) return true;
                    const n = parseDecimalBR(val);
                    return (Number.isFinite(n) && n > 0) || "Informe quanto adubo foi gerado.";
                  },
                }}
                render={({ field }) => (
                  <CampoNumero
                    id="dest-composto-qtd"
                    label="Quantidade de adubo"
                    required={Boolean(compostoInsumo)}
                    optional={!compostoInsumo}
                    unit={adubo ? UNIDADE_LABEL[adubo.unidade].curta : undefined}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    errorText={errors.composto_quantidade?.message}
                    invalid={Boolean(errors.composto_quantidade)}
                  />
                )}
              />
            </Grid>
          )}
        </FormFieldset>
      ) : null}

      <Textarea
        label="Observações"
        optional
        errorText={errors.observacoes?.message}
        invalid={Boolean(errors.observacoes)}
        {...register("observacoes", { maxLength: { value: 5000, message: "Use até 5000 caracteres." } })}
      />

      <Flex gap="3" justify="space-between" position="sticky" bottom="0" bg="bg.panel" py="3" borderTopWidth="1px" borderColor="border" mt="-2">
        <Button variant="ghost" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} loadingText="Registrando…">
          Registrar {TIPO_DE_DESTINACAO_LABEL[tipo].toLowerCase()}
        </Button>
      </Flex>
    </chakra.form>
  );
}
