import React, { useState, useEffect, useRef } from "react";
import { Heart, MapPin, X, Image as ImageIcon } from "lucide-react";
import Button from "./ui/Button";
import { Memory } from "@/types/types";
import { CreateMemoryData } from "@/services/memory.service";
import { toast } from "sonner";
import axios from "axios";

// Import the sub-components
import MemoryContentTab from "./memory/MemoryContentTab";
import MemoryMediaTab from "./memory/MemoryMediaTab";
import MemoryDetailsTab from "./memory/MemoryDetailsTab";
import { MemoryFormData } from "./memory/types";

const formatDateForInput = (date: string | undefined): string => {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
};

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
  const [formData, setFormData] = useState<MemoryFormData>({
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
    unlockDate: editingMemory?.unlockDate
      ? new Date(editingMemory.unlockDate).toISOString().split("T")[0]
      : "",
  });

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    mood?: string;
    location?: string;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap logic
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

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
        unlockDate: editingMemory.unlockDate
          ? new Date(editingMemory.unlockDate).toISOString().split("T")[0]
          : "",
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
        unlockDate: "",
      });
      setActiveTab("content");
    }
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

  const handleClose = () => {
    // Only check if we're not currently saving
    if (isSaving) return;

    // Check if any fields were modified
    const isDirty =
      formData.title !== (editingMemory?.title || "") ||
      formData.content !== (editingMemory?.content || "") ||
      formData.location !== (editingMemory?.location || "") ||
      formData.mood !== (editingMemory?.mood || "") ||
      formData.tags.length !== (editingMemory?.tags?.length || 0) ||
      formData.images.length !== (editingMemory?.images?.length || 0);

    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

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
      // Navigate to the first tab that has an error
      if (errors.title) {
        setActiveTab("content");
      } else {
        // mood and location are both on the details tab
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
        unlockDate: formData.unlockDate || null,
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
        unlockDate: "",
      });
      onClose();
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save memory. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
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
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex flex-col items-stretch justify-end md:items-center md:justify-center md:p-6">
        <div
          ref={modalRef}
          className="relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:max-w-2xl md:rounded-3xl"
          style={{ maxHeight: "95dvh" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full bg-neutral-300" />
          </div>

          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {editingMemory ? "Edit Memory" : "New Memory"}
              </h2>
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
              onClick={handleClose}
              aria-label="Close modal"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
            >
              <X size={16} />
            </button>
          </div>

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

          <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
            {activeTab === "content" && (
              <MemoryContentTab
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                editingMemory={editingMemory}
              />
            )}
            {activeTab === "media" && (
              <MemoryMediaTab
                formData={formData}
                setFormData={setFormData}
                handleUpload={handleUpload}
                imageUploading={imageUploading}
                setImageUploading={setImageUploading}
              />
            )}
            {activeTab === "details" && (
              <MemoryDetailsTab
                formData={formData}
                setFormData={setFormData}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
              />
            )}
          </div>

          <div className="border-t border-neutral-100 bg-white px-5 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  const idx = TABS.findIndex((t) => t.id === activeTab);
                  if (idx > 0) setActiveTab(TABS[idx - 1].id);
                }}
                disabled={activeTab === TABS[0].id}
                aria-label="Previous tab"
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
                aria-label="Next tab"
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
