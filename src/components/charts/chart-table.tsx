import { Table } from "@chakra-ui/react";
import type { ChartFallbackTable } from "./types";

/**
 * ChartTable — tabela compacta equivalente a um gráfico.
 * Cabeçalho bg.subtle, linhas com divisor green.100, números tabulares à direita.
 */
export function ChartTable({ caption, columns, rows }: ChartFallbackTable) {
  return (
    <Table.ScrollArea borderWidth="1px" borderColor="border" borderRadius="lg" bg="bg.panel">
      <Table.Root size="sm" css={{ fontVariantNumeric: "tabular-nums" }}>
        {caption && (
          <Table.Caption captionSide="top" textAlign="start" px="2.5" py="2" mt="0" fontSize="xs" lineHeight="1rem" color="fg.muted">
            {caption}
          </Table.Caption>
        )}
        <Table.Header>
          <Table.Row bg="bg.subtle">
            {columns.map((col) => (
              <Table.ColumnHeader
                key={col.key}
                scope="col"
                textAlign={col.align ?? "start"}
                px="2.5"
                py="1.5"
                fontSize="xs" lineHeight="1rem"
                fontWeight="600"
                color="fg.muted"
                borderColor="green.100"
              >
                {col.label}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, i) => (
            <Table.Row key={i} bg="transparent">
              {columns.map((col, c) =>
                c === 0 ? (
                  <Table.Cell
                    key={col.key}
                    as="th"
                    scope="row"
                    textAlign={col.align ?? "start"}
                    px="2.5"
                    py="1.5"
                    fontSize="sm"
                    fontWeight="500"
                    color="fg"
                    borderColor="green.100"
                  >
                    {row[col.key]}
                  </Table.Cell>
                ) : (
                  <Table.Cell
                    key={col.key}
                    textAlign={col.align ?? "start"}
                    px="2.5"
                    py="1.5"
                    fontSize="sm"
                    color="fg"
                    borderColor="green.100"
                  >
                    {row[col.key]}
                  </Table.Cell>
                ),
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}
