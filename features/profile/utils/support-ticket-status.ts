/** Tailwind classes for support ticket status pills — keep in sync with list + detail sheet. */
export function supportTicketStatusBadgeClasses(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-primary/15 text-primary border-primary/40";
    case "PENDING":
      return "bg-primary/15 text-primary border-primary/40";
    case "IN_PROGRESS":
      return "bg-primary/15 text-primary border-primary/40";
    case "CLOSED":
      return "bg-white/8 text-white/55 border-white/15";
    case "RESOLVED":
      return "bg-primary/15 text-primary border-primary/40";
    default:
      return "bg-white/8 text-white/55 border-white/15";
  }
}
