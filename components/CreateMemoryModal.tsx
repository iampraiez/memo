import React, { useState, useEffect } from "react";
import { Upload, Heart, Tag as TagIcon, Loader } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Tag from "./ui/Tag";
import MediaUploader from "./ui/MediaUploader";
import { Memory } from "@/types/types";
import { CreateMemoryData } from "@/services/memory.service";
import { toast } from "sonner";
import axios from "axios";

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: CreateMemoryData & { id?: string }) => void | Promise<void>;
  editingMemory?: Memory;
}

const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMemory,
}) => {
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
  const [showCustomMood, setShowCustomMood] = useState(false);
  const predefinedMoods = ["joyful", "peaceful", "excited", "nostalgic", "grateful", "reflective"];

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
      setShowCustomMood(false);
    }
    setAiGeneratedContent(""); // Clear AI generated content on modal open/edit
  }, [editingMemory, isOpen]); // Depend on editingMemory and isOpen

  // Real file upload to Cloudinary/Dropbox via our API using axios for progress
  const handleUpload = async (
    uploadPairs: { file: File; id: string }[],
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const formData = new FormData();
    uploadPairs.forEach((pair) => formData.append("file", pair.file));

    try {
      const response = await axios.post("/api/upload", formData, {
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            onProgress(progressEvent);
          }
        },
      });

      const { urls } = response.data;

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
      if (axios.isCancel(error) || (error as Error).message === "canceled") {
        console.log("Upload gracefully canceled by user.");
        // We throw this specific error so MediaUploader knows it was intentionally canceled
        throw new Error("canceled");
      }
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

      // Prepare the data for the service layer
      const memoryData = {
        ...formData,
        id: editingMemory?.id,
        images: formData.images.map((file) => file.url),
      };

      // Delegate persistence to the parent/service layer
      await onSave(memoryData as Memory);

      // Only reset and close if onSave was successful
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        mood: "",
        tags: [],
        images: [],
      });
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
      toast.error("Please provide at least a title or some initial thoughts for AI to build upon.");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/memories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate content");
      }

      const { content } = await response.json();

      setFormData((prev) => ({
        ...prev,
        content: content,
      }));
      setAiGeneratedContent(content);
      setAiLoading(false);
      setShowAiButtons(true);
      toast.success("AI has expanded your memory!");
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "AI generation failed. Please try again.",
      );
      setAiLoading(false);
    }
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
                    onClick={() => {
                      setFormData({ ...formData, mood: mood.value });
                      setShowCustomMood(false);
                    }}
                    className={`rounded-lg border-2 p-2 text-sm font-medium transition-colors ${
                      formData.mood === mood.value && !showCustomMood
                        ? "border-primary-500 bg-primary-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowCustomMood(true);
                    if (predefinedMoods.includes(formData.mood)) {
                      setFormData({ ...formData, mood: "" });
                    }
                  }}
                  className={`rounded-lg border-2 p-2 text-sm font-medium transition-colors ${
                    showCustomMood ||
                    (!predefinedMoods.includes(formData.mood) && formData.mood !== "")
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  Custom...
                </button>
              </div>

              {(showCustomMood ||
                (!predefinedMoods.includes(formData.mood) && formData.mood !== "")) && (
                <div className="mt-3">
                  <Input
                    placeholder="Enter your custom mood..."
                    value={!predefinedMoods.includes(formData.mood) ? formData.mood : ""}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                    error={formErrors.mood}
                  />
                </div>
              )}

              {formErrors.mood && !showCustomMood && predefinedMoods.includes(formData.mood) && (
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
                setShowCustomMood(false);
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
