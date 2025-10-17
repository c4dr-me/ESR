import dotenv from "dotenv";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

dotenv.config({ path: ".env.local" });

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID,
    client_secret: process.env.OUTLOOK_CLIENT_SECRET,
    refresh_token: process.env.OUTLOOK_REFRESH_TOKEN,
    grant_type: "refresh_token",
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID || "common"}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get access token: " + JSON.stringify(data));
  return data.access_token;
}

async function run() {
  const testCode = process.argv[2] || "ESR-F1KL4M8H";
  const accessToken = await getAccessToken();
  const client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });

  const folders = await client.api("/me/mailFolders").get();
  console.log("Available folders:");
  folders.value.forEach(f => console.log(`${f.displayName}: ${f.id}`));
  // Helper to check a folder
  async function checkFolder(folderName) {
    let folderId = folderName;
    if (folderName === "Promotions") {
      const folders = await client.api("/me/mailFolders").filter(`displayName eq 'Promotions'`).get();
      if (!folders.value || folders.value.length === 0) return false;
      folderId = folders.value[0].id;
    }
    const messages = await client
      .api(`/me/mailFolders/${folderId}/messages`)
      .top(15)
      .select("id,subject,bodyPreview")
      .get();
    console.log("Subjects in folder:", messages.value.map(m => m.subject));
    return messages.value.some(
    m =>
      (m.subject && m.subject.includes(testCode)) ||
      (m.bodyPreview && m.bodyPreview.includes(testCode))
  );
  }

  if (await checkFolder(process.env.OUTLOOK_INBOX_ID)) {
    console.log("Inbox");
    return;
  }
  if (await checkFolder(process.env.OUTLOOK_JUNK_ID)) {
    console.log("Spam");
    return;
  }
  if (await checkFolder("Promotions")) {
    console.log("Promotions");
    return;
  }
  console.log("Pending");
}

run().catch((err) => {
  console.error("Outlook API error:", err);
});