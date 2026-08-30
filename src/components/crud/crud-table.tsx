"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { CrudTableProps } from "./types";

export function CrudTable<T>({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = "No records found.",
}: CrudTableProps<T>) {
  const colspan =
    columns.length + (actions?.length ? 1 : 0);

  return (
    <>
      {/* ========================= */}
      {/* Desktop Table */}
      {/* ========================= */}

      <div className="hidden lg:block overflow-hidden rounded-3xl border border-border bg-card shadow-sm">

        <div className="overflow-x-auto">

          <Table>

            <TableHeader className="sticky top-0 z-10 bg-muted/50">

              <TableRow>

                {columns.map((column) => (
                  <TableHead
                    key={String(column.key)}
                    style={{ width: column.width }}
                    className={`
                      h-14
                      whitespace-nowrap
                      text-xs
                      font-semibold
                      uppercase
                      tracking-wider
                      text-muted-foreground

                      ${
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                          ? "text-right"
                          : ""
                      }

                      ${
                        column.hidden
                          ? "hidden xl:table-cell"
                          : ""
                      }
                    `}
                  >
                    {column.title}
                  </TableHead>
                ))}

                {actions && (
                  <TableHead className="w-44 text-right">
                    Actions
                  </TableHead>
                )}

              </TableRow>

            </TableHeader>

            <TableBody>

              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={colspan}
                    className="h-40 text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}

              {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={colspan}
                    className="h-40 text-center"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                data.map((row, index) => (
                  <TableRow
                    key={(row as { id?: string }).id ?? index}
                    className="
                      transition-all
                      odd:bg-white
                      even:bg-muted/50/40
                      hover:bg-primary/10
                    "
                  >

                    {columns.map((column) => (

                      <TableCell
                        key={String(column.key)}
                        className={`
                          py-4

                          ${
                            column.align === "center"
                              ? "text-center"
                              : column.align === "right"
                              ? "text-right"
                              : ""
                          }

                          ${
                            column.hidden
                              ? "hidden xl:table-cell"
                              : ""
                          }
                        `}
                      >
                        {column.render
                          ? column.render(row)
                          : String(
                              row[
                                column.key as keyof T
                              ] ?? ""
                            )}
                      </TableCell>

                    ))}

                    {actions && (

                      <TableCell>

                        <div className="flex justify-end gap-2">

                          {actions.map((action) => (

                            <Button
                              key={action.label}
                              size="sm"
                              variant="outline"
                              disabled={action.disabled?.(row)}
                              onClick={() =>
                                action.onClick(row)
                              }
                              className="
                                rounded-xl
                                border-border
                                hover:border-indigo-300
                                hover:bg-primary/10
                              "
                            >
                              {action.icon}

                              <span className="ml-2">
                                {action.label}
                              </span>

                            </Button>

                          ))}

                        </div>

                      </TableCell>

                    )}

                  </TableRow>
                ))}

            </TableBody>

          </Table>

        </div>

      </div>

      {/* ========================= */}
      {/* Mobile Cards */}
      {/* ========================= */}

      <div className="space-y-4 lg:hidden">

        {loading && (

          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            Loading...
          </div>

        )}

        {!loading && data.length === 0 && (

          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            {emptyMessage}
          </div>

        )}

        {!loading &&
          data.map((row, index) => (

            <div
              key={(row as { id?: string }).id ?? index}
              className="
                rounded-3xl
                border
                border-border
                bg-white
                p-5
                shadow-sm
              "
            >

              <div className="space-y-4">

                {columns.map((column) => (

                  <div
                    key={String(column.key)}
                    className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
                  >

                    <span className="text-sm font-semibold text-muted-foreground">
                      {column.title}
                    </span>

                    <div className="text-right font-medium text-foreground">

                      {column.render
                        ? column.render(row)
                        : String(
                            row[
                              column.key as keyof T
                            ] ?? ""
                          )}

                    </div>

                  </div>

                ))}

              </div>

              {actions && (

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">

                  {actions.map((action) => (

                    <Button
                      key={action.label}
                      size="sm"
                      variant="outline"
                      disabled={action.disabled?.(row)}
                      onClick={() =>
                        action.onClick(row)
                      }
                      className="
                        flex-1
                        rounded-xl
                        border-border
                        hover:border-indigo-300
                        hover:bg-primary/10
                      "
                    >
                      {action.icon}

                      <span className="ml-2">
                        {action.label}
                      </span>

                    </Button>

                  ))}

                </div>

              )}

            </div>

          ))}

      </div>

    </>
  );
}