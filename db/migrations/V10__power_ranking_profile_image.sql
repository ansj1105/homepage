ALTER TABLE power_ranking_people
  ADD COLUMN IF NOT EXISTS profile_image_url TEXT NOT NULL DEFAULT '';
