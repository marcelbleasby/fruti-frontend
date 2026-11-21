"use client";

import { DatePicker, type SystemStyleObject } from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Estilos do calendário do DS: dias 40 × 40, raio 10 px, hoje com contorno verde,
 * data escolhida com fundo verde; intervalo em verde-claro.
 */
export const calendarStyles: SystemStyleObject = {
  "--table-cell-size": "sizes.10",
  "--datepicker-nav-trigger-size": "sizes.9",
  "& [data-part=view-control]": { gap: "2" },
  "& [data-part=prev-trigger], & [data-part=next-trigger]": {
    boxSize: "9",
    borderRadius: "l2",
    color: "fg.muted",
    _hover: { bg: "bg.hover" },
  },
  "& [data-part=view-trigger]": {
    fontSize: "md",
    fontWeight: "600",
    color: "fg.heading",
    textTransform: "capitalize",
    _hover: { bg: "bg.hover" },
  },
  "& [data-part=table-header]": {
    h: "8",
    py: "0",
    textStyle: "overline",
    color: "fg.muted",
  },
  "& [data-part=table-cell]": { p: "0" },
  "& [data-part=table-cell-trigger]": {
    borderRadius: "lg",
    textStyle: "body.sm",
    fontWeight: "medium",
    color: "fg",
    cursor: "pointer",
    _hover: { bg: "bg.hover" },
    "&[data-today]": {
      textDecoration: "none",
      color: "fg",
      boxShadow: "inset 0 0 0 2px {colors.primary}",
    },
    "&[data-in-range]": { bg: "primary.subtle", color: "fg.heading" },
    "&[data-selected]": {
      bg: "primary",
      color: "fg.inverted",
      fontWeight: "700",
      boxShadow: "none",
      _hover: { bg: "primary" },
    },
    "&[data-outside-range]": { color: "fg.subtle" },
    "&[data-unavailable], &[data-disabled]": { opacity: 0.4, cursor: "not-allowed", textDecoration: "line-through" },
  },
};

/** Painel flutuante do calendário. */
export const calendarContentStyles: SystemStyleObject = {
  ...calendarStyles,
  p: "3",
  gap: "2",
  minW: "auto",
  bg: "bg.panel",
  borderWidth: "1px",
  borderColor: "border",
  borderRadius: "2xl",
  boxShadow: "lg",
};

function CalendarHeader() {
  return (
    <DatePicker.ViewControl>
      <DatePicker.PrevTrigger>
        <ChevronLeft size={20} strokeWidth={1.75} />
      </DatePicker.PrevTrigger>
      <DatePicker.ViewTrigger>
        <DatePicker.RangeText />
      </DatePicker.ViewTrigger>
      <DatePicker.NextTrigger>
        <ChevronRight size={20} strokeWidth={1.75} />
      </DatePicker.NextTrigger>
    </DatePicker.ViewControl>
  );
}

/** Visões dia / mês / ano (use dentro de `DatePicker.Content`). */
export function CalendarViews() {
  return (
    <>
      <DatePicker.View view="day">
        <CalendarHeader />
        <DatePicker.DayTable />
      </DatePicker.View>
      <DatePicker.View view="month">
        <CalendarHeader />
        <DatePicker.MonthTable />
      </DatePicker.View>
      <DatePicker.View view="year">
        <CalendarHeader />
        <DatePicker.YearTable />
      </DatePicker.View>
    </>
  );
}
