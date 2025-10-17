import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongo";
import Report from "@/models/report";
import PDFDocument from "pdfkit";
import path from "path";
import { getGroqSummary } from "@/lib/groq";
import {
  addWatermarkToCurrentPage,
  addFooterToCurrentPage,
} from "@/lib/pdfUtils";

export async function GET(req: Request, context: { params: { code: string } }) {
  await connectDB();
  const { params } = context;
  const { code } = await params;

  const report = await Report.findOne({ testCode: code }).lean().exec();

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  const groqApiKey = process.env.GROQ_API_KEY ?? "";
  if (!groqApiKey) {
    return NextResponse.json({ error: "Groq API Key found" }, { status: 404 });
  }

  const doc = new PDFDocument({
    margin: 50,
    size: "A4",
    layout: "portrait",
    margins: { top: 50, bottom: 60, left: 50, right: 50 }
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {});

  const fontPath = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansMono-Regular.ttf"
  );
  doc.registerFont("NotoSansMono", fontPath);
  doc.font("NotoSansMono");

  const selectedProviders = report.providers ?? [];
  const filteredResults = (report.resultJson ?? []).filter((r) =>
    selectedProviders.includes(r.provider)
  );

  const filteredReport = { ...report, resultJson: filteredResults };

  const summary = await getGroqSummary(filteredReport, groqApiKey);
  const cleanSummary = summary.replace(/\*\*/g, "").replace(/\*/g, "").trim();

  // --- PDF Content ---
  doc
    .font("NotoSansMono")
    .fontSize(18)
    .text(`Email Spam Report: ${report.testCode}`, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`User Email: ${report.userEmail ?? "N/A"}`);
  doc.text(`Created At: ${report.createdAt}`);
  doc.text(`Score: ${report.score}`);
  doc.moveDown();

  doc.fontSize(12).fillColor("blue").text("Summary:", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("black").text(cleanSummary);
  doc.moveDown();

  doc.text("Results:");
  doc.moveDown();

  doc.font("NotoSansMono").fontSize(10);
  doc.text("Provider                Folder        Timestamp");
  doc.moveDown(0.5);

  for (const row of (report.resultJson ?? []).filter((r) =>
    selectedProviders.includes(r.provider)
  )) {
    doc.text(
      `${row.provider.padEnd(22)} ${row.folder.padEnd(12)} ${row.timestamp}`,
      { continued: false }
    );
  }

  addWatermarkToCurrentPage(doc, "ESR", "NotoSansMono");
  addFooterToCurrentPage(
    doc,
    "© Email Spam Report Tool - email-spam-report.vercel.app",
    "NotoSansMono"
  );

  doc.on("pageAdded", () => {
    addWatermarkToCurrentPage(doc, "ESR", "NotoSansMono");
    addFooterToCurrentPage(
      doc,
      "© Email Spam Report Tool - email-spam-report.vercel.app",
      "NotoSansMono"
    );
  });

  doc.end();

  await new Promise((resolve) => doc.on("end", resolve));
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="email-spam-report-${report.testCode}.pdf"`,
    },
  });
}
