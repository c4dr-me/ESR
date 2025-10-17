# Email Spam Report

A Next.js app for real-time email deliverability testing across major inbox providers.  
Test your emails for inbox, spam, and promotions placement using Gmail, Outlook, Yahoo, and iCloud test accounts.

---

## What It Does

- **Automated Deliverability Testing:**  
  Allows you to send test emails to real inboxes (Gmail, Outlook, Yahoo, iCloud) and see where they land (Inbox, Spam, Promotions, etc.).
- **Unique Test Codes:**  
  Generates a unique code for each test to track and identify your email in the test inboxes.
- **Live Status & Scoring:**  
  Shows live placement results and provides a weighted score based on where your email lands.
- **Scheduled Checks:**  
  Uses Vercel cron jobs or external schedulers (like EasyCron or vercel Cron) to automatically check inboxes and update results.
- **PDF Report Generation:**  
  Lets you generate and download PDF reports of your deliverability results.
- **GROQ Integration:**  
  Uses GROQ API for generating brief summaries of deliverability results and insights.
- **Watermark/Footer in PDF:**  
  All generated PDF reports include a watermark or footer for authenticity and branding.

---

## How It Works

1. **Setup:**

   - Configure environment variables for Gmail and Outlook test accounts (OAuth credentials and refresh tokens).
   - Deploy the app to Vercel and set up scheduled checks via Vercel cron jobs or an external scheduler.

2. **Testing Flow:**

   - The app generates a unique test code and provides test email addresses.
   - You send your email campaign to these addresses.
   - The backend periodically checks the test inboxes using the Gmail and Outlook APIs, searching for the unique code.
   - Placement (Inbox, Spam, Promotions, etc.) is detected and results are updated in real time.

3. **Scheduled Checks:**

   - On Vercel Hobby plan, use an external scheduler (like EasyCron) for frequent checks.
   - The `/api/check-emails` endpoint is triggered on a schedule, authenticating with a secret.

4. **PDF Reports:**
   - After tests complete, you can generate a PDF report summarizing your deliverability results.

---

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/email-spam-report.git
cd email-spam-report
```

### 2. Install dependencies

```sh
pnpm install
# or
npm install
```

### 3. Environment Variables

Create a `.env.local` (for local) and/or `.env.production` (for production) file and add the following variables:

```
GMAIL_REDIRECT_URI=
GMAIL_1_CLIENT_ID=
GMAIL_1_CLIENT_SECRET=
GMAIL_1_REFRESH_TOKEN=
GMAIL_2_CLIENT_ID=
GMAIL_2_CLIENT_SECRET=
GMAIL_2_REFRESH_TOKEN=
GMAIL_3_CLIENT_ID=
GMAIL_3_CLIENT_SECRET=
GMAIL_3_REFRESH_TOKEN=
GMAIL_4_CLIENT_ID=
GMAIL_4_CLIENT_SECRET=
GMAIL_4_REFRESH_TOKEN=

OUTLOOK_CLIENT_ID=
OUTLOOK_CLIENT_SECRET=
OUTLOOK_REFRESH_TOKEN=
OUTLOOK_REDIRECT_URI=
OUTLOOK_TENANT_ID=
OUTLOOK_INBOX_ID=
OUTLOOK_JUNK_ID=

MONGODB_URI=
JOB_SECRET=
GROQ_API_KEY=
```

- **Note:**
  - Set your production redirect URIs in Google and Azure dashboards and in your environment files.
  - Obtain refresh tokens for each test account using the correct redirect URI.

### 4. Run locally

```sh
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scheduled Checks on Vercel

### Using Vercel Cron Jobs (Pro Plan or Daily on Hobby)

Add a `vercel.json` file:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/check-emails",
      "schedule": "0 5 * * *"
    }
  ]
}
```

- On Hobby plan, only daily jobs are allowed.
- On Pro plan, you can schedule more frequently.

### Using EasyCron (or Other External Scheduler)

- Set up a POST request to `https://your-vercel-domain.vercel.app/api/check-emails`
- Add header: `x-job-secret: YOUR_JOB_SECRET`
- Set POST data: `{}` (empty JSON)
- Schedule as frequently as you need.

---

## Folder Structure

- `app/` - Next.js app routes and pages
- `components/` - UI components
- `lib/` - Utility functions and API clients
- `models/` - Mongoose models
- `public/` - Static assets

---

## What’s Missing or Could Be Improved

- **OAuth Setup Automation:**  
  The process for obtaining refresh tokens is manual and could be streamlined.
- **Provider Support:**  
  Yahoo and iCloud support may require additional setup or improvements.
- **Admin Panel:**  
  A dashboard for managing test accounts and viewing historical results.
  - **Advanced Analytics:**  
    More detailed reporting and export options.
- **Multi-user Support:**  
  User accounts and team collaboration features.
- **Report Email Customization:**  
  Allow users to customize the report email template and recipients.
- **More Advanced Features:**
  - Integration with additional ESPs (e.g., SendGrid, Mailgun)
  - Real-time webhook notifications for test results
  - API access for automation and integration
  - Sending report via nodemailer directly

---

## PDF Report Generation

- Uses [pdfkit](https://pdfkit.org/) for generating PDF reports.
- No extra setup required; PDF generation is enabled via the `serverComponentsExternalPackages` option in `next.config.mjs`.
- Reports can be downloaded

---

For detailed API setup and usage, **refer to [API.md](API.md)**.
