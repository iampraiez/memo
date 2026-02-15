"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Heart, ChatCircle, MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  useTimelineMemories,
  useSearchUsers,
  useFollowUser,
  useUnfollowUser,
} from "@/hooks/useSocial";
import Image from "next/image";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import { Memory, Reaction, User } from "@/types/types";

interface FriendsClientProps {
  initialMemories: Memory[];
}

export default function FriendsClient({ initialMemories }: FriendsClientProps) {
  const [friendSearch, setFriendSearch] = useState("");
  const [discoverySearch, setDiscoverySearch] = useState("");
  const [sort, setSort] = useState("date"); // 'date' | 'random'
  const router = useRouter();

  const {
    data: timelineData,
    isLoading: isLoadingTimeline,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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

  const memories = timelineData?.pages.flatMap((page) => page.memories) || [];

  const filteredMemories = memories.filter(
    (m) =>
      m.user?.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      m.title.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  // We only show full page loading if we don't even have initial memories
  if (isLoadingTimeline && memories.length === 0) {
    return <Loading fullPage text="Curating your sanctuary circle..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 p-6">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900">
            Sanctuary Circle
          </h1>
          <p className="mt-2 text-neutral-600">
            Discover and connect with the keepers of shared heritage
          </p>
        </div>
        <div className="w-48">
          <Select
            options={[
              { value: "date", label: "Latest Moments" },
              { value: "random", label: "Surprise Me" },
            ]}
            value={sort}
            onChange={setSort}
          />
        </div>
      </header>

      <div className="group relative mx-auto max-w-2xl">
        <div className="relative">
          <MagnifyingGlass className="group-focus-within:text-primary-500 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400 transition-colors" />
          <input
            type="text"
            placeholder="Find people by @username..."
            value={discoverySearch}
            onChange={(e) => setDiscoverySearch(e.target.value)}
            className="shadow-soft focus:ring-primary-500 w-full rounded-2xl border border-neutral-100 bg-white py-4 pr-4 pl-12 text-sm font-medium transition-all focus:ring-2"
          />
          {isLoadingDiscovery && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2">
              <div className="border-primary-500 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Real-time Search Results Dropdown */}
        {discoverySearch.length >= 2 && discoveryData?.user && (
          <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl duration-200">
            {discoveryData.user.length > 0 ? (
              <div className="divide-y divide-neutral-50">
                {(discoveryData.user as (User & { isFollowing?: boolean })[])
                  .slice(0, 5)
                  .map((user) => (
                    <div
                      key={user.id}
                      className="group/item flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-neutral-50"
                      onClick={() => router.push(`/profile/${user.username || user.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary-900 text-secondary-400 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white font-bold shadow-sm">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                            />
                          ) : (
                            (user.name || "?")[0]
                          )}
                        </div>
                        <div>
                          <p className="group-hover/item:text-primary-600 text-sm font-bold text-neutral-900 transition-colors">
                            {user.name}
                          </p>
                          <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                            @{user.username || user.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={user.isFollowing ? "ghost" : "primary"}
                        size="sm"
                        className="h-8 rounded-full px-4 text-[10px] font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id);
                        }}
                        loading={updatingUserId === user.id}
                      >
                        {user.isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    </div>
                  ))}
                {discoveryData.user.length > 5 && (
                  <div className="bg-neutral-50/50 p-3 text-center">
                    <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                      Showing top 5 matches
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-sm font-medium text-neutral-400 italic">
                No matches found in the sanctuary.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feed */}
      <div className="space-y-8">
        <h2 className="px-2 text-sm font-bold tracking-widest text-neutral-400 uppercase">
          {sort === "random" ? "Serendipitous Moments" : "Chronicles Feed"}
        </h2>

        {filteredMemories.length > 0 ? (
          <>
            {filteredMemories.map((memory: Memory) => (
              <Card
                key={memory.id}
                className="group cursor-pointer space-y-6 border-neutral-100 p-8 transition-all duration-500 hover:shadow-2xl"
                onClick={() => router.push(`/memories/${memory.id}`)}
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-900 text-secondary-400 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-bold">
                      {memory.user?.image ? (
                        <Image
                          src={memory.user.image}
                          alt={memory.user.name}
                          width={40}
                          height={40}
                        />
                      ) : (
                        memory.user?.name[0]
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{memory.user?.name}</p>
                      <p className="text-xs tracking-widest text-neutral-500 uppercase">
                        {new Date(memory.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-neutral-400">
                    <div className="flex items-center space-x-1">
                      <Heart
                        size={18}
                        className={
                          memory.reactions?.some((r: Reaction) => r.type === "heart")
                            ? "fill-red-500 text-red-500"
                            : ""
                        }
                      />
                      <span className="text-sm font-bold">
                        {memory.reactionCount || memory.reactions?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatCircle size={18} />
                      <span className="text-sm font-bold">
                        {memory.commentCount || memory.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="font-display text-2xl font-bold text-neutral-900">
                    {memory.title}
                  </h2>
                  <p className="line-clamp-3 leading-relaxed text-neutral-700">{memory.content}</p>
                  {memory.images?.[0] && (
                    <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        src={memory.images[0]}
                        alt={memory.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {memory.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold tracking-wider text-neutral-600 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button variant="secondary" className="w-full rounded-2xl">
                  View Discussion
                </Button>
              </Card>
            ))}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-8">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="secondary"
                  className="rounded-2xl px-8 py-3"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loading className="mr-2 h-4 w-4" /> Loading more...
                    </>
                  ) : (
                    <>
                      <CaretDown className="mr-2 h-4 w-4" /> Load More Memories
                    </>
                  )}
                </Button>
              </div>
            )}

            {!hasNextPage && filteredMemories.length > 0 && (
              <div className="pt-8 text-center text-sm font-medium text-neutral-400">
                You've reached the end of the chronicles.
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Users className="text-secondary-400 h-12 w-12" weight="duotone" />}
            title="A Quiet Circle"
            description={
              friendSearch
                ? "No memories match your filter."
                : "Start following other sanctuary keepers to see their shared heritage here."
            }
            actionLabel={friendSearch ? "Clear Search" : "Discover Keepers"}
            onAction={() => (friendSearch ? setFriendSearch("") : setDiscoverySearch("a"))}
          />
        )}
      </div>
    </div>
  );
}
