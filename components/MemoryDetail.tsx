"use client";
import { ArrowLeft, MapPin, Calendar, ArrowsClockwise } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { useMemory } from "@/hooks/useMemories";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Memory } from "@/types/types";
import Lightbox from "@/components/ui/Lightbox";
import { useState, useEffect } from "react";
import { BookOpen, X } from "@phosphor-icons/react";

interface MemoryDetailProps {
  memoryId: string;
  onBack?: () => void;
  onEdit?: (memory: Memory) => void;
  onShareMemory?: (memory: Memory) => void;
}

export default function MemoryDetail({ memoryId, onBack }: MemoryDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useMemory(memoryId);
  const memory = data?.memory;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);

  useEffect(() => {
    if (isReadingMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isReadingMode]);

  const moodColors = {
    joyful: "bg-yellow-50 text-yellow-700 border-yellow-100",
    peaceful: "bg-blue-50 text-blue-700 border-blue-100",
    excited: "bg-orange-50 text-orange-700 border-orange-100",
    nostalgic: "bg-purple-50 text-purple-700 border-purple-100",
    grateful: "bg-green-50 text-green-700 border-green-100",
    reflective: "bg-neutral-50 text-neutral-700 border-neutral-100",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <ArrowsClockwise className="text-primary-600 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="text-destructive-600 text-lg font-medium">Memory not found</p>
        <Button onClick={() => (onBack ? onBack() : router.back())} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsReadingMode(true)}
          className="bg-primary-50 hover:bg-primary-100 border-primary-200 text-primary-700 font-bold"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Focus Mode
        </Button>
      </div>

      {isReadingMode && (
        <div className="animate-in fade-in fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-neutral-50/98 backdrop-blur-md transition-all duration-500">
          <button
            onClick={() => setIsReadingMode(false)}
            className="fixed top-8 right-8 z-70 flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-500 shadow-xl transition-all hover:scale-110 hover:text-neutral-900 active:scale-95"
            aria-label="Exit Reading Mode"
          >
            <X size={24} weight="bold" />
          </button>

          <article className="mx-auto max-w-2xl px-6 py-24 sm:py-32">
            <header className="mb-16 text-center">
              <div className="text-primary-600 mb-4 text-xs font-bold tracking-[0.2em] uppercase opacity-70">
                {new Date(memory.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <h1 className="font-display text-5xl leading-tight font-bold tracking-tight text-neutral-900 sm:text-6xl">
                {memory.title}
              </h1>
              {memory.location && (
                <div className="mt-6 flex items-center justify-center text-sm font-medium text-neutral-400">
                  <MapPin className="mr-2 h-4 w-4" />
                  {memory.location}
                </div>
              )}
            </header>

            <div
              className="font-serif text-2xl leading-[1.8] text-neutral-800 antialiased opacity-90 sm:text-3xl lg:text-4xl lg:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: memory.content }}
            />

            {memory.summary && (
              <div className="mt-20 border-t border-neutral-100 pt-20 text-center">
                <h3 className="text-primary-600 font-display mb-8 text-2xl font-bold italic opacity-40">
                  The Essence
                </h3>
                <p className="font-display text-xl leading-relaxed font-light text-neutral-600 italic sm:text-2xl">
                  {memory.summary}
                </p>
              </div>
            )}
          </article>
        </div>
      )}

      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-neutral-900">
            {memory.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium tracking-widest text-neutral-500 uppercase">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(memory.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {memory.location && (
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                {memory.location}
              </div>
            )}
            {memory.mood && (
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold ${moodColors[memory.mood as keyof typeof moodColors] || ""}`}
              >
                {memory.mood}
              </span>
            )}
          </div>
        </header>

        {memory.images && memory.images.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {memory.images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-video cursor-zoom-in overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <Image
                  src={img}
                  alt={memory.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        )}

        <article className="prose prose-neutral mx-auto max-w-(--ch-65) py-10">
          <div
            className="font-serif text-2xl leading-[1.6] text-neutral-800 antialiased opacity-95 sm:text-3xl"
            dangerouslySetInnerHTML={{ __html: memory.content }}
          />
        </article>

        {memory.summary && (
          <section className="bg-primary-900 relative mx-auto max-w-(--ch-65) overflow-hidden rounded-4xl p-10 text-white shadow-2xl">
            <div className="bg-secondary-400/10 absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full blur-3xl" />
            <h3 className="text-secondary-400 font-display mb-6 text-2xl font-bold italic">
              The Reflection
            </h3>
            <p className="text-primary-50 text-xl leading-relaxed font-light opacity-90">
              {memory.summary}
            </p>
          </section>
        )}

        {memory.tags && memory.tags.length > 0 && (
          <div className="mx-auto max-w-(--ch-65) border-t border-neutral-100 pt-10">
            <div className="flex flex-wrap gap-2">
              {memory.tags.map((tag) => (
                <Tag
                  key={tag}
                  className="hover:bg-primary-50 text-[10px] tracking-widest uppercase transition-colors"
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </div>

      {memory.images && (
        <Lightbox
          images={memory.images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
