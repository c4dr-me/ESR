"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Mail,
  Cloud,
  MailWarning,
  ClipboardCheck,
  ClipboardCopy,
  Info,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { PiMicrosoftOutlookLogoDuotone } from "react-icons/pi";

export function TestEmailCard({
  provider,
  address,
}: {
  provider: string;
  address: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const glassClass =
    "bg-white/40 backdrop-blur-md border border-white/30 shadow-lg";

  const getProviderColor = (name: string) => {
    if (name.includes("Gmail")) {
      return "text-red-500 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-400 hover:text-red-700";
    }
    if (name.includes("Outlook")) {
      return "text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-700";
    }
    if (name.includes("Yahoo")) {
      return "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-400 hover:text-purple-700";
    }
    if (name.includes("iCloud")) {
      return "text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-400 hover:text-sky-700";
    }
    return "text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-700";
  };

  const getProviderIcon = (name: string) => {
    if (name.includes("Gmail")) {
      return <FcGoogle className="w-5 h-5" />;
    }
    if (name.includes("Outlook")) {
      return <PiMicrosoftOutlookLogoDuotone className="w-5 h-5 text-blue-500" />;
    }
    if (name.includes("Yahoo")) {
      return <MailWarning className="w-4 h-4" color="#a855f7" />;
    }
    if (name.includes("iCloud")) {
      return <Cloud className="w-4 h-4" color="#0ea5e9" />;
    }
    return <Mail className="w-4 h-4" color="#64748b" />;
  };

  const colorClass = getProviderColor(provider);

  return (
    <Card
      className={cn(
        "group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl border-2",
        glassClass,
        colorClass
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            {getProviderIcon(provider)}
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-150",
                colorClass.split(" ")[1]
              )}
            />
            {provider}
          </CardTitle>
          <div
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide border",
              colorClass
            )}
          >
            Active
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          className={cn(
            "group/copy relative p-3 rounded-lg border-2 cursor-pointer transition-all",
            glassClass,
            colorClass
          )}
          onClick={handleCopy}
        >
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm font-mono text-muted-foreground break-all flex-1">
              {address}
            </code>
            <div className="flex-shrink-0">
              {copied ? (
                <div className="flex items-center gap-1 text-green-600 font-medium text-xs animate-in fade-in zoom-in duration-200">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
              ) : (
                <ClipboardCopy className="w-4 h-4 text-muted-foreground/60 group-hover/copy:text-primary transition-colors" />
              )}
            </div>
          </div>
          <div className="absolute inset-0 rounded-lg opacity-0 group-hover/copy:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 rounded-lg border-2 border-primary/20 animate-pulse" />
          </div>
        </div>
        <p className="text-xs text-muted-foreground/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Info className="w-3 h-3" />
          Click to copy email address
        </p>
      </CardContent>
    </Card>
  );
}