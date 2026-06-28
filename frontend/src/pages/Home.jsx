import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { TrainerShowcase } from "@/components/landing/TrainerShowcase";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTADual } from "@/components/landing/CTADual";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <TrainerShowcase />
      <Testimonials />
      <CTADual />
    </>
  );
}
