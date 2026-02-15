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
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useMemories } from "@/hooks/useMemories";
import { useQueryClient } from "@tanstack/react-query";
import { memoryService } from "@/services/memory.service";
import { analyticsService } from "@/services/analytics.service";
import { userService } from "@/services/user.service";
import { socialService } from "@/services/social.service";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
  onClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onNavigate, onClick }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { data: memoriesData } = useMemories();
  const pathname = usePathname();

  const navigation = [
    { name: "Timeline", icon: House, id: "timeline" },
    { name: "Profile", icon: User, id: "profile" },
    { name: "Friends", icon: Users, id: "friends" },
    { name: "Images", icon: ImageIcon, id: "images" }, // Added Images item
    { name: "Search", icon: MagnifyingGlass, id: "search" },
    { name: "Tags", icon: Tag, id: "tags" },
    { name: "Stories", icon: BookOpen, id: "stories" },
    { name: "Analytics", icon: ChartLineUp, id: "analytics" },
    { name: "Settings", icon: Gear, id: "settings" },
    ...((session?.user as { role?: string })?.role === "admin"
      ? [{ name: "AdminCenter", icon: Shield, id: "admin" }]
      : []),
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[45] bg-neutral-950/40 backdrop-blur-md transition-all duration-500 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClick}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[50] w-[280px] transform border-r border-neutral-200/50 bg-white shadow-2xl transition-all duration-500 ease-in-out sm:w-[320px] lg:w-72 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          "lg:pb-8",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Branding - Premium */}
          <div className="mb-2 flex items-center space-x-3 p-6">
            <div className="bg-primary-900 shadow-primary-900/20 flex h-10 w-10 rotate-3 transform items-center justify-center rounded-xl shadow-lg">
              <span className="font-serif text-xl font-bold text-white">M</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl leading-none font-bold tracking-tight text-neutral-900">
                Memo
              </span>
              <span className="text-primary-600 mt-1 text-[10px] font-bold tracking-widest uppercase">
                Sanctuary
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 lg:py-0">
            <div className="mb-4 hidden px-3 lg:block">
              <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                Navigation
              </h3>
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.id === "timeline"
                  ? pathname === "/" || pathname === "/timeline"
                  : pathname.startsWith(`/${item.id}`);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    const path =
                      item.id === "profile" ? `/profile/${session?.user?.id}` : `/${item.id}`;
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
                        queryFn: ({ pageParam }) =>
                          socialService.getTimeline({
                            cursor: pageParam as string | undefined,
                            sort: "date",
                          }),
                        initialPageParam: undefined,
                      });
                    }
                  }}
                  className={cn(
                    "group relative flex w-full items-center space-x-4 rounded-2xl px-4 py-3.5 text-[13px] font-bold transition-all duration-300",
                    isActive
                      ? "bg-primary-50 text-primary-900 border-primary-100 border shadow-sm"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900",
                  )}
                >
                  <Icon
                    weight={isActive ? "fill" : "bold"}
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive
                        ? "text-primary-700 scale-110"
                        : "text-neutral-400 group-hover:text-neutral-900",
                    )}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="bg-primary-600 absolute right-4 h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats - Enhanced aesthetic */}
          <div className="p-6">
            <div className="space-y-5 rounded-[2rem] border border-white bg-gradient-to-br from-neutral-50 to-neutral-100 p-6 shadow-inner">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">
                  Your Archive
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <span className="font-display text-[28px] leading-none font-bold text-neutral-900">
                    {memoriesData?.memories?.length || 0}
                  </span>
                  <span className="mt-1 text-xs font-medium text-neutral-500">
                    Total Memories Captured
                  </span>
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
