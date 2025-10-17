import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Report from "@/models/report";
import { ALL_PROVIDER_EMAILS } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { testCode, providers } = body as { testCode?: string; providers?: string[] };
    if (!testCode) return NextResponse.json({ success: false, error: "testCode is required" }, { status: 400 });

    const allEmails = ALL_PROVIDER_EMAILS;
    const testedProviders = Array.isArray(providers) && providers.length
      ? providers.filter((p) => allEmails.includes(p))
      : allEmails;

    const resultJson = allEmails.map((email) => ({
      provider: email,
      folder: "Pending" as const,
      timestamp: "—",
    }));

    const doc = await Report.findOneAndUpdate(
      { testCode },
      { $set: { providers: testedProviders, resultJson } },
      { new: true }
    ).exec();

    if (!doc) return NextResponse.json({ success: false, error: "Report draft not found" }, { status: 404 });
    return NextResponse.json({ success: true, testCode, providers: testedProviders });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message ?? "Failed to create report" }, { status: 500 });
  }
}