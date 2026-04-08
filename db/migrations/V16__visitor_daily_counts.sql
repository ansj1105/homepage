CREATE TABLE IF NOT EXISTS visitor_daily_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_date DATE NOT NULL,
  device_id TEXT NOT NULL,
  first_path TEXT NOT NULL DEFAULT '/',
  first_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (visit_date, device_id)
);

CREATE INDEX IF NOT EXISTS idx_visitor_daily_visits_date
  ON visitor_daily_visits (visit_date DESC, first_visited_at DESC);
