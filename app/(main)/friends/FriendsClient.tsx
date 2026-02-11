"use client";
import { useState } from "react";
import { Users, Heart, ChatCircle, MagnifyingGlass, UserPlus, UserMinus, CaretDown } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTimelineMemories, useSearchUsers, useFollowUser, useUnfollowUser } from "@/hooks/useSocial";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { Memory } from "@/types/types";

interface FriendsClientProps {
  initialMemories: Memory[];
}

export default function FriendsClient({ initialMemories }: FriendsClientProps) {
  const [friendSearch, setFriendSearch] = useState("");
  const [discoverySearch, setDiscoverySearch] = useState("");
  const [sort, setSort] = useState("date"); // 'date' | 'random'
  
  const { 
    data: timelineData, 
    isLoading: isLoadingTimeline, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useTimelineMemories(sort, initialMemories);
  
  const { data: discoveryData, isLoading: isLoadingDiscovery } = useSearchUsers(discoverySearch);
  
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleFollow = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      await followMutation.mutateAsync(userId);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    setUpdatingUserId(userId);
    try {
      await unfollowMutation.mutateAsync(userId);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const memories = timelineData?.pages.flatMap(page => page.memories) || [];
  
  const filteredMemories = memories.filter(m => 
    m.user?.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
    m.title.toLowerCase().includes(friendSearch.toLowerCase())
  );

  // We only show full page loading if we don't even have initial memories
  if (isLoadingTimeline && memories.length === 0) {
    return <Loading fullPage text="Curating your sanctuary circle..." />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <h1 className="text-4xl font-display font-bold text-neutral-900 tracking-tight">Sanctuary Circle</h1>
            <p className="text-neutral-600 mt-2">Discover and connect with the keepers of shared heritage</p>
        </div>
        <div className="w-48">
            <Select 
                options={[
                    { value: "date", label: "Latest Moments" }, 
                    { value: "random", label: "Surprise Me" }
                ]} 
                value={sort} 
                onChange={setSort} 
            />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Filter loaded memories..."
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-100 bg-white shadow-soft focus:ring-2 focus:ring-primary-500 transition-all font-medium"
              />
          </div>
          <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Find new people by @username..."
                value={discoverySearch}
                onChange={(e) => setDiscoverySearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-100 bg-white shadow-soft focus:ring-2 focus:ring-secondary-500 transition-all font-medium"
              />
          </div>
      </div>

      {/* Discovery Results */}
      {discoverySearch.length >= 2 && (
          <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 px-2">Discovery Results</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isLoadingDiscovery ? (
                      <div className="p-8 text-center text-neutral-400 animate-pulse">Searching the sanctuary...</div>
                  ) : discoveryData?.users && discoveryData.users.length > 0 ? (
                      discoveryData.users.map((user: any) => (
                          <Card key={user.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 border-neutral-100 transition-colors">
                              <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-primary-900 rounded-full flex items-center justify-center text-secondary-400 font-bold overflow-hidden">
                                      {user.image ? <Image src={user.image} alt={user.name} width={48} height={48} /> : user.name[0]}
                                  </div>
                                  <div>
                                      <p className="font-bold text-neutral-900">{user.name}</p>
                                      <p className="text-xs text-neutral-500">@{user.username || user.id.slice(0, 8)}</p>
                                  </div>
                              </div>
                              <Button 
                                variant={user.isFollowing ? "secondary" : "primary"} 
                                size="sm" 
                                className="rounded-xl px-4"
                                onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                                loading={updatingUserId === user.id}
                              >
                                {!user.isFollowing && updatingUserId !== user.id && <UserPlus weight="bold" className="mr-2" />}
                                {user.isFollowing && updatingUserId !== user.id && <UserMinus weight="bold" className="mr-2" />}
                                <span className="font-bold text-xs">
                                  {updatingUserId === user.id ? (user.isFollowing ? "Unfollowing..." : "Following...") : (user.isFollowing ? "Unfollow" : "Follow")}
                                </span>
                              </Button>
                          </Card>
                      ))
                  ) : (
                      <div className="p-8 text-center text-neutral-400">No keepers found matching that username.</div>
                  )
                  }
              </div>
          </div>
      )}

      {/* Feed */}
      <div className="space-y-8">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-400 px-2">
            {sort === 'random' ? "Serendipitous Moments" : "Chronicles Feed"}
        </h2>
        
        {filteredMemories.length > 0 ? (
          <>
            {filteredMemories.map((memory: any) => (
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
                               <Heart size={18} className={memory.reactions?.some((r: any) => r.type === 'heart') ? "text-red-500 fill-red-500" : ""} />
                               <span className="text-sm font-bold">{memory.reactionCount || memory.reactions?.length || 0}</span>
                           </div>
                           <div className="flex items-center space-x-1">
                               <ChatCircle size={18} />
                               <span className="text-sm font-bold">{memory.commentCount || memory.comments?.length || 0}</span>
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
                       <div className="flex flex-wrap gap-2 pt-2">
                           {memory.tags?.map((tag: string) => (
                               <span key={tag} className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-wider">
                                   #{tag}
                               </span>
                           ))}
                       </div>
                   </div>
                   
                   <Button variant="secondary" className="w-full rounded-2xl">View Discussion</Button>
                </Card>
            ))}
            
            {/* Load More Button */}
            {hasNextPage && (
                <div className="pt-8 flex justify-center">
                    <Button 
                        onClick={() => fetchNextPage()} 
                        disabled={isFetchingNextPage}
                        variant="secondary"
                        className="px-8 py-3 rounded-2xl"
                    >
                        {isFetchingNextPage ? (
                            <><Loading className="w-4 h-4 mr-2" /> Loading more...</>
                        ) : (
                            <><CaretDown className="w-4 h-4 mr-2" /> Load More Memories</>
                        )}
                    </Button>
                </div>
            )}
            
            {!hasNextPage && filteredMemories.length > 0 && (
                <div className="pt-8 text-center text-neutral-400 text-sm font-medium">
                    You've reached the end of the chronicles.
                </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Users className="w-12 h-12 text-secondary-400" weight="duotone" />}
            title="A Quiet Circle"
            description={friendSearch ? "No memories match your filter." : "Start following other sanctuary keepers to see their shared heritage here."}
            actionLabel={friendSearch ? "Clear Search" : "Discover Keepers"}
            onAction={() => friendSearch ? setFriendSearch("") : setDiscoverySearch("a")}
          />
        )}
      </div>
    </div>
  );
}
