import { useState } from 'react';
import defaultLogo from '../assets/logo.png';
import { COMPANY_CONFIG } from '../data/siteData';

interface BrandLogoProps {
  variant?: 'navbar' | 'footer';
  className?: string;
  src?: string;
}

/**
 * Official Gollamudi Technology and Software (GTS) logo.
 * Displays the exact uploaded logo at its original 608x397 aspect ratio without distortion or cropping,
 * framed on a matching #F4F4F4 surface for crisp readability over dark backgrounds.
 */
export function BrandLogo({ variant = 'footer', className = '', src = defaultLogo }: BrandLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const isNav = variant === 'navbar';

  if (!imgFailed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#F4F4F4] shadow-xs transition-all duration-200 group-hover:border-[#E8202A]/60 group-hover:shadow-md ${
          isNav ? 'h-11 sm:h-12 md:h-[52px]' : 'h-20 sm:h-24'
        } ${className}`}
      >
        <img
          src={src}
          alt={`${COMPANY_CONFIG.name} — Tech Needs Simplified`}
          width={608}
          height={397}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-auto object-contain"
        />
      </span>
    );
  }

  // Fallback if image fails to load
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-white/15 border-b-2 border-b-[#E8202A] bg-[#2F3A4F] font-display font-extrabold tracking-tight text-white shadow-xs ${
        isNav ? 'h-9 px-3 text-xs' : 'h-14 px-4 text-base'
      } ${className}`}
    >
      GTS
    </span>
  );
}
