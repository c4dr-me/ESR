"use client"

import useSWR from "swr"
import { useEffect, useMemo, useRef } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { StatusBadge } from "@/components/status-badge"
import { ReportTable } from "@/components/report-table"
import { ProgressBar } from "@/components/progress"
import { Nav } from "@/components/nav"
import { toast } from "sonner"
import {
  FileText,
  Loader2,
  Info,
  Download,
  Calendar,
  User,
  CheckCircle,
  Clock,
} from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

type ResultRow = {
  provider: string
  folder: "Inbox" | "Spam" | "Promotions" | "Pending"
  timestamp: string
}

type ReportResponse = {
  testCode: string
  resultJson: ResultRow[]
  score: number
  userEmail: string | null
  createdAt: string
  providers?: string[]
}

export default function ReportPage() {
  const { code } = useParams<{ code: string }>()
  
  const { data: statusData } = useSWR<{ complete: boolean }>(`/api/test-status?code=${code}`, fetcher, {
    refreshInterval: (latest) => (latest?.complete ? 0 : 1500),
    revalidateOnFocus: true,
    shouldRetryOnError: true,
  })

  const { data, isLoading } = useSWR<ReportResponse>(`/api/report/${code}`, fetcher, {
    refreshInterval: (latest) => {
      if (!latest) return 2000
      const selected = latest.providers ?? []
      const pending = latest.resultJson.some(
        r => selected.includes(r.provider) && r.folder === "Pending"
      )
      return pending ? 2000 : 0
    },
    revalidateOnFocus: true,
    keepPreviousData: true,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem("esr_sessions")
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      if (!arr.includes(code)) {
        const next = [code, ...arr].slice(0, 10)
        localStorage.setItem("esr_sessions", JSON.stringify(next))
      }
    } catch {}
  }, [code])

  const score = data?.score ?? 0
  const selectedProviders = data?.providers ?? []

  const complete = useMemo(() => {
    if (!data) return false
    return !data.resultJson.some(
      r => selectedProviders.includes(r.provider) && r.folder === "Pending"
    )
  }, [data, selectedProviders])

  const wasComplete = useRef(false)
  useEffect(() => {
    if (complete && !wasComplete.current) {
      toast.success("Report is complete! All selected inboxes have been checked.")
    }
    wasComplete.current = complete
  }, [complete])

  const anyPending = useMemo(() => {
    if (!data) return false
    return data.resultJson.some(
      r => selectedProviders.includes(r.provider) && r.folder === "Pending"
    )
  }, [data, selectedProviders])

  const filteredRows = useMemo(() => {
    if (!data) return []
    return data.resultJson.filter(r => selectedProviders.includes(r.provider))
  }, [data, selectedProviders])

  const handleDownloadPDF = () => {
    if (!code) return
    toast.loading("Generating PDF...")
    fetch(`/api/report/${code}/pdf`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to generate PDF")
        return res.blob()
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `email-spam-report-${code}.pdf`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.dismiss()
        toast.success("PDF downloaded successfully!")
      })
      .catch(() => {
        toast.dismiss()
        toast.error("Failed to download PDF")
      })
  }

  return (
    <main className="min-h-dvh flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Nav />
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            Test Report
          </div>
          <div className="mb-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
              <span className="text-sm font-medium text-muted-foreground">Report ID</span>
              <code className="text-2xl md:text-3xl font-bold font-mono tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {code}
              </code>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Live deliverability results update automatically in real-time.
          </p>
        </div>

        <div className="grid gap-6 max-w-5xl mx-auto">
          <AnimatedCard>
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30 pb-3">
                <CardTitle className="text-xl">Deliverability Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={complete ? "complete" : "pending"} />
                  {!complete && anyPending && (
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" />
                      Polling for updates...
                    </div>
                  )}
                </div>
                
                <ProgressBar value={score} />
                
                <div className="rounded-lg bg-muted/50 border p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">How scoring works</p>
                      <p className="text-xs text-muted-foreground">
                        Score reflects weighted placement across providers. Inbox counts highest, Promotions mid, Spam lowest.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <Button 
                    variant="outline" 
                    disabled={!complete} 
                    onClick={handleDownloadPDF}
                    className="w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedCard>

          <AnimatedCard>
            {isLoading ? (
              <Card className="border-2">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Loading report data...</p>
                </CardContent>
              </Card>
            ) : (
              <ReportTable rows={filteredRows} />
            )}
          </AnimatedCard>

          {/* Additional Info Card */}
          {data && (
            <AnimatedCard delay={120}>
              <Card className="border bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(data.createdAt).toLocaleString()}</span>
                    </div>
                    {data.userEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{data.userEmail}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          )}
        </div>
      </section>
      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            {anyPending || !statusData?.complete ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                Results are still updating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                All results are final.
              </>
            )}
          </p>
        </div>
      </footer>
    </main>
  )
}