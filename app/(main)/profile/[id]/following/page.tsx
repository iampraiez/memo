"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFollowing } from "@/hooks/useSocial";
import { ArrowLeft, UserMinus, User } from "lucide-react";
import Button from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { useSession } from "next-auth/react";
import { useUnfollowUser } from "@/hooks/useSocial";
import { toast } from "sonner";

export default function FollowingPage() {
  const { id } = useParams();
  const { data, isLoading } = useFollowing(id as string);
  const router = useRouter();
  const { data: session } = useSession();
  const unfollowMutation = useUnfollowUser();

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowMutation.mutateAsync(userId);
      toast.success("Unfollowed user");
    } catch {
      toast.error("Failed to unfollow user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const following = data?.following || [];

  return (
    <div className="mx-auto max-w-400 px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5 text-neutral-600" />
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900">Following</h1>
      </div>

      {/* List */}
      <div className="space-y-4">
        {following.length === 0 ? (
          <div className="rounded-[2rem] border border-neutral-100 bg-white py-20 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-neutral-200" />
            <p className="font-medium text-neutral-500">Not following anyone yet</p>
          </div>
        ) : (
          following.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-[2rem] border border-neutral-100 bg-white p-5 transition-all hover:shadow-lg hover:shadow-neutral-950/5"
            >
              <div
                className="flex cursor-pointer items-center space-x-4"
                onClick={() => router.push(`/profile/${user.username || user.id}`)}
              >
                <div className="relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="bg-primary-100 flex h-12 w-12 items-center justify-center rounded-full">
                      <User className="text-primary-600 h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{user.name || "Anonymous User"}</h3>
                  <p className="text-sm font-medium text-neutral-500">
                    @{user.username || user.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {session?.user?.id !== user.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive-600 hover:bg-destructive-50 hover:text-destructive-700 h-9 rounded-full px-4 text-xs font-bold"
                  onClick={() => handleUnfollow(user.id)}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Unfollow
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
