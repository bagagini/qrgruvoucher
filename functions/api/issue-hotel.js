import { issueHotelVoucher, listHotels } from "./_store.js";
import { json, methodNotAllowed, readJson, badRequest } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const staffNumber = String(body.staffNumber || "").trim();
  const hotelId = String(body.hotelId || "").trim();
  const passengerName = String(body.passengerName || "").trim();
  const roomQuantity = Number(body.roomQuantity || 0);

  if (!staffNumber) {
    return badRequest("staffNumber is required");
  }

  if (!Number.isInteger(roomQuantity) || roomQuantity < 1) {
    return badRequest("roomQuantity must be an integer >= 1");
  }

  const hotels = await listHotels(context.env);
  const hotel = hotels.find((item) => item.id === hotelId);
  if (!hotel) {
    return badRequest("Invalid hotelId");
  }

  const voucher = await issueHotelVoucher(context.env, {
    staffNumber,
    hotelId,
    hotelName: hotel.name,
    roomQuantity,
    passengerName
  });

  return json({ ok: true, voucher }, 201);
}
