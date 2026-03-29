import React from "react";
import NavWrapper from "@/components/landing/NavWrapper";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import "./global.css";

const LandingPage: React.FC = () => {
  return (
    <div className="from-primary-50 to-secondary-50 selection:bg-primary-100 selection:text-primary-900 min-h-screen bg-linear-to-br via-white">
      {/* Optimized Sticky Header */}
      <NavWrapper />

      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
