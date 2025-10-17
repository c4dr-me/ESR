"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { SessionCard } from "@/components/session-card"
import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import {
  History,
  FilePlus,
  Trash2,
  Info,
  Loader2,
  Plus,
} from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json()
}

type ReportResponse = {
  testCode: string
  score: number
  resultJson: Array<{
    provider: string
    folder: "Inbox" | "Spam" | "Promotions" | "Pending"
    timestamp: string
  }>
  createdAt: string
  userEmail: string | null
}

export default function HistoryPage() {
  const [codes, setCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem("esr_sessions")
      const arr = raw ? (JSON.parse(raw) as string[]) : []
      setCodes(arr)
    } catch {
      setCodes([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear all history?")) {
      localStorage.removeItem("esr_sessions")
      setCodes([])
    }
  }

  return (
    <main className="min-h-dvh flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Nav />
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <History className="w-4 h-4" />
              Test History
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-pretty tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
              Your Test Sessions
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              View and manage your recently generated deliverability test sessions stored on this device.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading sessions...</p>
              </div>
            </div>
          ) : codes.length === 0 ? (
            <AnimatedCard>
              <Card className="border-2 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <FilePlus className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No test sessions yet</h2>
                  <p className="text-muted-foreground text-center mb-6 max-w-sm">
                    Get started by creating your first deliverability test. Your sessions will appear here automatically.
                  </p>
                  <Link href="/">
                    <Button size="lg" className="font-semibold shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Test
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedCard>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Recent Sessions</h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {codes.length}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearHistory}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Clear History
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {codes.map((code, i) => (
                  <HistoryItem key={code} code={code} index={i} />
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Session Storage</p>
                    <p className="text-xs text-muted-foreground">
                      Test sessions are stored locally in your browser. They won't sync across devices and will be cleared if you clear your browser data.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <footer className="py-8 border-t bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Email Spam Report. Built for developers and email marketers.
          </p>
        </div>
      </footer>
    </main>
  )
}

function HistoryItem({ code, index }: { code: string; index: number }) {
  const { data, isLoading } = useSWR<ReportResponse>(`/api/report/${code}`, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 5000, 
  })

  const complete = data ? !(data.resultJson ?? []).some(r => r.folder === "Pending") : false

  return (
    <AnimatedCard delay={index * 60}>
      {isLoading ? (
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <SessionCard code={code} score={data?.score ?? 0} complete={complete} />
      )}
    </AnimatedCard>
  )
}