import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/check-emails`, {
    method: "POST",
    headers: {
      "x-job-secret": process.env.JOB_SECRET || "",
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}