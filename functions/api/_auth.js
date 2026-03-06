import { getSession } from "./_db.js";
import { unauthorized, forbidden } from "./_utils.js";

export function bearerToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
}

export async function requireSession(context, allowedRoles = []) {
  const token = bearerToken(context.request);
  const session = await getSession(context.env, token);
  if (!session) {
    return { ok: false, response: unauthorized("Session expired or missing") };
  }
  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    return { ok: false, response: forbidden("Role not allowed") };
  }
  return { ok: true, session };
}
