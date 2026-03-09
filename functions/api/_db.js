import { isoNow, makeToken, yyyymmddFromIso } from "./_utils.js";

const globalState = globalThis.__gruVoucherMemory || {
  ready: false,
  staff: [],
  vendors: [],
  hotels: [],
  vouchers: [],
  sessions: [],
  batches: [],
  db_setup_issue: ""
};

globalThis.__gruVoucherMemory = globalState;

const seedStaff = [
  { staff_number: "10001", name: "Supervisor GRU", status: "ACTIVE", role: "SUPERVISOR" },
  { staff_number: "10002", name: "Agent GRU", status: "ACTIVE", role: "AGENT" },
  { staff_number: "10003", name: "Agent Backup", status: "INACTIVE", role: "AGENT" }
];

const seedVendors = [
  {
    vendor_code: "GRUPOFIT",
    vendor_name: "GRUPOFIT",
    billing_type: "VALUE",
    value_amount: 149.9,
    combo_text: "",
    locations_text: "Terminal 3 - Food Court\nTerminal 2 - Domestic Area",
    pin: "1111",
    status: "ACTIVE"
  },
  {
    vendor_code: "VIENA",
    vendor_name: "VIENA",
    billing_type: "VALUE",
    value_amount: 120,
    combo_text: "",
    locations_text: "Terminal 3 - Airside\nTerminal 2 - Connector",
    pin: "2222",
    status: "ACTIVE"
  },
  {
    vendor_code: "DELI365",
    vendor_name: "DELI365",
    billing_type: "VALUE",
    value_amount: 70,
    combo_text: "",
    locations_text: "Terminal 3 - Landside\nTerminal 2 - Check-in Hall",
    pin: "3333",
    status: "ACTIVE"
  }
];

const seedHotels = [
  { hotel_code: "PULLMAN_GRU", hotel_name: "Pullman GRU", address: "Rod. Helio Smidt, GRU", phone: "+55 11 5508-5508", shuttle_info: "Every 30 min from T3", pin: "9001", status: "ACTIVE" },
  { hotel_code: "PANAMBY_GRU", hotel_name: "Panamby GRU", address: "Avenida Guinle, Guarulhos", phone: "+55 11 2645-5000", shuttle_info: "On demand", pin: "9002", status: "ACTIVE" },
  { hotel_code: "MARRIOTT_GRU", hotel_name: "Marriott GRU", address: "Airport perimeter road", phone: "+55 11 2468-6999", shuttle_info: "Every hour", pin: "9003", status: "ACTIVE" },
  { hotel_code: "PANAMBY_BARRA", hotel_name: "Panamby Barra", address: "Barra Funda, Sao Paulo", phone: "+55 11 3322-4455", shuttle_info: "No shuttle", pin: "9004", status: "ACTIVE" },
  { hotel_code: "PULLMAN_IBIRA", hotel_name: "Pullman Ibirapuera", address: "Rua Joinville, Sao Paulo", phone: "+55 11 5088-4000", shuttle_info: "No shuttle", pin: "9005", status: "ACTIVE" },
  { hotel_code: "IBIS_BUDGET_GRU", hotel_name: "Ibis Budget GRU", address: "Rod. Helio Smidt, Guarulhos", phone: "+55 11 2445-7000", shuttle_info: "Every 20 min", pin: "9006", status: "ACTIVE" },
  { hotel_code: "IBIS_COMFORT_GRU", hotel_name: "Ibis Comfort GRU", address: "Airport Service Road", phone: "+55 11 2445-7100", shuttle_info: "Every 20 min", pin: "9007", status: "ACTIVE" }
];

let d1Ready = false;

function memEnsureSeed() {
  if (globalState.ready) {
    return;
  }

  globalState.staff = seedStaff.map((x) => ({ ...x }));
  globalState.vendors = seedVendors.map((x) => ({ ...x }));
  globalState.hotels = seedHotels.map((x) => ({ ...x }));
  globalState.ready = true;
}

async function ensureD1(env) {
  if (!env || !env.DB) {
    memEnsureSeed();
    return false;
  }

  if (d1Ready) {
    return true;
  }

  try {
    // Runtime check only: schema/seed must be applied via Wrangler commands.
    await env.DB.prepare("SELECT staff_number FROM staff LIMIT 1").first();
    await env.DB.prepare("SELECT vendor_code FROM vendors LIMIT 1").first();
    await env.DB.prepare("SELECT hotel_code FROM hotels LIMIT 1").first();

    globalState.db_setup_issue = "";
    d1Ready = true;
    return true;
  } catch (error) {
    globalState.db_setup_issue = String(error && error.message ? error.message : error);
    memEnsureSeed();
    return false;
  }
}
export function dbSetupIssue(env) {
  if (env && env.DB && globalState.db_setup_issue) {
    return globalState.db_setup_issue;
  }
  return "";
}
async function nextVoucherSequence(env, prefix) {
  if (!(await ensureD1(env))) {
    const count = globalState.vouchers.filter((x) => x.id.startsWith(prefix)).length + 1;
    return String(count).padStart(5, "0");
  }

  const likePattern = `${prefix}%`;
  const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM vouchers WHERE id LIKE ?").bind(likePattern).first();
  const count = Number(row?.count || 0) + 1;
  return String(count).padStart(5, "0");
}

export async function loginStaff(env, staffNumber, mustBeSupervisor = false) {
  const clean = String(staffNumber || "").trim();
  if (!clean) {
    return null;
  }

  if (!(await ensureD1(env))) {
    const found = globalState.staff.find((x) => x.staff_number === clean && x.status === "ACTIVE");
    if (!found) return null;
    if (mustBeSupervisor && found.role !== "SUPERVISOR") return null;
    return found;
  }

  const found = await env.DB.prepare("SELECT staff_number, name, status, role FROM staff WHERE staff_number = ? AND status = 'ACTIVE' LIMIT 1")
    .bind(clean)
    .first();

  if (!found) return null;
  if (mustBeSupervisor && found.role !== "SUPERVISOR") return null;
  return found;
}

export async function loginVendorByPin(env, vendorCode, pin) {
  const code = String(vendorCode || "").trim().toUpperCase();
  const cleanPin = String(pin || "").trim();
  if (!code || !cleanPin) return null;

  if (!(await ensureD1(env))) {
    return globalState.vendors.find((x) => x.vendor_code === code && x.pin === cleanPin && x.status === "ACTIVE") || null;
  }

  return await env.DB.prepare("SELECT vendor_code, vendor_name, status FROM vendors WHERE vendor_code = ? AND pin = ? AND status = 'ACTIVE' LIMIT 1")
    .bind(code, cleanPin)
    .first();
}

export async function loginHotelByPin(env, hotelCode, pin) {
  const code = String(hotelCode || "").trim().toUpperCase();
  const cleanPin = String(pin || "").trim();
  if (!code || !cleanPin) return null;

  if (!(await ensureD1(env))) {
    return globalState.hotels.find((x) => x.hotel_code === code && x.pin === cleanPin && x.status === "ACTIVE") || null;
  }

  return await env.DB.prepare("SELECT hotel_code, hotel_name, status FROM hotels WHERE hotel_code = ? AND pin = ? AND status = 'ACTIVE' LIMIT 1")
    .bind(code, cleanPin)
    .first();
}

export async function createSession(env, actorType, actorId, role) {
  const token = makeToken();
  const createdAt = isoNow();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

  if (!(await ensureD1(env))) {
    globalState.sessions.unshift({ token, actor_type: actorType, actor_id: actorId, role, created_at: createdAt, expires_at: expiresAt });
    globalState.sessions = globalState.sessions.slice(0, 200);
    return { token, expiresAt };
  }

  await env.DB.prepare("INSERT INTO sessions (token, actor_type, actor_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(token, actorType, actorId, role, expiresAt, createdAt)
    .run();

  return { token, expiresAt };
}

export async function getSession(env, token) {
  const clean = String(token || "").trim();
  if (!clean) return null;

  if (!(await ensureD1(env))) {
    const now = isoNow();
    return globalState.sessions.find((x) => x.token === clean && x.expires_at > now) || null;
  }

  return await env.DB.prepare("SELECT token, actor_type, actor_id, role, expires_at FROM sessions WHERE token = ? AND expires_at > ? LIMIT 1")
    .bind(clean, isoNow())
    .first();
}

export async function listVendors(env) {
  if (!(await ensureD1(env))) {
    return globalState.vendors.filter((x) => x.status === "ACTIVE");
  }

  const rows = await env.DB.prepare("SELECT vendor_code, vendor_name, billing_type, value_amount, combo_text, locations_text, status FROM vendors WHERE status = 'ACTIVE' ORDER BY vendor_name").all();
  return rows.results || [];
}

export async function listHotels(env) {
  if (!(await ensureD1(env))) {
    return globalState.hotels.filter((x) => x.status === "ACTIVE");
  }

  const rows = await env.DB.prepare("SELECT hotel_code, hotel_name, address, phone, shuttle_info, status FROM hotels WHERE status = 'ACTIVE' ORDER BY hotel_name").all();
  return rows.results || [];
}

export async function upsertVendor(env, payload) {
  const row = {
    vendor_code: String(payload.vendor_code || "").trim().toUpperCase(),
    vendor_name: String(payload.vendor_name || "").trim(),
    billing_type: String(payload.billing_type || "VALUE").trim().toUpperCase(),
    value_amount: payload.value_amount == null || payload.value_amount === "" ? null : Number(payload.value_amount),
    combo_text: String(payload.combo_text || "").trim(),
    locations_text: String(payload.locations_text || "").trim(),
    pin: String(payload.pin || "1111").trim(),
    status: String(payload.status || "ACTIVE").trim().toUpperCase()
  };

  if (!(await ensureD1(env))) {
    const idx = globalState.vendors.findIndex((x) => x.vendor_code === row.vendor_code);
    if (idx >= 0) globalState.vendors[idx] = row; else globalState.vendors.push(row);
    return row;
  }

  await env.DB.prepare(`
    INSERT INTO vendors (vendor_code, vendor_name, billing_type, value_amount, combo_text, locations_text, pin, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(vendor_code) DO UPDATE SET
      vendor_name=excluded.vendor_name,
      billing_type=excluded.billing_type,
      value_amount=excluded.value_amount,
      combo_text=excluded.combo_text,
      locations_text=excluded.locations_text,
      pin=excluded.pin,
      status=excluded.status
  `)
    .bind(row.vendor_code, row.vendor_name, row.billing_type, row.value_amount, row.combo_text, row.locations_text, row.pin, row.status)
    .run();

  return row;
}

export async function upsertHotel(env, payload) {
  const row = {
    hotel_code: String(payload.hotel_code || "").trim().toUpperCase(),
    hotel_name: String(payload.hotel_name || "").trim(),
    address: String(payload.address || "").trim(),
    phone: String(payload.phone || "").trim(),
    shuttle_info: String(payload.shuttle_info || "").trim(),
    pin: String(payload.pin || "9000").trim(),
    status: String(payload.status || "ACTIVE").trim().toUpperCase()
  };

  if (!(await ensureD1(env))) {
    const idx = globalState.hotels.findIndex((x) => x.hotel_code === row.hotel_code);
    if (idx >= 0) globalState.hotels[idx] = row; else globalState.hotels.push(row);
    return row;
  }

  await env.DB.prepare(`
    INSERT INTO hotels (hotel_code, hotel_name, address, phone, shuttle_info, pin, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(hotel_code) DO UPDATE SET
      hotel_name=excluded.hotel_name,
      address=excluded.address,
      phone=excluded.phone,
      shuttle_info=excluded.shuttle_info,
      pin=excluded.pin,
      status=excluded.status
  `)
    .bind(row.hotel_code, row.hotel_name, row.address, row.phone, row.shuttle_info, row.pin, row.status)
    .run();

  return row;
}

async function saveBatch(env, batch) {
  if (!(await ensureD1(env))) {
    globalState.batches.unshift(batch);
    globalState.batches = globalState.batches.slice(0, 300);
    return;
  }

  await env.DB.prepare("INSERT INTO batches (batch_id, voucher_type, file_name, count, staff_number, created_at, pdf_key) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(batch.batch_id, batch.voucher_type, batch.file_name, batch.count, batch.staff_number, batch.created_at, batch.pdf_key || null)
    .run();
}

async function insertVoucher(env, row) {
  if (!(await ensureD1(env))) {
    globalState.vouchers.unshift(row);
    globalState.vouchers = globalState.vouchers.slice(0, 2000);
    return;
  }

  await env.DB.prepare(`
    INSERT INTO vouchers (id, voucher_type, subtype, status, vendor_code, hotel_code, flight, reason, staff_number, service_text, authorized_value, created_at, used_at, used_by, meta_json, batch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      row.id,
      row.voucher_type,
      row.subtype,
      row.status,
      row.vendor_code,
      row.hotel_code,
      row.flight,
      row.reason,
      row.staff_number,
      row.service_text,
      row.authorized_value,
      row.created_at,
      row.used_at,
      row.used_by,
      row.meta_json,
      row.batch_id
    )
    .run();
}

export async function issueMealBatch(env, payload) {
  const now = isoNow();
  const dateCode = yyyymmddFromIso(now);
  const batchId = `BATCH-MEAL-${dateCode}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const vouchers = [];

  if (payload.mode === "inad") {
    for (const mealSlot of payload.inadMeals) {
      const slotCode = mealSlot === "Breakfast" ? "B" : mealSlot === "Lunch" ? "L" : "D";
      const prefix = `ALI-INAD-${slotCode}-${dateCode}-`;
      const seq = await nextVoucherSequence(env, prefix);
      const id = `${prefix}${seq}`;
      const serviceText = `INAD passenger - ${mealSlot} meal`;
      const row = {
        id,
        voucher_type: "MEAL_INAD",
        subtype: mealSlot,
        status: "REQUESTED",
        vendor_code: payload.vendor.vendor_code,
        hotel_code: null,
        flight: null,
        reason: null,
        staff_number: payload.staff_number,
        service_text: serviceText,
        authorized_value: null,
        created_at: now,
        used_at: null,
        used_by: null,
        meta_json: JSON.stringify({ inad: true }),
        batch_id: batchId
      };
      await insertVoucher(env, row);
      vouchers.push(row);
    }
  } else {
    for (let i = 0; i < payload.quantity; i += 1) {
      const prefix = `ALI-${dateCode}-`;
      const seq = await nextVoucherSequence(env, prefix);
      const id = `${prefix}${seq}`;
      const isValue = payload.vendor.billing_type === "VALUE";
      const row = {
        id,
        voucher_type: "MEAL_NORMAL",
        subtype: "NORMAL",
        status: "REQUESTED",
        vendor_code: payload.vendor.vendor_code,
        hotel_code: null,
        flight: payload.flight,
        reason: payload.reason,
        staff_number: payload.staff_number,
        service_text: isValue ? null : `Service: ${payload.vendor.vendor_name} fixed meal combo`,
        authorized_value: isValue ? Number(payload.vendor.value_amount || 0) : null,
        created_at: now,
        used_at: null,
        used_by: null,
        meta_json: JSON.stringify({ total_meals: 1 }),
        batch_id: batchId
      };
      await insertVoucher(env, row);
      vouchers.push(row);
    }
  }

  const fileName = payload.mode === "inad"
    ? `MEAL_INAD_${vouchers.length}meals_${dateCode}.pdf`
    : `MEAL_NORMAL_${payload.flight || "NOFLT"}_${dateCode}_${vouchers.length}vouchers.pdf`;

  await saveBatch(env, {
    batch_id: batchId,
    voucher_type: payload.mode === "inad" ? "MEAL_INAD" : "MEAL_NORMAL",
    file_name: fileName,
    count: vouchers.length,
    staff_number: payload.staff_number,
    created_at: now,
    pdf_key: null
  });

  return { vouchers, batchId, fileName };
}

export async function issueHotelBatch(env, payload) {
  const now = isoNow();
  const dateCode = yyyymmddFromIso(now);
  const batchId = `BATCH-HOTEL-${dateCode}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const vouchers = [];

  for (let i = 0; i < payload.quantity; i += 1) {
    const prefix = `HOT-${dateCode}-`;
    const seq = await nextVoucherSequence(env, prefix);
    const id = `${prefix}${seq}`;
    const row = {
      id,
      voucher_type: "HOTEL",
      subtype: "ROOM",
      status: "REQUESTED",
      vendor_code: null,
      hotel_code: payload.hotel.hotel_code,
      flight: payload.flight,
      reason: payload.reason,
      staff_number: payload.staff_number,
      service_text: "Room: 1",
      authorized_value: null,
      created_at: now,
      used_at: null,
      used_by: null,
      meta_json: JSON.stringify({ internal_index: `${i + 1}/${payload.quantity}` }),
      batch_id: batchId
    };
    await insertVoucher(env, row);
    vouchers.push(row);
  }

  const fileName = `HOTEL_${payload.hotel.hotel_code}_${payload.flight || "NOFLT"}_${dateCode}_${vouchers.length}rooms.pdf`;
  await saveBatch(env, {
    batch_id: batchId,
    voucher_type: "HOTEL",
    file_name: fileName,
    count: vouchers.length,
    staff_number: payload.staff_number,
    created_at: now,
    pdf_key: null
  });

  return { vouchers, batchId, fileName };
}

export async function latestVouchers(env, limit = 50) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  if (!(await ensureD1(env))) {
    return globalState.vouchers.slice(0, safeLimit);
  }

  const rows = await env.DB.prepare(`
    SELECT id, voucher_type, subtype, status, vendor_code, hotel_code, flight, reason, staff_number, service_text, authorized_value, created_at, used_at, used_by, meta_json, batch_id
    FROM vouchers
    ORDER BY created_at DESC
    LIMIT ?
  `)
    .bind(safeLimit)
    .all();

  return rows.results || [];
}

export async function getVoucherById(env, voucherId) {
  const id = String(voucherId || "").trim();
  if (!id) return null;

  if (!(await ensureD1(env))) {
    return globalState.vouchers.find((x) => x.id === id) || null;
  }

  return await env.DB.prepare("SELECT id, voucher_type, subtype, status, vendor_code, hotel_code, flight, reason, staff_number, service_text, authorized_value, created_at, used_at, used_by, meta_json, batch_id FROM vouchers WHERE id = ? LIMIT 1")
    .bind(id)
    .first();
}

export async function markVoucherUsed(env, voucher, actor) {
  const usedAt = isoNow();

  if (!(await ensureD1(env))) {
    const idx = globalState.vouchers.findIndex((x) => x.id === voucher.id);
    if (idx < 0) return false;
    globalState.vouchers[idx].status = "USED";
    globalState.vouchers[idx].used_at = usedAt;
    globalState.vouchers[idx].used_by = actor;
    return true;
  }

  const result = await env.DB.prepare("UPDATE vouchers SET status = 'USED', used_at = ?, used_by = ? WHERE id = ? AND status <> 'USED'")
    .bind(usedAt, actor, voucher.id)
    .run();

  return Boolean(result.meta && result.meta.changes);
}

export async function reportData(env, filter) {
  const dateFrom = String(filter.dateFrom || "").trim();
  const dateTo = String(filter.dateTo || "").trim();
  const vendor = String(filter.vendor || "").trim().toUpperCase();
  const hotel = String(filter.hotel || "").trim().toUpperCase();
  const staff = String(filter.staff || "").trim();
  const flight = String(filter.flight || "").trim().toUpperCase();

  if (!(await ensureD1(env))) {
    let rows = [...globalState.vouchers];
    if (dateFrom) rows = rows.filter((x) => x.created_at >= dateFrom);
    if (dateTo) rows = rows.filter((x) => x.created_at <= dateTo);
    if (vendor) rows = rows.filter((x) => x.vendor_code === vendor);
    if (hotel) rows = rows.filter((x) => x.hotel_code === hotel);
    if (staff) rows = rows.filter((x) => x.staff_number === staff);
    if (flight) rows = rows.filter((x) => (x.flight || "").toUpperCase() === flight);
    return makeReport(rows);
  }

  const conditions = [];
  const binds = [];
  if (dateFrom) { conditions.push("created_at >= ?"); binds.push(dateFrom); }
  if (dateTo) { conditions.push("created_at <= ?"); binds.push(dateTo); }
  if (vendor) { conditions.push("vendor_code = ?"); binds.push(vendor); }
  if (hotel) { conditions.push("hotel_code = ?"); binds.push(hotel); }
  if (staff) { conditions.push("staff_number = ?"); binds.push(staff); }
  if (flight) { conditions.push("UPPER(flight) = ?"); binds.push(flight); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = await env.DB.prepare(`
    SELECT id, voucher_type, subtype, status, vendor_code, hotel_code, flight, reason, staff_number, service_text, authorized_value, created_at, used_at, used_by, batch_id
    FROM vouchers
    ${where}
    ORDER BY created_at DESC
    LIMIT 5000
  `)
    .bind(...binds)
    .all();

  return makeReport(rows.results || []);
}

function makeReport(rows) {
  const stats = {
    meal_normal: 0,
    meal_inad: 0,
    hotel_rooms: 0,
    used: 0,
    pending: 0
  };

  for (const row of rows) {
    if (row.voucher_type === "MEAL_NORMAL") stats.meal_normal += 1;
    if (row.voucher_type === "MEAL_INAD") stats.meal_inad += 1;
    if (row.voucher_type === "HOTEL") stats.hotel_rooms += 1;
    if (row.status === "USED") stats.used += 1; else stats.pending += 1;
  }

  return { rows, stats };
}

export function reportToCsv(report) {
  const header = ["id", "type", "subtype", "status", "vendor", "hotel", "flight", "reason", "staff", "created_at", "used_at", "batch_id"].join(",");
  const lines = [header];
  for (const row of report.rows) {
    lines.push([
      row.id,
      row.voucher_type,
      row.subtype || "",
      row.status,
      row.vendor_code || "",
      row.hotel_code || "",
      row.flight || "",
      row.reason || "",
      row.staff_number,
      row.created_at,
      row.used_at || "",
      row.batch_id || ""
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","));
  }
  return lines.join("\n");
}



