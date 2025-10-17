import mongoose, { Document, Model } from "mongoose";

export interface ReportDoc extends Document {
  userEmail: string;
  testCode: string;
  providers: string[];
  resultJson: Array<{
    provider: string;
    folder: "Inbox" | "Spam" | "Promotions" | "Pending";
    timestamp: string;
  }>;
  score: number;

  attempts?: number;
  processing?: boolean;
  processingStartedAt?: Date;
  nextAttemptAt?: Date | null;
  lastError?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new mongoose.Schema<ReportDoc>(
  {
    userEmail: { type: String, required: true },
    testCode: { type: String, required: true, index: true },
    providers: { type: [String], required: true },
    resultJson: {
      type: [
        {
          provider: { type: String, required: true },
          folder: { type: String, enum: ["Inbox", "Spam", "Promotions", "Pending"], required: true },
          timestamp: { type: String, required: true },
        },
      ],
      default: [],
    },
    score: { type: Number, default: 0 },

    attempts: { type: Number, default: 0 },
    processing: { type: Boolean, default: false, index: true },
    processingStartedAt: { type: Date },
    nextAttemptAt: { type: Date, index: true },
    lastError: { type: String, default: "" },
  },
  { timestamps: true } 
);

ReportSchema.index({ processing: 1, nextAttemptAt: 1, createdAt: 1 });

const Report: Model<ReportDoc> = mongoose.models.Report || mongoose.model<ReportDoc>("Report", ReportSchema);
export default Report;