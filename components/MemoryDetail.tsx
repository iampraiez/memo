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
  onShareMemory 
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
      <div className="min-h-[400px] flex items-center justify-center">
        <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-destructive-600 font-medium text-lg">Memory not found</p>
        <Button onClick={() => onBack ? onBack() : router.back()} className="mt-6">Go Back</Button>
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <div className="flex items-center space-x-3">
          {onEdit && (
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => onEdit(memory)}>
              <PencilSimple className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {onShareMemory && (
            <Button variant="secondary" size="sm" className="rounded-full" onClick={() => onShareMemory(memory)}>
              <ShareNetwork className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <header className="space-y-4">
          <h1 className="text-4xl font-display font-bold text-neutral-900 tracking-tight leading-tight">
            {memory.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(memory.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {memory.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                {memory.location}
              </div>
            )}
             {memory.mood && (
               <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${moodColors[memory.mood as keyof typeof moodColors] || ""}`}>
                 {memory.mood}
               </span>
             )}
          </div>
        </header>

        {memory.images && memory.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {memory.images.map((img, idx) => (
               <div 
                key={idx} 
                className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 group cursor-zoom-in"
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
               >
                 <Image src={img} alt={memory.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
               </div>
             ))}
          </div>
        )}

        <article className="prose prose-neutral max-w-none">
          <p className="text-xl text-neutral-800 leading-relaxed font-light whitespace-pre-wrap">
            {memory.content}
          </p>
        </article>

        {memory.summary && (
          <section className="bg-primary-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-secondary-400 font-display font-bold text-xl mb-4 italic">The Reflection</h3>
            <p className="text-lg text-primary-50 font-light leading-relaxed">
              {memory.summary}
            </p>
          </section>
        )}

        {memory.tags && memory.tags.length > 0 && (
          <div className="pt-8 border-t border-neutral-100">
             <div className="flex flex-wrap gap-2">
               {memory.tags.map(tag => (
                 <Tag key={tag} className="hover:bg-primary-50 transition-colors uppercase tracking-widest text-[10px]">
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
