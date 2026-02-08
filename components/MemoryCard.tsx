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
      className="cursor-pointer group overflow-hidden"
      padding="none"
      onClick={() => onClick?.()}
    >
        {/* Mood Gradient Overlay */}
        {memory.mood && (
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br to-transparent opacity-[0.03] pointer-events-none",
            moodColors[memory.mood].split(' ').pop()
          )} />
        )}
        
        <div className="p-6 space-y-4 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-display font-bold text-neutral-900 text-lg sm:text-xl line-clamp-1 group-hover:text-primary-900 transition-colors">
                {memory.title}
              </h3>
              <div className="flex items-center space-x-3 mt-1 text-sm text-neutral-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(memory.date).toLocaleDateString()}</span>
                </div>
                {memory.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
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
                  memory.syncStatus === "offline" && "text-neutral-400"
                )}
              >
                <SyncIcon className="w-4 h-4" />
              </div>

              {/* More Menu */}
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={(e) => handleMenuClick(e)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-soft-lg z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(memory);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Memory</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareMemory?.(memory);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                      >
                        {memory.isPublic ? <Download className="w-4 h-4" /> : <Share className="w-4 h-4" />}
                        <span>{memory.isPublic ? "Hide Memory" : "Share Memory"}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(memory.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-destructive-600 hover:bg-destructive-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
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
            <div className="relative aspect-video bg-neutral-100 rounded-2xl overflow-hidden group/image shadow-soft-lg">
              <Image
                src={memory.images[0]}
                alt={memory.title}
                fill
                className="object-cover transition-transform duration-700 group-hover/image:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500" />
              {memory.images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] px-3 py-1.5 rounded-full font-bold shadow-sm border border-white/20">
                  +{memory.images.length - 1} MORE
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl flex items-center justify-center border border-neutral-100 shadow-inner group/empty">
              <div className="p-4 rounded-full bg-white shadow-soft transition-transform duration-500 group-hover/empty:scale-110">
                <Calendar className="w-8 h-8 text-primary-200" />
              </div>
            </div>
          )}

          {/* Content Summary */}
          <p className="text-neutral-600 leading-relaxed text-sm">
            {memory.summary || memory.content.slice(0, 150)}
            {memory.content.length > 150 && "..."}
          </p>

          {/* Tags and Mood */}
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {memory.mood && (
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    moodColors[memory.mood]
                  )}
                >
                  <Heart className="w-3 h-3 mr-1" weight="fill" />
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
              <div className="flex items-center space-x-1.5 text-[10px] font-bold text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded-lg">
                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" />
                <span>AI Insight</span>
              </div>
            )}
          </div>
        </div>
    </Card>
  );
};

export default MemoryCard;
