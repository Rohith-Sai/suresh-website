import React, { useEffect, useRef, useState } from 'react';
import { computeCardTilt, computeMagneticOffset } from '../utils/siteLogic';

function useFinePointerAndMotion() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerQuery = window.matchMedia('(pointer: fine)');

    const update = () => {
      setEnabled(!motionQuery.matches && pointerQuery.matches);
    };

    update();
    motionQuery.addEventListener('change', update);
    pointerQuery.addEventListener('change', update);
    return () => {
      motionQuery.removeEventListener('change', update);
      pointerQuery.removeEventListener('change', update);
    };
  }, []);

  return enabled;
}

/**
 * Subtle cursor-following radial spotlight rendered across the viewport.
 * Automatically disabled on touch devices and when prefers-reduced-motion is active.
 */
export function CursorSpotlight() {
  const enabled = useFinePointerAndMotion();
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let hasMoved = false;

    const tick = () => {
      rafId = 0;
      if (!hasMoved || !spotlightRef.current) return;

      const dx = targetX - currentX;
      const dy = targetY - currentY;

      if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
        currentX = targetX;
        currentY = targetY;
        spotlightRef.current.style.transform = `translate3d(${currentX - 240}px, ${currentY - 240}px, 0)`;
        return;
      }

      currentX += dx * 0.18;
      currentY += dy * 0.18;
      spotlightRef.current.style.transform = `translate3d(${currentX - 240}px, ${currentY - 240}px, 0)`;
      spotlightRef.current.style.opacity = '1';
      rafId = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        hasMoved = true;
        if (spotlightRef.current) {
          spotlightRef.current.style.transform = `translate3d(${currentX - 240}px, ${currentY - 240}px, 0)`;
          spotlightRef.current.style.opacity = '1';
        }
        return;
      }
      if (!rafId) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
    >
      <div
        ref={spotlightRef}
        style={{
          opacity: 0,
          width: '480px',
          height: '480px',
          background:
            'radial-gradient(circle, rgba(232, 32, 42, 0.075) 0%, rgba(47, 58, 79, 0.045) 38%, rgba(232, 32, 42, 0) 70%)',
          transition: 'opacity 300ms ease',
          willChange: 'transform',
        }}
        className="rounded-full"
      />
    </div>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  ariaLabel?: string;
}

/**
 * Primary CTA button or link with subtle magnetic cursor attraction.
 */
export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
  type = 'button',
  disabled = false,
  ariaLabel,
}: MagneticButtonProps) {
  const enabled = useFinePointerAndMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const elRef = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!enabled || disabled || !elRef.current) return;
    const rect = elRef.current.getBoundingClientRect();
    setOffset(computeMagneticOffset(e.clientX, e.clientY, rect, 6, false));
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const style: React.CSSProperties = {
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    transition:
      offset.x === 0 && offset.y === 0
        ? 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)'
        : 'transform 80ms linear',
  };

  if (href) {
    return (
      <a
        ref={(node) => {
          elRef.current = node;
        }}
        href={href}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={(node) => {
        elRef.current = node;
      }}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </button>
  );
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Interactive card wrapper providing subtle 3D tilt and localized border/surface glow.
 */
export function TiltCard({ children, className = '' }: TiltCardProps) {
  const enabled = useFinePointerAndMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const next = computeCardTilt(e.clientX, e.clientY, rect, 3.2, false);
    setTilt({ ...next, active: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, active: false });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: enabled
          ? `perspective(900px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
          : undefined,
        transition: tilt.active
          ? 'transform 90ms ease-out, border-color 180ms ease, box-shadow 180ms ease'
          : 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1), border-color 180ms ease, box-shadow 180ms ease',
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {enabled && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: tilt.active ? 1 : 0,
            background: `radial-gradient(280px circle at ${tilt.glowX}% ${tilt.glowY}%, rgba(232, 32, 42, 0.08), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}
