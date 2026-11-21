"use client";

import { Button, Field, Grid, Heading, Icon, Input, InputGroup, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { ArrowBigUpDash, Check, Circle, Mail, UserRound } from "lucide-react";
import { useId, useState, type ElementType, type ReactNode } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { AuthPasswordInput } from "./auth-password-input";
import { FieldErrorMessage } from "./field-error-message";

export interface SignUpFormValues {
  nome: string;
  sobrenome: string;
  usuario: string;
  email: string;
  senha: string;
}

/** Erros por campo vindos da API (ex.: "Esta senha é muito comum."). */
export type SignUpFormFieldErrors = Partial<Record<keyof SignUpFormValues, string>>;

export interface SignUpFormLockout {
  title?: string;
  description?: string;
}

export interface SignUpFormProps {
  /** Pode devolver erros por campo da API; eles aparecem sob cada campo. */
  onSubmit: (values: SignUpFormValues) => void | SignUpFormFieldErrors | Promise<void | SignUpFormFieldErrors>;
  defaultValues?: Partial<SignUpFormValues>;
  /** Erro geral (ex.: conflito de usuário/e-mail, serviço fora do ar). */
  error?: ReactNode;
  errorTitle?: string;
  /** Bloqueio temporário por excesso de tentativas; desabilita o envio. */
  locked?: boolean | SignUpFormLockout;
  loading?: boolean;
  /** Link "Já tem conta? Entrar". */
  loginHref?: string;
  linkAs?: ElementType;
  title?: ReactNode;
  subtitle?: ReactNode;
  headingAs?: "h1" | "h2" | "h3";
  submitLabel?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Mesmo conjunto do validador de usuário do Django (letras Unicode, números e @ . + - _). */
const USERNAME_PATTERN = /^[\p{L}\p{N}_.@+-]+$/u;
const MIN_PASSWORD = 12;

const passwordRules = [
  {
    label: `Pelo menos ${MIN_PASSWORD} caracteres`,
    error: `Use pelo menos ${MIN_PASSWORD} caracteres.`,
    test: (v: string) => v.length >= MIN_PASSWORD,
  },
  {
    label: "Não pode ser só números",
    error: "Misture letras ou símbolos: a senha não pode ser só números.",
    test: (v: string) => v.length > 0 && !/^\d+$/.test(v),
  },
];

const labelProps = { textStyle: "label", color: "fg" } as const;

/**
 * Formulário de cadastro de conta (react-hook-form). Valida no navegador o que
 * a API também valida; o resto (senha comum, parecida com o usuário, conta já
 * existente) volta da API via `onSubmit`.
 */
export function SignUpForm({
  onSubmit,
  defaultValues,
  error,
  errorTitle = "Não foi possível criar a conta",
  locked,
  loading,
  loginHref,
  linkAs,
  title = "Criar conta no Fruti",
  subtitle = "Depois de entrar, você cadastra sua propriedade.",
  headingAs = "h1",
  submitLabel = "Criar conta",
}: SignUpFormProps) {
  const titleId = useId();
  const [capsLock, setCapsLock] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    defaultValues: { nome: "", sobrenome: "", usuario: "", email: "", senha: "", ...defaultValues },
    mode: "onTouched",
  });
  const senha = useWatch({ control, name: "senha" }) ?? "";

  const lockout: SignUpFormLockout | null = locked ? (typeof locked === "object" ? locked : {}) : null;

  const submit = handleSubmit(async (values) => {
    const fieldErrors = await onSubmit(values);
    if (!fieldErrors) return;
    let first = true;
    for (const [name, message] of Object.entries(fieldErrors)) {
      if (!message) continue;
      setError(name as FieldPath<SignUpFormValues>, { type: "server", message }, { shouldFocus: first });
      first = false;
    }
  });

  const trimmed = (v: string) => v.trim();

  return (
    <chakra.form
      noValidate
      aria-labelledby={titleId}
      onSubmit={submit}
      display="flex"
      flexDirection="column"
      gap="3.5"
      w="full"
      maxW="420px"
    >
      <Stack gap="1">
        <Heading as={headingAs} id={titleId} m="0" textStyle="heading.lg" color="fg.heading">
          {title}
        </Heading>
        {subtitle && (
          <Text textStyle="body.sm" color="fg.muted">
            {subtitle}
          </Text>
        )}
      </Stack>

      {lockout && (
        <Alert
          status="error"
          title={lockout.title ?? "Muitas tentativas"}
          description={lockout.description ?? "Aguarde alguns minutos e tente de novo."}
        />
      )}
      {error && !lockout && <Alert status="error" title={errorTitle} description={error} />}

      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3.5">
        <Field.Root invalid={Boolean(errors.nome)}>
          <Field.Label {...labelProps}>
            Nome <Field.RequiredIndicator fallback={<Text as="span" color="fg.muted" fontWeight="400">(opcional)</Text>} />
          </Field.Label>
          <Input
            autoComplete="given-name"
            {...register("nome", { setValueAs: trimmed, maxLength: { value: 150, message: "Use até 150 caracteres." } })}
          />
          {errors.nome?.message && <FieldErrorMessage>{errors.nome.message}</FieldErrorMessage>}
        </Field.Root>

        <Field.Root invalid={Boolean(errors.sobrenome)}>
          <Field.Label {...labelProps}>
            Sobrenome{" "}
            <Field.RequiredIndicator fallback={<Text as="span" color="fg.muted" fontWeight="400">(opcional)</Text>} />
          </Field.Label>
          <Input
            autoComplete="family-name"
            {...register("sobrenome", {
              setValueAs: trimmed,
              maxLength: { value: 150, message: "Use até 150 caracteres." },
            })}
          />
          {errors.sobrenome?.message && <FieldErrorMessage>{errors.sobrenome.message}</FieldErrorMessage>}
        </Field.Root>
      </Grid>

      <Field.Root invalid={Boolean(errors.usuario)} required>
        <Field.Label {...labelProps}>Usuário</Field.Label>
        <InputGroup startElement={<Icon as={UserRound} boxSize="4" strokeWidth={1.75} color="fg.muted" aria-hidden />}>
          <Input
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            {...register("usuario", {
              setValueAs: trimmed,
              required: "Escolha um nome de usuário.",
              maxLength: { value: 150, message: "Use até 150 caracteres." },
              pattern: { value: USERNAME_PATTERN, message: "Use só letras, números e @ . + - _ (sem espaços)." },
            })}
          />
        </InputGroup>
        {errors.usuario?.message ? (
          <FieldErrorMessage>{errors.usuario.message}</FieldErrorMessage>
        ) : (
          <Field.HelperText fontSize="sm" color="fg.muted" m="0">
            É com ele que você entra. Sem espaços.
          </Field.HelperText>
        )}
      </Field.Root>

      <Field.Root invalid={Boolean(errors.email)} required>
        <Field.Label {...labelProps}>E-mail</Field.Label>
        <InputGroup startElement={<Icon as={Mail} boxSize="4" strokeWidth={1.75} color="fg.muted" aria-hidden />}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            {...register("email", {
              setValueAs: trimmed,
              required: "Informe seu e-mail.",
              maxLength: { value: 254, message: "Use até 254 caracteres." },
              pattern: { value: EMAIL_PATTERN, message: "Informe um e-mail válido, como nome@exemplo.com." },
            })}
          />
        </InputGroup>
        {errors.email?.message && <FieldErrorMessage>{errors.email.message}</FieldErrorMessage>}
      </Field.Root>

      <Field.Root invalid={Boolean(errors.senha)} required>
        <Field.Label {...labelProps}>Senha</Field.Label>
        <AuthPasswordInput
          autoComplete="new-password"
          onCapsLockChange={setCapsLock}
          {...register("senha", {
            required: "Crie uma senha.",
            maxLength: { value: 128, message: "Use até 128 caracteres." },
            validate: (v) => passwordRules.find((r) => !r.test(v))?.error ?? true,
          })}
        />
        {errors.senha?.message && <FieldErrorMessage>{errors.senha.message}</FieldErrorMessage>}
        <Field.HelperText as="div" m="0">
          <chakra.ul listStyleType="none" m="0" p="0" display="flex" flexDirection="column" gap="0.5" lineHeight="1.25rem">
            {passwordRules.map((rule) => {
              const ok = rule.test(senha);
              return (
                <chakra.li
                  key={rule.label}
                  display="flex"
                  alignItems="center"
                  gap="1.5"
                  fontSize="sm"
                  color={ok ? "fg.success" : "fg.muted"}
                >
                  <Icon as={ok ? Check : Circle} boxSize="3.5" strokeWidth={ok ? 2.25 : 1.75} aria-hidden />
                  {rule.label}
                  <chakra.span srOnly>{ok ? " (atendido)" : " (pendente)"}</chakra.span>
                </chakra.li>
              );
            })}
            <chakra.li fontSize="sm" color="fg.muted">
              Evite senhas comuns ou parecidas com seu nome e usuário.
            </chakra.li>
          </chakra.ul>
        </Field.HelperText>
        {capsLock && (
          <Text role="status" display="flex" alignItems="center" gap="1.5" fontSize="sm" color="fg.warning">
            <Icon as={ArrowBigUpDash} boxSize="3.5" strokeWidth={1.75} aria-hidden />
            Caps Lock está ativado.
          </Text>
        )}
      </Field.Root>

      <Button
        type="submit"
        w="full"
        h="11"
        mt="1"
        loading={loading || isSubmitting}
        loadingText="Criando conta…"
        disabled={Boolean(lockout)}
      >
        {submitLabel}
      </Button>

      {loginHref && (
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Já tem conta?{" "}
          <Link
            as={linkAs ?? "a"}
            href={loginHref}
            fontWeight="600"
            color="primary"
            textDecoration="underline"
            textUnderlineOffset="4px"
            focusVisibleRing="outside"
          >
            Entrar
          </Link>
        </Text>
      )}
    </chakra.form>
  );
}
