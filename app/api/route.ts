import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";

export async function GET() {
  try {
    const mongoose = await connectDB();
    return NextResponse.json({
      ok: true,
      readyState: mongoose.connection.readyState, 
    });
  } catch (err: any) {
    console.error("DB check failed:", err);
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}