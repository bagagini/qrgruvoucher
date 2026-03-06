CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_number TEXT UNIQUE NOT NULL,
  name TEXT,
  status TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_code TEXT UNIQUE NOT NULL,
  vendor_name TEXT NOT NULL,
  billing_type TEXT NOT NULL,
  default_value REAL,
  valid_locations_text TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_code TEXT UNIQUE NOT NULL,
  hotel_name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  shuttle_info TEXT,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id TEXT UNIQUE NOT NULL,
  voucher_type TEXT NOT NULL,
  service_type TEXT,
  meal_slot TEXT,
  partner_code TEXT,
  partner_name TEXT,
  flight_number TEXT,
  reason TEXT,
  value_amount REAL,
  staff_number TEXT,
  batch_series TEXT,
  printed_room_label TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  pdf_file_key TEXT,
  pdf_file_url TEXT,
  created_at TEXT NOT NULL,
  printed_at TEXT,
  used_at TEXT,
  used_by_partner_code TEXT,
  used_by_pin_label TEXT,
  remarks TEXT
);

CREATE TABLE IF NOT EXISTS partner_pins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pin_code TEXT UNIQUE NOT NULL,
  partner_type TEXT NOT NULL,
  partner_code TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT,
  voucher_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL
);
