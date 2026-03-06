INSERT OR IGNORE INTO staff (staff_number, name, status, role) VALUES
('10001', 'Supervisor GRU', 'ACTIVE', 'SUPERVISOR'),
('10002', 'Agent GRU', 'ACTIVE', 'AGENT');

INSERT OR IGNORE INTO vendors (vendor_code, vendor_name, billing_type, default_value, valid_locations_text, active) VALUES
('GRUPOFIT', 'GRUPOFIT', 'VALUE', 149.90, 'Terminal 3 - Food Court\nTerminal 2 - Domestic Area', 1),
('VIENA', 'VIENA', 'VALUE', 0.00, 'Terminal 3 - Airside\nTerminal 2 - Connector', 1),
('DELI365', 'DELI365', 'VALUE', 70.00, 'Terminal 3 - Landside\nTerminal 2 - Check-in Hall', 1);

INSERT OR IGNORE INTO hotels (hotel_code, hotel_name, address, phone, shuttle_info, active) VALUES
('PULLMAN_GRU', 'PULLMAN GRU', '', '', '', 1),
('PANAMBY_GRU', 'PANAMBY GRU', '', '', '', 1),
('MARRIOTT_GRU', 'MARRIOTT GRU', '', '', '', 1),
('PANAMBY_BARRA', 'PANAMBY BARRA', '', '', '', 1),
('PULLMAN_IBIRA', 'PULLMAN IBIRA', '', '', '', 1),
('IBIS_BUDGET_GRU', 'IBIS BUDGET GRU', '', '', '', 1),
('IBIS_COMFORT_GRU', 'IBIS COMFORT GRU', '', '', '', 1);

INSERT OR IGNORE INTO partner_pins (pin_code, partner_type, partner_code, partner_name, active) VALUES
('1111', 'VENDOR', 'GRUPOFIT', 'GRUPOFIT', 1),
('2222', 'VENDOR', 'VIENA', 'VIENA', 1),
('3333', 'VENDOR', 'DELI365', 'DELI365', 1),
('9001', 'HOTEL', 'PULLMAN_GRU', 'PULLMAN GRU', 1),
('9002', 'HOTEL', 'PANAMBY_GRU', 'PANAMBY GRU', 1),
('9003', 'HOTEL', 'MARRIOTT_GRU', 'MARRIOTT GRU', 1),
('9004', 'HOTEL', 'PANAMBY_BARRA', 'PANAMBY BARRA', 1),
('9005', 'HOTEL', 'PULLMAN_IBIRA', 'PULLMAN IBIRA', 1),
('9006', 'HOTEL', 'IBIS_BUDGET_GRU', 'IBIS BUDGET GRU', 1),
('9007', 'HOTEL', 'IBIS_COMFORT_GRU', 'IBIS COMFORT GRU', 1);
