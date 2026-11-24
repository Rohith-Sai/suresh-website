export interface ContactFormInput {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  projectType: string;
  budgetRange: string;
  description: string;
}

export type ContactFormErrors = Partial<Record<keyof ContactFormInput, string>>;

export interface ContactSubmissionResult {
  ok: boolean;
  mode: 'api' | 'demo';
  referenceId: string;
  submittedAt: string;
  message: string;
}

export interface ElementBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Offset2D {
  x: number;
  y: number;
}

export interface Tilt3D {
  rotateX: number;
  rotateY: number;
  glowX: number;
  glowY: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface OrbitalBox {
  id: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+\d\s().-]{7,20}$/;

/**
 * Validates contact form fields deterministically.
 */
export function validateContactForm(input: ContactFormInput): ContactFormErrors {
  const errors: ContactFormErrors = {};

  const name = input.fullName.trim();
  if (!name) {
    errors.fullName = 'Please enter your full name.';
  } else if (name.length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  const email = input.email.trim();
  if (!email) {
    errors.email = 'Please enter your work or personal email address.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address (e.g., name@company.com).';
  }

  const phone = input.phone.trim();
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = 'Please enter a valid phone number with digits only.';
  }

  if (!input.projectType.trim()) {
    errors.projectType = 'Please select a project type.';
  }

  if (!input.budgetRange.trim()) {
    errors.budgetRange = 'Please select an estimated budget range.';
  }

  const description = input.description.trim();
  if (!description) {
    errors.description = 'Please share a brief overview of your project.';
  } else if (description.length < 20) {
    errors.description = 'Please provide at least 20 characters so we can scope your request.';
  }

  return errors;
}

export function hasValidationErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Filters collection items by category while supporting an "All" option.
 */
export function filterByCategory<T extends { category: string }>(
  items: readonly T[],
  selectedCategory: string
): T[] {
  if (!selectedCategory || selectedCategory === 'All') {
    return [...items];
  }
  return items.filter((item) => item.category === selectedCategory);
}

/**
 * Computes subtle magnetic button translation clamped to [-maxOffset, +maxOffset].
 */
export function computeMagneticOffset(
  cursorX: number,
  cursorY: number,
  bounds: ElementBounds,
  maxOffset = 7,
  reducedMotion = false
): Offset2D {
  if (reducedMotion || bounds.width <= 0 || bounds.height <= 0) {
    return { x: 0, y: 0 };
  }

  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const normX = Math.max(-1, Math.min(1, (cursorX - centerX) / (bounds.width / 2)));
  const normY = Math.max(-1, Math.min(1, (cursorY - centerY) / (bounds.height / 2)));

  return {
    x: Number((normX * maxOffset).toFixed(2)),
    y: Number((normY * maxOffset).toFixed(2)),
  };
}

/**
 * Computes subtle 3D tilt angles and localized spotlight percentage coordinates for cards.
 */
export function computeCardTilt(
  cursorX: number,
  cursorY: number,
  bounds: ElementBounds,
  maxDeg = 4,
  reducedMotion = false
): Tilt3D {
  if (reducedMotion || bounds.width <= 0 || bounds.height <= 0) {
    return { rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 };
  }

  const relX = Math.max(0, Math.min(1, (cursorX - bounds.left) / bounds.width));
  const relY = Math.max(0, Math.min(1, (cursorY - bounds.top) / bounds.height));

  const rotateY = Number(((relX - 0.5) * 2 * maxDeg).toFixed(2));
  const rotateX = Number(((0.5 - relY) * 2 * maxDeg).toFixed(2));

  return {
    rotateX,
    rotateY,
    glowX: Number((relX * 100).toFixed(1)),
    glowY: Number((relY * 100).toFixed(1)),
  };
}

/**
 * Projects a 3D point onto 2D viewport coordinates with Y/X rotation and perspective depth.
 */
export function project3DPoint(
  point: Point3D,
  rotX: number,
  rotY: number,
  centerX: number,
  centerY: number,
  fov = 560
): ProjectedPoint {
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);

  const x1 = point.x * cosY - point.z * sinY;
  const z1 = point.z * cosY + point.x * sinY;

  const y2 = point.y * cosX - z1 * sinX;
  const z2 = z1 * cosX + point.y * sinX;

  const scale = fov / Math.max(140, fov + z2);
  return {
    x: centerX + x1 * scale,
    y: centerY + y2 * scale,
    z: z2,
    scale,
  };
}

/**
 * Generates an architectural twisted ribbon / computational lattice in 3D space
 * for the Hero interactive sculpture.
 */
export function generateComputationalLattice(
  rings = 16,
  segments = 10,
  majorRadius = 150,
  minorRadius = 56
): { points: Point3D[]; edges: Array<[number, number]> } {
  if (rings <= 0 || segments <= 0) return { points: [], edges: [] };

  const points: Point3D[] = [];
  const edges: Array<[number, number]> = [];

  for (let i = 0; i < rings; i++) {
    const u = (i / rings) * Math.PI * 2;
    for (let j = 0; j < segments; j++) {
      const v = (j / segments) * Math.PI * 2 + u * 0.5;
      const radial = majorRadius + minorRadius * Math.cos(v);
      points.push({
        x: Math.cos(u) * radial,
        y: Math.sin(u) * radial * 0.85,
        z: minorRadius * Math.sin(v),
      });

      const current = i * segments + j;
      const nextInSeg = i * segments + ((j + 1) % segments);
      const nextRing = ((i + 1) % rings) * segments + j;
      edges.push([current, nextInSeg]);
      edges.push([current, nextRing]);
    }
  }

  return { points, edges };
}

/**
 * Interpolates smoothly between an ambient dispersed point and its architectural lattice target.
 */
export function interpolateParticleToLattice(
  dispersed: Point3D,
  lattice: Point3D,
  morphProgress: number
): Point3D {
  const t = Math.max(0, Math.min(1, morphProgress));
  return {
    x: dispersed.x + (lattice.x - dispersed.x) * t,
    y: dispersed.y + (lattice.y - dispersed.y) * t,
    z: dispersed.z + (lattice.z - dispersed.z) * t,
  };
}

/**
 * Computes progressive word reveal opacity (0.22..1.0) for editorial scroll storytelling.
 */
export function computeEditorialWordReveal(
  wordIndex: number,
  totalWords: number,
  scrollProgress: number
): number {
  if (totalWords <= 0) return 1;
  const clamped = Math.max(0, Math.min(1, scrollProgress));
  const threshold = wordIndex / Math.max(1, totalWords);
  const windowSize = 0.22;
  const local = Math.max(0, Math.min(1, (clamped - threshold * 0.78) / windowSize));
  return Number((0.22 + local * 0.78).toFixed(3));
}

/**
 * Computes orbital ring coordinates for technology constellation nodes.
 */
export function computeOrbitalPosition(
  index: number,
  totalInRing: number,
  radius: number,
  angleOffsetRad = 0
): Offset2D {
  if (totalInRing <= 0 || radius <= 0) {
    return { x: 0, y: 0 };
  }
  const angle = (index / totalInRing) * Math.PI * 2 + angleOffsetRad;
  return {
    x: Number((Math.cos(angle) * radius).toFixed(2)),
    y: Number((Math.sin(angle) * radius).toFixed(2)),
  };
}

/**
 * Checks whether any two rectangular orbital node boxes overlap (including required padding).
 */
export function findOverlappingBoxes(
  boxes: readonly OrbitalBox[],
  minPadding = 8
): Array<[string, string]> {
  const overlaps: Array<[string, string]> = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const dx = Math.abs(a.cx - b.cx);
      const dy = Math.abs(a.cy - b.cy);
      const requiredX = (a.width + b.width) / 2 + minPadding;
      const requiredY = (a.height + b.height) / 2 + minPadding;
      if (dx < requiredX && dy < requiredY) {
        overlaps.push([a.id, b.id]);
      }
    }
  }
  return overlaps;
}

/**
 * Computes directly connected technology names for interactive cluster highlighting.
 */
export function getConnectedTechNames(
  selectedName: string,
  connections: readonly (readonly [string, string])[]
): Set<string> {
  const related = new Set<string>([selectedName]);
  for (const [a, b] of connections) {
    if (a === selectedName) related.add(b);
    if (b === selectedName) related.add(a);
  }
  return related;
}

/**
 * Computes normalized workflow completion percentage for 0-based stage indices.
 */
export function computeWorkflowProgress(activeIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const clamped = Math.max(0, Math.min(totalSteps - 1, activeIndex));
  return Math.round(((clamped + 1) / totalSteps) * 100);
}

/**
 * Formats animated counter progress cleanly with tabular precision.
 */
export function formatStatCounter(target: number, suffix: string, progress: number): string {
  const clamped = Math.max(0, Math.min(1, progress));
  const eased = 1 - Math.pow(1 - clamped, 3);
  const current = Math.round(target * eased);
  return `${current}${suffix}`;
}

/**
 * Backend-ready contact inquiry adapter.
 */
export async function submitContactInquiry(
  payload: ContactFormInput,
  options?: {
    endpointUrl?: string;
    fetchImpl?: typeof fetch;
    delayMs?: number;
  }
): Promise<ContactSubmissionResult> {
  const errors = validateContactForm(payload);
  if (hasValidationErrors(errors)) {
    throw new Error('Validation failed before submission.');
  }

  const endpointUrl = options?.endpointUrl?.trim();
  const fetchFn = options?.fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  if (endpointUrl && fetchFn) {
    const response = await fetchFn(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      let detail = `Server responded with status ${response.status}.`;
      try {
        const body = (await response.json()) as { error?: string; message?: string };
        if (body.error || body.message) {
          detail = body.error || body.message || detail;
        }
      } catch {
        // Ignore JSON parse failure
      }
      throw new Error(detail);
    }

    let referenceId = `INQ-${Date.now().toString(36).toUpperCase()}`;
    try {
      const data = (await response.json()) as { referenceId?: string };
      if (data.referenceId) {
        referenceId = data.referenceId;
      }
    } catch {
      // Optional payload
    }

    return {
      ok: true,
      mode: 'api',
      referenceId,
      submittedAt: new Date().toISOString(),
      message: 'Your project inquiry has been transmitted to our engineering team.',
    };
  }

  const delay = options?.delayMs ?? 450;
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return {
    ok: true,
    mode: 'demo',
    referenceId: `PREVIEW-${Math.floor(100000 + Math.random() * 900000)}`,
    submittedAt: new Date().toISOString(),
    message:
      'Form validated cleanly in frontend preview mode. Connect an Express, Firebase, Supabase, or REST endpoint in siteData.ts to dispatch live emails.',
  };
}
