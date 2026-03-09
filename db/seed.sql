INSERT OR IGNORE INTO staff (staff_number, name, status, role) VALUES
  ('10001', 'Supervisor GRU', 'ACTIVE', 'SUPERVISOR'),
  ('10002', 'Agent GRU', 'ACTIVE', 'AGENT'),
  ('10003', 'Agent Backup', 'INACTIVE', 'AGENT');

INSERT OR IGNORE INTO vendors (vendor_code, vendor_name, billing_type, value_amount, combo_text, locations_text, pin, status) VALUES
  ('GRUPOFIT', 'GRUPOFIT', 'VALUE', 149.9, '', 'Terminal 3 - Food Court\nTerminal 2 - Domestic Area', '1111', 'ACTIVE'),
  ('VIENA', 'VIENA', 'VALUE', 120, '', 'Terminal 3 - Airside\nTerminal 2 - Connector', '2222', 'ACTIVE'),
  ('DELI365', 'DELI365', 'VALUE', 70, '', 'Terminal 3 - Landside\nTerminal 2 - Check-in Hall', '3333', 'ACTIVE');

INSERT OR IGNORE INTO hotels (hotel_code, hotel_name, address, phone, shuttle_info, pin, status) VALUES
  ('PULLMAN_GRU', 'Pullman GRU', 'Rod. Helio Smidt, GRU', '+55 11 5508-5508', 'Every 30 min from T3', '9001', 'ACTIVE'),
  ('PANAMBY_GRU', 'Panamby GRU', 'Avenida Guinle, Guarulhos', '+55 11 2645-5000', 'On demand', '9002', 'ACTIVE'),
  ('MARRIOTT_GRU', 'Marriott GRU', 'Airport perimeter road', '+55 11 2468-6999', 'Every hour', '9003', 'ACTIVE'),
  ('PANAMBY_BARRA', 'Panamby Barra', 'Barra Funda, Sao Paulo', '+55 11 3322-4455', 'No shuttle', '9004', 'ACTIVE'),
  ('PULLMAN_IBIRA', 'Pullman Ibirapuera', 'Rua Joinville, Sao Paulo', '+55 11 5088-4000', 'No shuttle', '9005', 'ACTIVE'),
  ('IBIS_BUDGET_GRU', 'Ibis Budget GRU', 'Rod. Helio Smidt, Guarulhos', '+55 11 2445-7000', 'Every 20 min', '9006', 'ACTIVE'),
  ('IBIS_COMFORT_GRU', 'Ibis Comfort GRU', 'Airport Service Road', '+55 11 2445-7100', 'Every 20 min', '9007', 'ACTIVE');