"use client";
import React, { useState, useMemo } from "react";
import { useMemories } from "@/hooks/useMemories";
import Image from "next/image";
import { motion } from "framer-motion";
import Lightbox from "@/components/ui/Lightbox";
import { Image as ImageIcon, ShootingStar, Camera, Sparkle } from "@phosphor-icons/react";
import Card from "@/components/ui/Card";

export default function GalleryPage() {
  const { data, isLoading } = useMemories();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const allImages = useMemo(() => {
    if (!data?.memories) return [];
    return data.memories.flatMap((m) =>
      (m.images || []).map((url) => ({
        url,
        memoryId: m.id,
        title: m.title,
        date: m.date,
      })),
    );
  }, [data]);

  const imageUrls = useMemo(() => allImages.map((img) => img.url), [allImages]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="h-12 w-48 animate-pulse rounded-xl bg-neutral-200" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-12 p-6 pb-24 md:p-12">
      {/* Header */}
      <header className="relative space-y-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 flex items-center space-x-3"
        >
          <div className="bg-primary-100 rounded-xl p-2">
            <ImageIcon weight="fill" className="text-primary-600 h-6 w-6" />
          </div>
          <span className="text-primary-600 text-xs font-bold tracking-widest uppercase">
            Visual Sanctuary
          </span>
        </motion.div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl">
          Image Gallery
        </h1>
        <p className="max-w-lg text-lg text-neutral-500">
          A collection of every moment you&apos;ve captured. Relive your stories through visuals.
        </p>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 hidden opacity-20 lg:block">
          <Sparkle className="text-primary-200 h-32 w-32 animate-pulse" />
        </div>
      </header>

      {allImages.length === 0 ? (
        <Card className="mx-auto max-w-md space-y-6 py-20 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50">
            <Camera className="h-10 w-10 text-neutral-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">No images yet</h2>
            <p className="text-neutral-500">
              Captures will appear here once you add them to your memories.
            </p>
          </div>
        </Card>
      ) : (
        <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {allImages.map((img, idx) => (
            <motion.div
              key={`${img.memoryId}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative cursor-pointer break-inside-avoid"
              onClick={() => setSelectedImageIndex(idx)}
            >
              <div className="shadow-soft-lg group-hover:shadow-soft-xl relative overflow-hidden rounded-3xl bg-neutral-100 transition-all duration-500">
                <Image
                  src={img.url}
                  alt={img.title}
                  width={600}
                  height={800}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="h-auto w-full transform object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <motion.div initial={{ y: 20 }} whileHover={{ y: 0 }} className="space-y-1">
                    <h3 className="line-clamp-1 text-lg font-bold text-white">{img.title}</h3>
                    <div className="flex items-center text-xs font-medium tracking-widest text-white/70 uppercase">
                      <ShootingStar className="mr-1.5 h-3 w-3" />
                      {new Date(img.date).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedImageIndex !== null && (
        <Lightbox
          images={imageUrls}
          currentIndex={selectedImageIndex}
          isOpen={selectedImageIndex !== null && selectedImageIndex !== undefined}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </div>
  );
}
