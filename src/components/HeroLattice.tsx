import { useEffect, useRef } from 'react';
import {
  generateComputationalLattice,
  interpolateParticleToLattice,
  project3DPoint,
  type Point3D,
} from '../utils/siteLogic';

interface HeroLatticeProps {
  pointerOffset: { x: number; y: number };
}

/**
 * Custom interactive 3D computational architectural ribbon & particle lattice.
 * Reacts smoothly to mouse parallax and scroll assembly while pausing offscreen
 * and honoring prefers-reduced-motion.
 */
export function HeroLattice({ pointerOffset }: HeroLatticeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef(pointerOffset);

  useEffect(() => {
    pointerRef.current = pointerOffset;
  }, [pointerOffset]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { points: latticePoints, edges } = generateComputationalLattice(14, 7, 170, 62);

    // Deterministic dispersed seed cloud for subtle scroll/ambient morphing
    const dispersedPoints: Point3D[] = latticePoints.map((pt, idx) => {
      const phase = idx * 1.6180339;
      return {
        x: pt.x + Math.sin(phase * 3.1) * 95,
        y: pt.y + Math.cos(phase * 2.3) * 75,
        z: pt.z + Math.sin(phase * 4.7) * 110,
      };
    });

    let width = 1200;
    let height = 760;
    let dpr = 1;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(280, Math.round(rect.width));
      height = Math.max(320, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    resizeCanvas();

    let rotY = 0.55;
    let rotX = 0.36;
    let smoothPtrX = 0;
    let smoothPtrY = 0;
    let morphProgress = 0.92;
    let isVisible = true;
    let rafId = 0;

    const drawFrame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Anchor sculpture asymmetrically right-center on wide viewports, centered on mobile
      const isWide = width >= 900;
      const cx = isWide ? width * 0.64 : width * 0.5;
      const cy = isWide ? height * 0.48 : height * 0.56;
      const scaleFactor = Math.min(width, height) / (isWide ? 470 : 420);

      // Architectural ambient orbital light rings
      ctx.save();
      ctx.strokeStyle = 'rgba(232, 32, 42, 0.12)';
      ctx.lineWidth = 1;
      for (const r of [190 * scaleFactor, 260 * scaleFactor]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.48, -0.32 + smoothPtrX * 0.06, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      const scrollShift = Math.min(1, window.scrollY / 600);
      const currentMorph = reducedMotion ? 1 : Math.max(0.55, morphProgress - scrollShift * 0.35);

      const projected = latticePoints.map((targetPt, idx) => {
        const morphed = interpolateParticleToLattice(
          dispersedPoints[idx],
          targetPt,
          currentMorph
        );
        return project3DPoint(
          {
            x: morphed.x * scaleFactor,
            y: morphed.y * scaleFactor,
            z: morphed.z * scaleFactor,
          },
          rotX + smoothPtrY * 0.24 + scrollShift * 0.4,
          rotY + smoothPtrX * 0.36,
          cx,
          cy,
          620
        );
      });

      // Draw kinetic lattice edges with depth-graded crimson-red & slate-navy lighting
      for (let eIdx = 0; eIdx < edges.length; eIdx++) {
        const [i, j] = edges[eIdx];
        const a = projected[i];
        const b = projected[j];
        const avgZ = (a.z + b.z) / 2;
        const alpha = Math.max(0.06, Math.min(0.45, 0.28 - avgZ / 480));
        if (eIdx % 5 === 0) {
          ctx.strokeStyle = `rgba(232, 32, 42, ${(alpha * 0.95).toFixed(3)})`;
        } else if (avgZ < -10) {
          ctx.strokeStyle = `rgba(255, 107, 115, ${(alpha * 0.78).toFixed(3)})`;
        } else {
          ctx.strokeStyle = `rgba(148, 163, 184, ${(alpha * 0.65).toFixed(3)})`;
        }
        ctx.lineWidth = avgZ < 0 ? 1.15 : 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Render glowing structural vertices on top
      for (let i = 0; i < projected.length; i++) {
        if (i % 2 !== 0) continue;
        const v = projected[i];
        const front = v.z < 10;
        const radius = Math.max(1.2, (front ? 2.5 : 1.35) * v.scale);
        ctx.fillStyle =
          i % 6 === 0
            ? 'rgba(232, 32, 42, 0.92)'
            : front
              ? 'rgba(226, 232, 240, 0.78)'
              : 'rgba(100, 116, 139, 0.42)';
        ctx.beginPath();
        ctx.arc(v.x, v.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = () => {
      rafId = 0;
      if (!isVisible || document.hidden) return;
      rotY += 0.0034;
      morphProgress = Math.min(1, morphProgress + 0.015);
      smoothPtrX += (pointerRef.current.x - smoothPtrX) * 0.07;
      smoothPtrY += (pointerRef.current.y - smoothPtrY) * 0.07;
      drawFrame();
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    drawFrame();
    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
          if (isVisible && !reducedMotion && !rafId) {
            rafId = window.requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    const onResize = () => {
      resizeCanvas();
      drawFrame();
    };
    const onVisibilityChange = () => {
      if (!document.hidden && isVisible && !reducedMotion && !rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(container);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="hero-computational-lattice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-[14%] right-[8%] h-[520px] w-[520px] rounded-full bg-radial from-[#E8202A]/16 via-[#2F3A4F]/22 to-transparent" />
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
