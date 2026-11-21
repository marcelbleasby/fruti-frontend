import {
  Avatar as ChakraAvatar,
  AvatarGroup as ChakraAvatarGroup,
  Flex,
  type FlexProps,
  Icon,
  Text,
} from "@chakra-ui/react";
import { User } from "lucide-react";
import { forwardRef } from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg";

/** Tamanhos do board: 24 · 32 · 40 · 56 (e 36 no grupo). */
const SIZES: Record<AvatarSize | "group", { box: string; font: string; icon: string }> = {
  xs: { box: "24px", font: "0.75rem", icon: "12px" },
  sm: { box: "32px", font: "0.75rem", icon: "16px" },
  md: { box: "40px", font: "1rem", icon: "20px" },
  lg: { box: "56px", font: "1.5rem", icon: "24px" },
  group: { box: "36px", font: "0.75rem", icon: "16px" },
};

export interface AvatarProps extends Omit<ChakraAvatar.RootProps, "size" | "variant" | "children"> {
  /** Nome da pessoa: gera as iniciais e o rótulo acessível. Sem nome → ícone de usuário. */
  name?: string;
  /** URL da foto. Enquanto carrega ou se falhar, mostra as iniciais. */
  src?: string;
  size?: AvatarSize;
  /** Uso interno do AvatarGroup (36px). */
  groupSize?: boolean;
}

/** Avatar — iniciais em verde claro, borda branca de 2px. Chakra v3: Avatar.Root. */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { name, src, size = "md", groupSize, ...rest },
  ref,
) {
  const s = SIZES[groupSize ? "group" : size];
  return (
    <ChakraAvatar.Root
      ref={ref}
      role="img"
      aria-label={name ? (src ? `Foto de ${name}` : name) : "Usuário"}
      css={{ "--avatar-size": s.box, "--avatar-font-size": s.font }}
      flexShrink={0}
      bg={src ? "bg.muted" : "primary.subtle"}
      color="fg.heading"
      borderWidth="2px"
      borderColor="bg.panel"
      fontWeight="600"
      {...rest}
    >
      <ChakraAvatar.Fallback name={name} aria-hidden="true">
        {name ? undefined : (
          <Icon boxSize={s.icon}>
            <User strokeWidth={1.75} />
          </Icon>
        )}
      </ChakraAvatar.Fallback>
      {src && <ChakraAvatar.Image src={src} alt="" />}
    </ChakraAvatar.Root>
  );
});

export interface AvatarGroupPerson {
  name: string;
  src?: string;
}

export interface AvatarGroupProps extends Omit<FlexProps, "children"> {
  people: AvatarGroupPerson[];
  /** Quantos avatares mostrar antes do "+N". Padrão 3. */
  max?: number;
  /** Mostra o total ao lado (ex.: "6 pessoas"). */
  showCount?: boolean;
  /** Formata o total. Padrão: "{n} pessoa(s)". */
  formatCount?: (total: number) => string;
}

const defaultFormatCount = (n: number) => (n === 1 ? "1 pessoa" : `${n} pessoas`);

/** Grupo de avatares sobrepostos (−8px), com excedente "+N". Chakra v3: AvatarGroup. */
export function AvatarGroup({ people, max = 3, showCount, formatCount = defaultFormatCount, ...rest }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;
  const s = SIZES.group;
  return (
    <Flex align="center" role="group" aria-label={formatCount(people.length)} {...rest}>
      <ChakraAvatarGroup spaceX="-8px">
        {visible.map((p) => (
          <Avatar key={p.name} name={p.name} src={p.src} groupSize />
        ))}
        {extra > 0 && (
          <ChakraAvatar.Root
            aria-label={`mais ${extra}`}
            role="img"
            css={{ "--avatar-size": s.box, "--avatar-font-size": "0.75rem" }}
            bg="bg.muted"
            color="slate.700"
            borderWidth="2px"
            borderColor="bg.panel"
            fontWeight="700"
          >
            <ChakraAvatar.Fallback aria-hidden="true">+{extra}</ChakraAvatar.Fallback>
          </ChakraAvatar.Root>
        )}
      </ChakraAvatarGroup>
      {showCount && (
        <Text as="span" ms="2.5" fontSize="sm" color="fg.muted" aria-hidden="true">
          {formatCount(people.length)}
        </Text>
      )}
    </Flex>
  );
}
