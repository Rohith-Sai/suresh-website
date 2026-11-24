import { Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { COMPANY_CONFIG } from '../data/siteData';
import { BrandLogo } from './BrandLogo';
import { MagneticButton } from './CursorEffects';

interface NavbarProps {
  onStartProject: () => void;
}

const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'services', label: 'Services', href: '#services' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export function Navbar({ onStartProject }: NavbarProps) {
  const [activeId, setActiveId] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const elements = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-38% 0px -52% 0px', threshold: 0.01 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-white/12 bg-[#1D2536]/88 px-3 py-2.5 text-white backdrop-blur-sm sm:gap-8 sm:px-5">
        {/* Zone 1: Official GTS Brand Logo + Clickable Homepage Link */}
        <a
          href="#home"
          aria-label={`${COMPANY_CONFIG.name} — Go to homepage`}
          className="group inline-flex min-w-0 shrink-0 items-center transition-transform duration-200 hover:scale-[1.02]"
        >
          <BrandLogo variant="navbar" src={logo} />
        </a>

        {/* Zone 2: 5 Concise Single-Line Links with Animated Active Indicator */}
        <nav aria-label="Primary Navigation" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setActiveId(link.id)}
                className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-active-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-lg border border-[#E8202A]/45 bg-[#2F3A4F]"
                    aria-hidden="true"
                  />
                )}
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Magnetic Primary Action & Mobile Drawer Toggle */}
        <div className="flex shrink-0 items-center gap-2">
          <MagneticButton
            onClick={onStartProject}
            className="hidden items-center justify-center rounded-xl bg-[#E8202A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#C81922] whitespace-nowrap shrink-0 md:inline-flex"
          >
            Let&apos;s Talk
          </MagneticButton>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <motion.nav
          id="mobile-navigation-drawer"
          aria-label="Mobile Navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="pointer-events-auto absolute inset-x-3 top-[4.7rem] z-50 rounded-2xl border border-white/15 bg-[#1D2536] p-3 text-white shadow-2xl md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setActiveId(link.id);
                  setMobileOpen(false);
                }}
                className={`flex min-h-[44px] items-center justify-between rounded-xl px-4 text-base font-medium transition-colors ${
                  activeId === link.id
                    ? 'bg-[#E8202A]/20 text-[#FF7D84]'
                    : 'text-slate-300 hover:bg-[#2F3A4F] hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onStartProject();
              }}
              className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#E8202A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#C81922]"
            >
              Let&apos;s Talk
            </button>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
