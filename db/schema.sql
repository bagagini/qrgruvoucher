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

INSERT OR IGNORE INTO vendors (id, name) VALUES
  ('v-1', 'GRU Food Court'),
  ('v-2', 'Terminal Bistro'),
  ('v-3', 'Airport Express Meals');

INSERT OR IGNORE INTO hotels (id, name) VALUES
  ('h-1', 'GRU Airport Hotel'),
  ('h-2', 'Transit Suites Guarulhos'),
  ('h-3', 'Terminal Comfort Inn');
