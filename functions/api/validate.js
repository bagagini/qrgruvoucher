import { requireSession } from "./_auth.js";
import { getVoucherById, latestVouchers, markVoucherUsed } from "./_db.js";
import { badRequest, json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "GET") {
    const auth = await requireSession(context, ["VENDOR", "HOTEL"]);
    if (!auth.ok) return auth.response;

    const vouchers = await latestVouchers(context.env, 1000);
    const scoped = vouchers.filter((v) => {
      if (auth.session.role === "VENDOR") return v.vendor_code === auth.session.actor_id;
      if (auth.session.role === "HOTEL") return v.hotel_code === auth.session.actor_id;
      return false;
    });

    const byFlight = {};
    for (const row of scoped) {
      const flight = row.flight || "NO_FLIGHT";
      if (!byFlight[flight]) byFlight[flight] = { requested: 0, used: 0, pending: 0 };
      byFlight[flight].requested += 1;
      if (row.status === "USED") byFlight[flight].used += 1;
      if (row.status !== "USED") byFlight[flight].pending += 1;
    }

    return json({
      actor: auth.session.actor_id,
      role: auth.session.role,
      summary: {
        requested: scoped.length,
        used: scoped.filter((x) => x.status === "USED").length,
        pending: scoped.filter((x) => x.status !== "USED").length
      },
      by_flight: byFlight
    });
  }

  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["VENDOR", "HOTEL"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(context.request);
  const voucherId = String(body.voucher_id || "").trim();
  if (!voucherId) {
    return badRequest("voucher_id is required");
  }

  const voucher = await getVoucherById(context.env, voucherId);
  if (!voucher) {
    return badRequest("Voucher not found");
  }

  if (auth.session.role === "VENDOR" && voucher.vendor_code !== auth.session.actor_id) {
    return badRequest("Voucher does not belong to this vendor");
  }

  if (auth.session.role === "HOTEL" && voucher.hotel_code !== auth.session.actor_id) {
    return badRequest("Voucher does not belong to this hotel");
  }

  if (voucher.status === "USED") {
    return json({ ok: false, message: "Voucher already used", voucher }, 409);
  }

  const updated = await markVoucherUsed(context.env, voucher, `${auth.session.role}:${auth.session.actor_id}`);
  if (!updated) {
    return json({ ok: false, message: "Voucher already used" }, 409);
  }

  return json({ ok: true, voucher_id: voucherId, status: "USED" });
}
