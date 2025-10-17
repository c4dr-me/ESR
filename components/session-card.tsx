"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressBar } from "./progress"
import { cn } from "@/lib/utils"

export function SessionCard({
  code,
  score,
  complete,
}: {
  code: string
  score: number
  complete: boolean
}) {
  return (
    <Link href={`/report/${code}`} className="block">
      <Card className={cn("transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md")}>
        <CardHeader>
          <CardTitle className="text-base">Session #{code}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProgressBar value={score} label={complete ? "Final score" : "Current score"} />
          <div className="text-xs text-muted-foreground">{complete ? "Completed" : "In progress"}</div>
        </CardContent>
      </Card>
    </Link>
  )
}
