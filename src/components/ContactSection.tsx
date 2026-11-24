import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  BUDGET_RANGE_OPTIONS,
  COMPANY_CONFIG,
  PROJECT_TYPE_OPTIONS,
} from '../data/siteData';
import {
  hasValidationErrors,
  submitContactInquiry,
  validateContactForm,
  type ContactFormErrors,
  type ContactFormInput,
  type ContactSubmissionResult,
} from '../utils/siteLogic';
import { BrandLogo } from './BrandLogo';
import { MagneticButton } from './CursorEffects';
import { InstagramIcon, LinkedInIcon } from './SocialIcons';

interface ContactSectionProps {
  preselectedProjectType: string;
  prefilledNote: string;
  focusTrigger: number;
}

const INITIAL_FORM: ContactFormInput = {
  fullName: '',
  email: '',
  phone: '',
  companyName: '',
  projectType: PROJECT_TYPE_OPTIONS[0],
  budgetRange: BUDGET_RANGE_OPTIONS[1],
  description: '',
};

export function ContactSection({
  preselectedProjectType,
  prefilledNote,
  focusTrigger,
}: ContactSectionProps) {
  const [form, setForm] = useState<ContactFormInput>(INITIAL_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<ContactSubmissionResult | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preselectedProjectType) {
      setForm((prev) => ({
        ...prev,
        projectType: preselectedProjectType,
      }));
    }
  }, [preselectedProjectType]);

  useEffect(() => {
    if (prefilledNote) {
      setForm((prev) => ({
        ...prev,
        description: prefilledNote,
      }));
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  }, [prefilledNote]);

  useEffect(() => {
    if (focusTrigger > 0) {
      nameInputRef.current?.focus({ preventScroll: true });
    }
  }, [focusTrigger]);

  const updateField = <K extends keyof ContactFormInput>(field: K, value: ContactFormInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateContactForm(form);
    if (hasValidationErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitContactInquiry(form, {
        endpointUrl: COMPANY_CONFIG.contactApiEndpoint,
      });
      setSubmissionResult(result);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to submit your inquiry right now. Please call us directly.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setSubmitError(null);
    setErrors({});
    setForm(INITIAL_FORM);
  };

  return (
    <section id="contact" className="border-b border-slate-200/80 bg-[#F7F7F7] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-[#C81922] uppercase">
            Start a Conversation
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1A2232] sm:text-5xl lg:text-6xl">
            LET&apos;S CREATE SOMETHING{' '}
            <span className="text-[#E8202A]">THAT MATTERS.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Share your product ambitions, architecture constraints, and target milestones with{' '}
            <span className="font-semibold text-[#2F3A4F]">{COMPANY_CONFIG.name}</span>.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-12">
          {/* Left 7 columns: Floating-Label High-End Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-300/80 bg-white p-6 shadow-xs sm:p-8">
              {submissionResult ? (
                <div role="status" aria-live="polite" className="py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold tracking-tight text-[#1A2232]">
                    Inquiry Validated &amp; Ready
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {submissionResult.message}
                  </p>

                  <dl className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-[#F7F7F7] p-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Reference ID</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-[#1A2232]">
                        {submissionResult.referenceId}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Project Type</dt>
                      <dd className="mt-0.5 font-semibold text-[#1A2232]">{form.projectType}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Email</dt>
                      <dd className="mt-0.5 text-slate-700">{form.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Budget</dt>
                      <dd className="mt-0.5 text-slate-700">{form.budgetRange}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-[44px] rounded-xl bg-[#2F3A4F] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#E8202A]"
                    >
                      Submit Another Inquiry
                    </button>
                    <a
                      href={`${COMPANY_CONFIG.emailHref}?subject=${encodeURIComponent(
                        `Project Inquiry: ${form.projectType}`
                      )}`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#2F3A4F] transition-colors hover:border-[#E8202A] hover:text-[#E8202A]"
                    >
                      <Mail className="h-4 w-4 text-[#E8202A]" aria-hidden="true" />
                      Email {COMPANY_CONFIG.email}
                    </a>
                    <a
                      href={COMPANY_CONFIG.phoneHref}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-[#2F3A4F] transition-colors hover:border-[#E8202A] hover:text-[#E8202A]"
                    >
                      <Phone className="h-4 w-4 text-[#E8202A]" aria-hidden="true" />
                      Call {COMPANY_CONFIG.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  {submitError && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <div
                        className="floating-field relative"
                        data-filled={Boolean(form.fullName)}
                      >
                        <input
                          ref={nameInputRef}
                          id="contact-fullName"
                          name="fullName"
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          aria-invalid={Boolean(errors.fullName)}
                          aria-describedby={errors.fullName ? 'error-fullName' : undefined}
                          className={`peer w-full rounded-xl border bg-[#F7F7F7]/70 px-4 pt-6 pb-2.5 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none ${
                            errors.fullName ? 'border-red-400' : 'border-slate-300'
                          }`}
                        />
                        <label
                          htmlFor="contact-fullName"
                          className="floating-label pointer-events-none absolute top-4 left-4 origin-left text-sm font-medium text-slate-500 transition-all duration-150"
                        >
                          Full Name *
                        </label>
                      </div>
                      {errors.fullName && (
                        <p id="error-fullName" className="mt-1.5 text-xs font-medium text-red-600">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <div
                        className="floating-field relative"
                        data-filled={Boolean(form.email)}
                      >
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'error-email' : undefined}
                          className={`peer w-full rounded-xl border bg-[#F7F7F7]/70 px-4 pt-6 pb-2.5 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none ${
                            errors.email ? 'border-red-400' : 'border-slate-300'
                          }`}
                        />
                        <label
                          htmlFor="contact-email"
                          className="floating-label pointer-events-none absolute top-4 left-4 origin-left text-sm font-medium text-slate-500 transition-all duration-150"
                        >
                          Email *
                        </label>
                      </div>
                      {errors.email && (
                        <p id="error-email" className="mt-1.5 text-xs font-medium text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <div
                        className="floating-field relative"
                        data-filled={Boolean(form.phone)}
                      >
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField('phone', e.target.value)}
                          aria-invalid={Boolean(errors.phone)}
                          aria-describedby={errors.phone ? 'error-phone' : undefined}
                          className={`peer w-full rounded-xl border bg-[#F7F7F7]/70 px-4 pt-6 pb-2.5 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none ${
                            errors.phone ? 'border-red-400' : 'border-slate-300'
                          }`}
                        />
                        <label
                          htmlFor="contact-phone"
                          className="floating-label pointer-events-none absolute top-4 left-4 origin-left text-sm font-medium text-slate-500 transition-all duration-150"
                        >
                          Phone
                        </label>
                      </div>
                      {errors.phone && (
                        <p id="error-phone" className="mt-1.5 text-xs font-medium text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <div
                        className="floating-field relative"
                        data-filled={Boolean(form.companyName)}
                      >
                        <input
                          id="contact-company"
                          name="companyName"
                          type="text"
                          value={form.companyName}
                          onChange={(e) => updateField('companyName', e.target.value)}
                          className="peer w-full rounded-xl border border-slate-300 bg-[#F7F7F7]/70 px-4 pt-6 pb-2.5 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none"
                        />
                        <label
                          htmlFor="contact-company"
                          className="floating-label pointer-events-none absolute top-4 left-4 origin-left text-sm font-medium text-slate-500 transition-all duration-150"
                        >
                          Company
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-projectType"
                        className="block text-xs font-semibold text-[#1A2232]"
                      >
                        Project Type *
                      </label>
                      <select
                        id="contact-projectType"
                        name="projectType"
                        value={form.projectType}
                        onChange={(e) => updateField('projectType', e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-[#F7F7F7]/70 px-3.5 py-3 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none"
                      >
                        {PROJECT_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-budget"
                        className="block text-xs font-semibold text-[#1A2232]"
                      >
                        Budget *
                      </label>
                      <select
                        id="contact-budget"
                        name="budgetRange"
                        value={form.budgetRange}
                        onChange={(e) => updateField('budgetRange', e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-[#F7F7F7]/70 px-3.5 py-3 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none"
                      >
                        {BUDGET_RANGE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div
                      className="floating-field relative"
                      data-filled={Boolean(form.description)}
                    >
                      <textarea
                        id="contact-description"
                        name="description"
                        rows={4}
                        required
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        aria-invalid={Boolean(errors.description)}
                        aria-describedby={errors.description ? 'error-description' : undefined}
                        className={`peer w-full rounded-xl border bg-[#F7F7F7]/70 px-4 pt-7 pb-3 text-sm text-[#1A2232] transition-colors focus:border-[#E8202A] focus:bg-white focus:outline-none ${
                          errors.description ? 'border-red-400' : 'border-slate-300'
                        }`}
                      />
                      <label
                        htmlFor="contact-description"
                        className="floating-label pointer-events-none absolute top-4 left-4 origin-left text-sm font-medium text-slate-500 transition-all duration-150"
                      >
                        Message *
                      </label>
                    </div>
                    {errors.description && (
                      <p id="error-description" className="mt-1.5 text-xs font-medium text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                    <p className="text-xs text-slate-500">
                      Backend-ready validation · Connect an API endpoint in{' '}
                      <code className="font-mono text-slate-700">siteData.ts</code>
                    </p>
                    <MagneticButton
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#2F3A4F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#E8202A] disabled:cursor-not-allowed disabled:opacity-70 whitespace-nowrap shrink-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Validating...
                        </>
                      ) : (
                        <>
                          Send Project Brief
                          <Send className="h-4 w-4" aria-hidden="true" />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right 5 columns: Verified GTS Direct Contact & Social Channels */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-[#1D2536] p-7 text-white shadow-xl sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <a
                    href="#home"
                    aria-label={`${COMPANY_CONFIG.name} — Go to homepage`}
                    className="group inline-block transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <BrandLogo variant="footer" />
                  </a>
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                    {COMPANY_CONFIG.name}
                  </h3>
                  <p className="mt-1 inline-block rounded bg-[#E8202A] px-2.5 py-0.5 font-mono text-[11px] font-bold tracking-[0.14em] text-white uppercase">
                    {COMPANY_CONFIG.tagline}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <a
                  href={COMPANY_CONFIG.phoneHref}
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#2F3A4F]/60 p-4 transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300">Direct Phone</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-white">
                      {COMPANY_CONFIG.phone}
                    </p>
                  </div>
                </a>

                <a
                  href={COMPANY_CONFIG.emailHref}
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#2F3A4F]/60 p-4 transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-300">Official Email</p>
                    <p className="mt-0.5 break-all text-sm font-semibold text-white">
                      {COMPANY_CONFIG.email}
                    </p>
                  </div>
                </a>

                <a
                  href={COMPANY_CONFIG.office.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3.5 rounded-2xl border border-white/10 bg-[#2F3A4F]/60 p-4 transition-colors hover:border-[#E8202A] hover:bg-[#2F3A4F]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8202A]/15 text-[#FF7D84] transition-colors group-hover:bg-[#E8202A] group-hover:text-white">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-300">Location</p>
                    <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                      View Our Location on Google Maps
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
                    </p>
                  </div>
                </a>
              </div>

              <div className="mt-6 border-t border-white/10 pt-5">
                <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-slate-300 uppercase">
                  Connect With Us
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {COMPANY_CONFIG.socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow ${COMPANY_CONFIG.name} on ${social.label} (opens in a new tab)`}
                      className="group flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/12 bg-[#2F3A4F]/70 px-3 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E8202A] hover:bg-[#E8202A]"
                    >
                      {social.id === 'linkedin' ? (
                        <LinkedInIcon className="h-4 w-4 shrink-0" />
                      ) : (
                        <InstagramIcon className="h-4 w-4 shrink-0" />
                      )}
                      <span>{social.label}</span>
                      <ExternalLink className="h-3 w-3 opacity-75" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
