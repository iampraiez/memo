"use client";
import {
  ArrowLeft,
  PencilSimple,
  ShareNetwork,
  MapPin,
  Calendar,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import { useMemory } from "@/hooks/useMemories";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Memory } from "@/types/types";
import Lightbox from "@/components/ui/Lightbox";
import { useState } from "react";

interface MemoryDetailProps {
  memoryId: string;
  onBack?: () => void;
  onEdit?: (memory: Memory) => void;
  onShareMemory?: (memory: Memory) => void;
}

export default function MemoryDetail({
  memoryId,
  onBack,
  onEdit,
  onShareMemory,
}: MemoryDetailProps) {
  const router = useRouter();
  const { data, isLoading, error } = useMemory(memoryId);
  const memory = data?.memory;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
      <div className="flex min-h-[400px] items-center justify-center">
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
        <div className="flex items-center space-x-3">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => onEdit(memory)}
            >
              <PencilSimple className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onShareMemory && (
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full"
              onClick={() => onShareMemory(memory)}
            >
              <ShareNetwork className="mr-2 h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </div>

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
                />
              </div>
            ))}
          </div>
        )}

        <article className="prose prose-neutral max-w-none">
          <p className="text-xl leading-relaxed font-light whitespace-pre-wrap text-neutral-800">
            {memory.content}
          </p>
        </article>

        {memory.summary && (
          <section className="bg-primary-900 relative overflow-hidden rounded-3xl p-8 text-white">
            <div className="bg-secondary-400/10 absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full blur-3xl" />
            <h3 className="text-secondary-400 font-display mb-4 text-xl font-bold italic">
              The Reflection
            </h3>
            <p className="text-primary-50 text-lg leading-relaxed font-light">{memory.summary}</p>
          </section>
        )}

        {memory.tags && memory.tags.length > 0 && (
          <div className="border-t border-neutral-100 pt-8">
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
