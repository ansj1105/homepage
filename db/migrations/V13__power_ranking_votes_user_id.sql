ALTER TABLE power_ranking_votes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_power_ranking_votes_user_id
  ON power_ranking_votes (user_id, created_at DESC);
