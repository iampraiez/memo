"use client";
import React, { useState } from "react";
import { Users, ArrowsClockwise, Heart, ChatCircle } from "@phosphor-icons/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTimelineMemories } from "@/hooks/useSocial";
import { useFamilyMembers } from "@/hooks/useFamily";
import Image from "next/image";

export default function FamilyTimelinePage() {
  const { data: timelineData, isLoading: isLoadingTimeline } = useTimelineMemories();
  const { data: familyData, isLoading: isLoadingFamily } = useFamilyMembers();

  const memories = timelineData?.memories || [];
  const family = familyData?.members || [];

  if (isLoadingTimeline || isLoadingFamily) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header>
        <h1 className="text-4xl font-display font-bold text-neutral-900 tracking-tight">Family Archive</h1>
        <p className="text-neutral-600 mt-2">A shared space for your collective history</p>
      </header>

      <div className="space-y-8">
        {memories.length > 0 ? (
          memories.map((memory: any) => (
            <Card key={memory.id} className="p-8 space-y-6 hover:shadow-2xl transition-all duration-500 border-neutral-100">
               <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                   <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-primary-900 rounded-full flex items-center justify-center text-secondary-400 font-bold overflow-hidden">
                           {memory.user?.image ? <Image src={memory.user.image} alt={memory.user.name} width={40} height={40} /> : memory.user?.name[0]}
                       </div>
                       <div>
                           <p className="font-bold text-neutral-900">{memory.user?.name}</p>
                           <p className="text-xs text-neutral-500 uppercase tracking-widest">{new Date(memory.date).toLocaleDateString()}</p>
                       </div>
                   </div>
                   <div className="flex items-center space-x-4 text-neutral-400">
                       <div className="flex items-center space-x-1">
                           <Heart size={18} />
                           <span className="text-sm font-bold">2</span>
                       </div>
                       <div className="flex items-center space-x-1">
                           <ChatCircle size={18} />
                           <span className="text-sm font-bold">1</span>
                       </div>
                   </div>
               </div>

               <div className="space-y-4">
                   <h2 className="text-2xl font-display font-bold text-neutral-900">{memory.title}</h2>
                   <p className="text-neutral-700 leading-relaxed line-clamp-3">{memory.content}</p>
                   {memory.images?.[0] && (
                       <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                           <Image src={memory.images[0]} alt={memory.title} fill className="object-cover" />
                       </div>
                   )}
               </div>
               
               <Button variant="secondary" className="w-full rounded-2xl">View Discussion</Button>
            </Card>
          ))
        ) : (
          <Card className="p-20 text-center space-y-4">
            <Users size={64} className="text-neutral-200 mx-auto" />
            <p className="text-neutral-500 font-medium">Your family archive is currently empty.</p>
            <Button className="rounded-full">Invite Family Members</Button>
          </Card>
        )}
      </div>
    </div>
  );
}
