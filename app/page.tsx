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
import Card from "@/components/ui/Card";
import "./global.css";

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Insights",
      description:
        "Automatically generate summaries, tags, and discover patterns in your memories with advanced AI.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your memories are encrypted and secure. You control who sees your data and how it's used.",
    },
    {
      icon: Cloud,
      title: "Sync Everywhere",
      description:
        "Access your memories across all devices with seamless synchronization and offline support.",
    },
    {
      icon: Calendar,
      title: "Timeline View",
      description:
        "Organize memories by date with beautiful timeline visualization and easy navigation.",
    },
    {
      icon: BookOpen,
      title: "Story Generation",
      description:
        "Create beautiful stories and summaries from your memories for any time period.",
    },
    {
      icon: Zap,
      title: "Quick Capture",
      description:
        "Rapidly capture moments with smart templates and voice-to-text functionality.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <h1 className="text-xl font-display font-bold text-neutral-900">
                Memory Lane
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={"/auth/login"}>
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href={"/auth/register"}>
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-secondary-300/30 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-sm text-neutral-700 shadow-soft backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                New • AI-powered memory keeping
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-tight">
                Your Life&apos;s Story,
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Beautifully Preserved
                </span>
              </h1>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                Capture, organize, and rediscover your most precious memories
                with AI-powered insights. Transform your life experiences into
                beautiful, searchable stories that last forever.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"/auth/register"}>
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {/* <Button
                variant="secondary"
                size="lg"
                className="text-lg px-8 py-4"
              >
                Watch Demo
              </Button> */}
            </div>

            <div className="mt-12">
              <img
                src="https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Memory Lane App Screenshot"
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border border-neutral-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-neutral-900">
              Everything you need to preserve your story
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to make capturing and exploring your
              memories effortless and meaningful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center space-y-4 transition-transform duration-200 hover:-translate-y-1"
                padding="lg"
                hover
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
            Trusted by memory keepers worldwide
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-12 text-neutral-400">
            <div className="text-2xl font-bold">10,000+</div>
            <div className="text-2xl font-bold">1M+</div>
            <div className="text-2xl font-bold">50k+</div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-12 text-sm text-neutral-500 mt-2">
            <span>Active Users</span>
            <span>Memories Captured</span>
            <span>Stories Generated</span>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-display font-bold text-neutral-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-neutral-600">
              Choose the plan that works best for your memory-keeping journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center space-y-6" padding="lg" hover>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Starter
                </h3>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  Free
                </div>
                <p className="text-neutral-500">Perfect for getting started</p>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Up to 100 memories</li>
                <li>Basic AI features</li>
                <li>Mobile & web access</li>
              </ul>
              <Button variant="secondary" size="lg" className="w-full">
                Get Started
              </Button>
            </Card>

            <Card
              className="text-center space-y-6 border-primary-200 bg-primary-50 ring-2 ring-primary-500"
              padding="lg"
              hover
            >
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Pro
                </h3>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  $9<span className="text-lg">/mo</span>
                </div>
                <p className="text-neutral-500">For serious memory keepers</p>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Unlimited memories</li>
                <li>Advanced AI insights</li>
                <li>Story generation</li>
                <li>Priority support</li>
              </ul>
              <Button size="lg" className="w-full">
                Start Free Trial
              </Button>
            </Card>

            <Card className="text-center space-y-6" padding="lg" hover>
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Family
                </h3>
                <div className="text-3xl font-bold text-neutral-900 mb-1">
                  $19<span className="text-lg">/mo</span>
                </div>
                <p className="text-neutral-500">For the whole family</p>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>Up to 6 accounts</li>
                <li>Shared memories</li>
                <li>Family timeline</li>
                <li>Advanced privacy</li>
              </ul>
              <Button variant="secondary" size="lg" className="w-full">
                Coming Soon
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white overflow-hidden">
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Ready to preserve your story?
            </h2>
            <p className="text-xl text-white/80">
              Join thousands who are already capturing their most precious
              moments with Memory Lane.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              Start Your Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">ML</span>
                </div>
                <span className="text-xl font-display font-bold">
                  Memory Lane
                </span>
              </div>
              <p className="text-neutral-400">
                Preserving life&apos;s precious moments with the power of AI.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 Memory Lane. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
