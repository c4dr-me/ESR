import readline from "readline";
import https from "https";
import querystring from "querystring";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CLIENT_ID = process.env.OUTLOOK_CLIENT_ID;
const REDIRECT_URI = process.env.OUTLOOK_REDIRECT_URI;
const TENANT_ID = process.env.OUTLOOK_TENANT_ID || "common";
const SCOPES = ["openid", "offline_access", "Mail.Read"].join(" ");

const authUrl =
  `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_mode=query` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&state=xyz`;

console.log("\nOpen this URL in your browser and sign in:");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code from the redirected URL here: ", (code) => {
  const CLIENT_SECRET = process.env.OUTLOOK_CLIENT_SECRET;
  const postData = querystring.stringify({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: code.trim(),
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  });

  const options = {
    hostname: "login.microsoftonline.com",
    path: `/${TENANT_ID}/oauth2/v2.0/token`,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      try {
        const result = JSON.parse(data);
        console.log("\n1. Access Token:", result.access_token);
        console.log("\n2. Refresh Token:", result.refresh_token);
        console.log("\n3. Token Expiry (seconds):", result.expires_in);
        console.log("\n4. Full Response:", result);
      } catch (err) {
        console.error("Error parsing response:", err, data);
      }
      rl.close();
    });
  });

  req.on("error", (e) => {
    console.error("Request error:", e);
    rl.close();
  });

  req.write(postData);
  req.end();
});