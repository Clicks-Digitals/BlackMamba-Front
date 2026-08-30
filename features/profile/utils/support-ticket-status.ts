/** Tailwind classes for support ticket status pills — keep in sync with list + detail sheet. */
export function supportTicketStatusBadgeClasses(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-amber-500/15 text-amber-300 border-amber-400/25";
    case "PENDING":
      return "bg-sky-500/15 text-sky-300 border-sky-400/25";
    case "IN_PROGRESS":
      return "bg-violet-500/15 text-violet-300 border-violet-400/25";
    case "CLOSED":
      return "bg-white/8 text-white/55 border-white/15";
    case "RESOLVED":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-400/25";
    default:
      return "bg-white/8 text-white/55 border-white/15";
  }
}
