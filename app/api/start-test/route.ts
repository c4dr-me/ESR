
import { NextRequest, NextResponse } from "next/server";
import createReport from "@/lib/createReport";

function generateTestCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "ESR-";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userEmail = body.email || null;

    const testCode = generateTestCode();

    const newReport = await createReport({
      userEmail,
      testCode,
      providers: [],
      resultJson: [],
      score: 0,
    });

    return NextResponse.json({ success: true, testCode, reportId: newReport._id });
  } catch (err) {
    console.error("Error creating test:", err);
    return NextResponse.json({ success: false, error: "Failed to create test" }, { status: 500 });
  }
}