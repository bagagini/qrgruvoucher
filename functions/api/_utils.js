export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function badRequest(message) {
  return json({ error: message }, 400);
}

export function unauthorized(message = "Unauthorized") {
  return json({ error: message }, 401);
}

export function forbidden(message = "Forbidden") {
  return json({ error: message }, 403);
}

export function methodNotAllowed() {
  return json({ error: "Method not allowed" }, 405);
}

export function isoNow() {
  return new Date().toISOString();
}

export function yyyymmddFromIso(iso) {
  return String(iso).slice(0, 10).replace(/-/g, "");
}

export function makeToken() {
  return `${crypto.randomUUID()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function dbSetupErrorResponse(details) {
  return json({
    error: "DB_SETUP_REQUIRED",
    message: "Database setup is incomplete. Apply schema/seed and verify D1 binding.",
    details: String(details || "")
  }, 503);
}
