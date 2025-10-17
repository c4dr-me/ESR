import { google } from "googleapis";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" }); 

const CLIENT_ID = process.env.GMAIL_4_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_4_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("Authorize this app by visiting this URL:\n", authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nEnter the code from the URL: ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    console.log("\n1. Access Token:", tokens.access_token);
    console.log("\n2. Refresh Token:", tokens.refresh_token);
    console.log("\n3. Token Expiry:", tokens.expiry_date);
  } catch (error) {
    console.error("Error retrieving tokens:", error);
  }
  rl.close();
});
