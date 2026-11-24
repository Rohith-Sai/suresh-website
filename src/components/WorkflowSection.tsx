import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { WORKFLOW_STEPS } from '../data/siteData';
import { computeWorkflowProgress } from '../utils/siteLogic';

gsap.registerPlugin(ScrollTrigger);

export function WorkflowSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const svgPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    const pathEl = svgPathRef.current;
    if (!el || !pathEl) return;

    const length = pathEl.getTotalLength();
    pathEl.style.strokeDasharray = `${length}`;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      pathEl.style.strokeDashoffset = '0';
      return;
    }

    pathEl.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      gsap.to(pathEl, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 65%',
          end: 'bottom 75%',
          scrub: 0.4,
        },
      });

      gsap.from('.process-node', {
        y: 20,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 74%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const activeStep = WORKFLOW_STEPS[activeIndex];
  const progressPercent = computeWorkflowProgress(activeIndex, WORKFLOW_STEPS.length);

  return (
    <section
      ref={sectionRef}
      id="workflow"
      className="relative overflow-hidden border-b border-white/10 bg-[#111722] py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-55"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#FF6B73] uppercase">
              Our Engineering Process
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Seven Stages From First Hypothesis to Continuous Scale
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
            Scroll or select any stage along the engineering spine to inspect its deliverables and
            quality gates.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-12">
          {/* Left 7 columns: Scroll-animated SVG conduit timeline */}
          <div className="relative pl-10 sm:pl-12 lg:col-span-7">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 600"
              preserveAspectRatio="none"
              className="pointer-events-none absolute top-4 bottom-4 left-2 h-[calc(100%-2rem)] w-6 sm:left-3"
            >
              <path
                d="M12 0 L12 600"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="2"
                fill="none"
              />
              <path
                ref={svgPathRef}
                d="M12 0 L12 600"
                stroke="#E8202A"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>

            <div className="space-y-4">
              {WORKFLOW_STEPS.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    aria-pressed={isSelected}
                    className={`process-node group relative flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#E8202A]/75 bg-[#1D2536] shadow-lg shadow-[#111722]/40'
                        : 'border-white/10 bg-[#161E2E] hover:border-white/25 hover:bg-[#1D2536]/80'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-6 -left-[2.12rem] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-colors sm:-left-[2.36rem] ${
                        isSelected
                          ? 'border-[#E8202A] bg-[#E8202A]'
                          : 'border-slate-500 bg-[#111722] group-hover:border-[#FF6B73]'
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-xs font-semibold tabular-nums ${
                            isSelected ? 'text-[#FF6B73]' : 'text-slate-400'
                          }`}
                        >
                          {item.step} —
                        </span>
                        <h3 className="text-lg font-bold tracking-tight text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.summary}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 5 columns: Sticky Stage Output Inspector */}
          <div className="lg:sticky lg:top-24 lg:col-span-5">
            <div className="rounded-3xl border border-white/12 bg-[#1D2536] p-7 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs font-semibold tracking-[0.16em] text-[#FF6B73] uppercase">
                  Stage {activeStep.step} / 0{WORKFLOW_STEPS.length}
                </span>
                <span className="font-mono text-xs font-semibold text-slate-300 tabular-nums">
                  {progressPercent}%
                </span>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-[#2F3A4F] via-[#E8202A] to-[#FF6B73] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-white">
                {activeStep.step} — {activeStep.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-300">{activeStep.summary}</p>

              <div className="mt-6 rounded-xl border border-white/10 bg-[#111722] p-4">
                <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Stage Outcome
                </p>
                <p className="mt-1.5 text-sm font-semibold text-white">{activeStep.outcome}</p>
              </div>

              <div className="mt-6">
                <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                  Key Artifacts Delivered
                </p>
                <ul className="mt-3 space-y-2.5">
                  {activeStep.deliverables.map((artifact) => (
                    <li
                      key={artifact}
                      className="flex items-center gap-2.5 text-sm font-medium text-slate-200"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF6B73]" aria-hidden="true" />
                      <span>{artifact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
