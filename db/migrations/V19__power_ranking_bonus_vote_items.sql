ALTER TABLE power_ranking_user_items
  DROP CONSTRAINT IF EXISTS chk_power_ranking_user_items_code;

ALTER TABLE power_ranking_user_items
  ADD CONSTRAINT chk_power_ranking_user_items_code
  CHECK (
    item_code IN (
      'byeokbangjun-blanket',
      'seoeuntaek-love',
      'ranking-up-ticket',
      'ranking-down-ticket'
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
      'ranking-down-ticket'
    )
  );
