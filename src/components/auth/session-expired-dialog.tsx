"use client";

import { Avatar, Box, Button, Dialog, Field, Flex, Icon, Portal, Stack, Text, chakra } from "@chakra-ui/react";
import { Clock } from "lucide-react";
import { useRef, useState, type ElementType } from "react";
import { useForm } from "react-hook-form";
import { AuthPasswordInput } from "./auth-password-input";
import { FieldErrorMessage } from "./field-error-message";
import { ForgotPasswordLink } from "./forgot-password-link";

export interface SessionExpiredDialogProps {
  open: boolean;
  /** E-mail da sessão expirada (exibido, não editável). */
  email: string;
  /** Nome para as iniciais do avatar; padrão: e-mail. */
  name?: string;
  avatarSrc?: string;
  /** Reautentica sem sair da página; o formulário em andamento é mantido. */
  onReauthenticate: (password: string) => void | Promise<void>;
  onSignOut: () => void;
  /** Erro de credencial vindo da API. */
  error?: string | null;
  loading?: boolean;
  forgotPasswordHref?: string;
  onForgotPassword?: () => void;
  linkAs?: ElementType;
  title?: string;
  description?: string;
}

/**
 * Dialog role=alertdialog para reautenticar sem perder o que o usuário estava preenchendo.
 * Não fecha por Esc nem clique fora: a saída é "Entrar e continuar" ou "Sair".
 */
export function SessionExpiredDialog({
  open,
  email,
  name,
  avatarSrc,
  onReauthenticate,
  onSignOut,
  error,
  loading,
  forgotPasswordHref,
  onForgotPassword,
  linkAs,
  title = "Sua sessão expirou",
  description = "Entre de novo para continuar. O que você estava preenchendo foi mantido.",
}: SessionExpiredDialogProps) {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string }>({ defaultValues: { password: "" } });

  const { ref: registerRef, ...passwordField } = register("password", { required: "Informe sua senha." });

  const submit = handleSubmit(async ({ password }) => {
    await onReauthenticate(password);
    reset({ password: "" });
  });

  return (
    <Dialog.Root
      open={open}
      role="alertdialog"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      initialFocusEl={() => passwordRef.current}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop bg="green.900/45" />
        <Dialog.Positioner px="4">
          <Dialog.Content maxW="420px" w="full" bg="bg.panel" borderRadius="2xl" boxShadow="lg" p="4.5">
            <chakra.form noValidate onSubmit={submit} display="flex" flexDirection="column" gap="3">
              <Flex gap="3" align="flex-start">
                <Box
                  as="span"
                  boxSize="10"
                  flex="none"
                  borderRadius="xl"
                  bg="accent.subtle"
                  color="accent.fg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={Clock} boxSize="5" strokeWidth={1.75} aria-hidden />
                </Box>
                <Stack gap="0.5">
                  <Dialog.Title m="0" textStyle="heading.md" color="fg.heading">
                    {title}
                  </Dialog.Title>
                  <Dialog.Description textStyle="body.sm" color="fg">
                    {description}
                  </Dialog.Description>
                </Stack>
              </Flex>

              <Flex align="center" gap="2" px="3" py="2" borderRadius="lg" bg="bg" fontSize="sm" color="fg">
                <Avatar.Root size="2xs" boxSize="7" bg="primary.subtle" color="fg.heading">
                  <Avatar.Fallback name={name ?? email} fontSize="xs" fontWeight="600" />
                  {avatarSrc && <Avatar.Image src={avatarSrc} alt="" />}
                </Avatar.Root>
                <Text as="span" truncate>
                  {email}
                </Text>
              </Flex>
              {/* Ajuda gerenciadores de senha a associar a credencial. */}
              <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

              <Field.Root invalid={Boolean(errors.password) || Boolean(error)} required>
                <Flex justify="space-between" align="baseline" w="full">
                  <Field.Label textStyle="label" color="fg">
                    Senha
                  </Field.Label>
                  <ForgotPasswordLink href={forgotPasswordHref} onClick={onForgotPassword} linkAs={linkAs} />
                </Flex>
                <AuthPasswordInput
                  onCapsLockChange={setCapsLock}
                  {...passwordField}
                  ref={(el) => {
                    registerRef(el);
                    passwordRef.current = el;
                  }}
                />
                {errors.password?.message ? (
                  <FieldErrorMessage>{errors.password.message}</FieldErrorMessage>
                ) : (
                  error && <FieldErrorMessage>{error}</FieldErrorMessage>
                )}
                {capsLock && (
                  <Text role="status" fontSize="sm" color="fg.warning">
                    Caps Lock está ativado.
                  </Text>
                )}
              </Field.Root>

              <Flex justify="space-between" gap="2" pt="1">
                <Button type="button" variant="ghost" onClick={onSignOut}>
                  Sair
                </Button>
                <Button type="submit" loading={loading || isSubmitting} loadingText="Entrando…">
                  Entrar e continuar
                </Button>
              </Flex>
            </chakra.form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
