"use client";
import React, { useState } from "react";
import { MagicWand, BookOpen, FileText, Download, ArrowsClockwise } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import { jsPDF } from "jspdf";
import { Document, Paragraph, Packer, TextRun } from "docx";
import { useCreateStory } from "@/hooks/useStories";
import { toast } from "sonner";
import Loading from "@/components/ui/Loading";

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
  const [settings, setSettings] = useState<StorySettings>({
    dateRange: {
      start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    tone: "reflective",
    length: "medium",
    includeimages: true,
  });
  
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("my_story");
  const isOnline = useNetworkStatus();
  const createStoryMutation = useCreateStory();

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

  const handleGenerateStory = async () => {
    try {
      setProgress(10);
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 90 ? prev : prev + 5));
      }, 500);

      const result = await createStoryMutation.mutateAsync({
        title: fileName,
        tone: settings.tone,
        length: settings.length,
        dateRange: settings.dateRange,
        includeimages: settings.includeimages,
      });

      clearInterval(interval);
      setProgress(100);
      setGeneratedStory(result.story.content || null);
      toast.success("Story generated successfully!");
    } catch (error) {
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!generatedStory) return;
    const fileNameWithExtension = `${fileName}.${format}`;

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const paragraphs = generatedStory.split("\n").filter(l => l.trim() !== "");
      let yPosition = 40;
      paragraphs.forEach(para => {
        doc.text(para, 20, yPosition);
        yPosition += 10;
      });
      doc.save(fileNameWithExtension);
    } else if (format === "docx") {
      const doc = new Document({
        sections: [{ children: [new Paragraph({ children: [new TextRun(generatedStory)] })] }],
      });
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameWithExtension;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-neutral-900">AI Story Generator</h1>
        <p className="text-neutral-600 mt-1">Create beautiful stories from your memories using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="space-y-6">
            <div className="flex items-center space-x-2">
              <MagicWand className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-neutral-900">Story Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700">Time Period</label>
                <div className="grid grid-cols-2 gap-3">
                  <DatePicker
                    value={settings.dateRange.start}
                    onChange={(date) => setSettings(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: date } }))}
                  />
                  <DatePicker
                    value={settings.dateRange.end}
                    onChange={(date) => setSettings(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: date } }))}
                  />
                </div>
              </div>

              <Select
                label="Story Tone"
                options={toneOptions}
                value={settings.tone}
                onChange={(val) => setSettings(prev => ({ ...prev, tone: val as StorySettings["tone"] }))}
              />

              <Select
                label="Story Length"
                options={lengthOptions}
                value={settings.length}
                onChange={(val) => setSettings(prev => ({ ...prev, length: val as StorySettings["length"] }))}
              />
            </div>

            <Button
              onClick={handleGenerateStory}
              loading={createStoryMutation.isPending}
              disabled={createStoryMutation.isPending || !isOnline}
              className="w-full"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Generate Story
            </Button>

            {createStoryMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Generating...</span>
                  <span className="text-neutral-600">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </Card>

          {generatedStory && (
            <Card className="mt-6 space-y-4">
              <h3 className="font-semibold text-neutral-900">Export Options</h3>
              <Input label="File Name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
              <div className="space-y-2">
                <Button variant="secondary" size="sm" onClick={() => handleExport("pdf")} className="w-full">
                  <FileText className="w-4 h-4 mr-2" /> Export as PDF
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport("docx")} className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Export as Word
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="min-h-96">
            {!generatedStory && !createStoryMutation.isPending && (
              <EmptyState
                icon={<BookOpen className="w-12 h-12 text-secondary-400" weight="duotone" />}
                title="Your Story Awaits"
                description="Configure your settings and let our AI weave your memories into a beautiful narrative sanctuary."
                className="py-12"
              />
            )}
            {createStoryMutation.isPending && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loading size="lg" text="Our AI is crafting your narrative..." />
              </div>
            )}
            {generatedStory && (
              <div className="whitespace-pre-wrap text-neutral-800 leading-relaxed prose">
                {generatedStory}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
