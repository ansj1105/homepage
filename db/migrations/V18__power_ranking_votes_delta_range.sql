ALTER TABLE power_ranking_votes
  DROP CONSTRAINT IF EXISTS power_ranking_votes_delta_check;

ALTER TABLE power_ranking_votes
  ADD CONSTRAINT power_ranking_votes_delta_check
  CHECK (delta <> 0);
