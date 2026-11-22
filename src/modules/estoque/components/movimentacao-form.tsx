"use client";

import { Button, Flex, Text, chakra } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { DatePicker } from "@/components/forms/date-picker";
import { CampoNumero } from "./campo-numero";
import { SegmentedControl } from "@/components/forms/segmented-control";
import { Textarea } from "@/components/forms/textarea";
import { registrarMovimentacaoAction } from "@/lib/estoque/actions";
import { formatQuantidade, hojeISO, parseDecimalBR, toNumber } from "@/lib/estoque/format";
import { UNIDADE_LABEL, type Lote } from "@/lib/estoque/types";

interface Valores {
  quantidade: string;
  direcao: "entrada" | "saida";
  data: string;
  justificativa: string;
  observacoes: string;
}

/**
 * Perda (sempre saída) ou ajuste (entrada ou saída, com justificativa).
 * Quantidade sempre positiva na tela; o sinal do ajuste vem da direção escolhida.
 */
export function MovimentacaoForm({
  lote,
  tipo,
  onCancelar,
  onConcluido,
  onSessaoExpirada,
}: {
  lote: Lote;
  tipo: "PERDA" | "AJUSTE";
  onCancelar: () => void;
  onConcluido: () => void;
  onSessaoExpirada: () => void;
}) {
  const chave = useRef(crypto.randomUUID());
  const [erro, setErro] = useState<string | null>(null);
  const hoje = hojeISO();
  const inteiro = lote.unidade === "UNIDADE";
  const unidade = UNIDADE_LABEL[lote.unidade].curta;

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Valores>({
    defaultValues: { quantidade: "", direcao: "saida", data: hoje, justificativa: "", observacoes: "" },
  });
  const direcao = useWatch({ control, name: "direcao" });
  const saida = tipo === "PERDA" || direcao === "saida";

  async function enviar(v: Valores) {
    setErro(null);
    const qtd = parseDecimalBR(v.quantidade);
    const resultado = await registrarMovimentacaoAction(
      lote.id,
      {
        tipo,
        quantidade: String(tipo === "AJUSTE" && v.direcao === "saida" ? -qtd : qtd),
        data: v.data,
        justificativa: v.justificativa.trim(),
        observacoes: v.observacoes.trim(),
      },
      chave.current,
    );
    if (resultado.status === "ok") {
      chave.current = crypto.randomUUID();
      onConcluido();
      return;
    }
    if (resultado.status === "unauthenticated") return onSessaoExpirada();
    if (resultado.status === "invalid") {
      let mapeou = false;
      for (const [campo, msg] of Object.entries(resultado.fields)) {
        if (campo === "quantidade" || campo === "data" || campo === "justificativa" || campo === "observacoes") {
          setError(campo, { type: "server", message: msg });
          mapeou = true;
        }
      }
      if (!mapeou) setErro(resultado.message ?? Object.values(resultado.fields).join(" "));
      return;
    }
    setErro(resultado.message);
  }

  return (
    <chakra.form onSubmit={(e) => void handleSubmit(enviar)(e)} noValidate display="flex" flexDirection="column" gap="4">
      <Text textStyle="body.sm" color="fg.muted">
        {tipo === "PERDA"
          ? "Registre o que se estragou ou se perdeu."
          : "Corrija o saldo depois de uma contagem."}
      </Text>

      {erro ? <Alert status="error" title="Não foi possível registrar" description={erro} /> : null}

      {tipo === "AJUSTE" ? (
        <Controller
          control={control}
          name="direcao"
          render={({ field }) => (
            <SegmentedControl
              label="Direção do ajuste"
              showLabel
              fullWidth
              items={[
                { value: "saida", label: "Diminuir saldo" },
                { value: "entrada", label: "Aumentar saldo" },
              ]}
              value={field.value}
              onValueChange={(val) => val && field.onChange(val)}
            />
          )}
        />
      ) : null}

      <Controller
        control={control}
        name="quantidade"
        rules={{
          validate: (val) => {
            const n = parseDecimalBR(val);
            if (!val || !Number.isFinite(n) || n <= 0) return "Informe uma quantidade maior que zero.";
            if (inteiro && !Number.isInteger(n)) return "Em unidades, use um número inteiro.";
            if (saida && n > toNumber(lote.saldo))
              return `Maior que o saldo do lote (${formatQuantidade(lote.saldo, lote.unidade)}).`;
            return true;
          },
        }}
        render={({ field }) => (
          <CampoNumero
            inteiro={inteiro}
            label={tipo === "PERDA" ? "Quantidade perdida" : "Quantidade"}
            required
            unit={unidade}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            helperText={`Saldo atual: ${formatQuantidade(lote.saldo, lote.unidade)}`}
            errorText={errors.quantidade?.message}
            invalid={Boolean(errors.quantidade)}
          />
        )}
      />

      <Controller
        control={control}
        name="data"
        rules={{ required: "Informe a data." }}
        render={({ field }) => (
          <DatePicker
            label="Data"
            required
            value={field.value}
            onValueChange={(val) => field.onChange(val ?? "")}
            min={lote.data_de_entrada}
            max={hoje}
            errorText={errors.data?.message}
            invalid={Boolean(errors.data)}
          />
        )}
      />

      <Textarea
        label="Justificativa"
        required={tipo === "AJUSTE"}
        optional={tipo === "PERDA"}
        placeholder={tipo === "AJUSTE" ? "Ex.: contagem em 12/03 encontrou 40 mudas a menos" : "Ex.: geada"}
        errorText={errors.justificativa?.message}
        invalid={Boolean(errors.justificativa)}
        {...register("justificativa", {
          validate: (val) => (tipo === "AJUSTE" && !val.trim() ? "Explique o motivo do ajuste." : true),
          maxLength: { value: 5000, message: "Use até 5000 caracteres." },
        })}
      />

      <Flex gap="3" justify="flex-end" pt="1">
        <Button variant="ghost" onClick={onCancelar} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSubmitting} colorPalette={tipo === "PERDA" ? "red" : undefined}>
          {tipo === "PERDA" ? "Registrar perda" : "Salvar ajuste"}
        </Button>
      </Flex>
    </chakra.form>
  );
}
