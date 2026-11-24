import 'dotenv/config';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  AUDIO_TRANSCRIBE_MODEL,
  LIVE_SYSTEM_INSTRUCTION,
  LIVE_VOICE_MODEL,
  buildChatHistoryPayload,
  formatGeminiError,
  getChatbotRole,
  normalizeAudioMimeType,
  resolveChatConfig,
  resolveLiveVoiceName,
} from './src/utils/aiStudio.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractStatusCode(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'status' in err) {
    const status = (err as { status?: unknown }).status;
    if (typeof status === 'number') return status;
  }
  return undefined;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Unknown Gemini API error';
}

function isTransient503(err: unknown): boolean {
  const status = extractStatusCode(err);
  const msg = extractErrorMessage(err).toUpperCase();
  return status === 503 || msg.includes('UNAVAILABLE') || msg.includes('HIGH DEMAND');
}

async function withTransientRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  isAborted?: () => boolean
): Promise<T> {
  let attempt = 0;
  while (true) {
    if (isAborted?.()) {
      throw new Error('Request aborted by client.');
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
  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=()');
    next();
  });

  app.use(express.json({ limit: '25mb' }));
  app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON request payload.' });
      return;
    }
    const status = extractStatusCode(err);
    if (status === 413) {
      res.status(413).json({ error: 'Request payload exceeds the 25MB limit.' });
      return;
    }
    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: 'Unexpected server request error.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      configured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    const body = req.body as {
      message?: unknown;
      history?: unknown;
      roleId?: unknown;
      taskId?: unknown;
    };

    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) {
      res.status(400).json({ error: 'Please enter a message before sending.' });
      return;
    }

    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const safeHistory = rawHistory
      .filter(
        (item): item is { role: 'user' | 'model'; text: string } =>
          typeof item === 'object' &&
          item !== null &&
          ((item as { role?: unknown }).role === 'user' ||
            (item as { role?: unknown }).role === 'model') &&
          typeof (item as { text?: unknown }).text === 'string'
      )
      .slice(-40);

    const roleId = typeof body?.roleId === 'string' ? body.roleId : undefined;
    const taskId = typeof body?.taskId === 'string' ? body.taskId : undefined;
    const resolved = resolveChatConfig(roleId, taskId);

    let ai: GoogleGenAI;
    try {
      ai = createGeminiClient();
    } catch (err) {
      res.status(503).json({ error: formatGeminiError(extractErrorMessage(err), 503) });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let clientAborted = false;
    res.on('close', () => {
      if (!res.writableEnded) {
        clientAborted = true;
      }
    });

    const sendEvent = (payload: Record<string, unknown>) => {
      if (!res.writableEnded && !clientAborted) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    try {
      const chat = ai.chats.create({
        model: resolved.model,
        history: buildChatHistoryPayload(safeHistory),
        config: {
          systemInstruction: resolved.systemInstruction,
        },
      });

      sendEvent({
        type: 'meta',
        model: resolved.model,
        roleId: resolved.role.id,
        taskId: resolved.task.id,
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
          sendEvent({ type: 'chunk', text });
        }
      }

      if (!clientAborted) {
        sendEvent({ type: 'done', model: resolved.model });
        res.end();
      }
    } catch (err) {
      if (clientAborted) {
        if (!res.writableEnded) res.end();
        return;
      }
      const status = extractStatusCode(err);
      const friendlyError = formatGeminiError(extractErrorMessage(err), status);
      sendEvent({ type: 'error', error: friendlyError, status: status ?? 500 });
      if (!res.writableEnded) res.end();
    }
  });

  app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
    const body = req.body as {
      audioBase64?: unknown;
      mimeType?: unknown;
      prompt?: unknown;
    };

    const audioBase64 =
      typeof body?.audioBase64 === 'string' ? body.audioBase64.trim() : '';
    const cleanMime = normalizeAudioMimeType(
      typeof body?.mimeType === 'string' ? body.mimeType : undefined
    );

    if (!audioBase64) {
      res.status(400).json({ error: 'No audio payload received for transcription.' });
      return;
    }

    if (!cleanMime) {
      res.status(400).json({
        error: 'Unsupported audio format. Please record via microphone or upload MP3, WAV, WebM, M4A, or OGG audio.',
      });
      return;
    }

    let ai: GoogleGenAI;
    try {
      ai = createGeminiClient();
    } catch (err) {
      res.status(503).json({ error: formatGeminiError(extractErrorMessage(err), 503) });
      return;
    }

    const promptText =
      typeof body?.prompt === 'string' && body.prompt.trim().length > 0
        ? body.prompt.trim()
        : 'Transcribe this audio accurately. Return the verbatim spoken transcript with natural punctuation.';

    try {
      const response = await withTransientRetry(() =>
        ai.models.generateContent({
          model: AUDIO_TRANSCRIBE_MODEL,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: audioBase64,
                },
              },
              { text: promptText },
            ],
          },
        })
      );

      const transcript = (response.text ?? '').trim();
      res.json({
        transcript,
        model: AUDIO_TRANSCRIBE_MODEL,
      });
    } catch (err) {
      const status = extractStatusCode(err);
      res.status(status && status >= 400 ? status : 500).json({
        error: formatGeminiError(extractErrorMessage(err), status),
      });
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  const distPath = path.resolve(__dirname, 'dist');
  const isCompiledServer = path.basename(__filename) === 'server.js';
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (isCompiledServer && fs.existsSync(distPath));

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    app.get('*', (_req: Request, res: Response) => {
      res
        .status(503)
        .send('Production build missing. Run "npm run build" before starting the production server.');
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  wss.on('error', (err) => {
    console.error('WebSocketServer error:', err);
  });

  server.on('upgrade', (request, socket, head) => {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    if (requestUrl.pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (clientWs: WebSocket, request: http.IncomingMessage) => {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const voiceName = resolveLiveVoiceName(requestUrl.searchParams.get('voice') ?? undefined);
    const roleParam = requestUrl.searchParams.get('role') ?? undefined;
    const role = roleParam ? getChatbotRole(roleParam) : null;

    const sendToClient = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    let ai: GoogleGenAI;
    try {
      ai = createGeminiClient();
    } catch (err) {
      sendToClient({
        type: 'error',
        message: formatGeminiError(extractErrorMessage(err), 503),
      });
      clientWs.close();
      return;
    }

    let closed = false;
    let hadError = false;
    const closeClientSafely = () => {
      if (
        clientWs.readyState === clientWs.OPEN ||
        clientWs.readyState === clientWs.CONNECTING
      ) {
        clientWs.close();
      }
    };

    const systemInstruction = role
      ? `${LIVE_SYSTEM_INSTRUCTION} Focus persona: ${role.name} — ${role.description}`
      : LIVE_SYSTEM_INSTRUCTION;

    const sessionPromise = ai.live.connect({
      model: LIVE_VOICE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction,
      },
      callbacks: {
        onopen: () => {
          sendToClient({
            type: 'ready',
            model: LIVE_VOICE_MODEL,
            voice: voiceName,
          });
        },
        onmessage: (message: LiveServerMessage) => {
          const content = message.serverContent;
          if (content?.inputTranscription?.text) {
            sendToClient({
              type: 'inputTranscript',
              text: content.inputTranscription.text,
            });
          }
          if (content?.outputTranscription?.text) {
            sendToClient({
              type: 'outputTranscript',
              text: content.outputTranscription.text,
            });
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              sendToClient({
                type: 'audio',
                data: part.inlineData.data,
              });
            }
          }
          if (content?.interrupted) {
            sendToClient({ type: 'interrupted' });
          }
          if (content?.turnComplete) {
            sendToClient({ type: 'turnComplete' });
          }
        },
        onerror: (err: unknown) => {
          hadError = true;
          sendToClient({
            type: 'error',
            message: formatGeminiError(extractErrorMessage(err), extractStatusCode(err)),
          });
        },
        onclose: () => {
          if (!closed) {
            if (!hadError) {
              sendToClient({ type: 'closed' });
            }
            closeClientSafely();
          }
        },
      },
    });

    sessionPromise.catch((err: unknown) => {
      hadError = true;
      sendToClient({
        type: 'error',
        message: formatGeminiError(extractErrorMessage(err), extractStatusCode(err)),
      });
      closeClientSafely();
    });

    clientWs.on('message', (rawData) => {
      let parsed: { type?: string; data?: string; text?: string };
      try {
        parsed = JSON.parse(rawData.toString()) as { type?: string; data?: string; text?: string };
      } catch {
        return;
      }

      sessionPromise
        .then((session) => {
          if (closed) return;
          if (parsed.type === 'audio' && typeof parsed.data === 'string' && parsed.data.length > 0) {
            session.sendRealtimeInput({
              audio: {
                data: parsed.data,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          } else if (parsed.type === 'text' && typeof parsed.text === 'string' && parsed.text.trim()) {
            session.sendRealtimeInput({
              text: parsed.text.trim(),
            });
          }
        })
        .catch(() => {
          // Connection error already forwarded by sessionPromise.catch
        });
    });

    clientWs.on('error', () => {
      closed = true;
    });

    clientWs.on('close', () => {
      closed = true;
      sessionPromise
        .then((session) => {
          session.close();
        })
        .catch(() => {
          // Ignore teardown errors
        });
    });
  });

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
