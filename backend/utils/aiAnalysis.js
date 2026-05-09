const axios = require('axios');

const getActiveProvider = () => {
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'none';
};

// ── GROQ (Free, fast, reliable) ──────────────────────────────
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

const callGroq = async (prompt, systemPrompt) => {
  const key = process.env.GROQ_API_KEY;
  for (const model of GROQ_MODELS) {
    try {
      console.log(`[AI] Trying Groq model: ${model}`);
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
        },
        {
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );
      const text = res.data.choices?.[0]?.message?.content;
      if (text) {
        console.log(`[AI] Groq success: ${model}`);
        return text;
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message || err.message;
      console.log(`[AI] Groq ${model} failed (${status}): ${msg}`);
      if (status !== 404 && status !== 400) throw err;
    }
  }
  throw new Error('All Groq models failed.');
};

// ── GEMINI (Free, fallback) ───────────────────────────────────
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

const callGemini = async (prompt, systemPrompt) => {
  const key = process.env.GEMINI_API_KEY;
  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AI] Trying Gemini model: ${model}`);
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 120000 }
      );
      const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log(`[AI] Gemini success: ${model}`);
        return text;
      }
    } catch (err) {
      const status = err.response?.status;
      console.log(`[AI] Gemini ${model} failed (${status})`);
      if (status !== 404 && status !== 400) throw err;
    }
  }
  throw new Error('All Gemini models failed.');
};

// ── ANTHROPIC (Paid, highest quality) ────────────────────────
const callAnthropic = async (prompt, systemPrompt) => {
  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      timeout: 120000,
    }
  );
  return res.data.content[0].text;
};

const callAI = async (prompt, systemPrompt = '') => {
  const provider = getActiveProvider();
  console.log(`[AI] Using provider: ${provider}`);
  if (provider === 'groq')      return callGroq(prompt, systemPrompt);
  if (provider === 'gemini')    return callGemini(prompt, systemPrompt);
  if (provider === 'anthropic') return callAnthropic(prompt, systemPrompt);
  throw new Error('NO_API_KEY');
};

// ── Main analysis function ────────────────────────────────────
const analyzeTranscript = async (transcript, videoTitle, summaryLength = 'medium') => {
  const limits = {
    brief:    { summary: 150, bullets: 5  },
    medium:   { summary: 300, bullets: 8  },
    detailed: { summary: 500, bullets: 12 },
  }[summaryLength] || { summary: 300, bullets: 8 };

  const maxChars = 12000;
  const text = transcript.length > maxChars
    ? transcript.slice(0, maxChars) + '... [truncated]'
    : transcript;

  const systemPrompt =
    'You are an expert multilingual educational content analyzer. ' +
    'The transcript may be in ANY language. ' +
    'Detect the language and write ALL output in clear fluent ENGLISH. ' +
    'Respond with ONLY valid JSON — no markdown, no backticks, no text before or after.';

  const prompt = `Analyze this YouTube video. Write ALL output in English.

VIDEO TITLE: "${videoTitle}"

TRANSCRIPT:
${text}

Return ONLY valid JSON, nothing else:
{
  "summary": "~${limits.summary} word English summary",
  "bulletPoints": ["point 1", "point 2", "exactly ${limits.bullets} points total"],
  "keyConcepts": [
    {"term": "term name", "definition": "clear English definition", "importance": "high"}
  ],
  "mcqs": [
    {
      "question": "Question in English?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ],
  "sentiment": "positive",
  "difficulty": "intermediate",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "estimatedReadTime": 3,
  "detectedLanguage": "English"
}

STRICT RULES:
- bulletPoints: exactly ${limits.bullets} items
- keyConcepts: 5 to 8 items
- mcqs: exactly 5 questions with 4 options each
- correctAnswer: number 0, 1, 2, or 3
- sentiment: "positive" | "neutral" | "negative" | "mixed"
- difficulty: "beginner" | "intermediate" | "advanced"
- tags: exactly 5 items
- detectedLanguage: the language the transcript was written in`;

  try {
    const raw = await callAI(prompt, systemPrompt);
    const cleaned = raw
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '').trim();
    const analysis = JSON.parse(cleaned);
    console.log(`[AI] Done. Detected: ${analysis.detectedLanguage}`);
    return { success: true, analysis };
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      return { success: false, error: 'no_key', analysis: noKeyFallback(videoTitle) };
    }
    const msg = err.response?.data?.error?.message || err.message;
    console.error('[AI] Failed:', msg);
    return { success: false, error: msg, analysis: errorFallback(videoTitle, msg) };
  }
};

const noKeyFallback = (videoTitle) => ({
  summary: `"${videoTitle}" — Add GROQ_API_KEY to backend/.env. Get a free key at console.groq.com (takes 1 minute, no credit card).`,
  bulletPoints: [
    '🆓 Groq API is FREE — fast and no quota issues',
    '⚡ Go to console.groq.com and sign up with Gmail',
    '🔑 Click API Keys → Create API Key → copy it',
    '📝 Add GROQ_API_KEY=your_key to backend/.env',
    '🔄 Restart: Ctrl+C then npm run dev',
  ],
  keyConcepts: [{ term: 'Groq API', definition: 'Free AI API — faster and more reliable than Gemini for this use case', importance: 'high' }],
  mcqs: [],
  sentiment: 'neutral',
  difficulty: 'beginner',
  tags: ['setup', 'groq', 'api-key', 'free', 'config'],
  estimatedReadTime: 1,
  detectedLanguage: 'Unknown',
});

const errorFallback = (videoTitle, errMsg) => ({
  summary: `Analysis of "${videoTitle}" failed. Error: ${errMsg}. Please check your API key and try again.`,
  bulletPoints: [
    'Transcript was fetched successfully',
    'The AI API returned an error',
    'Check your GROQ_API_KEY or GEMINI_API_KEY in backend/.env',
    'Make sure the key is valid and has quota remaining',
    'Click Force Re-analyze after fixing',
  ],
  keyConcepts: [{ term: 'API Error', definition: errMsg, importance: 'high' }],
  mcqs: [],
  sentiment: 'neutral',
  difficulty: 'intermediate',
  tags: ['error', 'api', 'fix', 'retry', 'key'],
  estimatedReadTime: 1,
  detectedLanguage: 'Unknown',
});

// ── Chat with a video ────────────────────────────────
const chatWithVideo = async (videoTitle, transcript, analysis, history, userMessage) => {
  const maxTranscriptChars = 10000;
  const truncatedTranscript =
    transcript && transcript.length > maxTranscriptChars
      ? transcript.slice(0, maxTranscriptChars) + '... [truncated]'
      : transcript || '';

  // Build a rich context block from ALL available analysis fields
  const ctx = [];

  if (analysis?.summary) {
    ctx.push(`SUMMARY:\n${analysis.summary}`);
  }

  if (analysis?.bulletPoints?.length) {
    ctx.push(`KEY POINTS:\n${analysis.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n')}`);
  }

  if (analysis?.keyConcepts?.length) {
    ctx.push(`KEY CONCEPTS:\n${analysis.keyConcepts.map(c => `- ${c.term}: ${c.definition}`).join('\n')}`);
  }

  if (analysis?.tags?.length) {
    ctx.push(`TAGS: ${analysis.tags.join(', ')}`);
  }

  if (analysis?.difficulty) ctx.push(`DIFFICULTY: ${analysis.difficulty}`);
  if (analysis?.sentiment)  ctx.push(`SENTIMENT: ${analysis.sentiment}`);
  if (analysis?.detectedLanguage) ctx.push(`LANGUAGE: ${analysis.detectedLanguage}`);

  if (truncatedTranscript) {
    ctx.push(`TRANSCRIPT (may be truncated):\n${truncatedTranscript}`);
  }

  const contextBlock = ctx.length
    ? ctx.join('\n\n')
    : 'No transcript or analysis data is available for this video, but it is a real YouTube video. Answer based on your general knowledge about it if you can.';

  const systemPrompt =
    `You are VidBot, a fun, enthusiastic AI assistant that helps users understand YouTube videos. ` +
    `You are currently helping with the video: "${videoTitle}". ` +
    `Answer questions in a friendly, conversational, energetic way with occasional emojis. ` +
    `IMPORTANT RULES:\n` +
    `- Use the provided context data as your PRIMARY source of answers.\n` +
    `- Even if the transcript is missing, you ALWAYS have the summary, key points, and concepts to draw from — USE them!\n` +
    `- NEVER say data is "unavailable" if analysis fields (summary, bullet points, concepts) exist.\n` +
    `- If the user asks about something genuinely not in the video, say so briefly then answer from general knowledge.\n` +
    `- Keep answers concise (2-4 sentences) unless user asks for detail.\n` +
    `- Be lively, helpful, and never repeat the same opener message.\n\n` +
    `VIDEO CONTEXT DATA:\n${contextBlock}`;

  // Build messages array with history
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  // Use the same multi-model fallback logic
  const provider = getActiveProvider();
  console.log(`[Chat] Using provider: ${provider} for video "${videoTitle}"`);

  if (provider === 'groq') {
    const key = process.env.GROQ_API_KEY;
    for (const model of GROQ_MODELS) {
      try {
        const res = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          { model, messages, temperature: 0.7, max_tokens: 600 },
          { headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 30000 }
        );
        const text = res.data.choices?.[0]?.message?.content;
        if (text) return text;
      } catch (err) {
        const status = err.response?.status;
        if (status !== 404 && status !== 400) throw err;
      }
    }
    throw new Error('All Groq models failed for chat.');
  }

  if (provider === 'gemini') {
    const geminiPrompt = `${systemPrompt}\n\nUser question: ${userMessage}`;
    return callGemini(geminiPrompt, '');
  }

  throw new Error('NO_API_KEY');
};

module.exports = { analyzeTranscript, callAI, getActiveProvider, chatWithVideo };
