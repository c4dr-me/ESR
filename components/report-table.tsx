import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "./status-badge"

type ResultRow = {
  provider: string
  folder: "Inbox" | "Spam" | "Promotions" | "Pending"
  timestamp: string
}

export function ReportTable({ rows }: { rows: ResultRow[] }) {
  const stats = {
    inbox: rows.filter(r => r.folder === "Inbox").length,
    spam: rows.filter(r => r.folder === "Spam").length,
    promotions: rows.filter(r => r.folder === "Promotions").length,
    pending: rows.filter(r => r.folder === "Pending").length,
  }

  return (
    <Card className="border-2 shadow-sm">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Deliverability Results</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {rows.length} provider{rows.length !== 1 ? 's' : ''} tested
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {stats.inbox > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-semibold text-green-700">{stats.inbox} Inbox</span>
              </div>
            )}
            {stats.spam > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs font-semibold text-red-700">{stats.spam} Spam</span>
              </div>
            )}
            {stats.promotions > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-700">{stats.promotions} Promo</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="text-left border-b bg-muted/20">
            <tr>
              <th className="py-3 px-4 font-semibold text-muted-foreground">Provider</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground">Landing Folder</th>
              <th className="py-3 px-4 font-semibold text-muted-foreground">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.provider + i}
                className="group border-b last:border-b-0 transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/10 to-primary/5 border flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-semibold">{r.provider}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={folderToStatus(r.folder)} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{r.timestamp}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function folderToStatus(folder: ResultRow["folder"]): "inbox" | "spam" | "promotions" | "pending" {
  switch (folder) {
    case "Inbox":
      return "inbox"
    case "Spam":
      return "spam"
    case "Promotions":
      return "promotions"
    case "Pending":
    default:
      return "pending"
  }
}