"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AnimatedCard } from "@/components/animated-card"
import { TestEmailCard } from "@/components/test-email-card"
import { Nav } from "@/components/nav"
import { toast } from "sonner"
import { TEST_PROVIDERS } from "@/lib/utils"
import {
  CheckCircle,
  ClipboardCopy,
  ClipboardCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  FilePlus,
  Plus,
  Mail,
} from "lucide-react"

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testCode, setTestCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    TEST_PROVIDERS.map((p) => p.address)
  )

  const toggleProvider = (addr: string) => {
    setSelectedProviders((prev) =>
      prev.includes(addr) ? prev.filter((a) => a !== addr) : [...prev, addr]
    )
  }

  async function handleStart() {
    try {
      setError(null)
      setIsLoading(true)
      const res = await fetch("/api/start-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Failed to start test")
      const data = await res.json()
      const codeValue = data.testCode ?? data.code ?? null
      setTestCode(codeValue)
      toast.success("Test code generated!")

      try {
        const raw = localStorage.getItem("esr_sessions")
        const arr = raw ? (JSON.parse(raw) as string[]) : []
        const next = [codeValue, ...arr.filter((c) => c !== codeValue)].slice(0, 10)
        localStorage.setItem("esr_sessions", JSON.stringify(next))
      } catch {}
    } catch (e: any) {
      toast.error(e?.message ?? "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    if (!testCode) return
    navigator.clipboard.writeText(testCode).then(() => {
      setCopied(true)
      toast.success("Copied test code to clipboard!")
      setTimeout(() => setCopied(false), 1500)
    })
  }

  async function handleGenerateReport() {
    if (!testCode) return
    if (selectedProviders.length === 0) {
      setError("Select at least one inbox to test.")
      toast.error("Select at least one inbox to test.")
      return
    }
    setError(null)
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testCode, providers: selectedProviders }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error || "Failed creating report")
        throw new Error(j.error || "Failed creating report")
      }
      fetch("/api/trigger-check", { method: "POST" })
      router.push(`/report/${testCode}`)
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate report")
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <Nav />
      <section className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Live Testing Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-pretty tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Email Deliverability Testing
          </h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
            Test your email deliverability across major inbox providers in real-time. Get instant insights on spam filtering and inbox placement.
          </p>
        </div>

        <AnimatedCard className="max-w-2xl mx-auto mb-12">
          <Card className="border-2 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-balance">Start a new test</CardTitle>
              <p className="text-sm text-muted-foreground">Generate a unique test code and send emails to check deliverability</p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Your email address
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 h-11"
                  />
                  <Button
                    onClick={handleStart}
                    disabled={isLoading || !email}
                    size="lg"
                    className={cn("transition-all", isLoading && "opacity-90 cursor-not-allowed")}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="sr-only">Starting test...</span>
                        <Loader2 className="size-4 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      "Generate Code"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This email is for reference only and will appear in your report
                </p>
              </div>

              {testCode && (
                <div className="mt-2 grid gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="rounded-lg border-2 border-primary/20 bg-primary/5 shadow-sm">
                    <div className="flex items-center justify-between px-4 py-1 border-b">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        Your test code
                      </span>
                      <Button variant="secondary" size="sm" onClick={handleCopy} className="font-medium" aria-label="Copy Test Code">
                        {copied ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <ClipboardCheck className="w-3 h-3" />
                            Copied!
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <ClipboardCopy className="w-3 h-3" />
                            Copy
                          </span>
                        )}
                      </Button>
                    </div>
                    <div className="px-4 py-4">
                      <code className="block font-mono text-lg md:text-xl font-bold tracking-tight overflow-x-auto text-primary bg-background rounded-md p-3 border border-primary/20 select-all cursor-pointer"
                        onClick={handleCopy}
                        title="Click to copy"
                        style={{ userSelect: "all" }}
                      >
                        {testCode}
                      </code>
                    </div>
                  </div>

                  {/* Provider selection */}
                  <div className="rounded-lg border-2 bg-card shadow-sm">
                    <div className="px-4 py-3 border-b">
                      <div className="text-sm font-semibold">Select inbox providers</div>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose which inboxes you sent test emails to</p>
                    </div>
                    <div className="p-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {TEST_PROVIDERS.map((p) => (
                          <label 
                            key={p.address} 
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-md border-2 transition-all cursor-pointer hover:border-primary/50",
                              selectedProviders.includes(p.address) 
                                ? "border-primary bg-primary/5" 
                                : "border-border bg-background"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={selectedProviders.includes(p.address)}
                              onChange={() => toggleProvider(p.address)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{p.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{p.address}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          className="text-xs font-medium underline underline-offset-4 text-primary hover:text-primary/80 transition-colors"
                          onClick={() =>
                            setSelectedProviders((prev) =>
                              prev.length === TEST_PROVIDERS.length ? [] : TEST_PROVIDERS.map((p) => p.address)
                            )
                          }
                        >
                          {selectedProviders.length === TEST_PROVIDERS.length ? "Clear all" : "Select all"}
                        </button>
                        <span className="text-xs text-muted-foreground">
                          {selectedProviders.length} selected
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg bg-muted/50 border">
                    <Button onClick={handleGenerateReport} size="lg" className="w-full sm:w-auto font-semibold shadow-sm">
                      <FilePlus className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Creates a live report with real-time status updates for all selected inboxes
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive-foreground bg-destructive/10 rounded-lg p-3 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedCard>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Test Inboxes</h2>
              <p className="text-sm text-muted-foreground mt-1">Available email providers for testing</p>
            </div>
            <Link
              className="text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors flex items-center gap-1"
              href="/history"
            >
              View history
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEST_PROVIDERS.map((p, i) => (
              <AnimatedCard key={p.name} delay={i * 60}>
                <TestEmailCard provider={p.name} address={p.address} />
              </AnimatedCard>
            ))}
          </div>
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