"use client";

import { Box, Button, Field, Stack, Text } from "@chakra-ui/react";
import { HelpCircle, LandPlot, Leaf, Sprout } from "lucide-react";
import { useState } from "react";
import {
  AccountMenu,
  AuthGuard,
  AuthLayout,
  AuthPasswordInput,
  ForgotPasswordForm,
  FrutiMark,
  LoginForm,
  PermissionGate,
  SessionCheck,
  SessionExpiredDialog,
} from "@/components/auth";
import { FieldErrorMessage } from "@/components/auth/field-error-message";
import { ForgotPasswordLink } from "@/components/auth/forgot-password-link";
import { Demo, Row, ShowcaseSection, Variant, VariantGrid } from "../showcase";

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const USER_PERMISSIONS = ["plantios:ler", "plantios:editar", "areas:ler"] as const;

export function AutenticacaoSection() {
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [guardState, setGuardState] = useState<"loading" | "ok" | "none">("ok");
  const [log, setLog] = useState("");

  return (
    <ShowcaseSection
      id="autenticacao"
      title="Autenticação e acesso"
      description="Login, recuperação de senha, sessão expirada, guarda de rota, permissões e menu da conta. Nenhum exemplo redireciona."
    >
      <Demo name="AuthLayout · LoginForm" importPath="@/components/auth" description="Painel de marca no desktop (lg+); no mobile só o formulário.">
        <Variant label="AuthLayout · com painel de marca (lg+)" p="0" overflow="hidden">
          <AuthLayout minH="680px">
            <LoginForm headingAs="h3" onSubmit={() => wait(1200)} forgotPasswordHref="#autenticacao" />
          </AuthLayout>
        </Variant>
        <Variant label="AuthLayout · sem painel de marca" p="0" overflow="hidden">
          <AuthLayout
            minH="auto"
            hideBrandPanel
            headline="Acompanhe plantios, áreas e mudas"
            features={[
              { icon: Sprout, label: "Plantios por área" },
              { icon: LandPlot, label: "Áreas e dimensões" },
              { icon: Leaf, label: "Catálogo de espécies" },
            ]}
          >
            <LoginForm headingAs="h3" onSubmit={() => wait(800)} showRemember={false} title="Entrar no Fruti" />
          </AuthLayout>
        </Variant>
      </Demo>

      <Demo name="LoginForm · estados" importPath="@/components/auth">
        <VariantGrid min="340px">
          <Variant label="padrão (envio assíncrono)">
            <LoginForm headingAs="h3" onSubmit={() => wait(1500)} onForgotPassword={() => setLog("Esqueci minha senha")} />
          </Variant>
          <Variant label="erro de credencial">
            <LoginForm headingAs="h3"
              onSubmit={() => {}}
              defaultValues={{ login: "ana.ribeiro@fazenda.com.br" }}
              error="E-mail ou senha incorretos. Confira e tente de novo."
            />
          </Variant>
          <Variant label="bloqueado (excesso de tentativas)">
            <LoginForm headingAs="h3"
              onSubmit={() => {}}
              defaultValues={{ login: "ana.ribeiro@fazenda.com.br" }}
              locked={{ title: "Acesso bloqueado por 15 minutos", description: "Foram 5 tentativas sem sucesso. Tente de novo às 10:30 ou redefina a senha." }}
            />
          </Variant>
          <Variant label="carregando (forçado)">
            <LoginForm headingAs="h3" onSubmit={() => {}} loading defaultValues={{ login: "ana.ribeiro@fazenda.com.br", password: "********", remember: true }} />
          </Variant>
          <Variant label="com texto de ajuda e rótulo próprio">
            <LoginForm headingAs="h3"
              onSubmit={() => wait(800)}
              submitLabel="Acessar painel"
              helpText="Problemas para entrar? Fale com o administrador da fazenda."
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="ForgotPasswordForm" importPath="@/components/auth" description="Não confirma se o e-mail existe; reenvio liberado após a contagem.">
        <VariantGrid min="340px">
          <Variant label="padrão">
            <ForgotPasswordForm headingAs="h3" onSubmit={() => wait(1000)} onBack={() => setLog("Voltar ao login")} resendSeconds={30} />
          </Variant>
          <Variant label="erro de envio">
            <ForgotPasswordForm headingAs="h3"
              onSubmit={() => {}}
              defaultEmail="ana.ribeiro@fazenda.com.br"
              error="Não foi possível enviar agora. Verifique a conexão e tente de novo."
              backHref="#autenticacao"
            />
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AuthPasswordInput · FieldErrorMessage · ForgotPasswordLink" importPath="@/components/auth">
        <VariantGrid>
          <Variant label="senha com mostrar/ocultar e aviso de Caps Lock">
            <Field.Root>
              <Field.Label textStyle="body.sm" fontWeight="medium">
                Senha
              </Field.Label>
              <AuthPasswordInput placeholder="Sua senha" onCapsLockChange={setCapsLock} />
            </Field.Root>
            <Text textStyle="caption" color="fg.muted" mt="2">
              Caps Lock: {capsLock ? "ativado" : "desativado"}
            </Text>
          </Variant>
          <Variant label="campo inválido com FieldErrorMessage">
            <Field.Root invalid>
              <Field.Label textStyle="body.sm" fontWeight="medium">
                Senha
              </Field.Label>
              <AuthPasswordInput defaultValue="123" />
              <FieldErrorMessage>A senha precisa ter ao menos 8 caracteres.</FieldErrorMessage>
            </Field.Root>
          </Variant>
          <Variant label="ForgotPasswordLink · href e onClick">
            <Stack gap="2" align="flex-start">
              <ForgotPasswordLink href="#autenticacao" />
              <ForgotPasswordLink onClick={() => setLog("Esqueci minha senha (botão)")} />
            </Stack>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="SessionExpiredDialog" importPath="@/components/auth" description="Reautentica sem sair da página; o formulário em andamento é mantido.">
        <Variant label="abrir diálogo (senha “fruti123” funciona)">
          <Button variant="outline" onClick={() => setSessionOpen(true)}>
            Simular sessão expirada
          </Button>
          <SessionExpiredDialog
            open={sessionOpen}
            email="ana.ribeiro@fazenda.com.br"
            name="Ana Ribeiro"
            error={sessionError}
            onReauthenticate={async (password) => {
              await wait(900);
              if (password === "fruti123") {
                setSessionError(null);
                setSessionOpen(false);
                setLog("Sessão renovada");
              } else {
                setSessionError("Senha incorreta. Tente de novo.");
              }
            }}
            onSignOut={() => {
              setSessionOpen(false);
              setLog("Saiu da conta");
            }}
            onForgotPassword={() => setLog("Esqueci minha senha")}
          />
        </Variant>
      </Demo>

      <Demo name="AuthGuard · SessionCheck" importPath="@/components/auth">
        <VariantGrid>
          <Variant label="AuthGuard · alterne o estado da sessão">
            <Stack gap="3">
              <Row>
                <Button size="sm" variant={guardState === "loading" ? "solid" : "outline"} onClick={() => setGuardState("loading")}>
                  Verificando
                </Button>
                <Button size="sm" variant={guardState === "ok" ? "solid" : "outline"} onClick={() => setGuardState("ok")}>
                  Com sessão
                </Button>
                <Button size="sm" variant={guardState === "none" ? "solid" : "outline"} onClick={() => setGuardState("none")}>
                  Sem sessão
                </Button>
              </Row>
              <Box minH="32" borderWidth="1px" borderStyle="dashed" borderColor="border" borderRadius="l2" p="3">
                <AuthGuard
                  isAuthenticated={guardState === "ok"}
                  isLoading={guardState === "loading"}
                  loadingFallback={<SessionCheck fullScreen={false} />}
                  fallback={<Text textStyle="body.sm">Sem sessão: aqui o app redirecionaria para o login.</Text>}
                  onUnauthenticated={() => setLog("onUnauthenticated chamado")}
                >
                  <Text textStyle="body.sm">Conteúdo protegido: Painel da fazenda.</Text>
                </AuthGuard>
              </Box>
            </Stack>
          </Variant>
          <Variant label="SessionCheck · container (fullScreen false)">
            <Box minH="40" display="flex">
              <SessionCheck fullScreen={false} label="Verificando sua sessão…" />
            </Box>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="PermissionGate" importPath="@/components/auth" description={`Permissões do usuário de exemplo: ${USER_PERMISSIONS.join(", ")}.`}>
        <VariantGrid>
          <Variant label="permitido">
            <PermissionGate permissions={USER_PERMISSIONS} require="plantios:editar">
              <Button size="sm">Editar plantio</Button>
            </PermissionGate>
          </Variant>
          <Variant label="negado · esconde (padrão)">
            <PermissionGate permissions={USER_PERMISSIONS} require="catalogo:editar">
              <Button size="sm">Editar catálogo</Button>
            </PermissionGate>
            <Text textStyle="caption" color="fg.muted">
              (nada renderizado)
            </Text>
          </Variant>
          <Variant label="negado · com fallback">
            <PermissionGate
              permissions={USER_PERMISSIONS}
              require={["areas:editar", "areas:excluir"]}
              fallback={<Text textStyle="body.sm" color="fg.muted">Seu perfil não pode alterar áreas.</Text>}
            >
              <Button size="sm">Excluir área</Button>
            </PermissionGate>
          </Variant>
          <Variant label="match any · função (desabilitar com motivo)">
            <PermissionGate permissions={USER_PERMISSIONS} require={["catalogo:editar", "lotes:editar"]} match="any">
              {({ allowed, missing }) => (
                <Stack gap="1.5" align="flex-start">
                  <Button size="sm" disabled={!allowed} aria-describedby="perm-motivo">
                    Editar lote
                  </Button>
                  {!allowed && (
                    <Text id="perm-motivo" textStyle="caption" color="fg.muted">
                      Falta uma destas permissões: {missing.join(", ")}
                    </Text>
                  )}
                </Stack>
              )}
            </PermissionGate>
          </Variant>
        </VariantGrid>
      </Demo>

      <Demo name="AccountMenu · FrutiMark" importPath="@/components/auth">
        <VariantGrid>
          <Variant label="AccountMenu · com item extra">
            <AccountMenu
              name="Ana Ribeiro"
              role="Técnica agrícola"
              onProfile={() => setLog("Perfil")}
              onPreferences={() => setLog("Preferências")}
              onSignOut={() => setLog("Sair")}
              items={[{ value: "ajuda", label: "Central de ajuda", icon: HelpCircle, onSelect: () => setLog("Ajuda") }]}
            />
          </Variant>
          <Variant label="FrutiMark · tamanhos, com nome, sobre verde">
            <Row gap="6">
              <FrutiMark size={24} />
              <FrutiMark size={40} />
              <FrutiMark size={32} withWordmark />
              <Box bg="bg.inverted" p="3" borderRadius="l2">
                <FrutiMark size={32} withWordmark tone="inverted" />
              </Box>
            </Row>
          </Variant>
        </VariantGrid>
        <Text textStyle="caption" color="fg.muted" aria-live="polite">
          {log ? `Último evento: ${log}` : "Nenhum evento ainda"}
        </Text>
      </Demo>
    </ShowcaseSection>
  );
}
