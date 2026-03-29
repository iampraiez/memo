import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const CTASection: React.FC = () => {
  return (
    <section className="bg-primary-950 relative overflow-hidden py-40">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20" />
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
  );
};

export default CTASection;
