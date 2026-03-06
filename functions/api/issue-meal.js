import { requireSession } from "./_auth.js";
import { dbSetupIssue, issueMealBatch, listVendors } from "./_db.js";
import { badRequest, dbSetupErrorResponse, json, methodNotAllowed, readJson } from "./_utils.js";

const allowedInad = ["Breakfast", "Lunch", "Dinner"];

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const setupIssue = dbSetupIssue(context.env);
  if (setupIssue) return dbSetupErrorResponse(setupIssue);

  const body = await readJson(context.request);
  const mode = String(body.mode || "normal").trim().toLowerCase();
  const vendors = await listVendors(context.env);
  const vendor = vendors.find((x) => x.vendor_code === String(body.vendor_code || "").trim().toUpperCase());

  if (!vendor) {
    return badRequest("Invalid vendor_code");
  }

  if (mode === "normal") {
    const quantity = Number(body.quantity || 0);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 500) {
      return badRequest("quantity must be integer between 1 and 500");
    }

    const flight = String(body.flight || "").trim().toUpperCase();
    const reason = String(body.reason || "").trim();
    if (!flight || !reason) {
      return badRequest("flight and reason are required for normal meal");
    }

    const result = await issueMealBatch(context.env, {
      mode,
      vendor,
      quantity,
      flight,
      reason,
      staff_number: auth.session.actor_id
    });

    return json({ ok: true, ...result });
  }

  if (mode === "inad") {
    const inadMeals = Array.isArray(body.inad_meals)
      ? body.inad_meals.filter((x) => allowedInad.includes(String(x || "")))
      : [];

    if (!inadMeals.length) {
      return badRequest("inad_meals must include Breakfast/Lunch/Dinner");
    }

    const result = await issueMealBatch(context.env, {
      mode,
      vendor,
      inadMeals,
      staff_number: auth.session.actor_id
    });

    return json({ ok: true, ...result });
  }

  return badRequest("mode must be normal or inad");
}
