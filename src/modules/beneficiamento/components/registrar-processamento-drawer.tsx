"use client";

import { Box, Button, Flex, Grid, IconButton, Skeleton, Stack, Text, chakra } from "@chakra-ui/react";
import { PackagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type FieldPath,
} from "react-hook-form";
import { Progress } from "@/components/data-display/progress";
import { Alert } from "@/components/feedback/alert";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { DatePicker } from "@/components/forms/date-picker";
import { FormErrorSummary, type FormErrorItem } from "@/components/forms/form-error-summary";
import { FormFieldset } from "@/components/forms/form-fieldset";
import { Select } from "@/components/forms/select";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Steps } from "@/components/navigation/steps";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  criarProdutoAction,
  opcoesDeProcessamentoAction,
  registrarProcessamentoAction,
  type OpcoesDeProcessamento,
} from "@/lib/beneficiamento/actions";
import { TIPO_DE_PRODUTO_LABEL, UNIDADES_DE_PRODUTO, type TipoDeProduto } from "@/lib/beneficiamento/types";
import { formatQuantidade, hojeISO, parseDecimalBR, toNumber } from "@/lib/estoque/format";
import { UNIDADE_LABEL, type Unidade } from "@/lib/estoque/types";
import { CampoNumero } from "@/modules/estoque/components/campo-numero";

interface Valores {
  data: string;
  entradas: { lote_id: string; quantidade: string }[];
  saidas: { produto_id: string; quantidade: string }[];
  insumos: { insumo_id: string; quantidade: string }[];
  perda_kg: string;
  custo_adicional: string;
  observacoes: string;
}

type Grupo = "entradas" | "saidas" | "insumos";

const PASSOS = [
  { title: "Entradas", description: "O que foi processado" },
  { title: "Produtos", description: "O que foi gerado" },
  { title: "Custos e insumos", description: "Opcional" },
];

/** Campos validados ao avançar de cada passo (e passo de cada campo da API). */
const CAMPOS_DO_PASSO: FieldPath<Valores>[][] = [
  ["data", "entradas"],
  ["saidas", "perda_kg"],
  ["insumos", "custo_adicional", "observacoes"],
];
const passoDoCampo = (campo: string) => CAMPOS_DO_PASSO.findIndex((cs) => cs.some((c) => campo === c || campo.startsWith(`${c}.`)));

/** "1.234,5" → "1234.5" para a API. */
const decimal = (v: string) => {
  const n = parseDecimalBR(v);
  return Number.isFinite(n) ? String(n) : "";
};

function quantidadeValida(v: string, { inteiro, maximo }: { inteiro: boolean; maximo?: { valor: string; unidade: Unidade } }) {
  if (!v.trim()) return "Informe a quantidade.";
  const n = parseDecimalBR(v);
  if (!Number.isFinite(n) || n <= 0) return "Use um número maior que zero.";
  if (inteiro && !Number.isInteger(n)) return "Em unidades, use um número inteiro.";
  if (maximo && n > toNumber(maximo.valor)) return `Maior que o saldo (${formatQuantidade(maximo.valor, maximo.unidade)}).`;
  return true;
}

/** Erros do react-hook-form → itens do resumo, na ordem do formulário, com o id do campo. */
function itensDoResumo(errors: FieldErrors<Valores>, grupos: Partial<Record<Grupo, string>>): FormErrorItem[] {
  const itens: FormErrorItem[] = [];
  if (errors.data?.message) itens.push({ fieldId: "proc-data", message: errors.data.message });
  const linhas = (g: Grupo, campos: [string, string][]) => {
    const arr = errors[g];
    const raiz = arr?.root?.message ?? grupos[g];
    if (raiz) itens.push({ fieldId: `proc-${g}-0-${campos[0][0]}`, message: raiz });
    if (Array.isArray(arr))
      arr.forEach((linha, i) => {
        if (!linha) return;
        for (const [campo, nome] of campos) {
          const m = (linha as Record<string, { message?: string }>)[campo]?.message;
          if (m) itens.push({ fieldId: `proc-${g}-${i}-${campo}`, message: `${nome} ${i + 1}: ${m}` });
        }
      });
  };
  linhas("entradas", [["lote_id", "Lote"], ["quantidade", "Quantidade do lote"]]);
  linhas("saidas", [["produto_id", "Produto"], ["quantidade", "Quantidade do produto"]]);
  if (errors.perda_kg?.message) itens.push({ fieldId: "proc-perda", message: errors.perda_kg.message });
  linhas("insumos", [["insumo_id", "Insumo"], ["quantidade", "Quantidade do insumo"]]);
  if (errors.custo_adicional?.message) itens.push({ fieldId: "proc-custo", message: errors.custo_adicional.message });
  return itens;
}

/* ------------------------------------------------------------------ */

export function RegistrarProcessamentoDrawer({
  open,
  onOpenChange,
  onRegistrado,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrado: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [opcoes, setOpcoes] = useState<OpcoesDeProcessamento | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!open) return;
    let vivo = true;
    void opcoesDeProcessamentoAction().then((r) => {
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
    <Drawer
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      title="Registrar processamento"
      size="lg"
      bottomSheetOnMobile
    >
      {falhou && !opcoes ? (
        <ErrorState size="sm" onRetry={() => setTentativa((t) => t + 1)} />
      ) : !opcoes ? (
        <Stack gap="4" aria-busy="true" aria-label="Carregando formulário">
          <Skeleton h="12" />
          <Skeleton h="10" />
          <Skeleton h="24" />
        </Stack>
      ) : opcoes.lotes.length === 0 ? (
        <Alert
          status="info"
          title="Nada para processar"
          description="Os lotes de fruta entram quando você registra uma colheita."
        />
      ) : (
        <ProcessamentoForm
          opcoes={opcoes}
          onProdutoCriado={(p) => setOpcoes((o) => (o ? { ...o, produtos: [...o.produtos, p] } : o))}
          onCancelar={() => onOpenChange(false)}
          onSessaoExpirada={expireSession}
          onRegistrado={(id) => {
            NotificationToast.success({ title: "Processamento registrado", description: "Os produtos já estão no estoque de produção." });
            onOpenChange(false);
            onRegistrado(id);
          }}
        />
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */

function ProcessamentoForm({
  opcoes,
  onProdutoCriado,
  onCancelar,
  onRegistrado,
  onSessaoExpirada,
}: {
  opcoes: OpcoesDeProcessamento;
  onProdutoCriado: (p: OpcoesDeProcessamento["produtos"][number]) => void;
  onCancelar: () => void;
  onRegistrado: (id: string) => void;
  onSessaoExpirada: () => void;
}) {
  const chave = useRef(crypto.randomUUID());
  const hoje = hojeISO();
  const [passo, setPasso] = useState(0);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [errosDeGrupo, setErrosDeGrupo] = useState<Partial<Record<Grupo, string>>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    trigger,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    defaultValues: {
      data: hoje,
      entradas: [{ lote_id: "", quantidade: "" }],
      saidas: [{ produto_id: "", quantidade: "" }],
      insumos: [],
      perda_kg: "",
      custo_adicional: "",
      observacoes: "",
    },
    mode: "onTouched",
  });

  const entradas = useFieldArray({
    control,
    name: "entradas",
    rules: {
      minLength: { value: 1, message: "Informe ao menos um lote de entrada." },
      validate: (linhas) => {
        const ids = linhas.map((l) => l.lote_id).filter(Boolean);
        return new Set(ids).size === ids.length || "O mesmo lote aparece mais de uma vez.";
      },
    },
  });
  const saidas = useFieldArray({
    control,
    name: "saidas",
    rules: { minLength: { value: 1, message: "Informe ao menos um produto gerado." } },
  });
  const insumos = useFieldArray({
    control,
    name: "insumos",
    rules: {
      validate: (linhas) => {
        const ids = linhas.map((l) => l.insumo_id).filter(Boolean);
        return new Set(ids).size === ids.length || "O mesmo insumo aparece mais de uma vez.";
      },
    },
  });

  const [vEntradas, vSaidas, vInsumos] = useWatch({ control, name: ["entradas", "saidas", "insumos"] });
  const lote = (id: string) => opcoes.lotes.find((l) => l.value === id);
  const produto = (id: string) => opcoes.produtos.find((p) => p.value === id);
  const insumo = (id: string) => opcoes.insumos.find((i) => i.value === id);

  // Estimativa ao vivo (a API recalcula ao registrar): só o que está em kg entra no rendimento.
  const kgEntrada = vEntradas.reduce((s, e) => {
    const n = parseDecimalBR(e.quantidade);
    return lote(e.lote_id)?.unidade === "QUILOGRAMA" && Number.isFinite(n) ? s + n : s;
  }, 0);
  const kgSaida = vSaidas.reduce((s, x) => {
    const n = parseDecimalBR(x.quantidade);
    return produto(x.produto_id)?.unidade === "QUILOGRAMA" && Number.isFinite(n) ? s + n : s;
  }, 0);
  const rendimento = kgEntrada > 0 ? (kgSaida / kgEntrada) * 100 : null;
  const dataMinima = vEntradas
    .map((e) => lote(e.lote_id)?.dataDeEntrada)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);

  const resumo = mostrarResumo ? itensDoResumo(errors, errosDeGrupo) : [];
  const ultimo = PASSOS.length - 1;

  async function avancar() {
    setErroGeral(null);
    const ok = await trigger(CAMPOS_DO_PASSO[passo]);
    if (!ok) {
      setMostrarResumo(true);
      return;
    }
    setMostrarResumo(false);
    setPasso((p) => Math.min(ultimo, p + 1));
  }

  async function registrar(v: Valores) {
    setErroGeral(null);
    setErrosDeGrupo({});
    const r = await registrarProcessamentoAction(
      {
        data: v.data,
        entradas: v.entradas.map((e) => ({ lote_id: e.lote_id, quantidade: decimal(e.quantidade) })),
        saidas: v.saidas.map((s) => ({ produto_id: s.produto_id, quantidade: decimal(s.quantidade) })),
        insumos: v.insumos.map((i) => ({ insumo_id: i.insumo_id, quantidade: decimal(i.quantidade) })),
        perda_kg: v.perda_kg ? decimal(v.perda_kg) : undefined,
        custo_adicional: v.custo_adicional ? decimal(v.custo_adicional) : undefined,
        observacoes: v.observacoes.trim(),
      },
      chave.current,
    );
    if (r.status === "ok") {
      chave.current = crypto.randomUUID();
      onRegistrado(r.data.id);
      return;
    }
    if (r.status === "unauthenticated") return onSessaoExpirada();
    if (r.status === "invalid") {
      // Leva para o passo do primeiro erro e marca cada campo (ou o grupo, quando a API aponta a lista).
      const grupos: Partial<Record<Grupo, string>> = {};
      let primeiroPasso = ultimo;
      for (const [campo, msg] of Object.entries(r.fields)) {
        const p = passoDoCampo(campo);
        if (p >= 0) primeiroPasso = Math.min(primeiroPasso, p);
        if (campo === "entradas" || campo === "saidas" || campo === "insumos") grupos[campo] = msg;
        else if (p >= 0) setError(campo as FieldPath<Valores>, { type: "server", message: msg });
        else setErroGeral(msg);
      }
      setErrosDeGrupo(grupos);
      setPasso(primeiroPasso);
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
      onSubmit={(e) => {
        e.preventDefault();
        // Enter nos passos intermediários avança em vez de enviar.
        if (passo < ultimo) void avancar();
        else void handleSubmit(registrar, () => setMostrarResumo(true))(e);
      }}
    >
      <Steps
        items={PASSOS}
        step={passo}
        onStepChange={(d) => {
          // Voltar é livre; avançar só pelo botão (que valida o passo).
          if (d.step < passo) setPasso(d.step);
        }}
        showNavigation={false}
      />

      {erroGeral ? <Alert status="error" title="Não foi possível registrar" description={erroGeral} /> : null}
      {resumo.length > 0 ? <FormErrorSummary errors={resumo} title="Corrija para continuar" /> : null}

      {/* Passo 1 — Entradas */}
      <Stack gap="5" display={passo === 0 ? "flex" : "none"}>
        <Box maxW={{ sm: "260px" }}>
          <Controller
            control={control}
            name="data"
            rules={{
              required: "Informe a data do processamento.",
              validate: (val) => {
                if (val > hoje) return "Não pode ser uma data futura.";
                if (dataMinima && val < dataMinima) return "Antes da entrada de um dos lotes no estoque.";
                return true;
              },
            }}
            render={({ field }) => (
              <DatePicker
                id="proc-data"
                label="Data do processamento"
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
          legend="Lotes processados"
          helperText="Fruta colhida ou produtos do estoque de produção."
          errorText={errors.entradas?.root?.message ?? errosDeGrupo.entradas}
        >
          <Stack gap="3">
            {entradas.fields.map((f, i) => {
              const sel = lote(vEntradas[i]?.lote_id ?? "");
              return (
                <Grid key={f.id} templateColumns={{ base: "1fr", sm: "1fr 200px auto" }} gap="3" alignItems="start">
                  <Controller
                    control={control}
                    name={`entradas.${i}.lote_id`}
                    rules={{ required: "Escolha o lote." }}
                    render={({ field }) => (
                      <Select
                        id={`proc-entradas-${i}-lote_id`}
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
                        errorText={errors.entradas?.[i]?.lote_id?.message}
                        invalid={Boolean(errors.entradas?.[i]?.lote_id)}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`entradas.${i}.quantidade`}
                    rules={{
                      validate: (val) =>
                        quantidadeValida(val, {
                          inteiro: sel?.unidade === "UNIDADE",
                          maximo: sel ? { valor: sel.saldo, unidade: sel.unidade } : undefined,
                        }),
                    }}
                    render={({ field }) => (
                      <CampoNumero
                        id={`proc-entradas-${i}-quantidade`}
                        label={i > 0 ? `Quantidade do lote ${i + 1}` : "Quantidade"}
                        required
                        inteiro={sel?.unidade === "UNIDADE"}
                        unit={sel ? UNIDADE_LABEL[sel.unidade].curta : undefined}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        errorText={errors.entradas?.[i]?.quantidade?.message}
                        invalid={Boolean(errors.entradas?.[i]?.quantidade)}
                      />
                    )}
                  />
                  <IconButton
                    aria-label={`Remover lote ${i + 1}`}
                    variant="ghost"
                    color="fg.muted"
                    mt={{ base: "0", sm: i === 0 ? "7" : "0" }}
                    justifySelf={{ base: "end", sm: "auto" }}
                    disabled={entradas.fields.length === 1}
                    onClick={() => entradas.remove(i)}
                  >
                    <Trash2 aria-hidden />
                  </IconButton>
                </Grid>
              );
            })}
            <Box>
              <Button variant="outline" size="sm" onClick={() => entradas.append({ lote_id: "", quantidade: "" })}>
                <Plus aria-hidden /> Adicionar lote
              </Button>
            </Box>
          </Stack>
        </FormFieldset>
      </Stack>

      {/* Passo 2 — Produtos gerados */}
      <Stack gap="5" display={passo === 1 ? "flex" : "none"}>
        <FormFieldset
          legend="Produtos gerados"
          helperText="Cada produto vira um lote novo no estoque de produção."
          errorText={errors.saidas?.root?.message ?? errosDeGrupo.saidas}
        >
          <Stack gap="3">
            {saidas.fields.map((f, i) => {
              const sel = produto(vSaidas[i]?.produto_id ?? "");
              return (
                <Grid key={f.id} templateColumns={{ base: "1fr", sm: "1fr 200px auto" }} gap="3" alignItems="start">
                  <Controller
                    control={control}
                    name={`saidas.${i}.produto_id`}
                    rules={{ required: "Escolha o produto." }}
                    render={({ field }) => (
                      <Select
                        id={`proc-saidas-${i}-produto_id`}
                        label={`Produto ${i + 1}`}
                        hideLabel={i > 0}
                        required
                        placeholder={opcoes.produtos.length ? "Escolha o produto" : "Crie um produto abaixo"}
                        options={opcoes.produtos.map((p) => ({ value: p.value, label: p.label }))}
                        value={field.value || null}
                        onValueChange={(val) => field.onChange(val ?? "")}
                        errorText={errors.saidas?.[i]?.produto_id?.message}
                        invalid={Boolean(errors.saidas?.[i]?.produto_id)}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`saidas.${i}.quantidade`}
                    rules={{ validate: (val) => quantidadeValida(val, { inteiro: sel?.unidade === "UNIDADE" }) }}
                    render={({ field }) => (
                      <CampoNumero
                        id={`proc-saidas-${i}-quantidade`}
                        label={i > 0 ? `Quantidade do produto ${i + 1}` : "Quantidade"}
                        required
                        inteiro={sel?.unidade === "UNIDADE"}
                        unit={sel ? UNIDADE_LABEL[sel.unidade].curta : undefined}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        errorText={errors.saidas?.[i]?.quantidade?.message}
                        invalid={Boolean(errors.saidas?.[i]?.quantidade)}
                      />
                    )}
                  />
                  <IconButton
                    aria-label={`Remover produto ${i + 1}`}
                    variant="ghost"
                    color="fg.muted"
                    mt={{ base: "0", sm: i === 0 ? "7" : "0" }}
                    justifySelf={{ base: "end", sm: "auto" }}
                    disabled={saidas.fields.length === 1}
                    onClick={() => saidas.remove(i)}
                  >
                    <Trash2 aria-hidden />
                  </IconButton>
                </Grid>
              );
            })}
            <Flex gap="2" wrap="wrap">
              <Button variant="outline" size="sm" onClick={() => saidas.append({ produto_id: "", quantidade: "" })}>
                <Plus aria-hidden /> Adicionar produto
              </Button>
            </Flex>
          </Stack>
        </FormFieldset>

        <NovoProduto
          onCriado={(p) => {
            onProdutoCriado(p);
            // Preenche a primeira linha sem produto (ou cria uma nova).
            const linhas = getValues("saidas");
            const vazia = linhas.findIndex((l) => !l.produto_id);
            if (vazia >= 0) setValue(`saidas.${vazia}.produto_id`, p.value, { shouldValidate: true });
            else saidas.append({ produto_id: p.value, quantidade: "" });
          }}
          onSessaoExpirada={onSessaoExpirada}
        />

        <Box maxW={{ sm: "260px" }}>
          <Controller
            control={control}
            name="perda_kg"
            rules={{
              validate: (val) => {
                if (!val.trim()) return true;
                const n = parseDecimalBR(val);
                if (!Number.isFinite(n) || n < 0) return "Use um número, como 2,5.";
                if (n > kgEntrada) return `Maior que os ${formatQuantidade(kgEntrada, "QUILOGRAMA")} de entrada.`;
                return true;
              },
            }}
            render={({ field }) => (
              <CampoNumero
                id="proc-perda"
                label="Descarte"
                optional
                unit="kg"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                helperText="Casca e caroço."
                errorText={errors.perda_kg?.message}
                invalid={Boolean(errors.perda_kg)}
              />
            )}
          />
        </Box>

        <Box p="4" borderRadius="lg" bg="bg.subtle" borderWidth="1px" borderColor="border" aria-live="polite">
          {rendimento === null ? (
            <Text fontSize="sm" color="fg.muted">
              O rendimento aparece quando há entradas em kg.
            </Text>
          ) : (
            <Progress
              label="Rendimento estimado"
              value={Math.min(100, rendimento)}
              showValueText
              formatValue={() => `${rendimento.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}
              helperText={`${formatQuantidade(kgSaida, "QUILOGRAMA")} de produtos de ${formatQuantidade(kgEntrada, "QUILOGRAMA")} de entrada.`}
            />
          )}
        </Box>
      </Stack>

      {/* Passo 3 — Custos e insumos */}
      <Stack gap="5" display={passo === 2 ? "flex" : "none"}>
        <FormFieldset
          legend="Insumos usados"
          helperText="Sai do lote que vence antes."
          errorText={errors.insumos?.root?.message ?? errosDeGrupo.insumos}
        >
          <Stack gap="3">
            {insumos.fields.length === 0 ? (
              <Text fontSize="sm" color="fg.muted">
                Nenhum insumo adicionado.
              </Text>
            ) : null}
            {insumos.fields.map((f, i) => {
              const sel = insumo(vInsumos[i]?.insumo_id ?? "");
              return (
                <Grid key={f.id} templateColumns={{ base: "1fr", sm: "1fr 200px auto" }} gap="3" alignItems="start">
                  <Controller
                    control={control}
                    name={`insumos.${i}.insumo_id`}
                    rules={{ required: "Escolha o insumo." }}
                    render={({ field }) => (
                      <Select
                        id={`proc-insumos-${i}-insumo_id`}
                        label={`Insumo ${i + 1}`}
                        hideLabel={i > 0}
                        required
                        placeholder={opcoes.insumos.length ? "Escolha o insumo" : "Nenhum insumo com saldo"}
                        disabled={opcoes.insumos.length === 0}
                        options={opcoes.insumos.map((x) => ({
                          value: x.value,
                          label: `${x.label} — ${formatQuantidade(x.saldo, x.unidade)}`,
                        }))}
                        value={field.value || null}
                        onValueChange={(val) => field.onChange(val ?? "")}
                        errorText={errors.insumos?.[i]?.insumo_id?.message}
                        invalid={Boolean(errors.insumos?.[i]?.insumo_id)}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`insumos.${i}.quantidade`}
                    rules={{
                      validate: (val) =>
                        quantidadeValida(val, {
                          inteiro: sel?.unidade === "UNIDADE",
                          maximo: sel ? { valor: sel.saldo, unidade: sel.unidade } : undefined,
                        }),
                    }}
                    render={({ field }) => (
                      <CampoNumero
                        id={`proc-insumos-${i}-quantidade`}
                        label={i > 0 ? `Quantidade do insumo ${i + 1}` : "Quantidade"}
                        required
                        inteiro={sel?.unidade === "UNIDADE"}
                        unit={sel ? UNIDADE_LABEL[sel.unidade].curta : undefined}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        errorText={errors.insumos?.[i]?.quantidade?.message}
                        invalid={Boolean(errors.insumos?.[i]?.quantidade)}
                      />
                    )}
                  />
                  <IconButton
                    aria-label={`Remover insumo ${i + 1}`}
                    variant="ghost"
                    color="fg.muted"
                    mt={{ base: "0", sm: i === 0 ? "7" : "0" }}
                    justifySelf={{ base: "end", sm: "auto" }}
                    onClick={() => insumos.remove(i)}
                  >
                    <Trash2 aria-hidden />
                  </IconButton>
                </Grid>
              );
            })}
            <Box>
              <Button
                variant="outline"
                size="sm"
                disabled={opcoes.insumos.length === 0}
                onClick={() => insumos.append({ insumo_id: "", quantidade: "" })}
              >
                <Plus aria-hidden /> Adicionar insumo
              </Button>
            </Box>
          </Stack>
        </FormFieldset>

        <Box maxW={{ sm: "260px" }}>
          <Controller
            control={control}
            name="custo_adicional"
            rules={{
              validate: (val) => {
                if (!val.trim()) return true;
                const n = parseDecimalBR(val);
                return (Number.isFinite(n) && n >= 0) || "Use um valor, como 150,00.";
              },
            }}
            render={({ field }) => (
              <CampoNumero
                id="proc-custo"
                label="Custo adicional"
                optional
                unit="R$"
                casas={2}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                helperText="Mão de obra, energia, gás…"
                errorText={errors.custo_adicional?.message}
                invalid={Boolean(errors.custo_adicional)}
              />
            )}
          />
        </Box>
        <Textarea
          label="Observações"
          optional
          errorText={errors.observacoes?.message}
          invalid={Boolean(errors.observacoes)}
          {...register("observacoes", { maxLength: { value: 5000, message: "Use até 5000 caracteres." } })}
        />
      </Stack>

      <Flex
        gap="3"
        justify="space-between"
        position="sticky"
        bottom="0"
        bg="bg.panel"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
        mt="-2"
      >
        {passo > 0 ? (
          <Button variant="ghost" onClick={() => setPasso((p) => p - 1)} disabled={isSubmitting}>
            Voltar
          </Button>
        ) : (
          <Button variant="ghost" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
        {passo < ultimo ? (
          <Button type="submit">Continuar</Button>
        ) : (
          <Button type="submit" loading={isSubmitting} loadingText="Registrando…">
            Registrar processamento
          </Button>
        )}
      </Flex>
    </chakra.form>
  );
}

/* ------------------------------------------------------------------ */

/** Criação rápida de produto, sem sair do formulário (fica dentro do mesmo <form>: botões são type="button"). */
function NovoProduto({
  onCriado,
  onSessaoExpirada,
}: {
  onCriado: (p: OpcoesDeProcessamento["produtos"][number]) => void;
  onSessaoExpirada: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoDeProduto>("POLPA");
  const [unidade, setUnidade] = useState<Unidade>("QUILOGRAMA");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!aberto) {
    return (
      <Box>
        <Button variant="ghost" size="sm" color="primary" onClick={() => setAberto(true)}>
          <PackagePlus aria-hidden /> O produto não está na lista? Criar produto
        </Button>
      </Box>
    );
  }

  async function criar() {
    if (!nome.trim()) {
      setErro("Informe o nome do produto.");
      return;
    }
    setEnviando(true);
    const r = await criarProdutoAction({ nome, tipo, unidade });
    setEnviando(false);
    if (r.status === "ok") {
      NotificationToast.success({ title: `Produto “${r.data.label}” criado` });
      onCriado(r.data);
      setNome("");
      setErro(null);
      setAberto(false);
    } else if (r.status === "unauthenticated") onSessaoExpirada();
    else if (r.status === "invalid") setErro(r.fields.nome ?? r.message ?? Object.values(r.fields).join(" "));
    else setErro(r.message);
  }

  return (
    <Box p="4" borderRadius="lg" borderWidth="1px" borderColor="border" bg="bg.panel">
      <FormFieldset legend="Novo produto" helperText="Fica disponível só nesta propriedade.">
        <Grid templateColumns={{ base: "1fr", sm: "2fr 1fr 1fr" }} gap="3">
          <TextInput
            label="Nome"
            required
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              if (erro) setErro(null);
            }}
            placeholder="Ex.: Polpa de manga 1 kg"
            errorText={erro ?? undefined}
            invalid={Boolean(erro)}
          />
          <Select
            label="Tipo"
            required
            options={Object.entries(TIPO_DE_PRODUTO_LABEL).map(([value, label]) => ({ value, label }))}
            value={tipo}
            onValueChange={(v) => v && setTipo(v as TipoDeProduto)}
          />
          <Select
            label="Unidade"
            required
            options={UNIDADES_DE_PRODUTO.map((u) => ({ value: u, label: UNIDADE_LABEL[u].plural }))}
            value={unidade}
            onValueChange={(v) => v && setUnidade(v as Unidade)}
          />
        </Grid>
        <Flex gap="2" justify="flex-end" mt="3">
          <Button variant="ghost" size="sm" onClick={() => setAberto(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button size="sm" onClick={criar} loading={enviando} loadingText="Criando…">
            Criar produto
          </Button>
        </Flex>
      </FormFieldset>
    </Box>
  );
}
