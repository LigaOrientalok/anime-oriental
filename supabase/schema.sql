-- ============================================================
-- Anime Oriental - Esquema de Base de Datos Supabase
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles (perfiles de usuario)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: animes (series de anime)
-- ============================================================
CREATE TABLE animes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  banner_url TEXT,
  genre TEXT[] DEFAULT '{}',
  year INTEGER,
  status TEXT DEFAULT 'En emisión' CHECK (status IN ('En emisión', 'Finalizado', 'Próximamente')),
  rating DECIMAL(3,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: episodes (episodios de cada anime)
-- ============================================================
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anime_id UUID NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(anime_id, episode_number)
);

-- ============================================================
-- TABLA: favorites (favoritos por usuario)
-- ============================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- ============================================================
-- TABLA: history (historial de reproducción)
-- ============================================================
CREATE TABLE history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, episode_id)
);

-- ============================================================
-- TABLA: watch_later (ver más tarde)
-- ============================================================
CREATE TABLE watch_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anime_id UUID NOT NULL REFERENCES animes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, anime_id)
);

-- ============================================================
-- TABLA: comments (comentarios en episodios)
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_animes_genre ON animes USING GIN(genre);
CREATE INDEX idx_animes_year ON animes(year);
CREATE INDEX idx_animes_rating ON animes(rating DESC);
CREATE INDEX idx_episodes_anime ON episodes(anime_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_history_user ON history(user_id);
CREATE INDEX idx_watch_later_user ON watch_later(user_id);
CREATE INDEX idx_comments_episode ON comments(episode_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- TRIGGER: auto-crear perfil al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', 'unknown@email.com'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
