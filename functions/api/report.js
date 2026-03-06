import { requireSession } from "./_auth.js";
import { reportData, reportToCsv } from "./_db.js";
import { json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(context.request);
  const report = await reportData(context.env, body);

  if (String(body.format || "json").toLowerCase() === "csv") {
    const csv = reportToCsv(report);
    return new Response(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename=report_${new Date().toISOString().slice(0, 10)}.csv`
      }
    });
  }

  return json({ ok: true, report });
}
