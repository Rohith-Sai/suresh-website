export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortLabel: string;
  description: string;
  architectureFocus: string;
  deliverables: string[];
  stackPreview: string[];
  visualTheme:
    | 'software'
    | 'web'
    | 'mobile'
    | 'ai'
    | 'design'
    | 'cloud'
    | 'enterprise'
    | 'strategy';
}

export interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  context: string;
}

export interface TechItem {
  name: string;
  shortName?: string;
  category: 'Frontend' | 'Backend' | 'AI & ML' | 'Cloud' | 'Database' | 'DevOps';
  role: string;
  ring: 1 | 2 | 3;
}

export interface ProjectItem {
  id: string;
  index: string;
  title: string;
  category: 'Web & Cloud' | 'AI & ML' | 'Mobile' | 'Enterprise';
  clientSector: string;
  year: string;
  description: string;
  impactMetric: string;
  architectureSummary: string;
  technologies: string[];
  imageUrl: string;
  imageAlt: string;
  environment: 'obsidian' | 'cobalt' | 'stone' | 'midnight';
}

export interface WorkflowStep {
  step: string;
  title: string;
  summary: string;
  outcome: string;
  deliverables: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const COMPANY_CONFIG = {
  name: 'Gollamudi Technology and Software',
  shortName: 'GTS',
  legalName: 'Gollamudi Technology and Software',
  tagline: 'TECH NEEDS SIMPLIFIED',
  logoSrc: '/src/assets/logo.png',
  description:
    'Gollamudi Technology and Software (GTS) delivers custom software engineering, web & mobile platforms, cloud architecture, and applied AI systems built to simplify complex business technology.',
  phone: '+91 90524 23412',
  phoneHref: 'tel:+919052423412',
  email: 'Rosy@gtands.com',
  emailHref: 'mailto:Rosy@gtands.com',
  office: {
    companyName: 'Gollamudi Technology and Software',
    directionsUrl: 'https://maps.app.goo.gl/HQRcz2hLjuBReQLt9',
  },
  contactApiEndpoint: '',
  socials: [
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/gollamudi-technology-and-software/',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: 'https://www.instagram.com/gollamudi_technology_software?cnvx=YTk2Z2s5b2NqbzJ6',
    },
  ],
};

export const STUDIO_PRINCIPLES = [
  {
    id: 'curiosity',
    index: '01',
    title: 'Curiosity First',
    summary:
      'Every durable system begins by questioning inherited assumptions—mapping actual operational physics before writing a single module.',
  },
  {
    id: 'precision',
    index: '02',
    title: 'Architectural Precision',
    summary:
      'Deterministic state machines, strict type contracts, and automated telemetry replace guesswork with predictable engineering velocity.',
  },
  {
    id: 'craft',
    index: '03',
    title: 'Kinetic Craft',
    summary:
      'Design and systems engineering happen in the same room. Every transition, typeface scale, and API response works as one instrument.',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'custom-software',
    number: '01',
    title: 'Custom Software Engineering',
    shortLabel: 'Core Systems',
    description:
      'Bespoke transactional engines, domain-specific software platforms, and resilient backend architectures designed around your exact business rules.',
    architectureFocus: 'Clean domain boundaries, deterministic state machines & zero-regression CI suites.',
    deliverables: ['Domain Architecture', 'Modular Codebase', 'Automated CI Tests'],
    stackPreview: ['TypeScript', 'Node.js', 'Python', 'PostgreSQL'],
    visualTheme: 'software',
  },
  {
    id: 'web-platforms',
    number: '02',
    title: 'Web & Digital Platforms',
    shortLabel: 'Web Systems',
    description:
      'Edge-rendered digital platforms, interactive SaaS workspaces, and customer-facing products crafted for sub-second fluidity.',
    architectureFocus: 'Edge SSR delivery, WCAG AA accessibility & optimistic real-time client sync.',
    deliverables: ['React & Next.js Apps', 'Design Token Engine', 'Core Web Vitals Tuning'],
    stackPreview: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    visualTheme: 'web',
  },
  {
    id: 'mobile-apps',
    number: '03',
    title: 'Mobile Applications',
    shortLabel: 'iOS & Android',
    description:
      'Native-grade mobile experiences built with offline-first mutation queues, hardware-backed security, and 60fps tactile gestures.',
    architectureFocus: 'Offline persistence, encrypted local storage & automated store release pipelines.',
    deliverables: ['iOS & Android Builds', 'Offline Sync Engine', 'Biometric Auth Flow'],
    stackPreview: ['React Native', 'TypeScript', 'Swift', 'Kotlin'],
    visualTheme: 'mobile',
  },
  {
    id: 'ai-systems',
    number: '04',
    title: 'AI & Intelligent Systems',
    shortLabel: 'Applied AI',
    description:
      'Private retrieval-augmented AI workspaces, autonomous workflow agents, and custom predictive models anchored by deterministic evals.',
    architectureFocus: 'Grounded citations, tenant-isolated vector indices & inference guardrails.',
    deliverables: ['RAG & Agent Pipelines', 'Eval Harness Suite', 'Inference Guardrails'],
    stackPreview: ['Python', 'AI & ML', 'PostgreSQL', 'Docker'],
    visualTheme: 'ai',
  },
  {
    id: 'ui-ux-design',
    number: '05',
    title: 'UI/UX & Product Design',
    shortLabel: 'Product Craft',
    description:
      'Editorial product systems, interactive motion prototypes, and clear user journeys that turn dense technical workflows into effortless software.',
    architectureFocus: 'Typographic hierarchy, calibrated motion curves & developer-ready design tokens.',
    deliverables: ['Interactive Prototypes', 'Token Design System', 'Motion Choreography'],
    stackPreview: ['Figma', 'Motion Specs', 'Design Tokens', 'WCAG AA'],
    visualTheme: 'design',
  },
  {
    id: 'cloud-devops',
    number: '06',
    title: 'Cloud & DevOps',
    shortLabel: 'Cloud & SRE',
    description:
      'Multi-region infrastructure-as-code, containerized Kubernetes/Docker clusters, zero-downtime deployment gates, and full-stack observability.',
    architectureFocus: 'Automated blue-green rollouts, least-privilege IAM & predictable cloud unit economics.',
    deliverables: ['Terraform / IaC', 'Docker Orchestration', 'SLO Telemetry Stack'],
    stackPreview: ['AWS', 'Azure', 'Docker', 'Cloud Mesh'],
    visualTheme: 'cloud',
  },
  {
    id: 'enterprise-engineering',
    number: '07',
    title: 'Enterprise Engineering',
    shortLabel: 'Enterprise',
    description:
      'Multi-tenant enterprise platforms, legacy ERP/CRM bridges, row-level access governance, and immutable compliance audit trails.',
    architectureFocus: 'Strict tenant isolation, SSO/SAML federation & high-throughput event streaming.',
    deliverables: ['Multi-Tenant RBAC', 'Legacy API Bridges', 'Audit & Compliance Logs'],
    stackPreview: ['Java', 'C++', 'PostgreSQL', 'AWS'],
    visualTheme: 'enterprise',
  },
  {
    id: 'digital-strategy',
    number: '08',
    title: 'Digital Strategy & Consulting',
    shortLabel: 'Advisory',
    description:
      'Technical due diligence, monolith decomposition blueprints, and pragmatic architectural roadmaps that unlock long-term engineering velocity.',
    architectureFocus: 'Strangler-fig migration patterns, latency profiling & build-vs-buy clarity.',
    deliverables: ['Architecture Audit', 'Modernization Plan', 'Engineering Roadmap'],
    stackPreview: ['System Audits', 'Migration Plan', 'Tech Advisory'],
    visualTheme: 'strategy',
  },
];

export const ABOUT_STATS: StatItem[] = [
  {
    id: 'projects',
    value: 140,
    suffix: '+',
    label: 'Systems Shipped',
    context: 'Web, mobile, enterprise & AI',
  },
  {
    id: 'clients',
    value: 65,
    suffix: '+',
    label: 'Partner Teams',
    context: 'Venture-backed to Fortune 500',
  },
  {
    id: 'technologies',
    value: 25,
    suffix: '+',
    label: 'Core Technologies',
    context: 'Full-stack, cloud & applied ML',
  },
  {
    id: 'experience',
    value: 9,
    suffix: '+',
    label: 'Years Engineering',
    context: 'Production delivery track record',
  },
];

export const TECH_CATEGORIES = [
  'All',
  'Frontend',
  'Backend',
  'AI & ML',
  'Cloud',
  'Database',
  'DevOps',
] as const;

export const TECH_STACK: TechItem[] = [
  { name: 'React', category: 'Frontend', role: 'Component-driven UI & concurrent rendering', ring: 1 },
  { name: 'Next.js', category: 'Frontend', role: 'Edge SSR & full-stack web delivery', ring: 1 },
  { name: 'TypeScript', category: 'Frontend', role: 'End-to-end static type guarantees', ring: 1 },
  { name: 'Node.js', category: 'Backend', role: 'High-concurrency API & stream runtime', ring: 1 },
  { name: 'Python', category: 'Backend', role: 'AI workflows, data & backend services', ring: 1 },
  { name: 'AI & ML', category: 'AI & ML', role: 'RAG systems, agents & predictive models', ring: 1 },

  { name: 'JavaScript', category: 'Frontend', role: 'Core browser & cross-runtime execution', ring: 2 },
  { name: 'Java', category: 'Backend', role: 'Resilient distributed enterprise services', ring: 2 },
  { name: 'C++', category: 'Backend', role: 'Low-latency compute & systems kernels', ring: 2 },
  { name: 'PostgreSQL', category: 'Database', role: 'ACID relational & pgvector persistence', ring: 2 },
  { name: 'Docker', category: 'DevOps', role: 'Deterministic container build & runtime', ring: 2 },
  { name: 'AWS', category: 'Cloud', role: 'Global compute, storage & edge routing', ring: 2 },

  { name: 'Cloud', category: 'Cloud', role: 'Multi-region high-availability topology', ring: 3 },
  { name: 'Azure', category: 'Cloud', role: 'Enterprise cloud & identity ecosystems', ring: 3 },
  { name: 'MongoDB', category: 'Database', role: 'Flexible high-throughput document stores', ring: 3 },
  { name: 'MySQL', category: 'Database', role: 'Structured transactional data engines', ring: 3 },
];

export const TECH_CONNECTIONS: Array<[string, string]> = [
  ['React', 'TypeScript'],
  ['React', 'Next.js'],
  ['React', 'JavaScript'],
  ['Next.js', 'TypeScript'],
  ['Next.js', 'Node.js'],
  ['Next.js', 'Cloud'],
  ['TypeScript', 'Node.js'],
  ['JavaScript', 'Node.js'],
  ['Node.js', 'PostgreSQL'],
  ['Node.js', 'MongoDB'],
  ['Node.js', 'Docker'],
  ['Python', 'AI & ML'],
  ['Python', 'PostgreSQL'],
  ['Python', 'Docker'],
  ['AI & ML', 'AWS'],
  ['AI & ML', 'Cloud'],
  ['Java', 'PostgreSQL'],
  ['Java', 'MySQL'],
  ['Java', 'AWS'],
  ['C++', 'Docker'],
  ['Docker', 'AWS'],
  ['Docker', 'Azure'],
  ['Docker', 'Cloud'],
  ['AWS', 'Cloud'],
  ['Azure', 'Cloud'],
];

export const PROJECT_CATEGORIES = [
  'All',
  'Enterprise',
  'AI & ML',
  'Mobile',
  'Web & Cloud',
] as const;

export const PORTFOLIO_PROJECTS: ProjectItem[] = [
  {
    id: 'atlas-treasury',
    index: '01',
    title: 'Atlas Treasury & Settlement Hub',
    category: 'Enterprise',
    clientSector: 'Institutional FinTech',
    year: '2026',
    description:
      'Unified multi-currency liquidity console and automated ledger reconciliation platform orchestrating real-time institutional treasury flows.',
    impactMetric: '64% faster month-end close across 18 global banking rails',
    architectureSummary:
      'Engineered an event-sourced TypeScript and PostgreSQL ledger core with role-based approval policies, live WebSocket streaming, and anomaly detection.',
    technologies: ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
    imageUrl: 'atlas-treasury',
    imageAlt: 'Atlas Treasury analytics dashboard rendered on a studio display',
    environment: 'obsidian',
  },
  {
    id: 'veritas-ai',
    index: '02',
    title: 'Veritas Knowledge & Workflow Copilot',
    category: 'AI & ML',
    clientSector: 'Legal & Compliance',
    year: '2026',
    description:
      'Private retrieval-augmented AI workspace enabling legal and compliance teams to interrogate contracts and policies with verifiable citations.',
    impactMetric: '4.2 hours saved per analyst weekly with 98% citation traceability',
    architectureSummary:
      'Combined hybrid semantic and lexical search in Python with strict tenant isolation, automated evaluation suites, and human review workflows.',
    technologies: ['Python', 'AI & ML', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    imageUrl: 'veritas-ai',
    imageAlt: 'Veritas AI infrastructure hardware and optical data routing visualization',
    environment: 'cobalt',
  },
  {
    id: 'swiftroute-mobile',
    index: '03',
    title: 'SwiftRoute Banking & Fleet Companion',
    category: 'Mobile',
    clientSector: 'Logistics & Mobility',
    year: '2025',
    description:
      'Offline-first mobile platform uniting instant driver expense settlement, biometric security, and live GPS route telemetry.',
    impactMetric: '99.94% crash-free sessions across 45,000+ active field devices',
    architectureSummary:
      'Built resilient background sync queues backed by Node.js microservices, MongoDB telemetry streams, and hardware-backed session tokens.',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
    imageUrl: 'swiftroute-mobile',
    imageAlt: 'Two smartphones displaying mobile banking and live logistics tracking screens',
    environment: 'stone',
  },
  {
    id: 'gridscale-cloud',
    index: '04',
    title: 'GridScale Multi-Region Cloud Mesh',
    category: 'Web & Cloud',
    clientSector: 'Cloud Infrastructure',
    year: '2025',
    description:
      'Zero-downtime container orchestration control plane and automated failover topology built for global SaaS workloads.',
    impactMetric: '38% lower cloud compute spend with 99.99% availability SLA',
    architectureSummary:
      'Automated Terraform clusters across AWS and Azure, containerized workloads with Docker, and blue-green deployment gates.',
    technologies: ['AWS', 'Azure', 'Docker', 'Cloud', 'Node.js', 'React'],
    imageUrl: 'gridscale-cloud',
    imageAlt: 'Modular cloud server rack and network layer architecture visualization',
    environment: 'midnight',
  },
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: '01',
    title: 'Discover',
    summary:
      'Stakeholder interviews, technical baseline audits, and user workflow mapping to uncover real constraints and high-leverage opportunities.',
    outcome: 'Shared clarity on scope, constraints & measurable KPIs',
    deliverables: ['Problem & Opportunity Brief', 'Technical Baseline Audit'],
  },
  {
    step: '02',
    title: 'Define',
    summary:
      'System architecture blueprints, data contracts, build-vs-buy trade-offs, security posture planning, and milestone delivery sequencing.',
    outcome: 'De-risked architectural blueprint with crisp milestones',
    deliverables: ['System Topology Blueprint', 'Phased Delivery Roadmap'],
  },
  {
    step: '03',
    title: 'Design',
    summary:
      'Information architecture, interactive motion prototypes, and accessible token-driven design systems validated prior to full build.',
    outcome: 'Cohesive visual language & validated user flows',
    deliverables: ['Interactive Motion Prototype', 'Tokenized Design System'],
  },
  {
    step: '04',
    title: 'Develop',
    summary:
      'Clean, modular two-week sprints shipping type-safe frontend, backend, mobile, and applied AI modules into continuous staging.',
    outcome: 'Maintainable codebase with bi-weekly shippable builds',
    deliverables: ['Type-Safe Core Modules', 'API & Schema Contracts'],
  },
  {
    step: '05',
    title: 'Validate',
    summary:
      'Automated unit, integration, and end-to-end checks paired with accessibility verification, load profiling, and security testing.',
    outcome: 'Verified reliability, speed & WCAG AA compliance',
    deliverables: ['Automated Test Suite', 'Performance & Security Audit'],
  },
  {
    step: '06',
    title: 'Deploy',
    summary:
      'Zero-downtime production rollouts via automated CI/CD pipelines, real-time telemetry alerts, and verified rollback safeguards.',
    outcome: 'Smooth production cutover with full observability',
    deliverables: ['Automated CI/CD Release', 'Live Telemetry & Runbooks'],
  },
  {
    step: '07',
    title: 'Evolve',
    summary:
      'Post-launch SLA stewardship, telemetry-informed product iteration, cloud unit-cost tuning, and capability expansion at scale.',
    outcome: 'Sustained velocity, uptime & long-term product health',
    deliverables: ['Proactive SLA Patching', 'Iterative Capability Sprints'],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-services',
    question: 'What services do you provide?',
    answer:
      'We deliver end-to-end digital engineering: custom software engineering, web and digital platforms, mobile applications, AI and intelligent systems, UI/UX and product design, cloud and DevOps, enterprise engineering, and digital strategy consulting.',
  },
  {
    id: 'faq-approach',
    question: 'How do you approach development?',
    answer:
      'Every engagement moves through seven structured phases—Discover, Define, Design, Develop, Validate, Deploy, and Evolve. Senior product designers and systems engineers collaborate in unified pods with bi-weekly demos and full repository transparency.',
  },
  {
    id: 'faq-technologies',
    question: 'Which technologies do you use?',
    answer:
      'Our core stack includes React, Next.js, JavaScript, TypeScript, Node.js, Python, Java, C++, AI & ML frameworks, PostgreSQL, MongoDB, MySQL, Docker, AWS, and Azure—chosen pragmatically to fit your latency, scale, and maintainability requirements.',
  },
  {
    id: 'faq-timeline',
    question: 'How long does a project take?',
    answer:
      'Focused product launches and interactive web platforms typically ship in 6 to 10 weeks. Multi-module enterprise platforms, native mobile ecosystems, or custom AI pipelines usually run 3 to 6 months with progressive production releases.',
  },
  {
    id: 'faq-support',
    question: 'Do you provide support?',
    answer:
      'Yes. Every production launch includes stabilization coverage followed by flexible SLA retainers for 24/7 observability, security patching, cloud optimization, and ongoing product evolution.',
  },
  {
    id: 'faq-ai',
    question: 'Can you build custom AI solutions?',
    answer:
      'Yes. We architect private retrieval-augmented generation (RAG) workspaces, automated workflow agents, structured document extraction, and predictive analytics backed by deterministic evaluation suites and strict data governance.',
  },
];

export const PROJECT_TYPE_OPTIONS = SERVICES.map((s) => s.title);

export const BUDGET_RANGE_OPTIONS = [
  'Under $15,000',
  '$15,000 – $35,000',
  '$35,000 – $75,000',
  '$75,000 – $150,000',
  '$150,000+',
];
