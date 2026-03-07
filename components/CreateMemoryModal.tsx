import React, { useState, useEffect, useRef } from "react";
import {
  Tag as TagIcon,
  Loader,
  Sparkles,
  Heart,
  MapPin,
  Calendar,
  X,
  CheckCircle,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import Button from "./ui/Button";
import Tag from "./ui/Tag";
import MediaUploader from "./ui/MediaUploader";
import { Memory } from "@/types/types";
import { CreateMemoryData } from "@/services/memory.service";
import { toast } from "sonner";
import axios from "axios";

const formatDateForInput = (date: string | undefined): string => {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

const writingStyles = [
  { value: "narrative", label: "Narrative", emoji: "📖", desc: "Classic storytelling" },
  { value: "poetic", label: "Poetic", emoji: "🌸", desc: "Lyrical & evocative" },
  { value: "journaling", label: "Journaling", emoji: "📔", desc: "Personal diary entry" },
  { value: "letter", label: "Letter", emoji: "✉️", desc: "As if writing to someone" },
  { value: "cinematic", label: "Cinematic", emoji: "🎬", desc: "Visual & dramatic" },
];

const MOODS = [
  {
    value: "joyful",
    label: "Joyful",
    emoji: "😊",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  {
    value: "peaceful",
    label: "Peaceful",
    emoji: "😌",
    color: "bg-blue-100 text-blue-800 border-blue-300",
  },
  {
    value: "excited",
    label: "Excited",
    emoji: "🤩",
    color: "bg-orange-100 text-orange-800 border-orange-300",
  },
  {
    value: "nostalgic",
    label: "Nostalgic",
    emoji: "🌅",
    color: "bg-purple-100 text-purple-800 border-purple-300",
  },
  {
    value: "grateful",
    label: "Grateful",
    emoji: "🙏",
    color: "bg-green-100 text-green-800 border-green-300",
  },
  {
    value: "reflective",
    label: "Reflective",
    emoji: "💭",
    color: "bg-gray-100 text-gray-800 border-gray-300",
  },
];

const PREDEFINED_MOODS = MOODS.map((m) => m.value);

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: CreateMemoryData & { id?: string }) => void | Promise<void>;
  editingMemory?: Memory;
}

type TabId = "content" | "media" | "details";

const TABS: { id: TabId; label: string; icon: React.ElementType; shortLabel: string }[] = [
  { id: "content", label: "Story", shortLabel: "Story", icon: Heart },
  { id: "media", label: "Media", shortLabel: "Media", icon: ImageIcon },
  { id: "details", label: "Details", shortLabel: "Details", icon: MapPin },
];

const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMemory,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [formData, setFormData] = useState({
    title: editingMemory?.title || "",
    content: editingMemory?.content || "",
    date: formatDateForInput(editingMemory?.date),
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
  const [aiLoading, setAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState("");
  const [showAiButtons, setShowAiButtons] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showCustomMood, setShowCustomMood] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("narrative");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingMemory) {
      setFormData({
        title: editingMemory.title || "",
        content: editingMemory.content || "",
        date: formatDateForInput(editingMemory.date),
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
      setActiveTab("content");
      setFormErrors({});
    } else {
      setFormData({
        title: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        mood: "",
        tags: [],
        images: [],
      });
      setActiveTab("content");
      setShowCustomMood(false);
    }
    setAiGeneratedContent("");
    setShowStylePicker(false);
    setShowAiButtons(false);
  }, [editingMemory, isOpen]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleUpload = async (
    uploadPairs: { file: File; id: string }[],
    onProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    signal?: AbortSignal,
  ): Promise<void> => {
    const fd = new FormData();
    uploadPairs.forEach((pair) => fd.append("file", pair.file));
    try {
      const response = await axios.post("/api/upload", fd, {
        signal,
        onUploadProgress: (e) => onProgress?.(e),
      });
      const { urls } = response.data;
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
        throw new Error("canceled");
      }
      throw error;
    }
  };

  const handleSave = async () => {
    const errors: { title?: string; mood?: string; location?: string } = {};
    if (!formData.title.trim()) errors.title = "Title is required.";
    if (!formData.mood) errors.mood = "Please select a mood.";
    if (!formData.location.trim()) errors.location = "Location is required.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Navigate to most relevant tab with error
      if (errors.title || errors.mood) {
        // mood and title are on different tabs but title is content, mood is details
        if (errors.title) setActiveTab("content");
        else setActiveTab("details");
      } else {
        setActiveTab("details");
      }
      return;
    }

    if (imageUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }

    const blobImages = formData.images.filter((img) => img.url.startsWith("blob:"));
    if (blobImages.length > 0) {
      toast.error("Some images failed to upload. Please remove or re-upload them.");
      setActiveTab("media");
      return;
    }

    setIsSaving(true);
    try {
      setFormErrors({});
      const memoryData = {
        ...formData,
        id: editingMemory?.id,
        images: formData.images.map((f) => f.url),
      };
      await onSave(memoryData as Memory);
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
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tagToRemove) });
  };

  const handleGenerateWithAI = async (style: string) => {
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error("Please provide a title or initial thoughts first.");
      return;
    }
    setShowStylePicker(false);
    setAiLoading(true);
    try {
      const response = await fetch("/api/memories/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formData.title, content: formData.content, style }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to generate content");
      }
      const { content } = await response.json();
      setAiGeneratedContent(content);
      setFormData((prev) => ({ ...prev, content }));
      setShowAiButtons(true);
      toast.success("AI has expanded your memory!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const completedFields = [
    formData.title.trim(),
    formData.content.trim(),
    formData.date,
    formData.location.trim(),
    formData.mood,
  ].filter(Boolean).length;
  const totalFields = 5;
  const progressPct = Math.round((completedFields / totalFields) * 100);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal — Full screen on mobile, centred sheet on md+ */}
      <div className="fixed inset-0 z-50 flex flex-col items-stretch justify-end md:items-center md:justify-center md:p-6">
        <div
          className="relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-2xl md:rounded-3xl"
          style={{ maxHeight: "95dvh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Drag handle (mobile) ── */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full bg-neutral-300" />
          </div>

          {/* ── Header ── */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {editingMemory ? "Edit Memory" : "New Memory"}
              </h2>
              {/* Progress bar */}
              <div className="mt-1 flex items-center space-x-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="bg-primary-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-neutral-400">
                  {completedFields}/{totalFields} fields
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex border-b border-neutral-100 bg-neutral-50/80">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const hasError =
                (tab.id === "content" && !!formErrors.title) ||
                (tab.id === "details" && (!!formErrors.mood || !!formErrors.location));
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-1 flex-col items-center py-3 text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "text-primary-600 border-primary-500 border-b-2 bg-white"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {hasError && (
                    <span className="absolute top-2 right-1/4 h-1.5 w-1.5 rounded-full bg-red-400" />
                  )}
                  <Icon size={16} className="mb-1" />
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* ── Scrollable content ── */}
          <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
            {/* ─── CONTENT TAB ─── */}
            {activeTab === "content" && (
              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (formErrors.title) setFormErrors((p) => ({ ...p, title: undefined }));
                    }}
                    placeholder="What's this memory called?"
                    className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                      formErrors.title
                        ? "border-red-300 focus:ring-red-200"
                        : "focus:border-primary-300 focus:ring-primary-100 border-neutral-200"
                    }`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
                    Your Story
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tell your story... even a few sentences is a start."
                    rows={6}
                    className="focus:ring-primary-100 focus:border-primary-300 w-full resize-none rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-all outline-none focus:ring-2"
                  />
                </div>

                {/* AI section */}
                {(formData.title.trim() || formData.content.trim()) && (
                  <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                    {showAiButtons ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm font-semibold text-neutral-700">
                          <Sparkles size={14} className="text-amber-500" />
                          <span>AI has expanded your story</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, content: aiGeneratedContent }));
                              setShowAiButtons(false);
                              setAiGeneratedContent("");
                            }}
                            variant="primary"
                            className="flex-1 py-2 text-sm"
                          >
                            <CheckCircle size={14} className="mr-1.5" /> Keep it
                          </Button>
                          <Button
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                content: editingMemory?.content || "",
                              }));
                              setShowAiButtons(false);
                              setAiGeneratedContent("");
                            }}
                            variant="secondary"
                            className="flex-1 py-2 text-sm"
                          >
                            <X size={14} className="mr-1.5" /> Discard
                          </Button>
                        </div>
                      </div>
                    ) : showStylePicker ? (
                      <div>
                        <p className="mb-3 flex items-center text-sm font-semibold text-neutral-700">
                          <Sparkles size={14} className="mr-1.5 text-amber-500" />
                          Choose a writing style
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {writingStyles.map((style) => (
                            <button
                              key={style.value}
                              onClick={() => {
                                setSelectedStyle(style.value);
                                handleGenerateWithAI(style.value);
                              }}
                              className={`rounded-xl border-2 p-3 text-left transition-all active:scale-95 ${
                                selectedStyle === style.value
                                  ? "border-primary-500 bg-primary-50"
                                  : "border-neutral-200 bg-white hover:border-neutral-300"
                              }`}
                            >
                              <div className="mb-1 text-xl">{style.emoji}</div>
                              <p className="text-xs font-bold text-neutral-900">{style.label}</p>
                              <p className="text-[10px] text-neutral-500">{style.desc}</p>
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowStylePicker(false)}
                          className="mt-3 w-full rounded-lg py-2 text-sm text-neutral-500 hover:text-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowStylePicker(true)}
                        disabled={aiLoading}
                        className="flex w-full items-center justify-center space-x-2 rounded-xl border border-dashed border-amber-300 bg-white py-3 text-sm font-medium text-amber-700 transition-all hover:bg-amber-50 active:scale-95 disabled:opacity-50"
                      >
                        {aiLoading ? (
                          <>
                            <Loader size={14} className="animate-spin" />
                            <span>Generating with AI...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            <span>Generate with AI</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── MEDIA TAB ─── */}
            {activeTab === "media" && (
              <div className="p-5">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-neutral-700">Photos & Videos</p>
                  <p className="text-xs text-neutral-400">
                    Add visuals to bring your memory to life.
                  </p>
                </div>
                <MediaUploader
                  label=""
                  accept="image/*,video/*"
                  multiple={true}
                  files={formData.images}
                  onFilesChange={(uploadedFiles) =>
                    setFormData((prev) => ({ ...prev, images: uploadedFiles }))
                  }
                  onUpload={handleUpload}
                  onUploadStart={() => setImageUploading(true)}
                  onUploadEnd={() => setImageUploading(false)}
                />
                {imageUploading && (
                  <p className="mt-3 flex items-center space-x-1.5 text-xs text-neutral-500">
                    <Loader size={12} className="animate-spin" />
                    <span>Uploading your images securely...</span>
                  </p>
                )}
              </div>
            )}

            {/* ─── DETAILS TAB ─── */}
            {activeTab === "details" && (
              <div className="space-y-5 p-5">
                {/* Date & Location */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center space-x-1.5 text-sm font-semibold text-neutral-700">
                      <Calendar size={14} />
                      <span>Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="focus:border-primary-300 focus:ring-primary-100 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-all outline-none focus:ring-2"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center space-x-1.5 text-sm font-semibold text-neutral-700">
                      <MapPin size={14} />
                      <span>
                        Location <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <input
                      value={formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        if (formErrors.location)
                          setFormErrors((p) => ({ ...p, location: undefined }));
                      }}
                      placeholder="Where did this happen?"
                      className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
                        formErrors.location
                          ? "border-red-300 focus:ring-red-200"
                          : "focus:border-primary-300 focus:ring-primary-100 border-neutral-200"
                      }`}
                    />
                    {formErrors.location && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.location}</p>
                    )}
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="mb-2 flex items-center space-x-1.5 text-sm font-semibold text-neutral-700">
                    <span>Mood</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
                    {MOODS.map((mood) => {
                      const isSelected = formData.mood === mood.value && !showCustomMood;
                      return (
                        <button
                          key={mood.value}
                          onClick={() => {
                            setFormData({ ...formData, mood: mood.value });
                            setShowCustomMood(false);
                            if (formErrors.mood) setFormErrors((p) => ({ ...p, mood: undefined }));
                          }}
                          className={`rounded-xl border-2 p-2.5 text-center transition-all active:scale-95 ${
                            isSelected
                              ? `${mood.color} border-opacity-60`
                              : "border-neutral-200 bg-white hover:border-neutral-300"
                          }`}
                        >
                          <div className="text-xl">{mood.emoji}</div>
                          <div className="mt-0.5 text-xs font-semibold">{mood.label}</div>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        setShowCustomMood(true);
                        if (PREDEFINED_MOODS.includes(formData.mood)) {
                          setFormData({ ...formData, mood: "" });
                        }
                      }}
                      className={`rounded-xl border-2 p-2.5 text-center transition-all active:scale-95 ${
                        showCustomMood ||
                        (!PREDEFINED_MOODS.includes(formData.mood) && formData.mood !== "")
                          ? "border-primary-500 bg-primary-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="text-xl">✏️</div>
                      <div className="mt-0.5 text-xs font-semibold">Custom</div>
                    </button>
                  </div>
                  {formErrors.mood && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.mood}</p>
                  )}
                  {(showCustomMood ||
                    (!PREDEFINED_MOODS.includes(formData.mood) && formData.mood !== "")) && (
                    <input
                      placeholder="Describe your mood..."
                      value={!PREDEFINED_MOODS.includes(formData.mood) ? formData.mood : ""}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className="focus:border-primary-300 focus:ring-primary-100 mt-3 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-all outline-none focus:ring-2"
                    />
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-1.5 flex items-center space-x-1.5 text-sm font-semibold text-neutral-700">
                    <TagIcon size={14} />
                    <span>Tags</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="focus:border-primary-300 focus:ring-primary-100 flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm transition-all outline-none focus:ring-2"
                    />
                    <Button
                      onClick={addTag}
                      variant="secondary"
                      size="icon"
                      className="h-auto shrink-0 py-3"
                    >
                      <Plus size={18} />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Tag key={tag} removable onRemove={() => removeTag(tag)}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          <div className="border-t border-neutral-100 bg-white px-5 py-4">
            <div className="flex items-center space-x-3">
              {/* Tab navigation arrows */}
              <button
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (idx > 0) setActiveTab(TABS[idx - 1].id);
                }}
                disabled={activeTab === TABS[0].id}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all hover:border-neutral-300 hover:text-neutral-600 disabled:opacity-30"
              >
                ‹
              </button>
              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaving || imageUploading}
                className="flex-1"
              >
                {imageUploading
                  ? "Uploading..."
                  : isSaving
                    ? editingMemory
                      ? "Saving..."
                      : "Creating..."
                    : editingMemory
                      ? "Save Changes"
                      : "Create Memory"}
              </Button>
              <button
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
                }}
                disabled={activeTab === TABS[TABS.length - 1].id}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-all hover:border-neutral-300 hover:text-neutral-600 disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMemoryModal;
