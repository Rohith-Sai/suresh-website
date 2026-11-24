export type ChatTaskId = 'general' | 'fast' | 'deep' | 'interactive';

export type GeminiChatModel =
  | 'gemini-4-hydrogen'
  | 'gemini-3.1-flash-lite'
  | 'gemini-4-carbon'
  | 'gemini-4-neon';

export type ChatbotRoleId = 'architect' | 'strategist' | 'reviewer' | 'concierge';

export type LiveVoiceName = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';

export interface ChatTaskMode {
  id: ChatTaskId;
  label: string;
  model: GeminiChatModel;
  badge: string;
  description: string;
  requiresPaidKey: boolean;
}

export interface ChatbotRole {
  id: ChatbotRoleId;
  name: string;
  shortTitle: string;
  description: string;
  defaultTask: ChatTaskId;
  systemInstruction: string;
  starterPrompts: string[];
}

export interface ChatTurnMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  model?: string;
  timestamp: string;
}

export const LIVE_VOICE_MODEL = 'gemini-3.8-live' as const;
export const AUDIO_TRANSCRIBE_MODEL = 'gemini-3.5-transcribe' as const;

export const LIVE_VOICES: ReadonlyArray<{
  name: LiveVoiceName;
  tone: string;
}> = [
  { name: 'Zephyr', tone: 'Crisp & analytical studio voice' },
  { name: 'Kore', tone: 'Warm, articulate engineering partner' },
  { name: 'Puck', tone: 'Energetic & concise collaborator' },
  { name: 'Charon', tone: 'Measured, authoritative systems tone' },
  { name: 'Fenrir', tone: 'Direct technical briefing cadence' },
];

export const CHAT_TASK_MODES: ReadonlyArray<ChatTaskMode> = [
  {
    id: 'general',
    label: 'General Tasks',
    model: 'gemini-4-hydrogen',
    badge: 'Balanced',
    description: 'General engineering guidance, API design, and balanced product Q&A.',
    requiresPaidKey: false,
  },
  {
    id: 'fast',
    label: 'Fast Response',
    model: 'gemini-3.1-flash-lite',
    badge: 'Low Latency',
    description: 'Rapid triage, concise summaries, and instant checklist generation.',
    requiresPaidKey: false,
  },
  {
    id: 'deep',
    label: 'Deep Reasoning',
    model: 'gemini-4-carbon',
    badge: 'Paid Tier',
    description: 'Deep root-cause debugging, distributed architecture, and security audits.',
    requiresPaidKey: true,
  },
  {
    id: 'interactive',
    label: 'Complex Interactive',
    model: 'gemini-4-neon',
    badge: 'Paid Tier',
    description: 'Multi-step interactive specs, algorithmic design, and complex STEM workflows.',
    requiresPaidKey: true,
  },
];

export const CHATBOT_ROLES: ReadonlyArray<ChatbotRole> = [
  {
    id: 'architect',
    name: 'Solutions Architect',
    shortTitle: 'Architect',
    description: 'Designs distributed topologies, database schemas, and type-safe API contracts.',
    defaultTask: 'general',
    systemInstruction:
      'You are a Principal Solutions Architect at a senior software engineering studio. ' +
      'Provide concrete, production-ready architectural recommendations covering data flow, ' +
      'service boundaries, scalability, observability, and maintainability. Keep answers structured, ' +
      'technically rigorous, and practical.',
    starterPrompts: [
      'Design a multi-region event-driven architecture for a FinTech settlement ledger.',
      'Compare PostgreSQL partitioning vs read replicas for 50M daily telemetry events.',
      'Outline a zero-downtime migration plan from a monolith to modular services.',
    ],
  },
  {
    id: 'strategist',
    name: 'Product Strategist',
    shortTitle: 'Strategist',
    description: 'Shapes MVP scope, phased delivery roadmaps, and measurable KPIs.',
    defaultTask: 'fast',
    systemInstruction:
      'You are a Senior Digital Product Strategist. Help teams sharpen scope, ' +
      'sequence high-leverage MVP milestones, identify hidden delivery risks, and define ' +
      'clear operational KPIs. Respond with crisp priorities and actionable next steps.',
    starterPrompts: [
      'Break down an 8-week MVP roadmap for an AI-assisted B2B onboarding portal.',
      'What KPIs matter most in the first 90 days after launching an enterprise SaaS?',
      'Help me prioritize features for a fleet logistics mobile companion app.',
    ],
  },
  {
    id: 'reviewer',
    name: 'Security & Scale Reviewer',
    shortTitle: 'Reviewer',
    description: 'Audits failure modes, auth boundaries, latency bottlenecks, and resilience.',
    defaultTask: 'deep',
    systemInstruction:
      'You are a Staff Security & Reliability Engineer performing a rigorous design review. ' +
      'Surface edge cases, race conditions, OWASP threat vectors, single points of failure, ' +
      'and concrete mitigations with clear severity order.',
    starterPrompts: [
      'Audit common security risks in WebSocket-bridged real-time voice applications.',
      'Review our retry and idempotency strategy for webhook payment processing.',
      'Identify bottlenecks in a high-throughput RAG ingestion and retrieval pipeline.',
    ],
  },
  {
    id: 'concierge',
    name: 'Studio Delivery Partner',
    shortTitle: 'Partner',
    description: 'Guides project scoping, squad composition, timelines, and engagement fit.',
    defaultTask: 'general',
    systemInstruction:
      'You are a Senior Delivery Partner at Gollamudi Technology and Software (GTS). ' +
      'Help prospective clients clarify their software goals across custom software, web/mobile platforms, ' +
      'cloud DevOps, UI/UX design, and applied AI. Be transparent, concise, and consultative.',
    starterPrompts: [
      'What team pod structure do you recommend for a 12-week web + mobile build?',
      'How do you integrate applied AI copilots into existing enterprise workflows?',
      'Help me draft a concise project brief to share with your engineering desk.',
    ],
  },
];

export const LIVE_SYSTEM_INSTRUCTION =
  'You are GTS Voice, a real-time conversational software engineering partner for Gollamudi Technology and Software. ' +
  'Speak naturally, clearly, and concisely in plain spoken prose without markdown lists or code dumps ' +
  'unless asked for exact syntax. Help the user brainstorm architectures, refine product ideas, ' +
  'or troubleshoot technical challenges in real time.';

const SUPPORTED_AUDIO_MIME_TYPES = new Set([
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
]);

export function getChatTaskMode(taskId?: string): ChatTaskMode {
  return (
    CHAT_TASK_MODES.find((mode) => mode.id === taskId) ?? CHAT_TASK_MODES[0]
  );
}

export function getChatbotRole(roleId?: string): ChatbotRole {
  return CHATBOT_ROLES.find((role) => role.id === roleId) ?? CHATBOT_ROLES[0];
}

export function resolveChatConfig(roleId?: string, taskId?: string): {
  role: ChatbotRole;
  task: ChatTaskMode;
  model: GeminiChatModel;
  systemInstruction: string;
} {
  const role = getChatbotRole(roleId);
  const task = getChatTaskMode(taskId ?? role.defaultTask);
  return {
    role,
    task,
    model: task.model,
    systemInstruction: role.systemInstruction,
  };
}

export function buildChatHistoryPayload(
  messages: ReadonlyArray<{ role: 'user' | 'model'; text: string }>
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  return messages
    .map((m) => ({
      role: m.role,
      text: m.text.trim(),
    }))
    .filter((m) => m.text.length > 0)
    .map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
}

export function normalizeAudioMimeType(rawMimeType?: string): string | null {
  if (!rawMimeType) return null;
  const base = rawMimeType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (SUPPORTED_AUDIO_MIME_TYPES.has(base)) {
    return base === 'audio/x-wav' ? 'audio/wav' : base;
  }
  return null;
}

export function resolveLiveVoiceName(voice?: string): LiveVoiceName {
  const match = LIVE_VOICES.find((v) => v.name === voice);
  return match ? match.name : 'Zephyr';
}

function unwrapNestedErrorMessage(raw: string): string {
  let current = raw.trim();
  for (let depth = 0; depth < 3; depth++) {
    if (!current.startsWith('{')) break;
    try {
      const parsed = JSON.parse(current) as {
        message?: unknown;
        error?: { message?: unknown };
      };
      const next =
        typeof parsed?.error?.message === 'string'
          ? parsed.error.message
          : typeof parsed?.message === 'string'
            ? parsed.message
            : null;
      if (!next) break;
      current = next.trim();
    } catch {
      break;
    }
  }
  return current;
}

export function formatGeminiError(rawMessage: string, statusCode?: number): string {
  const cleanMessage = unwrapNestedErrorMessage(rawMessage);
  const upper = cleanMessage.toUpperCase();
  if (
    upper.includes('GEMINI_API_KEY') &&
    upper.includes('NOT CONFIGURED')
  ) {
    return 'Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets.';
  }
  if (
    statusCode === 403 ||
    upper.includes('PERMISSION_DENIED') ||
    upper.includes('API_KEY_INVALID') ||
    upper.includes('INVALID API KEY')
  ) {
    return 'Gemini API access was rejected (invalid or unauthorized key). Please check your API key in Settings > Secrets.';
  }
  if (statusCode === 429 || upper.includes('RESOURCE_EXHAUSTED') || upper.includes('QUOTA')) {
    return 'Quota or paid-tier access limit reached for this model. Switch to General (gemini-4-hydrogen) or Fast (gemini-3.1-flash-lite), or select a billing-enabled API key in Settings > Secrets.';
  }
  if (statusCode === 503 || upper.includes('UNAVAILABLE') || upper.includes('HIGH DEMAND')) {
    return 'This Gemini model is temporarily experiencing high demand. Please retry in a moment or switch to Fast Response (gemini-3.1-flash-lite).';
  }
  if (statusCode === 404 || upper.includes('NOT_FOUND')) {
    return 'Requested Gemini model was not found or is unavailable on this key.';
  }
  return cleanMessage || 'Unexpected error communicating with Gemini.';
}

export interface ParsedSseEvent {
  type: 'meta' | 'chunk' | 'done' | 'error';
  text?: string;
  model?: string;
  error?: string;
  status?: number;
}

export function parseSseEventLine(rawLine: string): ParsedSseEvent | null {
  const trimmedLine = rawLine.trim();
  if (!trimmedLine.startsWith('data:')) return null;
  const jsonStr = trimmedLine.slice(5).trim();
  if (!jsonStr || jsonStr === '[DONE]') return null;

  try {
    const parsed = JSON.parse(jsonStr) as Partial<ParsedSseEvent>;
    if (
      parsed &&
      (parsed.type === 'meta' ||
        parsed.type === 'chunk' ||
        parsed.type === 'done' ||
        parsed.type === 'error')
    ) {
      return parsed as ParsedSseEvent;
    }
    return null;
  } catch {
    return null;
  }
}

export async function readJsonResponseSafely<T extends Record<string, unknown>>(
  response: Pick<Response, 'ok' | 'status' | 'headers' | 'text'>
): Promise<{ ok: boolean; status: number; data: T | null; rawText: string }> {
  let rawText = '';
  try {
    rawText = await response.text();
  } catch {
    return { ok: response.ok, status: response.status, data: null, rawText: '' };
  }

  const trimmed = rawText.trim();
  if (!trimmed) {
    return { ok: response.ok, status: response.status, data: null, rawText: '' };
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as T;
      return { ok: response.ok, status: response.status, data: parsed, rawText: trimmed };
    } catch {
      return { ok: response.ok, status: response.status, data: null, rawText: trimmed };
    }
  }

  return { ok: response.ok, status: response.status, data: null, rawText: trimmed };
}

export function isMicrophoneUnavailableError(err: unknown): boolean {
  const message =
    err instanceof Error
      ? `${err.name} ${err.message}`
      : typeof err === 'string'
        ? err
        : '';
  const lower = message.toLowerCase();
  return (
    lower.includes('permission') ||
    lower.includes('notallowed') ||
    lower.includes('not allowed') ||
    lower.includes('notfound') ||
    lower.includes('not found') ||
    lower.includes('devicenotfound') ||
    lower.includes('device not found')
  );
}
