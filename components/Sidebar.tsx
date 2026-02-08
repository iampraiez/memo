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
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useMemories } from "@/hooks/useMemories";

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
  const { data: memoriesData } = useMemories();
  
  const totalMemories = memoriesData?.memories?.length || 0;
  
  const navigation = [
    { name: "Timeline", icon: House, id: "timeline" },
    { name: "Family", icon: Users, id: "family" },
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
      {isOpen && <div className="lg:hidden fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-30" onClick={onClick} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-100 transform transition-transform duration-300 ease-in-out",
          "h-full overflow-y-auto z-40",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:z-20 lg:pt-20 lg:pb-4"
        )}
      >
        <div className="flex flex-col h-full bg-white">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-1.5 focus:outline-none">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClick();
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                    isActive
                      ? "bg-neutral-900 text-white shadow-xl shadow-neutral-900/10"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <Icon 
                    weight={isActive ? "fill" : "regular"}
                    className={cn(
                      "w-5 h-5 transition-colors", 
                      isActive ? "text-secondary-400" : "text-neutral-400 group-hover:text-neutral-600"
                    )} 
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-6 py-8 border-t border-neutral-100">
            <div className="bg-neutral-50 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Archive Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Memories</span>
                  <span className="font-bold text-neutral-900">{totalMemories}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-500">Growth</span>
                  <span className="font-bold text-green-600 inline-flex items-center">
                    +12%
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
