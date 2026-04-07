import React, { useState } from "react";
import { Sparkles, Loader, CheckCircle, X } from "lucide-react";
import Button from "../ui/Button";
import RichTextEditor from "../ui/RichTextEditor";
import { toast } from "sonner";
import { Memory } from "@/types/types";
import { MemoryFormData, MemoryFormErrors } from "./types";

const writingStyles = [
  { value: "narrative", label: "Narrative", emoji: "📖", desc: "Classic storytelling" },
  { value: "poetic", label: "Poetic", emoji: "🌸", desc: "Lyrical & evocative" },
  { value: "journaling", label: "Journaling", emoji: "📔", desc: "Personal diary entry" },
  { value: "letter", label: "Letter", emoji: "✉️", desc: "As if writing to someone" },
  { value: "cinematic", label: "Cinematic", emoji: "🎬", desc: "Visual & dramatic" },
];

interface MemoryContentTabProps {
  formData: MemoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemoryFormData>>;
  formErrors: MemoryFormErrors;
  setFormErrors: React.Dispatch<React.SetStateAction<MemoryFormErrors>>;
  editingMemory?: Memory;
}

export default function MemoryContentTab({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
}: MemoryContentTabProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiButtons, setShowAiButtons] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("narrative");

  const [originalContent, setOriginalContent] = useState("");

  const handleGenerateWithAI = async (style: string) => {
    if (!formData.title.trim() && !formData.content.trim()) {
      toast.error("Please provide a title or initial thoughts first.");
      return;
    }
    setShowStylePicker(false);
    setAiLoading(true);
    setOriginalContent(formData.content);
    console.log("[AI Generation] Sending payload:", {
      title: formData.title,
      content: formData.content,
      style,
    });
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

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const streamDecoder = new TextDecoder();
      let accumulated = "";

      // Clear current content before streaming
      setFormData((prev) => ({ ...prev, content: "" }));

      let doneReading = false;
      while (!doneReading) {
        const { done, value } = await reader.read();
        if (done) {
          doneReading = true;
          break;
        }

        const chunk = streamDecoder.decode(value, { stream: true });
        accumulated += chunk;
        setFormData((prev) => ({ ...prev, content: accumulated }));
      }

      setShowAiButtons(true);
      toast.success("AI has expanded your story!");
    } catch (error: unknown) {
      console.error("AI Generation Error:", error);
      toast.error("Failed to generate story. Please try again later.");
      // Restore original content on error
      setFormData((prev) => ({ ...prev, content: originalContent }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          value={formData.title}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, title: e.target.value }));
            if (formErrors.title) {
              const newErrors = { ...formErrors };
              delete newErrors.title;
              setFormErrors(newErrors);
            }
          }}
          placeholder="What's this memory called?"
          className={`w-full rounded-xl border px-4 py-3 text-sm transition-all outline-none focus:ring-2 ${
            formErrors.title
              ? "border-red-300 focus:ring-red-200"
              : "focus:border-primary-300 focus:ring-primary-100 border-neutral-200"
          }`}
        />
        {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Your Story</label>
        <RichTextEditor
          value={formData.content}
          onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
          placeholder="Tell your story... even a few sentences is a start."
          className="min-h-50"
        />
      </div>

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
                    setShowAiButtons(false);
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
                      content: originalContent,
                    }));
                    setShowAiButtons(false);
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
  );
}
