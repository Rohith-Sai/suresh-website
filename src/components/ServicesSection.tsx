import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { SERVICES, type ServiceItem } from '../data/siteData';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

/**
 * Custom animated architectural visual stage per engineering discipline.
 * Each discipline renders bespoke motion geometry rather than generic icons.
 */
function DisciplineMotionStage({ theme }: { theme: ServiceItem['visualTheme'] }) {
  switch (theme) {
    case 'software':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <rect x="24" y="28" width="110" height="54" rx="10" fill="#1A2232" stroke="#E8202A" strokeWidth="1.5" />
          <text x="79" y="59" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="monospace">
            DOMAIN CORE
          </text>
          <rect x="156" y="28" width="110" height="54" rx="10" fill="#1A2232" stroke="#94A3B8" strokeWidth="1.5" />
          <text x="211" y="59" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="monospace">
            STATE ENGINE
          </text>
          <rect x="288" y="28" width="108" height="54" rx="10" fill="#1A2232" stroke="#FF6B73" strokeWidth="1.5" />
          <text x="342" y="59" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="monospace">
            EVENT LEDGER
          </text>
          <path
            d="M79 82V122M211 82V122M342 82V122M79 122H342"
            stroke="#FF6B73"
            strokeWidth="1.8"
            className="animate-signal-flow"
          />
          <rect x="78" y="132" width="264" height="44" rx="10" fill="#E8202A" fillOpacity="0.18" stroke="#E8202A" strokeWidth="1.5" />
          <text x="210" y="158" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontFamily="monospace">
            TYPE-SAFE EXECUTION PIPELINE
          </text>
        </svg>
      );

    case 'web':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <rect x="30" y="18" width="360" height="164" rx="12" fill="#1A2232" stroke="#3B475F" strokeWidth="1.5" />
          <line x1="30" y1="48" x2="390" y2="48" stroke="#2F3A4F" strokeWidth="1.5" />
          <circle cx="50" cy="33" r="4" fill="#E8202A" />
          <circle cx="64" cy="33" r="4" fill="#FF8A90" />
          <circle cx="78" cy="33" r="4" fill="#94A3B8" />
          <rect x="48" y="64" width="170" height="98" rx="8" fill="#2F3A4F" fillOpacity="0.55" stroke="#E8202A" strokeOpacity="0.7" strokeWidth="1.2" />
          <path
            d="M66 142 L106 108 L142 124 L196 82"
            fill="none"
            stroke="#FF6B73"
            strokeWidth="2.4"
            strokeLinecap="round"
            className="animate-signal-flow"
          />
          <rect x="234" y="64" width="136" height="42" rx="8" fill="#242E42" stroke="#FF6B73" strokeOpacity="0.55" strokeWidth="1.2" />
          <rect x="234" y="120" width="136" height="42" rx="8" fill="#242E42" stroke="#475569" strokeWidth="1.2" />
        </svg>
      );

    case 'mobile':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <rect x="112" y="16" width="84" height="168" rx="16" fill="#1A2232" stroke="#E8202A" strokeWidth="1.6" />
          <rect x="224" y="26" width="84" height="158" rx="16" fill="#242E42" stroke="#94A3B8" strokeWidth="1.4" />
          <path d="M196 98 H224" stroke="#FF6B73" strokeWidth="2" className="animate-signal-flow" />
          <rect x="126" y="42" width="56" height="34" rx="6" fill="#E8202A" fillOpacity="0.35" />
          <rect x="126" y="86" width="56" height="68" rx="6" fill="#2F3A4F" />
          <circle cx="266" cy="90" r="22" fill="none" stroke="#FF6B73" strokeWidth="2" />
          <path d="M256 90 L263 97 L278 82" fill="none" stroke="#FF6B73" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );

    case 'ai':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <path
            d="M72 48 L210 66 M72 100 L210 66 M72 100 L210 134 M72 152 L210 134 M210 66 L348 100 M210 134 L348 100"
            stroke="#FF6B73"
            strokeOpacity="0.65"
            strokeWidth="1.6"
            className="animate-signal-flow"
          />
          <circle cx="72" cy="48" r="10" fill="#E8202A" />
          <circle cx="72" cy="100" r="10" fill="#FF6B73" />
          <circle cx="72" cy="152" r="10" fill="#94A3B8" />
          <circle cx="210" cy="66" r="15" fill="#1A2232" stroke="#E8202A" strokeWidth="2" />
          <circle cx="210" cy="134" r="15" fill="#1A2232" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="348" cy="100" r="22" fill="#E8202A" fillOpacity="0.28" stroke="#FF6B73" strokeWidth="2" />
          <text x="348" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="monospace">
            RAG
          </text>
        </svg>
      );

    case 'design':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <circle cx="152" cy="100" r="58" fill="none" stroke="#E8202A" strokeWidth="1.6" />
          <rect x="152" y="42" width="116" height="116" rx="16" fill="#2F3A4F" fillOpacity="0.45" stroke="#94A3B8" strokeWidth="1.6" />
          <line x1="60" y1="100" x2="360" y2="100" stroke="#475569" strokeDasharray="4 4" />
          <line x1="210" y1="16" x2="210" y2="184" stroke="#475569" strokeDasharray="4 4" />
          <path d="M90 150 C140 40, 280 160, 330 50" fill="none" stroke="#FF8A90" strokeWidth="2" className="animate-signal-flow" />
        </svg>
      );

    case 'cloud':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <ellipse cx="210" cy="100" rx="146" ry="62" fill="none" stroke="#3B475F" strokeWidth="1.5" />
          <ellipse cx="210" cy="100" rx="88" ry="36" fill="none" stroke="#FF6B73" strokeOpacity="0.6" strokeWidth="1.5" className="animate-signal-flow" />
          <circle cx="84" cy="68" r="10" fill="#E8202A" />
          <circle cx="336" cy="68" r="10" fill="#FF6B73" />
          <circle cx="210" cy="162" r="10" fill="#94A3B8" />
          <circle cx="210" cy="100" r="18" fill="#1A2232" stroke="#E8202A" strokeWidth="2" />
        </svg>
      );

    case 'enterprise':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <rect x="52" y="28" width="316" height="36" rx="8" fill="#242E42" stroke="#E8202A" strokeWidth="1.5" />
          <rect x="52" y="82" width="316" height="36" rx="8" fill="#242E42" stroke="#FF6B73" strokeWidth="1.5" />
          <rect x="52" y="136" width="316" height="36" rx="8" fill="#242E42" stroke="#94A3B8" strokeWidth="1.5" />
          <line x1="90" y1="46" x2="340" y2="46" stroke="#FF6B73" strokeOpacity="0.5" strokeWidth="1.5" className="animate-signal-flow" />
          <line x1="90" y1="100" x2="340" y2="100" stroke="#94A3B8" strokeOpacity="0.45" strokeWidth="1.5" className="animate-signal-flow" />
          <circle cx="72" cy="46" r="4.5" fill="#E8202A" />
          <circle cx="72" cy="100" r="4.5" fill="#FF6B73" />
          <circle cx="72" cy="154" r="4.5" fill="#E2E8F0" />
        </svg>
      );

    case 'strategy':
      return (
        <svg viewBox="0 0 420 200" className="h-48 w-full" aria-hidden="true">
          <line x1="48" y1="158" x2="372" y2="158" stroke="#3B475F" strokeWidth="1" />
          <path
            d="M52 144 C120 144, 155 56, 214 86 C272 116, 300 40, 366 44"
            fill="none"
            stroke="#FF6B73"
            strokeWidth="2.6"
            strokeLinecap="round"
            className="animate-signal-flow"
          />
          <circle cx="52" cy="144" r="7" fill="#94A3B8" />
          <circle cx="214" cy="86" r="8" fill="#FF6B73" />
          <circle cx="366" cy="44" r="9" fill="#E8202A" />
        </svg>
      );
  }
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = SERVICES[activeIndex];

  return (
    <section
      id="services"
      className="relative border-b border-white/10 bg-[#111722] py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#FF6B73] uppercase">
              Capabilities Architecture
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Eight Disciplines. Engineered as One Instrument.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            Explore each discipline to inspect its live architectural pattern, deliverables, and
            production stack.
          </p>
        </div>

        {/* Asymmetric Split Interactive Services Stage (Zero Card Grid) */}
        <div className="mt-16 grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Sticky Interactive Index */}
          <div className="divide-y divide-white/10 border-y border-white/10 lg:col-span-5">
            {SERVICES.map((service, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={service.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  aria-pressed={isActive}
                  className={`group flex w-full items-center justify-between gap-4 py-4 text-left transition-all duration-150 ${
                    isActive ? 'pl-3' : 'hover:pl-2'
                  }`}
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums transition-colors ${
                        isActive ? 'text-[#FF6B73]' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      {service.number}
                    </span>
                    <div>
                      <h3
                        className={`text-base font-bold tracking-tight transition-colors sm:text-lg ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                        }`}
                      >
                        {service.title}
                      </h3>
                      <p
                        className={`mt-0.5 text-xs transition-colors ${
                          isActive ? 'text-[#FF6B73]' : 'text-slate-500'
                        }`}
                      >
                        {service.shortLabel}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all duration-150 ${
                      isActive
                        ? 'translate-x-0 text-[#FF6B73] opacity-100'
                        : '-translate-x-2 text-slate-500 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* Right Sticky Animated Architectural Stage */}
          <div className="lg:sticky lg:top-24 lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#1D2536] p-6 shadow-2xl sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex flex-col gap-1.5 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.16em] text-[#FF6B73] uppercase">
                      {activeService.number} · {activeService.shortLabel}
                    </span>
                    <span className="font-mono text-[11px] text-slate-300 sm:text-right">
                      {activeService.stackPreview.join(' · ')}
                    </span>
                  </div>

                  {/* Animated Architectural Visualizer */}
                  <div className="my-6 rounded-2xl border border-white/10 bg-[#111722] p-4">
                    <DisciplineMotionStage theme={activeService.visualTheme} />
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {activeService.title}
                    </h3>
                    <span className="font-mono text-xs text-slate-400 tabular-nums shrink-0">
                      0{activeIndex + 1} / 0{SERVICES.length}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {activeService.description}
                  </p>

                  <p className="mt-4 text-xs leading-relaxed text-[#FF8A90]">
                    Architecture Focus: {activeService.architectureFocus}
                  </p>

                  <ul className="mt-6 grid gap-2.5 border-t border-white/10 pt-5 sm:grid-cols-3">
                    {activeService.deliverables.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#FF6B73]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => onSelectService(activeService.title)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922] whitespace-nowrap shrink-0"
                    >
                      Scope {activeService.shortLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
