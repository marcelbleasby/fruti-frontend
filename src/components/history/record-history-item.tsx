"use client";

import { Box, type BoxProps, Flex, Icon, Text, VisuallyHidden, chakra } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import { Avatar } from "@/components/data-display/avatar";
import { Collapsible } from "@/components/navigation/collapsible";
import { formatTime, plural } from "@/modules/format";
import type { FieldChange, HistoryEvent } from "@/modules/types";
import { HISTORY_EVENT_TYPES, formatDateTime, highlightCodes } from "./history-utils";

export type RecordHistoryItemVariant = "card" | "row";

export interface RecordHistoryItemProps extends Omit<BoxProps, "children"> {
  event: HistoryEvent;
  /** card: Avatar, data completa e alterações · row: linha compacta (lista do RecordHistory). */
  variant?: RecordHistoryItemVariant;
  /** Alterações abertas (padrão: true no card, false na linha). */
  defaultOpen?: boolean;
}

/** Lista "Campo: antes → depois", com texto oculto para leitores de tela. */
export function FieldChangeList({ changes }: { changes: FieldChange[] }) {
  return (
    <chakra.ul
      m="0"
      py="2.5"
      px="3"
      listStyleType="none"
      display="flex"
      flexDirection="column"
      gap="1.5"
      bg="bg"
      borderRadius="l2"
    >
      {changes.map((c) => (
        <Flex as="li" key={c.field} wrap="wrap" align="center" gap="1.5" fontSize="sm" color="fg">
          <chakra.span color="fg.muted">{c.field}:</chakra.span>
          <chakra.del textDecoration="line-through" color="red.800" bg="red.100" px="1.5" borderRadius="l1">
            <VisuallyHidden>antes </VisuallyHidden>
            {c.before || "—"}
          </chakra.del>
          <Icon boxSize="3.5" color="fg.muted" aria-hidden="true">
            <ArrowRight strokeWidth={1.75} />
          </Icon>
          <chakra.ins
            textDecoration="none"
            color="green.900"
            bg="green.100"
            px="1.5"
            borderRadius="l1"
            fontWeight="600"
          >
            <VisuallyHidden>depois </VisuallyHidden>
            {c.after || "—"}
          </chakra.ins>
        </Flex>
      ))}
    </chakra.ul>
  );
}

/**
 * RecordHistoryItem — um evento do histórico: quem, o quê, quando e, quando há,
 * o antes/depois de cada campo (a cor não é o único indicador da mudança).
 * Chakra v3: Timeline.Item · Avatar · Collapsible · Text (diff).
 */
export function RecordHistoryItem({ event, variant = "card", defaultOpen, ...rest }: RecordHistoryItemProps) {
  const changes = event.changes ?? [];
  const open = defaultOpen ?? variant === "card";
  const sentence = (
    <>
      <chakra.strong fontWeight="600">{event.actor.name}</chakra.strong> {highlightCodes(event.action)}
    </>
  );
  const diff =
    changes.length === 0 ? null : open ? (
      <FieldChangeList changes={changes} />
    ) : (
      <Collapsible
        label={`Ver ${plural(changes.length, "alteração", "alterações")}`}
        openLabel="Ocultar alterações"
        contentProps={{ p: "0", bg: "transparent" }}
      >
        <FieldChangeList changes={changes} />
      </Collapsible>
    );

  if (variant === "row") {
    const type = HISTORY_EVENT_TYPES[event.type];
    return (
      <Box {...rest}>
        <Flex align="center" gap="2.5" minH="11">
          <Flex
            boxSize="32px"
            flex="none"
            borderRadius="full"
            bg="primary.subtle"
            color="primary"
            align="center"
            justify="center"
            aria-hidden="true"
          >
            <type.icon size={16} strokeWidth={1.75} />
          </Flex>
          <Text flex="1" minW="0" fontSize="sm" color="fg">
            {sentence}
          </Text>
          <chakra.time dateTime={event.at} fontSize="xs" lineHeight="1rem" color="fg.muted" flex="none">
            {formatTime(event.at)}
          </chakra.time>
        </Flex>
        {diff && <Box ps="10" pb="2">{diff}</Box>}
      </Box>
    );
  }

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      boxShadow="xs"
      p="4"
      {...rest}
    >
      <Flex gap="2.5" align="flex-start">
        <Avatar name={event.actor.name} src={event.actor.avatarUrl} size="sm" flex="none" />
        <Flex direction="column" gap="1.5" flex="1" minW="0">
          <Text fontSize="sm" color="fg">
            {sentence}
          </Text>
          <chakra.time dateTime={event.at} fontSize="xs" lineHeight="1rem" color="fg.muted">
            {formatDateTime(event.at)}
          </chakra.time>
          {diff}
        </Flex>
      </Flex>
    </Box>
  );
}
