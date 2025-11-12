-- Categories and Questions for DB-driven interview
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_key TEXT NOT NULL REFERENCES categories(key) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
  role TEXT,
  techs TEXT, -- comma-separated list of tech ids e.g., 'react,vue'
  order_no INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category_key);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(category_key, difficulty, role, order_no, id);

-- Seed minimal categories
INSERT INTO categories(key, name)
VALUES ('hr','HR Round'), ('technical','Technical Round')
ON CONFLICT (key) DO NOTHING;
