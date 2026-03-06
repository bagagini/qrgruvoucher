import { requireSession } from "./_auth.js";
import { badRequest, json, methodNotAllowed, readJson } from "./_utils.js";

const EMAIL_TO = "grukkqr@br.qatarairways.com";

function decodeBase64(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sendWithResend(env, pdfBytes, fileName) {
  const attachmentBase64 = btoa(String.fromCharCode(...pdfBytes));

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [EMAIL_TO],
      subject: "GRU Voucher Batch",
      text: "Attached voucher batch PDF.",
      attachments: [{ filename: fileName, content: attachmentBase64 }]
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || "Resend failed");
  }

  return { provider: "resend", provider_id: payload.id || null };
}

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(context.request);
  const fileName = String(body.file_name || "voucher_batch.pdf").trim();
  const pdfBase64 = String(body.pdf_base64 || "").trim();
  const sendEmail = Boolean(body.send_email);

  if (!pdfBase64) {
    return badRequest("pdf_base64 is required");
  }

  let pdfBytes;
  try {
    pdfBytes = decodeBase64(pdfBase64);
  } catch {
    return badRequest("Invalid pdf_base64");
  }

  let storedKey = null;
  if (context.env.VOUCHER_FILES) {
    storedKey = `batches/${new Date().toISOString().slice(0, 10)}/${Date.now()}_${fileName}`;
    await context.env.VOUCHER_FILES.put(storedKey, pdfBytes, {
      httpMetadata: { contentType: "application/pdf" }
    });
  }

  if (!sendEmail) {
    return json({ ok: true, emailed: false, stored_key: storedKey, recipient: EMAIL_TO });
  }

  if (!context.env.EMAIL_FROM || !context.env.RESEND_API_KEY) {
    return json({
      ok: true,
      emailed: false,
      stored_key: storedKey,
      recipient: EMAIL_TO,
      message: "Email provider not configured (set EMAIL_FROM and RESEND_API_KEY)."
    });
  }

  try {
    const sent = await sendWithResend(context.env, pdfBytes, fileName);
    return json({ ok: true, emailed: true, stored_key: storedKey, recipient: EMAIL_TO, ...sent });
  } catch (error) {
    return json({ ok: false, error: error.message, stored_key: storedKey }, 502);
  }
}
