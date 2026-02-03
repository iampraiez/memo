"use client";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Cloud,
  Calendar,
  BookOpen,
  Zap,
} from "lucide-react";
import Button from "@/components/ui/Button";
import "./global.css";

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI Insights",
      description:
        "Automatically generate summaries and discover patterns in your memories.",
    },
    {
      icon: Shield,
      title: "Secure Vault",
      description:
        "Your memories are encrypted. You control who sees your data.",
    },
    {
      icon: Cloud,
      title: "Cloud Sync",
      description:
        "Access your memories across all devices with seamless synchronization.",
    },
    {
      icon: Calendar,
      title: "Timeline View",
      description:
        "Organize memories by date with beautiful visualization and easy navigation.",
    },
    {
      icon: BookOpen,
      title: "Storytelling",
      description:
        "Create beautiful stories and summaries from your memories effortlessly.",
    },
    {
      icon: Zap,
      title: "Quick Capture",
      description:
        "Rapidly capture moments with smart templates and voice-to-text.",
    },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-neutral-900 selection:text-white">
      {/* Minimal Floating Header */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="w-full max-w-4xl bg-white/80 backdrop-blur-md border border-neutral-200/50 shadow-sm rounded-full px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">ML</span>
            </div>
            <span className="text-base font-bold text-neutral-900 tracking-tight">
              Memory Lane
            </span>
          </div>
          <Link href={"/auth/register"}>
            <Button size="sm" className="rounded-full px-5 bg-neutral-900 text-white hover:bg-neutral-800 transition-all">
              Get Started
            </Button>
          </Link>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Subdued Background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-neutral-50 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 leading-[1.1] tracking-tight">
                Your personal history,
                <br />
                <span className="text-neutral-400">
                  beautifully preserved.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed">
                Capture, organize, and rediscover your most precious memories
                with AI-powered insights. Transform your life into stories that last.
              </p>
            </div>

            <div className="pt-4">
              <Link href={"/auth/register"}>
                <Button
                  size="lg"
                  className="px-8 py-6 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-105 transition-all shadow-lg shadow-neutral-200"
                >
                  Start your journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-20 relative">
              <div className="absolute inset-x-0 -top-20 -bottom-20 bg-neutral-100/30 blur-3xl -z-10 rounded-full" />
              <img
                src="/memory.png"
                alt="Memory Lane App Interface"
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-neutral-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Features Grid */}
      <section className="py-24 border-t border-neutral-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {features.map((feature, index) => (
              <div key={index} className="space-y-4">
                <div className="w-10 h-10 bg-neutral-50 rounded-lg flex items-center justify-center border border-neutral-100">
                  <feature.icon className="w-5 h-5 text-neutral-900" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimalism Proof (Numbers only) */}
      <section className="py-20 bg-neutral-50/50 border-y border-neutral-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap justify-between gap-12 text-center">
            <div className="flex-1 min-w-[120px]">
              <div className="text-3xl font-bold text-neutral-900">10k+</div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest mt-2 font-medium">Users</div>
            </div>
            <div className="flex-1 min-w-[120px]">
              <div className="text-3xl font-bold text-neutral-900">1M+</div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest mt-2 font-medium">Memories</div>
            </div>
            <div className="flex-1 min-w-[120px]">
              <div className="text-3xl font-bold text-neutral-900">4.9/5</div>
              <div className="text-xs text-neutral-400 uppercase tracking-widest mt-2 font-medium">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra-Clean CTA */}
      <section className="py-32 text-center border-b border-neutral-100">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Ready to start your legacy?
          </h2>
          <Link href={"/auth/register"}>
            <Button
              size="lg"
              className="px-10 py-6 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all font-medium"
            >
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-neutral-900">Memory Lane</span>
              <span className="text-neutral-300">/</span>
              <span className="text-xs text-neutral-400">&copy; 2025</span>
            </div>
            
            <nav className="flex space-x-8 text-xs font-medium text-neutral-500">
              <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


