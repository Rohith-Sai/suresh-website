import {
  AlertCircle,
  ArrowRight,
  Check,
  Copy,
  FileAudio,
  Mic,
  Square,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  AUDIO_TRANSCRIBE_MODEL,
  isMicrophoneUnavailableError,
  readJsonResponseSafely,
} from '../utils/aiStudio';
import { computeRmsLevel, formatDurationSeconds } from '../utils/audioPcm';

const MAX_AUDIO_UPLOAD_BYTES = 18 * 1024 * 1024;

interface AudioTranscribePanelProps {
  onSendToChat: (transcript: string) => void;
}

type TranscribeState = 'idle' | 'recording' | 'transcribing' | 'error';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIndex = result.indexOf(',');
      if (commaIndex === -1) {
        reject(new Error('Failed to encode audio buffer.'));
        return;
      }
      resolve(result.slice(commaIndex + 1));
    };
    reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
    reader.readAsDataURL(blob);
  });
}

export function AudioTranscribePanel({ onSendToChat }: AudioTranscribePanelProps) {
  const [state, setState] = useState<TranscribeState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const stopRecordingHardware = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      void audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    if (isMountedRef.current) {
      setMicLevel(0);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = null;
      }
      stopRecordingHardware();
      if (mediaRecorderRef.current) {
        const recorder = mediaRecorderRef.current;
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        mediaRecorderRef.current = null;
      }
    };
  }, []);

  const submitAudioForTranscription = async (blob: Blob, label: string) => {
    if (!isMountedRef.current) return;
    if (blob.size > MAX_AUDIO_UPLOAD_BYTES) {
      setErrorMessage('Audio clip exceeds the 18 MB demo upload limit. Please use a shorter recording.');
      setState('error');
      return;
    }

    setState('transcribing');
    setErrorMessage(null);
    setSourceLabel(label);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const audioBase64 = await blobToBase64(blob);
      if (!isMountedRef.current || controller.signal.aborted) return;
      const mimeType = blob.type || 'audio/webm';

      const response = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
        }),
        signal: controller.signal,
      });

      const parsed = await readJsonResponseSafely<{
        transcript?: string;
        error?: string;
      }>(response);

      if (!isMountedRef.current) return;

      if (!parsed.ok) {
        throw new Error(parsed.data?.error ?? `Transcription failed (${parsed.status})`);
      }

      setTranscript(parsed.data?.transcript ?? '');
      setState('idle');
    } catch (err) {
      if ((err as Error).name === 'AbortError' || !isMountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'Unable to transcribe audio.';
      setErrorMessage(msg);
      setState('error');
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  };

  const handleStartRecording = async () => {
    if (state === 'recording' || state === 'transcribing') return;
    setErrorMessage(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setErrorMessage('Microphone recording is not supported in this browser.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }
      streamRef.current = stream;

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ];
      const supportedMime =
        preferredTypes.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';

      const recorder = supportedMime
        ? new MediaRecorder(stream, { mimeType: supportedMime })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || supportedMime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        stopRecordingHardware();
        if (!isMountedRef.current) return;
        if (blob.size > 0) {
          void submitAudioForTranscription(blob, 'Microphone Recording');
        } else {
          setState('idle');
        }
      };

      // Live RMS audio metering
      const audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') {
        void audioCtx.resume().catch(() => {});
      }
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const sampleBuffer = new Float32Array(analyser.fftSize);

      const updateLevel = () => {
        if (!isMountedRef.current) return;
        analyser.getFloatTimeDomainData(sampleBuffer);
        setMicLevel(computeRmsLevel(sampleBuffer));
        rafRef.current = window.requestAnimationFrame(updateLevel);
      };
      updateLevel();

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setElapsedSeconds(0);
      setState('recording');

      timerRef.current = window.setInterval(() => {
        if (isMountedRef.current) {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } catch (err) {
      stopRecordingHardware();
      if (!isMountedRef.current) return;
      const raw = err instanceof Error ? err.message : 'Unable to start microphone.';
      setErrorMessage(
        isMicrophoneUnavailableError(err)
          ? 'Microphone access is blocked or unavailable. Allow microphone permissions or upload an audio clip below.'
          : raw
      );
      setState('error');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      stopRecordingHardware();
      setState('idle');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    void submitAudioForTranscription(file, file.name);
  };

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      if (!isMountedRef.current) return;
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        if (isMountedRef.current) {
          setCopied(false);
        }
        copyTimerRef.current = null;
      }, 1800);
    } catch {
      // Clipboard unavailable
    }
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left Capture Controls */}
      <div className="space-y-5 lg:col-span-5">
        <div className="rounded-2xl border border-white/12 bg-[#1D2536]/90 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#FF6B73] uppercase">
                Speech-to-Text
              </p>
              <h3 className="mt-1 text-lg font-bold text-white">Transcribe Audio</h3>
            </div>
            <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-[#FF8A90]">
              {AUDIO_TRANSCRIBE_MODEL}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-300">
            Record voice notes, sprint standups, or architecture thoughts directly from your
            microphone for verbatim transcription with{' '}
            <span className="font-mono text-[#FF8A90]">{AUDIO_TRANSCRIBE_MODEL}</span>.
          </p>

          {/* Recording Meter */}
          <div className="mt-5 rounded-xl border border-white/10 bg-[#111722] p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-slate-200">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    state === 'recording'
                      ? 'animate-pulse bg-[#E8202A]'
                      : state === 'transcribing'
                        ? 'animate-pulse bg-[#FF6B73]'
                        : state === 'error'
                          ? 'bg-rose-500'
                          : 'bg-slate-600'
                  }`}
                />
                {state === 'idle' && 'Ready to Record'}
                {state === 'recording' && 'Recording Microphone...'}
                {state === 'transcribing' && 'Transcribing with Gemini...'}
                {state === 'error' && 'Capture Error'}
              </span>
              <span className="font-mono text-xs text-[#FF8A90]">
                {formatDurationSeconds(elapsedSeconds)}
              </span>
            </div>

            <div
              aria-label="Recording microphone level"
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10"
            >
              <div
                className="h-full bg-linear-to-r from-[#2F3A4F] via-[#E8202A] to-[#FF6B73] transition-[width] duration-75"
                style={{ width: `${Math.max(2, Math.round(micLevel * 100))}%` }}
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {state !== 'recording' ? (
              <button
                type="button"
                disabled={state === 'transcribing'}
                onClick={() => void handleStartRecording()}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Mic className="h-4 w-4" aria-hidden="true" />
                {state === 'transcribing' ? 'Transcribing...' : 'Start Microphone'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#C81922] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E8202A]"
              >
                <Square className="h-4 w-4 fill-current" aria-hidden="true" />
                Stop &amp; Transcribe
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="sr-only"
              aria-label="Upload an audio file to transcribe"
            />
            <button
              type="button"
              disabled={state === 'recording' || state === 'transcribing'}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#2F3A4F]/60 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileAudio className="h-4 w-4 text-[#FF6B73]" aria-hidden="true" />
              Upload Audio
            </button>
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

      {/* Right Verbatim Transcript Output */}
      <div className="flex flex-col rounded-2xl border border-white/12 bg-[#1D2536]/90 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-white">Transcript Output</p>
            <p className="font-mono text-[11px] text-slate-400">
              {sourceLabel ? `${sourceLabel} · ` : ''}
              {wordCount} word{wordCount === 1 ? '' : 's'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!transcript}
              onClick={() => void handleCopy()}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy
                </>
              )}
            </button>
            <button
              type="button"
              disabled={!transcript}
              onClick={() => {
                setTranscript('');
                setSourceLabel(null);
              }}
              aria-label="Clear transcript"
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="h-[290px] overflow-y-auto px-5 py-4">
          {state === 'transcribing' ? (
            <div className="flex h-full items-center justify-center">
              <p className="inline-flex items-center gap-2.5 text-sm text-[#FF8A90]">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#FF6B73]" />
                Processing audio with {AUDIO_TRANSCRIBE_MODEL}...
              </p>
            </div>
          ) : transcript ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-100">
              {transcript}
            </p>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                Press <strong className="text-slate-200">Start Microphone</strong> and speak, or
                upload an audio clip. Your transcript will appear here ready to copy or send to
                the Gemini Chatbot.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-white/10 px-5 py-3.5">
          <button
            type="button"
            disabled={!transcript}
            onClick={() => onSendToChat(transcript)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-[#E8202A] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#C81922] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Send Transcript to Gemini Chat</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
