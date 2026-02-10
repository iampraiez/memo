"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkle,
  Shield,
  Cloud,
  Calendar,
  BookOpen,
  Lightning,
  Star,
  TwitterLogo,
  LinkedinLogo,
  InstagramLogo,
  GithubLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import "./global.css";

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Sparkle,
      title: "AI-Powered Stories",
      description:
        "Let AI weave your memories into beautiful narratives and discover patterns in your life.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your memories are encrypted and secure. You control who sees your data.",
    },
    {
      icon: Cloud,
      title: "Cloud Backup",
      description:
        "Never lose a moment. Your memories are automatically backed up to our secure cloud.",
    },
    {
      icon: Calendar,
      title: "Life Timeline",
      description:
        "View your journey through an intuitive timeline. Relive the best moments of your life.",
    },
    {
      icon: BookOpen,
      title: "Personal Journal",
      description:
        "A private space for your thoughts, reflections, and deepest memories.",
    },
    {
      icon: Lightning,
      title: "Quick Capture",
      description:
        "Capture moments as they happen with our fast and easy-to-use interface.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Family Historian",
      content: "Memory Lane has transformed how I preserve our family's legacy. The AI stories are incredible!",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Travel Blogger",
      content: "Finally, a beautiful way to organize all my travel memories. The timeline view is perfect.",
      avatar: "MC",
    },
    {
      name: "Emma Davis",
      role: "New Parent",
      content: "Capturing my baby's first moments has never been easier. I love the family sharing feature!",
      avatar: "ED",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      {/* Refined Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 py-4"
            : "bg-transparent py-6",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-linear-to-br from-primary-700 to-primary-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20 transform transition-transform group-hover:scale-110 group-hover:rotate-3">
              <span className="text-white font-serif font-bold text-lg tracking-tight">
                M
              </span>
            </div>
            <span className="text-xl font-display font-bold text-neutral-900 tracking-tight">
              Memory Lane
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href={"/register"}>
              <Button
                className={cn(
                  "rounded-full px-4 sm:px-8 py-2 sm:py-2.5 font-medium transition-all duration-300 shadow-md text-sm sm:text-base",
                  scrolled
                    ? "bg-primary-800 text-white hover:bg-primary-900 shadow-primary-900/10"
                    : "bg-white text-primary-900 hover:bg-neutral-50 border border-primary-100 shadow-xl shadow-black/5",
                )}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Subtle Heritage Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-200 bg-[radial-gradient(circle_at_top,var(--tw-gradient-from)_0%,transparent_70%)] from-primary-100/40 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-200 h-200 bg-secondary-100/10 rounded-full blur-[120px] mix-blend-multiply shrink-0" />
        <div className="absolute top-20 -right-40 w-150 h-150 bg-primary-200/10 rounded-full blur-[120px] mix-blend-multiply shrink-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white shadow-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-800 animate-fade-in-up">
                <Sparkle
                  weight="duotone"
                  className="w-5 h-5 mr-3 text-secondary-400 white-inner-icon"
                />
                The Future of Heritage
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold text-neutral-900 leading-[0.95] tracking-tight animate-fade-in-up animation-delay-100">
                Preserve your
                <br />
                <span className="italic font-serif text-transparent bg-clip-text bg-linear-to-r from-primary-800 to-primary-600">
                  Legacy.
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up animation-delay-200">
                A sophisticated sanctuary for your most precious moments.
                Experience your memories through the lens of AI-crafted
                narratives.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Link href={"/register"}>
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 rounded-full bg-primary-900 text-white hover:bg-black hover:scale-105 transition-all duration-500 shadow-2xl shadow-primary-900/30 group"
                >
                  Get Started
                  <ArrowRight
                    weight="duotone"
                    className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform white-inner-icon"
                  />
                </Button>
              </Link>

              <Link href="https://github.com/iampraiez/memo">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-5 rounded-full hover:scale-105 transition-all duration-300"
                >
                  <GithubLogo
                    weight="duotone"
                    className="w-5 h-5 mr-2 text-primary-900 white-inner-icon"
                  />
                  View on GitHub
                </Button>
              </Link>
            </div>

            <div className="mt-16 animate-fade-in-up animation-delay-500 relative">
              <div className="absolute inset-0 bg-linear-to-t from-white via-transparent to-transparent z-10 h-20 bottom-0 pointer-events-none" />
              <Image
                src="/memory.png"
                alt="Memory Lane"
                width={1200}
                height={800}
                priority
                unoptimized
                className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-xl ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-4xl sm:text-6xl font-display font-bold text-neutral-900 tracking-tight">
              A sanctuary for your story.
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto font-light">
              Sophisticated tools designed to help you capture, organize, and
              rediscover your life's most meaningful moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-neutral-50/50 hover:bg-white hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-500 border border-transparent hover:border-primary-100"
              >
                <div className="w-12 h-12 bg-primary-900 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                  <feature.icon
                    weight="duotone"
                    className="w-6 h-6 text-white white-inner-icon"
                  />
                </div>
                <h3 className="text-2xl font-display font-bold text-neutral-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-neutral-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-150 h-150 bg-primary-100/30 rounded-full blur-[120px] -mr-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl sm:text-6xl font-display font-bold text-neutral-900 tracking-tight mb-6">
              Loved by the keepers.
            </h2>
            <p className="text-xl text-neutral-600 font-light">
              Join those who have chosen a more meaningful way to preserve their
              legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-10 shadow-sm border border-neutral-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-center mb-6 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      weight="duotone"
                      className="w-4 h-4 text-secondary-500 white-inner-icon"
                    />
                  ))}
                </div>
                <p className="text-lg text-neutral-700 mb-10 leading-relaxed font-light italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg mr-4 shadow-inner">
                    {testimonial.avatar[0]}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-neutral-500 uppercase tracking-widest">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 border-y border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-display font-bold text-primary-900 tracking-tight">
                10k+
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-3 font-semibold">
                Active Sanctuary
              </div>
            </div>
            <div>
              <div className="text-5xl font-display font-bold text-primary-900 tracking-tight">
                1M+
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-3 font-semibold">
                Memories Saved
              </div>
            </div>
            <div>
              <div className="text-5xl font-display font-bold text-primary-900 tracking-tight">
                50k+
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-3 font-semibold">
                Stories Crafted
              </div>
            </div>
            <div>
              <div className="text-5xl font-display font-bold text-primary-900 tracking-tight">
                4.9/5
              </div>
              <div className="text-xs uppercase tracking-[0.2em] text-neutral-400 mt-3 font-semibold">
                Legacy Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-40 bg-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-250 bg-primary-900/50 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-150 h-150 bg-secondary-900/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl sm:text-7xl font-display font-bold text-white mb-8 tracking-tight">
            Begin your{" "}
            <span className="italic font-serif text-transparent bg-clip-text bg-linear-to-r from-white to-primary-200">
              Archive.
            </span>
          </h2>
          <p className="text-xl text-primary-200/80 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Every moment counts. Don't let your history fade into the digital
            noise. Join the sanctuary today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href={"/register"}>
              <Button
                size="lg"
                className="text-lg px-12 py-7 rounded-full bg-white text-primary-950 hover:bg-neutral-100 hover:scale-105 transition-all duration-500 font-bold shadow-xl shadow-black/20"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-100 py-16 text-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-display font-bold text-[#8B5CF6] tracking-tight">
                  Memory Lane
                </span>
              </div>
              <p className="text-base font-light leading-relaxed text-neutral-500 max-w-sm">
                AI-powered legacy preservation and memory tracking for
                thoughtful individuals.
              </p>
              <div className="flex items-center space-x-5 text-neutral-400">
                <a
                  href="https://x.com/iampraiez"
                  className="hover:text-primary-900 transition-colors"
                >
                  <TwitterLogo
                    weight="duotone"
                    className="white-inner-icon"
                    size={20}
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/thepraiseolaoye"
                  className="hover:text-primary-900 transition-colors"
                >
                  <LinkedinLogo
                    weight="duotone"
                    className="white-inner-icon"
                    size={20}
                  />
                </a>
                <a
                  href="https://www.instagram.com/iampraiez_?igsh=enI4OWcxOHN1Yml3"
                  className="hover:text-primary-900 transition-colors"
                >
                  <InstagramLogo
                    weight="duotone"
                    className="white-inner-icon"
                    size={20}
                  />
                </a>
                <a
                  href="https://github.com/iampraiez/memo"
                  className="hover:text-primary-900 transition-colors"
                >
                  <GithubLogo
                    weight="duotone"
                    className="white-inner-icon"
                    size={20}
                  />
                </a>
              </div>
            </div>

            {/* Product Section */}
            <div>
              <h4 className="font-bold text-neutral-950 mb-6 text-lg">
                Product
              </h4>
              <ul className="space-y-3 text-base text-neutral-500 font-medium">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:himpraise571@gmail.com"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/iampraiez/memo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://iampraiez.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    About Me
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h4 className="font-bold text-neutral-950 mb-6 text-lg">Legal</h4>
              <ul className="space-y-3 text-base text-neutral-500 font-medium">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-400 font-medium uppercase tracking-widest">
            <p>
              &copy; {new Date().getFullYear()} Memory Lane. All rights
              reserved.
            </p>
            <p className="mt-4 md:mt-0">Built by Praiez</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
