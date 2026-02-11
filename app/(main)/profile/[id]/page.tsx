"use client";
import { useEffect, useState} from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { socialService } from "@/services/social.service";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import { Users, Calendar, MapPin, Heart, ChatCircle } from "@phosphor-icons/react";
import { toast } from "sonner";

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

  const { data: profile, isLoading, error } = useQuery({
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
  if (error || !profile) return <div className="p-20 text-center text-neutral-500">Profile not found</div>;

  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header Card */}
      <Card className="p-8 space-y-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-900 opacity-5" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6 pt-12">
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-primary-900 flex items-center justify-center">
            {profile.avatar ? (
              <Image 
                src={profile.avatar} 
                alt={profile.name} 
                fill 
                className="object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-secondary-400">{profile.name[0]}</span>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-display font-bold text-neutral-900">{profile.name}</h1>
            <div className="flex items-center justify-center md:justify-start space-x-4 text-neutral-500 text-sm">
              <span className="flex items-center"><Calendar className="mr-1" /> Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-neutral-700 max-w-lg">{profile.bio || "No bio yet."}</p>
          </div>

          <div className="flex items-center space-x-3">
            {isOwnProfile ? (
              <Button variant="secondary" onClick={() => router.push("/settings")}>Edit Profile</Button>
            ) : (
              <Button 
                variant={profile.isFollowing ? "secondary" : "primary"}
                onClick={() => profile.isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                disabled={followMutation.isPending || unfollowMutation.isPending}
              >
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-neutral-100 pt-6">
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{profile.followersCount}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Followers</p>
          </div>
          <div className="text-center border-x border-neutral-100">
            <p className="text-xl font-bold text-neutral-900">{profile.followingCount}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-neutral-900">{profile.memoriesCount}</p>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold">Memories</p>
          </div>
        </div>
      </Card>

      {/* Profile Feed Placeholder */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold text-neutral-900">Memories</h2>
        <div className="p-20 text-center text-neutral-400 border-2 border-dashed border-neutral-200 rounded-[2rem]">
          <p className="font-medium">Shared memories will appear here.</p>
        </div>
      </div>
    </div>
  );
}
