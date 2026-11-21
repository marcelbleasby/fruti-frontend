"use client";

import { Avatar, Box, Flex, Icon, Menu, Portal, Stack, Text, chakra } from "@chakra-ui/react";
import { LogOut, SlidersHorizontal, User } from "lucide-react";
import type { ElementType } from "react";

export interface AccountMenuItem {
  value: string;
  label: string;
  icon?: ElementType;
  onSelect: () => void;
}

export interface AccountMenuProps {
  name: string;
  /** Cargo/perfil exibido abaixo do nome (ex.: "Técnica agrícola"). */
  role?: string;
  avatarSrc?: string;
  onProfile?: () => void;
  onPreferences?: () => void;
  onSignOut: () => void;
  /** Itens extras, exibidos antes do separador de "Sair". */
  items?: AccountMenuItem[];
  profileLabel?: string;
  preferencesLabel?: string;
  signOutLabel?: string;
}

const itemStyles = {
  minH: "10",
  px: "2.5",
  gap: "2.5",
  borderRadius: "l2",
  fontSize: "sm",
  color: "fg",
  cursor: "pointer",
  _highlighted: { bg: "bg.hover" },
} as const;

/** Menu da conta, aberto pelo avatar no AppHeader. */
export function AccountMenu({
  name,
  role,
  avatarSrc,
  onProfile,
  onPreferences,
  onSignOut,
  items = [],
  profileLabel = "Meu perfil",
  preferencesLabel = "Preferências",
  signOutLabel = "Sair",
}: AccountMenuProps) {
  const allItems: AccountMenuItem[] = [
    ...(onProfile ? [{ value: "profile", label: profileLabel, icon: User, onSelect: onProfile }] : []),
    ...(onPreferences ? [{ value: "preferences", label: preferencesLabel, icon: SlidersHorizontal, onSelect: onPreferences }] : []),
    ...items,
  ];

  const handleSelect = (value: string) => {
    if (value === "sign-out") return onSignOut();
    allItems.find((i) => i.value === value)?.onSelect();
  };

  return (
    <Menu.Root positioning={{ placement: "bottom-end", gutter: 8 }} onSelect={(d) => handleSelect(d.value)}>
      <Menu.Trigger asChild>
        <chakra.button
          type="button"
          aria-label={`Conta de ${name}`}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          boxSize="11"
          borderRadius="full"
          cursor="pointer"
          focusVisibleRing="outside"
          _hover={{ "& > *": { boxShadow: "0 0 0 2px {colors.green.200}" } }}
        >
          <Avatar.Root size="md" bg="primary.subtle" color="fg.heading">
            <Avatar.Fallback name={name} fontWeight="600" />
            {avatarSrc && <Avatar.Image src={avatarSrc} alt="" />}
          </Avatar.Root>
        </chakra.button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            aria-label="Conta"
            minW="240px"
            p="1.5"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            borderRadius="xl"
            boxShadow="lg"
          >
            <Flex align="center" gap="2.5" px="2.5" pt="2" pb="2.5" mb="1" borderBottomWidth="1px" borderColor="green.100">
              <Avatar.Root size="sm" boxSize="9" bg="primary.subtle" color="fg.heading">
                <Avatar.Fallback name={name} fontSize="sm" fontWeight="600" />
                {avatarSrc && <Avatar.Image src={avatarSrc} alt="" />}
              </Avatar.Root>
              <Stack gap="0" minW="0">
                <Text fontSize="sm" fontWeight="600" color="fg" truncate>
                  {name}
                </Text>
                {role && (
                  <Text fontSize="xs" color="fg.muted" truncate>
                    {role}
                  </Text>
                )}
              </Stack>
            </Flex>

            {allItems.map((item) => (
              <Menu.Item key={item.value} value={item.value} {...itemStyles}>
                {item.icon && (
                  <Box as="span" display="flex" color="fg.muted">
                    <Icon as={item.icon} boxSize="4" strokeWidth={1.75} aria-hidden />
                  </Box>
                )}
                {item.label}
              </Menu.Item>
            ))}

            {allItems.length > 0 && <Menu.Separator mx="1.5" my="1" borderColor="green.100" />}

            <Menu.Item value="sign-out" {...itemStyles} color="fg.error" _highlighted={{ bg: "bg.error" }}>
              <Box as="span" display="flex" color="fg.error">
                <Icon as={LogOut} boxSize="4" strokeWidth={1.75} aria-hidden />
              </Box>
              {signOutLabel}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
