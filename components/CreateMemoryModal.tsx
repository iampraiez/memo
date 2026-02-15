import React, { useState, useEffect } from "react";
import { Upload, Heart, Tag as TagIcon, Loader } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Tag from "./ui/Tag";
import MediaUploader from "./ui/MediaUploader";
import { Memory } from "@/types/types";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { db } from "@/lib/dexie/db";
import { syncService } from "@/services/sync.service";
import { toast } from "sonner";

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Memory) => void | Promise<void>;
  editingMemory?: Memory;
}

const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMemory,
}) => {
  const isOnline = useNetworkStatus();
  const [activeTab, setActiveTab] = useState<"content" | "media" | "metadata">("content");
  const [formData, setFormData] = useState({
    title: editingMemory?.title || "",
    content: editingMemory?.content || "",
    date: editingMemory?.date || new Date().toISOString().split("T")[0],
    location: editingMemory?.location || "",
    mood: editingMemory?.mood || "",
    tags: editingMemory?.tags || [],
    images:
      editingMemory?.images?.map((url) => ({
        id: url,
        name: url.split("/").pop() || "",
        size: 0,
        type: "image/jpeg",
        url,
      })) || [],
  });
  const [newTag, setNewTag] = useState("");
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    mood?: string;
    location?: string;
  }>({});
  const [aiLoading, setAiLoading] = useState(false); // New state for AI loading
  const [isSaving, setIsSaving] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState(""); // New state for AI generated content
  const [showAiButtons, setShowAiButtons] = useState(false); // New state to control visibility of AI buttons
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (editingMemory) {
      setFormData({
        title: editingMemory.title || "",
        content: editingMemory.content || "",
        date: editingMemory.date || new Date().toISOString().split("T")[0],
        location: editingMemory.location || "",
        mood: editingMemory.mood || "",
        tags: editingMemory.tags || [],
        images:
          editingMemory.images?.map((url) => ({
            id: url,
            name: url.split("/").pop() || "",
            size: 0,
            type: "image/jpeg",
            url,
          })) || [],
      });
      setActiveTab("content"); // Reset to content tab on edit
      setFormErrors({}); // Clear errors on new edit session
    } else {
      // Reset form for new memory creation when modal is opened without editingMemory
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        mood: "",
        tags: [],
        images: [],
      });
      setActiveTab("content"); // Reset to content tab
    }
    setAiGeneratedContent(""); // Clear AI generated content on modal open/edit
  }, [editingMemory, isOpen]); // Depend on editingMemory and isOpen

  // Real file upload to Cloudinary/Dropbox via our API
  const handleUpload = async (uploadPairs: { file: File; id: string }[]): Promise<void> => {
    const formData = new FormData();
    uploadPairs.forEach((pair) => formData.append("file", pair.file));

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { urls } = await response.json();

      // Update the formData with real URLs
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img) => {
          const match = uploadPairs.find((p) => p.id === img.id);
          if (match) {
            const index = uploadPairs.indexOf(match);
            return { ...img, url: urls[index] };
          }
          return img;
        }),
      }));
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  const moods = [
    {
      value: "joyful",
      label: "Joyful",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "peaceful",
      label: "Peaceful",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "excited",
      label: "Excited",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "nostalgic",
      label: "Nostalgic",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "grateful",
      label: "Grateful",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "reflective",
      label: "Reflective",
      color: "bg-gray-100 text-gray-800",
    },
  ];

  const tabs = [
    { id: "content", label: "Content", icon: Heart },
    { id: "media", label: "Media", icon: Upload },
    { id: "metadata", label: "Details", icon: TagIcon },
  ];

  // for creating and editing if offline
  const handleSave = async () => {
    const errors: { title?: string; mood?: string; location?: string } = {};
    if (!formData.title.trim()) {
      errors.title = "Title is required.";
    }
    if (!formData.mood) {
      errors.mood = "Mood is required.";
    }
    if (!formData.location.trim()) {
      // Add validation for location
      errors.location = "Location is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (imageUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }

    // Critical: Ensure no blob URLs are being saved
    const blobImages = formData.images.filter((img) => img.url.startsWith("blob:"));
    if (blobImages.length > 0) {
      toast.error("Some images failed to upload. Please remove or re-upload them.");
      return;
    }

    setIsSaving(true);
    try {
      setFormErrors({}); // Clear any previous errors

      const newMemory = {
        ...formData,
        images: formData.images.map((file) => file.url),
        id: editingMemory?.id || `memory-${Date.now()}`,
        createdAt: editingMemory?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: "pending",
        isPublic: editingMemory?.isPublic ?? false,
      } as Memory;
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        mood: "",
        tags: [],
        images: [],
      });

      if (isOnline) {
        newMemory.syncStatus = "synced";
      } else {
        newMemory.syncStatus = "offline";
        await syncService.queueOperation({
          operation: editingMemory ? "update" : "create",
          entity: "memory",
          entityId: newMemory.id,
          data: newMemory as unknown as Record<string, unknown>,
        });
      }

      await db.memories.put(newMemory);
      await onSave(newMemory);
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save memory");
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleGenerateWithAI = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      return; // Only generate if title or content exists
    }
    setAiLoading(true);

    // Simulate AI API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedContent = `AI-generated content for: ${
      formData.title.trim() || formData.content.trim()
    }. This is a placeholder for structured and generated text.`;

    setFormData((prev) => ({
      ...prev,
      content: generatedContent,
    }));
    setAiGeneratedContent(generatedContent); // Store for potential "Accept" action later
    setAiLoading(false);
    setShowAiButtons(true); // Show accept/discard buttons after generation
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMemory ? "Edit Memory" : "Create New Memory"}
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-neutral-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "content" | "media" | "metadata")}
                  className={`border-b-2 px-1 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What happened?"
              require={true}
              error={formErrors.title}
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tell your story..."
                rows={8}
                className="focus:ring-primary-500 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
            {showAiButtons && (
              <div className="mt-2 flex space-x-2">
                <Button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      content: aiGeneratedContent,
                    }));
                    setShowAiButtons(false);
                    setAiGeneratedContent("");
                  }}
                  variant="primary"
                  className="flex-1"
                >
                  Use AI Content
                </Button>
                <Button
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      content: editingMemory?.content || "", // Revert to original content or empty
                    }));
                    setShowAiButtons(false);
                    setAiGeneratedContent("");
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Discard
                </Button>
              </div>
            )}
            {(formData.title.trim() || formData.content.trim()) && !showAiButtons && (
              <Button
                onClick={handleGenerateWithAI}
                disabled={aiLoading}
                variant="secondary"
                className="w-full"
              >
                {aiLoading ? (
                  <span className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  "Generate content with AI"
                )}
              </Button>
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-4">
            <MediaUploader
              label="Upload Photos/Videos"
              accept="image/*,video/*"
              multiple={true}
              files={formData.images} // Pass formData.images directly
              onFilesChange={(uploadedFiles) => {
                setFormData((prev) => ({
                  ...prev,
                  images: uploadedFiles, // Store UploadedFile[] directly in state
                }));
              }}
              // real upload via Dropbox API
              onUpload={handleUpload} // Pass the real upload function
              onUploadStart={() => setImageUploading(true)}
              onUploadEnd={() => setImageUploading(false)}
            />
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where did this happen?"
                require={true} // Make location required
                error={formErrors.location} // Display error for location
              />
            </div>

            {/* Mood Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Mood</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setFormData({ ...formData, mood: mood.value as string })}
                    className={`rounded-lg border-2 p-2 text-sm font-medium transition-colors ${
                      formData.mood === mood.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
              {formErrors.mood && (
                <p className="text-destructive-600 mt-1 text-sm">{formErrors.mood}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Tags</label>
              <div className="mb-2 flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Tag key={tag} removable onRemove={() => removeTag(tag)}>
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col items-center justify-between space-y-3 border-t border-neutral-200 pt-4 sm:flex-row sm:space-y-0">
          <p className="text-sm text-neutral-500">
            <span className="font-medium">Recommendation:</span> Fill in all fields for a richer
            memory!
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setFormData({
                  title: "",
                  content: "",
                  date: new Date().toISOString().split("T")[0],
                  location: "",
                  mood: "",
                  tags: [],
                  images: [],
                });
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving || imageUploading}
              disabled={isSaving || imageUploading}
            >
              {editingMemory
                ? isSaving
                  ? "Saving..."
                  : imageUploading
                    ? "Uploading..."
                    : "Save Changes"
                : isSaving
                  ? "Creating..."
                  : imageUploading
                    ? "Uploading..."
                    : "Create Memory"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateMemoryModal;
