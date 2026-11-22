"use client";

import { checkboxControlStyles } from "@/components/forms/checkbox";
import {
  Box,
  type BoxProps,
  Button,
  ButtonGroup,
  Checkbox,
  EmptyState,
  Flex,
  Icon,
  IconButton,
  Menu,
  Pagination,
  Portal,
  Stack,
  Table,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Ellipsis, Inbox, TriangleAlert } from "lucide-react";
import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { Skeleton, SkeletonCircle } from "./skeleton";
import { formatarData } from "@/lib/datas";

/* ───────────────────────────── Tipos ───────────────────────────── */

export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  key: string;
  dir: SortDirection;
}

/** Papel da coluna no card mobile (abaixo de 768px a tabela vira lista de cards). */
export type ColumnMobileRole = "title" | "subtitle" | "badge" | "field" | "hidden";

export interface ColumnDef<T> {
  /** Identificador único; também é a chave de ordenação e o campo padrão de `row[key]`. */
  key: Extract<keyof T, string> | (string & {});
  /** Texto do cabeçalho (também usado como rótulo no card mobile). */
  header: string;
  /** Esconde o texto do cabeçalho visualmente (continua para leitores de tela). */
  hideHeader?: boolean;
  /** Renderização da célula. Padrão: `row[key]`. */
  cell?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  /** Valor usado na ordenação local. Padrão: `row[key]`. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  align?: "start" | "center" | "end";
  /** Números: alinhado à direita, algarismos tabulares. */
  numeric?: boolean;
  width?: string;
  /** Padrão: a primeira coluna é "title", as demais "field". */
  mobile?: ColumnMobileRole;
}

export interface DataTableRowAction {
  label: string;
  onSelect: () => void;
  icon?: ReactElement;
  /** Ação destrutiva (texto em vermelho). */
  danger?: boolean;
  disabled?: boolean;
}

export interface DataTableBulkAction {
  label: string;
  onClick: (selectedIds: string[]) => void;
  icon?: ReactElement;
  danger?: boolean;
}

export interface DataTablePagination {
  /** Página atual (começa em 1). */
  page: number;
  pageSize: number;
  /** Total de registros (todas as páginas). */
  total: number;
}

export interface DataTableProps<T> extends Omit<BoxProps, "children" | "columns"> {
  columns: ColumnDef<T>[];
  /** Linhas da página atual. */
  data: T[];
  /** Descrição da tabela para leitores de tela, ex.: "Plantios, ordenados por data de plantio decrescente". */
  caption: string;
  /** Id estável de cada linha. Padrão: `row.id`. */
  getRowId?: (row: T, index: number) => string;
  /** Nome curto da linha usado em rótulos acessíveis ("Selecionar PL-0042"). Padrão: id. */
  getRowLabel?: (row: T) => string;

  /* Ordenação */
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** true: os dados já vêm ordenados do servidor (não ordena localmente). */
  manualSorting?: boolean;

  /* Seleção (habilitada quando `onSelectionChange` existe) */
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: DataTableBulkAction[];
  formatSelection?: (count: number) => string;

  /* Linhas */
  rowActions?: (row: T) => DataTableRowAction[];
  onRowClick?: (row: T) => void;

  /* Paginação (servidor) */
  pagination?: DataTablePagination;
  onPageChange?: (page: number) => void;

  /* Estados */
  loading?: boolean;
  /** Linhas de skeleton no carregamento. Padrão: pageSize ou 5. */
  loadingRows?: number;
  error?: boolean | ReactNode;
  onRetry?: () => void;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  /** Substitui todo o estado vazio (ex.: com ação "Novo plantio"). */
  emptyState?: ReactNode;

  /** Card mobile customizado (substitui o card gerado a partir das colunas). */
  renderMobileCard?: (row: T, index: number) => ReactNode;
  /** Largura mínima da tabela antes de rolar horizontalmente (≥768px). Padrão "900px". */
  minTableWidth?: string;
}

/* ─────────────────────────── Utilidades ─────────────────────────── */

const defaultGetRowId = (row: unknown, index: number): string => {
  const id = (row as { id?: unknown } | null)?.id;
  return id === undefined || id === null ? String(index) : String(id);
};

const defaultFormatSelection = (n: number) => (n === 1 ? "1 selecionado" : `${n} selecionados`);

function readKey<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

function renderCell<T>(col: ColumnDef<T>, row: T, index: number): ReactNode {
  if (col.cell) return col.cell(row, index);
  const v = readKey(row, col.key);
  if (v === null || v === undefined || v === "") return "—";
  if (v instanceof Date) return formatarData(v);
  if (typeof v === "number") return new Intl.NumberFormat("pt-BR").format(v);
  return String(v);
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined || a === "") return 1;
  if (b === null || b === undefined || b === "") return -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" });
}

function alignOf<T>(col: ColumnDef<T>): "start" | "center" | "end" {
  return col.align ?? (col.numeric ? "end" : "start");
}

function mobileRole<T>(col: ColumnDef<T>, index: number): ColumnMobileRole {
  return col.mobile ?? (index === 0 ? "title" : "field");
}

const INTERACTIVE = "a, button, input, select, textarea, label, [role=menuitem], [role=checkbox]";

/** Evita que cliques em controles internos disparem o clique da linha. */
const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation();

/* ───────────────────────── Subcomponentes ───────────────────────── */

function RowCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean | "indeterminate";
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <Checkbox.Root
      size="sm"
      checked={checked}
      onCheckedChange={(d) => onChange(d.checked === true)}
      onClick={stop}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      minW="6"
      minH="6"
    >
      <Checkbox.HiddenInput aria-label={label} />
      <Checkbox.Control css={checkboxControlStyles}>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  );
}

function RowActionsMenu({ actions, label }: { actions: DataTableRowAction[]; label: string }) {
  if (actions.length === 0) return null;
  return (
    <Menu.Root positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <IconButton aria-label={label} variant="ghost" size="md" color="fg.muted" onClick={stop} onKeyDown={stop}>
          <Icon boxSize="20px">
            <Ellipsis strokeWidth={1.75} />
          </Icon>
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="44" borderRadius="l2" boxShadow="lg">
            {actions.map((a) => (
              <Menu.Item
                key={a.label}
                value={a.label}
                onSelect={a.onSelect}
                disabled={a.disabled}
                color={a.danger ? "danger" : "fg"}
                _highlighted={{ bg: a.danger ? "danger.subtle" : "bg.hover" }}
              >
                {a.icon && (
                  <Icon boxSize="4" strokeWidth="1.75">
                    {a.icon}
                  </Icon>
                )}
                {a.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}

function SortIcon({ dir }: { dir: SortDirection | null }) {
  const I = dir === "asc" ? ArrowUp : dir === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <Icon boxSize="3.5" color={dir ? "fg.heading" : "fg.muted"}>
      <I strokeWidth={1.75} />
    </Icon>
  );
}

function StateMessage({
  tone,
  title,
  description,
  action,
}: {
  tone: "empty" | "error";
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <EmptyState.Root py="10" px="4">
      <EmptyState.Content gap="2">
        <EmptyState.Indicator color={tone === "error" ? "danger" : "fg.muted"}>
          <Icon boxSize="6">
            {tone === "error" ? <TriangleAlert strokeWidth={1.75} /> : <Inbox strokeWidth={1.75} />}
          </Icon>
        </EmptyState.Indicator>
        <Stack gap="1" textAlign="center" align="center">
          <EmptyState.Title textStyle="heading.sm" color="fg.heading">
            {title}
          </EmptyState.Title>
          {description && (
            <EmptyState.Description fontSize="sm" color="fg.muted">
              {description}
            </EmptyState.Description>
          )}
        </Stack>
        {action}
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

/* ──────────────────────────── DataTable ──────────────────────────── */

/**
 * DataTable — tabela genérica tipada.
 * Cabeçalhos ordenáveis com aria-sort; seleção abre uma barra de ações; paginação no rodapé.
 * Abaixo de 768px vira lista de cards (em vez de rolar na horizontal).
 * Chakra v3: Table.Root · Table.ScrollArea · Checkbox · Menu · Pagination.
 */
export function DataTable<T>({
  columns,
  data,
  caption,
  getRowId = defaultGetRowId,
  getRowLabel,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSorting = false,
  selection,
  onSelectionChange,
  bulkActions,
  formatSelection = defaultFormatSelection,
  rowActions,
  onRowClick,
  pagination,
  onPageChange,
  loading = false,
  loadingRows,
  error,
  onRetry,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Ajuste os filtros ou cadastre um novo registro.",
  emptyState,
  renderMobileCard,
  minTableWidth = "900px",
  ...rest
}: DataTableProps<T>) {
  /* Ordenação (controlada ou interna) */
  const [innerSort, setInnerSort] = useState<DataTableSort | null>(defaultSort);
  const sort = sortProp !== undefined ? sortProp : innerSort;

  const toggleSort = (key: string) => {
    const next: DataTableSort =
      sort?.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" };
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
  };

  const rows = useMemo(() => {
    if (!sort || manualSorting) return data;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return data;
    const get = col.sortValue ?? ((r: T) => readKey(r, col.key) as ReturnType<NonNullable<typeof col.sortValue>>);
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...data].sort((a, b) => factor * compareValues(get(a), get(b)));
  }, [data, columns, sort, manualSorting]);

  /* Seleção */
  const selectable = !!onSelectionChange;
  const selected = useMemo(() => new Set(selection ?? []), [selection]);
  const ids = rows.map((r, i) => getRowId(r, i));
  const pageSelectedCount = ids.filter((id) => selected.has(id)).length;
  const allState: boolean | "indeterminate" =
    ids.length > 0 && pageSelectedCount === ids.length ? true : pageSelectedCount > 0 ? "indeterminate" : false;

  const setRowSelected = (id: string, on: boolean) => {
    const next = new Set(selected);
    if (on) next.add(id);
    else next.delete(id);
    onSelectionChange?.([...next]);
  };
  const setAllSelected = (on: boolean) => {
    const next = new Set(selected);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    onSelectionChange?.([...next]);
  };

  const labelOf = (row: T, index: number) => getRowLabel?.(row) ?? getRowId(row, index);
  const hasActions = !!rowActions;
  const colCount = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  /* Linha clicável */
  const rowInteraction = (row: T) =>
    onRowClick
      ? {
          tabIndex: 0,
          cursor: "pointer",
          onClick: (e: MouseEvent<HTMLElement>) => {
            if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
            onRowClick(row);
          },
          onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onRowClick(row);
            }
          },
          _hover: { bg: "bg.hover" },
          focusVisibleRing: "inside" as const,
        }
      : {};

  const showError = !loading && !!error;
  const showEmpty = !loading && !error && rows.length === 0;
  const skeletonCount = loadingRows ?? pagination?.pageSize ?? 5;

  const stateBlock = showError ? (
    <StateMessage
      tone="error"
      title={typeof error === "boolean" ? "Não foi possível carregar os dados" : error}
      description="Nenhum dado foi perdido. Tente de novo em instantes."
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Tentar novamente
          </Button>
        )
      }
    />
  ) : showEmpty ? (
    (emptyState ?? <StateMessage tone="empty" title={emptyTitle} description={emptyDescription} />)
  ) : null;

  /* Faixa de seleção */
  const selectedCount = selected.size;
  const selectionBar =
    selectable && selectedCount > 0 ? (
      <Flex
        role="region"
        aria-label={formatSelection(selectedCount)}
        wrap="wrap"
        align="center"
        justify="space-between"
        gap="2"
        px="3.5"
        py="2"
        bg="primary.subtle"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Text fontSize="sm" fontWeight="600" color="fg.heading" aria-live="polite">
          {formatSelection(selectedCount)}
        </Text>
        {bulkActions && bulkActions.length > 0 && (
          <ButtonGroup size="sm" variant="outline" gap="2" flexWrap="wrap">
            {bulkActions.map((a) => (
              <Button
                key={a.label}
                h="9"
                minH="9"
                color={a.danger ? "danger" : undefined}
                onClick={() => a.onClick([...selected])}
              >
                {a.icon && <Icon boxSize="4">{a.icon}</Icon>}
                {a.label}
              </Button>
            ))}
          </ButtonGroup>
        )}
      </Flex>
    ) : null;

  /* Tabela (≥ 768px) */
  const headerCell = {
    px: "3.5",
    h: "11",
    py: "0",
    textStyle: "overline",
    color: "fg.muted",
    bg: "bg.subtle",
    borderBottomWidth: "1px",
    borderColor: "border",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  } as const;

  const bodyCell = {
    px: "3.5",
    h: "14",
    py: "2",
    fontSize: "sm",
    color: "fg",
    borderBottomWidth: "1px",
    borderColor: "green.100",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  } as const;

  const table = (
    <Table.ScrollArea hideBelow="md">
      <Table.Root minW={minTableWidth} variant="line" aria-busy={loading || undefined}>
        <Table.Caption srOnly>{caption}</Table.Caption>
        <Table.Header>
          <Table.Row bg="transparent">
            {selectable && (
              <Table.ColumnHeader {...headerCell} w="11" pe="0">
                <RowCheckbox
                  checked={allState}
                  onChange={setAllSelected}
                  label="Selecionar todos"
                />
              </Table.ColumnHeader>
            )}
            {columns.map((col) => {
              const dir = sort?.key === col.key ? sort.dir : null;
              const align = alignOf(col);
              return (
                <Table.ColumnHeader
                  key={col.key}
                  scope="col"
                  {...headerCell}
                  textAlign={align}
                  w={col.width}
                  aria-sort={col.sortable ? (dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none") : undefined}
                >
                  {col.sortable ? (
                    <Box
                      as="button"
                      display="inline-flex"
                      alignItems="center"
                      gap="1.5"
                      font="inherit"
                      textTransform="inherit"
                      letterSpacing="inherit"
                      color={dir ? "fg.heading" : "inherit"}
                      cursor="pointer"
                      borderRadius="l1"
                      focusVisibleRing="outside"
                      flexDirection={align === "end" ? "row-reverse" : "row"}
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.hideHeader ? <VisuallyHidden>{col.header}</VisuallyHidden> : col.header}
                      <SortIcon dir={dir} />
                    </Box>
                  ) : col.hideHeader ? (
                    <VisuallyHidden>{col.header}</VisuallyHidden>
                  ) : (
                    col.header
                  )}
                </Table.ColumnHeader>
              );
            })}
            {hasActions && (
              <Table.ColumnHeader scope="col" {...headerCell} w="13">
                <VisuallyHidden>Ações</VisuallyHidden>
              </Table.ColumnHeader>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading &&
            Array.from({ length: skeletonCount }, (_, i) => (
              <Table.Row key={`sk-${i}`} bg="bg.panel" aria-hidden="true">
                {Array.from({ length: colCount }, (_, j) => (
                  <Table.Cell key={j} {...bodyCell}>
                    <Skeleton h="12px" w={j === 0 && selectable ? "16px" : "70%"} />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          {!loading &&
            !error &&
            rows.map((row, i) => {
              const id = ids[i];
              const isSelected = selected.has(id);
              const label = labelOf(row, i);
              return (
                <Table.Row
                  key={id}
                  bg={isSelected ? "bg.subtle" : "bg.panel"}
                  data-selected={isSelected ? "" : undefined}
                  aria-selected={selectable ? isSelected : undefined}
                  {...rowInteraction(row)}
                >
                  {selectable && (
                    <Table.Cell {...bodyCell} w="11" pe="0">
                      <RowCheckbox
                        checked={isSelected}
                        onChange={(on) => setRowSelected(id, on)}
                        label={`Selecionar ${label}`}
                      />
                    </Table.Cell>
                  )}
                  {columns.map((col) => (
                    <Table.Cell
                      key={col.key}
                      {...bodyCell}
                      textAlign={alignOf(col)}
                      css={col.numeric ? { fontVariantNumeric: "tabular-nums" } : undefined}
                    >
                      {renderCell(col, row, i)}
                    </Table.Cell>
                  ))}
                  {hasActions && (
                    <Table.Cell {...bodyCell} textAlign="end" w="13" px="1.5">
                      <RowActionsMenu actions={rowActions(row)} label={`Ações de ${label}`} />
                    </Table.Cell>
                  )}
                </Table.Row>
              );
            })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );

  /* Lista de cards (< 768px) */
  const titleCol = columns.find((c, i) => mobileRole(c, i) === "title");
  const subtitleCols = columns.filter((c, i) => mobileRole(c, i) === "subtitle");
  const badgeCols = columns.filter((c, i) => mobileRole(c, i) === "badge");
  const fieldCols = columns.filter((c, i) => mobileRole(c, i) === "field");

  const cards = (
    <Box hideFrom="md">
      {loading && (
        <Stack gap="0" aria-hidden="true">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <Flex key={i} gap="3" p="3.5" borderBottomWidth="1px" borderColor="green.100" align="center">
              <SkeletonCircle size="9" />
              <Stack flex="1" gap="1.5">
                <Skeleton h="12px" w="60%" />
                <Skeleton h="12px" w="40%" />
              </Stack>
            </Flex>
          ))}
        </Stack>
      )}
      {!loading && !error && rows.length > 0 && (
        <Box as="ul" listStyleType="none" m="0" p="0" aria-label={caption}>
          {rows.map((row, i) => {
            const id = ids[i];
            const isSelected = selected.has(id);
            const label = labelOf(row, i);
            return (
              <Box
                as="li"
                key={id}
                p="3.5"
                borderBottomWidth={i === rows.length - 1 ? "0" : "1px"}
                borderColor="green.100"
                bg={isSelected ? "bg.subtle" : "bg.panel"}
                data-selected={isSelected ? "" : undefined}
                {...rowInteraction(row)}
              >
                <Flex gap="3" align="flex-start">
                  {selectable && (
                    <Box pt="0.5">
                      <RowCheckbox
                        checked={isSelected}
                        onChange={(on) => setRowSelected(id, on)}
                        label={`Selecionar ${label}`}
                      />
                    </Box>
                  )}
                  <Stack flex="1" minW="0" gap="1.5">
                    {renderMobileCard ? (
                      renderMobileCard(row, i)
                    ) : (
                      <>
                        <Flex align="flex-start" justify="space-between" gap="2">
                          <Stack gap="0.5" minW="0">
                            {titleCol && (
                              <Box fontSize="md" fontWeight="600" color="fg.heading">
                                {renderCell(titleCol, row, i)}
                              </Box>
                            )}
                            {subtitleCols.map((c) => (
                              <Box key={c.key} fontSize="sm" color="fg.muted">
                                {renderCell(c, row, i)}
                              </Box>
                            ))}
                          </Stack>
                          {badgeCols.length > 0 && (
                            <Flex gap="1.5" flexShrink={0}>
                              {badgeCols.map((c) => (
                                <Box key={c.key}>{renderCell(c, row, i)}</Box>
                              ))}
                            </Flex>
                          )}
                        </Flex>
                        {fieldCols.length > 0 && (
                          <Box as="dl" display="flex" flexWrap="wrap" columnGap="5" rowGap="2" m="0">
                            {fieldCols.map((c) => (
                              <Stack key={c.key} gap="0" minW="0" flex="1 1 120px">
                                <Box as="dt" fontSize="xs" lineHeight="1rem" color="fg.muted">
                                  {c.header}
                                </Box>
                                <Box
                                  as="dd"
                                  m="0"
                                  fontSize="sm"
                                  color="fg"
                                  css={c.numeric ? { fontVariantNumeric: "tabular-nums" } : undefined}
                                >
                                  {renderCell(c, row, i)}
                                </Box>
                              </Stack>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </Stack>
                  {hasActions && (
                    <Box mt="-1.5" me="-1.5">
                      <RowActionsMenu actions={rowActions(row)} label={`Ações de ${label}`} />
                    </Box>
                  )}
                </Flex>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );

  /* Rodapé com paginação */
  const footer =
    pagination && pagination.total > 0 && !loading && !error ? (
      <Flex
        wrap="wrap"
        align="center"
        justify="space-between"
        gap="2.5"
        px="3.5"
        py="2.5"
        borderTopWidth="1px"
        borderColor="green.100"
      >
        <Text fontSize="sm" color="fg.muted" css={{ fontVariantNumeric: "tabular-nums" }}>
          {`${(pagination.page - 1) * pagination.pageSize + 1}–${Math.min(
            pagination.page * pagination.pageSize,
            pagination.total,
          )} de ${new Intl.NumberFormat("pt-BR").format(pagination.total)}`}
        </Text>
        {pagination.total > pagination.pageSize && (
          <Pagination.Root
            count={pagination.total}
            pageSize={pagination.pageSize}
            page={pagination.page}
            onPageChange={(d) => onPageChange?.(d.page)}
            siblingCount={1}
            aria-label="Paginação"
          >
            <ButtonGroup variant="outline" size="sm" gap="1" attached={false}>
              <Pagination.PrevTrigger asChild>
                <IconButton aria-label="Página anterior" minW="9" h="9">
                  <Icon boxSize="4">
                    <ChevronLeft strokeWidth={1.75} />
                  </Icon>
                </IconButton>
              </Pagination.PrevTrigger>
              <Pagination.Items
                render={(page) => (
                  <Pagination.Item {...page} asChild>
                    <IconButton
                      minW="9"
                      h="9"
                      px="2"
                      fontWeight="400"
                      color="fg"
                      _selected={{ bg: "primary", color: "fg.inverted", borderColor: "primary", fontWeight: "600" }}
                    >
                      {page.value}
                    </IconButton>
                  </Pagination.Item>
                )}
              />
              <Pagination.NextTrigger asChild>
                <IconButton aria-label="Próxima página" minW="9" h="9">
                  <Icon boxSize="4">
                    <ChevronRight strokeWidth={1.75} />
                  </Icon>
                </IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        )}
      </Flex>
    ) : null;

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      borderRadius="l3"
      overflow="hidden"
      aria-busy={loading || undefined}
      {...rest}
    >
      {selectionBar}
      {table}
      {cards}
      {/* Fora da área de rolagem: centraliza na largura visível, não na largura mínima da tabela. */}
      {stateBlock && <Box bg="bg.panel">{stateBlock}</Box>}
      {footer}
    </Box>
  );
}
