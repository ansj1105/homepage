CREATE TABLE IF NOT EXISTS power_ranking_user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, item_code),
  CONSTRAINT chk_power_ranking_user_items_code
    CHECK (item_code IN ('byeokbangjun-blanket', 'seoeuntaek-love'))
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_user_items_user_id
  ON power_ranking_user_items (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS power_ranking_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  actor_device_id TEXT NOT NULL,
  person_id UUID NOT NULL REFERENCES power_ranking_people(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  delta INTEGER NOT NULL DEFAULT 0,
  item_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_power_ranking_event_logs_type
    CHECK (event_type IN ('vote_up', 'vote_down', 'item_drop', 'item_use')),
  CONSTRAINT chk_power_ranking_event_logs_item_code
    CHECK (
      item_code IS NULL
      OR item_code IN ('byeokbangjun-blanket', 'seoeuntaek-love')
    )
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_event_logs_person_id
  ON power_ranking_event_logs (person_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_power_ranking_event_logs_actor_user_id
  ON power_ranking_event_logs (actor_user_id, created_at DESC);
