"use client";
import React, { useEffect, useState } from "react";
import { Memory } from "@/types/types";
import { MapPin, Calendar, ArrowRight, PencilSimple, Check } from "@phosphor-icons/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Image from "next/image";
import { useUpdateMemory } from "@/hooks/useMemories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Fix Leaflet marker icon issue in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface TimelineMapViewProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
}

export default function TimelineMapView({ memories, onMemoryClick }: TimelineMapViewProps) {
  const [mounted, setMounted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const updateMemory = useUpdateMemory();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter memories with location data
  const memoriesWithCoords = memories.filter((m) => m.location);

  const getCoords = (memory: Memory): [number, number] => {
    if (memory.latitude != null && memory.longitude != null) {
      return [memory.latitude, memory.longitude];
    }
    const loc = memory.location || "Earth";
    let hash = 0;
    for (let i = 0; i < loc.length; i++) {
      hash = loc.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = (hash % 180) / 2;
    const lng = ((hash * 31) % 360) / 2;
    return [lat, lng];
  };

  if (!mounted) return null;

  const worldBounds: L.LatLngBoundsExpression = [
    [-90, -180],
    [90, 180],
  ];

  return (
    <div className="relative z-0 h-[calc(100vh-280px)] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-inner">
      {/* Edit Mode Toggle */}
      <div className="absolute top-4 right-4 z-1000">
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={cn(
            "flex items-center space-x-2 rounded-2xl px-4 py-2 text-sm font-bold shadow-lg transition-all active:scale-95",
            isEditMode
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-white/90 text-neutral-900 backdrop-blur-md hover:bg-white",
          )}
        >
          {isEditMode ? (
            <>
              <Check weight="bold" />
              <span>Finish Editing</span>
            </>
          ) : (
            <>
              <PencilSimple weight="bold" />
              <span>Edit Pins</span>
            </>
          )}
        </button>
      </div>

      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxBounds={worldBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {memoriesWithCoords.map((memory) => {
          const coords = getCoords(memory);
          return (
            <Marker
              key={memory.id}
              position={coords}
              draggable={isEditMode}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  updateMemory.mutate(
                    {
                      id: memory.id,
                      data: { latitude: position.lat, longitude: position.lng },
                    },
                    {
                      onSuccess: () => {
                        toast.success("Memory location updated!");
                      },
                      onError: () => {
                        toast.error("Failed to update location.");
                        marker.setLatLng(coords); // revert
                      },
                    },
                  );
                },
              }}
            >
              <Popup className="premium-popup">
                <div className="w-64 overflow-hidden rounded-xl border-0 bg-white p-0 shadow-xl">
                  {memory.images && memory.images.length > 0 ? (
                    <div className="relative h-32 w-full">
                      <Image
                        src={memory.images[0]}
                        alt={memory.title}
                        fill
                        sizes="256px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary-900 flex h-32 w-full items-center justify-center">
                      <MapPin className="text-secondary-400 h-12 w-12" weight="fill" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display truncate text-lg font-bold text-neutral-900">
                      {memory.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-[10px] font-bold text-neutral-400 uppercase">
                      <Calendar size={12} weight="bold" />
                      <span>{new Date(memory.date).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                      {memory.summary || memory.content}
                    </p>
                    <button
                      onClick={() => onMemoryClick(memory)}
                      className="text-primary-600 mt-4 flex items-center space-x-1 text-xs font-bold transition-all hover:translate-x-1"
                    >
                      <span>Relive memory</span>
                      <ArrowRight size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
