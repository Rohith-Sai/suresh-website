import { AlertCircle, AudioLines, MessageSquareCode, Mic } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AiChatPanel } from './AiChatPanel';
import { AudioTranscribePanel } from './AudioTranscribePanel';
import { LiveVoicePanel } from './LiveVoicePanel';

type StudioTabId = 'chat' | 'live' | 'transcribe';

const STUDIO_TABS: ReadonlyArray<{
  id: StudioTabId;
  label: string;
  subtitle: string;
}> = [
  {
    id: 'chat',
    label: 'Gemini Chatbot',
    subtitle: 'Multi-turn roles & 4-model routing',
  },
  {
    id: 'live',
    label: 'Live Voice',
    subtitle: 'gemini-3.8-live real-time audio',
  },
  {
    id: 'transcribe',
    label: 'Transcribe Audio',
    subtitle: 'gemini-3.5-transcribe mic capture',
  },
];

export function AiStudioSection() {
  const [activeTab, setActiveTab] = useState<StudioTabId>('chat');
  const [importedTranscript, setImportedTranscript] = useState('');
  const [apiConfigured, setApiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then((res) => {
        const contentType = res.headers.get('content-type') ?? '';
        return res.ok && contentType.includes('application/json') ? res.json() : null;
      })
      .then((data: { configured?: boolean } | null) => {
        if (data && typeof data.configured === 'boolean') {
          setApiConfigured(data.configured);
        }
      })
      .catch(() => {
        // Non-blocking health check; ignore abort/transient errors
      });
    return () => controller.abort();
  }, []);

  const handleSendToChat = useCallback((transcript: string) => {
    setImportedTranscript(transcript);
    setActiveTab('chat');
  }, []);

  const handleConsumeImportedTranscript = useCallback(() => {
    setImportedTranscript('');
  }, []);

  return (
    <section
      id="ai-studio"
      className="relative overflow-hidden bg-[#111722] py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-white/10 pb-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.16em] text-[#FF6B73] uppercase">
              Interactive AI Engineering Lab
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Multi-Modal Gemini Studio
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-300">
              Test architectural reasoning, converse in real time over Live audio, or transcribe
              microphone recordings directly inside the studio workspace.
            </p>
          </div>

          {apiConfigured === false && (
            <div
              role="status"
              className="mt-5 flex items-start gap-3 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              <span>
                <strong>Demo mode notice:</strong> <code className="font-mono">GEMINI_API_KEY</code>{' '}
                is not configured in the server environment yet. Set it in <code className="font-mono">.env</code>{' '}
                (see <code className="font-mono">.env.example</code>) to enable live Gemini chat,
                voice, and audio transcription.
              </span>
            </div>
          )}

          <div
            role="tablist"
            aria-label="Gemini AI Studio capabilities"
            className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {STUDIO_TABS.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`studio-tab-${tab.id}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`studio-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors ${
                    selected
                      ? 'border-[#E8202A]/80 bg-[#2F3A4F]/90 text-white'
                      : 'border-white/12 bg-[#1D2536]/60 text-slate-300 hover:border-white/25 hover:bg-[#2F3A4F]/50'
                  }`}
                >
                  {tab.id === 'chat' && (
                    <MessageSquareCode
                      className={`h-5 w-5 shrink-0 ${selected ? 'text-[#FF6B73]' : 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                  )}
                  {tab.id === 'live' && (
                    <AudioLines
                      className={`h-5 w-5 shrink-0 ${selected ? 'text-[#FF6B73]' : 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                  )}
                  {tab.id === 'transcribe' && (
                    <Mic
                      className={`h-5 w-5 shrink-0 ${selected ? 'text-[#FF6B73]' : 'text-slate-400'}`}
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {tab.label}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] text-slate-400">
                      {tab.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'chat' && (
            <div
              id="studio-panel-chat"
              role="tabpanel"
              aria-labelledby="studio-tab-chat"
            >
              <AiChatPanel
                importedTranscript={importedTranscript}
                onConsumeImportedTranscript={handleConsumeImportedTranscript}
              />
            </div>
          )}

          {activeTab === 'live' && (
            <div
              id="studio-panel-live"
              role="tabpanel"
              aria-labelledby="studio-tab-live"
            >
              <LiveVoicePanel />
            </div>
          )}

          {activeTab === 'transcribe' && (
            <div
              id="studio-panel-transcribe"
              role="tabpanel"
              aria-labelledby="studio-tab-transcribe"
            >
              <AudioTranscribePanel onSendToChat={handleSendToChat} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
