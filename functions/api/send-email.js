import { json, methodNotAllowed, readJson, badRequest } from "./_utils.js";

async function sendWithResend(env, payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Resend error");
  }

  return { provider: "resend", id: data.id || null };
}

async function sendWithSendGrid(env, payload) {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: env.EMAIL_FROM },
      subject: payload.subject,
      content: [{ type: "text/plain", value: payload.text }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "SendGrid error");
  }

  return { provider: "sendgrid", id: null };
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const to = String(body.to || "").trim();
  const subject = String(body.subject || "Voucher System Notification").trim();
  const text = String(body.text || "").trim();

  if (!to) {
    return badRequest("to is required");
  }

  if (!text) {
    return badRequest("text is required");
  }

  if (!context.env.EMAIL_FROM) {
    return json({
      ok: true,
      queued: false,
      provider: "none",
      message: "EMAIL_FROM not configured. Returning without provider call.",
      payload: { to, subject, text }
    });
  }

  try {
    if (context.env.RESEND_API_KEY) {
      const sent = await sendWithResend(context.env, { to, subject, text });
      return json({ ok: true, queued: true, ...sent });
    }

    if (context.env.SENDGRID_API_KEY) {
      const sent = await sendWithSendGrid(context.env, { to, subject, text });
      return json({ ok: true, queued: true, ...sent });
    }

    return json({
      ok: true,
      queued: false,
      provider: "none",
      message: "No email provider key configured.",
      payload: { to, subject, text }
    });
  } catch (error) {
    return json({ ok: false, error: error.message || "Email provider error" }, 502);
  }
}
