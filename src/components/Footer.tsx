import { ExternalLink, Mail, MapPin, Navigation, Phone, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { COMPANY_CONFIG } from '../data/siteData';
import { BrandLogo } from './BrandLogo';
import { InstagramIcon, LinkedInIcon } from './SocialIcons';

type LegalDoc = 'privacy' | 'terms' | null;

export function Footer() {
  const [legalDoc, setLegalDoc] = useState<LegalDoc>(null);

  useEffect(() => {
    if (!legalDoc) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLegalDoc(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [legalDoc]);

  const linkedIn = COMPANY_CONFIG.socials.find((s) => s.id === 'linkedin');
  const instagram = COMPANY_CONFIG.socials.find((s) => s.id === 'instagram');

  return (
    <footer className="relative overflow-hidden border-t-4 border-[#E8202A] bg-[#1D2536] text-slate-200">
      <div
        aria-hidden="true"
        className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-30"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* 4-Column Corporate Footer Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Company Branding */}
          <div>
            <a
              href="#home"
              aria-label={`${COMPANY_CONFIG.name} — Back to homepage`}
              className="group inline-flex items-center transition-transform duration-200 hover:scale-[1.02]"
            >
              <BrandLogo variant="footer" />
            </a>

            <h3 className="mt-4 text-base font-bold tracking-tight text-white">
              {COMPANY_CONFIG.name}
            </h3>
            <p className="mt-1.5 inline-block rounded bg-[#E8202A] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.14em] text-white uppercase">
              {COMPANY_CONFIG.tagline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {COMPANY_CONFIG.description}
            </p>
          </div>

          {/* Column 2 — Contact Information */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] text-white uppercase">
              Contact Information
            </h3>
            <div className="mt-5 space-y-4 text-sm">
              <a
                href={COMPANY_CONFIG.phoneHref}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-[#2F3A4F]/60 p-3.5 text-white transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                  <Phone className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[11px] font-medium text-slate-300 uppercase">
                    Phone
                  </span>
                  <span className="mt-0.5 block font-mono font-semibold text-white">
                    {COMPANY_CONFIG.phone}
                  </span>
                </span>
              </a>

              <a
                href={COMPANY_CONFIG.emailHref}
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-[#2F3A4F]/60 p-3.5 text-white transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium text-slate-300 uppercase">
                    Email
                  </span>
                  <span className="mt-0.5 block break-all font-semibold text-white">
                    {COMPANY_CONFIG.email}
                  </span>
                </span>
              </a>

              <a
                href={COMPANY_CONFIG.office.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-white/10 bg-[#2F3A4F]/60 p-3.5 text-white transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium text-slate-300 uppercase">
                    Google Maps
                  </span>
                  <span className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-white">
                    Find Us on Google Maps
                    <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
                  </span>
                </span>
              </a>

              <nav aria-label="Footer Quick Links" className="pt-2">
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-300">
                  <li>
                    <a href="#home" className="transition-colors hover:text-white">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="transition-colors hover:text-white">
                      Services
                    </a>
                  </li>
                  <li>
                    <a href="#projects" className="transition-colors hover:text-white">
                      Projects
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="transition-colors hover:text-white">
                      About
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="transition-colors hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Column 3 — Connect With Us */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] text-white uppercase">
              Connect With Us
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Follow our latest engineering work, insights, and company updates on our official
              social channels.
            </p>

            <div className="mt-5 space-y-3">
              {linkedIn && (
                <a
                  href={linkedIn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Gollamudi Technology and Software on LinkedIn (opens in a new tab)"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#2F3A4F]/60 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E8202A] hover:bg-[#2F3A4F]"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors group-hover:bg-[#E8202A]">
                      <LinkedInIcon className="h-4 w-4" />
                    </span>
                    <span>LinkedIn</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-white" aria-hidden="true" />
                </a>
              )}

              {instagram && (
                <a
                  href={instagram.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Gollamudi Technology and Software on Instagram (opens in a new tab)"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#2F3A4F]/60 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E8202A] hover:bg-[#2F3A4F]"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors group-hover:bg-[#E8202A]">
                      <InstagramIcon className="h-4 w-4" />
                    </span>
                    <span>Instagram</span>
                  </span>
                  <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-white" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* Column 4 — Location */}
          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] text-white uppercase">
              Location
            </h3>
            <div className="mt-5 flex flex-col justify-between rounded-2xl border border-white/12 bg-[#2F3A4F]/75 p-5">
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#151C2A] p-5 text-center">
                <div
                  aria-hidden="true"
                  className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-65"
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8202A] text-white shadow-md shadow-[#E8202A]/30">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-xs font-semibold text-white">
                    {COMPANY_CONFIG.name}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-300">
                    Official Google Maps Pin
                  </p>
                </div>
              </div>

              <a
                href={COMPANY_CONFIG.office.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[#E8202A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c81922]"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                <span>View Our Location</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Centered Copyright Bar */}
        <div className="mt-14 border-t border-white/12 pt-7 text-center">
          <p className="text-xs font-medium text-slate-200 sm:text-sm">
            &copy; 2026 Gollamudi Technology and Software. All Rights Reserved.
          </p>
          <div className="mt-3 flex items-center justify-center gap-6 text-xs">
            <button
              type="button"
              onClick={() => setLegalDoc('privacy')}
              className="text-slate-300 transition-colors hover:text-white"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('terms')}
              className="text-slate-300 transition-colors hover:text-white"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Legal Notice Modal */}
      {legalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLegalDoc(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-[#F7F7F7] p-6 text-[#1A2232] shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h3 id="legal-modal-title" className="text-xl font-bold text-[#2F3A4F]">
                {legalDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalDoc(null)}
                aria-label="Close legal dialog"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              {legalDoc === 'privacy' ? (
                <p>
                  {COMPANY_CONFIG.legalName} collects contact details submitted voluntarily through
                  our inquiry form strictly to respond to project inquiries and provide technical
                  consultations.
                </p>
              ) : (
                <p>
                  All software engineering engagements, deliverables, and support commitments with{' '}
                  {COMPANY_CONFIG.legalName} are governed by a mutually signed Statement of Work
                  (SOW) and Master Services Agreement (MSA).
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalDoc(null)}
                className="min-h-[40px] rounded-lg bg-[#2F3A4F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E8202A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
