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
  Star,
  Github,
  Mail,
} from "lucide-react";
import Button from "@/components/ui/Button";
import "./global.css";

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
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
      title: "Sync Everywhere",
      description:
        "Access your memories across all devices with seamless cloud synchronization.",
    },
    {
      icon: Calendar,
      title: "Timeline View",
      description:
        "Visualize your life story with an interactive, chronological timeline.",
    },
    {
      icon: BookOpen,
      title: "Story Generation",
      description:
        "Create beautiful stories from your memories with AI-powered insights.",
    },
    {
      icon: Zap,
      title: "Quick Capture",
      description:
        "Rapidly capture moments with smart templates and voice-to-text.",
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 selection:bg-primary-100 selection:text-primary-900">
      {/* Floating Glass Header */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="w-full max-w-5xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5 rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300 hover:bg-white/80 hover:shadow-2xl">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm tracking-tight">ML</span>
            </div>
            <h1 className="text-base sm:text-lg font-display font-bold text-neutral-900 tracking-tight">
              Memory Lane
            </h1>
          </div>
          <Link href={"/auth/register"}>
            <Button size="sm" className="rounded-full px-4 sm:px-6 text-sm sm:text-base shadow-lg shadow-primary-500/20 bg-primary-600 hover:bg-primary-700 transition-all duration-300 hover:scale-105">
              Get Started
            </Button>
          </Link>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute top-20 -right-40 w-[600px] h-[600px] bg-secondary-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary-800 shadow-sm animate-fade-in-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                AI-Powered Personal Timeline
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-neutral-900 leading-[1.1] tracking-tight animate-fade-in-up animation-delay-100">
                Your personal history,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-secondary-500 to-secondary-600">
                  beautifully preserved.
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                Capture, organize, and rediscover your most precious memories
                with AI-powered insights. Transform your life into stories that last forever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Link href={"/auth/register"}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-5 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:scale-105 transition-all duration-300 shadow-xl shadow-primary-500/20 group"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="https://github.com/iampraiez/memo">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8 py-5 rounded-full hover:scale-105 transition-all duration-300"
                >
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </Button>
              </Link>
            </div>

            <div className="mt-16 animate-fade-in-up animation-delay-500 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-20 bottom-0 pointer-events-none" />
              <img
                src="/memory.png"
                alt="Memory Lane App Interface"
                className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl border-4 border-white/50 backdrop-blur-xl ring-1 ring-black/5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-neutral-900 tracking-tight">
              Everything you need to preserve your story
            </h2>
            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
              Powerful features designed to make capturing and exploring your
              memories effortless and meaningful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-3xl bg-gradient-to-br from-neutral-50 to-white hover:from-primary-50 hover:to-secondary-50 hover:shadow-xl hover:shadow-primary-200/50 transition-all duration-300 border border-transparent hover:border-primary-100"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-neutral-500 leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-neutral-900 tracking-tight mb-4">
              Loved by memory keepers
            </h2>
            <p className="text-xl text-neutral-600">
              Join thousands who are preserving their stories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">10k+</div>
              <div className="text-sm text-neutral-500 mt-1 font-medium">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">1M+</div>
              <div className="text-sm text-neutral-500 mt-1 font-medium">Memories Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">50k+</div>
              <div className="text-sm text-neutral-500 mt-1 font-medium">Stories Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">4.9/5</div>
              <div className="text-sm text-neutral-500 mt-1 font-medium">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-8 tracking-tight">
            Ready to start your legacy?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Join thousands of others who are already capturing their most precious moments with Memory Lane.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={"/auth/register"}>
              <Button
                size="lg"
                className="text-lg px-10 py-5 rounded-full bg-white text-primary-700 hover:bg-neutral-50 hover:scale-105 transition-all duration-300 font-semibold shadow-xl"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-t border-neutral-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">ML</span>
                </div>
                <span className="text-lg font-display font-bold text-neutral-900">
                  Memory Lane
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-600">
                Preserving life's precious moments with the power of AI and beautiful design.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><Link href="/auth/register" className="hover:text-primary-600 transition-colors">Features</Link></li>
                <li><a href="https://github.com/iampraiez/memo" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">GitHub</a></li>
                <li><a href="https://github.com/iampraiez/memo#readme" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Developer</h4>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="https://iampraiez.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">Portfolio</a></li>
                <li><a href="https://iampraiez.vercel.app/#contact" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">Contact</a></li>
                <li><a href="https://github.com/iampraiez" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">GitHub Profile</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm text-neutral-600">
                <li><a href="https://github.com/iampraiez/memo/blob/main/README.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">Getting Started</a></li>
                <li><a href="https://github.com/iampraiez/memo/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">Contributing</a></li>
                <li><a href="https://github.com/iampraiez/memo/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">License</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
            <p>&copy; 2025 Memory Lane. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="https://github.com/iampraiez/memo" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://iampraiez.vercel.app/#contact" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
