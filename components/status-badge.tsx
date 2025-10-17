import { cn } from "@/lib/utils"

type Status = "inbox" | "spam" | "promotions" | "pending" | "complete"

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; dotClass: string; wrapClass?: string }> = {
    inbox: { label: "Inbox", dotClass: "bg-chart-2" },
    promotions: { label: "Promotions", dotClass: "bg-chart-5" },
    spam: { label: "Spam", dotClass: "bg-destructive" },
    pending: { label: "Pending", dotClass: "bg-muted", wrapClass: "text-muted-foreground" },
    complete: { label: "Complete", dotClass: "bg-primary" },
  }
  const m = map[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs",
        "bg-card text-foreground",
        m.wrapClass,
      )}
      aria-live="polite"
    >
      <span aria-hidden="true" className={cn("size-2.5 rounded-full", m.dotClass)} />
      {m.label}
    </span>
  )
}
