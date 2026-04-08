CREATE TABLE IF NOT EXISTS power_ranking_user_equipment_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  equipment_code TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, equipment_code)
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_user_equipment_inventory_user_id
  ON power_ranking_user_equipment_inventory (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS power_ranking_user_equipped (
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  slot_code TEXT NOT NULL,
  equipment_code TEXT NOT NULL,
  equipped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, slot_code)
);

CREATE INDEX IF NOT EXISTS idx_power_ranking_user_equipped_user_id
  ON power_ranking_user_equipped (user_id, updated_at DESC);
