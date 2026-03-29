import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkle, GithubLogo } from "@phosphor-icons/react/dist/ssr";
import Button from "@/components/ui/Button";

const HeroSection: React.FC = () => {
  return (
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

            <Link href="https://github.com/iampraiez/memo" target="_blank">
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
  );
};

export default HeroSection;
