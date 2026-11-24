import {
  AlertCircle,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Volume2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  CHATBOT_ROLES,
  LIVE_VOICES,
  LIVE_VOICE_MODEL,
  type ChatbotRoleId,
  type LiveVoiceName,
  isMicrophoneUnavailableError,
} from '../utils/aiStudio';
import {
  base64ToInt16,
  computeRmsLevel,
  downsampleFloat32,
  float32ToInt16Pcm,
  int16ToBase64,
  int16ToFloat32,
} from '../utils/audioPcm';

type LiveSessionStatus = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';

interface TranscriptEntry {
  id: string;
  speaker: 'you' | 'model';
  text: string;
}

export function LiveVoicePanel() {
  const [status, setStatus] = useState<LiveSessionStatus>('idle');
  const [voice, setVoice] = useState<LiveVoiceName>('Zephyr');
  const [roleId, setRoleId] = useState<ChatbotRoleId>('architect');
  const [isMuted, setIsMuted] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [textTurn, setTextTurn] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMutedRef = useRef(false);
  const isMountedRef = useRef(true);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (transcripts.length === 0) return;
    const container = transcriptContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [transcripts]);

  const stopPlaybackQueue = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // Ignore already stopped source
      }
    }
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  };

  const cleanupSession = () => {
    stopPlaybackQueue();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      void inputCtxRef.current.close();
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      void outputCtxRef.current.close();
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    }

    if (isMountedRef.current) {
      setMicLevel(0);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSession();
    };
  }, []);

  const appendTranscript = (speaker: 'you' | 'model', chunk: string) => {
    const clean = chunk;
    if (!clean) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text}${last.text.endsWith(' ') || clean.startsWith(' ') ? '' : ' '}${clean}` },
        ];
      }
      return [
        ...prev,
        {
          id: `${speaker}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          speaker,
          text: clean.trimStart(),
        },
      ];
    });
  };

  const playPcmChunk = (base64Audio: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    let int16: Int16Array;
    try {
      int16 = base64ToInt16(base64Audio);
    } catch {
      return;
    }
    if (int16.length === 0) return;

    const float32 = int16ToFloat32(int16);
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;
    activeSourcesRef.current.add(source);
    if (isMountedRef.current) {
      setStatus('speaking');
    }

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (isMountedRef.current && activeSourcesRef.current.size === 0) {
        setStatus((curr) => (curr === 'speaking' ? 'listening' : curr));
      }
    };
  };

  const startLiveSession = async () => {
    if (status === 'connecting' || status === 'listening' || status === 'speaking') {
      return;
    }

    setErrorMessage(null);
    setStatus('connecting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Microphone capture is not supported in this browser environment.');
      setStatus('error');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      if (!isMountedRef.current) {
        for (const track of mediaStream.getTracks()) track.stop();
        return;
      }
      streamRef.current = mediaStream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume().catch(() => {});
      }
      if (outputCtx.state === 'suspended') {
        await outputCtx.resume().catch(() => {});
      }
      if (!isMountedRef.current) {
        void inputCtx.close();
        void outputCtx.close();
        for (const track of mediaStream.getTracks()) track.stop();
        return;
      }
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/api/live?voice=${encodeURIComponent(
        voice
      )}&role=${encodeURIComponent(roleId)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        let msg: {
          type:
            | 'ready'
            | 'audio'
            | 'inputTranscript'
            | 'outputTranscript'
            | 'interrupted'
            | 'turnComplete'
            | 'error'
            | 'closed';
          data?: string;
          text?: string;
          message?: string;
        };
        try {
          msg = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (msg.type === 'ready') {
          setStatus('listening');
        } else if (msg.type === 'audio' && msg.data) {
          playPcmChunk(msg.data);
        } else if (msg.type === 'inputTranscript' && msg.text) {
          appendTranscript('you', msg.text);
        } else if (msg.type === 'outputTranscript' && msg.text) {
          appendTranscript('model', msg.text);
        } else if (msg.type === 'interrupted') {
          stopPlaybackQueue();
          setStatus('listening');
        } else if (msg.type === 'error') {
          setErrorMessage(msg.message ?? 'Live API connection encountered an error.');
          cleanupSession();
          setStatus('error');
        } else if (msg.type === 'closed') {
          cleanupSession();
          setStatus((curr) => (curr === 'error' ? 'error' : 'idle'));
        }
      };

      ws.onerror = () => {
        if (!isMountedRef.current) return;
        setErrorMessage('WebSocket connection to /api/live failed.');
        cleanupSession();
        setStatus('error');
      };

      ws.onclose = () => {
        cleanupSession();
        if (isMountedRef.current) {
          setStatus((curr) => (curr === 'error' ? 'error' : 'idle'));
        }
      };

      const source = inputCtx.createMediaStreamSource(mediaStream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (audioEvent) => {
        if (!isMountedRef.current) return;
        const rawSamples = audioEvent.inputBuffer.getChannelData(0);
        if (isMutedRef.current) {
          setMicLevel(0);
          return;
        }
        setMicLevel(computeRmsLevel(rawSamples));

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const resampled = downsampleFloat32(rawSamples, inputCtx.sampleRate, 16000);
          const int16 = float32ToInt16Pcm(resampled);
          const base64 = int16ToBase64(int16);
          wsRef.current.send(JSON.stringify({ type: 'audio', data: base64 }));
        }
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      cleanupSession();
      if (!isMountedRef.current) return;
      const raw = err instanceof Error ? err.message : 'Unable to access microphone.';
      setErrorMessage(
        isMicrophoneUnavailableError(err)
          ? 'Microphone access is unavailable or blocked. Allow microphone permissions and connect a microphone to talk live.'
          : raw
      );
      setStatus('error');
    }
  };

  const handleStopSession = () => {
    cleanupSession();
    setStatus('idle');
  };

  const handleSendTextTurn = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = textTurn.trim();
    if (!clean || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'text', text: clean }));
    appendTranscript('you', clean);
    setTextTurn('');
  };

  const isActive = status === 'connecting' || status === 'listening' || status === 'speaking';

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Controls */}
      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-white/12 bg-[#1D2536]/90 p-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#FF6B73] uppercase">
                Real-Time Live API
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">Voice Conversation</h3>
            </div>
            <span className="font-mono text-[11px] text-slate-300">{LIVE_VOICE_MODEL}</span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Low-latency bidirectional voice streaming at 16 kHz PCM input and 24 kHz audio
            playback with instant barge-in interruption handling.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="live-voice-select"
                className="block font-mono text-[10px] tracking-[0.12em] text-slate-400 uppercase"
              >
                Voice Persona
              </label>
              <select
                id="live-voice-select"
                value={voice}
                disabled={isActive}
                onChange={(e) => setVoice(e.target.value as LiveVoiceName)}
                className="mt-1.5 min-h-[40px] w-full rounded-xl border border-white/15 bg-[#111722] px-3 text-sm text-white focus:border-[#E8202A] focus:outline-none disabled:opacity-50"
              >
                {LIVE_VOICES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} · {v.tone.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="live-role-select"
                className="block font-mono text-[10px] tracking-[0.12em] text-slate-400 uppercase"
              >
                Advisory Focus
              </label>
              <select
                id="live-role-select"
                value={roleId}
                disabled={isActive}
                onChange={(e) => setRoleId(e.target.value as ChatbotRoleId)}
                className="mt-1.5 min-h-[40px] w-full rounded-xl border border-white/15 bg-[#111722] px-3 text-sm text-white focus:border-[#E8202A] focus:outline-none disabled:opacity-50"
              >
                {CHATBOT_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Status & Mic Level Meter */}
          <div className="mt-5 rounded-xl border border-white/10 bg-[#111722] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-slate-200">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    status === 'speaking'
                      ? 'bg-[#FF6B73]'
                      : status === 'listening'
                        ? 'bg-emerald-400'
                        : status === 'connecting'
                          ? 'animate-pulse bg-amber-400'
                          : status === 'error'
                            ? 'bg-rose-500'
                            : 'bg-slate-600'
                  }`}
                />
                {status === 'idle' && 'Session Ready'}
                {status === 'connecting' && 'Connecting to Gemini Live...'}
                {status === 'listening' && (isMuted ? 'Microphone Muted' : 'Listening Live')}
                {status === 'speaking' && 'Gemini Speaking (24 kHz PCM)'}
                {status === 'error' && 'Session Interrupted'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {Math.round(micLevel * 100)}% input
              </span>
            </div>

            <div
              aria-label="Microphone input level"
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full bg-linear-to-r from-[#2F3A4F] via-[#E8202A] to-[#FF6B73] transition-[width] duration-75"
                style={{ width: `${Math.max(2, Math.round(micLevel * 100))}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {!isActive ? (
              <button
                type="button"
                onClick={() => void startLiveSession()}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922]"
              >
                <Radio className="h-4 w-4" aria-hidden="true" />
                Start Voice Conversation
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {isMuted ? (
                    <>
                      <MicOff className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      Unmute Mic
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                      Mute Mic
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleStopSession}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                >
                  <PhoneOff className="h-4 w-4" aria-hidden="true" />
                  End Call
                </button>
              </>
            )}
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/50 px-3.5 py-2.5 text-xs text-rose-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Real-Time Transcript Log */}
      <div className="flex flex-col rounded-2xl border border-white/12 bg-[#1D2536]/90 lg:col-span-7">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#FF6B73]" aria-hidden="true" />
            <span className="text-sm font-semibold text-white">Live Conversation Transcript</span>
          </div>
          {transcripts.length > 0 && (
            <button
              type="button"
              onClick={() => setTranscripts([])}
              className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
            >
              Clear Log
            </button>
          )}
        </div>

        <div
          ref={transcriptContainerRef}
          role="log"
          aria-live="polite"
          aria-label="Live voice conversation transcript"
          className="h-[310px] space-y-3 overflow-y-auto px-5 py-4"
        >
          {transcripts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                Start a voice session to speak naturally with{' '}
                <span className="font-mono text-[#FF8A90]">{LIVE_VOICE_MODEL}</span>. Spoken turns
                and model replies appear here in real time.
              </p>
            </div>
          ) : (
            transcripts.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                  item.speaker === 'you'
                    ? 'border-[#E8202A]/45 bg-[#E8202A]/15 text-slate-100'
                    : 'border-white/10 bg-[#111722] text-slate-200'
                }`}
              >
                <span className="mb-1 block font-mono text-[10px] tracking-wider text-[#FF8A90] uppercase">
                  {item.speaker === 'you' ? 'You (Spoken)' : `Gemini Live (${voice})`}
                </span>
                {item.text}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendTextTurn} className="border-t border-white/10 p-4">
          <label htmlFor="live-text-turn" className="sr-only">
            Send a text prompt inside the active live voice session
          </label>
          <div className="flex gap-2.5">
            <input
              id="live-text-turn"
              type="text"
              value={textTurn}
              disabled={!isActive}
              onChange={(e) => setTextTurn(e.target.value)}
              placeholder={
                isActive
                  ? 'Optional: type a quick prompt into the active voice call...'
                  : 'Connect Live Voice above to enable real-time audio or text turns'
              }
              className="min-h-[42px] w-full rounded-xl border border-white/15 bg-[#111722] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-[#E8202A] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!isActive || !textTurn.trim()}
              aria-label="Send text prompt to live voice session"
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
