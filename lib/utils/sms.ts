/**
 * SMS delivery via Twilio REST API.
 * No Twilio SDK needed — plain fetch keeps the bundle small.
 */

interface SmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";

/**
 * Send an SMS message via Twilio.
 * Returns `{ ok: true, sid }` on success or `{ ok: false, error }` on failure.
 * Never throws — callers must check `ok`.
 */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    // In development, log the OTP instead of crashing.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[SMS DEV] To: ${to} | Message: ${body}`);
      return { ok: true, sid: "dev-sid" };
    }
    return { ok: false, error: "SMS provider not configured." };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const credentials = Buffer.from(
    `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
  ).toString("base64");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }),
    });

    const json = await res.json();

    if (!res.ok) {
      return { ok: false, error: json?.message ?? `Twilio error ${res.status}` };
    }

    return { ok: true, sid: json.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown SMS error";
    console.error("[SMS] Delivery failed:", message);
    return { ok: false, error: message };
  }
}
