import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Report from "@/models/report";
import { ALL_PROVIDER_EMAILS  } from "@/lib/utils"

const ALL_PROVIDERS = ALL_PROVIDER_EMAILS;
interface Params {
  code: string;
}

export async function GET(req: Request, context: { params: Params }) {
  const { params } = context;
  const { code } = await params;
  if (!code) {
    return NextResponse.json({ success: false, error: "Missing test code" }, { status: 400 });
  }

  try {
    await connectDB();

    const report = await Report.findOne({ testCode: code }).lean().exec();

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const base = new Map<string, { provider: string; folder: string; timestamp: string }>();
    for (const email of ALL_PROVIDERS) {
      base.set(email, { provider: email, folder: "Pending", timestamp: "—" });
    }
    if (Array.isArray(report.resultJson)) {
      for (const r of report.resultJson) {
        if (typeof r?.provider === "string" && base.has(r.provider)) {
          base.set(r.provider, {
            provider: r.provider,
            folder: r.folder || "Pending",
            timestamp: r.timestamp || "—",
          });
        }
      }
    }
    const resultJson = ALL_PROVIDERS.map((email) => base.get(email)!);

    const providers = Array.isArray(report.providers)
      ? report.providers.filter((p: string) => ALL_PROVIDERS.includes(p))
      : [];

    return NextResponse.json(
      {
        success: true,
        testCode: report.testCode,
        userEmail: report.userEmail,
        providers,
        resultJson,
        score: report.score ?? 0,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        nextAttemptAt: report.nextAttemptAt ?? null,
        attempts: report.attempts ?? 0,
        lastError: report.lastError ?? "",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Error fetching report:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch report" }, { status: 500 });
  }
}