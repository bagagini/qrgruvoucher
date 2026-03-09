import { requireSession } from "./_auth.js";
import { dbSetupIssue, reportData } from "./_db.js";
import { dbSetupErrorResponse, json, methodNotAllowed, readJson } from "./_utils.js";

function normalize(payload) {
  return {
    dateFrom: String(payload.dateFrom || "").trim(),
    dateTo: String(payload.dateTo || "").trim(),
    vendor: String(payload.vendor || "").trim(),
    hotel: String(payload.hotel || "").trim(),
    staff: String(payload.staff || "").trim(),
    flight: String(payload.flight || "").trim()
  };
}

function aggregateFinance(rows) {
  const pending = rows.filter((r) => r.status === "USED");
  const open = rows.filter((r) => r.status !== "USED");

  const byPartnerMap = new Map();
  for (const row of pending) {
    const partnerCode = row.vendor_code || row.hotel_code || "UNKNOWN";
    const partnerType = row.vendor_code ? "VENDOR" : row.hotel_code ? "HOTEL" : "UNKNOWN";
    const key = `${partnerType}:${partnerCode}`;
    const current = byPartnerMap.get(key) || {
      partner_type: partnerType,
      partner_code: partnerCode,
      vouchers: 0,
      estimated_value: 0
    };
    current.vouchers += 1;
    current.estimated_value += Number(row.authorized_value || 0);
    byPartnerMap.set(key, current);
  }

  const by_partner = Array.from(byPartnerMap.values())
    .sort((a, b) => b.vouchers - a.vouchers)
    .slice(0, 200);

  return {
    kpis: {
      pending_reconciliation_count: pending.length,
      pending_reconciliation_estimated_value: Number(
        pending.reduce((sum, r) => sum + Number(r.authorized_value || 0), 0).toFixed(2)
      ),
      open_operation_count: open.length,
      total_rows_considered: rows.length
    },
    by_partner
  };
}

export async function onRequest(context) {
  if (!["GET", "POST"].includes(context.request.method)) {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const setupIssue = dbSetupIssue(context.env);
  if (setupIssue) return dbSetupErrorResponse(setupIssue);

  const payload = context.request.method === "POST"
    ? normalize(await readJson(context.request))
    : normalize(Object.fromEntries(new URL(context.request.url).searchParams.entries()));

  const report = await reportData(context.env, payload);
  const dashboard = aggregateFinance(report.rows || []);

  return json({
    ok: true,
    filter: payload,
    dashboard
  });
}
