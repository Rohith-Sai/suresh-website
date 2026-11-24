// server.ts
import "dotenv/config";
import { GoogleGenAI, Modality } from "@google/genai";
import express from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";

// src/utils/aiStudio.ts
var LIVE_VOICE_MODEL = "gemini-3.8-live";
var AUDIO_TRANSCRIBE_MODEL = "gemini-3.5-transcribe";
var LIVE_VOICES = [
  { name: "Zephyr", tone: "Crisp & analytical studio voice" },
  { name: "Kore", tone: "Warm, articulate engineering partner" },
  { name: "Puck", tone: "Energetic & concise collaborator" },
  { name: "Charon", tone: "Measured, authoritative systems tone" },
  { name: "Fenrir", tone: "Direct technical briefing cadence" }
];
var CHAT_TASK_MODES = [
  {
    id: "general",
    label: "General Tasks",
    model: "gemini-4-hydrogen",
    badge: "Balanced",
    description: "General engineering guidance, API design, and balanced product Q&A.",
    requiresPaidKey: false
  },
  {
    id: "fast",
    label: "Fast Response",
    model: "gemini-3.1-flash-lite",
    badge: "Low Latency",
    description: "Rapid triage, concise summaries, and instant checklist generation.",
    requiresPaidKey: false
  },
  {
    id: "deep",
    label: "Deep Reasoning",
    model: "gemini-4-carbon",
    badge: "Paid Tier",
    description: "Deep root-cause debugging, distributed architecture, and security audits.",
    requiresPaidKey: true
  },
  {
    id: "interactive",
    label: "Complex Interactive",
    model: "gemini-4-neon",
    badge: "Paid Tier",
    description: "Multi-step interactive specs, algorithmic design, and complex STEM workflows.",
    requiresPaidKey: true
  }
];
var CHATBOT_ROLES = [
  {
    id: "architect",
    name: "Solutions Architect",
    shortTitle: "Architect",
    description: "Designs distributed topologies, database schemas, and type-safe API contracts.",
    defaultTask: "general",
    systemInstruction: "You are a Principal Solutions Architect at a senior software engineering studio. Provide concrete, production-ready architectural recommendations covering data flow, service boundaries, scalability, observability, and maintainability. Keep answers structured, technically rigorous, and practical.",
    starterPrompts: [
      "Design a multi-region event-driven architecture for a FinTech settlement ledger.",
      "Compare PostgreSQL partitioning vs read replicas for 50M daily telemetry events.",
      "Outline a zero-downtime migration plan from a monolith to modular services."
    ]
  },
  {
    id: "strategist",
    name: "Product Strategist",
    shortTitle: "Strategist",
    description: "Shapes MVP scope, phased delivery roadmaps, and measurable KPIs.",
    defaultTask: "fast",
    systemInstruction: "You are a Senior Digital Product Strategist. Help teams sharpen scope, sequence high-leverage MVP milestones, identify hidden delivery risks, and define clear operational KPIs. Respond with crisp priorities and actionable next steps.",
    starterPrompts: [
      "Break down an 8-week MVP roadmap for an AI-assisted B2B onboarding portal.",
      "What KPIs matter most in the first 90 days after launching an enterprise SaaS?",
      "Help me prioritize features for a fleet logistics mobile companion app."
    ]
  },
  {
    id: "reviewer",
    name: "Security & Scale Reviewer",
    shortTitle: "Reviewer",
    description: "Audits failure modes, auth boundaries, latency bottlenecks, and resilience.",
    defaultTask: "deep",
    systemInstruction: "You are a Staff Security & Reliability Engineer performing a rigorous design review. Surface edge cases, race conditions, OWASP threat vectors, single points of failure, and concrete mitigations with clear severity order.",
    starterPrompts: [
      "Audit common security risks in WebSocket-bridged real-time voice applications.",
      "Review our retry and idempotency strategy for webhook payment processing.",
      "Identify bottlenecks in a high-throughput RAG ingestion and retrieval pipeline."
    ]
  },
  {
    id: "concierge",
    name: "Studio Delivery Partner",
    shortTitle: "Partner",
    description: "Guides project scoping, squad composition, timelines, and engagement fit.",
    defaultTask: "general",
    systemInstruction: "You are a Senior Delivery Partner at Gollamudi Technology and Software (GTS). Help prospective clients clarify their software goals across custom software, web/mobile platforms, cloud DevOps, UI/UX design, and applied AI. Be transparent, concise, and consultative.",
    starterPrompts: [
      "What team pod structure do you recommend for a 12-week web + mobile build?",
      "How do you integrate applied AI copilots into existing enterprise workflows?",
      "Help me draft a concise project brief to share with your engineering desk."
    ]
  }
];
var LIVE_SYSTEM_INSTRUCTION = "You are GTS Voice, a real-time conversational software engineering partner for Gollamudi Technology and Software. Speak naturally, clearly, and concisely in plain spoken prose without markdown lists or code dumps unless asked for exact syntax. Help the user brainstorm architectures, refine product ideas, or troubleshoot technical challenges in real time.";
var SUPPORTED_AUDIO_MIME_TYPES = /* @__PURE__ */ new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac"
]);
function getChatTaskMode(taskId) {
  return CHAT_TASK_MODES.find((mode) => mode.id === taskId) ?? CHAT_TASK_MODES[0];
}
function getChatbotRole(roleId) {
  return CHATBOT_ROLES.find((role) => role.id === roleId) ?? CHATBOT_ROLES[0];
}
function resolveChatConfig(roleId, taskId) {
  const role = getChatbotRole(roleId);
  const task = getChatTaskMode(taskId ?? role.defaultTask);
  return {
    role,
    task,
    model: task.model,
    systemInstruction: role.systemInstruction
  };
}
function buildChatHistoryPayload(messages) {
  return messages.map((m) => ({
    role: m.role,
    text: m.text.trim()
  })).filter((m) => m.text.length > 0).map((m) => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
}
function normalizeAudioMimeType(rawMimeType) {
  if (!rawMimeType) return null;
  const base = rawMimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (SUPPORTED_AUDIO_MIME_TYPES.has(base)) {
    return base === "audio/x-wav" ? "audio/wav" : base;
  }
  return null;
}
function resolveLiveVoiceName(voice) {
  const match = LIVE_VOICES.find((v) => v.name === voice);
  return match ? match.name : "Zephyr";
}
function unwrapNestedErrorMessage(raw) {
  let current = raw.trim();
  for (let depth = 0; depth < 3; depth++) {
    if (!current.startsWith("{")) break;
    try {
      const parsed = JSON.parse(current);
      const next = typeof parsed?.error?.message === "string" ? parsed.error.message : typeof parsed?.message === "string" ? parsed.message : null;
      if (!next) break;
      current = next.trim();
    } catch {
      break;
    }
  }
  return current;
}
function formatGeminiError(rawMessage, statusCode) {
  const cleanMessage = unwrapNestedErrorMessage(rawMessage);
  const upper = cleanMessage.toUpperCase();
  if (upper.includes("GEMINI_API_KEY") && upper.includes("NOT CONFIGURED")) {
    return "Gemini API key is not configured. Add GEMINI_API_KEY in Settings > Secrets.";
  }
  if (statusCode === 403 || upper.includes("PERMISSION_DENIED") || upper.includes("API_KEY_INVALID") || upper.includes("INVALID API KEY")) {
    return "Gemini API access was rejected (invalid or unauthorized key). Please check your API key in Settings > Secrets.";
  }
  if (statusCode === 429 || upper.includes("RESOURCE_EXHAUSTED") || upper.includes("QUOTA")) {
    return "Quota or paid-tier access limit reached for this model. Switch to General (gemini-4-hydrogen) or Fast (gemini-3.1-flash-lite), or select a billing-enabled API key in Settings > Secrets.";
  }
  if (statusCode === 503 || upper.includes("UNAVAILABLE") || upper.includes("HIGH DEMAND")) {
    return "This Gemini model is temporarily experiencing high demand. Please retry in a moment or switch to Fast Response (gemini-3.1-flash-lite).";
  }
  if (statusCode === 404 || upper.includes("NOT_FOUND")) {
    return "Requested Gemini model was not found or is unavailable on this key.";
  }
  return cleanMessage || "Unexpected error communicating with Gemini.";
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function extractStatusCode(err) {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = err.status;
    if (typeof status === "number") return status;
  }
  return void 0;
}
function extractErrorMessage(err) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown Gemini API error";
}
function isTransient503(err) {
  const status = extractStatusCode(err);
  const msg = extractErrorMessage(err).toUpperCase();
  return status === 503 || msg.includes("UNAVAILABLE") || msg.includes("HIGH DEMAND");
}
async function withTransientRetry(fn, maxRetries = 2, isAborted) {
  let attempt = 0;
  while (true) {
    if (isAborted?.()) {
      throw new Error("Request aborted by client.");
    }
    try {
      return await fn();
    } catch (err) {
      if (isAborted?.() || attempt >= maxRetries || !isTransient503(err)) {
        throw err;
      }
      const delayMs = 350 * 2 ** attempt;
      attempt += 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
async function startServer() {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Permissions-Policy", "camera=(), geolocation=()");
    next();
  });
  app.use(express.json({ limit: "25mb" }));
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
      res.status(400).json({ error: "Invalid JSON request payload." });
      return;
    }
    const status = extractStatusCode(err);
    if (status === 413) {
      res.status(413).json({ error: "Request payload exceeds the 25MB limit." });
      return;
    }
    if (req.path.startsWith("/api/")) {
      res.status(500).json({ error: "Unexpected server request error." });
      return;
    }
    next(err);
  });
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      configured: Boolean(process.env.GEMINI_API_KEY?.trim())
    });
  });
  app.post("/api/gemini/chat", async (req, res) => {
    const body = req.body;
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) {
      res.status(400).json({ error: "Please enter a message before sending." });
      return;
    }
    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const safeHistory = rawHistory.filter(
      (item) => typeof item === "object" && item !== null && (item.role === "user" || item.role === "model") && typeof item.text === "string"
    ).slice(-40);
    const roleId = typeof body?.roleId === "string" ? body.roleId : void 0;
    const taskId = typeof body?.taskId === "string" ? body.taskId : void 0;
    const resolved = resolveChatConfig(roleId, taskId);
    let ai;
    try {
      ai = createGeminiClient();
    } catch (err) {
      res.status(503).json({ error: formatGeminiError(extractErrorMessage(err), 503) });
      return;
    }
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    let clientAborted = false;
    res.on("close", () => {
      if (!res.writableEnded) {
        clientAborted = true;
      }
    });
    const sendEvent = (payload) => {
      if (!res.writableEnded && !clientAborted) {
        res.write(`data: ${JSON.stringify(payload)}

`);
      }
    };
    try {
      const chat = ai.chats.create({
        model: resolved.model,
        history: buildChatHistoryPayload(safeHistory),
        config: {
          systemInstruction: resolved.systemInstruction
        }
      });
      sendEvent({
        type: "meta",
        model: resolved.model,
        roleId: resolved.role.id,
        taskId: resolved.task.id
      });
      const streamResponse = await withTransientRetry(
        () => chat.sendMessageStream({ message }),
        1,
        () => clientAborted
      );
      for await (const chunk of streamResponse) {
        if (clientAborted) break;
        const text = chunk.text;
        if (text) {
          sendEvent({ type: "chunk", text });
        }
      }
      if (!clientAborted) {
        sendEvent({ type: "done", model: resolved.model });
        res.end();
      }
    } catch (err) {
      if (clientAborted) {
        if (!res.writableEnded) res.end();
        return;
      }
      const status = extractStatusCode(err);
      const friendlyError = formatGeminiError(extractErrorMessage(err), status);
      sendEvent({ type: "error", error: friendlyError, status: status ?? 500 });
      if (!res.writableEnded) res.end();
    }
  });
  app.post("/api/gemini/transcribe", async (req, res) => {
    const body = req.body;
    const audioBase64 = typeof body?.audioBase64 === "string" ? body.audioBase64.trim() : "";
    const cleanMime = normalizeAudioMimeType(
      typeof body?.mimeType === "string" ? body.mimeType : void 0
    );
    if (!audioBase64) {
      res.status(400).json({ error: "No audio payload received for transcription." });
      return;
    }
    if (!cleanMime) {
      res.status(400).json({
        error: "Unsupported audio format. Please record via microphone or upload MP3, WAV, WebM, M4A, or OGG audio."
      });
      return;
    }
    let ai;
    try {
      ai = createGeminiClient();
    } catch (err) {
      res.status(503).json({ error: formatGeminiError(extractErrorMessage(err), 503) });
      return;
    }
    const promptText = typeof body?.prompt === "string" && body.prompt.trim().length > 0 ? body.prompt.trim() : "Transcribe this audio accurately. Return the verbatim spoken transcript with natural punctuation.";
    try {
      const response = await withTransientRetry(
        () => ai.models.generateContent({
          model: AUDIO_TRANSCRIBE_MODEL,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: audioBase64
                }
              },
              { text: promptText }
            ]
          }
        })
      );
      const transcript = (response.text ?? "").trim();
      res.json({
        transcript,
        model: AUDIO_TRANSCRIBE_MODEL
      });
    } catch (err) {
      const status = extractStatusCode(err);
      res.status(status && status >= 400 ? status : 500).json({
        error: formatGeminiError(extractErrorMessage(err), status)
      });
    }
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });
  const distPath = path.resolve(__dirname, "dist");
  const isCompiledServer = path.basename(__filename) === "server.js";
  const isProd = process.env.NODE_ENV === "production" || isCompiledServer && fs.existsSync(distPath);
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("*", (_req, res) => {
      res.status(503).send('Production build missing. Run "npm run build" before starting the production server.');
    });
  }
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  wss.on("error", (err) => {
    console.error("WebSocketServer error:", err);
  });
  server.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (requestUrl.pathname === "/api/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });
  wss.on("connection", (clientWs, request) => {
    const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const voiceName = resolveLiveVoiceName(requestUrl.searchParams.get("voice") ?? void 0);
    const roleParam = requestUrl.searchParams.get("role") ?? void 0;
    const role = roleParam ? getChatbotRole(roleParam) : null;
    const sendToClient = (payload) => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };
    let ai;
    try {
      ai = createGeminiClient();
    } catch (err) {
      sendToClient({
        type: "error",
        message: formatGeminiError(extractErrorMessage(err), 503)
      });
      clientWs.close();
      return;
    }
    let closed = false;
    let hadError = false;
    const closeClientSafely = () => {
      if (clientWs.readyState === clientWs.OPEN || clientWs.readyState === clientWs.CONNECTING) {
        clientWs.close();
      }
    };
    const systemInstruction = role ? `${LIVE_SYSTEM_INSTRUCTION} Focus persona: ${role.name} \u2014 ${role.description}` : LIVE_SYSTEM_INSTRUCTION;
    const sessionPromise = ai.live.connect({
      model: LIVE_VOICE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName }
          }
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction
      },
      callbacks: {
        onopen: () => {
          sendToClient({
            type: "ready",
            model: LIVE_VOICE_MODEL,
            voice: voiceName
          });
        },
        onmessage: (message) => {
          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            sendToClient({
              type: "inputTranscript",
              text: content.inputTranscription.text
            });
          }
          if (content?.outputTranscription?.text) {
            sendToClient({
              type: "outputTranscript",
              text: content.outputTranscription.text
            });
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              sendToClient({
                type: "audio",
                data: part.inlineData.data
              });
            }
          }
          if (content?.interrupted) {
            sendToClient({ type: "interrupted" });
          }
          if (content?.turnComplete) {
            sendToClient({ type: "turnComplete" });
          }
        },
        onerror: (err) => {
          hadError = true;
          sendToClient({
            type: "error",
            message: formatGeminiError(extractErrorMessage(err), extractStatusCode(err))
          });
        },
        onclose: () => {
          if (!closed) {
            if (!hadError) {
              sendToClient({ type: "closed" });
            }
            closeClientSafely();
          }
        }
      }
    });
    sessionPromise.catch((err) => {
      hadError = true;
      sendToClient({
        type: "error",
        message: formatGeminiError(extractErrorMessage(err), extractStatusCode(err))
      });
      closeClientSafely();
    });
    clientWs.on("message", (rawData) => {
      let parsed;
      try {
        parsed = JSON.parse(rawData.toString());
      } catch {
        return;
      }
      sessionPromise.then((session) => {
        if (closed) return;
        if (parsed.type === "audio" && typeof parsed.data === "string" && parsed.data.length > 0) {
          session.sendRealtimeInput({
            audio: {
              data: parsed.data,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        } else if (parsed.type === "text" && typeof parsed.text === "string" && parsed.text.trim()) {
          session.sendRealtimeInput({
            text: parsed.text.trim()
          });
        }
      }).catch(() => {
      });
    });
    clientWs.on("error", () => {
      closed = true;
    });
    clientWs.on("close", () => {
      closed = true;
      sessionPromise.then((session) => {
        session.close();
      }).catch(() => {
      });
    });
  });
  const port = Number(process.env.PORT) || 3e3;
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
