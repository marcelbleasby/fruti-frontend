"use client";

import { Button, Checkbox, Field, Flex, Heading, Icon, Input, InputGroup, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { ArrowBigUpDash, Mail, UserRound } from "lucide-react";
import { useId, useState, type ElementType, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "@/components/feedback/alert";
import { checkboxControlStyles } from "@/components/forms/checkbox";
import { AuthPasswordInput } from "./auth-password-input";
import { FieldErrorMessage } from "./field-error-message";
import { ForgotPasswordLink } from "./forgot-password-link";

export interface LoginFormValues {
  /** E-mail ou nome de usuário, conforme `identifier`. */
  login: string;
  password: string;
  remember: boolean;
}

export interface LoginFormLockout {
  title?: string;
  description?: string;
}

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
  /** O que a pessoa digita para se identificar (padrão: e-mail). */
  identifier?: "email" | "username";
  defaultValues?: Partial<LoginFormValues>;
  /** Erro de credencial vindo da API. Não diz se foi o e-mail ou a senha. */
  error?: string | null;
  /** Bloqueio temporário por excesso de tentativas; desabilita o envio. */
  locked?: boolean | LoginFormLockout;
  /** Força o estado de carregamento (além do envio assíncrono do próprio form). */
  loading?: boolean;
  forgotPasswordHref?: string;
  onForgotPassword?: () => void;
  /** Link "Não tem conta? Criar conta". */
  signUpHref?: string;
  /** Componente de link (ex.: `next/link`). */
  linkAs?: ElementType;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Nível semântico do título (padrão h1: a tela de acesso é a página). */
  headingAs?: "h1" | "h2" | "h3";
  helpText?: ReactNode;
  showRemember?: boolean;
  submitLabel?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulário de login do Fruti (react-hook-form). O envio real fica com `onSubmit`. */
export function LoginForm({
  onSubmit,
  identifier = "email",
  defaultValues,
  error,
  locked,
  loading,
  forgotPasswordHref,
  onForgotPassword,
  signUpHref,
  linkAs,
  title = "Entrar no Fruti",
  subtitle,
  helpText = "Problemas para entrar? Fale com o administrador da conta.",
  showRemember = true,
  submitLabel = "Entrar",
  headingAs = "h1",
}: LoginFormProps) {
  const titleId = useId();
  const [capsLock, setCapsLock] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { login: "", password: "", remember: true, ...defaultValues },
    mode: "onTouched",
  });

  const lockout: LoginFormLockout | null = locked ? (typeof locked === "object" ? locked : {}) : null;
  const byEmail = identifier === "email";
  const subtitleText =
    subtitle === undefined
      ? `Use o ${byEmail ? "e-mail" : "usuário"} cadastrado pela sua equipe.`
      : subtitle;
  const passwordInvalid = Boolean(errors.password) || Boolean(error);

  return (
    <chakra.form
      noValidate
      aria-labelledby={titleId}
      onSubmit={handleSubmit(onSubmit)}
      display="flex"
      flexDirection="column"
      gap="3.5"
      w="full"
      maxW="380px"
    >
      <Stack gap="1">
        <Heading as={headingAs} id={titleId} m="0" textStyle="heading.lg" color="fg.heading">
          {title}
        </Heading>
        {subtitleText && (
          <Text textStyle="body.sm" color="fg.muted">
            {subtitleText}
          </Text>
        )}
      </Stack>

      {lockout && (
        <Alert
          status="error"
          title={lockout.title ?? "Acesso bloqueado temporariamente"}
          description={lockout.description ?? "Muitas tentativas. Tente de novo em 5 minutos ou redefina a senha."}
        />
      )}

      <Field.Root invalid={Boolean(errors.login)} required>
        <Field.Label textStyle="label" color="fg">
          {byEmail ? "E-mail" : "Usuário"}
        </Field.Label>
        <InputGroup
          startElement={
            <Icon as={byEmail ? Mail : UserRound} boxSize="4" strokeWidth={1.75} color="fg.muted" aria-hidden />
          }
        >
          <Input
            type={byEmail ? "email" : "text"}
            inputMode={byEmail ? "email" : "text"}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            {...register("login", {
              required: byEmail ? "Informe seu e-mail." : "Informe seu usuário.",
              setValueAs: (v: string) => v.trim(),
              ...(byEmail && {
                pattern: { value: EMAIL_PATTERN, message: "Informe um e-mail válido, como nome@exemplo.com." },
              }),
            })}
          />
        </InputGroup>
        {errors.login?.message && <FieldErrorMessage>{errors.login.message}</FieldErrorMessage>}
      </Field.Root>

      <Field.Root invalid={passwordInvalid} required>
        <Flex justify="space-between" align="baseline" w="full">
          <Field.Label textStyle="label" color="fg">
            Senha
          </Field.Label>
          <ForgotPasswordLink href={forgotPasswordHref} onClick={onForgotPassword} linkAs={linkAs} />
        </Flex>
        <AuthPasswordInput onCapsLockChange={setCapsLock} {...register("password", { required: "Informe sua senha." })} />
        {errors.password?.message ? (
          <FieldErrorMessage>{errors.password.message}</FieldErrorMessage>
        ) : (
          error && <FieldErrorMessage>{error}</FieldErrorMessage>
        )}
        {capsLock && (
          <Text role="status" display="flex" alignItems="center" gap="1.5" fontSize="sm" color="fg.warning">
            <Icon as={ArrowBigUpDash} boxSize="3.5" strokeWidth={1.75} aria-hidden />
            Caps Lock está ativado.
          </Text>
        )}
      </Field.Root>

      {showRemember && (
        <Controller
          control={control}
          name="remember"
          render={({ field }) => (
            <Checkbox.Root
              name={field.name}
              checked={field.value}
              onCheckedChange={(d) => field.onChange(d.checked === true)}
              minH="8"
              gap="2"
            >
              <Checkbox.HiddenInput onBlur={field.onBlur} ref={field.ref} />
              <Checkbox.Control css={checkboxControlStyles} />
              <Checkbox.Label textStyle="body.sm" color="fg">
                Manter conectado neste dispositivo
              </Checkbox.Label>
            </Checkbox.Root>
          )}
        />
      )}

      <Button
        type="submit"
        w="full"
        h="11"
        loading={loading || isSubmitting}
        loadingText="Entrando…"
        disabled={Boolean(lockout)}
      >
        {submitLabel}
      </Button>

      {signUpHref && (
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          Não tem conta?{" "}
          <Link
            as={linkAs ?? "a"}
            href={signUpHref}
            fontWeight="600"
            color="primary"
            textDecoration="underline"
            textUnderlineOffset="4px"
            focusVisibleRing="outside"
          >
            Criar conta
          </Link>
        </Text>
      )}

      {helpText && (
        <Text fontSize="sm" color="fg.muted" textAlign="center">
          {helpText}
        </Text>
      )}
    </chakra.form>
  );
}
