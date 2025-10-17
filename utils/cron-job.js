import dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); 

const BASE = process.env.DEV_BASE_URL ?? 'http://localhost:3000';
const INTERVAL = Number(process.env.DEV_POLL_INTERVAL ?? 60_000);
const JOB_SECRET = process.env.JOB_SECRET ?? '';

async function hit() {
  try {
    const res = await fetch(`${BASE}/api/check-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(JOB_SECRET && { 'x-job-secret': JOB_SECRET }),
      },
      body: JSON.stringify({}),
    });
    const json = await res.json().catch(() => ({}));
    console.log(new Date().toISOString(), res.status, json);
  } catch (err) {
    console.error('dev-cron request failed', err);
  }
}

(async function loop() {
  console.log(`dev-cron: POST ${BASE}/api/check-emails every ${INTERVAL}ms`);
  while (true) {
    await hit();
    // sleep
    await new Promise((r) => setTimeout(r, INTERVAL));
  }
})();