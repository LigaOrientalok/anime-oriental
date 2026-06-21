-- ============================================================
-- Migration: ratings, report_links, follows, comments RLS
-- ============================================================

-- RATINGS (votación de animes)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ratings"
  ON ratings FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their ratings"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ratings"
  ON ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their ratings"
  ON ratings FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS (seguir anime)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read follows"
  ON follows FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their follows"
  ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their follows"
  ON follows FOR DELETE USING (auth.uid() = user_id);

-- REPORT_LINKS (reportar link caído)
CREATE TABLE IF NOT EXISTS report_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE report_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports"
  ON report_links FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read reports"
  ON report_links FOR SELECT USING (public.is_admin());

-- COMMENTS RLS (table already exists)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_ratings_anime ON ratings(anime_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_report_links_episode ON report_links(episode_id);
CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_anime ON follows(anime_id);
