import React from "react";
import { Star } from "@phosphor-icons/react/dist/ssr";

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: "Arthur Vance",
      role: "Digital Legacy Keeper",
      content:
        "Finally, a place that treats my memories with the reverence they deserve. The AI story feature helped me write a narrative I've been struggling to start for years.",
      avatar: "AV",
    },
    {
      name: "Lena Schmidt",
      role: "Family Archivist",
      content:
        "The timeline view and mood-based themes have turned my chaotic photo collection into a living history of my children's lives. It's truly a sanctuary.",
      avatar: "LS",
    },
    {
      name: "David Chen",
      role: "Heritage Preserver",
      content:
        "Sharing our history with the rest of the family has never felt so intimate and secure. It's the digital equivalent of a safe and warm family living room.",
      avatar: "DC",
    },
  ];

  return (
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
  );
};

export default TestimonialsSection;
