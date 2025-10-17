import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export async function getOutlookAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID ?? "",
    client_secret: process.env.OUTLOOK_CLIENT_SECRET ?? "",
    refresh_token: process.env.OUTLOOK_REFRESH_TOKEN ?? "",
    grant_type: "refresh_token",
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI ?? "",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID ?? "common"}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token");
  return data.access_token;
}

export async function checkOutlookInbox(
  testCode: string
): Promise<"Inbox" | "Spam" | "Promotions" | "Pending"> {
  const accessToken = await getOutlookAccessToken();
  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  // folder IDs 
  const inboxId = process.env.OUTLOOK_INBOX_ID;
  const junkId = process.env.OUTLOOK_JUNK_ID;

  // Helper to check if testCode is in subject or bodyPreview
  async function checkFolder(folderId?: string) {
    if (!folderId) return false;
    const messages = await client
      .api(`/me/mailFolders/${folderId}/messages`)
      .top(20)
      .select("id,subject,bodyPreview")
      .get();
    //   console.log(
    //     `Checking folder ${folderId} for testCode "${testCode}":`,
    //      messages.value.map((m: any) => ({
    //     subject: m.subject,
    //     bodyPreview: m.bodyPreview,
    //   }))
    // );
    return messages.value.some(
      (m: any) =>
        (m.subject && m.subject.includes(testCode)) ||
        (m.bodyPreview && m.bodyPreview.includes(testCode))
    );
  }

  if (await checkFolder(inboxId)) {
    console.log("Found in Inbox");
    return "Inbox";
  }
  if (await checkFolder(junkId)) {
    console.log("Found in Spam");
    return "Spam";
  }

  // Check Promotions (custom folder, if exists)
  try {
    const promoFolders = await client
      .api("/me/mailFolders")
      .filter(`displayName eq 'Promotions'`)
      .get();

    if (promoFolders.value && promoFolders.value.length > 0) {
      const promoFolderId = promoFolders.value[0].id;
      if (await checkFolder(promoFolderId)) return "Promotions";
    }
  } catch {
    // Ignore if folder doesn't exist
  }

  return "Pending";
}