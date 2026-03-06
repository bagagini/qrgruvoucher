import { issueMealVoucher, listVendors } from "./_store.js";
import { json, methodNotAllowed, readJson, badRequest } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const staffNumber = String(body.staffNumber || "").trim();
  const vendorId = String(body.vendorId || "").trim();
  const mealType = String(body.mealType || "normal").trim();
  const passengerName = String(body.passengerName || "").trim();

  if (!staffNumber) {
    return badRequest("staffNumber is required");
  }

  if (!["normal", "INAD"].includes(mealType)) {
    return badRequest("mealType must be normal or INAD");
  }

  const vendors = await listVendors(context.env);
  const vendor = vendors.find((item) => item.id === vendorId);
  if (!vendor) {
    return badRequest("Invalid vendorId");
  }

  const voucher = await issueMealVoucher(context.env, {
    staffNumber,
    vendorId,
    vendorName: vendor.name,
    mealType,
    passengerName
  });

  return json({ ok: true, voucher }, 201);
}
