import { MessageSquareCode } from 'lucide-react';
import { useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AiStudioSection } from './components/AiStudioSection';
import { ContactSection } from './components/ContactSection';
import { CursorSpotlight } from './components/CursorEffects';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { IntroManifestoSection } from './components/IntroManifestoSection';
import { Navbar } from './components/Navbar';
import { OfficeLocationSection } from './components/OfficeLocationSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ServicesSection } from './components/ServicesSection';
import { TechStackSection } from './components/TechStackSection';
import { WorkflowSection } from './components/WorkflowSection';
import { PROJECT_TYPE_OPTIONS } from './data/siteData';

export default function App() {
  const [preselectedProjectType, setPreselectedProjectType] = useState<string>(
    PROJECT_TYPE_OPTIONS[0]
  );
  const [prefilledNote, setPrefilledNote] = useState<string>('');
  const [focusTrigger, setFocusTrigger] = useState<number>(0);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setFocusTrigger((prev) => prev + 1);
  };

  const scrollToAiStudio = () => {
    const el = document.getElementById('ai-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (serviceTitle: string) => {
    setPreselectedProjectType(serviceTitle);
    scrollToContact();
  };

  const handleStartSimilarProject = (projectTitle: string) => {
    setPrefilledNote(`We are interested in building a system similar to "${projectTitle}".`);
    scrollToContact();
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#111722] text-[#1A2232]">
      <CursorSpotlight />
      <Navbar onStartProject={scrollToContact} />

      <main>
        <HeroSection onStartProject={scrollToContact} />
        <IntroManifestoSection />
        <ServicesSection onSelectService={handleSelectService} />
        <PortfolioSection onStartSimilarProject={handleStartSimilarProject} />
        <AboutSection />
        <TechStackSection />
        <WorkflowSection />
        <ErrorBoundary compact fallbackTitle="Multi-Modal Gemini Studio encountered an error.">
          <AiStudioSection />
        </ErrorBoundary>
        <ContactSection
          preselectedProjectType={preselectedProjectType}
          prefilledNote={prefilledNote}
          focusTrigger={focusTrigger}
        />
        <OfficeLocationSection />
        <FaqSection />
      </main>

      <Footer />

      <button
        type="button"
        onClick={scrollToAiStudio}
        aria-label="Jump to Gemini AI Studio"
        className="group fixed right-5 bottom-5 z-30 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#E8202A]/45 bg-[#1D2536]/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-sm transition-colors hover:border-[#E8202A] hover:bg-[#E8202A]"
      >
        <MessageSquareCode
          className="h-4 w-4 text-[#FF6B73] transition-colors group-hover:text-white"
          aria-hidden="true"
        />
        <span>AI Studio</span>
      </button>
    </div>
  );
}
