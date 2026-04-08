CREATE TABLE IF NOT EXISTS power_ranking_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES power_ranking_people(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  delta INTEGER NOT NULL CHECK (delta IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_votes_person_created
  ON power_ranking_votes (person_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_power_ranking_votes_device_created
  ON power_ranking_votes (device_id, created_at DESC);
