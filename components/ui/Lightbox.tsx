"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface LightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex + 1) % images.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
        >
          {/* Header */}
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-6">
            <span className="text-sm font-medium text-white/70">
              {currentIndex + 1} / {images.length}
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-white hover:bg-white/10"
              >
                <X weight="bold" className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-12">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative h-full w-full"
            >
              <Image
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
                className="group absolute top-1/2 left-6 -translate-y-1/2 rounded-full bg-white/5 p-3 text-white transition-all hover:scale-110 hover:bg-white/10 active:scale-95"
              >
                <CaretLeft
                  weight="bold"
                  className="h-8 w-8 transition-transform group-hover:-translate-x-0.5"
                />
              </button>
              <button
                onClick={() => onNavigate((currentIndex + 1) % images.length)}
                className="group absolute top-1/2 right-6 -translate-y-1/2 rounded-full bg-white/5 p-3 text-white transition-all hover:scale-110 hover:bg-white/10 active:scale-95"
              >
                <CaretRight
                  weight="bold"
                  className="h-8 w-8 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-10 flex justify-center overflow-x-auto px-6">
              <div className="flex space-x-3 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={`relative h-14 w-14 overflow-hidden rounded-lg transition-all duration-300 ${
                      currentIndex === idx
                        ? "ring-primary-500 scale-110 ring-2"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Lightbox;
