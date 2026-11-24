import gsap from 'gsap';
import { ArrowDown, ArrowRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { MagneticButton } from './CursorEffects';
import { HeroLattice } from './HeroLattice';

interface HeroSectionProps {
  onStartProject: () => void;
}

export function HeroSection({ onStartProject }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from('.hero-line-reveal', {
        y: 36,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches
    ) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    setPointerOffset({
      x: Number(nx.toFixed(3)),
      y: Number(ny.toFixed(3)),
    });
  };

  const handleMouseLeave = () => {
    setPointerOffset({ x: 0, y: 0 });
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[92vh] flex-col justify-between overflow-hidden bg-[#111722] pt-28 pb-12 text-white sm:pt-36 sm:pb-16"
    >
      {/* Subtle coordinate grid */}
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-75"
      />

      {/* Full-bleed interactive 3D computational sculpture */}
      <HeroLattice pointerOffset={pointerOffset} />

      {/* Subtle directional gradient scrim guaranteeing crisp headline legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#111722]/92 via-[#111722]/60 to-transparent"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4 sm:px-6 lg:px-8">
        {/* Top Metadata Rail (clean unboxed typography, zero pill enclosures) */}
        <div className="hero-line-reveal flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5 text-xs text-slate-400">
          <div className="flex flex-col gap-1 font-mono tracking-[0.14em] uppercase sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span className="text-[#FF6B73]">Digital Engineering Studio</span>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span>Software · Cloud · Applied AI</span>
          </div>
          <span className="hidden font-mono tracking-[0.14em] text-slate-400 uppercase sm:inline">
            Gollamudi Technology &amp; Software · Tech Needs Simplified
          </span>
        </div>

        {/* Monumental Asymmetric Staggered Editorial Headline */}
        <div className="my-auto py-12 sm:py-16">
          <h1 className="font-display max-w-full font-extrabold tracking-tight text-white">
            <span className="hero-line-reveal block text-[clamp(2.4rem,8vw,6.1rem)] leading-[0.96]">
              WE ENGINEER
            </span>
            <span className="hero-line-reveal mt-1 block text-[clamp(2.4rem,8vw,6.1rem)] leading-[0.98] sm:pl-[8%] lg:pl-[14%]">
              <span className="animate-gradient-text bg-linear-to-r from-white via-[#FF8A90] to-[#E8202A] bg-clip-text text-transparent">
                WHAT&apos;S NEXT.
              </span>
            </span>
          </h1>
        </div>

        {/* Bottom Asymmetric Split: Thesis Statement + Dual Actions + Scroll Cue */}
        <div className="hero-line-reveal grid items-end gap-8 border-t border-white/10 pt-8 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-6">
            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Complex ideas. Intelligent engineering. Digital products built for what&apos;s next—uniting
              custom software architecture, cloud platforms, and applied machine intelligence.
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-start justify-between gap-5 sm:flex-row sm:items-center lg:col-span-6 lg:justify-end">
            <div className="flex flex-wrap items-center gap-3">
              <MagneticButton
                href="#projects"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#E8202A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C81922] whitespace-nowrap shrink-0"
              >
                Explore Our Work
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </MagneticButton>

              <button
                type="button"
                onClick={onStartProject}
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/20 bg-[#2F3A4F]/45 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]/80 whitespace-nowrap shrink-0"
              >
                Start a Project
              </button>
            </div>

            <a
              href="#manifesto"
              className="hidden items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-white xl:inline-flex"
            >
              <span>Scroll</span>
              <ArrowDown className="h-3.5 w-3.5 text-[#FF6B73]" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
