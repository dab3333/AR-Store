const formatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatPeso(amount) {
  const value = Number(amount ?? 0);
  return formatter.format(value);
}
