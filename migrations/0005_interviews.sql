-- Interviews persistence
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,             -- 'hr' | 'technical'
  role TEXT,
  techs TEXT,                     -- comma-separated
  difficulty TEXT NOT NULL,       -- 'beginner' | 'intermediate' | 'advanced'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  score INTEGER,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS interview_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user','ai')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_im_interview ON interview_messages (interview_id, created_at);
