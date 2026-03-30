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
import { cn, stripHtml } from "@/lib/utils";

interface MemoryCardProps {
  memory: Memory;
  onClick?: () => void;
  href?: string;
  onEdit?: (memory: Memory) => void;
  onDelete?: (memoryId: string) => void;
  onShareMemory?: (memory: Memory) => void;
  displayMode?: "grid" | "list";
  priority?: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  onClick,
  href,
  onEdit,
  onDelete,
  onShareMemory,
  displayMode = "grid",
  priority = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moodColors = {
    joyful: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      border: "border-yellow-400",
      accent: "bg-yellow-100",
      tag: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
    },
    peaceful: {
      bg: "bg-blue-50",
      text: "text-blue-800",
      border: "border-blue-400",
      accent: "bg-blue-100",
      tag: "bg-blue-100/50 text-blue-700 border-blue-200",
    },
    excited: {
      bg: "bg-orange-50",
      text: "text-orange-800",
      border: "border-orange-400",
      accent: "bg-orange-100",
      tag: "bg-orange-100/50 text-orange-700 border-orange-200",
    },
    nostalgic: {
      bg: "bg-purple-50",
      text: "text-purple-800",
      border: "border-purple-400",
      accent: "bg-purple-100",
      tag: "bg-purple-100/50 text-purple-700 border-purple-200",
    },
    grateful: {
      bg: "bg-green-50",
      text: "text-green-800",
      border: "border-green-400",
      accent: "bg-green-100",
      tag: "bg-green-100/50 text-green-700 border-green-200",
    },
    reflective: {
      bg: "bg-neutral-50",
      text: "text-neutral-800",
      border: "border-neutral-400",
      accent: "bg-neutral-100",
      tag: "bg-neutral-100/50 text-neutral-700 border-neutral-200",
    },
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

  const getMoodStyle = (mood: string | null | undefined) => {
    if (!mood) return null;
    return moodColors[mood as keyof typeof moodColors] || moodColors.reflective;
  };

  const moodStyle = getMoodStyle(memory.mood);
  const isLocked = memory.unlockDate ? new Date(memory.unlockDate) > new Date() : false;

  return (
    <Card
      hover={!isLocked}
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300",
        isLocked && "opacity-90 grayscale-[0.5]",
        moodStyle && !isLocked && `border-l-4 ${moodStyle.border}`,
        displayMode === "list" ? "flex flex-row items-stretch" : "space-y-0",
      )}
      padding="none"
      onClick={isLocked ? undefined : onClick ? () => onClick() : undefined}
      href={isLocked ? undefined : href}
    >
      {/* Mood Gradient Overlay */}
      {moodStyle && !isLocked && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-linear-to-br to-transparent opacity-[0.03]",
            moodStyle.accent,
          )}
        />
      )}

      {/* Image/Thumbnail */}
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100",
          displayMode === "list" ? "w-32 shrink-0 sm:w-48" : "aspect-video",
        )}
      >
        {isLocked ? (
          <div className="bg-primary-900 flex h-full w-full flex-col items-center justify-center space-y-3 p-6 text-white">
            <div className="bg-primary-800/50 flex h-16 w-16 items-center justify-center rounded-3xl backdrop-blur-md">
              <Calendar className="text-secondary-400 h-8 w-8" weight="fill" />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
                Capsule Sealed
              </p>
              <p className="border-secondary-500/30 mt-1 border-t pt-1 text-xs font-bold text-white">
                {memory.unlockDate && new Date(memory.unlockDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : memory.images && memory.images.length > 0 ? (
          <Image
            src={memory.images[0]}
            alt={memory.title}
            fill
            sizes={
              displayMode === "list"
                ? "(max-width: 768px) 128px, 192px"
                : "(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 33vw"
            }
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
            <Calendar className="text-primary-200 h-8 w-8" />
          </div>
        )}
        {memory.images && !isLocked && memory.images.length > 1 && (
          <div className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2 py-1 text-[8px] font-bold text-neutral-900 shadow-sm backdrop-blur-sm">
            +{memory.images.length - 1}
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-between p-4 sm:p-6">
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-display group-hover:text-primary-900 line-clamp-1 text-base font-bold text-neutral-900 transition-colors sm:text-xl">
                {isLocked ? "Heritage Time Capsule" : memory.title}
              </h3>
              <div className="mt-1 flex items-center space-x-3 text-xs text-neutral-500 sm:text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{new Date(memory.date).toLocaleDateString()}</span>
                </div>
                {memory.location && !isLocked && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="line-clamp-1">{memory.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Sync Status */}
              <div
                className={cn(
                  "hidden items-center sm:flex",
                  memory.syncStatus === "pending" && "text-warning-600",
                  memory.syncStatus === "offline" && "text-neutral-400",
                )}
              >
                <SyncIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>

              {/* More Menu */}
              {!isLocked && (
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 sm:h-8 sm:w-8"
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
              )}
            </div>
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-neutral-600 italic sm:text-sm">
            {isLocked
              ? "This memory has been sealed for the future. Unlock it to relive the moment."
              : stripHtml(memory.summary || memory.content)}
          </p>
        </div>

        {/* Tags and Mood */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {moodStyle && !isLocked && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase sm:px-2 sm:py-1 sm:text-[10px]",
                  moodStyle.tag,
                )}
              >
                <Heart className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" weight="fill" />
                {memory.mood}
              </span>
            )}
            {!isLocked &&
              displayMode === "grid" &&
              memory.tags?.slice(0, 2).map((tag) => (
                <Tag key={tag} size="sm" className="hidden sm:inline-flex">
                  {tag}
                </Tag>
              ))}
            {isLocked && (
              <span className="bg-primary-600 flex items-center rounded-full px-2 py-1 text-[9px] font-bold tracking-widest text-white uppercase transition-all hover:bg-black sm:px-3 sm:text-[10px]">
                <Calendar className="mr-1.5 h-3 w-3" weight="fill" />
                Locked Memory
              </span>
            )}
          </div>

          {memory.isAiGenerated && (
            <div className="text-primary-600 bg-primary-50 flex items-center space-x-1 rounded-lg px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase sm:px-2 sm:py-1 sm:text-[10px]">
              <div className="bg-primary-600 h-1 w-1 animate-pulse rounded-full sm:h-1.5 sm:w-1.5" />
              <span>AI</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MemoryCard;
