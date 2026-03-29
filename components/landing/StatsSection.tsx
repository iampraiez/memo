import React from "react";

const StatsSection: React.FC = () => {
  return (
    <section className="border-y border-neutral-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-12 text-center lg:grid-cols-4">
          <div>
            <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
              500+
            </div>
            <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Active Sanctuary
            </div>
          </div>
          <div>
            <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
              15k+
            </div>
            <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Memories Saved
            </div>
          </div>
          <div>
            <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
              2k+
            </div>
            <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Stories Crafted
            </div>
          </div>
          <div>
            <div className="font-display text-primary-900 text-5xl font-bold tracking-tight">
              Beta
            </div>
            <div className="mt-3 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Early Access
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
