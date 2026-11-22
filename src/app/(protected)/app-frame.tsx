"use client";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { SessionCheck } from "@/components/auth";
import { AppShell, MobileAppHeader, UserAvatar, type SidebarSlotContext } from "@/components/layout";
import { useAuth } from "@/lib/auth/auth-context";
import { HOME_ROUTE, ONBOARDING_ROUTE } from "@/lib/auth/routes";
import { PAPEL_LABEL, PropriedadeProvider, usePropriedade } from "@/lib/propriedades/propriedade-context";
import { PropriedadeSwitcher } from "@/modules/propriedades";
import { MOBILE_NAV, NAV, navItemFor } from "./nav";

function SidebarPropriedade(ctx: SidebarSlotContext) {
  const { status, propriedades, ativa, selecionar } = usePropriedade();
  return (
    <PropriedadeSwitcher
      {...ctx}
      loading={status === "loading"}
      ativaId={ativa?.id ?? null}
      onSelect={(id) => void selecionar(id)}
      propriedades={propriedades.map((p) => ({ id: p.id, nome: p.nome, papel: PAPEL_LABEL[p.meuPapel] ?? p.meuPapel }))}
    />
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { ativa } = usePropriedade();
  const secao = navItemFor(pathname)?.label ?? "Fruti";

  const appUser = user
    ? {
        name: user.nome || user.usuario,
        role: user.administradorGlobal
          ? "Administração global"
          : ativa
            ? PAPEL_LABEL[ativa.meuPapel] ?? ativa.meuPapel
            : undefined,
      }
    : undefined;

  return (
    <AppShell
      navItems={NAV}
      brandHref={HOME_ROUTE}
      mobileNavItems={MOBILE_NAV}
      sidebarHeader={(ctx) => <SidebarPropriedade {...ctx} />}
      title={secao}
      user={appUser}
      userMenuItems={[{ value: "sair", label: "Sair", icon: <LogOut />, tone: "danger" }]}
      onUserMenuSelect={(value) => {
        if (value === "sair") void logout();
      }}
      mobileHeader={
        <MobileAppHeader
          title={secao}
          actions={
            appUser
              ? [
                  { label: "Sair", icon: LogOut, onClick: () => void logout() },
                  { label: `Usuário: ${appUser.name}`, content: <UserAvatar user={appUser} size={32} /> },
                ]
              : []
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}

/**
 * Primeiro acesso: sem nenhuma propriedade, o app não tem o que mostrar — manda
 * para /bem-vindo. A administração global fica de fora: cuida dos catálogos e
 * não precisa de propriedade.
 */
function OnboardingGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const { status, propriedades } = usePropriedade();
  const semPropriedade = status === "ready" && propriedades.length === 0 && user !== null && !user.administradorGlobal;

  useEffect(() => {
    if (semPropriedade) router.replace(ONBOARDING_ROUTE);
  }, [semPropriedade, router]);

  if (semPropriedade) return <SessionCheck label="Preparando o primeiro acesso…" />;
  return children;
}

/**
 * Casca das telas autenticadas: sidebar com seletor de propriedade, cabeçalho e navegação mobile.
 *
 * O Shell lê `usePathname()` (título e item ativo). Em rotas estáticas o caminho é
 * conhecido no build e o Suspense nunca aparece; em rotas com parâmetro dinâmico
 * (ex.: /areas-de-cultivo/[id]) o caminho só existe na requisição, e sem este
 * Suspense o build falha. O fallback só é visto ao abrir uma dessas URLs direto:
 * navegando pelo app, a casca já está montada.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <PropriedadeProvider>
      <OnboardingGate>
        <Suspense fallback={<SessionCheck label="Carregando…" />}>
          <Shell>{children}</Shell>
        </Suspense>
      </OnboardingGate>
    </PropriedadeProvider>
  );
}
