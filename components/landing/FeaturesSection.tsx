import React from "react";
import {
  Sparkle,
  Shield,
  Cloud,
  Calendar,
  BookOpen,
  Lightning,
} from "@phosphor-icons/react/dist/ssr";

const FeaturesSection: React.FC = () => {
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

  return (
    <section id="features" className="relative overflow-hidden bg-white py-32">
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
  );
};

export default FeaturesSection;
