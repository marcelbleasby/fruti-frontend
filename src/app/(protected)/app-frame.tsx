"use client";

import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell, MobileAppHeader, UserAvatar, type SidebarSlotContext } from "@/components/layout";
import { useAuth } from "@/lib/auth/auth-context";
import { HOME_ROUTE } from "@/lib/auth/routes";
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
                  { label: `Conta de ${appUser.name}`, content: <UserAvatar user={appUser} size={32} /> },
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

/** Casca das telas autenticadas: sidebar com seletor de propriedade, cabeçalho e navegação mobile. */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <PropriedadeProvider>
      <Shell>{children}</Shell>
    </PropriedadeProvider>
  );
}
