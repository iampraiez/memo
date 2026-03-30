"use client";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { socialService } from "@/services/social.service";
import { apiService } from "@/services/api.service";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { Calendar, Heart, ChatCircle, Lock, Globe } from "@phosphor-icons/react";
import Link from "next/link";
import { toast } from "sonner";
import { is404Error } from "@/lib/utils";
import { Memory } from "@/types/types";

export default function ProfilePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = id as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => userService.getProfile(userId),
    enabled: mounted,
  });

  const { data: memoriesData, isLoading: isLoadingMemories } = useQuery({
    queryKey: ["profile-memories", userId],
    queryFn: () => apiService.get<{ memories: Memory[] }>(`/user/${userId}/memories`),
    enabled: mounted,
  });

  const followMutation = useMutation({
    mutationFn: () => socialService.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Followed user!");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => socialService.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Unfollowed user");
    },
  });

  if (!mounted || isLoading) return <Loading fullPage text="Entering sanctuary..." />;

  if (is404Error(error)) {
    notFound();
  }
  if (error) {
    return (
      <div className="p-20 text-center text-neutral-500">
        Something went wrong. Please try again.
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = session?.user?.id === userId;
  const profileMemories = memoriesData?.memories || [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Profile Header Card */}
      <Card className="relative space-y-6 overflow-hidden p-8">
        <div className="from-primary-900 via-primary-800 to-secondary-900 absolute top-0 left-0 h-32 w-full bg-linear-to-r opacity-5" />

        <div className="relative flex flex-col items-center space-y-4 pt-12 md:flex-row md:items-end md:space-y-0 md:space-x-6">
          <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-neutral-200 shadow-2xl">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name || "User profile"}
                fill
                sizes="128px"
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-neutral-500">
                {profile.name?.[0] || "?"}
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2 text-center md:text-left">
            <h1 className="font-display text-3xl font-bold text-neutral-900">{profile.name}</h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500 md:justify-start">
              <span className="flex items-center">
                <Calendar className="mr-1" /> Joined{" "}
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="max-w-lg text-neutral-700">{profile.bio || "No bio yet."}</p>
          </div>

          <div className="flex items-center space-x-3">
            {isOwnProfile ? (
              <Link href="/settings">
                <Button variant="secondary">Edit Profile</Button>
              </Link>
            ) : (
              <Button
                variant={profile?.isFollowing ? "secondary" : "primary"}
                onClick={() =>
                  profile?.isFollowing ? unfollowMutation.mutate() : followMutation.mutate()
                }
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {profile?.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
          <Link
            href={`/profile/${userId}/followers`}
            className="block cursor-pointer rounded-2xl p-2 text-center transition-colors hover:bg-neutral-50"
          >
            <p className="text-xl font-bold text-neutral-900">{profile?.followersCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Followers
            </p>
          </Link>
          <Link
            href={`/profile/${userId}/following`}
            className="block cursor-pointer rounded-2xl border-x border-neutral-100 p-2 text-center transition-colors hover:bg-neutral-50"
          >
            <p className="text-xl font-bold text-neutral-900">{profile?.followingCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Following
            </p>
          </Link>
          <div className="p-2 text-center">
            <p className="text-xl font-bold text-neutral-900">{profile?.memoriesCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Memories</p>
          </div>
        </div>
      </Card>

      {/* Memories Grid */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-neutral-900">
          {isOwnProfile ? "My Memories" : "Shared Memories"}
        </h2>

        {isLoadingMemories ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : profileMemories.length === 0 ? (
          <div className="rounded-4xl border-2 border-dashed border-neutral-200 p-20 text-center text-neutral-400">
            <p className="font-medium">
              {isOwnProfile
                ? "You haven't created any memories yet."
                : "No public memories to show yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileMemories.map((memory) => (
              <Card
                key={memory.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                {/* Cover image or gradient */}
                {memory.images && memory.images.length > 0 ? (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={memory.images[0]}
                      alt={memory.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  </div>
                ) : (
                  <div className="from-primary-100 to-secondary-100 h-40 bg-linear-to-br" />
                )}

                {/* Visibility badge */}
                <div className="absolute top-3 right-3">
                  <span className="flex items-center space-x-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold tracking-widest text-neutral-600 uppercase shadow-sm backdrop-blur-sm">
                    {memory.isPublic ? (
                      <Globe size={10} className="text-green-500" />
                    ) : (
                      <Lock size={10} className="text-orange-500" />
                    )}
                    <span>{memory.isPublic ? "Public" : "Private"}</span>
                  </span>
                </div>

                <div className="p-4">
                  <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
                    {new Date(memory.date).toLocaleDateString()}
                  </p>
                  <h3 className="mt-1 line-clamp-1 font-bold text-neutral-900">{memory.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{memory.content}</p>

                  <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div className="flex items-center space-x-3 text-neutral-400">
                      <span className="flex items-center space-x-1 text-xs">
                        <Heart size={12} />
                        <span>{memory.reactionCount ?? 0}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-xs">
                        <ChatCircle size={12} />
                        <span>{memory.commentCount ?? 0}</span>
                      </span>
                    </div>
                    {memory.tags && memory.tags.length > 0 && (
                      <span className="max-w-30 truncate rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                        #{memory.tags[0]}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
