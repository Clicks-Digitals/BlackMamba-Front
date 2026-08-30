export function formatCurrency(amount: number, currency: string = "JOD", locale: string = "en") {
  const tag = locale === "ar" ? "ar-JO" : "en-US";
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency
  }).format(amount);
}
