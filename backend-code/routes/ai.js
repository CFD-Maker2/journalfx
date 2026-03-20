const express = require('express');
const { body, validationResult } = require('express-validator');

const authMiddleware = require('../middleware/auth');
const JournalEntry = require('../models/JournalEntry');
const MoodLog = require('../models/MoodLog');
const ReflectionResponse = require('../models/ReflectionResponse');

const router = express.Router();

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MIN_ENTRIES_FOR_AI = 3;

router.use(authMiddleware);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeString(value, fallback, maxLength = 600) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, maxLength);
}

function normalizePromptKey(value) {
  return normalizeString(value, '', 280)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function hashSeed(input) {
  const text = String(input || 'seed');
  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0;
}

function seededShuffle(items, seedInput) {
  const shuffled = [...items];
  let seed = hashSeed(seedInput);

  function nextRandom() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function pickPromptSet(promptPool, excludedPrompts = [], desiredCount = 3) {
  const excluded = new Set(
    excludedPrompts.map((item) => normalizePromptKey(item)).filter(Boolean),
  );

  const picked = [];
  const seen = new Set();

  for (const item of promptPool) {
    const key = normalizePromptKey(item.prompt);
    if (!key || seen.has(key) || excluded.has(key)) {
      continue;
    }

    seen.add(key);
    picked.push(item);

    if (picked.length >= desiredCount) {
      return picked;
    }
  }

  // If exclusions remove too many items, top up from the original pool to avoid empty responses.
  for (const item of promptPool) {
    const key = normalizePromptKey(item.prompt);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    picked.push(item);

    if (picked.length >= desiredCount) {
      return picked;
    }
  }

  return picked;
}

function stripCodeFence(text) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z]*\s*/, '')
    .replace(/\s*```$/, '')
    .trim();
}

function extractJsonText(text) {
  const cleaned = stripCodeFence(text);
  const objectStart = cleaned.indexOf('{');
  const objectEnd = cleaned.lastIndexOf('}');

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    return cleaned.slice(objectStart, objectEnd + 1);
  }

  return cleaned;
}

function parseGeminiJson(rawText) {
  const jsonText = extractJsonText(rawText);
  return JSON.parse(jsonText);
}

function summarizeEntries(entries) {
  return entries.map((entry) => ({
    entry_date: entry.entry_date,
    emotion: entry.emotion,
    emotion_intensity: entry.emotion_intensity,
    confidence_level: entry.confidence_level,
    outcome: entry.outcome,
    profit_loss: entry.profit_loss,
    trade_type: entry.trade_type,
    market_condition: entry.market_condition,
    tags: Array.isArray(entry.tags) ? entry.tags.slice(0, 6) : [],
    pre_trade: normalizeString(entry.pre_trade, '', 180),
    during_trade: normalizeString(entry.during_trade, '', 180),
    post_trade: normalizeString(entry.post_trade, '', 180),
  }));
}

function summarizeMoodLogs(moodLogs) {
  return moodLogs.map((log) => ({
    log_date: log.log_date,
    emotion: log.emotion,
    intensity: log.intensity,
    notes: normalizeString(log.notes, '', 160),
  }));
}

function summarizeReflections(reflections) {
  return reflections.map((item) => ({
    category: item.category,
    prompt_text: normalizeString(item.prompt_text, '', 120),
    response: normalizeString(item.response, '', 220),
  }));
}

async function loadUserData(userId, entryLimit = 20) {
  const [entries, moodLogs, reflections] = await Promise.all([
    JournalEntry.find({ user_id: userId }).sort({ entry_date: -1 }).limit(entryLimit).lean(),
    MoodLog.find({ user_id: userId }).sort({ log_date: -1 }).limit(30).lean(),
    ReflectionResponse.find({ user_id: userId }).sort({ created_at: -1 }).limit(20).lean(),
  ]);

  return {
    entries,
    moodLogs,
    reflections,
  };
}

function getGeminiSettings() {
  const apiKey = process.env.GEMINI_API_KEY;
  const rawModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const model = rawModel.startsWith('models/') ? rawModel.slice('models/'.length) : rawModel;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY in backend environment.');
  }

  return { apiKey, model };
}

async function callGeminiJson(prompt) {
  const { apiKey, model } = getGeminiSettings();
  const endpoint = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const responseText = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n');

  if (!responseText) {
    throw new Error('Gemini returned an empty response.');
  }

  return parseGeminiJson(responseText);
}

function normalizeSummary(payload) {
  const keyInsights = Array.isArray(payload?.keyInsights)
    ? payload.keyInsights.slice(0, 5).map((item) => normalizeString(item, '')).filter(Boolean)
    : [];

  const recommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations.slice(0, 5).map((item) => normalizeString(item, '')).filter(Boolean)
    : [];

  return {
    narrative: normalizeString(
      payload?.narrative,
      'Your recent trading data was analyzed, but a detailed narrative is not available yet.',
      1800,
    ),
    keyInsights: keyInsights.length > 0
      ? keyInsights
      : ['Log more detailed pre-trade and post-trade notes for deeper AI pattern detection.'],
    emotionPerformanceLink: normalizeString(
      payload?.emotionPerformanceLink,
      'Your emotional state and execution quality appear connected. Keep tracking both together.',
      500,
    ),
    recommendations: recommendations.length > 0
      ? recommendations
      : ['Continue consistent journaling to improve AI recommendation quality over time.'],
  };
}

function normalizeReflectionPrompts(payload) {
  const rawPrompts = Array.isArray(payload?.prompts) ? payload.prompts : [];

  const fallbackPool = [
    {
      category: 'Performance',
      prompt: 'Which repeated behavior in your recent trades helped or hurt your outcomes the most?',
      context: 'Based on your latest entries.',
    },
    {
      category: 'Risk Management',
      prompt: 'Where did your risk execution differ from your plan, and what triggered that decision?',
      context: 'Focus on entries with wins or losses.',
    },
    {
      category: 'Psychology',
      prompt: 'What emotional pattern appeared before your strongest and weakest decisions this week?',
      context: 'Link mood and confidence with execution quality.',
    },
    {
      category: 'Discipline',
      prompt: 'Which rule did you respect best this week, and which one slipped under pressure?',
      context: 'Use concrete examples from your recent entries.',
    },
    {
      category: 'Review',
      prompt: 'What is one decision you would repeat exactly, and one you would change immediately?',
      context: 'Compare process quality, not just P/L outcome.',
    },
  ];

  const prompts = rawPrompts
    .slice(0, 8)
    .map((item) => ({
      category: normalizeString(item?.category, 'Performance', 40),
      prompt: normalizeString(item?.prompt, '', 280),
      context: normalizeString(item?.context, '', 220),
    }))
    .filter((item) => item.prompt)
    .filter((item, index, array) => {
      const currentKey = normalizePromptKey(item.prompt);
      if (!currentKey) {
        return false;
      }

      return (
        array.findIndex((candidate) => normalizePromptKey(candidate.prompt) === currentKey) === index
      );
    })
    .slice(0, 5);

  if (prompts.length > 0) {
    return { prompts };
  }

  return {
    prompts: fallbackPool.slice(0, 3),
  };
}

function normalizeSentiment(payload) {
  const allowed = new Set(['positive', 'negative', 'neutral', 'mixed']);
  const sentiment = typeof payload?.sentiment === 'string' ? payload.sentiment.toLowerCase().trim() : 'neutral';
  const confidence = Number(payload?.confidence);

  return {
    sentiment: allowed.has(sentiment) ? sentiment : 'neutral',
    confidence: Number.isFinite(confidence) ? clamp(confidence, 0, 1) : 0.5,
    emotions: Array.isArray(payload?.emotions)
      ? payload.emotions
          .slice(0, 6)
          .map((item) => normalizeString(item, '', 30).toLowerCase())
          .filter(Boolean)
      : [],
    summary: normalizeString(payload?.summary, 'Sentiment analysis completed.', 300),
  };
}

function buildFallbackSummary(entries, moodLogs, reflections) {
  const resolvedTrades = entries.filter((entry) => ['profit', 'loss', 'breakeven'].includes(entry.outcome));
  const wins = resolvedTrades.filter((entry) => entry.outcome === 'profit').length;
  const winRate = resolvedTrades.length > 0 ? Math.round((wins / resolvedTrades.length) * 100) : 0;

  const avgConfidence = entries.length > 0
    ? (entries.reduce((sum, entry) => sum + (Number(entry.confidence_level) || 0), 0) / entries.length).toFixed(1)
    : '0.0';

  const emotionCounts = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  const topEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion]) => emotion)[0] || 'neutral';

  const avgMoodIntensity = moodLogs.length > 0
    ? (moodLogs.reduce((sum, log) => sum + (Number(log.intensity) || 0), 0) / moodLogs.length).toFixed(1)
    : 'N/A';

  const narrative = [
    `Local fallback analysis: you have ${entries.length} recent journal entries and ${resolvedTrades.length} resolved trades with a ${winRate}% win rate.`,
    `Your average confidence is ${avgConfidence}/5, and your most frequent emotion is ${topEmotion}.`,
    reflections.length > 0
      ? `You also completed ${reflections.length} reflection entries, which gives strong behavioral context.`
      : 'Add reflection responses to improve depth of behavior insights.',
  ].join(' ');

  return {
    narrative,
    keyInsights: [
      `Win rate is ${winRate}% across ${resolvedTrades.length} resolved trades.`,
      `Average confidence level is ${avgConfidence}/5.`,
      `Most common emotion in recent logs is ${topEmotion}.`,
      avgMoodIntensity !== 'N/A'
        ? `Average mood intensity from logs is ${avgMoodIntensity}/5.`
        : 'Mood logs are still limited, so emotional trend depth is lower.',
    ],
    emotionPerformanceLink: `Your repeated emotional baseline appears to be ${topEmotion}. Track whether confidence and risk execution improve when this emotion appears versus sessions with anxious or frustrated states.`,
    recommendations: [
      'Before each trade, define one invalidation rule and avoid editing it during execution.',
      'After each trade, record whether outcome matched plan quality or only market luck.',
      'Review last 10 entries weekly and tag recurring emotional triggers to spot preventable mistakes.',
    ],
  };
}

function buildFallbackReflectionPrompts(entries, moodLogs, options = {}) {
  const refreshToken = normalizeString(options.refreshToken, `${Date.now()}`, 120);
  const excludePrompts = Array.isArray(options.excludePrompts)
    ? options.excludePrompts.map((item) => normalizeString(item, '', 280)).filter(Boolean).slice(0, 10)
    : [];

  const latestEmotion = entries[0]?.emotion || 'neutral';
  const latestConfidence = Number(entries[0]?.confidence_level || 3);
  const losingTrades = entries.filter((entry) => entry.outcome === 'loss').length;
  const overconfidentLosses = entries.filter(
    (entry) => entry.outcome === 'loss' && Number(entry.confidence_level || 0) >= 4,
  ).length;

  const emotionCounts = entries.reduce((acc, entry) => {
    acc[entry.emotion] = (acc[entry.emotion] || 0) + 1;
    return acc;
  }, {});

  const dominantEmotion = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion]) => emotion)[0] || latestEmotion;

  const avgMood = moodLogs.length > 0
    ? (moodLogs.reduce((sum, log) => sum + (Number(log.intensity) || 0), 0) / moodLogs.length).toFixed(1)
    : null;

  const promptPool = [
    {
      category: 'Execution',
      prompt: `In sessions where you felt ${latestEmotion}, which rule was hardest to follow and why?`,
      context: 'Based on your latest emotion pattern in journal entries.',
    },
    {
      category: 'Risk Management',
      prompt: `Your latest confidence level is ${latestConfidence}/5. How did that affect position sizing and stop placement?`,
      context: 'Link confidence to objective risk decisions.',
    },
    {
      category: 'Psychology',
      prompt: 'Which repeated thought pattern appeared before your best and worst outcomes this week?',
      context: avgMood
        ? `Recent mood intensity averages ${avgMood}/5. Compare this with your trade quality.`
        : 'Use your next mood logs to compare emotional intensity against execution quality.',
    },
    {
      category: 'Behavior',
      prompt: `Your dominant emotion lately is ${dominantEmotion}. How did this state influence trade timing decisions?`,
      context: 'Focus on entry/exit timing rather than market direction.',
    },
    {
      category: 'Loss Review',
      prompt: `You logged ${losingTrades} losses recently. Which one was most preventable and what rule would have prevented it?`,
      context: 'Turn one recurring mistake into a rule-based checklist item.',
    },
    {
      category: 'Discipline',
      prompt: overconfidentLosses > 0
        ? `You had ${overconfidentLosses} high-confidence losses. What signal did you trust too quickly?`
        : 'When confidence is high, what process step keeps your execution disciplined?',
      context: 'Separate conviction from confirmation bias.',
    },
  ];

  const shuffledPool = seededShuffle(
    promptPool,
    `${refreshToken}-${latestEmotion}-${latestConfidence}-${entries.length}-${moodLogs.length}`,
  );

  return {
    prompts: pickPromptSet(shuffledPool, excludePrompts, 3),
  };
}

function buildFallbackSentiment(content) {
  const text = String(content || '').toLowerCase();

  const positiveWords = ['confident', 'calm', 'disciplined', 'focused', 'good', 'great', 'patient', 'clear'];
  const negativeWords = ['anxious', 'fear', 'fomo', 'frustrated', 'stressed', 'angry', 'panic', 'revenge'];

  const positiveHits = positiveWords.filter((word) => text.includes(word)).length;
  const negativeHits = negativeWords.filter((word) => text.includes(word)).length;

  let sentiment = 'neutral';
  if (positiveHits > 0 && negativeHits > 0) {
    sentiment = 'mixed';
  } else if (positiveHits > negativeHits) {
    sentiment = 'positive';
  } else if (negativeHits > positiveHits) {
    sentiment = 'negative';
  }

  const denominator = positiveHits + negativeHits + 2;
  const confidence = clamp((Math.max(positiveHits, negativeHits) + 1) / denominator, 0.4, 0.85);

  const emotions = [];
  if (text.includes('confident')) emotions.push('confident');
  if (text.includes('calm')) emotions.push('calm');
  if (text.includes('focused')) emotions.push('focused');
  if (text.includes('anxious')) emotions.push('anxious');
  if (text.includes('frustrated')) emotions.push('frustrated');
  if (text.includes('stressed')) emotions.push('stressed');

  return {
    sentiment,
    confidence,
    emotions: emotions.slice(0, 6),
    summary: 'Local fallback sentiment analysis was used because Gemini is currently unavailable.',
  };
}

router.post(
  '/summary',
  [body('limit').optional().isInt({ min: 3, max: 60 })],
  async (req, res) => {
    let entries = [];
    let moodLogs = [];
    let reflections = [];

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = req.body.limit ? parseInt(req.body.limit, 10) : 20;
      ({ entries, moodLogs, reflections } = await loadUserData(req.user.userId, limit));

      if (entries.length < MIN_ENTRIES_FOR_AI) {
        return res.status(400).json({ error: 'Create at least 3 journal entries to generate AI insights.' });
      }

      const prompt = [
        'You are an AI trading psychology analyst.',
        'Analyze this JSON data and return strict JSON only.',
        'Return this exact schema with no extra keys:',
        '{"narrative":"string","keyInsights":["string"],"emotionPerformanceLink":"string","recommendations":["string"]}',
        'Rules:',
        '- narrative: 2-4 sentences, practical and specific.',
        '- keyInsights: 3-5 concise insights.',
        '- emotionPerformanceLink: one concise paragraph.',
        '- recommendations: 3-5 actionable items.',
        'DATA:',
        JSON.stringify(
          {
            entries: summarizeEntries(entries),
            moodLogs: summarizeMoodLogs(moodLogs),
            reflections: summarizeReflections(reflections),
          },
          null,
          2,
        ),
      ].join('\n');

      const aiResponse = await callGeminiJson(prompt);
      const normalized = normalizeSummary(aiResponse);

      res.json(normalized);
    } catch (error) {
      console.error('AI summary error:', error);
      res.json(buildFallbackSummary(entries, moodLogs, reflections));
    }
  },
);

router.post(
  '/reflection-prompts',
  [
    body('limit').optional().isInt({ min: 3, max: 30 }),
    body('refreshToken').optional().isString().isLength({ min: 1, max: 120 }),
    body('excludePrompts').optional().isArray({ max: 10 }),
    body('excludePrompts.*').optional().isString().isLength({ min: 1, max: 400 }),
  ],
  async (req, res) => {
    let entries = [];
    let moodLogs = [];

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const limit = req.body.limit ? parseInt(req.body.limit, 10) : 12;
      const refreshToken = normalizeString(req.body.refreshToken, `${Date.now()}`, 120);
      const excludePrompts = Array.isArray(req.body.excludePrompts)
        ? req.body.excludePrompts
            .map((item) => normalizeString(item, '', 280))
            .filter(Boolean)
            .slice(0, 10)
        : [];

      ({ entries, moodLogs } = await loadUserData(req.user.userId, limit));

      if (entries.length < MIN_ENTRIES_FOR_AI) {
        return res.status(400).json({ error: 'Create at least 3 journal entries to generate AI prompts.' });
      }

      const prompt = [
        'You are an AI coach for trading psychology.',
        'Generate personalized reflection prompts from this data.',
        'Return strict JSON only with this schema:',
        '{"prompts":[{"category":"string","prompt":"string","context":"string"}]}',
        'Rules:',
        '- Return 3 to 5 prompts.',
        '- category should be short and practical.',
        '- prompt should be one direct reflective question.',
        '- context should explain why this prompt matters now.',
        '- Prefer varied wording across refresh requests.',
        '- Avoid repeating prompts listed in EXCLUDED_PROMPTS when possible.',
        `REFRESH_TOKEN: ${refreshToken}`,
        `EXCLUDED_PROMPTS: ${JSON.stringify(excludePrompts)}`,
        'DATA:',
        JSON.stringify(
          {
            entries: summarizeEntries(entries),
            moodLogs: summarizeMoodLogs(moodLogs),
          },
          null,
          2,
        ),
      ].join('\n');

      const aiResponse = await callGeminiJson(prompt);
      const normalized = normalizeReflectionPrompts(aiResponse);

      if (excludePrompts.length > 0) {
        normalized.prompts = pickPromptSet(normalized.prompts, excludePrompts, 5);
      }

      if (!normalized.prompts.length) {
        return res.json(buildFallbackReflectionPrompts(entries, moodLogs, { refreshToken, excludePrompts }));
      }

      res.json(normalized);
    } catch (error) {
      console.error('AI reflection prompts error:', error);
      const refreshToken = normalizeString(req.body?.refreshToken, `${Date.now()}`, 120);
      const excludePrompts = Array.isArray(req.body?.excludePrompts)
        ? req.body.excludePrompts
            .map((item) => normalizeString(item, '', 280))
            .filter(Boolean)
            .slice(0, 10)
        : [];

      res.json(buildFallbackReflectionPrompts(entries, moodLogs, { refreshToken, excludePrompts }));
    }
  },
);

router.post(
  '/sentiment',
  [body('content').isString().trim().isLength({ min: 10, max: 6000 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const prompt = [
        'You are an NLP sentiment analyzer for trading journal text.',
        'Return strict JSON only with this schema:',
        '{"sentiment":"positive|negative|neutral|mixed","confidence":0.0,"emotions":["string"],"summary":"string"}',
        'Rules:',
        '- confidence must be a number between 0 and 1.',
        '- emotions should include 1-6 words.',
        '- summary should be one sentence.',
        'TEXT:',
        req.body.content,
      ].join('\n');

      const aiResponse = await callGeminiJson(prompt);
      const normalized = normalizeSentiment(aiResponse);

      res.json(normalized);
    } catch (error) {
      console.error('AI sentiment error:', error);
      res.json(buildFallbackSentiment(req.body.content));
    }
  },
);

module.exports = router;