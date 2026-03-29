import React, { useState } from "react";
import { MapPin, Calendar, Tag as TagIcon, Plus } from "lucide-react";
import Button from "../ui/Button";
import Tag from "../ui/Tag";
import { MemoryFormData, MemoryFormErrors } from "./types";

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

interface MemoryDetailsTabProps {
  formData: MemoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<MemoryFormData>>;
  formErrors: MemoryFormErrors;
  setFormErrors: React.Dispatch<React.SetStateAction<MemoryFormErrors>>;
}

export default function MemoryDetailsTab({
  formData,
  setFormData,
  formErrors,
  setFormErrors,
}: MemoryDetailsTabProps) {
  const [showCustomMood, setShowCustomMood] = useState(false);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tagToRemove),
    }));
  };

  return (
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
            max={new Date().toISOString().split("T")[0]}
            value={formData.date}
            onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
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
              setFormData((prev) => ({ ...prev, location: e.target.value }));
              if (formErrors.location) {
                setFormErrors((prev) => {
                  const newErrs = { ...prev };
                  delete newErrs.location;
                  return newErrs;
                });
              }
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

      {/* Unlock Date (Memory Capsule) */}
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
        <label className="mb-1.5 flex items-center space-x-1.5 text-sm font-bold text-neutral-800">
          <Calendar size={14} className="text-primary-600" />
          <span>Lock Until (Digital Time Capsule)</span>
        </label>
        <p className="mb-3 text-xs text-neutral-500">
          Seal this memory for the future. It will be hidden until the chosen date.
        </p>
        <input
          type="date"
          min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
          value={formData.unlockDate || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, unlockDate: e.target.value }))}
          className="focus:border-primary-300 focus:ring-primary-100 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm transition-all outline-none focus:ring-2"
        />
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
                  setFormData((prev) => ({ ...prev, mood: mood.value }));
                  setShowCustomMood(false);
                  if (formErrors.mood) {
                    setFormErrors((prev) => {
                      const newErrs = { ...prev };
                      delete newErrs.mood;
                      return newErrs;
                    });
                  }
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
                setFormData((prev) => ({ ...prev, mood: "" }));
              }
            }}
            className={`rounded-xl border-2 p-2.5 text-center transition-all active:scale-95 ${
              showCustomMood || (!PREDEFINED_MOODS.includes(formData.mood) && formData.mood !== "")
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="text-xl">✏️</div>
            <div className="mt-0.5 text-xs font-semibold">Custom</div>
          </button>
        </div>
        {formErrors.mood && <p className="mt-1 text-xs text-red-500">{formErrors.mood}</p>}
        {(showCustomMood ||
          (!PREDEFINED_MOODS.includes(formData.mood) && formData.mood !== "")) && (
          <input
            placeholder="Describe your mood..."
            value={!PREDEFINED_MOODS.includes(formData.mood) ? formData.mood : ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, mood: e.target.value }))}
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
          <Button onClick={addTag} variant="secondary" size="icon" className="h-auto shrink-0 py-3">
            <Plus size={18} />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag: string) => (
              <Tag key={tag} removable onRemove={() => removeTag(tag)}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
