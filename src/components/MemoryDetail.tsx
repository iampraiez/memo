"use client";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ArrowsClockwise,
  BookOpen,
  X,
  Heart,
  Quotes,
  ShareNetwork,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { useMemory } from "@/hooks/useMemories";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Memory } from "@/types/types";
import Lightbox from "@/components/ui/Lightbox";
import MemoryShareModal from "@/components/MemoryShareModal";
import { useState, useEffect } from "react";

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
  const images = memory?.images || [];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
    joyful: "border-yellow-200 bg-yellow-50 text-yellow-800",
    peaceful: "border-blue-200 bg-blue-50 text-blue-800",
    excited: "border-orange-200 bg-orange-50 text-orange-800",
    nostalgic: "border-purple-200 bg-purple-50 text-purple-800",
    grateful: "border-green-200 bg-green-50 text-green-800",
    reflective: "border-neutral-200 bg-neutral-50 text-neutral-800",
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <ArrowsClockwise className="text-primary-600 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="mx-auto max-w-md py-32 text-center">
        <p className="font-display mb-6 text-2xl text-neutral-500">Memory not found</p>
        <Button onClick={() => (onBack ? onBack() : router.back())} variant="secondary">
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
    <div className="selection:bg-primary-100 selection:text-primary-900 relative mx-auto min-h-screen max-w-5xl rounded-3xl bg-white px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Actions */}
      <div className="pointer-events-none sticky top-4 z-40 mb-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="group hover:text-primary-600 pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-neutral-100 bg-white/80 text-neutral-600 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all hover:scale-110 active:scale-95"
        >
          <ArrowLeft
            weight="bold"
            className="h-5 w-5 transition-transform group-hover:-translate-x-1"
          />
        </button>

        <div className="pointer-events-auto flex items-center space-x-3">
          <button
            onClick={() => setIsReadingMode(true)}
            className="group hover:text-primary-600 flex items-center space-x-2 rounded-full border border-neutral-100 bg-white/80 px-5 py-3 font-bold text-neutral-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen
              weight="fill"
              className="text-primary-500 group-hover:text-primary-600 h-5 w-5"
            />
            <span>Focus Mode</span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="group hover:text-primary-600 flex h-12 w-12 items-center justify-center rounded-full border border-neutral-100 bg-white/80 text-neutral-600 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-all hover:scale-110 active:scale-95"
          >
            <ShareNetwork weight="bold" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Focus Mode Overlay */}
      {isReadingMode && (
        <div className="animate-in fade-in zoom-in-95 selection:bg-primary-200 fixed inset-0 z-100 flex flex-col overflow-y-auto bg-[#FAFAFA] transition-all duration-500">
          <div className="pointer-events-none sticky top-0 z-50 flex justify-end p-6 md:p-10">
            <button
              onClick={() => setIsReadingMode(false)}
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full border border-neutral-100 bg-white text-neutral-500 shadow-xl transition-all hover:scale-110 hover:text-neutral-900 active:scale-95"
              aria-label="Exit Reading Mode"
            >
              <X size={24} weight="bold" />
            </button>
          </div>

          <article className="mx-auto w-full max-w-3xl flex-1 px-6 pb-32">
            <header className="mb-16 space-y-8 text-center">
              <div className="inline-flex items-center space-x-2 rounded-full border border-neutral-100 bg-white px-4 py-2 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase shadow-sm">
                <Calendar size={14} className="text-primary-400" />
                <span>
                  {new Date(memory.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <h1 className="font-display text-5xl leading-[1.1] font-bold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl">
                {memory.title}
              </h1>
              {memory.location && (
                <div className="flex items-center justify-center text-sm font-medium text-neutral-500">
                  <MapPin className="text-primary-400 mr-2 h-4 w-4" />
                  {memory.location}
                </div>
              )}
            </header>

            {memory.summary && (
              <div className="mb-16 px-4 text-center md:px-12">
                <p className="font-display text-2xl leading-relaxed text-neutral-600 italic md:text-3xl">
                  "{memory.summary}"
                </p>
                <div className="mx-auto mt-12 h-px w-16 bg-neutral-300" />
              </div>
            )}

            <div
              className="prose prose-xl md:prose-2xl prose-neutral prose-p:my-8 prose-a:text-primary-600 first-letter:font-display first-letter:text-primary-900 mx-auto font-serif leading-[1.9] text-neutral-800 antialiased first-letter:float-left first-letter:mr-4 first-letter:text-7xl first-letter:font-bold first-line:tracking-widest first-line:uppercase"
              dangerouslySetInnerHTML={{ __html: memory.content }}
            />
          </article>
        </div>
      )}

      {/* Main Content View */}
      <div className="space-y-12 pb-20">
        {/* Header Section */}
        <header className="mx-auto max-w-3xl space-y-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold tracking-widest text-neutral-500 uppercase">
            <div className="flex items-center rounded-full border border-neutral-100 bg-neutral-50 px-3 py-1.5">
              <Calendar weight="fill" className="text-primary-400 mr-2 h-4 w-4" />
              {new Date(memory.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {memory.location && (
              <div className="flex items-center rounded-full border border-neutral-100 bg-neutral-50 px-3 py-1.5">
                <MapPin weight="fill" className="text-primary-400 mr-2 h-4 w-4" />
                {memory.location}
              </div>
            )}
            {memory.mood && (
              <div
                className={`flex items-center space-x-1.5 rounded-full border px-3 py-1.5 ${moodColors[memory.mood as keyof typeof moodColors] || "border-neutral-200 bg-neutral-50 text-neutral-600"}`}
              >
                <Heart weight="fill" size={14} className="opacity-80" />
                <span>{memory.mood}</span>
              </div>
            )}
          </div>

          <h1 className="font-display text-5xl leading-[1.1] font-bold tracking-tight text-neutral-900 md:text-6xl">
            {memory.title}
          </h1>
        </header>

        {/* Hero Imagery */}
        {images.length > 0 && (
          <div
            className={`grid gap-4 ${images.length === 1 ? "mx-auto max-w-4xl grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`group relative cursor-zoom-in overflow-hidden rounded-4xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] ${images.length === 1 ? "aspect-21/9" : "aspect-square md:aspect-4/3"}`}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <Image
                  src={img}
                  alt={memory.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1000px"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
              </div>
            ))}
          </div>
        )}

        {/* Story Section */}
        <div className="mx-auto max-w-3xl">
          {memory.summary && (
            <div className="bg-primary-50/50 border-primary-100/50 relative my-16 rounded-3xl border px-8 py-10 text-center md:px-12">
              <Quotes
                weight="fill"
                className="text-primary-200 border-primary-50 absolute top-0 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white p-2"
              />
              <p className="font-display mt-4 text-2xl leading-relaxed text-neutral-700 italic">
                {memory.summary}
              </p>
            </div>
          )}

          <article className="prose prose-lg md:prose-xl prose-neutral prose-p:my-6 prose-a:text-primary-600 hover:prose-a:underline first-letter:font-display first-letter:text-primary-900 mx-auto font-serif leading-[1.8] text-neutral-800 antialiased first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-bold">
            <div dangerouslySetInnerHTML={{ __html: memory.content }} />
          </article>

          {/* Tags */}
          {memory.tags && memory.tags.length > 0 && (
            <div className="mt-16 flex flex-wrap justify-center gap-2 border-t border-neutral-100 pt-10">
              {memory.tags.map((tag) => (
                <Tag
                  key={tag}
                  className="hover:border-primary-200 hover:text-primary-600 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs tracking-widest text-neutral-500 uppercase shadow-sm transition-all hover:bg-white hover:shadow-md"
                >
                  #{tag}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {images.length > 0 && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      {memory && (
        <MemoryShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          memory={memory}
        />
      )}
    </div>
  );
}
