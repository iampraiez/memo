"use client";
import React, { useEffect, useState } from "react";
import { Memory } from "@/types/types";
import { MapPin, Calendar, ArrowRight } from "@phosphor-icons/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Image from "next/image";

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter memories with location data
  const memoriesWithCoords = memories.filter((m) => m.location);
  // Note: For a real app, we'd geocode these locations.
  // For this audit, we'll simulate coordinates if they aren't provided
  // (assuming some might have lat/lng but the type doesn't explicitly show them yet)
  // We'll use a deterministic random for demo purposes based on location string hash
  const getCoords = (location: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < location.length; i++) {
      hash = location.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = (hash % 180) / 2;
    const lng = ((hash * 31) % 360) / 2;
    return [lat, lng];
  };

  if (!mounted) return null;

  return (
    <div className="relative z-0 h-[calc(100vh-280px)] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-inner">
      <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {memoriesWithCoords.map((memory) => {
          const coords = getCoords(memory.location || "Earth");
          return (
            <Marker key={memory.id} position={coords}>
              <Popup className="premium-popup">
                <div className="w-64 overflow-hidden rounded-xl bg-white p-0 shadow-xl">
                  {memory.images && memory.images.length > 0 ? (
                    <div className="relative h-32 w-full">
                      <Image
                        src={memory.images[0]}
                        alt={memory.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-primary-900 flex h-32 w-full items-center justify-center">
                      <MapPin className="text-secondary-400 h-12 w-12" weight="fill" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-neutral-900">
                      {memory.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2 text-[10px] font-bold text-neutral-400 uppercase">
                      <Calendar size={12} />
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
                      <ArrowRight size={14} />
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
