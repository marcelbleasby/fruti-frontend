"use client";

import { Button, Field, Heading, Icon, Input, InputGroup, Link, Stack, Text, chakra } from "@chakra-ui/react";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { useEffect, useId, useState, type ElementType, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { ConcentricIndicator } from "@/components/feedback/concentric-indicator";
import { FieldErrorMessage } from "./field-error-message";

export interface ForgotPasswordFormProps {
  /** Envia o link. Deve resolver mesmo se o e-mail não existir (a tela não confirma cadastro). */
  onSubmit: (email: string) => void | Promise<void>;
  /** Reenvio; padrão: chama `onSubmit` de novo. */
  onResend?: (email: string) => void | Promise<void>;
  backHref?: string;
  onBack?: () => void;
  linkAs?: ElementType;
  defaultEmail?: string;
  /** Segundos de espera antes de liberar o reenvio. */
  resendSeconds?: number;
  /** Erro de envio (falha de rede etc.). */
  error?: string | null;
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Nível semântico do título (padrão h1: a tela de acesso é a página). */
  headingAs?: "h1" | "h2" | "h3";
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "ana.ribeiro@exemplo.com" → "ana.r•••@exemplo.com" */
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const keep = Math.min(5, Math.max(1, local.length - 2));
  return `${local.slice(0, keep)}•••@${domain}`;
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Recuperação de senha: formulário → "Verifique seu e-mail" com reenvio temporizado. */
export function ForgotPasswordForm({
  onSubmit,
  onResend,
  backHref,
  onBack,
  linkAs,
  defaultEmail = "",
  resendSeconds = 45,
  error,
  title = "Redefinir senha",
  subtitle = "Enviaremos um link para o seu e-mail.",
  headingAs = "h1",
}: ForgotPasswordFormProps) {
  const titleId = useId();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [resending, setResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>({ defaultValues: { email: defaultEmail }, mode: "onTouched" });

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);

  const submit = handleSubmit(async ({ email }) => {
    await onSubmit(email);
    setSentTo(email);
    setRemaining(resendSeconds);
  });

  const resend = async () => {
    if (!sentTo) return;
    setResending(true);
    try {
      await (onResend ?? onSubmit)(sentTo);
      setRemaining(resendSeconds);
    } finally {
      setResending(false);
    }
  };

  const backLink =
    backHref || onBack ? (
      <Link
        as={backHref ? linkAs ?? "a" : "button"}
        {...(backHref ? { href: backHref } : { type: "button" })}
        onClick={onBack}
        alignSelf="flex-start"
        display="inline-flex"
        alignItems="center"
        gap="1"
        fontSize="sm"
        fontWeight="600"
        color="primary"
        textDecoration="none"
        focusVisibleRing="outside"
      >
        <Icon as={ArrowLeft} boxSize="4" strokeWidth={1.75} aria-hidden />
        Voltar ao login
      </Link>
    ) : null;

  if (sentTo) {
    return (
      <Stack role="status" align="center" textAlign="center" gap="2.5" w="full">
        <ConcentricIndicator icon={MailCheck} tone="primary" diameter={72} iconSize={16} />
        <Heading as={headingAs} m="0" textStyle="heading.lg" color="fg.heading">
          Verifique seu e-mail
        </Heading>
        <Text textStyle="body.sm" color="fg.muted">
          Se{" "}
          <chakra.strong color="fg" fontWeight="600">
            {maskEmail(sentTo)}
          </chakra.strong>{" "}
          estiver cadastrado, você receberá o link em alguns minutos.
        </Text>
        <Button variant="outline" size="sm" minH="9" disabled={remaining > 0} loading={resending} onClick={resend}>
          {remaining > 0 ? `Reenviar em ${formatCountdown(remaining)}` : "Reenviar link"}
        </Button>
        {backLink && <Stack pt="2">{backLink}</Stack>}
      </Stack>
    );
  }

  return (
    <chakra.form noValidate aria-labelledby={titleId} onSubmit={submit} display="flex" flexDirection="column" gap="3" w="full">
      {backLink}
      <Heading as={headingAs} id={titleId} m="0" textStyle="heading.lg" color="fg.heading">
        {title}
      </Heading>
      {subtitle && (
        <Text textStyle="body.sm" color="fg.muted">
          {subtitle}
        </Text>
      )}
      <Field.Root invalid={Boolean(errors.email) || Boolean(error)} required>
        <Field.Label textStyle="label" color="fg">
          E-mail
        </Field.Label>
        <InputGroup startElement={<Icon as={Mail} boxSize="4" strokeWidth={1.75} color="fg.muted" aria-hidden />}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            {...register("email", {
              required: "Informe seu e-mail.",
              pattern: { value: EMAIL_PATTERN, message: "Informe um e-mail válido, como nome@exemplo.com." },
            })}
          />
        </InputGroup>
        {errors.email?.message ? (
          <FieldErrorMessage>{errors.email.message}</FieldErrorMessage>
        ) : (
          error && <FieldErrorMessage>{error}</FieldErrorMessage>
        )}
      </Field.Root>
      <Button type="submit" w="full" minH={{ base: "11", md: "10" }} loading={isSubmitting} loadingText="Enviando…">
        Enviar link
      </Button>
    </chakra.form>
  );
}
