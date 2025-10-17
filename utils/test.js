import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); 

async function run() {
  const refreshToken = process.env.GMAIL_4_REFRESH_TOKEN; 
  const clientId = process.env.GMAIL_4_CLIENT_ID;
  const clientSecret = process.env.GMAIL_4_CLIENT_SECRET;
  const testCode =  "EST-5J9JE71X";

  if (!refreshToken || !clientId || !clientSecret) {
    console.error("Set GMAIL_1_CLIENT_ID / GMAIL_1_CLIENT_SECRET / GMAIL_1_REFRESH_TOKEN in env");
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  try {
    const list = await gmail.users.messages.list({ userId: "me", q: `"${testCode}"`, maxResults: 5 });
    console.log("list result:", JSON.stringify(list.data, null, 2));
    if (!list.data.messages || list.data.messages.length === 0) {
      console.log("No messages found for code.");
      return;
    }
    const id = list.data.messages[0].id;
    const msg = await gmail.users.messages.get({ userId: "me", id, format: "metadata" });
    console.log("message.labels:", msg.data.labelIds);
  } catch (err) {
    console.error("Gmail API error:", err);
  }
}
run();