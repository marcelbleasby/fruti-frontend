"use client";

import { Button, Flex, Grid, Skeleton, Stack, chakra } from "@chakra-ui/react";
import { useEffect, useEffectEvent, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { ErrorState } from "@/components/feedback/error-state";
import { NotificationToast } from "@/components/feedback/notification-toast";
import { Select } from "@/components/forms/select";
import { Switch } from "@/components/forms/switch";
import { TextInput } from "@/components/forms/text-input";
import { Textarea } from "@/components/forms/textarea";
import { Drawer } from "@/components/overlays/drawer";
import { useAuth } from "@/lib/auth/auth-context";
import {
  detalheDaCultivarAction,
  detalheDaEspecieAction,
  opcoesDeEspeciesAction,
  salvarCultivarAction,
  salvarEspecieAction,
} from "@/lib/catalogo/actions";
import { parseDecimalBR } from "@/lib/estoque/format";
import { useListaUrl } from "@/lib/use-lista-url";
import { CampoNumero } from "@/modules/estoque/components/campo-numero";

/**
 * Formulários do catálogo (só administração global), abertos pela URL:
 * `?form=especie[&alvo=<id>]` e `?form=cultivar[&alvo=<id>][&especieAlvo=<id>]`.
 */
export function CatalogoFormularios({ abrirCultivarSalva = true }: { abrirCultivarSalva?: boolean }) {
  const url = useListaUrl();
  const { user } = useAuth();
  const admin = Boolean(user?.administradorGlobal);
  const form = admin ? url.aberto("form") : null;
  const alvo = url.aberto("alvo");
  const especieAlvo = url.aberto("especieAlvo");

  function fechar() {
    url.setFiltros({ form: null, alvo: null, especieAlvo: null, pagina: url.get("pagina") });
  }

  return (
    <>
      <Drawer
        open={form === "especie"}
        onOpenChange={(d) => !d.open && fechar()}
        title={alvo ? "Editar espécie" : "Nova espécie"}
        size="md"
        bottomSheetOnMobile
      >
        {form === "especie" ? (
          <EspecieForm
            key={alvo ?? "nova"}
            id={alvo}
            onCancelar={fechar}
            onSalva={(id) => {
              NotificationToast.success({ title: alvo ? "Espécie atualizada" : "Espécie cadastrada" });
              url.setFiltros({ form: null, alvo: null, especie: id, pagina: url.get("pagina") });
            }}
          />
        ) : null}
      </Drawer>
      <Drawer
        open={form === "cultivar"}
        onOpenChange={(d) => !d.open && fechar()}
        title={alvo ? "Editar cultivo" : "Novo cultivo"}
        size="md"
        bottomSheetOnMobile
      >
        {form === "cultivar" ? (
          <CultivarForm
            key={alvo ?? `nova-${especieAlvo ?? ""}`}
            id={alvo}
            especieInicial={especieAlvo}
            onCancelar={fechar}
            onSalva={(id) => {
              NotificationToast.success({ title: alvo ? "Cultivo atualizado" : "Cultivo cadastrado" });
              // Tela de cultivares: abre a cultivar salva. Tela de espécies: mantém o drawer da espécie (que recarrega).
              url.setFiltros({
                form: null,
                alvo: null,
                especieAlvo: null,
                ...(abrirCultivarSalva ? { cultivar: id } : {}),
                pagina: url.get("pagina"),
              });
            }}
          />
        ) : null}
      </Drawer>
    </>
  );
}

function Carregando() {
  return (
    <Stack gap="4" aria-busy="true" aria-label="Carregando formulário">
      <Skeleton h="10" />
      <Skeleton h="10" />
      <Skeleton h="24" />
    </Stack>
  );
}

function Rodape({ enviando, onCancelar, rotulo }: { enviando: boolean; onCancelar: () => void; rotulo: string }) {
  return (
    <Flex gap="3" justify="flex-end" position="sticky" bottom="0" bg="bg.panel" py="3" borderTopWidth="1px" borderColor="border" mt="-2">
      <Button variant="ghost" onClick={onCancelar} disabled={enviando}>
        Cancelar
      </Button>
      <Button type="submit" loading={enviando} loadingText="Salvando…">
        {rotulo}
      </Button>
    </Flex>
  );
}

/* ------------------------------------------------------------------ */

interface ValoresEspecie {
  nome_comum: string;
  nome_cientifico: string;
  descricao: string;
  ativa: boolean;
}

function EspecieForm({ id, onCancelar, onSalva }: { id: string | null; onCancelar: () => void; onSalva: (id: string) => void }) {
  const { expireSession } = useAuth();
  const [inicial, setInicial] = useState<ValoresEspecie | null>(id ? null : { nome_comum: "", nome_cientifico: "", descricao: "", ativa: true });
  const [falhou, setFalhou] = useState(false);

  const aoCarregar = useEffectEvent((r: Awaited<ReturnType<typeof detalheDaEspecieAction>>) => {
    if (r.status === "ok")
      setInicial({
        nome_comum: r.especie.name === r.especie.scientificName ? "" : r.especie.name,
        nome_cientifico: r.especie.scientificName,
        descricao: r.especie.description ?? "",
        ativa: r.especie.active !== false,
      });
    else if (r.status === "unauthenticated") expireSession();
    else setFalhou(true);
  });

  useEffect(() => {
    if (!id) return;
    let vivo = true;
    void detalheDaEspecieAction(id).then((r) => vivo && aoCarregar(r));
    return () => {
      vivo = false;
    };
  }, [id]);

  if (falhou) return <ErrorState size="sm" title="Não foi possível carregar a espécie" />;
  if (!inicial) return <Carregando />;
  return <EspecieFormCampos id={id} inicial={inicial} onCancelar={onCancelar} onSalva={onSalva} />;
}

function EspecieFormCampos({
  id,
  inicial,
  onCancelar,
  onSalva,
}: {
  id: string | null;
  inicial: ValoresEspecie;
  onCancelar: () => void;
  onSalva: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresEspecie>({ defaultValues: inicial, mode: "onTouched" });

  async function salvar(v: ValoresEspecie) {
    setErro(null);
    const r = await salvarEspecieAction(id, v);
    if (r.status === "ok") return onSalva(r.data.id);
    if (r.status === "unauthenticated") return expireSession();
    if (r.status === "invalid") {
      for (const [campo, msg] of Object.entries(r.fields)) {
        if (campo in inicial) setError(campo as FieldPath<ValoresEspecie>, { type: "server", message: msg });
        else setErro(msg);
      }
      return;
    }
    // Conflito (nome científico repetido) vai para o campo; o resto, no alerta.
    if (r.status === "rejected" && /nome científico/i.test(r.message)) setError("nome_cientifico", { type: "server", message: r.message });
    else setErro(r.message);
  }

  return (
    <chakra.form noValidate display="flex" flexDirection="column" gap="5" onSubmit={(e) => void handleSubmit(salvar)(e)}>
      {erro ? <Alert status="error" title="Não foi possível salvar" description={erro} /> : null}
      <TextInput
        label="Nome científico"
        required
        fontStyle="italic"
        placeholder="Ex.: Mangifera indica"
        autoCapitalize="sentences"
        spellCheck={false}
        errorText={errors.nome_cientifico?.message}
        invalid={Boolean(errors.nome_cientifico)}
        {...register("nome_cientifico", {
          setValueAs: (v: string) => v.trim(),
          required: "Informe o nome científico.",
          maxLength: { value: 255, message: "Use até 255 caracteres." },
        })}
      />
      <TextInput
        label="Nome popular"
        optional
        placeholder="Ex.: Manga"
        helperText="Aparece nas listas; sem ele, vale o científico."
        errorText={errors.nome_comum?.message}
        invalid={Boolean(errors.nome_comum)}
        {...register("nome_comum", { setValueAs: (v: string) => v.trim(), maxLength: { value: 255, message: "Use até 255 caracteres." } })}
      />
      <Textarea
        label="Descrição"
        optional
        errorText={errors.descricao?.message}
        invalid={Boolean(errors.descricao)}
        {...register("descricao", { maxLength: { value: 5000, message: "Use até 5000 caracteres." } })}
      />
      <Controller
        control={control}
        name="ativa"
        render={({ field }) => (
          <Switch
            label="Ativa"
            labelPosition="end"
            description="Inativa: some para novos plantios."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
      <Rodape enviando={isSubmitting} onCancelar={onCancelar} rotulo={id ? "Salvar alterações" : "Cadastrar espécie"} />
    </chakra.form>
  );
}

/* ------------------------------------------------------------------ */

interface ValoresCultivar {
  especie_id: string;
  nome: string;
  descricao: string;
  linhas: string;
  plantas: string;
  meses: string;
  observacoes: string;
}

const brl = (n: number | undefined) => (n === undefined ? "" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }));

function CultivarForm({
  id,
  especieInicial,
  onCancelar,
  onSalva,
}: {
  id: string | null;
  especieInicial: string | null;
  onCancelar: () => void;
  onSalva: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [especies, setEspecies] = useState<{ value: string; label: string }[] | null>(null);
  const [inicial, setInicial] = useState<ValoresCultivar | null>(
    id ? null : { especie_id: especieInicial ?? "", nome: "", descricao: "", linhas: "", plantas: "", meses: "", observacoes: "" },
  );
  const [falhou, setFalhou] = useState(false);

  const aoCarregar = useEffectEvent(
    (ops: { value: string; label: string }[] | null, det: Awaited<ReturnType<typeof detalheDaCultivarAction>> | null) => {
      if (!ops) return setFalhou(true);
      setEspecies(ops);
      if (!det) return;
      if (det.status === "ok") {
        const c = det.cultivar;
        setInicial({
          especie_id: c.speciesId,
          nome: c.name,
          descricao: c.characteristics ?? "",
          linhas: brl(c.rowSpacingM),
          plantas: brl(c.plantSpacingM),
          meses: c.productionStartMonths === undefined ? "" : String(c.productionStartMonths),
          observacoes: c.notes ?? "",
        });
      } else if (det.status === "unauthenticated") expireSession();
      else setFalhou(true);
    },
  );

  useEffect(() => {
    let vivo = true;
    void Promise.all([opcoesDeEspeciesAction(), id ? detalheDaCultivarAction(id) : Promise.resolve(null)]).then(
      ([ops, det]) => vivo && aoCarregar(ops, det),
    );
    return () => {
      vivo = false;
    };
  }, [id]);

  if (falhou) return <ErrorState size="sm" title="Não foi possível carregar o formulário" />;
  if (!inicial || !especies) return <Carregando />;
  return <CultivarFormCampos id={id} inicial={inicial} especies={especies} onCancelar={onCancelar} onSalva={onSalva} />;
}

function CultivarFormCampos({
  id,
  inicial,
  especies,
  onCancelar,
  onSalva,
}: {
  id: string | null;
  inicial: ValoresCultivar;
  especies: { value: string; label: string }[];
  onCancelar: () => void;
  onSalva: (id: string) => void;
}) {
  const { expireSession } = useAuth();
  const [erro, setErro] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ValoresCultivar>({ defaultValues: inicial, mode: "onTouched" });

  const espacamento = (v: string) => {
    if (!v.trim()) return true;
    const n = parseDecimalBR(v);
    if (!Number.isFinite(n) || n <= 0) return "Use metros maiores que zero, como 4,5.";
    if (n > 9999.99) return "Use até 9.999,99 m.";
    return true;
  };

  async function salvar(v: ValoresCultivar) {
    setErro(null);
    const metros = (x: string) => (x.trim() ? String(parseDecimalBR(x)) : null);
    const r = await salvarCultivarAction(v.especie_id, id, {
      nome: v.nome,
      descricao: v.descricao,
      espacamento_recomendado_linhas_m: metros(v.linhas),
      espacamento_recomendado_plantas_m: metros(v.plantas),
      idade_inicio_producao_meses: v.meses.trim() ? Number(parseDecimalBR(v.meses)) : null,
      observacoes: v.observacoes,
    });
    if (r.status === "ok") return onSalva(r.data.id);
    if (r.status === "unauthenticated") return expireSession();
    const mapa: Record<string, FieldPath<ValoresCultivar>> = {
      nome: "nome",
      descricao: "descricao",
      espacamento_recomendado_linhas_m: "linhas",
      espacamento_recomendado_plantas_m: "plantas",
      idade_inicio_producao_meses: "meses",
      observacoes: "observacoes",
    };
    if (r.status === "invalid") {
      for (const [campo, msg] of Object.entries(r.fields)) {
        if (mapa[campo]) setError(mapa[campo], { type: "server", message: msg });
        else setErro(msg);
      }
      return;
    }
    if (r.status === "rejected" && /mesmo nome|este nome/i.test(r.message)) setError("nome", { type: "server", message: r.message });
    else setErro(r.message);
  }

  return (
    <chakra.form noValidate display="flex" flexDirection="column" gap="5" onSubmit={(e) => void handleSubmit(salvar)(e)}>
      {erro ? <Alert status="error" title="Não foi possível salvar" description={erro} /> : null}
      <Controller
        control={control}
        name="especie_id"
        rules={{ required: "Escolha a espécie." }}
        render={({ field }) => (
          <Select
            label="Espécie"
            required
            disabled={Boolean(id)}
            helperText={id ? "A espécie de um cultivo não muda." : undefined}
            placeholder="Escolha a espécie"
            options={especies}
            value={field.value || null}
            onValueChange={(v) => field.onChange(v ?? "")}
            errorText={errors.especie_id?.message}
            invalid={Boolean(errors.especie_id)}
          />
        )}
      />
      <TextInput
        label="Nome do cultivo"
        required
        placeholder="Ex.: Palmer"
        errorText={errors.nome?.message}
        invalid={Boolean(errors.nome)}
        {...register("nome", {
          setValueAs: (v: string) => v.trim(),
          required: "Informe o nome do cultivo.",
          maxLength: { value: 255, message: "Use até 255 caracteres." },
        })}
      />
      <Textarea
        label="Características"
        optional
        placeholder="Porte, sabor, resistência a doenças…"
        errorText={errors.descricao?.message}
        invalid={Boolean(errors.descricao)}
        {...register("descricao", { maxLength: { value: 5000, message: "Use até 5000 caracteres." } })}
      />
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3.5">
        <Controller
          control={control}
          name="linhas"
          rules={{ validate: espacamento }}
          render={({ field }) => (
            <CampoNumero
              label="Espaçamento entre linhas"
              optional
              unit="m"
              casas={2}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorText={errors.linhas?.message}
              invalid={Boolean(errors.linhas)}
            />
          )}
        />
        <Controller
          control={control}
          name="plantas"
          rules={{ validate: espacamento }}
          render={({ field }) => (
            <CampoNumero
              label="Espaçamento entre plantas"
              optional
              unit="m"
              casas={2}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorText={errors.plantas?.message}
              invalid={Boolean(errors.plantas)}
            />
          )}
        />
      </Grid>
      <Controller
        control={control}
        name="meses"
        rules={{
          validate: (v) => {
            if (!v.trim()) return true;
            const n = parseDecimalBR(v);
            return (Number.isInteger(n) && n >= 0 && n <= 32767) || "Use um número inteiro de meses.";
          },
        }}
        render={({ field }) => (
          <CampoNumero
            label="Começa a produzir com"
            optional
            inteiro
            unit="meses"
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            helperText="Idade da planta, a partir da implantação."
            errorText={errors.meses?.message}
            invalid={Boolean(errors.meses)}
          />
        )}
      />
      <Textarea
        label="Observações"
        optional
        errorText={errors.observacoes?.message}
        invalid={Boolean(errors.observacoes)}
        {...register("observacoes", { maxLength: { value: 5000, message: "Use até 5000 caracteres." } })}
      />
      <Rodape enviando={isSubmitting} onCancelar={onCancelar} rotulo={id ? "Salvar alterações" : "Cadastrar cultivo"} />
    </chakra.form>
  );
}
