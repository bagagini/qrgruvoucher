const defaultVendors = [
  { id: "v-1", name: "GRU Food Court" },
  { id: "v-2", name: "Terminal Bistro" },
  { id: "v-3", name: "Airport Express Meals" }
];

const defaultHotels = [
  { id: "h-1", name: "GRU Airport Hotel" },
  { id: "h-2", name: "Transit Suites Guarulhos" },
  { id: "h-3", name: "Terminal Comfort Inn" }
];

const memory = globalThis.__voucherStoreV2 || {
  vouchers: [],
  reports: [],
  sessions: [],
  vendors: defaultVendors,
  hotels: defaultHotels
};

globalThis.__voucherStoreV2 = memory;

let d1Ready = false;

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function ensureD1(env) {
  if (!env || !env.DB) {
    return false;
  }

  if (d1Ready) {
    return true;
  }

  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      meal_type TEXT,
      vendor_id TEXT,
      vendor_name TEXT,
      hotel_id TEXT,
      hotel_name TEXT,
      room_quantity INTEGER,
      passenger_name TEXT,
      staff_number TEXT NOT NULL,
      issued_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      staff_number TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS supervisor_sessions (
      token TEXT PRIMARY KEY,
      staff_number TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );
  `);

  for (const vendor of defaultVendors) {
    await env.DB.prepare("INSERT OR IGNORE INTO vendors (id, name) VALUES (?, ?)")
      .bind(vendor.id, vendor.name)
      .run();
  }

  for (const hotel of defaultHotels) {
    await env.DB.prepare("INSERT OR IGNORE INTO hotels (id, name) VALUES (?, ?)")
      .bind(hotel.id, hotel.name)
      .run();
  }

  d1Ready = true;
  return true;
}

export async function listVendors(env) {
  if (!(await ensureD1(env))) {
    return memory.vendors;
  }

  const rows = await env.DB.prepare("SELECT id, name FROM vendors ORDER BY name ASC").all();
  return rows.results || [];
}

export async function listHotels(env) {
  if (!(await ensureD1(env))) {
    return memory.hotels;
  }

  const rows = await env.DB.prepare("SELECT id, name FROM hotels ORDER BY name ASC").all();
  return rows.results || [];
}

export async function issueMealVoucher(env, data) {
  const voucher = {
    id: makeId("meal"),
    type: "meal",
    mealType: data.mealType,
    vendorId: data.vendorId,
    vendorName: data.vendorName,
    hotelId: null,
    hotelName: null,
    roomQuantity: null,
    passengerName: data.passengerName,
    staffNumber: data.staffNumber,
    issuedAt: nowIso()
  };

  if (!(await ensureD1(env))) {
    memory.vouchers.unshift(voucher);
    memory.vouchers = memory.vouchers.slice(0, 100);
    return voucher;
  }

  await env.DB.prepare(`
    INSERT INTO vouchers (id, type, meal_type, vendor_id, vendor_name, hotel_id, hotel_name, room_quantity, passenger_name, staff_number, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      voucher.id,
      voucher.type,
      voucher.mealType,
      voucher.vendorId,
      voucher.vendorName,
      null,
      null,
      null,
      voucher.passengerName,
      voucher.staffNumber,
      voucher.issuedAt
    )
    .run();

  return voucher;
}

export async function issueHotelVoucher(env, data) {
  const voucher = {
    id: makeId("hotel"),
    type: "hotel",
    mealType: null,
    vendorId: null,
    vendorName: null,
    hotelId: data.hotelId,
    hotelName: data.hotelName,
    roomQuantity: data.roomQuantity,
    passengerName: data.passengerName,
    staffNumber: data.staffNumber,
    issuedAt: nowIso()
  };

  if (!(await ensureD1(env))) {
    memory.vouchers.unshift(voucher);
    memory.vouchers = memory.vouchers.slice(0, 100);
    return voucher;
  }

  await env.DB.prepare(`
    INSERT INTO vouchers (id, type, meal_type, vendor_id, vendor_name, hotel_id, hotel_name, room_quantity, passenger_name, staff_number, issued_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .bind(
      voucher.id,
      voucher.type,
      null,
      null,
      null,
      voucher.hotelId,
      voucher.hotelName,
      voucher.roomQuantity,
      voucher.passengerName,
      voucher.staffNumber,
      voucher.issuedAt
    )
    .run();

  return voucher;
}

export async function listLatestVouchers(env, limit = 20) {
  if (!(await ensureD1(env))) {
    return memory.vouchers.slice(0, limit);
  }

  const rows = await env.DB.prepare(`
    SELECT
      id,
      type,
      meal_type AS mealType,
      vendor_id AS vendorId,
      vendor_name AS vendorName,
      hotel_id AS hotelId,
      hotel_name AS hotelName,
      room_quantity AS roomQuantity,
      passenger_name AS passengerName,
      staff_number AS staffNumber,
      issued_at AS issuedAt
    FROM vouchers
    ORDER BY issued_at DESC
    LIMIT ?
  `)
    .bind(limit)
    .all();

  return rows.results || [];
}

export async function createReport(env, data) {
  const report = {
    id: makeId("report"),
    staffNumber: data.staffNumber,
    category: data.category || "general",
    message: data.message,
    createdAt: nowIso()
  };

  if (!(await ensureD1(env))) {
    memory.reports.unshift(report);
    memory.reports = memory.reports.slice(0, 100);
    return report;
  }

  await env.DB.prepare(`
    INSERT INTO reports (id, staff_number, category, message, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)
    .bind(report.id, report.staffNumber, report.category, report.message, report.createdAt)
    .run();

  return report;
}

export async function listReports(env, filter = {}) {
  const limit = Number(filter.limit || 50);
  const safeLimit = Number.isInteger(limit) && limit > 0 && limit <= 200 ? limit : 50;

  if (!(await ensureD1(env))) {
    let rows = [...memory.reports];
    if (filter.staffNumber) {
      rows = rows.filter((item) => item.staffNumber === filter.staffNumber);
    }
    if (filter.category) {
      rows = rows.filter((item) => item.category === filter.category);
    }
    if (filter.from) {
      rows = rows.filter((item) => item.createdAt >= filter.from);
    }
    if (filter.to) {
      rows = rows.filter((item) => item.createdAt <= filter.to);
    }
    return rows.slice(0, safeLimit);
  }

  const conditions = [];
  const params = [];

  if (filter.staffNumber) {
    conditions.push("staff_number = ?");
    params.push(filter.staffNumber);
  }

  if (filter.category) {
    conditions.push("category = ?");
    params.push(filter.category);
  }

  if (filter.from) {
    conditions.push("created_at >= ?");
    params.push(filter.from);
  }

  if (filter.to) {
    conditions.push("created_at <= ?");
    params.push(filter.to);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      id,
      staff_number AS staffNumber,
      category,
      message,
      created_at AS createdAt
    FROM reports
    ${where}
    ORDER BY created_at DESC
    LIMIT ?
  `;

  const rows = await env.DB.prepare(sql).bind(...params, safeLimit).all();
  return rows.results || [];
}

export async function createSupervisorSession(env, staffNumber) {
  const token = `${crypto.randomUUID()}.${Math.random().toString(36).slice(2, 10)}`;
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();

  if (!(await ensureD1(env))) {
    memory.sessions.unshift({ token, staffNumber, createdAt, expiresAt });
    memory.sessions = memory.sessions.slice(0, 50);
    return { token, expiresAt };
  }

  await env.DB.prepare(`
    INSERT INTO supervisor_sessions (token, staff_number, created_at, expires_at)
    VALUES (?, ?, ?, ?)
  `)
    .bind(token, staffNumber, createdAt, expiresAt)
    .run();

  return { token, expiresAt };
}

export async function validateSupervisorSession(env, token) {
  if (!token) {
    return false;
  }

  if (!(await ensureD1(env))) {
    const now = nowIso();
    return memory.sessions.some((item) => item.token === token && item.expiresAt > now);
  }

  const session = await env.DB.prepare(`
    SELECT token
    FROM supervisor_sessions
    WHERE token = ? AND expires_at > ?
    LIMIT 1
  `)
    .bind(token, nowIso())
    .first();

  return Boolean(session);
}
