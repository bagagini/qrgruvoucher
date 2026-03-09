CREATE TABLE IF NOT EXISTS staff (
  staff_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vendors (
  vendor_code TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  billing_type TEXT NOT NULL,
  value_amount REAL,
  combo_text TEXT,
  locations_text TEXT,
  pin TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hotels (
  hotel_code TEXT PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  shuttle_info TEXT NOT NULL,
  pin TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  role TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  voucher_type TEXT NOT NULL,
  subtype TEXT,
  status TEXT NOT NULL,
  vendor_code TEXT,
  hotel_code TEXT,
  flight TEXT,
  reason TEXT,
  staff_number TEXT NOT NULL,
  service_text TEXT,
  authorized_value REAL,
  created_at TEXT NOT NULL,
  used_at TEXT,
  used_by TEXT,
  meta_json TEXT,
  batch_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS batches (
  batch_id TEXT PRIMARY KEY,
  voucher_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  count INTEGER NOT NULL,
  staff_number TEXT NOT NULL,
  created_at TEXT NOT NULL,
  pdf_key TEXT
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

