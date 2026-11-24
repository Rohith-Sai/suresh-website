import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Layers, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import projectAiPlatformImg from '../assets/images/project_ai_platform_1795490189948.jpg';
import projectCloudOpsImg from '../assets/images/project_cloud_ops_1795490190840.jpg';
import projectFintechLedgerImg from '../assets/images/project_fintech_ledger_1795490188769.jpg';
import projectMobileCommerceImg from '../assets/images/project_mobile_commerce_1795490190318.jpg';
import {
  PORTFOLIO_PROJECTS,
  PROJECT_CATEGORIES,
  type ProjectItem,
} from '../data/siteData';
import { filterByCategory } from '../utils/siteLogic';
import { TiltCard } from './CursorEffects';

const PROJECT_MEDIA: Record<string, string> = {
  'atlas-treasury': projectFintechLedgerImg,
  'veritas-ai': projectAiPlatformImg,
  'swiftroute-mobile': projectMobileCommerceImg,
  'gridscale-cloud': projectCloudOpsImg,
};

interface PortfolioSectionProps {
  onStartSimilarProject: (projectTitle: string) => void;
}

const ENVIRONMENT_CLASSES: Record<ProjectItem['environment'], string> = {
  obsidian: 'bg-[#141B29] text-white border-white/10',
  cobalt: 'bg-[#2F3A4F] text-white border-[#E8202A]/25',
  stone: 'bg-[#ECEEF2] text-[#1A2232] border-slate-300',
  midnight: 'bg-[#1D2536] text-white border-white/12',
};

export function PortfolioSection({ onStartSimilarProject }: PortfolioSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visibleProjects = filterByCategory(PORTFOLIO_PROJECTS, selectedCategory);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [selectedCategory]);

  useEffect(() => {
    if (!activeProject) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveProject(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeProject]);

  return (
    <section id="projects" className="border-b border-slate-200/80 bg-[#F7F7F7] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
              Selected Engineering Work
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A2232] sm:text-5xl">
              Editorial Systems Built for Real Production Scale
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter portfolio projects by domain"
            className="flex shrink-0 flex-wrap gap-1.5 rounded-xl border border-slate-300/80 bg-[#ECEEF2] p-1.5"
          >
            {PROJECT_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#2F3A4F] text-white'
                      : 'text-slate-700 hover:text-[#1A2232]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Asymmetric Per-Project Visual Environments */}
        <div className="mt-14 space-y-10">
          {visibleProjects.map((project, idx) => {
            const reverse = idx % 2 === 1;
            const isLightEnv = project.environment === 'stone';
            return (
              <TiltCard
                key={project.id}
                className={`rounded-3xl border p-6 transition-shadow duration-300 hover:shadow-2xl sm:p-10 ${ENVIRONMENT_CLASSES[project.environment]}`}
              >
                <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                  {/* Editorial Full-Bleed Visual Frame */}
                  <div className={`lg:col-span-7 ${reverse ? 'lg:order-2' : ''}`}>
                    <div className="group relative aspect-16/10 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                      {!failedImages[project.id] ? (
                        <img
                          src={PROJECT_MEDIA[project.id] ?? project.imageUrl}
                          alt={project.imageAlt}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={() =>
                            setFailedImages((prev) => ({ ...prev, [project.id]: true }))
                          }
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center p-6">
                          <Layers className="h-10 w-10 text-[#FF6B73]" aria-hidden="true" />
                          <p className="mt-2 text-sm font-semibold">{project.title}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Asymmetric Narrative Story */}
                  <div className={`lg:col-span-5 ${reverse ? 'lg:order-1' : ''}`}>
                    <div className="flex items-center gap-3 text-xs">
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          isLightEnv ? 'text-[#C81922]' : 'text-[#FF6B73]'
                        }`}
                      >
                        {project.index}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-px w-6 ${isLightEnv ? 'bg-slate-400' : 'bg-white/25'}`}
                      />
                      <span className={isLightEnv ? 'text-slate-600' : 'text-slate-300'}>
                        {project.category} · {project.clientSector} · {project.year}
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {project.title}
                    </h3>

                    <p
                      className={`mt-4 text-sm leading-relaxed sm:text-base ${
                        isLightEnv ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      {project.description}
                    </p>

                    <p
                      className={`mt-5 border-y py-3 text-sm font-semibold ${
                        isLightEnv
                          ? 'border-slate-300/80 text-[#1A2232]'
                          : 'border-white/12 text-white'
                      }`}
                    >
                      {project.impactMetric}
                    </p>

                    <p
                      className={`mt-4 font-mono text-xs ${
                        isLightEnv ? 'text-slate-600' : 'text-slate-300'
                      }`}
                    >
                      {project.technologies.join(' · ')}
                    </p>

                    <div className="mt-7">
                      <button
                        type="button"
                        onClick={() => setActiveProject(project)}
                        className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          isLightEnv
                            ? 'bg-[#2F3A4F] text-white hover:bg-[#E8202A]'
                            : 'bg-[#E8202A] text-white hover:bg-[#C81922]'
                        }`}
                      >
                        Inspect Case Study
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              </TiltCard>
            );
          })}
        </div>
      </div>

      {/* Accessible Case Study Modal */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111722]/78 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveProject(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-[#F7F7F7] p-6 text-[#1A2232] shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold tracking-[0.14em] text-[#C81922] uppercase">
                  {activeProject.index} · {activeProject.category} · {activeProject.clientSector}
                </p>
                <h3
                  id="project-modal-title"
                  className="mt-2 text-2xl font-bold tracking-tight text-[#1A2232]"
                >
                  {activeProject.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                aria-label="Close project details"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-200 hover:text-[#1A2232]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 h-52 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-64">
              {!failedImages[activeProject.id] ? (
                <img
                  src={PROJECT_MEDIA[activeProject.id] ?? activeProject.imageUrl}
                  alt={activeProject.imageAlt}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <Layers className="h-10 w-10 text-[#E8202A]" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Overview &amp; Measurable Outcome
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {activeProject.description}
                </p>
                <p className="mt-2 rounded-lg border border-[#E8202A]/25 bg-[#E8202A]/8 px-4 py-2.5 text-sm font-semibold text-[#1A2232]">
                  Measured Impact: {activeProject.impactMetric}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Technical Architecture
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {activeProject.architectureSummary}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold tracking-[0.12em] text-slate-500 uppercase">
                  Stack Deployed
                </h4>
                <p className="mt-1.5 font-mono text-xs text-slate-600">
                  {activeProject.technologies.join(' · ')}
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                className="min-h-[42px] rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200/70"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = activeProject.title;
                  setActiveProject(null);
                  onStartSimilarProject(title);
                }}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#E8202A] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C81922]"
              >
                Build a Similar System
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
