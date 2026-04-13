CREATE TABLE IF NOT EXISTS power_ranking_weekly_item_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (award_key, user_id)
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_weekly_item_grants_award_key
  ON power_ranking_weekly_item_grants (award_key DESC, granted_at DESC);

ALTER TABLE power_ranking_user_items
  DROP CONSTRAINT IF EXISTS chk_power_ranking_user_items_code;

ALTER TABLE power_ranking_user_items
  ADD CONSTRAINT chk_power_ranking_user_items_code
  CHECK (
    item_code IN (
      'byeokbangjun-blanket',
      'seoeuntaek-love',
      'ranking-up-ticket',
      'ranking-down-ticket',
      'kimdaseul-blessing',
      'cheongeonho-momentum',
      'blue-campus-badge',
      'red-campus-flare'
    )
  );

ALTER TABLE power_ranking_event_logs
  DROP CONSTRAINT IF EXISTS chk_power_ranking_event_logs_item_code;

ALTER TABLE power_ranking_event_logs
  ADD CONSTRAINT chk_power_ranking_event_logs_item_code
  CHECK (
    item_code IS NULL
    OR item_code IN (
      'byeokbangjun-blanket',
      'seoeuntaek-love',
      'ranking-up-ticket',
      'ranking-down-ticket',
      'kimdaseul-blessing',
      'cheongeonho-momentum',
      'blue-campus-badge',
      'red-campus-flare'
    )
  );
