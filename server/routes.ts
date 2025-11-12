import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import { generateQuestion } from "./ai";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function generateToken(user: { id: string; username: string }): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1d",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // helper to get userId from Authorization header
  const getUserId = (req: any): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      return decoded.id;
    } catch {
      return null;
    }
  };
  // File upload middleware for audio
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
  // Signup route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: 'user',
      });

      // Generate JWT token
      const token = generateToken(user);

      // Return user data (excluding password) and token
      const { password: _, ...userData } = user;
      return res.status(201).json({ user: userData, token });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Return user data (excluding password) and token
      const { password: _, ...userData } = user;
      return res.json({ user: userData, token });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user route
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      
      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string };
        
        // Get user from database
        const user = await storage.getUser(decoded.id);
        
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Return user data without password
        const { password, ...userData } = user;
        return res.json(userData);
        
      } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: 'Invalid token' });
        }
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: 'Token expired' });
        }
        throw err;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Start interview route (AI-driven + persistence)
  app.post("/api/interview/start", async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { type, role, techs, difficulty } = req.body as { type: string; role?: string; techs?: string[]; difficulty?: 'beginner'|'intermediate'|'advanced' };
    try {
      const context = { type: type || 'hr', role, techs, difficulty: (difficulty || 'beginner') } as any;
      // create interview row
      const interview = await storage.createInterview({ userId, type: context.type, role, techs, difficulty: context.difficulty });
      // generate first question and persist AI message
      const question = await generateQuestion(context, []);
      await storage.addMessage({ interviewId: interview.id as string, sender: 'ai', text: question });
      res.json({ question, interviewId: interview.id });
    } catch (error) {
      console.error("Error starting interview:", error);
      res.status(500).json({ message: "Failed to start interview" });
    }
  });

  // STT route removed per requirement: no AI usage. Client uses browser SpeechRecognition only.
  // Local STT (Python faster-whisper microservice)
  app.post('/api/stt', upload.single('audio'), async (req, res) => {
    try {
      const fileUpload = (req as any).file as { buffer: Buffer; originalname?: string } | undefined;
      if (!fileUpload) {
        return res.status(400).json({ message: 'No audio file uploaded' });
      }

      const ext = (fileUpload.originalname && fileUpload.originalname.includes('.'))
        ? fileUpload.originalname.split('.').pop()?.toLowerCase() || 'webm'
        : 'webm';

      // Forward as octet-stream to local microservice
      const resp = await fetch('http://127.0.0.1:5001/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'x-audio-ext': ext,
        },
        body: fileUpload.buffer,
      } as any);

      if (!resp.ok) {
        const t = await resp.text();
        return res.status(500).json({ message: 'Local STT failed', detail: t });
      }
      const data = await resp.json();
      return res.json({ text: data.text || '' });
    } catch (error) {
      console.error('Local STT proxy error:', error);
      return res.status(500).json({ message: 'Failed to transcribe audio' });
    }
  });

  // Interview conversation route (AI-driven next question)
  app.post("/api/interview/next", async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { messages, context, interviewId } = req.body as { messages: any[]; context: string; interviewId?: string };
    const parsedContext = new URLSearchParams(context);
    const interviewContext = {
      type: parsedContext.get('type') || 'hr',
      role: parsedContext.get('role') || undefined,
      difficulty: (parsedContext.get('difficulty') as 'beginner'|'intermediate'|'advanced') || 'beginner',
      techs: parsedContext.get('techs')?.split(',') || [],
    };

    // Helper: compute simple keyword-based score from user answers
    function computeScore(): { score: number; matched: string[]; total: number } {
      const userTexts: string[] = (Array.isArray(messages) ? messages : [])
        .filter((m: any) => m && m.sender === 'user' && typeof m.text === 'string')
        .map((m: any) => m.text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());
      const answer = userTexts.join(' \n ');

      // Build concept list by type/role/techs
      const baseHR = ['introduction','background','experience','goals','teamwork','feedback','strengths','weaknesses','challenge','communication','conflict','motivation'];
      const baseTech = ['architecture','design patterns','testing','performance','optimization','scalability','security','api','state management','debugging'];
      const techFromContext = (interviewContext.techs || []).map((t) => t.toLowerCase());
      let concepts: string[] = interviewContext.type === 'hr' ? baseHR : [...baseTech, ...techFromContext];

      // Synonyms map to increase recall
      const synonyms: Record<string, string[]> = {
        'introduction': ['intro','about me','my name','this is'],
        'background': ['education','degree','academics','university','college','engineering','be','b.e','btech','b.tech'],
        'experience': ['internship','work','project','projects','exp','professional'],
        'goals': ['aspirations','aim','objective','future','career goals','five years'],
        'teamwork': ['team','collaboration','collaborate','pair','group'],
        'feedback': ['review','retro','improve','improvement','criticism'],
        'strengths': ['strong at','good at','skill','skills'],
        'weaknesses': ['weak at','need to improve','improving'],
        'challenge': ['problem','difficult','issue','blocking'],
        'communication': ['communicate','explain','present','presentation'],
        'conflict': ['disagree','argument','resolution','resolve'],
        'motivation': ['interested','why','passion'],
        'architecture': ['design','system design','components','layers'],
        'design patterns': ['singleton','factory','observer','adapter','strategy'],
        'testing': ['unit test','integration test','e2e','jest','vitest','cypress'],
        'performance': ['optimize','profiling','memo','cache','lazy load'],
        'optimization': ['optimize','tuning','profiling'],
        'scalability': ['scale','load','throughput','concurrency'],
        'security': ['auth','authorization','xss','csrf','sql injection','owasp'],
        'api': ['rest','graphql','endpoint','http','request','response'],
        'state management': ['state','redux','context','store'],
        'debugging': ['bug','debug','trace','log','breakpoint'],
      };
      // Add techs as their own concepts with minimal variants
      for (const t of techFromContext) {
        if (!synonyms[t]) synonyms[t] = [t];
      }

      // Unique concepts only
      concepts = Array.from(new Set(concepts));
      const hits: string[] = [];
      for (const c of concepts) {
        const variants = [c, ...(synonyms[c] || [])];
        if (variants.some(v => v && answer.includes(v))) hits.push(c);
      }
      const total = concepts.length || 1;
      const ratio = hits.length / total;
      const score = Math.round(Math.min(1, ratio) * 100);
      return { score, matched: hits, total };
    }

    try {
      // Limit to 12 interviewer turns (AI questions). Count how many AI messages so far.
      const aiCount = (Array.isArray(messages) ? messages : []).filter((m: any) => m && m.sender === 'ai').length;
      if (aiCount >= 12) {
        const { score, matched, total } = computeScore();
        const top = matched.slice(0, 5);
        const summary = `Interview complete. Score: ${score}/100. You covered ${matched.length} of ${total} key topics${top.length ? ` (e.g., ${top.join(', ')})` : ''}.`;
        if (interviewId) {
          await storage.finishInterview({ interviewId, score, summary });
        }
        return res.json({ done: true, message: summary, score, matchedTop: top });
      }

      // persist last user message if provided
      const lastUser = [...(messages || [])].reverse().find((m: any) => m?.sender === 'user' && m?.text);
      if (interviewId && lastUser) {
        await storage.addMessage({ interviewId, sender: 'user', text: String(lastUser.text) });
      }
      const question = await generateQuestion(interviewContext, messages as any[]);
      if (interviewId) {
        await storage.addMessage({ interviewId, sender: 'ai', text: question });
      }
      res.json({ question });
    } catch (error) {
      console.error("Error getting next question:", error);
      res.status(500).json({ message: "Failed to get next question" });
    }
  });

  // Stop interview early and return final score/summary
  app.post('/api/interview/stop', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const { messages, context, interviewId } = req.body as { messages: any[]; context: string; interviewId?: string };
    const parsedContext = new URLSearchParams(context);
    const interviewContext = {
      type: parsedContext.get('type') || 'hr',
      role: parsedContext.get('role') || undefined,
      difficulty: (parsedContext.get('difficulty') as 'beginner'|'intermediate'|'advanced') || 'beginner',
      techs: parsedContext.get('techs')?.split(',') || [],
    };

    function computeScore(): { score: number; matched: string[]; total: number } {
      const userTexts: string[] = (Array.isArray(messages) ? messages : [])
        .filter((m: any) => m && m.sender === 'user' && typeof m.text === 'string')
        .map((m: any) => m.text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim());
      const answer = userTexts.join(' \n ');

      const baseHR = ['introduction','background','experience','goals','teamwork','feedback','strengths','weaknesses','challenge','communication','conflict','motivation'];
      const baseTech = ['architecture','design patterns','testing','performance','optimization','scalability','security','api','state management','debugging'];
      const techFromContext = (interviewContext.techs || []).map((t) => t.toLowerCase());
      let concepts: string[] = interviewContext.type === 'hr' ? baseHR : [...baseTech, ...techFromContext];

      const synonyms: Record<string, string[]> = {
        'introduction': ['intro','about me','my name','this is'],
        'background': ['education','degree','academics','university','college','engineering','be','b.e','btech','b.tech'],
        'experience': ['internship','work','project','projects','exp','professional'],
        'goals': ['aspirations','aim','objective','future','career goals','five years'],
        'teamwork': ['team','collaboration','collaborate','pair','group'],
        'feedback': ['review','retro','improve','improvement','criticism'],
        'strengths': ['strong at','good at','skill','skills'],
        'weaknesses': ['weak at','need to improve','improving'],
        'challenge': ['problem','difficult','issue','blocking'],
        'communication': ['communicate','explain','present','presentation'],
        'conflict': ['disagree','argument','resolution','resolve'],
        'motivation': ['interested','why','passion'],
        'architecture': ['design','system design','components','layers'],
        'design patterns': ['singleton','factory','observer','adapter','strategy'],
        'testing': ['unit test','integration test','e2e','jest','vitest','cypress'],
        'performance': ['optimize','profiling','memo','cache','lazy load'],
        'optimization': ['optimize','tuning','profiling'],
        'scalability': ['scale','load','throughput','concurrency'],
        'security': ['auth','authorization','xss','csrf','sql injection','owasp'],
        'api': ['rest','graphql','endpoint','http','request','response'],
        'state management': ['state','redux','context','store'],
        'debugging': ['bug','debug','trace','log','breakpoint'],
      };
      for (const t of techFromContext) { if (!synonyms[t]) synonyms[t] = [t]; }
      concepts = Array.from(new Set(concepts));
      const hits: string[] = [];
      for (const c of concepts) {
        const variants = [c, ...(synonyms[c] || [])];
        if (variants.some(v => v && answer.includes(v))) hits.push(c);
      }
      const total = concepts.length || 1;
      const score = Math.round(Math.min(1, hits.length / total) * 100);
      return { score, matched: hits, total };
    }

    try {
      const { score, matched, total } = computeScore();
      const top = matched.slice(0, 5);
      const summary = `Interview stopped. Score: ${score}/100. You covered ${matched.length} of ${total} key topics${top.length ? ` (e.g., ${top.join(', ')})` : ''}.`;
      if (interviewId) {
        await storage.finishInterview({ interviewId, score, summary });
      }
      return res.json({ done: true, message: summary, score, matchedTop: top });
    } catch (error) {
      console.error('Error stopping interview:', error);
      return res.status(500).json({ message: 'Failed to stop interview' });
    }
  });

  // History routes
  app.get('/api/interviews', async (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    try {
      const rows = await storage.listInterviewsByUser(userId);
      return res.json(rows);
    } catch (e) {
      console.error('List interviews error:', e);
      return res.status(500).json({ message: 'Failed to list interviews' });
    }
  });

  // Practice questions listing
  app.get('/api/practice/questions', async (req, res) => {
    try {
      const type = String(req.query.type || 'hr');
      const difficulty = req.query.difficulty ? String(req.query.difficulty) as 'beginner'|'intermediate'|'advanced' : undefined;
      const role = req.query.role ? String(req.query.role) : undefined;
      const techs = req.query.techs ? String(req.query.techs).split(',') : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
      const rows = await storage.listQuestions({ categoryKey: type, difficulty, role: role || null, techs, limit });
      if (rows.length > 0) {
        return res.json(rows.map(r => ({ id: r.id, question: r.question, difficulty: r.difficulty, role: r.role, techs: r.techs })));
      }
      // Fallback samples if DB is empty for selected filters
      const samplesHR = [
        { id: 'sample-hr-1', question: 'Tell me about yourself.', difficulty: 'beginner', role: null, techs: null },
        { id: 'sample-hr-2', question: 'What are your strengths and weaknesses?', difficulty: 'beginner', role: null, techs: null },
        { id: 'sample-hr-3', question: 'Describe a challenging situation and how you handled it.', difficulty: 'intermediate', role: null, techs: null },
      ];
      const samplesTech = [
        { id: 'sample-tech-1', question: 'What are React hooks and why are they useful?', difficulty: 'beginner', role: 'frontend', techs: 'react' },
        { id: 'sample-tech-2', question: 'Explain the virtual DOM and reconciliation in React.', difficulty: 'intermediate', role: 'frontend', techs: 'react' },
        { id: 'sample-tech-3', question: 'How do you optimize performance in a large React application?', difficulty: 'advanced', role: 'frontend', techs: 'react' },
      ];
      const samples = type === 'hr' ? samplesHR : samplesTech;
      const filtered = difficulty ? samples.filter(s => s.difficulty === difficulty) : samples;
      return res.json(filtered.slice(0, limit));
    } catch (e) {
      console.error('Practice questions error:', e);
      return res.status(500).json({ message: 'Failed to load practice questions' });
    }
  });
  const httpServer = createServer(app);
  return httpServer;
}
