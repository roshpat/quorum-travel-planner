export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Dates not set";

  const startText = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const endText = end.toLocaleDateString("en-US", {
    month: start.getMonth() === end.getMonth() ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startText} – ${endText}`;
}

export function getTripDayCount(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  const difference = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.min(14, difference + 1));
}

export function getDayLabel(startDate: string, day: number): string {
  const date = new Date(`${startDate}T12:00:00`);
  date.setDate(date.getDate() + day - 1);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
