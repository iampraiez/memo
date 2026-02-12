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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  const following = data?.following || [];

  return (
    <div className="max-w-400 mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-5 h-5 text-neutral-600" />
        </Button>
        <h1 className="text-2xl font-bold text-neutral-900">Following</h1>
      </div>

      {/* List */}
      <div className="space-y-4">
        {following.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-neutral-100">
            <User className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
            <p className="text-neutral-500 font-medium">Not following anyone yet</p>
          </div>
        ) : (
          following.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-neutral-100 hover:shadow-lg hover:shadow-neutral-950/5 transition-all"
            >
              <div 
                className="flex items-center space-x-4 cursor-pointer"
                onClick={() => router.push(`/profile/${user.username || user.id}`)}
              >
                <div className="relative">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{user.name || "Anonymous User"}</h3>
                  <p className="text-sm text-neutral-500 font-medium">@{user.username || user.id.slice(0, 8)}</p>
                </div>
              </div>

              {session?.user?.id !== user.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 font-bold text-xs h-9 text-destructive-600 hover:bg-destructive-50 hover:text-destructive-700"
                  onClick={() => handleUnfollow(user.id)}
                >
                  <UserMinus className="w-4 h-4 mr-2" />
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
