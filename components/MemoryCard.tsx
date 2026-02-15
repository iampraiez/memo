import React, { useRef, useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  DotsThree as MoreHorizontal,
  Heart,
  Cloud,
  CloudSlash as CloudOff,
  PencilSimple as Edit,
  Trash as Trash2,
  ShareNetwork as Share,
  DownloadSimple as Download,
} from "@phosphor-icons/react";
import Image from "next/image";
import { Memory } from "@/types/types";
import Card from "./ui/Card";
import Tag from "./ui/Tag";
import Button from "./ui/Button";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
  onEdit?: (memory: Memory) => void; // Update prop type to pass memory
  onDelete?: (memoryId: string) => void; // Update prop type to pass memoryId
  onShareMemory?: (memory: Memory) => void; // Update prop type to pass memory
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onClick,
  onEdit,
  onDelete,
  onShareMemory,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moodColors = {
    joyful: "bg-yellow-100 text-yellow-800 border-yellow-200 from-yellow-50/50",
    peaceful: "bg-blue-100 text-blue-800 border-blue-200 from-blue-50/50",
    excited: "bg-orange-100 text-orange-800 border-orange-200 from-orange-50/50",
    nostalgic: "bg-purple-100 text-purple-800 border-purple-200 from-purple-50/50",
    grateful: "bg-green-100 text-green-800 border-green-200 from-green-50/50",
    reflective: "bg-gray-100 text-gray-800 border-gray-200 from-gray-50/50",
  };

  const syncIcons = {
    synced: Cloud,
    pending: Cloud,
    offline: CloudOff,
  };

  const SyncIcon = syncIcons[memory.syncStatus || "synced"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <Card
      hover
      className="group cursor-pointer overflow-hidden"
      padding="none"
      onClick={() => onClick?.()}
    >
      {/* Mood Gradient Overlay */}
      {memory.mood && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-[0.03]",
            moodColors[memory.mood].split(" ").pop(),
          )}
        />
      )}

      <div className="relative z-10 space-y-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display group-hover:text-primary-900 line-clamp-1 text-lg font-bold text-neutral-900 transition-colors sm:text-xl">
              {memory.title}
            </h3>
            <div className="mt-1 flex items-center space-x-3 text-sm text-neutral-500">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(memory.date).toLocaleDateString()}</span>
              </div>
              {memory.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sync Status */}
            <div
              className={cn(
                "flex items-center",
                memory.syncStatus === "pending" && "text-warning-600",
                memory.syncStatus === "offline" && "text-neutral-400",
              )}
            >
              <SyncIcon className="h-4 w-4" />
            </div>

            {/* More Menu */}
            <div className="relative" ref={menuRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => handleMenuClick(e)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>

              {showMenu && (
                <div className="shadow-soft-lg absolute top-full right-0 z-50 mt-1 w-48 overflow-hidden rounded-lg border border-neutral-200 bg-white">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(memory);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Memory</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareMemory?.(memory);
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50"
                    >
                      {memory.isPublic ? (
                        <Download className="h-4 w-4" />
                      ) : (
                        <Share className="h-4 w-4" />
                      )}
                      <span>{memory.isPublic ? "Hide Memory" : "Share Memory"}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(memory.id);
                        setShowMenu(false);
                      }}
                      className="text-destructive-600 hover:bg-destructive-50 flex w-full items-center space-x-2 px-4 py-2 text-left text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Memory</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* image Thumbnail */}
        {memory.images && memory.images.length > 0 ? (
          <div className="group/image shadow-soft-lg relative aspect-video overflow-hidden rounded-2xl bg-neutral-100">
            <Image
              src={memory.images[0]}
              alt={memory.title}
              fill
              className="object-cover transition-transform duration-700 group-hover/image:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover/image:opacity-100" />
            {memory.images.length > 1 && (
              <div className="absolute right-3 bottom-3 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-bold text-neutral-900 shadow-sm backdrop-blur-md">
                +{memory.images.length - 1} MORE
              </div>
            )}
          </div>
        ) : (
          <div className="group/empty flex aspect-video items-center justify-center rounded-2xl border border-neutral-100 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-inner">
            <div className="shadow-soft rounded-full bg-white p-4 transition-transform duration-500 group-hover/empty:scale-110">
              <Calendar className="text-primary-200 h-8 w-8" />
            </div>
          </div>
        )}

        {/* Content Summary */}
        <p className="text-sm leading-relaxed text-neutral-600">
          {memory.summary || memory.content.slice(0, 150)}
          {memory.content.length > 150 && "..."}
        </p>

        {/* Tags and Mood */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {memory.mood && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold tracking-wider uppercase",
                  moodColors[memory.mood as keyof typeof moodColors],
                )}
              >
                <Heart className="mr-1 h-3 w-3" weight="fill" />
                {memory.mood}
              </span>
            )}
            {memory.tags?.slice(0, 3).map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
          </div>

          {memory.isAiGenerated && (
            <div className="text-primary-600 bg-primary-50 flex items-center space-x-1.5 rounded-lg px-2 py-1 text-[10px] font-bold tracking-widest uppercase">
              <div className="bg-primary-600 h-1.5 w-1.5 animate-pulse rounded-full" />
              <span>AI Insight</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
