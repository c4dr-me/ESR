"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ProgressBar({
  value,
  label = "Deliverability",
}: {
  value: number
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setWidth(clamped), 50)
    return () => clearTimeout(id)
  }, [clamped])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{clamped}%</span>
      </div>
      <div className="h-3 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-primary transition-[width] duration-700 ease-out")}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
