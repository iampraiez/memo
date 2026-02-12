"use client";
import React from "react";
import {
  House,
  MagnifyingGlass,
  Tag,
  BookOpen,
  Gear,
  ChartLineUp,
  Shield,
  Users,
  User,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useMemories } from "@/hooks/useMemories";
import { useQueryClient } from "@tanstack/react-query";
import { memoryService } from "@/services/memory.service";
import { analyticsService } from "@/services/analytics.service";
import { userService } from "@/services/user.service";
import { socialService } from "@/services/social.service";

interface SidebarProps {
  isOpen: boolean;
  currentPage: string;
  onNavigate: (page: string) => void;
  onClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  currentPage,
  onNavigate,
  onClick,
}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: memoriesData } = useMemories();
  
  const totalMemories = memoriesData?.memories?.length || 0;
  
  const navigation = [
    { name: "Timeline", icon: House, id: "timeline" },
    { name: "Profile", icon: User, id: "profile" },
    { name: "Friends", icon: Users, id: "friends" },
    { name: "Search", icon: MagnifyingGlass, id: "search" },
    { name: "Tags", icon: Tag, id: "tags" },
    { name: "Stories", icon: BookOpen, id: "stories" },
    { name: "Analytics", icon: ChartLineUp, id: "analytics" },
    { name: "Settings", icon: Gear, id: "settings" },
    ...((session?.user as any)?.role === "admin"
      ? [{ name: "AdminCenter", icon: Shield, id: "admin" }]
      : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-neutral-950/40 backdrop-blur-md z-[45] transition-all duration-500 lg:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClick} 
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-[280px] sm:w-[320px] lg:w-72 bg-white border-r border-neutral-200/50 shadow-2xl lg:shadow-none transform transition-all duration-500 ease-in-out z-[50]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          "lg:pb-8"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Branding - Premium */}
          <div className="p-6 flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/20 transform rotate-3">
              <span className="text-white font-serif font-bold text-xl">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-bold text-neutral-900 tracking-tight leading-none">Memo</span>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Sanctuary</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 lg:py-0 space-y-1 overflow-y-auto">
            <div className="px-3 mb-4 hidden lg:block">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Navigation</h3>
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const path = item.id === "profile" ? `/profile/${session?.user?.id}` : `/${item.id}`;
                    onNavigate(path.startsWith("/") ? path.slice(1) : path);
                    onClick();
                  }}
                  onMouseEnter={() => {
                    if (item.id === "timeline") {
                      queryClient.prefetchQuery({
                        queryKey: ["memories", { isPublic: undefined, limit: 100, offset: 0 }],
                        queryFn: () => memoryService.getAll(),
                      });
                    } else if (item.id === "analytics") {
                      queryClient.prefetchQuery({
                        queryKey: ["analytics", "year"],
                        queryFn: () => analyticsService.get("year"),
                      });
                    } else if (item.id === "settings") {
                      queryClient.prefetchQuery({
                        queryKey: ["userSettings"],
                        queryFn: () => userService.getSettings(),
                      });
                    } else if (item.id === "friends") {
                      queryClient.prefetchInfiniteQuery({
                        queryKey: ["memories", "timeline", "date"],
                        queryFn: ({ pageParam }) => socialService.getTimeline({ cursor: pageParam as string | undefined, sort: "date" }),
                        initialPageParam: undefined,
                      });
                    }
                  }}
                  className={cn(
                    "w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative",
                    isActive
                      ? "bg-primary-50 text-primary-900 shadow-sm border border-primary-100"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <Icon 
                    weight={isActive ? "fill" : "bold"}
                    className={cn(
                      "w-5 h-5 transition-all duration-300", 
                      isActive ? "text-primary-700 scale-110" : "text-neutral-400 group-hover:text-neutral-900"
                    )} 
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats - Enhanced aesthetic */}
          <div className="p-6">
            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-[2rem] p-6 space-y-5 border border-white shadow-inner">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  Your Archive
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <span className="text-[28px] font-display font-bold text-neutral-900 leading-none">
                    {totalMemories}
                  </span>
                  <span className="text-xs font-medium text-neutral-500 mt-1">Total Memories Captured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
