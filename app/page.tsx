import React from "react";
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
} from "@phosphor-icons/react/dist/ssr";
import Button from "@/components/ui/Button";
import NavWrapper from "@/components/landing/NavWrapper";
import "./global.css";

const LandingPage: React.FC = () => {
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
      description: "Your memories are encrypted and secure. You control who sees your data.",
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
      description: "A private space for your thoughts, reflections, and deepest memories.",
    },
    {
      icon: Lightning,
      title: "Quick Capture",
      description: "Capture moments as they happen with our fast and easy-to-use interface.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Family Historian",
      content:
        "Memory Lane has transformed how I preserve our family's legacy. The AI stories are incredible!",
      avatar: "SJ",
    },
    {
      name: "Michael Chen",
      role: "Travel Blogger",
      content:
        "Finally, a beautiful way to organize all my travel memories. The timeline view is perfect.",
      avatar: "MC",
    },
    {
      name: "Emma Davis",
      role: "New Parent",
      content:
        "Capturing my baby's first moments has never been easier. I love the family sharing feature!",
      avatar: "ED",
    },
  ];

  return (
    <div className="from-primary-50 to-secondary-50 selection:bg-primary-100 selection:text-primary-900 min-h-screen bg-linear-to-br via-white">
      {/* Optimized Sticky Header */}
      <NavWrapper />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-40 pb-20 lg:pt-52 lg:pb-32">
        {/* Subtle Heritage Gradients */}
        <div className="from-primary-100/40 pointer-events-none absolute top-0 left-1/2 h-200 w-full -translate-x-1/2 bg-[radial-gradient(circle_at_top,var(--tw-gradient-from)_0%,transparent_70%)] to-transparent" />
        <div className="bg-secondary-100/10 absolute -top-40 -left-40 h-200 w-200 shrink-0 rounded-full mix-blend-multiply blur-[120px]" />
        <div className="bg-primary-200/10 absolute top-20 -right-40 h-150 w-150 shrink-0 rounded-full mix-blend-multiply blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-12 text-center">
            <div className="space-y-6">
              <div className="border-primary-200 text-primary-800 animate-fade-in-up inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-bold tracking-widest uppercase shadow-sm">
                <Sparkle
                  weight="duotone"
                  className="text-secondary-400 white-inner-icon mr-3 h-5 w-5"
                />
                The Future of Heritage
              </div>
              <h1 className="font-display animate-fade-in-up text-6xl leading-[0.95] font-bold tracking-tight text-neutral-900 sm:text-7xl lg:text-8xl">
                Preserve your
                <br />
                <span className="from-primary-800 to-primary-600 bg-linear-to-r bg-clip-text font-serif text-transparent italic">
                  Legacy.
                </span>
              </h1>
              <p className="animate-fade-in-up mx-auto max-w-2xl text-xl leading-relaxed font-light text-neutral-600 sm:text-2xl">
                A sophisticated sanctuary for your most precious moments. Experience your memories
                through the lens of AI-crafted narratives.
              </p>
            </div>

            <div className="animate-fade-in-up flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={"/register"}>
                <Button
                  size="lg"
                  className="bg-primary-900 shadow-primary-900/30 group rounded-full px-10 py-6 text-lg text-white shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-black"
                >
                  Get Started
                  <ArrowRight
                    weight="duotone"
                    className="white-inner-icon ml-3 h-5 w-5 transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>

              <Link href="https://github.com/iampraiez/memo">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 py-5 text-lg transition-all duration-300 hover:scale-105"
                >
                  <GithubLogo
                    weight="duotone"
                    className="text-primary-900 white-inner-icon mr-2 h-5 w-5"
                  />
                  View on GitHub
                </Button>
              </Link>
            </div>

            <div className="animate-fade-in-up relative mt-16">
              <div className="pointer-events-none absolute inset-0 bottom-0 z-10 h-20 bg-linear-to-t from-white via-transparent to-transparent" />
              <div className="relative mx-auto w-full max-w-5xl">
                <Image
                  src="/memory.png"
                  alt="Memory Lane Application Interface"
                  width={1200}
                  height={800}
                  priority
                  className="h-auto w-full rounded-3xl border-4 border-white/50 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative overflow-hidden bg-white py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-24 space-y-4 text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              A sanctuary for your story.
            </h2>
            <p className="mx-auto max-w-2xl text-xl font-light text-neutral-500">
              Sophisticated tools designed to help you capture, organize, and rediscover your life's
              most meaningful moments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:shadow-primary-900/5 hover:border-primary-100 rounded-3xl border border-transparent bg-neutral-50/50 p-8 transition-all duration-500 hover:bg-white hover:shadow-2xl"
              >
                <div className="bg-primary-900 mb-6 flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-black/20 transition-transform group-hover:scale-110">
                  <feature.icon weight="duotone" className="white-inner-icon h-6 w-6 text-white" />
                </div>
                <h3 className="font-display mb-4 text-2xl font-bold text-neutral-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed font-light text-neutral-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative overflow-hidden bg-neutral-50 py-32">
        <div className="bg-primary-100/30 absolute top-0 right-0 -mr-40 h-150 w-150 rounded-full blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-24 text-center">
            <h2 className="font-display mb-6 text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              Loved by the keepers.
            </h2>
            <p className="text-xl font-light text-neutral-600">
              Join those who have chosen a more meaningful way to preserve their legacy.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="rounded-3xl border border-neutral-100 bg-white p-10 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-6 flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      weight="duotone"
                      className="text-secondary-500 white-inner-icon h-4 w-4"
                    />
                  ))}
                </div>
                <p className="mb-10 text-lg leading-relaxed font-light text-neutral-700 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="bg-primary-900 mr-4 flex h-12 w-12 items-center justify-center rounded-full font-serif text-lg font-bold text-white shadow-inner">
                    {testimonial.avatar[0]}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm tracking-widest text-neutral-500 uppercase">
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
      <section className="border-y border-neutral-100 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-12 text-center lg:grid-cols-4">
            <div>
              <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
                10k+
              </div>
              <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Active Sanctuary
              </div>
            </div>
            <div>
              <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
                1M+
              </div>
              <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Memories Saved
              </div>
            </div>
            <div>
              <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
                50k+
              </div>
              <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Stories Crafted
              </div>
            </div>
            <div>
              <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
                4.9/5
              </div>
              <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Legacy Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-950 relative overflow-hidden py-40">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="bg-primary-900/50 pointer-events-none absolute top-1/2 left-1/2 h-250 w-250 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]" />
        <div className="bg-secondary-900/10 pointer-events-none absolute -bottom-40 -left-40 h-150 w-150 rounded-full blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display mb-8 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Begin your{" "}
            <span className="to-primary-200 bg-linear-to-r from-white bg-clip-text font-serif text-transparent italic">
              Archive.
            </span>
          </h2>
          <p className="text-primary-200/80 mx-auto mb-12 max-w-2xl text-xl leading-relaxed font-light">
            Every moment counts. Don't let your history fade into the digital noise. Join the
            sanctuary today.
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link href={"/register"}>
              <Button
                size="lg"
                className="text-primary-950 rounded-full bg-white px-12 py-7 text-lg font-bold shadow-xl shadow-black/20 transition-all duration-500 hover:scale-105 hover:bg-neutral-100"
              >
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white py-16 text-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:grid-cols-3">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="font-display text-2xl font-bold tracking-tight text-[#8B5CF6]">
                  Memory Lane
                </span>
              </div>
              <p className="max-w-sm text-base leading-relaxed font-light text-neutral-500">
                AI-powered legacy preservation and memory tracking for thoughtful individuals.
              </p>
              <div className="flex items-center space-x-5 text-neutral-400">
                <a
                  href="https://x.com/iampraiez"
                  className="hover:text-primary-900 transition-colors"
                >
                  <TwitterLogo weight="duotone" className="white-inner-icon" size={20} />
                </a>
                <a
                  href="https://www.linkedin.com/in/thepraiseolaoye"
                  className="hover:text-primary-900 transition-colors"
                >
                  <LinkedinLogo weight="duotone" className="white-inner-icon" size={20} />
                </a>
                <a
                  href="https://www.instagram.com/iampraiez_?igsh=enI4OWcxOHN1Yml3"
                  className="hover:text-primary-900 transition-colors"
                >
                  <InstagramLogo weight="duotone" className="white-inner-icon" size={20} />
                </a>
                <a
                  href="https://github.com/iampraiez/memo"
                  className="hover:text-primary-900 transition-colors"
                >
                  <GithubLogo weight="duotone" className="white-inner-icon" size={20} />
                </a>
              </div>
            </div>

            {/* Product Section */}
            <div>
              <h4 className="mb-6 text-lg font-bold text-neutral-950">Product</h4>
              <ul className="space-y-3 text-base font-medium text-neutral-500">
                <li>
                  <Link href="#features" className="transition-colors hover:text-neutral-900">
                    Features
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:himpraise571@gmail.com"
                    className="transition-colors hover:text-neutral-900"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/iampraiez/memo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-neutral-900"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="https://iampraiez.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-neutral-900"
                  >
                    About Me
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h4 className="mb-6 text-lg font-bold text-neutral-950">Legal</h4>
              <ul className="space-y-3 text-base font-medium text-neutral-500">
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-neutral-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-neutral-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-neutral-100 pt-8 text-xs font-medium tracking-widest text-neutral-400 uppercase md:flex-row">
            <p>&copy; {new Date().getFullYear()} Memory Lane. All rights reserved.</p>
            <p className="mt-4 md:mt-0">Built by Praiez</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
