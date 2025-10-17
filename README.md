# Email Spam Report

A Next.js app for real-time email deliverability testing across major inbox providers.  
Test your emails for inbox, spam, and promotions placement using Gmail, Outlook, Yahoo, and iCloud test accounts.

## Features

- Generate a unique test code for each deliverability test
- Select inbox providers to test (Gmail, Outlook, Yahoo, iCloud)
- View live status and placement (Inbox, Spam, Promotions, Pending)
- Weighted scoring based on placement
- Glassmorphic UI cards for each provider
- Copy test addresses easily
- Automated scheduled checks via Vercel cron jobs

## Getting Started

### 1. Clone the repository

```sh
git clone https://github.com/yourusername/email-spam-report.git
cd email-spam-report
```

### 2. Install dependencies

```sh
pnpm install
```

or

```sh
npm install
```

### 3. Environment Variables

Create a `.env.local` file and add the following variables:

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

Add additional Gmail/Outlook tokens as needed.

### 4. Run locally

```sh
pnpm dev
```

or

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scheduled Checks on Vercel

To run the `/api/check-emails` endpoint as a cron job on Vercel:

1. Add a `vercel.json` file to your project root:

   ```json
   {
     "cron": [
       {
         "path": "/api/check-emails",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```

2. Set all required environment variables in your Vercel dashboard.

3. Deploy your project to Vercel.  
   The scheduled function will run automatically.

**How it works:**  
The cron job acts like a worker queue, automatically processing pending deliverability reports in the background.  
It checks for new or incomplete tests and updates their status and scoring as results arrive.

## Folder Structure

- `app/` - Next.js app routes and pages
- `components/` - UI components
- `lib/` - Utility functions and API clients
- `models/` - Mongoose models
- `public/` - Static assets

## Customization

- Add/remove test providers in `TEST_PROVIDERS` in `@/lib/utils`
- Update scoring logic in `/api/check-emails/route.ts` as needed

## PDF Report Generation

This project uses [pdfkit](https://pdfkit.org/) for generating PDF reports of your deliverability results.

- Watermarked and Footer added as well
- PDF generation is enabled via the `serverComponentsExternalPackages` experimental option in `next.config.mjs`.
- You can generate and download PDF reports from your deliverability results page.

No additional setup is required; pdfkit is bundled and available for server-side PDF generation.
