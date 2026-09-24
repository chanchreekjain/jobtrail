/**
 * Dates are formatted the same way on the server and in the browser.
 *
 * toLocaleDateString() uses the machine's locale and timezone — Ohio on
 * the server, wherever you are in the browser — so the two can disagree
 * and React complains that the page it rendered doesn't match. A fixed
 * locale and timezone removes the guesswork.
 */
const FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDay(value: string | Date | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : FORMAT.format(date);
}
