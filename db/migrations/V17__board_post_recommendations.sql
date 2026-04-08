ALTER TABLE board_posts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recommendation_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_board_posts_user_id
  ON board_posts (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS board_post_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_board_post_recommendations_post_id
  ON board_post_recommendations (post_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_board_post_recommendations_user_id
  ON board_post_recommendations (user_id, created_at DESC);
