import { ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { COMPANY_CONFIG } from '../data/siteData';

export function OfficeLocationSection() {
  return (
    <section
      id="office-location"
      className="border-b border-slate-300/80 bg-[#ECEEF2] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          {/* Left: Verified Company Contact & Location Actions */}
          <div className="flex flex-col justify-between rounded-3xl border border-slate-300/90 bg-[#F7F7F7] p-7 lg:col-span-5 sm:p-8">
            <div>
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
                Company Location
              </p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1A2232] sm:text-3xl">
                Connect With {COMPANY_CONFIG.shortName}
              </h2>
              <p className="mt-2 text-xs font-bold tracking-[0.14em] text-[#2F3A4F] uppercase">
                {COMPANY_CONFIG.tagline}
              </p>

              <div className="mt-6 space-y-4 border-t border-slate-300/70 pt-5 text-sm text-slate-700">
                <div>
                  <p className="font-bold text-[#1A2232]">{COMPANY_CONFIG.name}</p>
                  <p className="mt-1 text-slate-600">
                    Open our verified location pin on Google Maps for accurate navigation and
                    directions.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <Phone className="h-4 w-4 shrink-0 text-[#E8202A]" aria-hidden="true" />
                  <a
                    href={COMPANY_CONFIG.phoneHref}
                    className="font-mono text-sm font-semibold text-[#1A2232] transition-colors hover:text-[#E8202A]"
                  >
                    {COMPANY_CONFIG.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 shrink-0 text-[#E8202A]" aria-hidden="true" />
                  <a
                    href={COMPANY_CONFIG.emailHref}
                    className="text-sm font-semibold text-[#1A2232] transition-colors hover:text-[#E8202A]"
                  >
                    {COMPANY_CONFIG.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={COMPANY_CONFIG.office.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#2F3A4F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E8202A]"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                View Our Location
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>

              <a
                href={COMPANY_CONFIG.phoneHref}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#1A2232] transition-colors hover:border-[#E8202A] hover:text-[#E8202A]"
              >
                <Phone className="h-4 w-4 text-[#E8202A]" aria-hidden="true" />
                Call Now
              </a>
            </div>
          </div>

          {/* Right: Interactive Location Card Linking to Official Google Maps Pin */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#2F3A4F] text-white lg:col-span-7">
            <div className="relative flex h-full min-h-[320px] flex-col items-center justify-center overflow-hidden p-8 text-center">
              <div
                aria-hidden="true"
                className="bg-arch-grid-dark pointer-events-none absolute inset-0 opacity-85"
              />

              <svg
                aria-hidden="true"
                viewBox="0 0 600 320"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
              >
                <circle
                  cx="300"
                  cy="160"
                  r="72"
                  fill="none"
                  stroke="#E8202A"
                  strokeDasharray="4 6"
                />
                <circle cx="300" cy="160" r="134" fill="none" stroke="#94A3B8" strokeOpacity="0.4" />
                <circle cx="300" cy="160" r="200" fill="none" stroke="#1E293B" />
                <path
                  d="M40 245 Q 220 120 560 95"
                  fill="none"
                  stroke="#E8202A"
                  strokeOpacity="0.55"
                  strokeWidth="1.5"
                  className="animate-signal-flow"
                />
              </svg>

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#E8202A]/45 bg-[#E8202A]/15">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8202A] text-white shadow-lg shadow-[#E8202A]/30">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <p className="mt-4 font-mono text-xs tracking-[0.16em] text-slate-300 uppercase">
                  Official Google Maps Location
                </p>
                <p className="mt-2 max-w-md text-base font-bold text-white">
                  {COMPANY_CONFIG.name}
                </p>

                <a
                  href={COMPANY_CONFIG.office.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#E8202A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#c81922]"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Open in Google Maps
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
