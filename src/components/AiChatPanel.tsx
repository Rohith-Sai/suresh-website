import {
  AlertCircle,
  Check,
  Copy,
  CornerDownLeft,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  CHATBOT_ROLES,
  CHAT_TASK_MODES,
  type ChatTaskId,
  type ChatTurnMessage,
  type ChatbotRoleId,
  getChatTaskMode,
  getChatbotRole,
  parseSseEventLine,
  readJsonResponseSafely,
} from '../utils/aiStudio';

interface AiChatPanelProps {
  importedTranscript: string;
  onConsumeImportedTranscript: () => void;
}

export function AiChatPanel({
  importedTranscript,
  onConsumeImportedTranscript,
}: AiChatPanelProps) {
  const [roleId, setRoleId] = useState<ChatbotRoleId>('architect');
  const [taskId, setTaskId] = useState<ChatTaskId>('general');
  const [messages, setMessages] = useState<ChatTurnMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const threadContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const activeRole = getChatbotRole(roleId);
  const activeTask = getChatTaskMode(taskId);

  useEffect(() => {
    if (importedTranscript.trim()) {
      setInput((prev) =>
        prev.trim()
          ? `${prev}\n\nTranscribed audio note:\n"${importedTranscript.trim()}"`
          : `Analyze and respond to this transcribed audio:\n"${importedTranscript.trim()}"`
      );
      onConsumeImportedTranscript();
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [importedTranscript, onConsumeImportedTranscript]);

  useEffect(() => {
    if (messages.length === 0) return;
    const container = threadContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
    };
  }, []);

  const handleRoleChange = (nextRoleId: ChatbotRoleId) => {
    setRoleId(nextRoleId);
    setErrorMessage(null);
  };

  const handleClearThread = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages([]);
    setErrorMessage(null);
  };

  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (!isMountedRef.current) return;
      setCopiedId(id);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          setCopiedId((curr) => (curr === id ? null : curr));
        }
        copyTimerRef.current = null;
      }, 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  const sendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isStreaming) return;

    setErrorMessage(null);
    const nowLabel = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatTurnMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowLabel,
    };

    const assistantId = `m-${Date.now() + 1}`;
    const placeholderAssistant: ChatTurnMessage = {
      id: assistantId,
      role: 'model',
      text: '',
      model: activeTask.model,
      timestamp: nowLabel,
    };

    const historyPayload = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg, placeholderAssistant]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          roleId,
          taskId,
        }),
        signal: controller.signal,
      });

      const contentType = response.headers.get('content-type') ?? '';
      if (!response.ok || contentType.includes('application/json')) {
        const parsed = await readJsonResponseSafely<{ error?: string }>(response);
        throw new Error(parsed.data?.error ?? `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Streaming response body is unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!isMountedRef.current) return;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const event = parseSseEventLine(line);
          if (!event) continue;

          if (event.type === 'chunk' && event.text) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, text: m.text + event.text } : m
              )
            );
          } else if (event.type === 'error') {
            throw new Error(event.error ?? 'Gemini streaming error.');
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError' || !isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Unable to complete Gemini chat turn.';
      setErrorMessage(msg);
      setMessages((prev) => prev.filter((m) => !(m.id === assistantId && m.text === '')));
    } finally {
      if (isMountedRef.current) {
        setIsStreaming(false);
      }
      abortRef.current = null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-12">
      {/* Left Configuration Column: Role System Instruction + Task/Model Router */}
      <aside className="space-y-5 lg:col-span-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[#FF6B73] uppercase">
            <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span>System Instruction Role</span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CHATBOT_ROLES.map((role) => {
              const selected = role.id === roleId;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleChange(role.id)}
                  aria-pressed={selected}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-[#E8202A]/75 bg-[#2F3A4F]/90 text-white'
                      : 'border-white/10 bg-[#1D2536]/60 text-slate-300 hover:border-white/25 hover:bg-[#2F3A4F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold">{role.name}</span>
                    {selected && (
                      <span className="font-mono text-[9px] tracking-wider text-[#FF8A90] uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-400">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-[#FF6B73] uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Task &amp; Model Routing</span>
          </div>
          <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CHAT_TASK_MODES.map((mode) => {
              const selected = mode.id === taskId;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setTaskId(mode.id);
                    setErrorMessage(null);
                  }}
                  aria-pressed={selected}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'border-[#E8202A]/80 bg-[#2F3A4F]/90 text-white'
                      : 'border-white/10 bg-[#1D2536]/60 text-slate-300 hover:border-white/25 hover:bg-[#2F3A4F]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-semibold">{mode.label}</span>
                    <span
                      className={`shrink-0 font-mono text-[9px] tracking-wider uppercase ${
                        mode.requiresPaidKey ? 'text-amber-300' : 'text-[#FF8A90]'
                      }`}
                    >
                      {mode.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                    {mode.model}
                  </p>
                </button>
              );
            })}
          </div>
          {activeTask.requiresPaidKey && (
            <p className="mt-2.5 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
              <strong className="font-semibold">{activeTask.model}</strong> requires a
              billing-enabled API key in Settings &gt; Secrets. Switch to{' '}
              <button
                type="button"
                onClick={() => setTaskId('general')}
                className="underline decoration-amber-300 underline-offset-2 hover:text-white"
              >
                General Tasks (gemini-4-hydrogen)
              </button>{' '}
              for free-tier usage.
            </p>
          )}
        </div>
      </aside>

      {/* Right Scrollable Multi-Turn Conversation Thread & Composer */}
      <div className="flex flex-col rounded-2xl border border-white/12 bg-[#1D2536]/90 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-white">{activeRole.name}</p>
            <p className="font-mono text-[11px] text-slate-400">
              Model: {activeTask.model} · {messages.length} turn
              {messages.length === 1 ? '' : 's'} in context
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearThread}
            disabled={messages.length === 0 && !isStreaming}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Clear Thread
          </button>
        </div>

        {/* Scrollable Message Thread */}
        <div
          ref={threadContainerRef}
          role="log"
          aria-live="polite"
          aria-label="Gemini conversation history"
          className="h-[380px] space-y-4 overflow-y-auto px-5 py-5 sm:h-[430px]"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col justify-between">
              <div className="rounded-xl border border-white/10 bg-[#111722]/70 p-4">
                <p className="font-mono text-[11px] tracking-[0.12em] text-[#FF6B73] uppercase">
                  Active System Instruction
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {activeRole.systemInstruction}
                </p>
              </div>

              <div className="mt-4">
                <p className="font-mono text-[11px] tracking-[0.12em] text-slate-400 uppercase">
                  Suggested Prompts
                </p>
                <div className="mt-2.5 grid gap-2">
                  {activeRole.starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="rounded-xl border border-white/10 bg-[#2F3A4F]/55 px-3.5 py-2.5 text-left text-xs leading-relaxed text-slate-200 transition-colors hover:border-[#E8202A]/70 hover:bg-[#2F3A4F]"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="mb-1 flex items-center gap-2 font-mono text-[10px] tracking-wider text-slate-400 uppercase">
                    <span>{isUser ? 'You' : activeRole.shortTitle}</span>
                    {!isUser && msg.model && (
                      <span className="text-[#FF8A90]">· {msg.model}</span>
                    )}
                    <span>· {msg.timestamp}</span>
                  </div>
                  <div
                    className={`group relative max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-[#E8202A] text-white'
                        : 'border border-white/10 bg-[#111722]/90 text-slate-100'
                    }`}
                  >
                    {msg.text || (
                      <span className="inline-flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF6B73]" />
                        Generating response...
                      </span>
                    )}
                    {!isUser && msg.text && (
                      <button
                        type="button"
                        onClick={() => void handleCopyMessage(msg.id, msg.text)}
                        aria-label="Copy assistant response"
                        className="mt-2 inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-300 transition-colors hover:bg-white/15 hover:text-white"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" aria-hidden="true" />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Inline Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="mx-5 mb-3 flex items-start justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
            {activeTask.requiresPaidKey ? (
              <button
                type="button"
                onClick={() => {
                  setTaskId('general');
                  setErrorMessage(null);
                }}
                className="shrink-0 rounded-md border border-rose-300/30 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
              >
                Use General Model
              </button>
            ) : taskId !== 'fast' ? (
              <button
                type="button"
                onClick={() => {
                  setTaskId('fast');
                  setErrorMessage(null);
                }}
                className="shrink-0 rounded-md border border-rose-300/30 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/20"
              >
                Try Fast Model
              </button>
            ) : null}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
          <label htmlFor="gemini-chat-input" className="sr-only">
            Message Gemini {activeRole.name}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <textarea
              id="gemini-chat-input"
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${activeRole.name} (${activeTask.model})...`}
              className="w-full resize-none rounded-xl border border-white/15 bg-[#111722] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#E8202A] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{isStreaming ? 'Streaming...' : 'Send'}</span>
              <CornerDownLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
