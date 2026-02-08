"use client";
import React, { useState } from "react";
import { Users, ArrowsClockwise, Heart, ChatCircle } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTimelineMemories } from "@/hooks/useSocial";
import { useFamilyMembers } from "@/hooks/useFamily";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";

export default function FamilyTimelinePage() {
  const { data: timelineData, isLoading: isLoadingTimeline } = useTimelineMemories();
  const { data: familyData, isLoading: isLoadingFamily } = useFamilyMembers();

  const memories = timelineData?.memories || [];
  const family = familyData?.members || [];

  if (isLoadingTimeline || isLoadingFamily) {
    return <Loading fullPage text="Curating your feed..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header>
        <h1 className="text-4xl font-display font-bold text-neutral-900 tracking-tight">Friends Feed</h1>
        <p className="text-neutral-600 mt-2">Connect and share memories with your sanctuary circle</p>
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
                           <span className="text-sm font-bold">{memory.reactions?.length || 0}</span>
                       </div>
                       <div className="flex items-center space-x-1">
                           <ChatCircle size={18} />
                           <span className="text-sm font-bold">{memory.comments?.length || 0}</span>
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
          <EmptyState
            icon={<Users className="w-12 h-12 text-secondary-400" weight="duotone" />}
            title="Shared Heritage"
            description="Invite your inner circle to start building a collective archive of your shared journey."
            actionLabel="Invite Friends"
            onAction={() => {/* TODO: Implement invite logic */}}
          />
        )}
      </div>
    </div>
  );
}
