/**
 * Turns rows into CSV text that Excel and Google Sheets open correctly.
 *
 * Three things a naive `values.join(",")` gets wrong:
 *
 * 1. Commas and quotes inside a value. "Acme, Inc." would split into two
 *    columns. The fix (RFC 4180): wrap the value in double quotes, and
 *    double any quote inside it — He said "hi" becomes "He said ""hi""".
 *
 * 2. Formula injection. A cell starting with = + - or @ is run as a formula
 *    when the file opens in Excel. Company names here come from AI output
 *    and user input, so one could be "=HYPERLINK(...)". Prefixing a single
 *    quote makes Excel treat it as plain text.
 *
 * 3. Non-English characters. Without a byte-order mark, Excel on Windows
 *    guesses the wrong encoding and "₹" turns into garbage.
 */

type Cell = string | number | null | undefined;

const NEEDS_QUOTES = /[",\r\n]/;
const LOOKS_LIKE_FORMULA = /^[=+\-@\t\r]/;

function cell(value: Cell): string {
  if (value === null || value === undefined) return "";

  let text = String(value);
  if (LOOKS_LIKE_FORMULA.test(text)) text = `'${text}`;
  if (NEEDS_QUOTES.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers: string[], rows: Cell[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(","));
  // \r\n line endings are what the CSV spec asks for; every spreadsheet
  // app reads them. The ﻿ at the start is the byte-order mark.
  return "﻿" + lines.join("\r\n") + "\r\n";
}
