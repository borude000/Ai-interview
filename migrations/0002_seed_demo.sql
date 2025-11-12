-- Demo seed for categories/questions
-- Insert some example HR questions
INSERT INTO questions (category_key, question, answer, difficulty, role, techs, order_no)
VALUES
  ('hr', 'Tell me about yourself.', NULL, 'beginner', NULL, NULL, 1),
  ('hr', 'What are your strengths and weaknesses?', NULL, 'beginner', NULL, NULL, 2),
  ('hr', 'Describe a challenging situation and how you handled it.', NULL, 'intermediate', NULL, NULL, 1);

-- Insert some example technical questions (frontend/react)
INSERT INTO questions (category_key, question, answer, difficulty, role, techs, order_no)
VALUES
  ('technical', 'What are React hooks and why are they useful?', NULL, 'beginner', 'frontend', 'react', 1),
  ('technical', 'Explain the virtual DOM and reconciliation in React.', NULL, 'intermediate', 'frontend', 'react', 2),
  ('technical', 'How do you optimize performance in a large React application?', NULL, 'advanced', 'frontend', 'react', 3)
ON CONFLICT DO NOTHING;
