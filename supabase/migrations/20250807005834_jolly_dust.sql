/*
  # Insert Default Data for Starline Networks

  1. Default Plans
    - Quick Browse (3 hours)
    - Daily Essential (24 hours)
    - Weekly Standard (168 hours)
    - Monthly Premium (720 hours)

  2. Default Locations
    - Starline Networks 1
    - Starline Networks 2
*/

-- Insert default plans
INSERT INTO plans (name, duration_hours, price, is_active) VALUES
  ('Quick Browse', 3, 250.00, true),
  ('Daily Essential', 24, 500.00, true),
  ('Weekly Standard', 168, 2000.00, true),
  ('Monthly Premium', 720, 7000.00, true)
ON CONFLICT DO NOTHING;

-- Insert default locations
INSERT INTO locations (name, wifi_name, is_active) VALUES
  ('Starline Networks 1', 'Starline Networks 1', true),
  ('Starline Networks 2', 'Starline Networks 2', true)
ON CONFLICT DO NOTHING;