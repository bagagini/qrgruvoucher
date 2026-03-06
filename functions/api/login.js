import { dbSetupIssue, createSession, loginHotelByPin, loginStaff, loginVendorByPin } from "./_db.js";
import { badRequest, dbSetupErrorResponse, json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const mode = String(body.mode || "staff").trim().toLowerCase();

  if (mode === "staff") {
    const staff = await loginStaff(context.env, body.staff_number, false);
    const setupIssue = dbSetupIssue(context.env);
    if (setupIssue) return dbSetupErrorResponse(setupIssue);
    if (!staff) return badRequest("Invalid or inactive staff number");

    const session = await createSession(context.env, "staff", staff.staff_number, staff.role);
    return json({ ok: true, mode, user: staff, token: session.token, expires_at: session.expiresAt });
  }

  if (mode === "supervisor") {
    const staff = await loginStaff(context.env, body.staff_number, true);
    const setupIssue = dbSetupIssue(context.env);
    if (setupIssue) return dbSetupErrorResponse(setupIssue);
    if (!staff) return badRequest("Supervisor not authorized");

    const session = await createSession(context.env, "staff", staff.staff_number, "SUPERVISOR");
    return json({ ok: true, mode, user: staff, token: session.token, expires_at: session.expiresAt });
  }

  if (mode === "vendor") {
    const vendor = await loginVendorByPin(context.env, body.vendor_code, body.pin);
    const setupIssue = dbSetupIssue(context.env);
    if (setupIssue) return dbSetupErrorResponse(setupIssue);
    if (!vendor) return badRequest("Invalid vendor credentials");

    const session = await createSession(context.env, "vendor", vendor.vendor_code, "VENDOR");
    return json({ ok: true, mode, user: vendor, token: session.token, expires_at: session.expiresAt });
  }

  if (mode === "hotel") {
    const hotel = await loginHotelByPin(context.env, body.hotel_code, body.pin);
    const setupIssue = dbSetupIssue(context.env);
    if (setupIssue) return dbSetupErrorResponse(setupIssue);
    if (!hotel) return badRequest("Invalid hotel credentials");

    const session = await createSession(context.env, "hotel", hotel.hotel_code, "HOTEL");
    return json({ ok: true, mode, user: hotel, token: session.token, expires_at: session.expiresAt });
  }

  return badRequest("Unsupported login mode");
}
