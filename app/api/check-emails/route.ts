import { NextResponse } from "next/server";
import { google } from "googleapis";
import { connectDB } from "@/lib/mongo";
import updateReportResults from "@/lib/updateReport";
import Report from "@/models/report";
import { checkOutlookInbox } from "@/lib/outlookUtils";

type Folder = "Inbox" | "Spam" | "Promotions" | "Pending";

const JOB_SECRET = process.env.JOB_SECRET;

const OUTLOOK_ACCOUNTS = [
  {
    email: "testwith001@outlook.com",
  },
];
const GMAIL_ACCOUNTS = [
  {
    email: "testwith001@gmail.com",
    refreshToken: process.env.GMAIL_1_REFRESH_TOKEN,
    clientId: process.env.GMAIL_1_CLIENT_ID,
    clientSecret: process.env.GMAIL_1_CLIENT_SECRET,
  },
  {
    email: "testwith002@gmail.com",
    refreshToken: process.env.GMAIL_2_REFRESH_TOKEN,
    clientId: process.env.GMAIL_2_CLIENT_ID,
    clientSecret: process.env.GMAIL_2_CLIENT_SECRET,
  },
  {
    email: "testwith003@gmail.com",
    refreshToken: process.env.GMAIL_3_REFRESH_TOKEN,
    clientId: process.env.GMAIL_3_CLIENT_ID,
    clientSecret: process.env.GMAIL_3_CLIENT_SECRET,
  },
  {
    email: "testwith004@gmail.com",
    refreshToken: process.env.GMAIL_4_REFRESH_TOKEN,
    clientId: process.env.GMAIL_4_CLIENT_ID,
    clientSecret: process.env.GMAIL_4_CLIENT_SECRET,
  },
];

function getGmailClient(
  refreshToken: string,
  clientId?: string,
  clientSecret?: string
) {
  const id =
    clientId || process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_1_CLIENT_ID;

  const secret =
    clientSecret ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GMAIL_1_CLIENT_SECRET;
  if (!id || !secret)
    throw new Error("Missing OAuth client id/secret for Gmail API");

  const oAuth2Client = new google.auth.OAuth2(id, secret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: "v1", auth: oAuth2Client });
}

// Check inbox for a single account
async function checkInbox(
  account: (typeof GMAIL_ACCOUNTS)[number],
  testCode: string
): Promise<Folder> {
  try {
    if (!account.refreshToken) return "Pending";

    const gmail = getGmailClient(
      account.refreshToken,
      account.clientId,
      account.clientSecret
    );

    const spamRes = await gmail.users.messages.list({
      userId: "me",
      q: `in:spam "${testCode}"`,
      maxResults: 1,
    });
    if (spamRes.data.messages?.length) {
      console.log(`SPAM: ${account.email}`);
      return "Spam";
    }

    const promoRes = await gmail.users.messages.list({
      userId: "me",
      q: `category:promotions "${testCode}"`,
      maxResults: 1,
    });
    if (promoRes.data.messages?.length) {
      console.log(`PROMOTIONS: ${account.email}`);
      return "Promotions";
    }

    const inboxRes = await gmail.users.messages.list({
      userId: "me",
      q: `in:inbox "${testCode}"`,
      maxResults: 1,
    });
    if (inboxRes.data.messages?.length) {
      console.log(`INBOX: ${account.email}`);
      return "Inbox";
    }

    console.log(`PENDING: ${account.email}`);
    return "Pending";
  } catch (err: any) {
    console.error("Error checking inbox:", account.email, err?.message ?? err);
    return "Pending";
  }
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-job-secret");
  if (!JOB_SECRET || secret !== JOB_SECRET) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  let processed = 0;

  while (true) {
    const now = new Date();
    const filter = {
      $and: [
        { providers: { $exists: true, $ne: [] } },
        { processing: { $ne: true } },
        {
          $or: [
            { nextAttemptAt: { $exists: false } },
            { nextAttemptAt: { $lte: now } },
          ],
        },
        {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$resultJson",
                    as: "r",
                    cond: {
                      $and: [
                        { $in: ["$$r.provider", "$providers"] },
                        { $eq: ["$$r.folder", "Pending"] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      ],
    };
    const report: any = await Report.findOneAndUpdate(
      filter,
      { $set: { processing: true, processingStartedAt: now } },
      { sort: { createdAt: 1 }, returnDocument: "after" }
    ).exec();

    if (!report) break;

    try {
      const allProviders = [
        ...GMAIL_ACCOUNTS.map((a) => a.email),
        ...OUTLOOK_ACCOUNTS.map((a) => a.email),
      ];
      const testedProviders: string[] =
        Array.isArray(report.providers) && report.providers.length
          ? report.providers.filter((p: string) => allProviders.includes(p))
          : allProviders;

      let results: Array<{
        provider: string;
        folder: Folder;
        timestamp: string;
      }> =
        Array.isArray(report.resultJson) && report.resultJson.length
          ? report.resultJson
          : allProviders.map((email) => ({
              provider: email,
              folder: "Pending" as Folder,
              timestamp: "—",
            }));

      for (const acct of GMAIL_ACCOUNTS) {
        if (!testedProviders.includes(acct.email)) continue;

        const folder = await checkInbox(acct, report.testCode);
        const updated = {
          provider: acct.email,
          folder,
          timestamp: folder === "Pending" ? "—" : new Date().toLocaleString(),
        };

        const idx = results.findIndex((r) => r.provider === acct.email);
        if (idx >= 0) results[idx] = updated;
        else results.push(updated);
      }
      for (const acct of OUTLOOK_ACCOUNTS) {
        if (!testedProviders.includes(acct.email)) continue;

        const folder = await checkOutlookInbox(report.testCode);
        const updated = {
          provider: acct.email,
          folder,
          timestamp: folder === "Pending" ? "—" : new Date().toLocaleString(),
        };

        const idx = results.findIndex((r) => r.provider === acct.email);
        if (idx >= 0) results[idx] = updated;
        else results.push(updated);
      }

      const testedResults = results.filter((r) =>
        testedProviders.includes(r.provider)
      );
      const inboxCount = testedResults.filter(
        (r) => r.folder === "Inbox"
      ).length;

      const weightedScore = testedResults.reduce((sum, r) => {
        if (r.folder === "Inbox") return sum + 1;
        if (r.folder === "Promotions") return sum + 0.7;
        if (r.folder === "Spam") return sum + 0.3;
        return sum;
      }, 0);
      const score = testedResults.length
        ? Math.round((weightedScore / testedResults.length) * 100)
        : 0;

      await updateReportResults(report.testCode, results, score);

      const hasPendingTested = testedResults.some(
        (r) => r.folder === "Pending"
      );
      const attempts = (report.attempts ?? 0) + 1;
      const backoffMs = Math.min(
        60_000 * Math.pow(2, Math.max(0, attempts - 1)),
        15 * 60_000
      );

      if (hasPendingTested) {
        await Report.updateOne(
          { _id: report._id },
          {
            $unset: { processing: "" },
            $inc: { attempts: 1 },
            $set: {
              lastError: "",
              nextAttemptAt: new Date(Date.now() + backoffMs),
              updatedAt: new Date(),
            },
          }
        ).exec();
      } else {
        await Report.updateOne(
          { _id: report._id },
          {
            $unset: { processing: "" },
            $set: {
              attempts: 0,
              lastError: "",
              nextAttemptAt: null,
              updatedAt: new Date(),
            },
          }
        ).exec();
      }

      console.log(
        `Updated report ${report.testCode} (${report._id}) score=${score}`
      );
      processed++;
    } catch (err: any) {
      console.error(
        "Processing failed for",
        report.testCode,
        err?.message ?? err
      );
      const attempts = (report.attempts ?? 0) + 1;
      const backoffMs = Math.min(
        60_000 * Math.pow(2, attempts - 1),
        15 * 60_000
      );

      await Report.updateOne(
        { _id: report._id },
        {
          $unset: { processing: "" },
          $inc: { attempts: 1 },
          $set: {
            lastError: String(err?.message ?? err),
            nextAttemptAt: new Date(Date.now() + backoffMs),
          },
        }
      ).exec();
    }
  }

  return NextResponse.json({ success: true, updated: processed });
}
