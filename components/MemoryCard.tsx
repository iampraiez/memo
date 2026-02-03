import React, { useRef, useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  MoreHorizontal,
  Heart,
  Cloud,
  CloudOff,
  Edit,
  Trash2,
  Share,
  Download,
} from "lucide-react";
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
    joyful: "bg-yellow-100 text-yellow-800 border-yellow-200",
    peaceful: "bg-blue-100 text-blue-800 border-blue-200",
    excited: "bg-orange-100 text-orange-800 border-orange-200",
    nostalgic: "bg-purple-100 text-purple-800 border-purple-200",
    grateful: "bg-green-100 text-green-800 border-green-200",
    reflective: "bg-gray-100 text-gray-800 border-gray-200",
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
      className="cursor-pointer"
      onClick={() => {
        console.log("fin");
        onClick?.();
      }}

    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900 text-base sm:text-lg line-clamp-1">
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
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-soft-lg z-50">
                  <div className="py-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(memory); // Pass memory object
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
                        onShareMemory?.(memory); // Pass memory object
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      {memory.isPublic ? (
                        <Download className="w-4 h-4" />
                      ) : (
                        <Share className="w-4 h-4" />
                      )}{" "}
                      {/* Change icon based on isPublic */}
                      <span>
                        {memory.isPublic ? "Hide Memory" : "Share Memory"}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(memory.id); // Pass memory.id
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
          <div className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden group/image">
            <Image
              src={memory.images[0]}
              alt={memory.title}
              fill
              className="object-cover transition-transform duration-500 group-hover/image:scale-105"
            />
            {memory.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full font-medium">
                +{memory.images.length - 1} more
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-lg flex items-center justify-center border border-neutral-100">
            <Calendar className="w-8 h-8 text-neutral-200" />
          </div>
        )}

        {/* Content Summary */}
        <p className="text-neutral-600 leading-relaxed">
          {memory.summary || memory.content.slice(0, 150)}
          {memory.content.length > 150 && "..."}
        </p>

        {/* Tags and Mood */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {memory.mood && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                  moodColors[memory.mood]
                )}
              >
                <Heart className="w-3 h-3 mr-1" />
                {memory.mood}
              </span>
            )}
            {memory.tags?.slice(0, 3).map((tag) => (
              <Tag key={tag} size="sm">
                {tag}
              </Tag>
            ))}
            {(memory.tags?.length || 0) > 3 && (
              <span className="text-xs text-neutral-500">
                +{(memory.tags?.length || 0) - 3} more
              </span>
            )}
          </div>


          {memory.isAiGenerated && (
            <div className="flex items-center space-x-1 text-xs text-primary-600">
              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
              <span>AI</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
