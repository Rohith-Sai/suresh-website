import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import studioImg from '../assets/images/about_engineering_studio_1795490189438.jpg';
import { ABOUT_STATS, COMPANY_CONFIG, STUDIO_PRINCIPLES } from '../data/siteData';
import { formatStatCounter } from '../utils/siteLogic';

gsap.registerPlugin(ScrollTrigger);

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [display, setDisplay] = useState(`${target}${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(`${target}${suffix}`);
      return;
    }

    let rafId = 0;
    let cancelled = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            observer.disconnect();
            const duration = 950;
            const start = performance.now();

            const step = (now: number) => {
              if (cancelled) return;
              const progress = Math.min(1, (now - start) / duration);
              setDisplay(formatStatCounter(target, suffix, progress));
              if (progress < 1) {
                rafId = window.requestAnimationFrame(step);
              }
            };

            setDisplay(formatStatCounter(target, suffix, 0));
            rafId = window.requestAnimationFrame(step);
            break;
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [target, suffix]);

  return (
    <span ref={ref} className="font-mono text-3xl font-semibold text-white tabular-nums sm:text-5xl">
      {display}
    </span>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activePrincipleIdx, setActivePrincipleIdx] = useState(0);
  const [studioImgFailed, setStudioImgFailed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.from('.about-story-reveal', {
        y: 28,
        opacity: 0,
        duration: 0.78,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: el,
          start: 'top 76%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const currentPrinciple = STUDIO_PRINCIPLES[activePrincipleIdx];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative overflow-hidden border-b border-white/10 bg-[#1D2536] py-24 text-white sm:py-32"
    >
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-50"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="about-story-reveal max-w-4xl">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#FF6B73] uppercase">
            Visual Brand Story
          </p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            BUILT ON CURIOSITY.{' '}
            <span className="animate-gradient-text bg-linear-to-r from-white via-[#FF8A90] to-[#E8202A] bg-clip-text text-transparent">
              ENGINEERED FOR IMPACT.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid items-start gap-12 lg:grid-cols-12">
          {/* Left 6 columns: Editorial Narrative + Interactive Principle Lens */}
          <div className="about-story-reveal space-y-8 lg:col-span-6">
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              {COMPANY_CONFIG.name} pairs senior product designers and principal systems engineers inside
              focused studio pods. We treat software architecture as a creative medium—turning
              ambitious ideas into resilient digital infrastructure that endures.
            </p>

            {/* Interactive Principle Switcher */}
            <div className="rounded-2xl border border-white/12 bg-[#111722]/75 p-6">
              <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
                {STUDIO_PRINCIPLES.map((item, idx) => {
                  const active = idx === activePrincipleIdx;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActivePrincipleIdx(idx)}
                      aria-pressed={active}
                      className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#E8202A] text-white'
                          : 'text-slate-300 hover:bg-[#2F3A4F] hover:text-white'
                      }`}
                    >
                      {item.index} · {item.title}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-bold text-white">{currentPrinciple.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                  {currentPrinciple.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Right 6 columns: Studio Photograph + Custom Architectural Prism Geometry */}
          <div className="about-story-reveal relative lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-white/12 bg-[#111722]">
              <div className="aspect-4/3 overflow-hidden">
                {!studioImgFailed ? (
                  <img
                    src={studioImg}
                    alt="Gollamudi Technology and Software engineering studio with natural daylight"
                    referrerPolicy="no-referrer"
                    onError={() => setStudioImgFailed(true)}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#111722] p-8">
                    <p className="font-display text-lg font-bold text-white">
                      {COMPANY_CONFIG.name} Studio
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold text-white">Unified Engineering Pods</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Design systems, distributed backends &amp; applied AI
                  </p>
                </div>
                <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true">
                  <polygon
                    points="20,4 36,14 36,26 20,36 4,26 4,14"
                    fill="none"
                    stroke="#E8202A"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="20,10 30,20 20,30 10,20"
                    fill="rgba(232,32,42,0.22)"
                    stroke="#FF6B73"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Quantitative Proof Band */}
        <div className="about-story-reveal mt-16 grid grid-cols-2 gap-8 border-t border-white/12 pt-12 sm:grid-cols-4">
          {ABOUT_STATS.map((stat) => (
            <div key={stat.id}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{stat.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
