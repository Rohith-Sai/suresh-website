import { useEffect, useRef, useState } from 'react';
import { computeEditorialWordReveal } from '../utils/siteLogic';

const MANIFESTO_STATEMENT =
  "Technology isn't the destination. It's the architecture behind what becomes possible.";

const THESIS_PILLARS = [
  {
    index: '01',
    title: 'Zero Brittle Shortcuts',
    detail: 'Type-safe contracts, clear domain boundaries, and tests built into every sprint.',
  },
  {
    index: '02',
    title: 'Design & Code as One',
    detail: 'Motion systems and backend throughput architected together in a single studio pod.',
  },
  {
    index: '03',
    title: 'Engineered to Compound',
    detail: 'Observability, cloud economics, and maintainability designed for multi-year scale.',
  },
];

export function IntroManifestoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(1);

  const words = MANIFESTO_STATEMENT.split(' ');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setScrollProgress(1);
      return;
    }

    let rafId = 0;

    const updateProgress = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      // Progress moves smoothly from 0 as section enters bottom of viewport to 1 at upper-mid screen
      const raw = (vh * 0.85 - rect.top) / (vh * 0.55);
      const next = Math.max(0.15, Math.min(1, raw));
      setScrollProgress(Number(next.toFixed(3)));
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative border-b border-slate-200/80 bg-[#F7F7F7] py-24 text-[#1A2232] sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
              Studio Manifesto
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
              An intentional shift away from bloated corporate software toward sharp, enduring craft.
            </p>
          </div>

          <div className="lg:col-span-9">
            <h2 className="font-display text-[clamp(1.85rem,4.4vw,3.85rem)] font-bold leading-[1.12] tracking-tight text-[#1A2232]">
              {words.map((word, idx) => {
                const opacity = computeEditorialWordReveal(idx, words.length, scrollProgress);
                const isAccent = word.startsWith('architecture') || word.startsWith('possible');
                return (
                  <span
                    key={`${word}-${idx}`}
                    style={{ opacity }}
                    className={`inline-block transition-opacity duration-150 ${
                      isAccent ? 'text-[#C81922]' : 'text-[#1A2232]'
                    }`}
                  >
                    {word}
                    {idx < words.length - 1 ? '\u00A0' : ''}
                  </span>
                );
              })}
            </h2>

            <div className="mt-14 grid gap-8 border-t border-slate-300/80 pt-10 sm:grid-cols-3">
              {THESIS_PILLARS.map((pillar) => (
                <div key={pillar.index}>
                  <span className="font-mono text-xs font-semibold text-[#C81922] tabular-nums">
                    {pillar.index}
                  </span>
                  <h3 className="mt-2 text-base font-bold tracking-tight text-[#1A2232]">
                    {pillar.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{pillar.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
