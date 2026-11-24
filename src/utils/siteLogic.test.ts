import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPANY_CONFIG, TECH_CONNECTIONS, TECH_STACK } from '../data/siteData';
import {
  computeCardTilt,
  computeEditorialWordReveal,
  computeMagneticOffset,
  computeOrbitalPosition,
  computeWorkflowProgress,
  filterByCategory,
  findOverlappingBoxes,
  formatStatCounter,
  generateComputationalLattice,
  getConnectedTechNames,
  hasValidationErrors,
  interpolateParticleToLattice,
  project3DPoint,
  submitContactInquiry,
  validateContactForm,
  type ContactFormInput,
  type OrbitalBox,
} from './siteLogic';

const validPayload: ContactFormInput = {
  fullName: 'Aarav Mehta',
  email: 'aarav@acme-corp.io',
  phone: '+91 98765 43210',
  companyName: 'Acme Logistics',
  projectType: 'Custom Software Engineering',
  budgetRange: '$15,000 – $35,000',
  description: 'We need a multi-tenant dispatch and real-time fleet tracking web application.',
};

test('validateContactForm passes on complete valid input', () => {
  const errors = validateContactForm(validPayload);
  assert.equal(hasValidationErrors(errors), false);
});

test('validateContactForm flags missing required fields and malformed email/phone', () => {
  const errors = validateContactForm({
    fullName: ' ',
    email: 'not-an-email',
    phone: 'abc',
    projectType: '',
    budgetRange: '',
    companyName: '',
    description: 'Too short',
  });

  assert.equal(hasValidationErrors(errors), true);
  assert.ok(errors.fullName);
  assert.ok(errors.email);
  assert.ok(errors.phone);
  assert.ok(errors.projectType);
  assert.ok(errors.budgetRange);
  assert.ok(errors.description);
});

test('filterByCategory returns all items for "All" and exact matches for specific category', () => {
  const items = [
    { name: 'React', category: 'Frontend' },
    { name: 'Node.js', category: 'Backend' },
    { name: 'Docker', category: 'DevOps' },
  ];

  assert.equal(filterByCategory(items, 'All').length, 3);
  assert.deepEqual(
    filterByCategory(items, 'Backend').map((i) => i.name),
    ['Node.js']
  );
});

test('computeMagneticOffset and computeCardTilt clamp values and respect reducedMotion', () => {
  const bounds = { left: 100, top: 100, width: 160, height: 48 };
  assert.deepEqual(computeMagneticOffset(400, 124, bounds, 7, false), { x: 7, y: 0 });
  assert.deepEqual(computeMagneticOffset(400, 124, bounds, 7, true), { x: 0, y: 0 });

  const tilt = computeCardTilt(0, 0, { left: 0, top: 0, width: 200, height: 200 }, 4, false);
  assert.equal(tilt.rotateX, 4);
  assert.equal(tilt.rotateY, -4);
  assert.deepEqual(
    computeCardTilt(0, 0, { left: 0, top: 0, width: 200, height: 200 }, 4, true),
    { rotateX: 0, rotateY: 0, glowX: 50, glowY: 50 }
  );
});

test('generateComputationalLattice and interpolateParticleToLattice produce valid geometry', () => {
  const { points, edges } = generateComputationalLattice(8, 6, 140, 48);
  assert.equal(points.length, 48);
  assert.equal(edges.length, 96);

  const origin = { x: 0, y: 0, z: 0 };
  const target = { x: 100, y: -60, z: 40 };
  assert.deepEqual(interpolateParticleToLattice(origin, target, 0), origin);
  assert.deepEqual(interpolateParticleToLattice(origin, target, 1), target);
  assert.deepEqual(interpolateParticleToLattice(origin, target, 0.5), { x: 50, y: -30, z: 20 });
});

test('project3DPoint projects front-facing point larger than back-facing point', () => {
  const front = project3DPoint({ x: 50, y: 0, z: -100 }, 0, 0, 200, 200, 500);
  const back = project3DPoint({ x: 50, y: 0, z: 100 }, 0, 0, 200, 200, 500);
  assert.ok(front.scale > back.scale);
  assert.ok(front.x > back.x);
});

test('computeEditorialWordReveal scales smoothly from 0.22 to 1.0', () => {
  assert.equal(computeEditorialWordReveal(0, 10, 0), 0.22);
  assert.equal(computeEditorialWordReveal(9, 10, 1), 1);
  assert.ok(computeEditorialWordReveal(0, 10, 0.5) > computeEditorialWordReveal(9, 10, 0.5));
});

test('orbital constellation nodes have zero overlap and stay within SVG bounds', () => {
  const svgWidth = 740;
  const svgHeight = 680;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const nodeWidth = 104;
  const nodeHeight = 32;

  const ringSpecs: Array<{ ring: 1 | 2 | 3; radius: number; offset: number }> = [
    { ring: 1, radius: 128, offset: -Math.PI / 3 },
    { ring: 2, radius: 220, offset: -Math.PI / 2 },
    { ring: 3, radius: 310, offset: -Math.PI / 2 + Math.PI / 4 },
  ];

  const boxes: OrbitalBox[] = [
    { id: 'MERIDIAN_CORE', cx: centerX, cy: centerY, width: 76, height: 76 },
  ];

  for (const spec of ringSpecs) {
    const items = TECH_STACK.filter((t) => t.ring === spec.ring);
    items.forEach((tech, idx) => {
      const pos = computeOrbitalPosition(idx, items.length, spec.radius, spec.offset);
      const cx = centerX + pos.x;
      const cy = centerY + pos.y;
      assert.ok(cx - nodeWidth / 2 >= 0, `${tech.name} overflows left bound`);
      assert.ok(cx + nodeWidth / 2 <= svgWidth, `${tech.name} overflows right bound`);
      assert.ok(cy - nodeHeight / 2 >= 0, `${tech.name} overflows top bound`);
      assert.ok(cy + nodeHeight / 2 <= svgHeight, `${tech.name} overflows bottom bound`);
      boxes.push({ id: tech.name, cx, cy, width: nodeWidth, height: nodeHeight });
    });
  }

  const overlaps = findOverlappingBoxes(boxes, 10);
  assert.deepEqual(overlaps, []);
});

test('getConnectedTechNames resolves bidirectional technology cluster links', () => {
  const connected = getConnectedTechNames('Python', TECH_CONNECTIONS);
  assert.ok(connected.has('Python'));
  assert.ok(connected.has('AI & ML'));
  assert.ok(connected.has('Docker'));
  assert.equal(connected.has('React'), false);
});

test('computeWorkflowProgress and formatStatCounter return expected bounds', () => {
  assert.equal(computeWorkflowProgress(0, 7), 14);
  assert.equal(computeWorkflowProgress(6, 7), 100);
  assert.equal(formatStatCounter(140, '+', 0), '0+');
  assert.equal(formatStatCounter(140, '+', 1), '140+');
});

test('submitContactInquiry validates and supports both preview and endpoint modes', async () => {
  const preview = await submitContactInquiry(validPayload, { delayMs: 0 });
  assert.equal(preview.mode, 'demo');
  assert.ok(preview.referenceId.startsWith('PREVIEW-'));

  const mockFetch = (async () =>
    new Response(JSON.stringify({ referenceId: 'API-4040' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })) as unknown as typeof fetch;

  const live = await submitContactInquiry(validPayload, {
    endpointUrl: '/api/contact',
    fetchImpl: mockFetch,
  });
  assert.equal(live.mode, 'api');
  assert.equal(live.referenceId, 'API-4040');
});

test('COMPANY_CONFIG exposes verified Gollamudi Technology and Software branding and links', () => {
  assert.equal(COMPANY_CONFIG.name, 'Gollamudi Technology and Software');
  assert.equal(COMPANY_CONFIG.tagline, 'TECH NEEDS SIMPLIFIED');
  assert.equal(
    COMPANY_CONFIG.logoSrc,
    '/src/assets/logo.png'
  );
  assert.equal(COMPANY_CONFIG.phone, '+91 90524 23412');
  assert.equal(COMPANY_CONFIG.phoneHref, 'tel:+919052423412');
  assert.equal(COMPANY_CONFIG.email, 'Rosy@gtands.com');
  assert.equal(COMPANY_CONFIG.emailHref, 'mailto:Rosy@gtands.com');
  assert.equal(COMPANY_CONFIG.office.directionsUrl, 'https://maps.app.goo.gl/HQRcz2hLjuBReQLt9');

  const linkedIn = COMPANY_CONFIG.socials.find((s) => s.id === 'linkedin');
  const instagram = COMPANY_CONFIG.socials.find((s) => s.id === 'instagram');
  assert.equal(linkedIn?.href, 'https://www.linkedin.com/company/gollamudi-technology-and-software/');
  assert.equal(
    instagram?.href,
    'https://www.instagram.com/gollamudi_technology_software?cnvx=YTk2Z2s5b2NqbzJ6'
  );
});
