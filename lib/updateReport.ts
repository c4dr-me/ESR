import Report from "../models/report";
import { connectDB } from "./mongo";
import type { ReportDoc } from "../models/report";

export type ResultItem = {
  provider: string;
  folder: "Inbox" | "Spam" | "Promotions" | "Pending";
  timestamp: string;
};

export async function updateReportResults(
  testCode: string,
  results: ResultItem[],
  score: number
): Promise<ReportDoc | null> {
  await connectDB();

  const updated = await Report.findOneAndUpdate(
    { testCode },
    { resultJson: results, score },
    { new: true }
  );

  return updated as unknown as ReportDoc | null;
}

export default updateReportResults;
