-- Add keywords to existing HR questions and seed more
UPDATE questions SET keywords='introduction,background,experience,goals' WHERE category_key='hr' AND question ILIKE 'Tell me about yourself%';
UPDATE questions SET keywords='strengths,weaknesses,improvement,learn' WHERE category_key='hr' AND question ILIKE 'What are your strengths and weaknesses%';
UPDATE questions SET keywords='challenge,problem,resolve,team,conflict' WHERE category_key='hr' AND question ILIKE 'Describe a challenging situation%';

-- More HR beginner/intermediate questions
INSERT INTO questions (category_key, question, difficulty, order_no, keywords)
VALUES
('hr','Why are you interested in this position?', 'beginner', 3, 'motivation,role,company,fit'),
('hr','What do you know about our company?', 'beginner', 4, 'products,services,mission,values'),
('hr','How do you handle feedback from your manager?', 'intermediate', 2, 'feedback,improve,listen,action'),
('hr','Describe a time you worked in a team.', 'beginner', 5, 'teamwork,collaboration,role,impact'),
('hr','Where do you see yourself in five years?', 'beginner', 6, 'growth,career,goals,learning')
ON CONFLICT DO NOTHING;
