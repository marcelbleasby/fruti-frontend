import { Avatar } from "@chakra-ui/react";

export interface AppUser {
  name: string;
  /** Papel/cargo exibido abaixo do nome (ex.: "Técnica agrícola"). */
  role?: string;
  avatarUrl?: string;
}

export interface UserAvatarProps {
  user: AppUser;
  /** Diâmetro em px, na grade de 4 (DS: 32 no vidro, 36 no cabeçalho). */
  size?: 32 | 36;
}

/** Avatar com iniciais em verde-claro; decorativo (o nome vem no rótulo do botão). */
export function UserAvatar({ user, size = 36 }: UserAvatarProps) {
  return (
    <Avatar.Root
      boxSize={`${size}px`}
      bg="primary.subtle"
      color="fg.heading"
      flexShrink={0}
      aria-hidden="true"
    >
      <Avatar.Fallback name={user.name} fontSize={size >= 36 ? "sm" : "xs"} fontWeight="600" />
      {user.avatarUrl ? <Avatar.Image src={user.avatarUrl} alt="" /> : null}
    </Avatar.Root>
  );
}
