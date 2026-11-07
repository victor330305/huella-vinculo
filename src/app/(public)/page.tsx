import { HeroSection } from "@/components/public/HeroSection";
import { DifferentialSection } from "@/components/public/DifferentialSection";
import { SpecialtiesSection } from "@/components/public/SpecialtiesSection";
import { HowItWorksSection } from "@/components/public/HowItWorksSection";
import { ProgramsSection } from "@/components/public/ProgramsSection";
import { AboutSection } from "@/components/public/AboutSection";
import { TestimonialsSection } from "@/components/public/TestimonialsSection";
import { ContactForm } from "@/components/public/ContactForm";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DifferentialSection />
      <SpecialtiesSection />
      <HowItWorksSection />
      <ProgramsSection />
      <AboutSection />
      <TestimonialsSection />
      <ContactForm />
    </>
  );
}
