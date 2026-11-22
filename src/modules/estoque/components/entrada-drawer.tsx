"use client";

import { Button, Flex, Grid, Heading, Skeleton, Stack, Text, chakra } from "@chakra-ui/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { DatePicker } from "@/components/forms/date-picker";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Select } from "@/components/forms/select";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import { CampoNumero } from "./campo-numero";
import { criarLoteAction, opcoesDeEntradaAction, type OpcoesDeEntrada } from "@/lib/estoque/actions";
import { formatQuantidade, hojeISO, parseDecimalBR } from "@/lib/estoque/format";
import { UNIDADE_LABEL, UNIDADES_VEGETAIS, type Unidade } from "@/lib/estoque/types";

interface Valores {
  categoria: "SEMENTE" | "MUDA";
  especie_id: string;
  cultivar_id: string;
  insumo_id: string;
  origem: "ADQUIRIDO" | "PRODUZIDO";
  lote_de_origem_id: string;
  quantidade_consumida_da_origem: string;
  codigo: string;
  fornecedor: string;
  data_de_entrada: string;
  quantidade_inicial: string;
  unidade: Unidade;
  valor_total: string;
  custo_adicional: string;
  taxa_de_germinacao_pct: string;
  lote_do_fabricante: string;
  validade: string;
  procedencia: string;
  observacoes: string;
}

const CAMPOS = new Set<string>([
  "categoria",
  "especie_id",
  "cultivar_id",
  "insumo_id",
  "origem",
  "lote_de_origem_id",
  "quantidade_consumida_da_origem",
  "codigo",
  "fornecedor",
  "data_de_entrada",
  "quantidade_inicial",
  "unidade",
  "valor_total",
  "custo_adicional",
  "taxa_de_germinacao_pct",
  "lote_do_fabricante",
  "validade",
  "procedencia",
  "observacoes",
]);

/** "1.234,5" → "1234.5" para a API; vazio → undefined. */
const decimal = (v: string) => {
  const n = parseDecimalBR(v);
  return Number.isFinite(n) ? String(n) : undefined;
};

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Stack gap="3.5" as="fieldset" border="0" p="0" m="0">
      <Heading as="legend" textStyle="overline" color="fg.muted" m="0" mb="1">
        {titulo}
      </Heading>
      {children}
    </Stack>
  );
}

/** Drawer "Registrar entrada": cria um lote no estoque de material vegetal ou de insumos. */
export function EntradaDrawer({
  tipo,
  open,
  onOpenChange,
  onCriado,
}: {
  tipo: "vegetal" | "insumos";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCriado: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [opcoes, setOpcoes] = useState<OpcoesDeEntrada | null>(null);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!open) return;
    let vivo = true;
    void opcoesDeEntradaAction(tipo).then((r) => {
      if (!vivo) return;
      if (r.status === "ok") {
        setOpcoes(r.opcoes);
        setFalhou(false);
      } else setFalhou(true);
    });
    return () => {
      vivo = false;
    };
  }, [open, tipo, tentativa]);

  return (
    <Drawer
      open={open}
      onOpenChange={(d) => onOpenChange(d.open)}
      title={tipo === "vegetal" ? "Registrar entrada de mudas e sementes" : "Registrar entrada de insumo"}
      size="lg"
      bottomSheetOnMobile
    >
      {falhou && !opcoes ? (
        <ErrorState size="sm" onRetry={() => setTentativa((t) => t + 1)} />
      ) : !opcoes ? (
        <Stack gap="4" aria-busy="true" aria-label="Carregando formulário">
          <Skeleton h="10" />
          <Skeleton h="10" />
          <Skeleton h="10" />
          <Skeleton h="24" />
        </Stack>
      ) : (
        <EntradaForm
          tipo={tipo}
          opcoes={opcoes}
          onCancelar={() => onOpenChange(false)}
          onSessaoExpirada={expireSession}
          onCriado={(id) => {
            NotificationToast.success({ title: "Entrada registrada" });
            onOpenChange(false);
            onCriado(id);
          }}
        />
      )}
    </Drawer>
  );
}

function EntradaForm({
  tipo,
  opcoes,
  onCancelar,
  onCriado,
  onSessaoExpirada,
}: {
  tipo: "vegetal" | "insumos";
  opcoes: OpcoesDeEntrada;
  onCancelar: () => void;
  onCriado: (id: string) => void;
  onSessaoExpirada: () => void;
}) {
  const chave = useRef(crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const hoje = hojeISO();

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    defaultValues: {
      categoria: "MUDA",
      origem: "ADQUIRIDO",
      unidade: "UNIDADE",
      data_de_entrada: hoje,
      especie_id: "",
      cultivar_id: "",
      insumo_id: "",
      lote_de_origem_id: "",
      quantidade_consumida_da_origem: "",
      codigo: "",
      fornecedor: "",
      quantidade_inicial: "",
      valor_total: "",
      custo_adicional: "",
      taxa_de_germinacao_pct: "",
      lote_do_fabricante: "",
      validade: "",
      procedencia: "",
      observacoes: "",
    },
    mode: "onTouched",
  });

  const [categoria, origem, especieId, insumoId, loteOrigemId, unidadeEscolhida] = useWatch({
    control,
    name: ["categoria", "origem", "especie_id", "insumo_id", "lote_de_origem_id", "unidade"],
  });
  const produzido = origem === "PRODUZIDO";
  const insumo = opcoes.insumos.find((i) => i.value === insumoId);
  const unidade: Unidade =
    tipo === "insumos" ? (insumo?.unidade ?? "UNIDADE") : categoria === "MUDA" ? "UNIDADE" : unidadeEscolhida;
  const inteiro = unidade === "UNIDADE";
  const cultivares = opcoes.cultivares.filter((c) => c.grupo === especieId);
  const origens = opcoes.lotesDeOrigem.filter((l) => !especieId || l.grupo === especieId);
  const loteOrigem = opcoes.lotesDeOrigem.find((l) => l.value === loteOrigemId);

  const quantidadeValida = (v: string, { obrigatorio = true, inteiroSe = inteiro } = {}) => {
    if (!v) return obrigatorio ? "Informe a quantidade." : true;
    const n = parseDecimalBR(v);
    if (!Number.isFinite(n) || n <= 0) return "Use um número maior que zero.";
    if (inteiroSe && !Number.isInteger(n)) return "Em unidades, use um número inteiro.";
    return true;
  };

  const opcionalValido = (v: string, { max }: { max?: number } = {}) => {
    if (!v.trim()) return true;
    const n = parseDecimalBR(v);
    if (!Number.isFinite(n) || n < 0) return "Use um número, como 1.250,00.";
    if (max !== undefined && n > max) return `Use no máximo ${max}.`;
    return true;
  };

  async function enviar(v: Valores) {
    setErro(null);
    const comum = {
      origem: v.origem,
      codigo: v.codigo.trim(),
      fornecedor: produzido ? "" : v.fornecedor.trim(),
      data_de_entrada: v.data_de_entrada,
      quantidade_inicial: decimal(v.quantidade_inicial),
      valor_total: produzido ? undefined : decimal(v.valor_total),
      custo_adicional: produzido ? decimal(v.custo_adicional) : undefined,
      validade: v.validade || undefined,
      observacoes: v.observacoes.trim(),
    };
    const dados =
      tipo === "vegetal"
        ? {
            ...comum,
            categoria: v.categoria,
            especie_id: v.especie_id,
            cultivar_id: v.cultivar_id || undefined,
            unidade,
            taxa_de_germinacao_pct: v.categoria === "SEMENTE" ? decimal(v.taxa_de_germinacao_pct) : undefined,
            lote_de_origem_id: produzido ? v.lote_de_origem_id || undefined : undefined,
            quantidade_consumida_da_origem:
              produzido && v.lote_de_origem_id ? decimal(v.quantidade_consumida_da_origem) : undefined,
            procedencia: v.procedencia.trim(),
          }
        : { ...comum, insumo_id: v.insumo_id, lote_do_fabricante: v.lote_do_fabricante.trim() };

    const r = await criarLoteAction(tipo, dados, chave.current);
    if (r.status === "ok") {
      chave.current = crypto.randomUUID();
      onCriado(r.data.id);
      return;
    }
    if (r.status === "unauthenticated") return onSessaoExpirada();
    if (r.status === "invalid") {
      let primeiro = true;
      const soltos: string[] = [];
      for (const [campo, msg] of Object.entries(r.fields)) {
        if (CAMPOS.has(campo)) {
          setError(campo as FieldPath<Valores>, { type: "server", message: msg }, { shouldFocus: primeiro });
          primeiro = false;
        } else soltos.push(msg);
      }
      if (soltos.length || primeiro) setErro(soltos.join(" ") || r.message || "Confira os campos.");
      return;
    }
    setErro(r.message);
  }

  const err = (k: keyof Valores) => ({ errorText: errors[k]?.message, invalid: Boolean(errors[k]) });

  return (
    <chakra.form onSubmit={(e) => void handleSubmit(enviar)(e)} noValidate display="flex" flexDirection="column" gap="6">
      {erro ? <Alert status="error" title="Não foi possível registrar" description={erro} /> : null}

      <Secao titulo="O que entrou">
        {tipo === "vegetal" ? (
          <>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <SegmentedControl
                  label="Material"
                  showLabel
                  fullWidth
                  items={[
                    { value: "MUDA", label: "Mudas" },
                    { value: "SEMENTE", label: "Sementes" },
                  ]}
                  value={field.value}
                  onValueChange={(val) => {
                    if (!val) return;
                    field.onChange(val);
                    if (val === "MUDA") setValue("unidade", "UNIDADE");
                  }}
                />
              )}
            />
            <Controller
              control={control}
              name="especie_id"
              rules={{ required: "Escolha a espécie." }}
              render={({ field }) => (
                <Select
                  label="Espécie"
                  required
                  placeholder="Escolha a espécie"
                  options={opcoes.especies.map((e) => ({ value: e.value, label: e.label }))}
                  value={field.value || null}
                  onValueChange={(val) => {
                    field.onChange(val ?? "");
                    setValue("cultivar_id", "");
                    setValue("lote_de_origem_id", "");
                  }}
                  {...err("especie_id")}
                />
              )}
            />
            <Controller
              control={control}
              name="cultivar_id"
              render={({ field }) => (
                <Select
                  label="Cultivo"
                  optional
                  clearable
                  disabled={!especieId || cultivares.length === 0}
                  placeholder={!especieId ? "Escolha a espécie primeiro" : cultivares.length ? "Sem cultivo" : "Espécie sem cultivos"}
                  options={cultivares.map((c) => ({ value: c.value, label: c.label }))}
                  value={field.value || null}
                  onValueChange={(val) => field.onChange(val ?? "")}
                  {...err("cultivar_id")}
                />
              )}
            />
          </>
        ) : (
          <Controller
            control={control}
            name="insumo_id"
            rules={{ required: "Escolha o insumo." }}
            render={({ field }) => (
              <Select
                label="Insumo"
                required
                placeholder={opcoes.insumos.length ? "Escolha o insumo" : "Nenhum insumo no catálogo"}
                options={opcoes.insumos.map((i) => ({ value: i.value, label: i.label }))}
                value={field.value || null}
                onValueChange={(val) => field.onChange(val ?? "")}
                helperText={insumo?.unidade ? `Medido em ${UNIDADE_LABEL[insumo.unidade].plural}.` : undefined}
                {...err("insumo_id")}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name="origem"
          render={({ field }) => (
            <SegmentedControl
              label="Origem"
              showLabel
              fullWidth
              items={[
                { value: "ADQUIRIDO", label: "Adquirido" },
                { value: "PRODUZIDO", label: "Produzido na propriedade" },
              ]}
              value={field.value}
              onValueChange={(val) => val && field.onChange(val)}
            />
          )}
        />

        {tipo === "vegetal" && produzido ? (
          <>
            <Controller
              control={control}
              name="lote_de_origem_id"
              render={({ field }) => (
                <Select
                  label="Produzido a partir do lote"
                  optional
                  clearable
                  placeholder={origens.length ? "Origem não rastreada" : "Nenhum lote com saldo desta espécie"}
                  disabled={origens.length === 0}
                  options={origens.map((l) => ({
                    value: l.value,
                    label: `${l.label} — ${formatQuantidade(l.saldo, l.unidade ?? "UNIDADE")}`,
                  }))}
                  value={field.value || null}
                  onValueChange={(val) => field.onChange(val ?? "")}
                  helperText="O custo vem do lote de origem."
                  {...err("lote_de_origem_id")}
                />
              )}
            />
            {loteOrigem ? (
              <Controller
                control={control}
                name="quantidade_consumida_da_origem"
                rules={{
                  validate: (val) => {
                    const ok = quantidadeValida(val, { inteiroSe: loteOrigem.unidade === "UNIDADE" });
                    if (ok !== true) return ok;
                    return parseDecimalBR(val) > Number(loteOrigem.saldo) ? "Maior que o saldo do lote de origem." : true;
                  },
                }}
                render={({ field }) => (
                  <CampoNumero
                    inteiro={loteOrigem.unidade === "UNIDADE"}
                    label="Quantidade usada da origem"
                    required
                    unit={UNIDADE_LABEL[loteOrigem.unidade ?? "UNIDADE"].curta}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    helperText={`Saldo da origem: ${formatQuantidade(loteOrigem.saldo, loteOrigem.unidade ?? "UNIDADE")}`}
                    {...err("quantidade_consumida_da_origem")}
                  />
                )}
              />
            ) : null}
          </>
        ) : null}
      </Secao>

      <Secao titulo="Quantidade e data">
        <Grid templateColumns={tipo === "vegetal" && categoria === "SEMENTE" ? { base: "1fr", sm: "1fr 160px" } : "1fr"} gap="3.5">
          <Controller
            control={control}
            name="quantidade_inicial"
            rules={{ validate: (val) => quantidadeValida(val) }}
            render={({ field }) => (
              <CampoNumero
                inteiro={inteiro}
                label="Quantidade"
                required
                unit={UNIDADE_LABEL[unidade].curta}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                helperText={tipo === "vegetal" && categoria === "MUDA" ? "Mudas são contadas em unidades." : undefined}
                {...err("quantidade_inicial")}
              />
            )}
          />
          {tipo === "vegetal" && categoria === "SEMENTE" ? (
            <Controller
              control={control}
              name="unidade"
              render={({ field }) => (
                <Select
                  label="Unidade"
                  required
                  options={UNIDADES_VEGETAIS.map((u) => ({ value: u, label: UNIDADE_LABEL[u].plural }))}
                  value={field.value}
                  onValueChange={(val) => val && field.onChange(val)}
                  {...err("unidade")}
                />
              )}
            />
          ) : null}
        </Grid>
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3.5">
          <Controller
            control={control}
            name="data_de_entrada"
            rules={{ required: "Informe a data de entrada." }}
            render={({ field }) => (
              <DatePicker
                label="Data de entrada"
                required
                value={field.value || null}
                onValueChange={(val) => field.onChange(val ?? "")}
                min={loteOrigem?.dataDeEntrada}
                max={hoje}
                {...err("data_de_entrada")}
              />
            )}
          />
          <Controller
            control={control}
            name="validade"
            render={({ field }) => (
              <DatePicker
                label="Validade"
                optional
                value={field.value || null}
                onValueChange={(val) => field.onChange(val ?? "")}
                {...err("validade")}
              />
            )}
          />
        </Grid>
      </Secao>

      <Secao titulo={produzido ? "Custo de produção" : "Compra"}>
        {produzido ? (
          <Controller
            control={control}
            name="custo_adicional"
            rules={{ validate: (val) => opcionalValido(val) }}
            render={({ field }) => (
              <CampoNumero
                casas={2}
                label="Custo adicional"
                optional
                unit="R$"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                helperText="Mão de obra, substrato, embalagens…"
                {...err("custo_adicional")}
              />
            )}
          />
        ) : (
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3.5">
            <TextInput label="Fornecedor" optional autoComplete="organization" {...err("fornecedor")} {...register("fornecedor")} />
            <Controller
              control={control}
              name="valor_total"
              rules={{ validate: (val) => opcionalValido(val) }}
              render={({ field }) => (
                <CampoNumero
                  casas={2}
                  label="Valor pago"
                  optional
                  unit="R$"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  helperText="Sem valor, o lote fica sem custo."
                  {...err("valor_total")}
                />
              )}
            />
          </Grid>
        )}
      </Secao>

      <Secao titulo="Mais detalhes">
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3.5">
          <TextInput
            label="Código do lote"
            optional
            fontFamily="mono"
            autoCapitalize="characters"
            helperText="Único na propriedade."
            {...err("codigo")}
            {...register("codigo", { maxLength: { value: 32, message: "Use até 32 caracteres." } })}
          />
          {tipo === "vegetal" && categoria === "SEMENTE" ? (
            <Controller
              control={control}
              name="taxa_de_germinacao_pct"
              rules={{ validate: (val) => opcionalValido(val, { max: 100 }) }}
              render={({ field }) => (
                <CampoNumero
                  label="Taxa de germinação"
                  optional
                  unit="%"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  {...err("taxa_de_germinacao_pct")}
                />
              )}
            />
          ) : tipo === "insumos" ? (
            <TextInput label="Lote do fabricante" optional {...err("lote_do_fabricante")} {...register("lote_do_fabricante")} />
          ) : null}
        </Grid>
        {tipo === "vegetal" ? (
          <Textarea
            label="Procedência"
            optional
            placeholder="Viveiro, matriz, certificação…"
            {...err("procedencia")}
            {...register("procedencia")}
          />
        ) : null}
        <Textarea label="Observações" optional {...err("observacoes")} {...register("observacoes")} />
      </Secao>

      <Flex
        gap="3"
        justify="flex-end"
        position="sticky"
        bottom="0"
        bg="bg.panel"
        py="3"
        borderTopWidth="1px"
        borderColor="border"
        mt="-2"
      >
        <Button variant="ghost" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} loadingText="Registrando…">
          Registrar entrada
        </Button>
      </Flex>
      <Text srOnly aria-live="polite">
        {isSubmitting ? "Registrando entrada" : ""}
      </Text>
    </chakra.form>
  );
}
