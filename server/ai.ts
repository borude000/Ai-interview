import OpenAI from 'openai';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

function buildPrompt(context: { type: string; role?: string; techs?: string[]; difficulty?: 'beginner' | 'intermediate' | 'advanced' }, messages: Message[]): string {
  let prompt = `You are an expert interviewer conducting a structured interview.\n`;
  if (context.type === 'hr') {
    prompt += `Interview type: HR round. Focus on communication, culture fit, past experiences.\n`;
  } else {
    const focus = context.techs && context.techs.length ? context.techs.join(', ') : 'general CS fundamentals';
    prompt += `Interview type: Technical round for role: ${context.role || 'general'} with focus on: ${focus}.\n`;
  }
  const lvl = context.difficulty || 'beginner';
  prompt += `Target difficulty: ${lvl}.\n`;
  prompt += `Guidelines:\n`+
           `- Start with BASIC, foundational questions first (definitions, simple concepts).\n`+
           `- Only increase difficulty GRADUALLY after the candidate demonstrates mastery (2 clear correct answers in a row).\n`+
           `- Avoid advanced or niche topics (e.g., complex distributed systems, fluid dynamics, advanced math) until later stages.\n`+
           `- Ask ONE concise question at a time. Do NOT provide the answer.\n`+
           `- Prefer practical, scenario-based questions but keep them simple initially.\n`+
           `- If earlier answers were weak or it's the beginning, remain at beginner level.\n\nConversation so far:\n`;
  messages.forEach((m) => {
    prompt += `${m.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${m.text}\n`;
  });
  // First turn behavior: just greet and ask readiness; no technical question yet
  if (messages.length === 0) {
    prompt += `\nFor your next message: write a short, friendly greeting and ask if we can start the interview (no technical content yet). Example: "Hi! How are you doing today? Shall we start the interview?"`;
    return prompt;
  }

  const opener = lvl === 'beginner' ? 'beginner-friendly' : (lvl === 'intermediate' ? 'intermediate-level' : 'advanced-ready');
  prompt += `\nNow, as Interviewer, ask the next SINGLE ${opener} question (only ramp up after two strong answers).`;
  return prompt;
}

const openaiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
// If no API key is provided, don't throw during import — allow the server to run
// (useful for serving only auth pages). Fall back to a simple local generator below.
if (!openaiKey) {
  console.warn('Warning: OPENAI_API_KEY (or GEMINI_API_KEY) is not set. AI features will be disabled and a simple fallback will be used.');
}

// Detect OpenRouter key pattern and configure baseURL accordingly (only when key exists)
const isOpenRouterKey = openaiKey ? openaiKey.startsWith('sk-or-') : false;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: isOpenRouterKey ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouterKey
        ? {
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'InterviewPilot',
          }
        : undefined,
    })
  : undefined;

export async function generateQuestion(context: any, messages: Message[]): Promise<string> {
  try {
    const systemPrompt = buildPrompt(context, []);
    if (openai) {
      const chatMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text })),
      ];

      const completion = await openai.chat.completions.create({
        // Use OpenRouter model id when using OpenRouter; otherwise use OpenAI's model id
        model: (isOpenRouterKey ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'),
        messages: chatMessages,
        temperature: context?.difficulty === 'advanced' ? 0.9 : context?.difficulty === 'intermediate' ? 0.7 : 0.5,
        max_tokens: 180,
      });

      const text = completion.choices[0]?.message?.content?.trim();
      return text || 'Could you please clarify your last answer?';
    }

    // Fallback: no OpenAI client available — generate a simple question locally
    // This keeps the app usable when API keys aren't configured (e.g., only auth is needed).
    const fallback = fallbackGenerateQuestion(context, messages);
    return fallback;
  } catch (error) {
    console.error('Error generating question from AI:', error);
    return 'I seem to be having trouble coming up with the next question. Could you please repeat your last answer?';
  }
}

function fallbackGenerateQuestion(context: any, messages: Message[]): string {
  // If first message, return greeting similar to the prompt's guidance
  if (!messages || messages.length === 0) {
    return "Hi! How are you doing today? Shall we start the interview?";
  }

  // Simple rule-based question generator
  const lvl = context?.difficulty || 'beginner';
  const type = context?.type || 'hr';
  const techs = Array.isArray(context?.techs) ? context.techs.join(', ') : context?.techs;

  if (type === 'hr') {
    const hrQuestions = [
      'Tell me about a challenging project you worked on and how you handled it.',
      'How do you handle feedback from teammates or managers?',
      'Describe a time you had to resolve a conflict in a team.'
    ];
    return hrQuestions[Math.min(messages.length - 1, hrQuestions.length - 1)];
  }

  // Technical: vary by difficulty
  if (lvl === 'beginner') {
    return `Can you explain the difference between a stack and a queue?`;
  }
  if (lvl === 'intermediate') {
    return `How would you design a simple REST API for a todo app? Outline the main endpoints and data model.`;
  }
  return `Describe how you would approach scaling a read-heavy web application.`;
}
