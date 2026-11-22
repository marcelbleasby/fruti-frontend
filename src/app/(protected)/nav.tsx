import {
  Bug,
  Boxes,
  Cherry,
  ClipboardList,
  Factory,
  FileText,
  LandPlot,
  LayoutDashboard,
  Leaf,
  Package,
  Shrub,
  Sprout,
  Truck,
  Wheat,
} from "lucide-react";
import { flattenNav, matchNavHref, type NavGroup, type NavItem } from "@/components/layout";

/**
 * Navegação do app. Rótulos seguem o GLOSSARY.md do fruti-api.
 * Os caminhos não levam a propriedade: ela vem do cookie (ver lib/propriedades).
 */
export const NAV: NavGroup[] = [
  {
    items: [{ label: "Painel", href: "/painel", icon: <LayoutDashboard /> }],
  },
  {
    label: "Campo",
    items: [
      { label: "Plantios", href: "/plantios", icon: <Sprout /> },
      { label: "Áreas de cultivo", href: "/areas-de-cultivo", icon: <LandPlot /> },
      { label: "Eventos de manejo", href: "/eventos", icon: <ClipboardList /> },
      { label: "Ocorrências", href: "/ocorrencias", icon: <Bug /> },
      { label: "Colheitas", href: "/colheitas", icon: <Wheat /> },
    ],
  },
  {
    label: "Estoque",
    items: [
      { label: "Mudas e sementes", href: "/estoque-vegetal", icon: <Shrub /> },
      { label: "Insumos", href: "/insumos", icon: <Package /> },
      { label: "Produção", href: "/estoque-de-producao", icon: <Boxes /> },
      { label: "Processamentos", href: "/processamentos", icon: <Factory /> },
      { label: "Destinações", href: "/destinacoes", icon: <Truck /> },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Espécies", href: "/especies", icon: <Leaf /> },
      { label: "Cultivos", href: "/cultivares", icon: <Cherry /> },
    ],
  },
  {
    label: "Registros",
    items: [{ label: "Arquivos", href: "/arquivos", icon: <FileText /> }],
  },
];

/** Barra inferior no mobile (máx. 4); o resto fica no Drawer "Mais". */
export const MOBILE_NAV: NavItem[] = [
  { label: "Painel", href: "/painel", icon: <LayoutDashboard /> },
  { label: "Plantios", href: "/plantios", icon: <Sprout /> },
  { label: "Áreas", href: "/areas-de-cultivo", icon: <LandPlot /> },
];

/** Item da navegação que corresponde ao caminho (o mais específico). */
export function navItemFor(pathname: string | null): NavItem | undefined {
  if (!pathname) return undefined;
  return flattenNav(NAV)
    .filter((item) => matchNavHref(item.href, pathname))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
