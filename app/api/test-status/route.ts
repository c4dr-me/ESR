import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Report from "@/models/report";
import { ALL_PROVIDER_EMAILS } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const code = url.searchParams.get("code")?.trim();
    if (!code) {
      return NextResponse.json({ success: false, error: "Missing test code" }, { status: 400 });
    }

    const report = await Report.findOne({ testCode: code }).lean().exec();
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const allEmails = ALL_PROVIDER_EMAILS;
    const testedProviders: string[] = Array.isArray(report.providers) && report.providers.length
      ? report.providers.filter((p: string) => allEmails.includes(p))
      : [];

    if (testedProviders.length === 0) {
      return NextResponse.json(
        { success: true, testCode: report.testCode, status: "Pending", complete: false },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const results = (report.resultJson ?? []) as Array<{ provider?: string; folder?: string }>;

    const pending = testedProviders.some((email) => {
      const r = results.find((x) => x.provider === email);
      return !r || r.folder === "Pending";
    });

    return NextResponse.json(
      {
        success: true,
        testCode: report.testCode,
        status: pending ? "Pending" : "Complete",
        complete: !pending,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("Error in /api/test-status:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}