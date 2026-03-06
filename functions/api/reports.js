import { listReports, validateSupervisorSession } from "./_store.js";
import { getSupervisorToken, json, methodNotAllowed, unauthorized } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const token = getSupervisorToken(context.request);
  const allowed = await validateSupervisorSession(context.env, token);
  if (!allowed) {
    return unauthorized("Supervisor token is missing or expired");
  }

  const url = new URL(context.request.url);
  const reports = await listReports(context.env, {
    staffNumber: url.searchParams.get("staffNumber") || "",
    category: url.searchParams.get("category") || "",
    from: url.searchParams.get("from") || "",
    to: url.searchParams.get("to") || "",
    limit: url.searchParams.get("limit") || "50"
  });

  return json({ reports });
}
