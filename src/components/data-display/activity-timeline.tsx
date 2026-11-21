import { Box, type BoxProps, Button, Icon, Text, Timeline } from "@chakra-ui/react";
import { Activity } from "lucide-react";
import type { ReactElement, ReactNode } from "react";

export interface ActivityItem {
  /** Chave estável; padrão: índice. */
  id?: string;
  /** Quando: Date (formatada em pt-BR) ou texto pronto ("Hoje, 09:14"). */
  at: Date | string;
  title: ReactNode;
  description?: ReactNode;
  /** Ícone lucide (ex.: <Sprout />). Padrão: <Activity />. */
  icon?: ReactElement;
  /** Quem fez, ex.: "Ana Ribeiro". */
  actor?: string;
}

export interface ActivityTimelineProps extends Omit<BoxProps, "children"> {
  items: ActivityItem[];
  /** Mostra só os N primeiros (os itens já devem vir do mais recente ao mais antigo). */
  maxItems?: number;
  /** Ação "Ver tudo" (aparece quando definida). */
  onSeeAll?: () => void;
  seeAllLabel?: string;
  /** Texto quando não há atividades. */
  emptyText?: ReactNode;
  formatDate?: (date: Date) => string;
}

const defaultFormatDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);

/**
 * ActivityTimeline — histórico recente: indicador 32px (primary.subtle), linha de 2px, título,
 * descrição e "quando · quem". Chakra v3: Timeline.Root · Timeline.Item · Timeline.Indicator.
 */
export function ActivityTimeline({
  items,
  maxItems,
  onSeeAll,
  seeAllLabel = "Ver tudo",
  emptyText = "Nenhuma atividade registrada ainda.",
  formatDate = defaultFormatDate,
  ...rest
}: ActivityTimelineProps) {
  const visible = maxItems ? items.slice(0, maxItems) : items;

  return (
    <Box display="flex" flexDirection="column" gap="3" {...rest}>
      {visible.length === 0 ? (
        <Text fontSize="sm" color="fg.muted">
          {emptyText}
        </Text>
      ) : (
        <Timeline.Root
          as="ol"
          size="xl"
          variant="subtle"
          css={{ "--timeline-thickness": "2px", "--timeline-gutter": "4px" }}
        >
          {visible.map((item, i) => {
            const when =
              item.at instanceof Date ? (
                <time dateTime={item.at.toISOString()}>{formatDate(item.at)}</time>
              ) : (
                item.at
              );
            return (
              <Timeline.Item
                as="li"
                key={item.id ?? i}
                gap="3"
                css={{ "--timeline-content-gap": "20px" }}
              >
                <Timeline.Connector>
                  <Timeline.Separator borderColor="border" />
                  <Timeline.Indicator bg="primary.subtle" color="primary" outline="none">
                    <Icon boxSize="4" strokeWidth="1.75">
                      {item.icon ?? <Activity />}
                    </Icon>
                  </Timeline.Indicator>
                </Timeline.Connector>
                <Timeline.Content gap="0.5" minW="0">
                  <Timeline.Title mt="0" textStyle="body.sm" fontWeight="600" color="fg">
                    {item.title}
                  </Timeline.Title>
                  {item.description && (
                    <Timeline.Description fontSize="sm" color="fg.muted">
                      {item.description}
                    </Timeline.Description>
                  )}
                  <Text fontSize="xs" lineHeight="1rem" color="fg.muted">
                    {when}
                    {item.actor ? ` · ${item.actor}` : null}
                  </Text>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
        </Timeline.Root>
      )}
      {onSeeAll && (
        <Button variant="ghost" size="sm" alignSelf="flex-start" onClick={onSeeAll}>
          {seeAllLabel}
        </Button>
      )}
    </Box>
  );
}
