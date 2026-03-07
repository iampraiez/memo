import React, { useState } from "react";
import { Heart, Send, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api.service";
import Image from "next/image";
import { Comment, Reaction } from "@/types/types";
import { toast } from "sonner";

interface InlineDiscussionProps {
  memoryId: string;
  isOpen: boolean;
}

const InlineDiscussion: React.FC<InlineDiscussionProps> = ({ memoryId, isOpen }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");

  const { data: commentsData } = useQuery({
    queryKey: ["comments", memoryId],
    queryFn: () => apiService.get<{ comments: Comment[] }>(`/memories/${memoryId}/comments`),
    enabled: isOpen,
  });

  const { data: reactionsData } = useQuery({
    queryKey: ["reactions", memoryId],
    queryFn: () => apiService.get<{ reactions: Reaction[] }>(`/memories/${memoryId}/reactions`),
    enabled: isOpen,
  });

  const reactMutation = useMutation({
    mutationFn: () => apiService.post(`/memories/${memoryId}/reactions`, { type: "heart" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reactions", memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => apiService.post(`/memories/${memoryId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
      setCommentText("");
      toast.success("Comment added");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiService.post(`/memories/${memoryId}/comments/${commentId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", memoryId] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiService.delete(`/memories/${memoryId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", memoryId] });
      queryClient.invalidateQueries({ queryKey: ["memories", "timeline"] });
      toast.success("Comment deleted");
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  const comments = commentsData?.comments || [];
  const reactions = reactionsData?.reactions || [];
  const hasLiked = reactions.some((r) => r.userId === session?.user?.id);

  if (!isOpen) return null;

  return (
    <div
      className="mt-4 space-y-4 border-t border-neutral-100 pt-4"
      onClick={(e) => e.preventDefault()}
    >
      {/* Reaction bar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            reactMutation.mutate();
          }}
          className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
            hasLiked
              ? "bg-red-50 text-red-600"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          <Heart size={16} className={hasLiked ? "fill-red-500" : ""} />
          <span>{reactions.length}</span>
        </button>
        <span className="text-xs text-neutral-400">
          {reactions.length === 1 ? "1 like" : `${reactions.length} likes`}
        </span>
      </div>

      {/* Comments list */}
      <div className="max-h-60 space-y-3 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-400">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex items-start space-x-3">
              <div className="bg-primary-900 text-secondary-400 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
                {comment.user?.image ? (
                  <Image
                    src={comment.user.image}
                    alt={comment.user.name || "User"}
                    width={32}
                    height={32}
                  />
                ) : (
                  (comment.user?.name || "?")[0]
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    <span className="font-bold text-neutral-900">
                      {comment.user?.name || "User"}
                    </span>{" "}
                    <span className="text-neutral-700">{comment.content}</span>
                  </p>
                  <div className="flex items-center space-x-2 border-l border-neutral-100 pl-3">
                    <button
                      onClick={() => likeCommentMutation.mutate(comment.id)}
                      className="group/btn flex items-center space-x-1 transition-colors outline-none"
                    >
                      <Heart
                        size={12}
                        className={
                          comment.likes?.includes(session?.user?.id || "")
                            ? "fill-red-500 text-red-500"
                            : "text-neutral-400 group-hover/btn:text-red-500"
                        }
                      />
                      <span className="text-[10px] font-medium text-neutral-400">
                        {comment.likes?.length || 0}
                      </span>
                    </button>
                    {comment.userId === session?.user?.id && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        className="text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment input */}
      <form
        onSubmit={handleSubmitComment}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm transition-colors outline-none focus:border-neutral-300 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || commentMutation.isPending}
          className="bg-primary-500 hover:bg-primary-600 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-colors disabled:opacity-50"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default InlineDiscussion;
