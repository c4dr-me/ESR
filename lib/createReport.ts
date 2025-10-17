import Report, { ReportDoc } from "../models/report";
import { connectDB } from "./mongo";

export type CreateReportInput = {
  userEmail: string;
  testCode: string;
  providers: string[];
  resultJson?: Array<{
    provider: string;
    folder: "Inbox" | "Spam" | "Promotions" | "Pending";
    timestamp: string;
  }>;
  score?: number;
};

/**
 * Create a report document and return the saved ReportDoc.
 * Throws on validation errors.
 */
export async function createReport(input: CreateReportInput): Promise<ReportDoc> {
  await connectDB();

  const doc = new Report({
    userEmail: input.userEmail,
    testCode: input.testCode,
    providers: input.providers,
    resultJson: input.resultJson ?? [],
    score: input.score ?? 0,
  });

  const saved = await doc.save();
  return saved;
}

export default createReport;
