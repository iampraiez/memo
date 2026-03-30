"use client";
import { useState } from "react";
import {
  Users,
  Heart,
  ChatCircle,
  MagnifyingGlass,
  CaretDown,
  UserPlus,
  ArrowRight,
  X,
} from "@phosphor-icons/react";
import Loading from "@/components/ui/Loading";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  useTimelineMemories,
  useSearchUsers,
  useFollowUser,
  useUnfollowUser,
} from "@/hooks/useSocial";
import { useFamilyMembers, useInviteFamilyMember, useRespondToInvite } from "@/hooks/useFamily";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useIsMounted } from "@/hooks/useIsMounted";
import EmptyState from "@/components/ui/EmptyState";
import Select from "@/components/ui/Select";
import InlineDiscussion from "@/components/InlineDiscussion";
import Modal from "@/components/ui/Modal";
import { Memory, Reaction, User } from "@/types/types";
import { toast } from "sonner";

interface FriendsClientProps {
  initialMemories: Memory[];
}

export default function FriendsClient({ initialMemories }: FriendsClientProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id || undefined;

  const [friendSearch, setFriendSearch] = useState("");
  const [discoverySearch, setDiscoverySearch] = useState("");
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [sort, setSort] = useState("date");
  const [openDiscussions, setOpenDiscussions] = useState<Set<string>>(new Set());
  const isMounted = useIsMounted();

  const toggleDiscussion = (memoryId: string) => {
    setOpenDiscussions((prev) => {
      const next = new Set(prev);
      if (next.has(memoryId)) {
        next.delete(memoryId);
      } else {
        next.add(memoryId);
      }
      return next;
    });
  };

  const {
    data: timelineData,
    isLoading: isLoadingTimeline,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTimelineMemories(sort, initialMemories);

  const { data: discoveryData, isLoading: isLoadingDiscovery } = useSearchUsers(discoverySearch);
  const { data: familyData } = useFamilyMembers(userId);

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const inviteMutation = useInviteFamilyMember(userId);
  const respondMutation = useRespondToInvite(userId);

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null);

  const handleFollow = async (user: User) => {
    setUpdatingUserId(user.id);
    try {
      await followMutation.mutateAsync(user.id);
      toast.success(`You are now following ${user.name}`);
    } catch {
      toast.error("Failed to follow user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUnfollow = async (user: User) => {
    setUpdatingUserId(user.id);
    try {
      await unfollowMutation.mutateAsync(user.id);
      toast.info(`Stopped following ${user.name}`);
    } catch {
      toast.error("Failed to unfollow user");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const [selectedUserToInvite, setSelectedUserToInvite] = useState<User | null>(null);
  const [inviteRelationship, setInviteRelationship] = useState("Family Member");

  const handleInvite = async (user: User) => {
    setSelectedUserToInvite(user);
    setInviteRelationship("Family Member");
  };

  const confirmInvite = async () => {
    if (!selectedUserToInvite) return;
    setInvitingUserId(selectedUserToInvite.id);
    try {
      await inviteMutation.mutateAsync({
        email: selectedUserToInvite.email,
        name: selectedUserToInvite.name ?? undefined,
        relationship: inviteRelationship,
      });
      toast.success(`Invitation sent to ${selectedUserToInvite.name}`);
      setSelectedUserToInvite(null);
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setInvitingUserId(null);
    }
  };

  const handleRespond = async (inviteId: string, name: string, status: "accepted" | "declined") => {
    try {
      await respondMutation.mutateAsync({ inviteId, status });
      toast.success(
        status === "accepted"
          ? `Welcome ${name} to the circle!`
          : `Invitation from ${name} declined`,
      );
    } catch {
      toast.error("Failed to respond to invitation");
    }
  };

  const memories = timelineData?.pages.flatMap((page) => page.memories) || [];

  const filteredMemories = memories.filter(
    (m) =>
      m.user?.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
      m.title.toLowerCase().includes(friendSearch.toLowerCase()),
  );

  const acceptedMembers = familyData?.members.filter((m) => m.status === "accepted") || [];
  const receivedInvites =
    familyData?.members.filter((m) => m.status === "pending" && m.isReceived) || [];
  const sentInvites =
    familyData?.members.filter((m) => m.status === "pending" && !m.isReceived) || [];
  const pendingInvites = [...receivedInvites, ...sentInvites];

  if (isLoadingTimeline && memories.length === 0) {
    return <Loading fullPage text="Curating your sanctuary circle..." />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 p-6">
      <header className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900">
            Sanctuary Circle
          </h1>
          <p className="mt-2 text-neutral-600">Our shared heritage in one space</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isDiscoveryOpen ? "primary" : "ghost"}
            size="sm"
            onClick={() => setIsDiscoveryOpen(!isDiscoveryOpen)}
            className="rounded-2xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <UserPlus size={20} className="mr-2" />
            Find Keepers
          </Button>
          <div className="w-44">
            <Select
              options={[
                { value: "date", label: "Latest Moments" },
                { value: "random", label: "Surprise Me" },
              ]}
              value={sort}
              onChange={setSort}
            />
          </div>
        </div>
      </header>

      {/* Sanctuary Circle Members - Horizontal List */}
      {acceptedMembers.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Current Circle
            </h2>
            <Link
              href="/settings"
              className="text-primary-600 hover:text-primary-700 text-xs font-bold"
            >
              Manage Circle
            </Link>
          </div>
          <div className="no-scrollbar -mx-6 flex space-x-6 overflow-x-auto px-6 pb-4">
            {acceptedMembers.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.userId || member.email}`}
                className="group flex flex-col items-center space-y-2 text-center"
              >
                <div className="relative">
                  <div className="bg-primary-900 text-secondary-400 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white font-bold shadow-lg transition-transform group-hover:scale-105">
                    {member.avatar ? (
                      <Image src={member.avatar} alt={member.name} width={64} height={64} />
                    ) : (
                      member.name[0]
                    )}
                  </div>
                  <div className="bg-success-500 absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="max-w-18">
                  <p className="truncate text-xs font-bold text-neutral-900">{member.name}</p>
                  <p className="truncate text-[10px] text-neutral-400">{member.relationship}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Discovery Section - Toggleable */}
      {isDiscoveryOpen && (
        <div className="animate-in fade-in slide-in-from-top-4 relative mx-auto max-w-2xl duration-300">
          <div className="relative">
            <MagnifyingGlass className="group-focus-within:text-primary-500 absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neutral-400 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or @username..."
              value={discoverySearch}
              onChange={(e) => setDiscoverySearch(e.target.value)}
              className="shadow-soft focus:ring-primary-500 w-full rounded-2xl border border-neutral-100 bg-white py-4 pr-4 pl-12 text-sm font-medium transition-all focus:ring-2"
              autoFocus
            />
            {isLoadingDiscovery && (
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                <div className="border-primary-500 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}
          </div>

          {/* Real-time Search Results Dropdown */}
          {discoverySearch.length >= 2 && discoveryData?.users && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl duration-200">
              {discoveryData.users.length > 0 ? (
                <div className="divide-y divide-neutral-50">
                  {(
                    discoveryData.users as (User & {
                      isFollowing?: boolean;
                      familyStatus?: string | null;
                    })[]
                  )
                    .slice(0, 5)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="group/item flex items-center justify-between p-4 transition-colors hover:bg-neutral-50"
                      >
                        <Link
                          href={`/profile/${user.username || user.id}`}
                          className="flex flex-1 items-center space-x-3"
                        >
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
                        </Link>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={user.isFollowing ? "ghost" : "primary"}
                            size="sm"
                            className="h-8 rounded-full px-4 text-[10px] font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              user.isFollowing ? handleUnfollow(user) : handleFollow(user);
                            }}
                            loading={updatingUserId === user.id}
                          >
                            {user.isFollowing ? "Unfollow" : "Follow"}
                          </Button>
                          <Button
                            variant={user.familyStatus ? "ghost" : "secondary"}
                            size="sm"
                            disabled={!!user.familyStatus}
                            className="h-8 rounded-full px-4 text-[10px] font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              handleInvite(user);
                            }}
                            loading={invitingUserId === user.id}
                          >
                            {user.familyStatus === "accepted"
                              ? "In Circle"
                              : user.familyStatus === "pending"
                                ? "Invited"
                                : "Invite"}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-medium text-neutral-400 italic">
                  No keepers found matches that name.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Proposals
            </h2>
            <span className="bg-primary-100 text-primary-700 rounded-full px-2.5 py-1 text-xs leading-none font-bold">
              {pendingInvites.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Received */}
            {receivedInvites.map((invite) => (
              <Card
                key={invite.id}
                className="border-primary-100 bg-primary-50/20 p-4 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary-900 text-secondary-400 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold">
                    {invite.avatar ? (
                      <Image src={invite.avatar} alt={invite.name} width={40} height={40} />
                    ) : (
                      invite.name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{invite.name}</p>
                    <p className="text-[10px] text-neutral-500">{invite.relationship}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => handleRespond(invite.id, invite.name, "accepted")}
                    >
                      <ArrowRight size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0 text-red-500 hover:bg-red-50"
                      onClick={() => handleRespond(invite.id, invite.name, "declined")}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {/* Sent */}
            {sentInvites.map((invite) => (
              <Card key={invite.id} className="border-neutral-100 bg-white p-4 opacity-80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 font-bold text-neutral-400">
                    {invite.avatar ? (
                      <Image src={invite.avatar} alt={invite.name} width={40} height={40} />
                    ) : (
                      invite.name[0]
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-neutral-900">{invite.name}</p>
                    <p className="text-[10px] text-neutral-500">{invite.relationship}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-neutral-100 bg-neutral-50 px-2 py-1 text-[8px] font-bold tracking-widest text-neutral-400 uppercase">
                    Awaiting
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Feed */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
            {sort === "random" ? "Serendipitous Moments" : "Chronicles Feed"}
          </h2>
          <div className="group relative">
            <MagnifyingGlass className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter by name..."
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              className="w-32 rounded-full border border-transparent bg-neutral-50 py-1.5 pr-4 pl-8 text-xs transition-all focus:w-48 focus:border-neutral-200 focus:bg-white"
            />
          </div>
        </div>

        {!isMounted ? (
          <div className="flex justify-center p-12">
            <Loading text="Syncing Feed..." />
          </div>
        ) : filteredMemories.length > 0 ? (
          <div className="space-y-6">
            {filteredMemories.map((memory: Memory) => (
              <Card
                key={memory.id}
                className="group space-y-6 border-neutral-100 p-8 transition-all duration-500 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <Link
                    href={`/profile/${memory.user?.username || memory.user?.id}`}
                    className="flex items-center space-x-3"
                  >
                    <div className="bg-primary-900 text-secondary-400 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-bold">
                      {memory.user?.image ? (
                        <Image
                          src={memory.user.image}
                          alt={memory.user.name}
                          width={40}
                          height={40}
                        />
                      ) : memory.user?.name ? (
                        memory.user.name[0]
                      ) : (
                        "?"
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        {memory.user?.name || "Anonymous"}
                      </p>
                      <p className="text-[10px] tracking-widest text-neutral-400 uppercase">
                        {new Date(memory.date).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
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
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {memory.tags?.map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold tracking-widest text-neutral-600 uppercase"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full rounded-2xl"
                  onClick={() => toggleDiscussion(memory.id)}
                >
                  {openDiscussions.has(memory.id) ? "Hide Discussion" : "View Discussion"}
                </Button>

                <InlineDiscussion memoryId={memory.id} isOpen={openDiscussions.has(memory.id)} />
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
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-16 w-16 text-neutral-200" weight="duotone" />}
            title="A Quiet Circle"
            description={
              friendSearch
                ? "No memories match your filter."
                : "Start follow other keepers or invite family to see their shared moments here."
            }
            actionLabel={friendSearch ? "Clear Search" : "Find Someone"}
            onAction={friendSearch ? () => setFriendSearch("") : () => setIsDiscoveryOpen(true)}
          />
        )}
      </section>

      {/* Invitation Modal */}
      <Modal
        isOpen={!!selectedUserToInvite}
        onClose={() => setSelectedUserToInvite(null)}
        title="Invite to Circle"
      >
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-900 text-secondary-400 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full font-bold shadow-lg">
              {selectedUserToInvite?.image ? (
                <Image
                  src={selectedUserToInvite.image}
                  alt={selectedUserToInvite.name || "User"}
                  width={64}
                  height={64}
                />
              ) : (
                (selectedUserToInvite?.name || "?")[0]
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">{selectedUserToInvite?.name}</h3>
              <p className="text-sm font-medium text-neutral-500">
                @{selectedUserToInvite?.username}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold tracking-widest text-neutral-400 uppercase">
              How are you related?
            </label>
            <Select
              options={[
                { value: "Parent", label: "Parent" },
                { value: "Sibling", label: "Sibling" },
                { value: "Partner", label: "Partner" },
                { value: "Child", label: "Child" },
                { value: "Grandparent", label: "Grandparent" },
                { value: "Relative", label: "Other Relative" },
                { value: "Close Friend", label: "Close Friend (Chosen Family)" },
              ]}
              value={inviteRelationship}
              onChange={setInviteRelationship}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setSelectedUserToInvite(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="rounded-xl"
              onClick={confirmInvite}
              loading={invitingUserId === selectedUserToInvite?.id}
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
