# API Instructions

This guide explains how to set up tokens, configure environment variables, and use the utility functions for Gmail and Outlook integration in your Email Spam Report project.

---

## 1. Gmail API Setup

### a. Create a Google Cloud Project

- Go to [Google Cloud Console](https://console.cloud.google.com/).
- Create a new project.

### b. Enable Gmail API

- In your project, go to **APIs & Services > Library**.
- Search for "Gmail API" and enable it.

### c. Create OAuth Credentials

- Go to **APIs & Services > Credentials**.
- Click **Create Credentials > OAuth client ID**.
- Choose "Web application".
- Set the redirect URI (e.g., `http://localhost:3000/api/oauth-callback` for local, or your Vercel domain for production).
- Save your **Client ID** and **Client Secret**.

### d. Get Refresh Token

- Use a tool like [OAuth Playground](https://developers.google.com/oauthplayground/) or your own script to authorize your app and get a refresh token.
- Make sure to use the same redirect URI as in your credentials.

### e. Add to `.env.local`

```
GMAIL_1_CLIENT_ID=your_client_id
GMAIL_1_CLIENT_SECRET=your_client_secret
GMAIL_1_REFRESH_TOKEN=your_refresh_token
GMAIL_REDIRECT_URI=your_redirect_uri
```

Repeat for additional Gmail accounts.

---

## 2. Outlook API Setup

### a. Register an Azure App

- Go to [Azure Portal](https://portal.azure.com/).
- Register a new application in **Azure Active Directory > App registrations**.

### b. Configure API Permissions

- Add permissions for `Mail.Read` and `offline_access`.

### c. Get Client ID, Secret, and Tenant ID

- Copy the **Application (client) ID**, **Directory (tenant) ID**, and generate a **Client Secret**.

### d. Set Redirect URI

- Set the redirect URI for your app (local and production).

### e. Get Refresh Token

- Use a tool or script to authorize your app and obtain a refresh token.
- The refresh token is tied to the redirect URI used during authorization.

### f. Add to `.env.local`

```
OUTLOOK_CLIENT_ID=your_client_id
OUTLOOK_CLIENT_SECRET=your_client_secret
OUTLOOK_REFRESH_TOKEN=your_refresh_token
OUTLOOK_REDIRECT_URI=your_redirect_uri
OUTLOOK_TENANT_ID=your_tenant_id
OUTLOOK_INBOX_ID=your_inbox_folder_id
OUTLOOK_JUNK_ID=your_junk_folder_id
```

---

## 3. Utility Functions

### a. Gmail

- Uses `googleapis` to connect and check inbox, spam, and promotions.
- Utility: `getGmailClient` in `/lib/utils` or `/api/check-emails/route.ts`.

### b. Outlook

- Uses Microsoft Graph API to check Inbox, Junk, and Promotions.
- Utility: `getOutlookAccessToken` and `checkOutlookInbox` in `/lib/outlookUtils.ts`.

---

## 4. Token Refresh Notes

- **Refresh tokens are tied to the redirect URI.**  
  If you change the redirect URI (e.g., when moving to production), you must re-authorize and get a new refresh token.
- Store tokens securely and never commit them to source control.

---

## 5. Running Checks

- The `/api/check-emails` endpoint uses these tokens to check deliverability for each provider.
- Scheduled via Vercel cron job (see README).

---

## 6. Troubleshooting

- If you get authentication errors, check that your refresh token matches the redirect URI and client credentials.
- Ensure all required environment variables are set in Vercel for production.
- For configuring via azure use chrome or edge

---

## 7. References

- [Google OAuth Playground](https://developers.google.com/oauthplayground/)
- [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
- [pdfkit documentation](https://pdfkit.org/)

## 8. Utility Scripts for Setup

You can use utility functions in `/lib/outlookUtils.ts` and `/lib/utils.ts` to help with setup tasks:

- **Get Outlook Folder IDs:**  
  Use helper functions or scripts to list your Outlook folders and find the correct `INBOX` and `JUNK` folder IDs for your account.

- **Get Refresh Tokens:**  
  Use provided scripts or instructions to run the OAuth flow and obtain refresh tokens for Gmail and Outlook.

- **Testing Utilities:**  
  You can use these utilities to verify your API credentials and tokens before deploying to production.
