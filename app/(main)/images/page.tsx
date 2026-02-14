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
      (m.images || []).map(url => ({
        url,
        memoryId: m.id,
        title: m.title,
        date: m.date
      }))
    );
  }, [data]);

  const imageUrls = useMemo(() => allImages.map(img => img.url), [allImages]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="h-12 w-48 bg-neutral-200 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 space-y-12 min-h-screen pb-24">
      {/* Header */}
      <header className="relative space-y-2">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 mb-2"
        >
            <div className="p-2 bg-primary-100 rounded-xl">
                <ImageIcon weight="fill" className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-primary-600 font-bold uppercase tracking-widest text-xs">Visual Sanctuary</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-neutral-900 tracking-tight">
          Image Gallery
        </h1>
        <p className="text-neutral-500 max-w-lg text-lg">
          A collection of every moment you&apos;ve captured. Relive your stories through visuals.
        </p>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -z-10 opacity-20 hidden lg:block">
            <Sparkle className="w-32 h-32 text-primary-200 animate-pulse" />
        </div>
      </header>

      {allImages.length === 0 ? (
        <Card className="max-w-md mx-auto py-20 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-neutral-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">No images yet</h2>
            <p className="text-neutral-500">
              Captures will appear here once you add them to your memories.
            </p>
          </div>
        </Card>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {allImages.map((img, idx) => (
            <motion.div
              key={`${img.memoryId}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              transition={{ delay: idx * 0.05 }}
              className="relative break-inside-avoid group cursor-pointer"
              onClick={() => setSelectedImageIndex(idx)}
            >
              <div className="relative overflow-hidden rounded-3xl bg-neutral-100 shadow-soft-lg group-hover:shadow-soft-xl transition-all duration-500">
                <Image
                  src={img.url}
                  alt={img.title}
                  width={600}
                  height={800}
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <motion.div 
                    initial={{ y: 20 }}
                    whileHover={{ y: 0 }}
                    className="space-y-1"
                  >
                    <h3 className="text-white font-bold text-lg line-clamp-1">{img.title}</h3>
                    <div className="flex items-center text-white/70 text-xs font-medium uppercase tracking-widest">
                      <ShootingStar className="w-3 h-3 mr-1.5" />
                      {new Date(img.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
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
          isOpen={selectedImageIndex !== null}
          onClose={() => setSelectedImageIndex(null)}
          onNavigate={setSelectedImageIndex}
        />
      )}
    </div>
  );
}
