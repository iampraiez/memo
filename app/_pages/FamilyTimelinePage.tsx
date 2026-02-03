"use client";
import React, { useState } from "react";
import { Funnel, ChatCircle, Heart, Users, Trash, ArrowsClockwise } from "@phosphor-icons/react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import Card from "@/components/ui/Card";
import { Memory } from "@/types/types";
import { useNetworkStatus } from "@/lib/utils";
import DatePicker from "@/components/ui/DatePicker";
import Modal from "@/components/ui/Modal";
import MultiSelect from "@/components/ui/MultiSelect";
import { useTimelineMemories, useAddComment, useDeleteComment, useToggleReaction, useComments, useReactions } from "@/hooks/useSocial";
import { useFamilyMembers } from "@/hooks/useFamily";
import { useSession } from "next-auth/react";

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  relationship?: string;
}

interface SharedMemory extends Memory {
  sharedBy: FamilyMember;
  comments_count?: number;
  reactions_count?: number;
}

const FamilyTimelinePage: React.FC = () => {
  const { data: session } = useSession();
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [newComment, setNewComment] = useState("");
  const [activeCommentMemory, setActiveCommentMemory] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const { data: timelineData, isLoading: isLoadingTimeline } = useTimelineMemories();
  const { data: familyData, isLoading: isLoadingFamily } = useFamilyMembers();

  const timelineMemories = timelineData?.memories || [];
  const familyMembers = familyData?.members || [];

  const addCommentMutation = useAddComment();
  const toggleReactionMutation = useToggleReaction();
  const deleteCommentMutation = useDeleteComment();

  const combinedFamilyTimelineMemories: SharedMemory[] = React.useMemo(() => {
    return (timelineMemories as any[]).map(mem => ({
      ...mem,
      sharedBy: {
        id: mem.userId,
        name: mem.user?.name || "Unknown",
        avatar: mem.user?.image,
        relationship: mem.userId === session?.user?.id ? "You" : "Family"
      }
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [timelineMemories, session]);

  const filteredMemories = combinedFamilyTimelineMemories.filter((memory) => {
    const matchesMember = selectedMember === "all" || memory.sharedBy.id === selectedMember;
    const memoryDate = new Date(memory.date);
    const matchesDateRange = (!startDate || memoryDate >= startDate) && (!endDate || memoryDate <= endDate);
    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => memory.tags?.includes(tag));
    const matchesMoods = selectedMoods.length === 0 || (memory.mood && selectedMoods.includes(memory.mood));

    return matchesMember && matchesDateRange && matchesTags && matchesMoods;
  });

  const availableTags = Array.from(new Set(combinedFamilyTimelineMemories.flatMap((mem) => mem.tags || [])));
  const availableMoods = Array.from(new Set(combinedFamilyTimelineMemories.map((mem) => mem.mood).filter(Boolean))) as string[];

  const isOnline = useNetworkStatus();

  const handleAddComment = async (memoryId: string) => {
    if (newComment.trim()) {
      await addCommentMutation.mutateAsync({ memoryId, content: newComment.trim() });
      setNewComment("");
      setActiveCommentMemory(null);
    }
  };

  const handleReaction = async (memoryId: string) => {
    await toggleReactionMutation.mutateAsync({ memoryId });
  };

  const handleDeleteComment = async (memoryId: string, commentId: string) => {
    await deleteCommentMutation.mutateAsync({ memoryId, commentId });
  };


  if (isLoadingTimeline || isLoadingFamily) {
    return (
      <div className="min-h-fit bg-neutral-50 flex items-center justify-center py-20">
        <ArrowsClockwise className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-fit bg-neutral-50">
      <div className="p-9">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-neutral-900">
                Family Timeline
              </h1>
              <p className="text-neutral-600 mt-1">
                Memories shared by your family members
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilterModalOpen(true)}
              >
                <Funnel className="w-4 h-4 mr-2" />
                Filters
              </Button>

            </div>
          </div>

          <Modal
            isOpen={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            title="Filter Memories"
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Date Range
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DatePicker
                    label="Start Date"
                    value={
                      startDate ? startDate.toISOString().split("T")[0] : ""
                    }
                    onChange={(date) =>
                      setStartDate(date ? new Date(date) : null)
                    }
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate ? endDate.toISOString().split("T")[0] : ""}
                    onChange={(date) =>
                      setEndDate(date ? new Date(date) : null)
                    }
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Tags
                </h3>
                <MultiSelect
                  options={availableTags.map((tag) => ({
                    label: tag,
                    value: tag,
                  }))}
                  value={selectedTags}
                  onChange={setSelectedTags}
                  placeholder="Select tags"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Moods
                </h3>
                <MultiSelect
                  options={availableMoods.map((mood) => ({
                    label: mood,
                    value: mood,
                  }))}
                  value={selectedMoods}
                  onChange={setSelectedMoods}
                  placeholder="Select moods"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedMoods([]);
                    setStartDate(null);
                    setEndDate(null);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Modal>

          {/* Family Member Filter */}
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-neutral-700">
                Show memories from:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedMember("all")}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedMember === "all"
                      ? "bg-primary-100 text-primary-800 border border-primary-200"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  All Family
                </button>
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.userId || member.id)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedMember === (member.userId || member.id)
                        ? "bg-primary-100 text-primary-800 border border-primary-200"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-neutral-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-neutral-600">
                          {member.name[0]}
                        </span>
                      </div>
                    )}
                    <span>{member.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Shared Memories List */}
          <div className="space-y-6">
            {filteredMemories.length > 0 ? (
              filteredMemories.map((memory) => (
                <MemoryItem
                  key={memory.id}
                  memory={memory}
                  activeCommentMemory={activeCommentMemory}
                  setActiveCommentMemory={setActiveCommentMemory}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  handleAddComment={handleAddComment}
                  handleDeleteComment={handleDeleteComment}
                />
              ))

            ) : (
              <Card className="text-center py-20">
                <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  No memories found
                </h3>
                <p className="text-neutral-600">
                  Try adjusting your filters or invite more family members.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MemoryItem: React.FC<{
  memory: SharedMemory;
  activeCommentMemory: string | null;
  setActiveCommentMemory: (id: string | null) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  handleAddComment: (id: string) => void;
  handleDeleteComment: (memoryId: string, commentId: string) => void;
}> = ({ memory, activeCommentMemory, setActiveCommentMemory, newComment, setNewComment, handleAddComment, handleDeleteComment }) => {
  const { data: commentsData } = useComments(memory.id);
  const { data: reactionsData } = useReactions(memory.id);
  const toggleReactionMutation = useToggleReaction();
  const { data: session } = useSession();

  const comments = commentsData?.comments || [];
  const reactions = reactionsData?.reactions || [];
  const isLiked = reactions.some(r => r.userId === session?.user?.id);

  return (
    <Card className="space-y-4">
      {/* Shared By Header */}
      <div className="flex items-center space-x-3 pb-3 border-b border-neutral-200">
        {memory.sharedBy.avatar ? (
          <img
            src={memory.sharedBy.avatar}
            alt={memory.sharedBy.name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-neutral-500" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-neutral-900">
              {memory.sharedBy.name}
            </h3>
            <span className="text-sm text-neutral-500">
              shared a memory
            </span>
          </div>
          <p className="text-sm text-neutral-500">
            {new Date(memory.createdAt).toLocaleDateString()} •{" "}
            {memory.sharedBy.relationship}
          </p>
        </div>
      </div>

      {/* Memory Content */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            {memory.title}
          </h2>
          <div className="flex items-center space-x-3 text-sm text-neutral-500 mb-3">
            <span>
              {new Date(memory.date).toLocaleDateString()}
            </span>
            {memory.location && (
              <>
                <span>•</span>
                <span>{memory.location}</span>
              </>
            )}
          </div>
        </div>

        {/* image */}
        {memory.images && memory.images.length > 0 && (
          <div className="aspect-video bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src={memory.images[0]}
              alt={memory.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        {memory.content && (
          <p className="text-neutral-700 leading-relaxed">
            {memory.content.length > 300
              ? `${memory.content.slice(0, 300)}...`
              : memory.content}
          </p>
        )}
        {/* Tags and Mood */}
        <div className="flex items-center space-x-2">
          {memory.mood && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              <Heart className="w-3 h-3 mr-1" />
              {memory.mood}
            </span>
          )}
          {memory.tags?.slice(0, 3).map((tag) => (
            <Tag key={tag} size="sm">
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      {/* Reactions and Comments */}
      <div className="pt-3 border-t border-neutral-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleReactionMutation.mutate({ memoryId: memory.id })}
              className={`flex items-center space-x-1 text-sm transition-colors ${
                isLiked ? "text-red-600" : "text-neutral-600 hover:text-red-600"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-red-600" : ""}`}
              />
              <span>{reactions.length}</span>
            </button>
            <button
              onClick={() => setActiveCommentMemory(activeCommentMemory === memory.id ? null : memory.id)}
              className="flex items-center space-x-1 text-sm text-neutral-600 hover:text-primary-600 transition-colors"
            >
              <ChatCircle className="w-4 h-4" />
              <span>{comments.length}</span>
            </button>

          </div>
        </div>

        {/* Comments */}
        {comments.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3 bg-neutral-50 p-2 rounded-lg relative group">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200 shrink-0">
                  {comment.user?.image ? (
                    <img src={comment.user.image} alt={comment.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 text-xs">
                      {comment.user?.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900">{comment.user?.name}</span>
                    <span className="text-[10px] text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-neutral-700">{comment.content}</p>
                </div>
                {comment.userId === session?.user?.id && (
                  <button
                    onClick={() => handleDeleteComment(memory.id, comment.id)}
                    className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        {activeCommentMemory === memory.id && (
          <div className="flex items-start space-x-3 pt-2">
            <div className="flex-1 space-y-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                onKeyPress={(e) => e.key === "Enter" && handleAddComment(memory.id)}
              />
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={() => handleAddComment(memory.id)} disabled={!newComment.trim()}>
                  Comment
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveCommentMemory(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FamilyTimelinePage;
