import { useState } from 'react';
import {
  TECH_CATEGORIES,
  TECH_CONNECTIONS,
  TECH_STACK,
  type TechItem,
} from '../data/siteData';
import {
  computeOrbitalPosition,
  filterByCategory,
  getConnectedTechNames,
} from '../utils/siteLogic';

export function TechStackSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTech, setSelectedTech] = useState<TechItem>(TECH_STACK[0]);

  const filteredTech = filterByCategory(TECH_STACK, selectedCategory);
  const connectedNames = getConnectedTechNames(selectedTech.name, TECH_CONNECTIONS);

  const ring1 = TECH_STACK.filter((t) => t.ring === 1);
  const ring2 = TECH_STACK.filter((t) => t.ring === 2);
  const ring3 = TECH_STACK.filter((t) => t.ring === 3);

  const svgWidth = 740;
  const svgHeight = 680;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const nodeWidth = 104;
  const nodeHeight = 32;

  const ringMeta: Array<{ items: TechItem[]; radius: number; offset: number }> = [
    { items: ring1, radius: 128, offset: -Math.PI / 3 },
    { items: ring2, radius: 220, offset: -Math.PI / 2 },
    { items: ring3, radius: 310, offset: -Math.PI / 2 + Math.PI / 4 },
  ];

  // Compute coordinates lookup for rendering inter-technology dependency arcs
  const coordMap = new Map<string, { x: number; y: number }>();
  for (const spec of ringMeta) {
    spec.items.forEach((tech, idx) => {
      const pos = computeOrbitalPosition(idx, spec.items.length, spec.radius, spec.offset);
      coordMap.set(tech.name, { x: centerX + pos.x, y: centerY + pos.y });
    });
  }

  const isNodeActiveByCategory = (tech: TechItem) =>
    selectedCategory === 'All' || tech.category === selectedCategory;

  return (
    <section
      id="tech-stack"
      className="relative overflow-hidden border-b border-slate-200/80 bg-[#F7F7F7] py-24 text-[#1A2232] sm:py-32"
    >
      <div
        aria-hidden="true"
        className="bg-arch-grid-light pointer-events-none absolute inset-0 opacity-75"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
              Technology Ecosystem
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A2232] sm:text-5xl">
              An Interconnected Engineering Constellation
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
            Select any technology node to trace how frontend, backend, data, cloud, and AI layers
            wire together across production stacks.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter technologies by category"
          className="mt-10 flex flex-wrap gap-1.5 rounded-xl border border-slate-300/80 bg-[#ECEEF2] p-1.5"
        >
          {TECH_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedCategory(category);
                  const first = filterByCategory(TECH_STACK, category)[0];
                  if (first) setSelectedTech(first);
                }}
                className={`min-h-[38px] rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 sm:text-sm ${
                  active
                    ? 'bg-[#2F3A4F] text-white'
                    : 'text-slate-700 hover:bg-white/70 hover:text-[#1A2232]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
          {/* Desktop Connected Constellation SVG */}
          <div className="hidden justify-center lg:col-span-7 lg:flex">
            <div className="relative w-full max-w-[680px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="h-auto w-full"
                aria-label="Interactive technology constellation graph"
              >
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="128"
                  fill="none"
                  stroke="rgba(232,32,42,0.22)"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="220"
                  fill="none"
                  stroke="rgba(47,58,79,0.22)"
                  strokeDasharray="4 6"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="310"
                  fill="none"
                  stroke="rgba(26,34,50,0.12)"
                />

                {/* Inter-cluster animated connections highlighting edges from selected node */}
                {TECH_CONNECTIONS.map(([fromName, toName]) => {
                  const a = coordMap.get(fromName);
                  const b = coordMap.get(toName);
                  if (!a || !b) return null;
                  const touchesSelected =
                    fromName === selectedTech.name || toName === selectedTech.name;
                  return (
                    <line
                      key={`${fromName}-${toName}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={touchesSelected ? '#E8202A' : 'rgba(47,58,79,0.08)'}
                      strokeWidth={touchesSelected ? 1.8 : 0.9}
                      className={touchesSelected ? 'animate-signal-flow' : undefined}
                    />
                  );
                })}

                {/* Technology Cluster Nodes */}
                {TECH_STACK.map((tech) => {
                  const pos = coordMap.get(tech.name);
                  if (!pos) return null;
                  const isSelected = selectedTech.name === tech.name;
                  const isConnected = connectedNames.has(tech.name);
                  const matchesFilter = isNodeActiveByCategory(tech);
                  const displayLabel = tech.shortName ?? tech.name;

                  return (
                    <foreignObject
                      key={tech.name}
                      x={pos.x - nodeWidth / 2}
                      y={pos.y - nodeHeight / 2}
                      width={nodeWidth}
                      height={nodeHeight}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedTech(tech)}
                        onMouseEnter={() => setSelectedTech(tech)}
                        aria-label={tech.name}
                        className={`flex h-full w-full items-center justify-center rounded-lg border px-2 text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
                          isSelected
                            ? 'border-[#C81922] bg-[#E8202A] text-white shadow-md shadow-[#E8202A]/25'
                            : isConnected && matchesFilter
                              ? 'border-[#2F3A4F]/60 bg-white text-[#1A2232] shadow-xs'
                              : matchesFilter
                                ? 'border-slate-300 bg-white/95 text-slate-700 hover:border-[#E8202A]'
                                : 'border-slate-200 bg-white/50 text-slate-400 opacity-45'
                        }`}
                      >
                        <span>{displayLabel}</span>
                      </button>
                    </foreignObject>
                  );
                })}

                {/* Central Studio Core */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r="38"
                  fill="#2F3A4F"
                  stroke="#E8202A"
                  strokeWidth="2.2"
                />
                <text
                  x={centerX}
                  y={centerY - 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="800"
                >
                  GTS
                </text>
                <text
                  x={centerX}
                  y={centerY + 12}
                  textAnchor="middle"
                  fill="#FF8A90"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  STACK
                </text>
              </svg>
            </div>
          </div>

          {/* Right Inspection Card + Accessible Cluster Selector */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-slate-300/80 bg-[#1D2536] p-6 text-white shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs tracking-[0.15em] text-[#FF6B73] uppercase">
                  {selectedTech.category}
                </span>
                <span className="font-mono text-xs text-slate-300">
                  Cluster 0{selectedTech.ring}
                </span>
              </div>
              <h3 className="mt-2.5 text-2xl font-bold tracking-tight text-white">
                {selectedTech.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTech.role}</p>

              <p className="mt-4 border-t border-white/10 pt-3 font-mono text-[11px] text-slate-300">
                Connected Stack:{' '}
                <span className="text-[#FF8A90]">
                  {[...connectedNames].filter((n) => n !== selectedTech.name).join(' · ') ||
                    'Core Foundation'}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2">
              {filteredTech.map((tech) => {
                const isSelected = selectedTech.name === tech.name;
                return (
                  <button
                    key={tech.name}
                    type="button"
                    onClick={() => setSelectedTech(tech)}
                    className={`flex min-h-[44px] items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'border-[#E8202A] bg-[#E8202A] text-white'
                        : 'border-slate-300/80 bg-white text-[#1A2232] hover:border-[#E8202A]'
                    }`}
                  >
                    <span className="truncate">{tech.name}</span>
                    <span
                      className={`ml-2 font-mono text-[10px] ${
                        isSelected ? 'text-white/90' : 'text-slate-500'
                      }`}
                    >
                      {tech.category.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
