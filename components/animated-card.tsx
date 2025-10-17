"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => setVisible(true), delay)
            obs.disconnect()
          }
        })
      },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500",
        "rounded-lg",
        "will-change-transform will-change-opacity",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        // hover micro-interaction
        "hover:shadow-md hover:shadow-foreground/5",
        className,
      )}
    >
      {children}
    </div>
  )
}
