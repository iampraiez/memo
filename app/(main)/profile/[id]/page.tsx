"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { socialService } from "@/services/social.service";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { Calendar } from "@phosphor-icons/react";
import { toast } from "sonner";
import { is404Error } from "@/lib/utils";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
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

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Profile Header Card */}
      <Card className="relative space-y-6 overflow-hidden p-8">
        <div className="from-primary-900 via-primary-800 to-secondary-900 absolute top-0 left-0 h-32 w-full bg-gradient-to-r opacity-5" />

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
              <Button variant="secondary" onClick={() => router.push("/settings")}>
                Edit Profile
              </Button>
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
          <div
            className="cursor-pointer rounded-2xl p-2 text-center transition-colors hover:bg-neutral-50"
            onClick={() => router.push(`/profile/${userId}/followers`)}
          >
            <p className="text-xl font-bold text-neutral-900">{profile?.followersCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Followers
            </p>
          </div>
          <div
            className="cursor-pointer rounded-2xl border-x border-neutral-100 p-2 text-center transition-colors hover:bg-neutral-50"
            onClick={() => router.push(`/profile/${userId}/following`)}
          >
            <p className="text-xl font-bold text-neutral-900">{profile?.followingCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">
              Following
            </p>
          </div>
          <div className="p-2 text-center">
            <p className="text-xl font-bold text-neutral-900">{profile?.memoriesCount ?? 0}</p>
            <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Memories</p>
          </div>
        </div>
      </Card>

      {/* Profile Feed Placeholder */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-bold text-neutral-900">Memories</h2>
        <div className="rounded-[2rem] border-2 border-dashed border-neutral-200 p-20 text-center text-neutral-400">
          <p className="font-medium">Shared memories will appear here.</p>
        </div>
      </div>
    </div>
  );
}
