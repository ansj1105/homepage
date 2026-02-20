CREATE TABLE IF NOT EXISTS main_page_settings (
  id SMALLINT PRIMARY KEY CHECK (id = 1),
  hero_copy_top TEXT NOT NULL,
  hero_copy_mid TEXT NOT NULL,
  hero_copy_bottom TEXT NOT NULL,
  hero_cta_label TEXT NOT NULL,
  hero_cta_href TEXT NOT NULL,
  about_title TEXT NOT NULL,
  about_body_1 TEXT NOT NULL,
  about_body_2 TEXT NOT NULL,
  about_image_url TEXT NOT NULL,
  solution_title TEXT NOT NULL,
  solution_body_1 TEXT NOT NULL,
  solution_body_2 TEXT NOT NULL,
  solution_step_image_1 TEXT NOT NULL,
  solution_step_image_2 TEXT NOT NULL,
  solution_step_image_3 TEXT NOT NULL,
  footer_address TEXT NOT NULL,
  footer_copyright TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS main_page_slides (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_main_page_slides_sort_order ON main_page_slides (sort_order);

CREATE TABLE IF NOT EXISTS main_page_application_cards (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL CHECK (sort_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_main_page_application_cards_sort_order
  ON main_page_application_cards (sort_order);
