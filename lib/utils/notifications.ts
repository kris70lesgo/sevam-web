/**
 * Firebase Cloud Messaging — HTTP v1 API helper.
 * Uses service-account access token via Google OAuth2. No firebase-admin SDK needed.
 */

interface FcmPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

const FCM_PROJECT_ID = process.env.FCM_PROJECT_ID ?? "";
const FCM_SERVICE_ACCOUNT_JSON = process.env.FCM_SERVICE_ACCOUNT_JSON ?? "";

/**
 * Get a short-lived OAuth2 access token using the service account.
 * In production, cache this token (it's valid for 1 hour).
 */
async function getAccessToken(): Promise<string> {
  if (!FCM_SERVICE_ACCOUNT_JSON) {
    throw new Error("Missing env: FCM_SERVICE_ACCOUNT_JSON");
  }

  const sa = JSON.parse(FCM_SERVICE_ACCOUNT_JSON) as {
    client_email: string;
    private_key: string;
  };

  // Build a signed JWT for the Google OAuth2 token endpoint
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600;

  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      sub: sa.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
    })
  ).toString("base64url");

  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, "base64url");
  const jwt = `${header}.${payload}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenJson = await tokenRes.json();
  return tokenJson.access_token as string;
}

/**
 * Send a push notification to a single FCM device token.
 * Fails silently (logs) so notification failures never break core flows.
 */
export async function sendPushNotification(
  fcmToken: string,
  { title, body, data }: FcmPayload
): Promise<void> {
  if (!FCM_PROJECT_ID || !FCM_SERVICE_ACCOUNT_JSON) {
    // Dev mode — just log
    if (process.env.NODE_ENV !== "production") {
      console.info(`[FCM DEV] Token: ${fcmToken.slice(0, 20)}… | ${title}: ${body}`);
    }
    return;
  }

  try {
    const accessToken = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_ID}/messages:send`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: { title, body },
          data: data ?? {},
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default" } } },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("[FCM] Send failed:", err);
    }
  } catch (err) {
    console.error("[FCM] Unexpected error:", err);
  }
}

/**
 * Send the same notification to multiple tokens (fan-out).
 * Ignores individual failures.
 */
export async function sendPushToMany(
  fcmTokens: string[],
  payload: FcmPayload
): Promise<void> {
  await Promise.allSettled(
    fcmTokens.map((token) => sendPushNotification(token, payload))
  );
}
