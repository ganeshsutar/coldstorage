// Number and date formatting utilities

export function formatCurrency(
  value: number,
  currency = "INR",
  locale = "en-IN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale = "en-IN"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatWeight(value: number, unit = "kg"): string {
  return `${formatNumber(value)} ${unit}`;
}
