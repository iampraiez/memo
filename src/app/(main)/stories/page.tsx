"use client";
import React, { useState, useEffect } from "react";
import {
  MagicWand,
  BookOpen,
  FileText,
  Download,
  Clock,
  CaretRight,
  Plus,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { jsPDF } from "jspdf";
import { Document, Paragraph, Packer, TextRun, ImageRun, IImageOptions } from "docx";
import { useStories, useCreateStory } from "@/hooks/useStories";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { memoryService } from "@/services/memory.service";
import { type Story, type Memory } from "@/types/types";

interface StorySettings {
  dateRange: {
    start: string;
    end: string;
  };
  tone: "reflective" | "celebratory" | "nostalgic";
  length: "short" | "medium" | "long";
  includeimages: boolean;
}

export default function StoriesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [settings, setSettings] = useState<StorySettings>({
    dateRange: {
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
        .toISOString()
        .split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    tone: "reflective",
    length: "medium",
    includeimages: true,
  });

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showGenerator, setShowGenerator] = useState(true);
  const [fileName, setFileName] = useState("my_story");
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const { data: storiesData, isLoading: storiesLoading } = useStories(userId);
  const createStoryMutation = useCreateStory(userId);

  const toneOptions = [
    { value: "reflective", label: "Reflective & Thoughtful" },
    { value: "celebratory", label: "Celebratory & Joyful" },
    { value: "nostalgic", label: "Nostalgic & Warm" },
  ];

  const lengthOptions = [
    { value: "short", label: "Short (1-2 pages)" },
    { value: "medium", label: "Medium (3-5 pages)" },
    { value: "long", label: "Long (6+ pages)" },
  ];

  // Auto-select latest story if available and not in generator
  useEffect(() => {
    if (
      !showGenerator &&
      !selectedStory &&
      storiesData?.stories &&
      storiesData.stories.length > 0
    ) {
      setSelectedStory(storiesData.stories[0]);
    }
  }, [showGenerator, selectedStory, storiesData]);

  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleGenerateStory = async () => {
    if (!isOnline) {
      toast.error("You are offline. Please connect to the internet to generate stories.");
      return;
    }

    try {
      setStreamingContent("");
      setIsStreaming(true);
      setShowGenerator(false);

      const response = await fetch("/api/stories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: fileName,
          tone: settings.tone,
          length: settings.length,
          dateRange: settings.dateRange,
          includeimages: settings.includeimages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate story");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      let doneReading = false;
      while (!doneReading) {
        const { done, value } = await reader.read();
        if (done) {
          doneReading = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        setStreamingContent(accumulatedContent);
      }

      // No need to manually update local DB, React Query handle it via invalidation
      toast.success("Story generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["stories", userId] });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate story";
      console.error("Story generation failed:", error);
      toast.error(errorMessage);
      setShowGenerator(true);
    } finally {
      setIsStreaming(false);
      // Wait for the server to finish updating the DB before refreshing
      setTimeout(() => {
        // Use the query client to invalidate stories and the live query will update naturally
        // Or if we have the ID, we can select it
      }, 500);
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to convert image to base64:", err);
      return "";
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!selectedStory) return;
    const content = selectedStory.content;
    const title = selectedStory.title || fileName;
    const fileNameWithExtension = `${title.replace(/\s+/g, "_").toLowerCase()}.${format}`;

    toast.info(`Preparing your ${format.toUpperCase()} export...`);

    // 1. Fetch images from memories in the date range
    let storyImages: string[] = [];
    if (settings.includeimages) {
      try {
        const { memories } = await memoryService.getAll(userId || "");
        // Filter by date range (simple client-side filter for export)
        const rangeMemories = memories.filter(
          (m) => m.date >= selectedStory.dateRange.start && m.date <= selectedStory.dateRange.end,
        );
        storyImages = rangeMemories.flatMap((m: Memory) => m.images || []).slice(0, 5);
      } catch (err) {
        console.error("Failed to fetch memories for export:", err);
      }
    }

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      let yPosition = 40;

      // Title
      doc.setFont("times", "bold");
      doc.setFontSize(24);
      doc.text(title, 20, 25);

      // Metadata
      doc.setFont("times", "italic");
      doc.setFontSize(10);
      doc.text(
        `Period: ${selectedStory.dateRange.start} — ${selectedStory.dateRange.end} | Tone: ${selectedStory.tone}`,
        20,
        32,
      );

      // Content with Distributed Images
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      const paragraphs = content.split("\n").filter((l) => l.trim() !== "");
      const imageCount = storyImages.length;
      const paragraphsPerImage =
        imageCount > 0 ? Math.floor(paragraphs.length / (imageCount + 1)) : paragraphs.length;
      let nextImgIdx = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i];
        const splitText = doc.splitTextToSize(para, 170);

        if (yPosition + splitText.length * 7 > 275) {
          doc.addPage();
          yPosition = 20;
        }

        doc.text(splitText, 20, yPosition);
        yPosition += splitText.length * 7 + 6;

        // Spread images throughout the narrative
        if (nextImgIdx < imageCount && (i + 1) % (paragraphsPerImage || 1) === 0) {
          const b64 = await urlToBase64(storyImages[nextImgIdx]);
          if (b64) {
            const imgWidth = 100;
            const imgHeight = 70;
            const centerX = (210 - imgWidth) / 2;

            if (yPosition + imgHeight > 275) {
              doc.addPage();
              yPosition = 20;
            }

            doc.addImage(b64, "JPEG", centerX, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 12;
            nextImgIdx++;
          }
        }
      }

      doc.save(fileNameWithExtension);
      toast.success("PDF saved safely.");
    } else if (format === "docx") {
      const children: Paragraph[] = [
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 36, font: "Times New Roman" })],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Period: ${selectedStory.dateRange.start} — ${selectedStory.dateRange.end}`,
              italics: true,
              size: 20,
            }),
          ],
        }),
        new Paragraph({ children: [new TextRun({ text: "\n" })] }),
      ];

      // Add images to Word
      for (const imgUrl of storyImages) {
        const b64 = await urlToBase64(imgUrl);
        if (b64) {
          // docx ImageRun needs Buffer or Uint8Array
          const resp = await fetch(imgUrl);
          const buffer = await resp.arrayBuffer();

          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: buffer,
                  transformation: { width: 400, height: 300 },
                  type: "jpg",
                } as IImageOptions),
              ],
            }),
          );
        }
      }

      // Add content
      content.split("\n").forEach((p) => {
        if (p.trim()) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: p, size: 24, font: "Times New Roman" })],
              spacing: { after: 200 },
            }),
          );
        }
      });

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameWithExtension;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Word document generated.");
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl space-y-8 p-6 lg:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Legacy Stories</h1>
          <p className="mt-1 text-neutral-600">
            Craft and revisit beautiful narratives from your life's journey
          </p>
        </div>
        <Button
          variant={showGenerator ? "secondary" : "primary"}
          onClick={() => setShowGenerator(!showGenerator)}
        >
          {showGenerator ? (
            <>
              <BookOpen className="mr-2 h-4 w-4" /> View Library
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> New Story
            </>
          )}
        </Button>
      </div>

      {showGenerator ? (
        <div className="mx-auto max-w-2xl">
          <Card className="shadow-soft-xl space-y-6 p-6 lg:p-8">
            <div className="border-b border-neutral-100 pb-5 text-center">
              <div className="bg-primary-50 text-primary-600 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <MagicWand className="h-8 w-8" weight="duotone" />
              </div>
              <h2 className="font-display text-2xl font-bold text-neutral-900">
                Design Your Narrative
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Guide our AI. Pick your favorite time period and the tone you want, and we'll craft
                a beautiful story from your memories.
              </p>
            </div>

            <div className="space-y-5">
              <Input
                label="Story Title"
                placeholder="E.g., My Summer Highlights..."
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />

              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">Time Period</label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DatePicker
                    label="From Date"
                    value={settings.dateRange.start}
                    onChange={(date) =>
                      setSettings((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: date },
                      }))
                    }
                  />
                  <DatePicker
                    label="To Date"
                    value={settings.dateRange.end}
                    onChange={(date) =>
                      setSettings((prev) => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: date },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Story Tone"
                  options={toneOptions}
                  value={settings.tone}
                  onChange={(val) =>
                    setSettings((prev) => ({ ...prev, tone: val as StorySettings["tone"] }))
                  }
                />
                <Select
                  label="Story Length"
                  options={lengthOptions}
                  value={settings.length}
                  onChange={(val) =>
                    setSettings((prev) => ({ ...prev, length: val as StorySettings["length"] }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateStory}
              loading={createStoryMutation.isPending}
              disabled={createStoryMutation.isPending || !isOnline}
              className="mt-4 w-full py-4 text-base"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Bring Story to Life
            </Button>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
          {/* Sidebar: Library */}
          <div className="lg:col-span-1">
            <Card className="flex h-full max-h-150 flex-col overflow-hidden p-0 lg:max-h-[calc(100vh-200px)]">
              <div className="border-b border-neutral-100 p-4">
                <h3 className="flex items-center space-x-2 font-semibold text-neutral-900">
                  <Clock className="h-4 w-4 text-neutral-500" />
                  <span>Recent Stories</span>
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {storiesLoading ? (
                  <div className="py-8 text-center">
                    <Loading size="sm" />
                  </div>
                ) : storiesData?.stories && storiesData.stories.length > 0 ? (
                  <div className="space-y-1">
                    {storiesData.stories.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStory(story)}
                        className={cn(
                          "group flex w-full items-center justify-between rounded-lg p-3 text-left transition-all",
                          selectedStory?.id === story.id
                            ? "bg-primary-50 text-primary-900"
                            : "text-neutral-600 hover:bg-neutral-50",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-sm font-medium",
                              selectedStory?.id === story.id
                                ? "text-primary-900"
                                : "text-neutral-900",
                            )}
                          >
                            {story.title}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            {new Date(story.createdAt).toLocaleDateString()}
                            {" • "}
                            {story.tone}
                          </p>
                        </div>
                        <CaretRight
                          className={cn(
                            "h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100",
                            selectedStory?.id === story.id && "opacity-100",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <BookOpen className="mx-auto h-8 w-8 text-neutral-200" />
                    <p className="mt-2 text-xs text-neutral-400">No stories yet</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content: Viewer */}
          <div className="lg:col-span-3">
            <Card className="flex min-h-150 flex-col overflow-hidden p-0 lg:min-h-[calc(100vh-200px)]">
              {!selectedStory && !isStreaming ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <EmptyState
                    icon={<BookOpen className="text-secondary-200 h-16 w-16" weight="duotone" />}
                    title="Library is Empty"
                    description="You haven't crafted any stories yet. Click 'New Story' above to turn your memories into a narrative."
                    className="py-20"
                  />
                  <Button onClick={() => setShowGenerator(true)} className="mt-4">
                    Create First Story
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col border-b border-neutral-100 bg-neutral-50/50 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-neutral-900">
                        {isStreaming ? fileName || "Crafting Story..." : selectedStory?.title}
                      </h2>
                      {!isStreaming && selectedStory && (
                        <p className="mt-1 text-sm text-neutral-500">
                          Created on {new Date(selectedStory.createdAt).toLocaleDateString()}
                          {" • "}
                          {selectedStory.tone}
                        </p>
                      )}
                    </div>
                    {!isStreaming && selectedStory && (
                      <div className="mt-4 flex space-x-2 sm:mt-0">
                        <Button variant="secondary" size="sm" onClick={() => handleExport("pdf")}>
                          <FileText className="mr-2 h-4 w-4" /> PDF
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleExport("docx")}>
                          <Download className="mr-2 h-4 w-4" /> Word
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="prose prose-neutral lg:prose-lg mx-auto max-w-3xl leading-relaxed whitespace-pre-wrap text-neutral-800">
                      {isStreaming ? (
                        <>
                          {streamingContent}
                          <span className="bg-primary-600 ml-1 inline-block h-4 w-1 animate-pulse" />
                        </>
                      ) : (
                        selectedStory?.content
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
